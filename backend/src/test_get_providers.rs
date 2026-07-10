#[cfg(test)]
mod tests {
    use std::env;

use crate::service::provider::get_providers;
    use crate::types::types_provider::AppState;
    use axum::Router;
    use axum::routing::post;
    use axum_test::TestServer;
    use reqwest::{Client, StatusCode};
    use serde_json::json;

    #[tokio::test]
    async fn test_get_list_model_openai() {
        dotenv::dotenv().ok();
        let app = Router::new()
            .route("/api/providers", post(get_providers))
            .with_state(AppState {
                client: Client::new(),
            });

        let response = TestServer::new(app)
            .post("/api/providers")
            .json(&json!({
                "url": "https://api.openai.com/v1/models",
                "apikey": env::var("APIKEY_OPENAI").unwrap()
            }))
            .await;

        assert_eq!(response.status_code(), axum::http::StatusCode::OK);

        let models: Vec<String> = response.json();
        assert!(models.contains(&"gpt-4o".to_string()));
        assert!(models.contains(&"gpt-5".to_string()));
    }

    #[tokio::test]
    async fn test_get_list_model_deepseek() {
        dotenv::dotenv().ok();
        let app = Router::new()
            .route("/api/providers", post(get_providers))
            .with_state(AppState {
                client: Client::new(),
            });

        let response = TestServer::new(app)
            .post("/api/providers")
            .json(&json!({
                "url": "https://api.deepseek.com/models",
                "apikey": env::var("APIKEY_DEEPSEEK").unwrap()
            }))
            .await;

        assert_eq!(response.status_code(), StatusCode::OK);

        let models: Vec<String> = response.json();
        assert_eq!(models, vec!["deepseek-v4-flash", "deepseek-v4-pro"]);
    }

    #[tokio::test]
    async fn test_get_openai_unauthorized() {
        dotenv::dotenv().ok();
        let app = Router::new()
            .route("/api/providers", post(get_providers))
            .with_state(AppState {
                client: Client::new(),
            });

        let response = TestServer::new(app)
            .post("/api/providers")
            .json(&json!({
                "url": "https://api.openai.com/v1/models",
                "apikey": "invalid key"
            }))
            .await;

        assert_eq!(response.status_code(), StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn test_get_deepseek_unauthorized() {
        dotenv::dotenv().ok();
        let app = Router::new()
            .route("/api/providers", post(get_providers))
            .with_state(AppState {
                client: Client::new(),
            });

        let response = TestServer::new(app)
            .post("/api/providers")
            .json(&json!({
                "url": "https://api.deepseek.com/models",
                "apikey": "invalid key"
            }))
            .await;

        println!("{:?}", response);
        assert_eq!(response.status_code(), StatusCode::UNAUTHORIZED);
    }
}
