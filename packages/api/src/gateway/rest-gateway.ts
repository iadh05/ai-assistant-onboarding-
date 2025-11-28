import express from 'express';
import cors from 'cors';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import { createHealthRoutes, createChatRoutes, createDocumentRoutes } from './routes/index.js';

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

// Service URLs
const DOCUMENT_SERVICE_URL = process.env.DOCUMENT_SERVICE_URL || 'localhost:50051';
const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || 'localhost:50052';
const SYSTEM_SERVICE_URL = process.env.SYSTEM_SERVICE_URL || 'localhost:50053';

console.log('🌐 REST Gateway configuration:');
console.log(`   📄 Document Service: ${DOCUMENT_SERVICE_URL}`);
console.log(`   💬 Chat Service: ${CHAT_SERVICE_URL}`);
console.log(`   ⚙️  System Service: ${SYSTEM_SERVICE_URL}`);

// gRPC clients
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

function promisifyGrpcCall(client: any, method: string, request: any): Promise<any> {
  return new Promise((resolve, reject) => {
    client[method](request, (error: any, response: any) => {
      if (error) reject(error);
      else resolve(response);
    });
  });
}

// CORS config
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

const corsOptions: cors.CorsOptions = {
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Express app
const app = express();

app.use(cors(corsOptions));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Mount routes
app.use('/api/health', createHealthRoutes(systemClient, promisifyGrpcCall));
app.use('/api/chat', createChatRoutes(chatClient, promisifyGrpcCall));
app.use('/api/documents', createDocumentRoutes(documentClient, promisifyGrpcCall));

// Error handling
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
    console.log(`      GET  /api/health           - Health check`);
    console.log(`      POST /api/chat             - Ask a question`);
    console.log(`      POST /api/documents        - Add documents (JSON)`);
    console.log(`      POST /api/documents/upload - Upload file (multipart)`);
  });
}

startRestGateway();
