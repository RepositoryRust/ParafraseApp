# Parafrase App

AI-powered text paraphrasing tool that transforms stiff, monotonous AI-generated text into natural, human-like writing. Supports OpenAI and DeepSeek providers.

## Tech Stack

### Frontend

[React 19](https://react.dev) |
[TypeScript 6](https://www.typescriptlang.org) |
[Vite 8](https://vite.dev) |
[Tailwind CSS 4](https://tailwindcss.com) |
[shadcn/ui](https://ui.shadcn.com) |
[React Router 7](https://reactrouter.com) |
[Babel](https://babeljs.io) |

### Backend

[Rust](https://www.rust-lang.org) |
[Axum 0.8](https://github.com/tokio-rs/axum) 
[Tokio 1.52](https://tokio.rs) |
[Reqwest 0.13](https://github.com/seanmonstar/reqwest) |
[Serde](https://serde.rs) / [serde_json](https://github.com/serde-rs/json) |
[Tower HTTP 0.7](https://github.com/tower-rs/tower-http) |
[Dotenv 0.15](https://github.com/dotenv-rs/dotenv) |

## Getting Started

### Prerequisites

- [Rust](https://rustup.rs) (latest stable)
- [Node.js](https://nodejs.org) (LTS)

### Backend

```bash
cd backend
cp .env.example .env   # configure ALLOWED_ORIGIN and PORT
cargo run
```

### Frontend

```bash
cd frontend
cp .env.example .env   # set VITE_DEHUI_API
npm install
npm run dev
```

The frontend dev server starts at `http://localhost:5173`. The backend listens on `http://localhost:3000`.

## License

MIT © 2026 [Zaini Thoriq Taufiqurrahman](https://github.com/taufiqurrahman47)
