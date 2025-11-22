# Onboarding Chatbot - Project Plan

> **Status**: Planning Phase
> **Last Updated**: 2025-11-22
> **Learning Focus**: Understanding RAG (Retrieval Augmented Generation) from scratch

---

## 🎯 Project Overview

### What We're Building
An AI-powered onboarding chatbot that:
- Reads documentation files (Markdown initially)
- Answers questions based on those docs using local AI (Ollama)
- Shows sources for its answers (which doc/section it used)
- Can be expanded later to read from Confluence and video transcripts

### Why This Project?
- **Real-world skill**: RAG is the foundation of most AI applications today
- **Learn by building**: No frameworks initially - understand core concepts
- **Portfolio piece**: Demonstrates backend + AI + modern CLI skills
- **Extensible**: Easy to expand to new data sources

### Learning Objectives
By the end of this project, you'll understand:
- [ ] What vector embeddings are and why they matter
- [ ] How semantic search works (finding similar meaning, not just keywords)
- [ ] The RAG pattern (Retrieval Augmented Generation)
- [ ] Working with local LLMs (Ollama)
- [ ] Chunking strategies for documents
- [ ] Building modular AI systems (separation of core logic and UI)
- [ ] Building terminal UIs with React Ink
- [ ] TypeScript for AI applications (typing embeddings, vectors, LLM responses)
- [ ] Turborepo monorepo architecture

---

## 🏗️ Architecture Overview

### High-Level Flow
```
User Question (in terminal)
    ↓
CLI App (React Ink)
    ↓
Core RAG Engine (Node.js)
    ↓
1. Convert question to vector embedding (Ollama)
2. Search vector store for similar doc chunks
3. Retrieve top N relevant chunks
4. Send chunks + question to LLM (Ollama)
5. LLM generates answer using context
    ↓
Display answer + sources in terminal
```

### Technology Stack

**Core Engine**
- **Runtime**: Node.js
- **Language**: TypeScript (type safety, better DX)
- **LLM**: Ollama (local)
  - Chat model: `llama3` (or `llama3.2`, `mistral`)
  - Embedding model: `nomic-embed-text`
- **Vector Store**: Custom in-memory store (we build from scratch)
- **Document Format**: Markdown (.md files)

**CLI Interface**
- **UI Framework**: React Ink (React for terminal UIs)
- **Input Handling**: Ink's `useInput` hook
- **Styling**: Ink's Box/Text components (terminal-friendly)

**Development Tools**
- **Monorepo**: Turborepo (fast builds, proper dependency management)
- **Package Manager**: npm (or pnpm - Turborepo works great with both)
- **Language**: TypeScript 5.x
- **Build Tool**: tsx for development, tsc for production
- **Code Editor**: VS Code (assumed)
- **Version Control**: Git (recommended)

---

## 📁 Project Structure (Turborepo + TypeScript)

```
onboarding-chatbot/
│
├── PLAN.md                          # This file - our planning document
├── README.md                        # Project overview and setup instructions
├── package.json                     # Root package.json
├── turbo.json                       # Turborepo configuration
├── tsconfig.json                    # Base TypeScript config
│
├── packages/
│   │
│   ├── core/                        # Core RAG engine package
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts             # Export all core modules
│   │   │   ├── config.ts            # Configuration types & defaults
│   │   │   ├── types.ts             # Shared TypeScript types
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── documentLoader.ts    # Read and parse markdown
│   │   │   │   ├── chunker.ts           # Split documents into chunks
│   │   │   │   ├── embeddingService.ts  # Generate embeddings via Ollama
│   │   │   │   ├── vectorStore.ts       # Store and search vectors
│   │   │   │   └── chatService.ts       # RAG implementation
│   │   │   │
│   │   │   └── utils/
│   │   │       └── similarity.ts        # Cosine similarity calculation
│   │   │
│   │   └── dist/                    # Compiled TypeScript output
│   │
│   └── cli/                         # CLI application package
│       ├── package.json             # Depends on @onboarding/core
│       ├── tsconfig.json
│       ├── src/
│       │   ├── index.tsx            # Entry point - start CLI app
│       │   │
│       │   └── components/          # React Ink components
│       │       ├── App.tsx          # Main CLI app component
│       │       ├── ChatMessage.tsx  # Display a chat message
│       │       ├── SourcesList.tsx  # Show document sources
│       │       └── InputPrompt.tsx  # User input component
│       │
│       └── dist/                    # Compiled TypeScript output
│
└── docs/                            # Sample documentation files
    ├── getting-started.md
    ├── features.md
    └── faq.md
```

---

## 🧠 Key AI Concepts (Explained Simply)

### 1. Vector Embeddings
**What**: Converting text into an array of numbers (vector)

**Why**: Computers can't compare "meanings" of text directly. But they can compare numbers.

**Example**:
```javascript
"What is onboarding?" → [0.23, -0.45, 0.89, ..., 0.12] (768 numbers)
"How do I get started?" → [0.25, -0.43, 0.87, ..., 0.15] (768 numbers)
// These vectors are similar! Both about getting started
```

**How**: We send text to Ollama's embedding model, it returns the vector

### 2. Semantic Search
**What**: Finding text with similar *meaning*, not just matching keywords

**How**:
1. All document chunks are converted to vectors (done once, stored)
2. User question is converted to vector (done each query)
3. Compare question vector to all chunk vectors using cosine similarity
4. Return chunks with highest similarity scores

**Example**:
```
Question: "How do I begin?"
Matches:
  - "Getting started guide" (0.89 similarity)
  - "First steps" (0.85 similarity)

Doesn't match:
  - "Advanced configuration" (0.23 similarity)
```

### 3. RAG (Retrieval Augmented Generation)
**What**: A two-step process to make LLMs answer from your specific documents

**Steps**:
1. **Retrieval**: Find relevant document chunks (semantic search)
2. **Augmentation**: Add those chunks to the prompt as context
3. **Generation**: LLM generates answer using that context

**Why**: LLMs only know what they were trained on. RAG gives them YOUR documents as reference.

**Example Prompt**:
```
Context from documentation:
---
[Retrieved chunk 1: "Onboarding takes 3 days..."]
[Retrieved chunk 2: "You'll meet your team on day 1..."]
---

User Question: How long is onboarding?

Answer based on the context above:
```

### 4. Chunking
**What**: Breaking large documents into smaller pieces

**Why**:
- LLMs have token limits (can't send entire 100-page doc)
- Smaller chunks = more precise retrieval
- Better semantic matching

**Strategy** (we'll use):
- Split by headings/sections
- Aim for ~500-1000 characters per chunk
- Keep some overlap between chunks (context preservation)

---

## 🚀 Implementation Phases

### Phase 0: Setup & Prerequisites ⏱️ ~45 mins
**Goal**: Get environment ready with Turborepo + TypeScript

- [ ] Ensure Node.js installed (v18+)
- [ ] Install Ollama
- [ ] Pull required models (`ollama pull llama3`, `ollama pull nomic-embed-text`)
- [ ] Initialize Turborepo monorepo
- [ ] Set up TypeScript configurations (root + packages)
- [ ] Create package structure (`packages/core`, `packages/cli`)
- [ ] Configure build pipeline in turbo.json
- [ ] Set up package dependencies

**Key Files**: `turbo.json`, `tsconfig.json`, `package.json` files

**Learning Focus**: Turborepo basics, TypeScript project setup, monorepo architecture

### Phase 1: Backend - Document Processing ⏱️ ~2-3 hours
**Goal**: Read docs and convert to searchable vectors

**Tasks**:
- [ ] Create sample markdown documentation files
- [ ] Build document loader (read .md files from folder)
- [ ] Implement text chunker (split by headings, size limits)
- [ ] Create embedding service (call Ollama API)
- [ ] Test: Successfully convert sample docs to vectors

**Key Files**: `documentLoader.ts`, `chunker.ts`, `embeddingService.ts`, `types.ts`

**Learning Focus**: File I/O, text processing, API calls to Ollama, TypeScript interfaces for AI data structures

### Phase 2: Backend - Vector Store ⏱️ ~2-3 hours
**Goal**: Store vectors and implement similarity search

**Tasks**:
- [ ] Build in-memory vector store (array of objects)
- [ ] Implement cosine similarity function (from scratch!)
- [ ] Create search function (find top K similar chunks)
- [ ] Test: Query returns relevant chunks

**Key Files**: `vectorStore.ts`, `utils/similarity.ts`

**Learning Focus**: Vector mathematics (simple!), search algorithms, TypeScript generics for type-safe vector operations

### Phase 3: Backend - RAG Implementation ⏱️ ~2-3 hours
**Goal**: Combine retrieval + LLM generation

**Tasks**:
- [ ] Create chat service
- [ ] Implement retrieval logic (search vector store)
- [ ] Build prompt template (inject context + question)
- [ ] Call Ollama chat API with constructed prompt
- [ ] Handle streaming responses (optional: start simple)
- [ ] Test: Ask questions, get accurate answers

**Key Files**: `chatService.ts`

**Learning Focus**: The RAG pattern, prompt engineering, strong typing for LLM inputs/outputs

### Phase 4: CLI Interface with React Ink ⏱️ ~2-3 hours
**Goal**: Build terminal-based chat UI using React Ink

**Tasks**:
- [ ] Install and set up React Ink
- [ ] Create main App component (chat interface)
- [ ] Build message display component (user/bot messages)
- [ ] Implement text input handling (Ink's useInput)
- [ ] Integrate with core RAG engine
- [ ] Handle loading states (spinner while AI thinks)
- [ ] Display sources/citations in terminal
- [ ] Add colors and formatting (chalk-style)

**Key Files**: `cli/src/index.tsx`, `components/App.tsx`, `components/ChatMessage.tsx`

**Learning Focus**: React Ink basics, terminal UIs, state management, integrating UI with core package, TypeScript with React

**Why React Ink is Cool**:
- Write React components that render to terminal
- Interactive CLI apps with familiar React patterns
- Great for learning React without web complexity

### Phase 6: Testing & Refinement ⏱️ ~2-3 hours
**Goal**: Make it robust and user-friendly

**Tasks**:
- [ ] Test with various questions
- [ ] Improve chunking if needed
- [ ] Tune similarity threshold
- [ ] Add better error messages
- [ ] Improve UI/UX based on testing
- [ ] Document the code (comments)

### Phase 7: Documentation ⏱️ ~1-2 hours
**Goal**: Make project understandable and reusable

**Tasks**:
- [ ] Write comprehensive README
- [ ] Add architecture diagrams
- [ ] Document how to extend (Confluence, video)
- [ ] Create troubleshooting guide

**Total Estimated Time**: ~13-22 hours (TypeScript setup adds ~1-2 hours, but saves time debugging!)

---

## 🔮 Future Expansion Plan

### Adding Confluence Support
**What changes**:
- New module: `confluenceLoader.js`
- Fetches pages via Confluence REST API
- Converts HTML to markdown
- Same chunking/embedding pipeline

**Effort**: ~3-5 hours

### Adding Video Support
**Approach**:
1. Extract audio from video
2. Transcribe using Whisper (local) or API
3. Chunk transcript by timestamps
4. Store with video URL + timestamp
5. Answers include video links with exact time

**What changes**:
- New module: `videoLoader.js`
- Transcript extraction tool
- Modified chunk metadata (include timestamps)
- UI shows video player with timestamp

**Effort**: ~5-8 hours

**Tools needed**:
- `ffmpeg` for audio extraction
- `whisper.cpp` or OpenAI Whisper API for transcription

---

## ❓ Decisions to Make Together

### 1. Chunking Strategy
**Your choice**: ✅ **C) Hybrid** - Split by headings + max size limit
- Keeps semantic meaning together
- Prevents chunks from being too large
- 10% overlap for context preservation

### 2. Vector Store Persistence
**Your choice**: ✅ **B) JSON file** - Persistent, easy to inspect
- Survives restarts
- Can view/debug the stored vectors
- Easy to upgrade to database later

### 3. LLM Model
**Your choice**: ✅ **A) llama3.2** - Best quality for learning
- Most accurate answers
- Better understanding of questions
- Can try faster models later

### 4. Number of Retrieved Chunks
**Your choice**: ✅ **B) Top 5** - Good balance
- Industry standard
- Enough context without overloading
- Fast enough for local LLM

### 5. CLI Features
**Your choice**: ✅ **A) Simple linear chat** - Start simple
- Focus on learning core concepts first
- Can add fancy features later
- Clean, easy to understand code

---

## 📝 Questions for Discussion

Before we start coding, let's align on:

1. **Ollama Setup**: ❌ Not installed yet - We'll install together

2. **Development Environment**: ✅ Windows (c:\Users\SBS\Desktop\workspace)

3. **Git**: ✅ Yes - Initialize git repo and commit as we go

4. **Code Style**: ✅ Detailed comments explaining everything (learning mode)

5. **Pace**: ✅ Go slow, explain each concept deeply as we go

6. **Testing**: Focus on functionality first, tests later

---

## 🎓 Learning Guide & Concepts

### TypeScript Concepts You'll Learn

#### 1. **Interface Design for AI Data**
You'll create type-safe structures for:
```typescript
// Example types you'll build
interface Embedding {
  vector: number[];      // The actual embedding (768 numbers)
  text: string;          // Original text
  metadata: {
    source: string;      // Which file it came from
    chunkIndex: number;
  };
}

interface SearchResult {
  chunk: DocumentChunk;
  similarity: number;    // 0-1 score
}

interface RAGResponse {
  answer: string;
  sources: SearchResult[];
  confidence: number;
}
```

**Why this matters**: Type safety prevents bugs like passing strings where arrays expected

#### 2. **Generic Functions for Vector Operations**
```typescript
function cosineSimilarity<T extends number[]>(a: T, b: T): number
```
Learn how generics make code reusable while maintaining type safety

#### 3. **Async/Await with Type Safety**
```typescript
async function generateEmbedding(text: string): Promise<Embedding>
```
Properly type async operations with LLMs

### Turborepo Concepts You'll Learn

#### 1. **Package Dependencies**
```json
// packages/cli/package.json
{
  "dependencies": {
    "@onboarding/core": "*"  // Internal package dependency
  }
}
```
Learn how packages depend on each other

#### 2. **Build Pipeline**
```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],  // Build dependencies first
      "outputs": ["dist/**"]
    }
  }
}
```
Understand task orchestration and caching

#### 3. **Workspace Organization**
- Each package is independently testable
- Core can be published to npm later
- Add new packages without touching existing code

### AI/RAG Concepts You'll Master

#### 1. **Vector Embeddings** (Simple Explanation)
```
"Hello world"
    ↓ (embedding model)
[0.23, -0.45, 0.89, ..., 0.12] (768 numbers)

Think of it as GPS coordinates for meaning:
- Similar meanings → nearby coordinates
- Different meanings → far apart coordinates
```

**What you'll code**:
- Call Ollama API to get embeddings
- Store them efficiently
- Compare them mathematically

#### 2. **Cosine Similarity** (The Math)
```typescript
// You'll implement this from scratch!
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  // 1. Dot product: multiply corresponding numbers, sum them
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);

  // 2. Magnitudes: how "long" each vector is
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  // 3. Cosine similarity: -1 to 1 (1 = identical, 0 = unrelated)
  return dotProduct / (magA * magB);
}
```

**Why cosine**: It measures angle between vectors, not distance. Perfect for meaning comparison!

#### 3. **Document Chunking Strategies**

**Strategy 1: By Headings** (Semantic)
```markdown
# Getting Started    ← Split here
Content...

## Installation      ← Split here
More content...
```
**Pros**: Keeps related content together
**Cons**: Chunks can be very different sizes

**Strategy 2: Fixed Size** (Practical)
```
Every 500 characters → new chunk
+ 100 character overlap between chunks
```
**Pros**: Consistent chunk sizes
**Cons**: Might split mid-sentence

**Strategy 3: Hybrid** (What we'll use!)
- Split by headings first
- If chunk > 1000 chars, split again
- Maintain 10% overlap

#### 4. **The RAG Pipeline** (Step by Step)

```typescript
// You'll build each step:

// Step 1: User asks question
const question = "How long is onboarding?";

// Step 2: Convert question to vector
const questionEmbedding = await embed(question);
// → [0.25, -0.43, 0.87, ...]

// Step 3: Find similar document chunks
const results = vectorStore.search(questionEmbedding, topK: 5);
// → Returns 5 most relevant chunks with similarity scores

// Step 4: Build context from top results
const context = results
  .map(r => r.chunk.content)
  .join('\n---\n');

// Step 5: Create prompt with context
const prompt = `
Context from documentation:
${context}

Question: ${question}

Answer based only on the context above:
`;

// Step 6: Get LLM response
const answer = await ollama.chat(prompt);

// Step 7: Return with sources
return {
  answer,
  sources: results.map(r => r.chunk.source)
};
```

### Hands-On Learning Approach

As we build, you'll learn through:

1. **Commenting Strategy**
   - Every function has a doc comment explaining what it does
   - Complex logic has inline comments explaining why
   - Type definitions have examples

2. **Incremental Building**
   - Test each piece independently before combining
   - See immediate results (e.g., "here's the embedding for 'hello'")
   - Debug one layer at a time

3. **Real Examples**
   - Sample docs about onboarding
   - Test questions you'd actually ask
   - See how changing chunk size affects results

4. **Experimentation**
   - Try different similarity thresholds
   - Compare different chunking strategies
   - Test with different LLM models

### Debugging Skills You'll Develop

1. **TypeScript Errors**
   ```typescript
   // Type error: you'll learn to read these
   Type 'string' is not assignable to type 'number[]'
   ```

2. **AI-Specific Debugging**
   ```typescript
   // Why is the answer wrong?
   console.log('Retrieved chunks:', results.map(r => ({
     similarity: r.similarity,
     source: r.chunk.source,
     preview: r.chunk.content.substring(0, 100)
   })));
   ```

3. **Monorepo Issues**
   ```bash
   # Package not found? Learn about workspace resolution
   # Build errors? Understand dependency order
   ```

### Questions You'll Be Able to Answer

After this project:
- ✅ How do AI chatbots "remember" your documents?
- ✅ Why does my chatbot sometimes give wrong answers? (retrieval vs generation issues)
- ✅ How do I make a chatbot more accurate?
- ✅ What's the difference between RAG and fine-tuning?
- ✅ How do companies like Notion AI or GitHub Copilot work?
- ✅ How do I structure a TypeScript AI project professionally?

---

## 🎓 Additional Resources

**Understanding RAG**:
- [What is RAG?](https://www.pinecone.io/learn/retrieval-augmented-generation/) - Concept overview
- Vector embeddings explained: _[We'll create our own explanation as we build]_

**Ollama Documentation**:
- [Ollama API](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Available models](https://ollama.com/library)

**TypeScript**:
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- We'll explain concepts as we encounter them

**Turborepo**:
- [Turborepo Docs](https://turbo.build/repo/docs)
- We'll set it up together step by step

---

## 🔄 Next Steps

1. **Review this plan**: Read through, ask questions about anything unclear
2. **Make decisions**: Answer the "Decisions to Make Together" section
3. **Discuss questions**: Go through "Questions for Discussion"
4. **Refine plan**: We'll update this document based on your feedback
5. **Start Phase 0**: Once aligned, we begin coding!

---

## 📌 Notes & Ideas

_[This section is for capturing ideas, learnings, and decisions as we work]_

### Decisions Made:
- **Interface**: React Ink CLI (simpler, faster to build, great for learning)
- **Language**: TypeScript (type safety, better autocomplete, professional standard)
- **Monorepo Tool**: Turborepo (fast builds, proper package isolation)
- **Architecture**: Monorepo with separated core engine and UI packages
- **Learning Approach**: Manual setup, no scaffolding tools - understand every line
- **Pace**: Slow with detailed explanations at each step
- **Chunking**: Hybrid (headings + max size)
- **Vector Store**: JSON file (persistent)
- **LLM**: llama3.2
- **Retrieved Chunks**: Top 5
- **CLI**: Simple linear chat initially

### Future Optimizations
See [FUTURE_IMPROVEMENTS.md](./FUTURE_IMPROVEMENTS.md) for detailed improvement plans including:
- Performance optimizations (pre-filtering, caching)
- Advanced chunking (sentence-aware, token-based, multi-format support)
- Vector store improvements (database backends, hybrid search)
- Data source expansion (Confluence, videos, web scraping)
- Monitoring, testing, and deployment strategies

### Benefits of This Stack:
1. **TypeScript**: Catch errors before runtime, amazing autocomplete for AI types
2. **Turborepo**: Professional monorepo setup, easy to add more packages later
3. **Package Separation**: `@onboarding/core` can be used by CLI, web UI, or API
4. **Type Safety**: Define interfaces for embeddings, chunks, RAG responses
5. **Learning Value**: This is how real companies structure AI applications
6. **Easy to Extend**: Add `packages/api` or `packages/web` later using same core

### Why Turborepo for This Project:
- **Caching**: Rebuilds only what changed
- **Task Pipeline**: Build core before CLI automatically
- **Professional**: Learn industry-standard monorepo tool
- **Scalable**: Easy to add Confluence loader, video processor as new packages

---

**Ready to discuss and refine this plan?** 🚀
