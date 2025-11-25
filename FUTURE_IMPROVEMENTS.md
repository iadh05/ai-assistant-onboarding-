# Future Improvements

This document tracks potential enhancements and optimizations to implement after the POC is complete and working.

---

## Web UI Enhancements (PRIORITY 1)

### 1. Conversation History
**Goal:** Persist chat conversations and allow users to resume previous discussions

**Features:**
- Save all conversations to localStorage (later: database)
- Display conversation list in sidebar
- Click to load previous conversation
- "New Chat" button to start fresh
- Auto-save on every message
- Delete conversation option

**Data Structure:**
```typescript
interface Conversation {
  id: string;                    // Unique ID
  title: string;                 // First user message (truncated)
  messages: Message[];           // Full conversation
  createdAt: number;             // Timestamp
  updatedAt: number;             // Last message time
}
```

**Storage:**
- Phase 1: localStorage (immediate)
- Phase 2: Database with user authentication

---

### 2. Sidebar Restructure
**Goal:** Simplify navigation - sidebar shows only conversation history

**Changes:**
- Remove "Knowledge Base" navigation item
- Remove "System Health" navigation item
- Sidebar displays list of conversations with:
  - Title (first message preview)
  - Timestamp (relative: "2 hours ago")
  - Active indicator for current conversation
- Move document upload and health check to settings/admin panel

**Rationale:**
- Chat is the main interface
- Document management is admin task (separate page/modal)
- Cleaner, focused UX

---

### 3. Document Upload in Chat Input
**Goal:** Upload documents without leaving chat interface

**Implementation:**
- Add file upload icon (📎 or similar) next to send button in chat input
- Click icon → file picker opens
- Support multiple file types: .txt, .md, .pdf, .docx
- Show upload progress in chat as system message
- Display success: "Document uploaded: 15 chunks added"
- Remove standalone "Knowledge Base" page from main navigation

**UX Flow:**
```
User clicks 📎 icon
→ File picker opens
→ User selects file(s)
→ Upload starts, progress shown in chat
→ "✓ Uploaded: company-policy.pdf (23 chunks)"
→ User can immediately ask questions about it
```

---

### 4. File Upload Support
**Goal:** Support multiple file formats beyond manual text entry

**Formats:**
- **.txt** - Plain text
- **.md** - Markdown (current)
- **.pdf** - Extract text using pdf-parse or pdfjs
- **.docx** - Extract text using mammoth.js
- **.html** - Convert to markdown using turndown

**Backend Changes:**
- REST Gateway accepts multipart/form-data
- Parse file based on extension
- Extract text content
- Send to Document Service as before

**Libraries:**
- `pdf-parse` or `pdfjs-dist` for PDF
- `mammoth` for DOCX
- `turndown` for HTML → Markdown

---

### 5. Streaming Responses (SSE)
**Goal:** Show LLM response word-by-word as it generates (like ChatGPT)

**What is SSE (Server-Sent Events)?**
- HTTP-based, one-way communication (Server → Client)
- Simpler than WebSockets
- Browser auto-reconnects on disconnect
- Perfect for streaming text from LLM

**Implementation:**
```typescript
// Server: Stream response chunks
app.get('/api/chat/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');

  llm.streamGenerate(prompt, (chunk) => {
    res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
  });
});

// Client: Receive and display chunks
const eventSource = new EventSource('/api/chat/stream');
eventSource.onmessage = (event) => {
  const { text } = JSON.parse(event.data);
  setAnswer(prev => prev + text); // Append each word
};
```

**Benefits:**
- User sees progress immediately
- Better perceived performance
- Modern chat experience
- No waiting for full response

**Note:** Ollama supports streaming - just need to wire it through REST Gateway

---

### 6. Authentication System
**Goal:** Multi-user support with secure access

**Features:**
- User registration and login
- JWT-based authentication
- Protected API endpoints
- Per-user conversation history
- Per-user document collections (optional)

**Tech Stack:**
- **Auth:** Passport.js, JWT
- **Password:** bcrypt for hashing
- **Sessions:** Redis or JWT tokens

**Database Schema:**
```sql
users:
  id, email, password_hash, created_at

conversations:
  id, user_id, title, created_at, updated_at

messages:
  id, conversation_id, role, content, timestamp
```

---

### 7. Database Integration
**Goal:** Replace JSON file storage with scalable database

**Why:**
- Multi-user support requires database
- Better performance for large datasets
- Proper relationships (users → conversations → messages)
- Transaction support
- Backup and recovery

**Options:**
- **PostgreSQL** - Best for structured data + pgvector for embeddings
- **MongoDB** - Good for document storage, has vector search
- **MySQL** - Alternative to Postgres

**Migration Strategy:**
```
Phase 1: Keep vector-store.json for embeddings
         Add DB for users/conversations/messages

Phase 2: Move embeddings to pgvector or Pinecone
         Full database architecture
```

---

### 8. Additional UI Improvements

**Clear Knowledge Base:**
- Button to delete all documents
- Confirm dialog: "Are you sure?"
- Useful for testing and fresh starts

**Document Statistics:**
- Show total documents
- Show total chunks
- Show storage size
- Show last updated time

**Better Source Display:**
- Expandable source cards
- Highlight relevant text within chunk
- Show similarity score as visual indicator
- Link to original document (if available)

**Toast Notifications:**
- Upload success/failure
- Network errors
- Helpful tips

**Dark Mode:**
- Theme toggle in settings
- Persist preference
- System preference detection

**Mobile Responsiveness:**
- Optimize for tablets and phones
- Collapsible sidebar
- Touch-friendly controls

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

## Production Logging & Error Handling

### 1. Structured Logging
**Goal:** Production-grade logging for debugging and monitoring

**Features:**
- **Log Levels:** DEBUG, INFO, WARN, ERROR
- **Structured Format:** JSON logs for parsing
- **Request Tracing:** Track requests across microservices
- **Context:** Include user ID, request ID, timestamps
- **Color-coded console** for development

**Implementation:**
```typescript
class Logger {
  private serviceName: string;
  private level: LogLevel;

  info(message: string, context?: LogContext): void {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      service: this.serviceName,
      message,
      ...context
    }));
  }

  error(message: string, error: Error, context?: LogContext): void {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      service: this.serviceName,
      message,
      error: error.message,
      stack: error.stack,
      ...context
    }));
  }
}

// Usage
const logger = createLogger('REST-Gateway');
logger.info('Request received', {
  requestId: 'req-123',
  method: 'POST',
  path: '/api/chat'
});
```

**Benefits:**
- Easy debugging in production
- Log aggregation with tools (ELK, Datadog, CloudWatch)
- Search and filter logs
- Track request flows across services

---

### 2. Request ID Tracing
**Goal:** Track requests through entire system

**Flow:**
```
Client Request → REST Gateway → gRPC Service → Database
     ↓              ↓              ↓              ↓
  req-abc-123   req-abc-123   req-abc-123   req-abc-123
```

**Implementation:**
```typescript
// Middleware to generate/propagate request ID
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || generateUUID();
  res.setHeader('x-request-id', req.id);
  next();
});

// Pass to gRPC metadata
const metadata = new grpc.Metadata();
metadata.set('request-id', req.id);

// Log with request ID
logger.info('Processing request', { requestId: req.id });
```

**Benefits:**
- Trace request through all services
- Debug issues in specific requests
- Measure end-to-end latency

---

### 3. Error Classification
**Goal:** Categorize and handle errors appropriately

**Error Types:**
```typescript
enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',     // 400 - Bad request
  AUTHENTICATION_ERROR = 'AUTH_ERROR',       // 401 - Unauthorized
  AUTHORIZATION_ERROR = 'AUTHZ_ERROR',       // 403 - Forbidden
  NOT_FOUND_ERROR = 'NOT_FOUND',            // 404 - Not found
  RATE_LIMIT_ERROR = 'RATE_LIMIT',          // 429 - Too many requests
  GRPC_ERROR = 'GRPC_ERROR',                // 500 - Backend failure
  DATABASE_ERROR = 'DATABASE_ERROR',         // 500 - DB failure
  EXTERNAL_API_ERROR = 'EXTERNAL_API',       // 502 - Third party failure
  TIMEOUT_ERROR = 'TIMEOUT',                // 504 - Request timeout
  UNKNOWN_ERROR = 'UNKNOWN'                 // 500 - Unknown
}

class AppError extends Error {
  constructor(
    public type: ErrorType,
    public message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
  }
}

// Usage
throw new AppError(
  ErrorType.VALIDATION_ERROR,
  'Question cannot be empty',
  400,
  { field: 'question' }
);
```

---

### 4. Global Error Handler
**Goal:** Centralized error handling for consistent responses

**Express Middleware:**
```typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = req.id;

  // Log error with context
  logger.error('Request failed', err, {
    requestId,
    path: req.path,
    method: req.method,
    userId: req.user?.id
  });

  // Determine status code
  let statusCode = 500;
  let errorType = 'INTERNAL_ERROR';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorType = err.type;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorType = 'VALIDATION_ERROR';
  } else if (isGrpcError(err)) {
    statusCode = mapGrpcToHttp(err.code);
    errorType = 'GRPC_ERROR';
  }

  // Send error response
  res.status(statusCode).json({
    error: {
      type: errorType,
      message: err.message,
      requestId,
      timestamp: new Date().toISOString(),
      // Only include stack in development
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});
```

---

### 5. Retry Logic with Exponential Backoff
**Goal:** Handle transient failures gracefully

**Implementation:**
```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      const isRetryable = isRetryableError(error);

      if (isLastAttempt || !isRetryable) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      logger.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms`, {
        error: error.message
      });

      await sleep(delay);
    }
  }

  throw new Error('Max retries exceeded');
}

// Usage
const response = await retryWithBackoff(() =>
  promisifyGrpcCall(chatClient, 'askQuestion', request)
);
```

**Retryable Errors:**
- Network timeouts
- 503 Service Unavailable
- gRPC UNAVAILABLE status
- Rate limit (429) - with longer backoff

**Non-retryable Errors:**
- 400 Bad Request (client error)
- 401 Unauthorized
- 404 Not Found
- 422 Validation Error

---

### 6. Circuit Breaker Pattern
**Goal:** Prevent cascade failures when service is down

**How It Works:**
```
States:
┌─────────┐  Too many failures  ┌──────┐  Timeout  ┌──────────┐
│ CLOSED  │ ──────────────────> │ OPEN │ ────────> │ HALF_OPEN│
│(Normal) │                     │(Fail │           │ (Testing)│
└─────────┘  <────────────────  │ fast)│  <──────  └──────────┘
              Success threshold  └──────┘  Success
```

**Implementation:**
```typescript
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private threshold: number = 5;        // Open after 5 failures
  private timeout: number = 60000;      // Try again after 60s

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      // Check if timeout elapsed
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();

      // Success: reset or close circuit
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failureCount = 0;
      }

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.threshold) {
        this.state = 'OPEN';
        logger.error('Circuit breaker opened', { service: 'ChatService' });
      }

      throw error;
    }
  }
}

// Usage
const breaker = new CircuitBreaker();
const response = await breaker.execute(() =>
  chatClient.askQuestion(request)
);
```

---

### 7. Health Checks with Dependencies
**Goal:** Report service health and dependencies status

**Enhanced Health Check:**
```typescript
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  dependencies: {
    [key: string]: {
      status: 'up' | 'down';
      latency?: number;
      lastCheck: string;
      error?: string;
    };
  };
}

app.get('/api/health', async (req, res) => {
  const startTime = Date.now();

  // Check all dependencies in parallel
  const [ollamaHealth, documentServiceHealth, chatServiceHealth] =
    await Promise.allSettled([
      checkOllama(),
      checkGrpcService(documentClient),
      checkGrpcService(chatClient)
    ]);

  const dependencies = {
    ollama: mapHealthResult(ollamaHealth),
    documentService: mapHealthResult(documentServiceHealth),
    chatService: mapHealthResult(chatServiceHealth)
  };

  // Determine overall status
  const allUp = Object.values(dependencies).every(d => d.status === 'up');
  const anyDown = Object.values(dependencies).some(d => d.status === 'down');

  const status: HealthStatus = {
    status: anyDown ? 'unhealthy' : allUp ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.APP_VERSION || '1.0.0',
    dependencies
  };

  const statusCode = status.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(status);
});
```

---

### 8. Request/Response Logging
**Goal:** Log all API requests for debugging and analytics

**Middleware:**
```typescript
app.use((req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.info('Request started', {
    requestId: req.id,
    method: req.method,
    path: req.path,
    query: req.query,
    userAgent: req.headers['user-agent'],
    ip: req.ip
  });

  // Capture response
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    logger.info('Request completed', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration
    });
  });

  next();
});
```

---

### 9. Error Monitoring Integration
**Goal:** Send errors to monitoring services

**Services:**
- **Sentry** - Error tracking and alerting
- **Datadog** - APM and logging
- **New Relic** - Performance monitoring
- **CloudWatch** - AWS logging

**Sentry Integration:**
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

// Capture errors
app.use((err, req, res, next) => {
  Sentry.captureException(err, {
    tags: {
      service: 'rest-gateway',
      path: req.path
    },
    user: {
      id: req.user?.id,
      ip_address: req.ip
    }
  });

  next(err);
});
```

---

### 10. Rate Limiting
**Goal:** Prevent abuse and protect services

**Implementation:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });

    res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

app.use('/api/', limiter);
```

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

**Priority 1 (Immediate - Web UI):**
- ✅ Conversation history with localStorage
- ✅ Sidebar restructure (conversation list only)
- ✅ Document upload in chat input (file icon)
- ✅ File upload support (.txt, .md, .pdf, .docx)
- ✅ SSE streaming responses

**Priority 2 (Multi-user Support):**
- Authentication system (JWT)
- Database integration (PostgreSQL)
- Per-user conversations and documents

**Priority 3 (Enhanced RAG):**
- Sentence-aware splitting
- Richer metadata
- Re-ranking
- Query expansion

**Priority 4 (Scaling & Performance):**
- Vector database (Pinecone/Chroma)
- Multi-format support (Strategy pattern)
- Monitoring and analytics

**Priority 5 (Advanced Features):**
- Confluence integration
- Video/audio support
- Web scraping

---

**Current Status:** POC working ✅ → Now implementing Priority 1 web enhancements

**Next Steps:**
1. Implement conversation history
2. Restructure sidebar
3. Add file upload to chat
4. Wire up SSE streaming
5. Then move to authentication + database

---

## Smart Learning & Onboarding Features (TUTOR MODE)

### 1. Multi-turn Conversation Context
**Problem:** Current system treats each question independently

**Solution:** Maintain conversation context for follow-up questions
```typescript
// User: "What are your business hours?"
// Assistant: "Monday-Friday, 9AM-5PM EST"
// User: "What about holidays?" ← Needs context: "your" = business
// Assistant: Uses previous context to understand reference
```

**Implementation:**
- Store last N messages in context
- Include in prompt to LLM
- Resolve pronouns (it, that, them) using context
- Handle follow-ups: "tell me more", "explain that", "give an example"

**Benefits:**
- Natural conversation flow
- No need to repeat context
- Better user experience

---

### 2. Suggested Follow-up Questions
**Goal:** Guide users to explore related topics

**Implementation:**
After answering, suggest 3 related questions:
```
Answer: "Our return policy allows 30 days..."

💡 You might also want to know:
  → What condition do items need to be in?
  → How long does refund processing take?
  → What items are non-returnable?
```

**Benefits:**
- Helps users discover information they didn't know to ask
- Encourages exploration
- Reduces "what should I ask?" friction

---

### 3. Interactive Tutorials & Step-by-Step Guides
**Goal:** Transform documentation into guided learning experiences

**Features:**
- **Progress Tracking:** Mark steps as complete
- **Code Examples:** Executable snippets with explanations
- **Prerequisites:** "Before starting, make sure you've completed X"
- **Estimated Time:** "This tutorial takes ~15 minutes"
- **Checkpoints:** Quiz questions to verify understanding

**Example:**
```
📚 Tutorial: Setting Up Your Development Environment
⏱️ 15 minutes | ✅ Prerequisites: None

Step 1/5: Install Node.js
[Detailed instructions...]
✓ Mark as complete

💭 Quick Check: What command verifies Node.js installation?
   a) node -v  b) npm check  c) node test
```

---

### 4. Smart Question Suggestions & Autocomplete
**Goal:** Help users formulate better questions

**Implementation:**
- Show popular questions as user types
- Categorize by topic (Getting Started, Troubleshooting, etc.)
- "People also ask..." based on current conversation

**UI:**
```
User types: "How do I..."

Suggestions appear:
  📌 How do I reset my password?
  📌 How do I update my profile?
  📌 How do I contact support?
  📋 Getting Started (12 common questions)
```

---

### 5. Confidence Scores & Uncertain Answers
**Goal:** Be honest when answer might not be accurate

**Implementation:**
```typescript
interface ChatResponse {
  answer: string;
  confidence: number;  // 0-1 score
  sources: Chunk[];
}

// Low confidence (< 0.5)
if (confidence < 0.5) {
  return `I'm not entirely sure, but based on the documentation:
  ${answer}

  ⚠️ This answer has low confidence. Would you like to:
  → Rephrase your question
  → Contact human support
  → Search specific documents`;
}
```

**Benefits:**
- Builds trust (honest about limitations)
- Prevents misinformation
- Guides users to better resources

---

### 6. Citation with Highlighted Excerpts
**Goal:** Show exact source text that supports the answer

**Current:** Just shows source chunks

**Enhanced:**
```
Answer: "Our business hours are Monday-Friday, 9AM-5PM EST"

📄 Source: company-info.md (Section: Contact)
┌─────────────────────────────────────────┐
│ TechShop operates Monday through Friday │
│ from **9:00 AM to 5:00 PM Eastern      │ ← Highlighted
│ Standard Time (EST)**. We are closed    │
│ on major holidays.                      │
└─────────────────────────────────────────┘
Similarity: 94%
```

**Implementation:**
- Use fuzzy string matching to find relevant excerpt
- Highlight with markdown bold or different color
- Show ±2 sentences for context

---

### 7. Role-Based Knowledge Filtering
**Goal:** Personalize content based on user role

**Roles:**
- New Employee (onboarding basics)
- Developer (technical docs, APIs)
- Designer (design system, assets)
- Manager (policies, processes)
- Support (troubleshooting, FAQs)

**Implementation:**
```typescript
// Filter documents by role before searching
vectorStore.search(query, {
  topK: 5,
  filters: {
    roles: ['new-employee', 'all'],  // Include docs tagged for role
    difficulty: ['beginner', 'intermediate']
  }
});
```

**Metadata:**
```typescript
metadata: {
  roles: ['developer', 'designer'],
  difficulty: 'advanced',
  tags: ['api', 'authentication']
}
```

---

### 8. Learning Paths & Progress Tracking
**Goal:** Structured onboarding journey with milestones

**Features:**
- Pre-defined learning paths: "New Developer Onboarding"
- Track completed topics
- Show progress bar (3/10 topics completed)
- Unlock advanced topics after basics
- Certificates/badges on completion

**Example Path:**
```
🎯 New Developer Onboarding
Progress: ████░░░░░░ 40%

✅ 1. Company Overview
✅ 2. Setting Up Dev Environment
✅ 3. Code Style Guide
▶️ 4. Git Workflow (In Progress)
🔒 5. CI/CD Pipeline (Locked - Complete #4 first)
🔒 6. Deploying to Production
```

---

### 9. Gap Analysis & Unanswered Questions
**Goal:** Identify documentation gaps to improve content

**Track:**
- Questions that get low confidence answers
- Questions that users rate as "not helpful"
- Topics frequently asked but not well-documented
- Search terms with no relevant results

**Admin Dashboard:**
```
📊 Documentation Gaps (Last 30 days)

❌ 15 questions about "remote work policy" (not documented)
⚠️ 12 questions about "benefits" (low confidence answers)
💡 8 questions about "promotion process" (no matching docs)

Suggested Actions:
→ Create "Remote Work Guide"
→ Expand benefits documentation
→ Add career development section
```

---

### 10. Export & Share Conversations
**Goal:** Share valuable conversations with teammates

**Features:**
- Export to PDF/Markdown/JSON
- Generate shareable link (with expiration)
- Email conversation transcript
- Copy as formatted text

**Use Cases:**
- New employee shares onboarding journey
- Developer shares solution to common problem
- Create documentation from Q&A sessions

---

### 11. Voice Input & Text-to-Speech
**Goal:** Accessibility and hands-free learning

**Implementation:**
- Web Speech API for voice input
- Text-to-speech for reading answers aloud
- Useful for:
  - Accessibility (vision impairment)
  - Multitasking (listen while working)
  - Mobile users

```typescript
// Voice input
const recognition = new webkitSpeechRecognition();
recognition.onresult = (event) => {
  const question = event.results[0][0].transcript;
  askQuestion(question);
};

// Text-to-speech
const utterance = new SpeechSynthesisUtterance(answer);
speechSynthesis.speak(utterance);
```

---

### 12. Slack/Teams Integration
**Goal:** Meet users where they work

**Features:**
- Slack bot: `/ask How do I submit expenses?`
- Direct messages with chatbot
- Share answers to channels
- Daily tips/reminders
- Notifications for new documentation

**Example:**
```
User in Slack: /ask What are our company values?
Bot: 🤖 Our company values are...
     [View Full Answer] [Rate Answer] [Ask Follow-up]
```

---

### 13. Search Within Conversations
**Goal:** Find information from past discussions

**Features:**
- Full-text search across all conversations
- Filter by date range
- Filter by topic/tag
- Highlight search terms in results

**UI:**
```
🔍 Search conversations: "reset password"

Found in 3 conversations:
─────────────────────────────────────────
💬 Account Setup (2 days ago)
   Q: How do I reset my password?
   A: Navigate to Settings > Security...

💬 Troubleshooting (1 week ago)
   Q: Can't access my account
   A: Try resetting your password...
```

---

### 14. Feedback & Rating System
**Goal:** Continuously improve answer quality

**Features:**
- 👍/👎 on each answer
- Optional comment: "What was wrong?"
- "Was this helpful?" follow-up
- Track metrics over time

**Use Feedback For:**
- Retrain/adjust prompts
- Identify documentation gaps
- Improve chunking strategy
- A/B test different LLMs

**Analytics:**
```
📈 Answer Quality Metrics (Last 30 days)

👍 Helpful: 87% (234 responses)
👎 Not Helpful: 13% (35 responses)

Top Complaints:
- Answer too vague (12)
- Wrong information (8)
- Missing context (7)
```

---

### 15. Multi-language Support
**Goal:** Support global teams

**Implementation:**
- Detect user language
- Translate query to English
- Search English documentation
- Translate answer back to user language

**Libraries:**
- Google Translate API
- DeepL API
- OpenAI GPT for translation

**Benefit:** Single source of truth (English docs), accessible worldwide

---

### 16. Code Playground Integration
**Goal:** Let users try code examples directly in chat

**Features:**
- Embedded code editor (Monaco/CodeMirror)
- Run button for JavaScript/Python/etc.
- Show output inline
- Save examples to favorites

**Example:**
```
User: "Show me how to make an API call"