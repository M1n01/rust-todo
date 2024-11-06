mod handlers;
mod repositories;

use crate::repositories::{TodoRepository, TodoRepositoryForDb};
use axum::{
    extract::Extension,
    routing::{get, post},
    Router,
};
use dotenv::dotenv;
use handlers::{all_todos, create_todo, delete_todo, find_todo, update_todo};
use hyper::header::CONTENT_TYPE;
use shuttle_runtime::CustomError;
use sqlx::PgPool;
use std::{env, sync::Arc};
use tower_http::cors::{AllowOrigin, Any, CorsLayer};

#[shuttle_runtime::main]
async fn axum(
    #[shuttle_shared_db::Postgres(local_uri = "postgres://postgres:admin@localhost:5432/todos")]
    pool: PgPool,
) -> shuttle_axum::ShuttleAxum {
    // loggingの初期化
    let log_level = env::var("RUST_LOG").unwrap_or("info".to_string());
    env::set_var("RUST_LOG", log_level);

    sqlx::migrate!()
        .run(&pool)
        .await
        .map_err(CustomError::new)?;

    // tracing_subscriber::fmt::init();
    // dotenv().ok();

    // let database_url = &env::var("DATABASE_URL").expect("DATABASE_URL is not set.");
    // tracing::debug!("start connect database to {}", database_url);
    // let pool = PgPool::connect(database_url).await.expect(&format!(
    //     "Failed to connect database, url is {}",
    //     database_url
    // ));

    // let repository = TodoRepositoryForDb::new(pool);
    // let app = create_app(repository);
    let app = create_app(TodoRepositoryForDb::new(pool.clone()));

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();
    tracing::debug!("listening on {:?}", listener);

    axum::serve(listener, app).await.unwrap();

    Ok(app.into())
}

fn create_app<T: TodoRepository>(repository: T) -> Router {
    let allowed_origins = vec![
        "http://localhost:5173".parse().unwrap(),
        "http://127.0.0.1:5173".parse().unwrap(),
    ];

    let cors = CorsLayer::new()
        .allow_origin(AllowOrigin::list(allowed_origins))
        .allow_methods(Any)
        .allow_headers(vec![CONTENT_TYPE]);

    Router::new()
        .route("/", get(root))
        .route("/todos", post(create_todo::<T>).get(all_todos::<T>))
        .route(
            "/todos/:id",
            get(find_todo::<T>)
                .delete(delete_todo::<T>)
                .patch(update_todo::<T>),
        )
        .layer(Extension(Arc::new(repository)))
        .layer(cors)
}

async fn root() -> &'static str {
    "Hello, world!"
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::{test_utils::TodoRepositoryForMemory, CreateTodo, Todo};
    use axum::response::Response;
    use axum::{
        body::to_bytes,
        body::Body,
        http::{header, Method, Request, StatusCode},
    };
    use mime::APPLICATION_JSON;
    use std::usize;
    use tower::ServiceExt;

    fn build_todo_req_with_json(path: &str, method: Method, json_body: String) -> Request<Body> {
        Request::builder()
            .uri(path)
            .method(method)
            .header(header::CONTENT_TYPE, APPLICATION_JSON.as_ref())
            .body(Body::from(json_body))
            .unwrap()
    }

    fn build_todo_req_with_empty(method: Method, path: &str) -> Request<Body> {
        Request::builder()
            .uri(path)
            .method(method)
            .header(header::CONTENT_TYPE, APPLICATION_JSON.as_ref())
            .body(Body::empty())
            .unwrap()
    }

    async fn res_to_todo(res: Response) -> Todo {
        let bytes = to_bytes(res.into_body(), usize::MAX).await.unwrap();
        let body: String = String::from_utf8(bytes.to_vec()).unwrap();
        let todo: Todo = serde_json::from_str(&body)
            .expect(&format!("cannot convert Todo instance. body: {}", body));

        todo
    }

    #[tokio::test]
    async fn should_create_todo() {
        let expected = Todo::new(1, "should_return_created_todo".to_string());

        let repository = TodoRepositoryForMemory::new();
        let req = build_todo_req_with_json(
            "/todos",
            Method::POST,
            r#"{ "text": "should_return_created_todo" }"#.to_string(),
        );
        let res = create_app(repository).oneshot(req).await.unwrap();
        let todo = res_to_todo(res).await;
        assert_eq!(expected, todo);
    }

    #[tokio::test]
    async fn should_find_todo() {
        let expected = Todo::new(1, "should_find_todo".to_string());

        let repository = TodoRepositoryForMemory::new();
        repository
            .create(CreateTodo::new("should_find_todo".to_string()))
            .await
            .expect("failed to create todo.");
        let req = build_todo_req_with_empty(Method::GET, "/todos/1");
        let res = create_app(repository).oneshot(req).await.unwrap();
        let todo = res_to_todo(res).await;
        assert_eq!(expected, todo);
    }

    #[tokio::test]
    async fn should_get_all_todos() {
        let expected = Todo::new(1, "should_get_all_todos".to_string());

        let repository = TodoRepositoryForMemory::new();
        repository
            .create(CreateTodo::new("should_get_all_todos".to_string()))
            .await
            .expect("failed to create todo.");
        let req = build_todo_req_with_empty(Method::GET, "/todos");
        let res = create_app(repository).oneshot(req).await.unwrap();
        let bytes = to_bytes(res.into_body(), usize::MAX).await.unwrap();
        let body: String = String::from_utf8(bytes.to_vec()).unwrap();
        let todos: Vec<Todo> = serde_json::from_str(&body)
            .expect(&format!("cannot convert Todo instance. body: {}", body));
        assert_eq!(vec![expected], todos);
    }

    #[tokio::test]
    async fn should_update_todo() {
        let expected = Todo::new(1, "should_updated_todo".to_string());

        let repository = TodoRepositoryForMemory::new();
        repository
            .create(CreateTodo::new("before_update_todo".to_string()))
            .await
            .expect("failed to create todo.");
        let req = build_todo_req_with_json(
            "/todos/1",
            Method::PATCH,
            r#"{
                "id": 1,
                "text": "should_updated_todo",
                "completed": false
            }"#
            .to_string(),
        );
        let res = create_app(repository).oneshot(req).await.unwrap();
        let todo = res_to_todo(res).await;
        assert_eq!(expected, todo);
    }

    #[tokio::test]
    async fn should_delete_todo() {
        let repository = TodoRepositoryForMemory::new();
        repository
            .create(CreateTodo::new("should_delete_todo".to_string()))
            .await
            .expect("failed to create todo.");
        let req = build_todo_req_with_empty(Method::DELETE, "/todos/1");
        let res = create_app(repository).oneshot(req).await.unwrap();
        assert_eq!(StatusCode::NO_CONTENT, res.status());
    }

    #[tokio::test]
    async fn should_return_hello_world() {
        let repository = TodoRepositoryForMemory::new();
        let req = Request::builder().uri("/").body(Body::empty()).unwrap();
        let res = create_app(repository).oneshot(req).await.unwrap();

        let bytes = to_bytes(res.into_body(), usize::MAX).await.unwrap();
        let body: String = String::from_utf8(bytes.to_vec()).unwrap();

        assert_eq!(body, "Hello, world!");
    }
}
