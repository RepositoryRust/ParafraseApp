use axum::{Json, extract::State};

use crate::{
    error::{AppError, ErrorResponse, parse_provider_error}, types::types_provider::{AppState, ModelsResponse, ProviderRequest},
};

pub async fn get_providers(
    State(state): State<AppState>,
    Json(payload): Json<ProviderRequest>,
) -> Result<Json<Vec<String>>, AppError> {
    let response = state
        .client
        .get(&payload.url)
        .bearer_auth(&payload.apikey)
        .send()
        .await
        .map_err(|e| {
            AppError::InternalServerError(ErrorResponse {
                success: false,
                status: 500,
                message: e.to_string(),
                code: None,
            })
        })?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(parse_provider_error(body, status));
    }

    let models: ModelsResponse = response.json().await.map_err(|e| {
        AppError::InternalServerError(ErrorResponse {
            success: false,
            status: 500,
            message: e.to_string(),
            code: None,
        })
    })?;

    let model_list = models
        .data
        .into_iter()
        .map(|model| model.id)
        .collect::<Vec<_>>();

    Ok(Json(model_list))
}
