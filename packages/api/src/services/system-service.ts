import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import { OllamaLLMProvider, OllamaEmbeddingProvider } from '@onboarding/llm';

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

// Initialize providers for health check
const llmProvider = new OllamaLLMProvider();
const embeddingProvider = new OllamaEmbeddingProvider();

// System service implementation
const systemServiceImpl = {
  async healthCheck(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ) {
    console.log('[System Service] Health check requested');

    callback(null, {
      status: 'OK',
      llm_model: llmProvider.getModelName(),
      embedding_model: embeddingProvider.getModelName(),
    });
  },
};

// Start system service
function startServer() {
  const server = new grpc.Server();
  server.addService(proto.SystemService.service, systemServiceImpl);

  const PORT = process.env.SYSTEM_SERVICE_PORT || '50053';
  const HOST = process.env.GRPC_HOST || '0.0.0.0';

  server.bindAsync(
    `${HOST}:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('[System Service] Failed to start:', error);
        process.exit(1);
      }
      console.log(`⚙️  System Service running on ${HOST}:${port}`);
    }
  );
}

startServer();
