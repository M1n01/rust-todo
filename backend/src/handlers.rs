use axum::{
    async_trait,
    extract::{rejection::JsonRejection, Extension, FromRequest, Path, Request},
    http::StatusCode,
    BoxError, Json,
};
use serde::de::DeserializeOwned;
use validator::Validate;

pub mod label;
pub mod todo;

#[derive(Debug)]
pub struct ValidatedJson<T>(T);

// リクエストのボディをパースして、バリデーションを行う（バージョンアップに伴い修正済み）
#[async_trait]
impl<T, S> FromRequest<S> for ValidatedJson<T>
where
    T: DeserializeOwned + Validate,
    S: Send + Sync,
    Json<T>: FromRequest<S, Rejection = JsonRejection>,
{
    type Rejection = (StatusCode, String);

    async fn from_request(req: Request, state: &S) -> Result<Self, Self::Rejection> {
        let Json(value) = Json::<T>::from_request(req, state)
            .await
            .map_err(|rejection| {
                let message = format!("Json parse error: [{}]", rejection);
                (StatusCode::BAD_REQUEST, message)
            })?;
        value.validate().map_err(|rejection| {
            let message = format!("Validation error: [{}]", rejection).replace('\n', ", ");
            (StatusCode::BAD_REQUEST, message)
        })?;
        Ok(ValidatedJson(value))
    }
}
