use super::RepositoryError;
use axum::async_trait;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

#[async_trait]
pub trait LabelRepository: Clone + std::marker::Send + std::marker::Sync + 'static {
    async fn create(&self, name: String) -> anyhow::Result<Label>;
    async fn all(&self) -> anyhow::Result<Vec<Label>>;
    async fn delete(&self, id: i32) -> anyhow::Result<()>;
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq, sqlx::FromRow)]
pub struct Label {
    pub id: i32,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct UpdateLabel {
    id: i32,
    name: String,
}

#[derive(Debug, Clone)]
pub struct LabelRepositoryForDb {
    pool: PgPool,
}

impl LabelRepositoryForDb {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl LabelRepository for LabelRepositoryForDb {
    async fn create(&self, name: String) -> anyhow::Result<Label> {
        let optional_label = sqlx::query_as::<_, Label>(
            r#"
select * from labels where name=$1
            "#,
        )
        .bind(name.clone())
        .fetch_optional(&self.pool)
        .await?;

        // point1
        if let Some(label) = optional_label {
            return Err(RepositoryError::Duplicated(label.id).into());
        }

        let label = sqlx::query_as::<_, Label>(
            r#"
insert into labels ( name )
values ( $1 )
returning *
            "#,
        )
        .bind(name.clone())
        .fetch_one(&self.pool)
        .await?;

        Ok(label)
    }

    async fn all(&self) -> anyhow::Result<Vec<Label>> {
        let labels = sqlx::query_as::<_, Label>(
            r#"
select * from labels
order by labels.id asc;
            "#,
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(labels)
    }

    async fn delete(&self, id: i32) -> anyhow::Result<()> {
        sqlx::query(
            r#"
delete from labels where id=$1
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

#[cfg(test)]
#[cfg(feature = "database-test")]
mod test {
    use super::*;
    use dotenv::dotenv;
    use sqlx::PgPool;
    use std::env;

    #[tokio::test]
    async fn crud_scenario() {
        dotenv().ok();
        let database_url = &env::var("DATABASE_URL").expect("undefined [DATABASE_URL]");
        let pool = PgPool::connect(database_url)
            .await
            .expect(&format!("failed to connect to {}", database_url));

        let repository = LabelRepositoryForDb::new(pool);
        let label_text = "test_label";

        // create
        let label = repository
            .create(label_text.to_string())
            .await
            .expect("[create] returned error");
        assert_eq!(label.name, label_text);

        // all
        let labels = repository.all().await.expect("[all] returned error");
        let label = labels.last().unwrap();
        assert_eq!(label.name, label_text);

        // delete
        repository
            .delete(label.id)
            .await
            .expect("[delete] returned error");
    }
}

#[cfg(test)]
pub mod test_utils {
    use axum::async_trait;
    use std::{
        collections::HashMap,
        sync::{Arc, RwLock, RwLockReadGuard, RwLockWriteGuard},
    };

    use super::*;

    impl Label {
        pub fn new(id: i32, name: String) -> Self {
            Self { id, name }
        }
    }

    type LabelDatas = HashMap<i32, Label>;

    #[derive(Debug, Clone)]
    pub struct LabelRepositoryForMemory {
        store: Arc<RwLock<LabelDatas>>,
    }

    impl LabelRepositoryForMemory {
        pub fn new() -> Self {
            Self {
                store: Arc::default(),
            }
        }

        pub fn write_store_ref(&self) -> RwLockWriteGuard<LabelDatas> {
            self.store.write().unwrap()
        }

        pub fn read_store_ref(&self) -> RwLockReadGuard<LabelDatas> {
            self.store.read().unwrap()
        }
    }

    #[async_trait]
    impl LabelRepository for LabelRepositoryForMemory {
        async fn create(&self, name: String) -> anyhow::Result<Label> {
            let mut store = self.write_store_ref();
            let id = store.len() as i32 + 1;
            let label = Label::new(id, name);
            store.insert(id, label.clone());
            Ok(label)
        }

        async fn all(&self) -> anyhow::Result<Vec<Label>> {
            let store = self.read_store_ref();
            Ok(Vec::from_iter(store.values().map(|label| label.clone())))
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
        async fn label_crud_scenario() {
            let name = "test_label".to_string();
            let id = 1;
            let expected = Label::new(id, name.clone());

            // create
            let repository = LabelRepositoryForMemory::new();
            let label = repository
                .create(name.clone())
                .await
                .expect("[create] returned error");
            assert_eq!(label, expected);

            // all
            let labels = repository.all().await.expect("[all] returned error");
            assert_eq!(labels.len(), 1);
            assert_eq!(labels[0], expected);

            // delete
            let res = repository.delete(id).await;
            assert!(res.is_ok());
        }
    }
}
