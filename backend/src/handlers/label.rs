use axum::{
    extract::{Extension, Path},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use validator::Validate;

use crate::repositories::label::LabelRepository;

use super::ValidatedJson;

pub async fn create_label<T: LabelRepository>(
    Extension(repository): Extension<Arc<T>>,
    ValidatedJson(payload): ValidatedJson<CreateLabel>,
) -> Result<impl IntoResponse, StatusCode> {
    let label = repository
        .create(payload.name)
        .await
        .or(Err(StatusCode::INTERNAL_SERVER_ERROR))?;

    Ok((StatusCode::CREATED, Json(label)))
}

pub async fn all_labels<T: LabelRepository>(
    Extension(repository): Extension<Arc<T>>,
) -> Result<impl IntoResponse, StatusCode> {
    let labels = repository.all().await.unwrap();

    Ok((StatusCode::OK, Json(labels)))
}

pub async fn delete_label<T: LabelRepository>(
    Path(id): Path<i32>,
    Extension(repository): Extension<Arc<T>>,
) -> StatusCode {
    repository
        .delete(id)
        .await
        .map(|_| StatusCode::NO_CONTENT)
        .unwrap_or(StatusCode::INTERNAL_SERVER_ERROR)
}

#[derive(Deserialize, Serialize, Debug, PartialEq, Eq, Validate)]
pub struct CreateLabel {
    #[validate(length(min = 1, message = "Cannot be empty"))]
    #[validate(length(max = 100, message = "Over text length"))]
    name: String,
}
