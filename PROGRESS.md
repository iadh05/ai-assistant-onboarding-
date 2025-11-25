# Learning Progress - Onboarding Chatbot

## Session: 2025-11-22

### ✅ Completed
- [x] Project setup (Turborepo, TypeScript, packages structure)
- [x] Understanding: What are embeddings?
- [x] Built embedding service (now refactored to LLM package)
- [x] Understanding chunking
- [x] Built chunking service
- [x] Understanding vector store
- [x] Built vector store with embedding integration
- [x] Understanding RAG pattern
- [x] Built chat service with RAG implementation
- [x] **MAJOR REFACTORING: Separated LLM package**
  - Created `packages/llm` with provider pattern
  - XML-based prompt formatting
  - Clean separation of concerns
  - Easy to swap LLM providers
- [x] Organized test files into `tests/` directory
- [x] Added comprehensive .gitignore
- [x] **FULL RAG PIPELINE WORKING!**
- [x] **Built gRPC API Server** (Learning: client-server architecture)
  - Created Protocol Buffer schema
  - Implemented gRPC server with RAG endpoints
  - Tested end-to-end gRPC communication
  - Documented gRPC vs REST differences
- [x] **Promoted Proto to Shared Contracts Package**
  - Created `packages/contracts/` for API contracts
  - Industry-standard separation of interface vs implementation
  - Ready for multiple clients (CLI, web, mobile)
- [x] **MICROSERVICES ARCHITECTURE WITH gRPC GATEWAY!**
  - Refactored monolithic service into 3 backend microservices
  - Built gRPC-to-gRPC gateway (single entry point for clients)
  - Client connects to ONE address, gateway routes to backends
  - Learned microservices patterns and service discovery

### 🔄 Next Steps
- [ ] Build CLI interface with React Ink
- [ ] Add real documentation files
- [ ] Implement document indexing workflow
- [ ] Add conversation history
- [ ] Deploy as CLI tool

---

## Key Learnings

### Embeddings
- **Purpose:** Convert text to numbers to compare meaning
- **Model:** nomic-embed-text (via Ollama)
- **Output:** 768 numbers per text
- **Use case:** Find similar docs by comparing number arrays
- **Architecture:** Now uses `EmbeddingProvider` interface for flexibility

### Cosine Similarity
- **Purpose:** Measure how similar two embeddings are
- **Formula:** dotProduct / (magnitude1 × magnitude2)
- **Score:** 0.0 (different) to 1.0 (identical)
- **How it works:**
  1. Dot product: Multiply matching positions, sum them
  2. Magnitude: Calculate "length" of each vector
  3. Divide: Normalizes for fair comparison
- **Visual:** Measures the "angle" between vectors (small angle = similar)
- **Architecture:** Isolated in `utils/similarity.ts` (will be removed when using vector DB)

### Chunking
- **Purpose:** Split large documents into smaller, meaningful pieces
- **Strategy:** Hybrid approach - split by markdown headings, with max size fallback
- **Why needed:** LLMs have token limits, embeddings work better on focused chunks
- **Implementation:** `ChunkingService` with heading-based splitting
- **Metadata:** Tracks source, heading, and index for each chunk

### Vector Store
- **Purpose:** Store document chunks with their embeddings for fast similarity search
- **Current implementation:** JSON file (simple, works for POC)
- **Architecture:** Uses `EmbeddingProvider` interface (easy to swap providers)
- **Key methods:**
  - `addChunks()` - generates embeddings and stores chunks
  - `search()` - finds most similar chunks to a query
  - `save()/load()` - persistence
- **Future:** Will upgrade to real vector database (Pinecone, Weaviate, Chroma)

### RAG (Retrieval Augmented Generation)
- **Purpose:** Give LLM accurate, grounded answers using your own documentation
- **Three steps:**
  1. **Retrieval:** Search vector store for relevant chunks
  2. **Augmentation:** Build XML prompt with retrieved context
  3. **Generation:** LLM generates answer based on context
- **Why it works:**
  - LLM doesn't hallucinate (uses only provided docs)
  - Easy to update knowledge (just update docs)
  - Shows sources used
  - Admits when it doesn't know

### Provider Pattern (Architecture)
- **Purpose:** Separate business logic from infrastructure
- **Benefits:**
  - Easy to swap LLMs (Ollama → OpenAI → Claude)
  - Easy to test (use mock providers)
  - Multi-model support (route based on complexity)
  - Cost optimization
- **Implementation:**
  - `LLMProvider` interface for chat generation
  - `EmbeddingProvider` interface for embeddings
  - Ollama implementations in `packages/llm/providers/ollama/`

### XML Prompts
- **Purpose:** Structured, unambiguous prompts for LLMs
- **Benefits:**
  - Clear section boundaries (`<system>`, `<documents>`, `<instructions>`, `<question>`)
  - Easier for LLM to parse
  - Industry standard (Anthropic uses heavily)
  - Easy to modify programmatically
- **Implementation:** `PromptBuilder` class with `buildRAGPrompt()`

### gRPC (Client-Server Communication)
- **Purpose:** Learn how to build APIs for microservices (vs Express for web apps)
- **Key Concepts:**
  - **Protocol Buffers (.proto):** Strict API contract, auto-generated code
  - **Binary Format:** Faster and smaller than JSON (40-60% reduction)
  - **HTTP/2:** Multiplexing, streaming, better performance
  - **Type Safety:** Compile-time checking, impossible to get out of sync
- **When to use:**
  - gRPC: Microservices, high-performance, server-to-server
  - REST: Web apps, public APIs, browser compatibility
  - In-Process: CLI tools, desktop apps (simplest)
- **Implementation:**
  - Service definition in `packages/contracts/proto/chat.proto`
  - Backend services in `packages/api/src/services/`
  - Gateway in `packages/api/src/gateway/grpc-gateway.ts`
  - Client test in `packages/api/src/test-gateway.ts`
- **See:** [GRPC_VS_REST.md](GRPC_VS_REST.md) for detailed comparison

### Microservices Architecture
- **Purpose:** Learn distributed system design and service-oriented architecture
- **Pattern:** API Gateway (single entry point) + Backend Services
- **Key Concepts:**
  - **Service Separation:** Each service has single responsibility
    - Document Service (port 50051): Document management, chunking, vector storage
    - Chat Service (port 50052): RAG query processing, LLM interaction
    - System Service (port 50053): Health checks, system info
  - **API Gateway (port 8080):** Single entry point for all clients
    - Client doesn't know about backend services
    - Gateway proxies requests to appropriate backend
    - Simplifies client code (one connection vs. three)
  - **Service Discovery:** Gateway knows backend service addresses
  - **Protocol Buffers:** Changed from `chatbot` to `onboarding.chatbot.v1` (versioning)
- **Benefits:**
  - **Independent Scaling:** Scale only the services you need
  - **Independent Deployment:** Update one service without touching others
  - **Technology Flexibility:** Each service can use different tech stack
  - **Team Autonomy:** Different teams can own different services
  - **Fault Isolation:** One service failing doesn't crash everything
- **Implementation:**
  - Proto refactored into 3 separate services (DocumentService, ChatService, SystemService)
  - Each service runs independently on different port
  - Gateway creates gRPC clients to all backend services
  - Gateway implements all service interfaces and proxies calls
  - Client connects only to gateway, not backend services
- **When to use:**
  - Large applications with multiple concerns
  - Teams working independently
  - Need to scale different parts differently
  - Learning distributed systems
- **Trade-offs:**
  - More complexity (multiple processes, network calls)
  - Need for monitoring and logging
  - Harder to debug (distributed tracing needed)
  - Local development requires running multiple services

---

## Test Results

### Embedding Test
✅ Successfully generated embeddings and compared similarity
- "Hello" vs "Hi": 0.879 (high similarity - similar meaning)
- "Hello" vs "Installing Node.js": 0.334 (low similarity - different meaning)

### Chunking Test
✅ Successfully split document into 4 chunks by markdown headings
- Each chunk has proper metadata (source, heading, index)

### Vector Store Test
✅ Successfully created vector store with semantic search
- Query: "How do I install Node?" → Found "Installation" (score: 0.847)
- Query: "How to create a project?" → Found "First Project" (score: 0.680)

### Full RAG Chat Test
✅ **END-TO-END RAG PIPELINE WORKING!**

**Test 1:** "How do I install Node.js?"
- Retrieved: Installation docs (score: 0.864)
- Answer: Correctly synthesized steps from documentation
- Sources: Showed which docs were used

**Test 2:** "What should I do if npm install fails?"
- Retrieved: Troubleshooting section (score: 0.717)
- Answer: Provided correct solution from docs
- Sources: Referenced troubleshooting guide

**Test 3:** "How do I deploy to AWS?"
- Retrieved: Best matching docs (score: 0.579)
- Answer: **Correctly admitted it doesn't have that information!**
- No hallucination - this is the key benefit of RAG!

### gRPC API Test
✅ **CLIENT-SERVER ARCHITECTURE WORKING!**

**Test 1:** Health Check
- ✓ Server responds with status, LLM model, and embedding model
- ✓ gRPC connection established successfully

**Test 2:** Add Document via API
- ✓ Added 1 document over gRPC
- ✓ Server chunked it into 3 pieces
- ✓ Vector embeddings generated remotely

**Test 3:** Ask Question via gRPC
- Question: "How do I install Node.js?"
- ✓ Retrieved 3 relevant chunks
- ✓ LLM generated answer using retrieved context
- ✓ Sources returned with answer
- **Key Learning:** Same RAG logic, but over network instead of in-process!

### Microservices Gateway Test
✅ **MICROSERVICES ARCHITECTURE WORKING VIA GATEWAY!**

**Architecture:**
- Client connects to: `localhost:8080` (Gateway)
- Gateway routes to:
  - Document Service (`localhost:50051`)
  - Chat Service (`localhost:50052`)
  - System Service (`localhost:50053`)

**Test 1:** Health Check via Gateway
- ✓ Client → Gateway (8080) → System Service (50053)
- ✓ Gateway logged: `[Gateway] Proxying HealthCheck to System Service`
- ✓ Response: Status OK, llama3.2, nomic-embed-text

**Test 2:** Add Document via Gateway
- ✓ Client → Gateway (8080) → Document Service (50051)
- ✓ Gateway logged: `[Gateway] Proxying AddDocuments to Document Service`
- ✓ Added 1 document, chunked into 3 pieces

**Test 3:** Ask Question via Gateway
- Question: "What are microservices?"
- ✓ Client → Gateway (8080) → Chat Service (50052)
- ✓ Gateway logged: `[Gateway] Proxying AskQuestion to Chat Service`
- ✓ Retrieved relevant chunks and generated answer

**Key Learnings:**
- Client code is simpler - one connection point instead of three
- Gateway handles service discovery and routing
- Backend services are hidden from clients
- Easy to add load balancing, authentication, rate limiting at gateway level
- Logs show clear routing: which service handled which request

---

## Architecture Achievements

### Clean Separation of Concerns
```
packages/contracts/         → API contracts (Protocol Buffers)
packages/llm/               → Infrastructure (LLM providers)
packages/core/              → Business logic (RAG, chunking, vector store)
packages/api/
  ├── src/services/         → Backend microservices (document, chat, system)
  ├── src/gateway/          → API Gateway (single entry point)
  └── src/test-gateway.ts   → Gateway client test
packages/cli/               → User interface (to be built)
```

**Key insights:**
- The `.proto` contract is separate from implementation, allowing multiple clients to share the same contract
- Microservices architecture separates concerns by service boundary
- Gateway pattern provides single entry point while maintaining service independence

### Provider Pattern Implementation
- Interfaces define contracts
- Implementations are swappable
- Easy to add new providers (OpenAI, Claude, etc.)
- Tests can use mock providers

### Organized Structure
- Tests in dedicated `tests/` folder
- Providers organized by vendor (`ollama/`, future: `openai/`, `anthropic/`)
- Clean imports and dependencies
- Proper TypeScript declarations
