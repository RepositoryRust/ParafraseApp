use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Message {
    pub role: String,
    pub content: String,
}

#[derive(Deserialize)]
pub struct ChatRequest {
    pub id: String,
    pub apikey: String,
    pub reasoning_effort: String,
    pub messages: Vec<Message>,
}