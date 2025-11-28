import express from 'express';
import cors from 'cors';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import { handleGrpcError } from './errors';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../../../..');
config({ path: join(rootDir, '.env') });

// Load proto
const PROTO_PATH = join(__dirname, '../../../contracts/proto/chat.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = (grpc.loadPackageDefinition(packageDefinition) as any)
  .onboarding.chatbot.v1;

// Service URLs (backend microservices)
const DOCUMENT_SERVICE_URL = process.env.DOCUMENT_SERVICE_URL || 'localhost:50051';
const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || 'localhost:50052';
const SYSTEM_SERVICE_URL = process.env.SYSTEM_SERVICE_URL || 'localhost:50053';

console.log('🌐 REST Gateway configuration:');
console.log(`   📄 Document Service: ${DOCUMENT_SERVICE_URL}`);
console.log(`   💬 Chat Service: ${CHAT_SERVICE_URL}`);
console.log(`   ⚙️  System Service: ${SYSTEM_SERVICE_URL}`);

// Create gRPC clients to backend services
const documentClient = new proto.DocumentService(
  DOCUMENT_SERVICE_URL,
  grpc.credentials.createInsecure()
);

const chatClient = new proto.ChatService(
  CHAT_SERVICE_URL,
  grpc.credentials.createInsecure()
);

const systemClient = new proto.SystemService(
  SYSTEM_SERVICE_URL,
  grpc.credentials.createInsecure()
);

// Helper to promisify gRPC calls
function promisifyGrpcCall(client: any, method: string, request: any): Promise<any> {
  return new Promise((resolve, reject) => {
    client[method](request, (error: any, response: any) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

// CORS configuration
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

const corsOptions: cors.CorsOptions = {
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Create Express app
const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// REST API Routes

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    console.log('[REST Gateway] Health check requested');
    const response = await promisifyGrpcCall(systemClient, 'healthCheck', {});
    res.json(response);
  } catch (error) {
    handleGrpcError(res, error, 'Health check failed');
  }
});

// Ask Question (Chat)
app.post('/api/chat', async (req, res) => {
  try {
    const { question, top_k = 5 } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required', message: 'Please enter a question.' });
    }

    console.log(`[REST Gateway] Chat request: "${question}"`);
    const response = await promisifyGrpcCall(chatClient, 'askQuestion', {
      question,
      top_k,
    });

    res.json(response);
  } catch (error) {
    handleGrpcError(res, error, 'Chat request failed');
  }
});

// Add Documents
app.post('/api/documents', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !Array.isArray(content) || content.length === 0) {
      return res.status(400).json({
        error: 'Invalid content',
        message: 'Please provide at least one document to add.'
      });
    }

    console.log(`[REST Gateway] Adding ${content.length} document(s)`);

    // Transform array of strings to array of Document objects for gRPC
    const documents = content.map((docContent, index) => ({
      content: docContent,
      source: `document-${index + 1}`,
    }));

    const response = await promisifyGrpcCall(documentClient, 'addDocuments', {
      documents,
    });

    res.json(response);
  } catch (error) {
    handleGrpcError(res, error, 'Failed to add documents');
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[REST Gateway] Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
function startRestGateway() {
  const PORT = parseInt(process.env.GATEWAY_PORT || '8080', 10);
  const HOST = process.env.REST_HOST || '0.0.0.0';

  app.listen(PORT, HOST, () => {
    console.log(`\n🚀 REST API Gateway running on http://${HOST}:${PORT}`);
    console.log(`   🔒 CORS Origin: ${CORS_ORIGIN}`);
    console.log(`   📍 Endpoints:`);
    console.log(`      GET  /api/health      - Health check`);
    console.log(`      POST /api/chat        - Ask a question`);
    console.log(`      POST /api/documents   - Add documents`);
  });
}

startRestGateway();
