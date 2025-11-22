# gRPC API Server

This package provides a **gRPC API server** for the RAG chatbot, demonstrating client-server architecture.

## What is this?

A learning exercise to understand how **gRPC** works compared to REST/Express.

## Quick Start

### 1. Start the Server
```bash
npm run build
npm start
```

Server runs on `localhost:50051`

### 2. Test the API
```bash
# Simple health check
node dist/test-simple.js

# Full RAG test (add document + ask question)
node dist/test-full.js
```

## Files

- **[src/server.ts](src/server.ts)** - gRPC server implementation
- **[src/client.ts](src/client.ts)** - Reusable client library
- **[src/test-simple.ts](src/test-simple.ts)** - Health check test
- **[src/test-full.ts](src/test-full.ts)** - End-to-end RAG test

**API Contract:** See [@onboarding/contracts](../contracts/proto/chat.proto) for Protocol Buffer schema.

## API Methods

### 1. HealthCheck
Check if server is running and which models are loaded.

### 2. AddDocuments
Upload documents to be chunked and indexed in the vector store.

### 3. AskQuestion
Ask a question and get an answer with sources using RAG.

## Architecture

```
@onboarding/contracts (chat.proto) ← Shared API contract
    ↓ (used by both)
    ├→ Client (test-*.ts)
    │      ↓ (gRPC/HTTP/2)
    └→ Server (server.ts)
           ↓ (uses)
       Core Services (ChatService, VectorStore, ChunkingService)
           ↓ (uses)
       LLM Providers (Ollama)
```

**Key:** The `.proto` contract lives in a separate package (`@onboarding/contracts`), not in the server. This allows multiple clients (CLI, web, mobile) to share the same contract.

## When to Use

- ✅ **gRPC:** Microservices, high-performance, server-to-server
- ✅ **REST:** Web apps, public APIs, browser compatibility
- ✅ **In-Process:** CLI tools (simplest, no network)

See [GRPC_VS_REST.md](../../GRPC_VS_REST.md) for detailed comparison.
