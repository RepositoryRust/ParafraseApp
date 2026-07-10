use std::{env, time::Duration};

use axum::{
    Router,
    http::{HeaderValue, header},
    routing::post,
};
use reqwest::{Client, Method};
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;

use crate::{
    service::{chat::get_chat, provider::get_providers},
    types::types_provider::AppState,
};

mod error;
mod service;
mod types;

#[cfg(test)]
mod test_get_providers;

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();

    let origin = env::var("ALLOWED_ORIGIN").unwrap_or_else(|_| "http://localhost:3000".into());

    let cors = CorsLayer::new()
        .allow_origin(origin.parse::<HeaderValue>().unwrap())
        .allow_methods([Method::POST])
        .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION]);

    let client = Client::builder()
        .timeout(Duration::from_secs(60))
        .build()
        .unwrap();

    let state = AppState { client };

    let app = Router::new()
        .route("/chat", post(get_chat))
        .route("/providers", post(get_providers))
        .layer(cors)
        .with_state(state);

    let port = env::var("PORT").unwrap_or_else(|_| "3000".into());

    let listener = TcpListener::bind(format!("0.0.0.0:{port}")).await.unwrap();

    println!("Listening on 0.0.0.0:{port}");

    axum::serve(listener, app).await.unwrap();
}
