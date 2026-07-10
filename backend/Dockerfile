ARG RUST_VERSION=1.92
ARG APP_NAME=backend-server

FROM rust:${RUST_VERSION}-alpine AS build

WORKDIR /app

RUN apk add --no-cache \
    musl-dev \
    clang \
    lld \
    git \
    ca-certificates

COPY Cargo.toml Cargo.lock ./
COPY src ./src

RUN cargo build --release --locked

FROM alpine:3.18

RUN apk add --no-cache ca-certificates

RUN adduser \
    -D \
    -H \
    -s /sbin/nologin \
    appuser

COPY --from=build /app/target/release/backend-server /usr/local/bin/server

USER appuser

ENV PORT=3000

EXPOSE 3000

CMD ["server"]