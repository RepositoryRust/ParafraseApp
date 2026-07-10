use reqwest::Client;
use serde::Deserialize;

#[derive(Clone)]
pub struct AppState {
    pub client: Client,
}

#[derive(Debug, Deserialize)]
pub struct ProviderRequest {
    pub apikey: String,
    pub url: String,
}

#[derive(Debug, Deserialize)]
pub struct ModelsResponse {
    pub data: Vec<Model>,
}

#[derive(Debug, Deserialize)]
pub struct Model {
    pub id: String,
}
