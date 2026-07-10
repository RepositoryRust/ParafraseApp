use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub success: bool,
    pub status: u16,
    pub message: String,
    pub code: Option<String>,
}

pub enum AppError {
    Unauthorized(ErrorResponse),
    InternalServerError(ErrorResponse),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match self {
            AppError::Unauthorized(err) => (StatusCode::UNAUTHORIZED, Json(err)).into_response(),

            AppError::InternalServerError(err) => {
                (StatusCode::INTERNAL_SERVER_ERROR, Json(err)).into_response()
            }
        }
    }
}

pub fn parse_provider_error(body: String, status: StatusCode) -> AppError {
    let provider_error = serde_json::from_str::<ErrorResponse>(&body).unwrap_or(ErrorResponse {
        success: false,
        status: status.as_u16(),
        message: body,
        code: None,
    });

    match status {
        StatusCode::UNAUTHORIZED => AppError::Unauthorized(provider_error),
        _ => AppError::InternalServerError(provider_error),
    }
}