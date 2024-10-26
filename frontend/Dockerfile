# Build stage
FROM node:20-slim AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Install Rust and wasm-pack for WASM compilation
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    pkg-config \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    && . "$HOME/.cargo/env" \
    && cargo install wasm-pack

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source files
COPY ./src ./src

# Build WASM
# WORKDIR /app/app/wasm

# COPY ./wasm/Cargo.toml ./wasm/Cargo.lock ./
# COPY ./wasm/src ./src

# RUN . "$HOME/.cargo/env" && wasm-pack build

# # Build frontend
# WORKDIR /app
# RUN pnpm build

# # Production stage
# FROM nginx:alpine

# # Copy built assets from builder
# COPY --from=builder /app/app/dist /usr/share/nginx/html

# # Copy nginx configuration if needed
# # COPY nginx.conf /etc/nginx/conf.d/default.conf

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]

EXPOSE 5173

CMD ["pnpm", "dev"]
