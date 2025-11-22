import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

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

console.log('🌐 Gateway connecting to backend services:');
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

// Gateway implementation - proxies requests to backend services
const documentServiceImpl = {
  addDocuments(call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) {
    console.log('[Gateway] Proxying AddDocuments to Document Service');
    documentClient.addDocuments(call.request, callback);
  },
};

const chatServiceImpl = {
  askQuestion(call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) {
    console.log('[Gateway] Proxying AskQuestion to Chat Service');
    chatClient.askQuestion(call.request, callback);
  },
};

const systemServiceImpl = {
  healthCheck(call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) {
    console.log('[Gateway] Proxying HealthCheck to System Service');
    systemClient.healthCheck(call.request, callback);
  },
};

// Start gateway server
function startGateway() {
  const server = new grpc.Server();

  // Register ALL services on the gateway
  server.addService(proto.DocumentService.service, documentServiceImpl);
  server.addService(proto.ChatService.service, chatServiceImpl);
  server.addService(proto.SystemService.service, systemServiceImpl);

  const PORT = process.env.GATEWAY_PORT || '8080';
  const HOST = process.env.GRPC_HOST || '0.0.0.0';

  server.bindAsync(
    `${HOST}:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('[Gateway] Failed to start:', error);
        process.exit(1);
      }
      console.log(`\n🌐 API Gateway running on ${HOST}:${port}`);
      console.log(`   Client connects to: localhost:${port}`);
      console.log(`   Gateway routes to backend microservices\n`);
    }
  );
}

startGateway();
