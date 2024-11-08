pub mod label;
pub mod todo;

use thiserror::Error;

#[derive(Error, Debug)]
enum RepositoryError {
    #[error("Unexpected Error, {0}")]
    Unexpected(String),
    #[error("NotFound, id is {0}")]
    NotFound(i32),
    #[error("Duplicated, id is {0}")]
    Duplicated(i32),
}
