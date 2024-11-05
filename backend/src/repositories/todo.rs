use super::RepositoryError;
use axum::async_trait;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool};
use thiserror::Error;
use validator::Validate;

#[async_trait]
pub trait TodoRepository: Clone + Send + Sync + 'static {
    async fn create(&self, payload: CreateTodo) -> anyhow::Result<TodoWithLabelFromRow>;
    async fn find(&self, id: i32) -> anyhow::Result<TodoWithLabelFromRow>;
    async fn all(&self) -> anyhow::Result<Vec<TodoWithLabelFromRow>>;
    async fn update(&self, id: i32, payload: UpdateTodo) -> anyhow::Result<TodoWithLabelFromRow>;
    async fn delete(&self, id: i32) -> anyhow::Result<()>;
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq, FromRow)]
pub struct TodoWithLabelFromRow {
    id: i32,
    text: String,
    completed: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq, Validate)]
pub struct CreateTodo {
    #[validate(length(min = 1, message = "Cannot be empty"))]
    #[validate(length(max = 100, message = "Over text length"))]
    text: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq, Validate)]
pub struct UpdateTodo {
    #[validate(length(min = 1, message = "Cannot be empty"))]
    #[validate(length(max = 100, message = "Over text length"))]
    text: Option<String>,
    completed: Option<bool>,
}

#[derive(Debug, Clone)]
pub struct TodoRepositoryForDb {
    pool: PgPool,
}

impl TodoRepositoryForDb {
    pub fn new(pool: PgPool) -> Self {
        TodoRepositoryForDb { pool }
    }
}

#[async_trait]
impl TodoRepository for TodoRepositoryForDb {
    async fn create(&self, payload: CreateTodo) -> anyhow::Result<TodoWithLabelFromRow> {
        let todo = sqlx::query_as::<_, TodoWithLabelFromRow>(
            r#"
insert into todos(text, completed)
values ($1, false)
returning *
            "#,
        )
        .bind(payload.text.clone())
        .fetch_one(&self.pool)
        .await?;

        Ok(todo)
    }

    async fn find(&self, id: i32) -> anyhow::Result<TodoWithLabelFromRow> {
        let todo = sqlx::query_as::<_, TodoWithLabelFromRow>(
            r#"
select * from todos where id = $1
            "#,
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => RepositoryError::NotFound(id),
            _ => RepositoryError::Unexpected(e.to_string()),
        })?;

        Ok(todo)
    }

    async fn all(&self) -> anyhow::Result<Vec<TodoWithLabelFromRow>> {
        let todos = sqlx::query_as::<_, TodoWithLabelFromRow>(
            r#"
select * from todos
order by id desc
            "#,
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(todos)
    }

    async fn update(&self, id: i32, payload: UpdateTodo) -> anyhow::Result<TodoWithLabelFromRow> {
        let old_todo = self.find(id).await?; // 最適化可能
        let todo = sqlx::query_as::<_, TodoWithLabelFromRow>(
            r#"
update todos set text=$1, completed=$2
where id=$3
returning *
            "#,
        )
        .bind(payload.text.unwrap_or(old_todo.text))
        .bind(payload.completed.unwrap_or(old_todo.completed))
        .bind(id)
        .fetch_one(&self.pool)
        .await?;

        Ok(todo)
    }

    async fn delete(&self, id: i32) -> anyhow::Result<()> {
        sqlx::query(
            r#"
delete from todos where id = $1
            "#,
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => RepositoryError::NotFound(id),
            _ => RepositoryError::Unexpected(e.to_string()),
        })?;

        Ok(())
    }
}

#[cfg(feature = "database-test")]
mod test {
    use super::*;
    use dotenv::dotenv;
    use sqlx::PgPool;
    use std::env;

    #[tokio::test]
    async fn crud_scenario() {
        // point1
        dotenv().ok();
        let database_url = &env::var("DATABASE_URL").expect("undefined [DATABASE_URL]");
        let pool = PgPool::connect(database_url).await.expect(&format!(
            "failed to connect database, url is {}",
            database_url
        ));

        let repository = TodoRepositoryForDb::new(pool.clone());
        let todo_text = "[crud_scenario] text";

        // create
        let created = repository
            .create(CreateTodo::new(todo_text.to_string()))
            .await
            .expect("[create] returned Err");
        assert_eq!(created.text, todo_text);
        assert!(!created.completed);

        // find
        let todo = repository
            .find(created.id)
            .await
            .expect("[find] returned Err");
        assert_eq!(todo, created);

        // all
        let todos = repository.all().await.expect("[all] returned Err");
        let todo = todos.first().unwrap();
        assert_eq!(created, *todo);

        // update
        let updated_text = "[crud_scenario] updated text";
        let todo = repository
            .update(
                todo.id,
                UpdateTodo {
                    text: Some(updated_text.to_string()),
                    completed: Some(true),
                },
            )
            .await
            .expect("[update] returned Err");
        assert_eq!(todo.id, created.id);
        assert_eq!(todo.text, updated_text);

        // delete
        let _ = repository
            .delete(todo.id)
            .await
            .expect("[delete] returned Err");
        let res = repository.find(todo.id).await; // expect not found error
        assert!(res.is_err());

        let todo_rows = sqlx::query(
            r#"
select * from todos where id=$1
            "#,
        )
        .bind(todo.id)
        .fetch_all(&pool)
        .await
        .expect("[delete] todo_labels fetch error");
        assert!(todo_rows.len() == 0);
    }
}

#[cfg(test)]
pub mod test_utils {
    use anyhow::Context;
    use axum::async_trait;
    use std::{
        collections::HashMap,
        sync::{Arc, RwLock, RwLockReadGuard, RwLockWriteGuard},
    };

    use super::*;

    impl TodoWithLabelFromRow {
        pub fn new(id: i32, text: String) -> Self {
            Self {
                id,
                text,
                completed: false,
            }
        }
    }

    impl CreateTodo {
        pub fn new(text: String) -> Self {
            Self { text }
        }
    }

    type TodoDatas = HashMap<i32, TodoWithLabelFromRow>;

    #[derive(Debug, Clone)]
    pub struct TodoRepositoryForMemory {
        store: Arc<RwLock<TodoDatas>>,
    }

    impl TodoRepositoryForMemory {
        pub fn new() -> Self {
            TodoRepositoryForMemory {
                store: Arc::default(),
            }
        }

        fn write_store_ref(&self) -> RwLockWriteGuard<TodoDatas> {
            self.store.write().unwrap()
        }

        fn read_store_ref(&self) -> RwLockReadGuard<TodoDatas> {
            self.store.read().unwrap()
        }
    }

    #[async_trait]
    impl TodoRepository for TodoRepositoryForMemory {
        async fn create(&self, payload: CreateTodo) -> anyhow::Result<TodoWithLabelFromRow> {
            let mut store = self.write_store_ref();
            let id = store.len() as i32 + 1;
            let todo = TodoWithLabelFromRow::new(id, payload.text.clone());
            store.insert(id, todo.clone());
            Ok(todo)
        }

        async fn find(&self, id: i32) -> anyhow::Result<TodoWithLabelFromRow> {
            let store = self.read_store_ref();
            let todo = store
                .get(&id)
                .map(|todo| todo.clone())
                .ok_or(RepositoryError::NotFound(id))?;
            Ok(todo.clone())
        }

        async fn all(&self) -> anyhow::Result<Vec<TodoWithLabelFromRow>> {
            let store = self.read_store_ref();
            Ok(Vec::from_iter(store.values().map(|todo| todo.clone())))
        }

        async fn update(
            &self,
            id: i32,
            payload: UpdateTodo,
        ) -> anyhow::Result<TodoWithLabelFromRow> {
            let mut store = self.write_store_ref();
            let todo = store.get(&id).context(RepositoryError::NotFound(id))?;
            let text = payload.text.unwrap_or(todo.text.clone());
            let completed = payload.completed.unwrap_or(todo.completed);
            let todo = TodoWithLabelFromRow {
                id,
                text,
                completed,
            };
            store.insert(id, todo.clone());
            Ok(todo)
        }

        async fn delete(&self, id: i32) -> anyhow::Result<()> {
            let mut store = self.write_store_ref();
            store.remove(&id).ok_or(RepositoryError::NotFound(id))?;
            Ok(())
        }
    }

    mod tests {
        use super::*;

        #[tokio::test]
        async fn todo_crud_scenario() {
            let text = "todo text".to_string();
            let id = 1;
            let expected = TodoWithLabelFromRow::new(id, text.clone());

            // create
            let repository = TodoRepositoryForMemory::new();
            let todo = repository
                .create(CreateTodo { text })
                .await
                .expect("failed to create todo.");
            assert_eq!(todo, expected);

            // find
            let todo = repository.find(id).await.unwrap();
            assert_eq!(todo, expected);

            // all
            let todos = repository.all().await.expect("failed to get all todos.");
            assert_eq!(todos.len(), 1);
            assert_eq!(todos[0], expected);

            // update
            let text = "updated todo text".to_string();
            let todo = repository
                .update(
                    id,
                    UpdateTodo {
                        text: Some(text.clone()),
                        completed: Some(true),
                    },
                )
                .await
                .expect("failed to update todo.");
            assert_eq!(
                TodoWithLabelFromRow {
                    id,
                    text,
                    completed: true,
                },
                todo
            );

            // delete
            let res = repository.delete(id).await;
            assert!(res.is_ok());
        }
    }
}
