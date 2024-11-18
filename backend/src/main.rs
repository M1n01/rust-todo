mod handlers;
mod repositories;

use crate::repositories::{
    label::{LabelRepository, LabelRepositoryForDb},
    todo::{TodoRepository, TodoRepositoryForDb},
};
use axum::{
    routing::{delete, get, post},
    Extension, Router,
};

use handlers::{
    label::{all_labels, create_label, delete_label},
    todo::{all_todos, create_todo, delete_todo, find_todo, update_todo},
};
use hyper::{
    header::{
        ACCEPT, ACCESS_CONTROL_ALLOW_HEADERS, ACCESS_CONTROL_REQUEST_METHOD, AUTHORIZATION,
        CONTENT_TYPE, ORIGIN,
    },
    Method,
};
use shuttle_runtime::CustomError;
use shuttle_runtime::SecretStore;
use sqlx::PgPool;
use std::time::Duration;
use std::{env, sync::Arc};
use tower_http::cors::{AllowOrigin, CorsLayer};

#[shuttle_runtime::main]
async fn axum(
    #[shuttle_shared_db::Postgres(local_uri = "{secrets.LOCAL_DB_URI}")] pool: PgPool,
    #[shuttle_runtime::Secrets] secrets: SecretStore,
) -> shuttle_axum::ShuttleAxum {
    // loggingの初期化
    let log_level = env::var("RUST_LOG").unwrap_or("info".to_string());
    env::set_var("RUST_LOG", log_level);

    sqlx::migrate!()
        .run(&pool)
        .await
        .map_err(CustomError::new)?;

    let app_url = secrets.get("APP_URL").expect("APP_URL is not set.");
    tracing::debug!("app_url: {:?}", app_url);

    let app = create_app(
        TodoRepositoryForDb::new(pool.clone()),
        LabelRepositoryForDb::new(pool.clone()),
        app_url,
    );

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();
    tracing::debug!("listening on {:?}", listener);

    axum::serve(listener, app.clone()).await.unwrap();

    Ok(app.into())
}

fn create_app<Todo: TodoRepository, Label: LabelRepository>(
    todo_repository: Todo,
    label_repository: Label,
    app_url: String,
) -> Router {
    let allowed_origins = vec![
        "http://localhost:5173".parse().unwrap(),
        "http://127.0.0.1:5173".parse().unwrap(),
        app_url.parse().unwrap(),
    ];

    let cors = CorsLayer::new()
        .allow_origin(AllowOrigin::list(allowed_origins))
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PATCH,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers(vec![
            AUTHORIZATION,
            ACCEPT,
            CONTENT_TYPE,
            ORIGIN,
            ACCESS_CONTROL_ALLOW_HEADERS,
            ACCESS_CONTROL_REQUEST_METHOD,
        ])
        .allow_credentials(true)
        .expose_headers(vec![CONTENT_TYPE])
        .max_age(Duration::from_secs(3600));

    Router::new()
        .route("/", get(root))
        .route("/todos", post(create_todo::<Todo>).get(all_todos::<Todo>))
        .route(
            "/todos/:id",
            get(find_todo::<Todo>)
                .delete(delete_todo::<Todo>)
                .patch(update_todo::<Todo>),
        )
        .route(
            "/labels",
            post(create_label::<Label>).get(all_labels::<Label>),
        )
        .route("/labels/:id", delete(delete_label::<Label>))
        .layer(Extension(Arc::new(todo_repository)))
        .layer(Extension(Arc::new(label_repository)))
        .layer(cors)
}

async fn root() -> &'static str {
    "Hello, world!"
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::{
        label::test_utils::LabelRepositoryForMemory,
        todo::{test_utils::TodoRepositoryForMemory, CreateTodo, TodoEntity},
    };
    use axum::response::Response;
    use axum::{
        body::to_bytes,
        body::Body,
        http::{header, Method, Request, StatusCode},
    };
    use mime::APPLICATION_JSON;
    use repositories::label::Label;
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

    async fn res_to_todo(res: Response) -> TodoEntity {
        let bytes = to_bytes(res.into_body(), usize::MAX).await.unwrap();
        let body: String = String::from_utf8(bytes.to_vec()).unwrap();
        let todo: TodoEntity = serde_json::from_str(&body)
            .expect(&format!("cannot convert Todo instance. body: {}", body));

        todo
    }

    async fn res_to_label(res: Response) -> Label {
        let bytes = to_bytes(res.into_body(), usize::MAX).await.unwrap();
        let body: String = String::from_utf8(bytes.to_vec()).unwrap();
        let label: Label = serde_json::from_str(&body)
            .expect(&format!("cannot convert Label instance. body: {}", body));

        label
    }

    fn label_fixture() -> (Vec<Label>, Vec<i32>) {
        let id = 999;
        (
            vec![Label {
                id,
                name: String::from("test label"),
            }],
            vec![id],
        )
    }

    #[tokio::test]
    async fn should_created_todo() {
        let (labels, _labels_ids) = label_fixture();
        let expected = TodoEntity::new(1, "should_return_created_todo".to_string(), labels.clone());

        let req = build_todo_req_with_json(
            "/todos",
            Method::POST,
            r#"{ "text": "should_return_created_todo", "labels": [999] }"#.to_string(),
        );
        let res = create_app(
            TodoRepositoryForMemory::new(labels),
            LabelRepositoryForMemory::new(),
            "".to_string(),
        )
        .oneshot(req)
        .await
        .unwrap();
        let todo = res_to_todo(res).await;
        assert_eq!(expected, todo);
    }

    #[tokio::test]
    async fn should_find_todo() {
        let (labels, labels_ids) = label_fixture();
        let expected = TodoEntity::new(1, "should_find_todo".to_string(), labels.clone());

        let todo_repository = TodoRepositoryForMemory::new(labels);
        todo_repository
            .create(CreateTodo::new("should_find_todo".to_string(), labels_ids))
            .await
            .expect("failed to create todo.");
        let req = build_todo_req_with_empty(Method::GET, "/todos/1");
        let res = create_app(
            todo_repository,
            LabelRepositoryForMemory::new(),
            "".to_string(),
        )
        .oneshot(req)
        .await
        .unwrap();
        let todo = res_to_todo(res).await;
        assert_eq!(expected, todo);
    }

    #[tokio::test]
    async fn should_get_all_todos() {
        let (labels, labels_ids) = label_fixture();
        let expected = TodoEntity::new(1, "should_get_all_todos".to_string(), labels.clone());

        let todo_repository = TodoRepositoryForMemory::new(labels);
        todo_repository
            .create(CreateTodo::new(
                "should_get_all_todos".to_string(),
                labels_ids,
            ))
            .await
            .expect("failed to create todo.");
        let req = build_todo_req_with_empty(Method::GET, "/todos");
        let res = create_app(
            todo_repository,
            LabelRepositoryForMemory::new(),
            "".to_string(),
        )
        .oneshot(req)
        .await
        .unwrap();
        let bytes = to_bytes(res.into_body(), usize::MAX).await.unwrap();
        let body: String = String::from_utf8(bytes.to_vec()).unwrap();
        let todos: Vec<TodoEntity> = serde_json::from_str(&body)
            .expect(&format!("cannot convert Todo instance. body: {}", body));
        assert_eq!(vec![expected], todos);
    }

    #[tokio::test]
    async fn should_update_todo() {
        let (labels, labels_ids) = label_fixture();
        let expected = TodoEntity::new(1, "should_updated_todo".to_string(), labels.clone());

        let todo_repository = TodoRepositoryForMemory::new(labels);
        todo_repository
            .create(CreateTodo::new(
                "before_update_todo".to_string(),
                labels_ids,
            ))
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
        let res = create_app(
            todo_repository,
            LabelRepositoryForMemory::new(),
            "".to_string(),
        )
        .oneshot(req)
        .await
        .unwrap();
        let todo = res_to_todo(res).await;
        assert_eq!(expected, todo);
    }

    #[tokio::test]
    async fn should_delete_todo() {
        let (labels, labels_ids) = label_fixture();

        let todo_repository = TodoRepositoryForMemory::new(labels);
        todo_repository
            .create(CreateTodo::new(
                "should_delete_todo".to_string(),
                labels_ids,
            ))
            .await
            .expect("failed to create todo.");
        let req = build_todo_req_with_empty(Method::DELETE, "/todos/1");
        let res = create_app(
            todo_repository,
            LabelRepositoryForMemory::new(),
            "".to_string(),
        )
        .oneshot(req)
        .await
        .unwrap();
        assert_eq!(StatusCode::NO_CONTENT, res.status());
    }

    #[tokio::test]
    async fn should_created_label() {
        let (labels, _labels_ids) = label_fixture();
        let expected = Label::new(1, "should_created_label".to_string());

        let req = build_todo_req_with_json(
            "/labels",
            Method::POST,
            r#"{ "name": "should_created_label" }"#.to_string(),
        );
        let res = create_app(
            TodoRepositoryForMemory::new(labels),
            LabelRepositoryForMemory::new(),
            "".to_string(),
        )
        .oneshot(req)
        .await
        .unwrap();
        let label = res_to_label(res).await;
        assert_eq!(expected, label);
    }

    #[tokio::test]
    async fn should_get_all_labels() {
        let expected = Label::new(1, "should_get_all_labels".to_string());
        let label_repository = LabelRepositoryForMemory::new();
        let label = label_repository
            .create("should_get_all_labels".to_string())
            .await
            .expect("failed to create label.");

        let req = build_todo_req_with_empty(Method::GET, "/labels");
        let res = create_app(
            TodoRepositoryForMemory::new(vec![label]),
            label_repository,
            "".to_string(),
        )
        .oneshot(req)
        .await
        .unwrap();
        let bytes = to_bytes(res.into_body(), usize::MAX).await.unwrap();
        let body: String = String::from_utf8(bytes.to_vec()).unwrap();
        let labels: Vec<Label> = serde_json::from_str(&body)
            .expect(&format!("cannot convert Label instance. body: {}", body));
        assert_eq!(vec![expected], labels);
    }
    #[tokio::test]
    async fn should_delete_label() {
        let label_repository = LabelRepositoryForMemory::new();
        let label = label_repository
            .create("should_delete_label".to_string())
            .await
            .expect("failed to create label.");
        let req = build_todo_req_with_empty(Method::DELETE, "/labels/1");
        let res = create_app(
            TodoRepositoryForMemory::new(vec![label]),
            label_repository,
            "".to_string(),
        )
        .oneshot(req)
        .await
        .unwrap();
        assert_eq!(StatusCode::NO_CONTENT, res.status());
    }

    #[tokio::test]
    async fn should_return_hello_world() {
        let req = Request::builder().uri("/").body(Body::empty()).unwrap();
        let res = create_app(
            TodoRepositoryForMemory::new(vec![]),
            LabelRepositoryForMemory::new(),
            "".to_string(),
        )
        .oneshot(req)
        .await
        .unwrap();

        let bytes = to_bytes(res.into_body(), usize::MAX).await.unwrap();
        let body: String = String::from_utf8(bytes.to_vec()).unwrap();

        assert_eq!(body, "Hello, world!");
    }
}
