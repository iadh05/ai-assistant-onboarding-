import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the protobuf definition from @onboarding/contracts package
const PROTO_PATH = join(__dirname, '../../../packages/contracts/proto/chat.proto');

console.log('Loading proto from:', PROTO_PATH);

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const chatProto = grpc.loadPackageDefinition(packageDefinition).chatbot as any;

// Create gRPC client
const HOST = 'localhost';
const PORT = '50051';

console.log(`Connecting to ${HOST}:${PORT}...`);

const client = new chatProto.ChatService(
  `${HOST}:${PORT}`,
  grpc.credentials.createInsecure()
);

console.log('Client created');

// Health check only
client.healthCheck({}, (error: any, response: any) => {
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  console.log('Health Check Response:');
  console.log('  Status:', response.status);
  console.log('  LLM Model:', response.llm_model);
  console.log('  Embedding Model:', response.embedding_model);
  console.log('\n✅ gRPC communication working!');
  process.exit(0);
});

console.log('Health check request sent, waiting for response...');
