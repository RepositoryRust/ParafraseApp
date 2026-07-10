use axum::{
    Json,
    extract::State,
    response::sse::{Event, KeepAlive, Sse},
};
use futures_util::stream::StreamExt;
use serde_json::{Value, json};
use std::convert::Infallible;
use tokio::sync::mpsc;
use tokio_stream::wrappers::UnboundedReceiverStream;

use crate::{
    error::{AppError, ErrorResponse, parse_provider_error}, types::{types_chat::ChatRequest, types_provider::AppState},
};

const SYSTEM_PROMPT: &str = include_str!("../SKILL.md");
const OPENAI_BASE: &str = "https://api.openai.com/v1/chat/completions";
const DEEPSEEK_BASE: &str = "https://api.deepseek.com/chat/completions";

pub async fn get_chat(
    State(state): State<AppState>,
    Json(payload): Json<ChatRequest>,
) -> Result<Sse<impl futures_util::stream::Stream<Item = Result<Event, Infallible>>>, AppError> {
    let api_url = if payload.id.to_lowercase().contains("deepseek") {
        DEEPSEEK_BASE
    } else {
        OPENAI_BASE
    };

    let mut messages: Vec<Value> = vec![json!({
        "role": "system",
        "content": SYSTEM_PROMPT
    })];

    messages.extend(payload.messages.into_iter().map(|m| {
        json!({
            "role": m.role,
            "content": m.content,
        })
    }));

    let mut request = json!({
        "model": payload.id,
        "messages": messages,
        "stream": true,
    });

    match payload.reasoning_effort.as_str() {
        "high" | "xhigh" => {
            request["reasoning_effort"] = json!(payload.reasoning_effort);
        }
        "max" => {
            request["reasoning_effort"] = json!(payload.reasoning_effort);
            request["thinking"] = json!({ "type": "enabled" });
        }
        _ => {}
    }

    let response = state
        .client
        .post(api_url)
        .bearer_auth(&payload.apikey)
        .json(&request)
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

    let (tx, rx) = mpsc::unbounded_channel();

    tokio::spawn(async move {
        let mut stream = response.bytes_stream();

        let mut buffer: Vec<u8> = Vec::new();

        while let Some(chunk) = stream.next().await {
            let bytes = match chunk {
                Ok(bytes) => bytes,
                Err(_) => break,
            };

            buffer.extend_from_slice(&bytes);

            while let Some(pos) = buffer.iter().position(|&b| b == b'\n') {
                let line_bytes: Vec<u8> = buffer.drain(..=pos).collect();
                let line = String::from_utf8_lossy(&line_bytes);
                let line = line.trim();

                if line.is_empty() || line == "data: [DONE]" {
                    continue;
                }

                if let Some(data) = line.strip_prefix("data: ") {
                    if tx
                        .send(Ok(Event::default().data(data.to_string())))
                        .is_err()
                    {
                        return;
                    }
                }
            }
        }
    });

    let stream = UnboundedReceiverStream::new(rx);
    Ok(Sse::new(stream).keep_alive(KeepAlive::default()))
}
