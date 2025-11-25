import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import { ChatService, VectorStore } from '@onboarding/core';
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

// Initialize chat services
const embeddingProvider = new OllamaEmbeddingProvider();
const llmProvider = new OllamaLLMProvider();

const vectorStorePath = process.env.VECTOR_STORE_PATH || './vector-store.json';
const vectorStore = new VectorStore(embeddingProvider, vectorStorePath);
const chatService = new ChatService(vectorStore, llmProvider);

// Load existing vector store
await vectorStore.load().catch(() => {
  console.log('[Chat Service] No existing vector store found');
});

// Chat service implementation
const chatServiceImpl = {
  async askQuestion(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ) {
    try {
      const { question } = call.request;
      console.log(`[Chat Service] Question: ${question}`);

      // Smart reload: only reload if file has changed (checks mtime)
      // This avoids expensive disk I/O on every query
      const reloaded = await vectorStore.reloadIfChanged();
      if (reloaded) {
        console.log(`[Chat Service] Vector store reloaded (${vectorStore.getChunkCount()} chunks)`);
      }

      const response = await chatService.ask(question);

      const reply = {
        answer: response.answer,
        sources: response.sources.map((chunk) => ({
          chunk_id: chunk.id,
          text: chunk.text,
          source: chunk.metadata.source,
          heading: chunk.metadata.heading || '',
        })),
      };

      callback(null, reply);
    } catch (error) {
      console.error('[Chat Service] Error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
};

// Start chat service
function startServer() {
  const server = new grpc.Server();
  server.addService(proto.ChatService.service, chatServiceImpl);

  const PORT = process.env.CHAT_SERVICE_PORT || '50052';
  const HOST = process.env.GRPC_HOST || '0.0.0.0';

  server.bindAsync(
    `${HOST}:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('[Chat Service] Failed to start:', error);
        process.exit(1);
      }
      console.log(`💬 Chat Service running on ${HOST}:${port}`);
      console.log(`📚 LLM Model: ${llmProvider.getModelName()}`);
    }
  );
}

startServer();
