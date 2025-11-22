# Future Improvements

This document tracks potential enhancements and optimizations to implement after the POC is complete and working.

---

## Performance Optimizations

### Heading-based Pre-filtering
**Goal:** Speed up search for very large document sets

**Current approach:**
- Embed all chunks
- Compare all embeddings against query
- Return top 5 matches

**Optimized approach:**
- Quick text-based heading filter first
- Only embed/compare filtered chunks
- Faster for 1000+ chunks

**When to implement:** When document set grows beyond 1000 chunks

**Complexity:** Low - just add filter before embedding comparison

---

## Chunking Improvements

### 1. Sentence-aware Splitting
**Problem:** Current approach might split mid-sentence

**Solution:**
- Detect sentence boundaries (., !, ?)
- Only split at sentence ends
- Preserve meaning and context

**Example:**
```typescript
// Before: Split at 1000 chars exactly
"...download the installer. Run the inst|aller and follow..."
                                        ^ Split here (bad!)

// After: Split at sentence boundary
"...download the installer. | Run the installer and follow..."
                            ^ Split here (good!)
```

---

### 2. Token-based Instead of Character-based
**Problem:** Characters ≠ tokens for LLM

**Solution:**
- Use tokenizer library (tiktoken)
- Count tokens instead of characters
- More accurate chunk sizing

**Why:** LLMs work with tokens, not characters
- "hello" = 1 token
- "hello world" = 2 tokens
- But 11-12 characters!

---

### 3. Sentence-aware Overlap
**Problem:** Overlap might cut mid-sentence

**Solution:**
```typescript
function getOverlap(text: string, overlapSize: number): string {
  const sentences = text.split('. ');
  let overlap = '';

  // Add complete sentences until reaching overlapSize
  for (let i = sentences.length - 1; i >= 0; i--) {
    if (overlap.length + sentences[i].length < overlapSize) {
      overlap = sentences[i] + '. ' + overlap;
    } else {
      break;
    }
  }

  return overlap;
}
```

---

### 4. Richer Metadata
**Current:**
```typescript
metadata: {
  source: string;
  heading?: string;
  index: number;
}
```

**Future:**
```typescript
metadata: {
  source: string;
  heading?: string;
  parentHeading?: string;    // For nested headings
  index: number;
  totalChunks: number;       // Total from this doc
  timestamp?: Date;          // When indexed
  author?: string;           // Document author
  tags?: string[];           // Manual tags
  wordCount: number;         // Chunk size
  language?: string;         // en, es, fr, etc.
}
```

---

### 5. Content Preprocessing
**Goal:** Clean and normalize text before chunking

**Improvements:**
- Remove excessive whitespace
- Normalize newlines (\r\n → \n)
- Remove empty lines
- Trim leading/trailing spaces
- Remove markdown artifacts (if needed)

**Example:**
```typescript
function preprocessContent(content: string): string {
  return content
    .replace(/\r\n/g, '\n')           // Normalize line endings
    .replace(/\n{3,}/g, '\n\n')       // Max 2 consecutive newlines
    .replace(/[ \t]+/g, ' ')          // Collapse spaces
    .split('\n')
    .map(line => line.trim())
    .join('\n');
}
```

---

## Multi-Format Support (Strategy Pattern)

### Architecture

**Current:** Markdown (.md) only

**Future:** Support multiple file formats with different chunking strategies

```typescript
interface ChunkingStrategy {
  chunk(content: string, source: string): Chunk[];
}

class MarkdownChunker implements ChunkingStrategy {
  chunk(content: string, source: string): Chunk[] {
    // Split by headings (# ## ###)
    // Current implementation
  }
}

class PlainTextChunker implements ChunkingStrategy {
  chunk(content: string, source: string): Chunk[] {
    // Split by paragraphs (double newline)
    // Fixed size chunks with overlap
  }
}

class PDFChunker implements ChunkingStrategy {
  chunk(content: string, source: string): Chunk[] {
    // Split by pages
    // Or by sections if PDF has structure
    // Include page numbers in metadata
  }
}

class HTMLChunker implements ChunkingStrategy {
  chunk(content: string, source: string): Chunk[] {
    // Split by semantic tags
    // <article>, <section>, <h1>, <h2>, etc.
    // Convert to markdown-like chunks
  }
}

class CodeChunker implements ChunkingStrategy {
  chunk(content: string, source: string): Chunk[] {
    // Split by functions/classes
    // Keep entire function together
    // Include imports/dependencies
  }
}

class ChunkingService {
  private strategies = new Map<string, ChunkingStrategy>();

  constructor() {
    this.strategies.set('.md', new MarkdownChunker());
    this.strategies.set('.txt', new PlainTextChunker());
    this.strategies.set('.pdf', new PDFChunker());
    this.strategies.set('.html', new HTMLChunker());
    this.strategies.set('.htm', new HTMLChunker());
    this.strategies.set('.ts', new CodeChunker());
    this.strategies.set('.js', new CodeChunker());
  }

  chunk(content: string, source: string): Chunk[] {
    const ext = path.extname(source);
    const strategy = this.strategies.get(ext) || this.strategies.get('.txt');
    return strategy.chunk(content, source);
  }
}
```

---

## Vector Store Improvements

### Architecture Note
**Current approach:** Simple service layer with JSON storage
- Easy to swap storage layer later
- Service interface stays the same
- Just change the implementation

**When upgrading:** Only modify VectorStore class internals, all other code unchanged

### 1. Database Backend
**Current:** JSON file (in-memory array + save/load)

**Future:** Real vector database
- Pinecone (cloud, managed)
- Weaviate (self-hosted, open source)
- Chroma (local, embedded)
- PostgreSQL + pgvector (if using Postgres already)

**Benefits:**
- Faster search (optimized indexes)
- Scales to millions of chunks
- Advanced filtering
- Cloud sync

---

### 2. Metadata Filtering
**Example:** Filter by date, author, tags before similarity search

```typescript
vectorStore.search(query, {
  topK: 5,
  filters: {
    source: 'getting-started.md',
    tags: ['installation'],
    dateAfter: '2024-01-01'
  }
});
```

---

### 3. Hybrid Search
**Combine:**
- Semantic search (embeddings)
- Keyword search (BM25)
- Weighted combination

**Why:** Best of both worlds
- Semantic finds conceptually similar
- Keyword finds exact matches

---

## RAG Improvements

### 1. Re-ranking
**Problem:** Top 5 chunks might not be optimal order

**Solution:**
- Retrieve top 20 chunks
- Re-rank with more powerful model
- Return top 5 from re-ranked

**Libraries:** Cohere re-rank API, cross-encoder models

---

### 2. Query Expansion
**Problem:** User query might be too short

**Solution:**
```typescript
// User asks: "install node"
// Expand to: "How to install Node.js on my computer"
// Better embeddings → better results
```

---

### 3. Context Compression
**Problem:** Retrieved chunks might be redundant

**Solution:**
- Detect duplicate information
- Compress to essential facts
- Send less to LLM (faster, cheaper)

---

## CLI Improvements

### 1. Chat History
- Save conversation to file
- Load previous sessions
- Reference earlier in conversation

### 2. Multiple Conversations
- Switch between chats
- Name conversations
- Delete old ones

### 3. Rich Formatting
- Syntax highlighting for code
- Tables
- Better markdown rendering

### 4. Streaming Responses
- Show LLM response as it generates
- Don't wait for complete answer
- Better UX

---

## Data Source Expansion

### 1. Confluence Integration
**How:**
- Confluence REST API
- Fetch pages by space
- Convert HTML → Markdown
- Same chunking pipeline

**Libraries:** `confluence-api`, `turndown` (HTML → MD)

---

### 2. Video/Audio Support
**Pipeline:**
1. Extract audio from video (ffmpeg)
2. Transcribe audio (Whisper)
3. Chunk by timestamps
4. Store with video URL + timestamp

**Result:** "Answer found at 2:34 in video"

**Libraries:** `whisper.cpp`, `openai/whisper`, `ffmpeg`

---

### 3. Web Scraping
- Crawl documentation sites
- Convert to markdown
- Auto-update when docs change

**Libraries:** `cheerio`, `puppeteer`, `scrapy`

---

## Monitoring & Analytics

### 1. Usage Tracking
- What questions are asked?
- Which docs are retrieved most?
- Answer quality ratings

### 2. Performance Metrics
- Query latency
- Embedding generation time
- LLM response time
- Cache hit rate

### 3. Quality Metrics
- Answer relevance (user feedback)
- Source accuracy (right chunks?)
- Confidence scores

---

## Testing

### 1. Unit Tests
- Test chunking logic
- Test similarity calculation
- Test embedding generation

### 2. Integration Tests
- End-to-end RAG pipeline
- Test with real docs

### 3. Evaluation Dataset
- Question-answer pairs
- Expected sources
- Automated quality testing

---

## Deployment

### 1. Docker
- Containerize app
- Include Ollama in container
- Easy deployment

### 2. API Server
- Expose as REST API
- Multiple clients (web, mobile, CLI)
- Authentication

### 3. Web UI
- React/Next.js frontend
- Same core package
- Better for non-technical users

---

## When to Implement?

**Priority 1 (After POC works):**
- Sentence-aware splitting
- Richer metadata
- Re-ranking

**Priority 2 (When scaling):**
- Database backend
- Multi-format support
- Monitoring

**Priority 3 (Feature expansion):**
- Confluence integration
- Video support
- Web UI

---

**Remember:** Get POC working first! Don't overengineer early.
