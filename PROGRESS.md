# Learning Progress - Onboarding Chatbot

## Session: 2025-11-25

### ✅ Completed (Sprint 1 + Sprint 2 Partial)

**Sprint 1 - Polish & UX:**
- [x] S1-1: Fixed vector store reload performance (added `reloadIfChanged()` with mtime tracking)
- [x] S1-2: Added sources display in chat UI (collapsible component)
- [x] S1-3: Integrated conversation storage with localStorage
- [x] S1-4: Made Copy button work with Clipboard API + visual feedback
- [x] S1-5: Verified timeout exists (30s), improved error messages

**Sprint 2 - Caching & Error Handling (COMPLETE):**
- [x] S2-1: Added QueryCache for instant repeat responses
- [x] S2-2: Added EmbeddingCache integrated into VectorStore
- [x] S2-3: Retry logic with exponential backoff (centralized in queryClient)
- [x] S2-4: Friendly error messages (error-messages.ts + gateway error handler)
- [~] S2-5: Cache stats in health check (SKIPPED → moved to Sprint 5)

**Deep Dive: Semantic Caching**
- [x] Created semantic caching risk test (`test-semantic-risk.ts`)
- [x] Ran tests showing dangerous false positives (enable vs disable dark mode: 93.2% similarity!)
- [x] Added Sprint 11 to planning: Vector DB & Semantic Caching

**Infrastructure:**
- [x] Fixed dev script to auto-rebuild core/llm packages
- [x] Added mentor rule: "ONE TICKET AT A TIME"
- [x] Added Gemini API configuration to .env

---

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

### Caching Strategies (NEW - Session 2025-11-25)

**Two-Layer Cache Architecture:**
```
User Query
    ↓
┌─────────────────────────────────────────────────┐
│ Layer 1: QueryCache (exact match)               │
│   Key: normalized question hash                 │
│   Value: full ChatResponse {answer, sources}    │
│   Hit = instant response (skip everything!)     │
└─────────────────────────────────────────────────┘
    ↓ (cache miss)
┌─────────────────────────────────────────────────┐
│ Layer 2: EmbeddingCache (in VectorStore)        │
│   Key: text hash                                │
│   Value: embedding vector [768 numbers]         │
│   Hit = skip Ollama API call (~100-300ms saved) │
└─────────────────────────────────────────────────┘
    ↓ (cache miss)
    Generate embedding → Search → RAG → LLM
```

**LRU Cache Pattern:**
- **LRU** = Least Recently Used (evicts oldest unused items)
- **TTL** = Time To Live (auto-expire stale data)
- **Hit Rate** = cache hits / total requests (measure effectiveness)
- Used by Redis, Memcached, and every production system

**Why Two Separate Caches?**
| Cache | Level | What it saves | When it helps |
|-------|-------|---------------|---------------|
| QueryCache | High | Full RAG pipeline | Exact same question |
| EmbeddingCache | Low | Embedding API call | Same text needs embedding |

### Semantic Caching Risk (NEW - Deep Dive)

**The Danger:** High embedding similarity ≠ Same answer needed!

**Real Test Results:**
```
"How to enable dark mode?" vs "How to disable dark mode?"
Similarity: 93.2%  →  ❌ WRONG CACHE HIT with 0.90 threshold!
```

**Why This Happens:**
- Embeddings capture "what the text is about" (semantic meaning)
- Both questions are "about dark mode" and "about how-to"
- But the **intent is opposite** (enable vs disable)

**Safe Production Approaches:**
1. **Conservative Threshold (0.95+)** - Miss opportunities, never wrong
2. **LLM Verification** - Ask small LLM "Are these the same question?"
3. **Hybrid** - High threshold + keyword checking (enable/disable, add/remove)

**Our Choice:** Exact-match QueryCache only (safest for onboarding docs)

### File Modification Time (mtime) Pattern

**Problem:** VectorStore was reloading from disk on every query (slow!)

**Solution:** Track file's `mtimeMs` (modification timestamp)
```typescript
if (stats.mtimeMs > this.lastModifiedTime) {
  await this.load();  // File changed, reload
}
// else: skip reload, use cached data
```

**Where This Pattern is Used:**
- Build systems (webpack, tsc watch mode)
- File sync tools (Dropbox, rsync)
- Hot reload in development servers
- Our VectorStore!

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

---

## 📊 Session Assessment: 2025-11-25

### Skills Demonstrated

| Skill | Level | Evidence |
|-------|-------|----------|
| **Caching Patterns** | ⭐⭐⭐⭐ Strong | Built LRU cache, understands TTL, hit rates |
| **System Design** | ⭐⭐⭐⭐ Strong | Two-layer cache architecture, mtime optimization |
| **Critical Thinking** | ⭐⭐⭐⭐⭐ Excellent | Asked the RIGHT question about semantic caching risk |
| **Testing Mindset** | ⭐⭐⭐⭐ Strong | Wanted to see real test data before trusting theory |
| **Learning Initiative** | ⭐⭐⭐⭐⭐ Excellent | Paused sprint to deep-dive on interesting topic |

### Key Moment of the Session

**You asked:** "What happens if the user sends a query that's not similar but approximately similar?"

This is a **senior engineer question**. Most developers blindly implement semantic caching because it sounds cool. You questioned the assumption and discovered a real production risk.

### What You Learned Today

1. **LRU Cache** - Industry-standard eviction pattern
2. **TTL (Time To Live)** - Auto-expiring stale data
3. **Two-Layer Caching** - QueryCache (high) + EmbeddingCache (low)
4. **mtime Pattern** - Skip unnecessary disk reads
5. **Semantic Caching Risk** - High similarity ≠ Same answer
6. **False Positives** - The danger of trusting embeddings blindly

### Progress Toward Senior Engineer

```
Mid-Level                                      Senior
   |==========================================>|
   ░░░░░░░░░░░░░░░░░░░████████████░░░░░░░░░░░░░
                      ▲
                  You are here

Key indicator: Questioning assumptions, not just implementing
```

### Sprint 2 COMPLETE!

All tasks done except S2-5 (Cache stats in health check) which was intentionally moved to Sprint 5.

**Session 2025-11-26 Additions:**
- [x] S2-3: Retry logic - centralized in `queryClient.ts` (queries + mutations)
- [x] S2-4: Error handling layer - separate `gateway/errors/` module with gRPC status code mapping
- [x] CORS configuration with environment variable
- [x] Transport documentation (`docs/transport-and-sockets.md`)

### Files Created/Modified This Session

**New Files:**
- `packages/core/src/cache/lru-cache.ts` - Generic LRU cache
- `packages/core/src/cache/query-cache.ts` - Chat response cache
- `packages/core/src/cache/embedding-cache.ts` - Embedding vector cache
- `packages/core/src/cache/index.ts` - Cache exports
- `packages/core/src/tests/test-semantic-risk.ts` - Semantic caching risk demo

**Modified Files:**
- `packages/core/src/vectorStore.ts` - Added EmbeddingCache + reloadIfChanged
- `packages/core/src/chat.ts` - Added QueryCache integration
- `packages/core/src/index.ts` - Export caches
- `packages/web/src/modules/chat/views/chat.tsx` - Sources, copy button, localStorage
- `package.json` - Dev script with watchers
- `CLAUDE.md` - Added "ONE TICKET AT A TIME" rule
- `SPRINT-PLANNING.md` - Added Sprint 11 (Vector DB & Semantic Caching)
- `.env` / `.env.example` - Gemini configuration

### Next Session Recommendation

**Ready for Sprint 3: Document Ingestion & Validation**
- S3-1: Accept file uploads (PDF, DOCX, TXT, MD)
- S3-2: Validate file types, sizes, content
- S3-3: Sanitize text content
- S3-4: Extract text from PDF
- S3-5: Show upload progress
- S3-6: Document deduplication

This sprint will teach you file handling, validation patterns, and building robust input pipelines - all critical skills for production systems.

---

## Session Assessment: 2025-11-26

### Checkpoint Status

| Sprint | Status | Completion |
|--------|--------|------------|
| Sprint 1 | COMPLETE | 100% |
| Sprint 2 | COMPLETE | 100% (S2-5 moved to Sprint 5) |
| Sprint 3 | NOT STARTED | 0% |

**Overall Project Progress:** ~20% (2 of 10 sprints complete)

### Skills Demonstrated This Session

| Skill | Rating | Evidence |
|-------|--------|----------|
| **Debugging** | Strong | Identified retry wasn't working because mutations weren't configured |
| **Architecture Decisions** | Strong | Chose centralized config over per-hook config (DRY principle) |
| **Separation of Concerns** | Strong | Created dedicated error handler layer for gateway |
| **Asking Questions** | Excellent | Deep-dived on transport agnostic concept until fully understood |
| **Knowing When to Stop** | Excellent | Recognized feeling overwhelmed and requested checkpoint |

### Honest Assessment

**What Went Well:**
- You correctly identified that retry logic needed to be in queryClient, not individual hooks
- You pushed for deeper understanding of transport concepts rather than accepting surface-level explanations
- You requested documentation for complex topics you knew you'd forget - this is professional behavior
- You recognized when you were hitting cognitive overload and asked to pause

**Areas for Improvement:**
- Some concepts like Unix sockets and gRPC status codes may need revisiting - they were covered quickly near the end when you were already tired
- The session was long and covered a lot of ground - consider shorter, more focused sessions

**Key Learnings:**
1. **React Query retry** - Must configure separately for queries AND mutations
2. **gRPC Status Codes** - 0-16, transport agnostic, maps to HTTP
3. **Unix Sockets** - File-based IPC, Linux/Mac only, faster than TCP
4. **Health Checks** - Infrastructure polls them, not UI
5. **Error Handler Layering** - Separate concerns between gateway and services

### Senior Engineer Progress

```
Session Start                              Session End
     |                                          |
     ▼                                          ▼
Mid ░░░░░░░░░░░░░░░████████████░░░░░░░░░░░░░░░░░ Senior
                   ▲           ▲
              Last session   This session
                             (small but solid progress)
```

**Key Indicator:** You're developing the habit of questioning implementations and asking "why does it work this way?" This is the hallmark of a senior engineer mindset.

### What's Different Now vs. Session Start

Before this session:
- Retry logic existed but wasn't working for mutations
- Error handling was inline in routes
- No documentation on transport concepts

After this session:
- Retry works for both queries AND mutations (centralized)
- Dedicated error handler layer with gRPC status code mapping
- CORS properly configured via environment variable
- Transport documentation for future reference

### Recommendation for Next Session

1. **Start Fresh** - Don't try to immediately dive into Sprint 3 when tired
2. **Review Transport Docs** - Quick skim of `docs/transport-and-sockets.md` before starting
3. **Sprint 3 Focus** - File uploads and validation are practical, hands-on work
4. **Shorter Session** - Consider 2-3 tickets per session to avoid overload
