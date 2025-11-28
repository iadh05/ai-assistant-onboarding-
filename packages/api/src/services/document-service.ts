import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import { VectorStore, ChunkingService } from '@onboarding/core';
import { cacheEventBus } from '@onboarding/events';
import { OllamaEmbeddingProvider } from '@onboarding/llm';

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

// Initialize document services
const embeddingProvider = new OllamaEmbeddingProvider();
const vectorStorePath = process.env.VECTOR_STORE_PATH || './vector-store.json';
const vectorStore = new VectorStore(embeddingProvider, vectorStorePath);

const maxChunkSize = parseInt(process.env.MAX_CHUNK_SIZE || '1000', 10);
const chunkOverlap = parseInt(process.env.CHUNK_OVERLAP || '200', 10);
const chunkingService = new ChunkingService(maxChunkSize, chunkOverlap);

// Load existing vector store
await vectorStore.load().catch(() => {
  console.log('[Document Service] No existing vector store found, starting fresh');
});

// Document service implementation
const documentServiceImpl = {
  async addDocuments(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ) {
    try {
      const { documents } = call.request;
      console.log(`[Document Service] Adding ${documents.length} document(s)`);

      let totalChunks = 0;
      const documentIds: string[] = [];

      for (const doc of documents) {
        const chunks = chunkingService.chunkDocument(doc.content, doc.source);
        await vectorStore.addChunks(chunks);
        totalChunks += chunks.length;
        documentIds.push(doc.source);
      }

      await vectorStore.save();
      console.log(`[Document Service] Added ${totalChunks} chunks`);

      // Emit event to notify subscribers (e.g., ChatService) to clear cache
      cacheEventBus.emitDocumentsChanged('DocumentService');

      callback(null, {
        chunks_added: totalChunks,
        message: `Successfully added ${documents.length} document(s) as ${totalChunks} chunks`,
        document_ids: documentIds,
      });
    } catch (error) {
      console.error('[Document Service] Error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async clearDocuments(
    _call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.sendUnaryData<any>
  ) {
    try {
      console.log('[Document Service] Clearing all documents...');
      const chunksRemoved = await vectorStore.clearAll();
      console.log(`[Document Service] Cleared ${chunksRemoved} chunks`);

      // Emit event to notify subscribers
      cacheEventBus.emitDocumentsChanged('DocumentService');

      callback(null, {
        chunks_removed: chunksRemoved,
        message: `Successfully cleared ${chunksRemoved} chunks`,
      });
    } catch (error) {
      console.error('[Document Service] Error:', error);
      callback({
        code: grpc.status.INTERNAL,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
};

// Start document service
function startServer() {
  const server = new grpc.Server();
  server.addService(proto.DocumentService.service, documentServiceImpl);

  const PORT = process.env.DOCUMENT_SERVICE_PORT || '50051';
  const HOST = process.env.GRPC_HOST || '0.0.0.0';

  server.bindAsync(
    `${HOST}:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('[Document Service] Failed to start:', error);
        process.exit(1);
      }
      console.log(`📄 Document Service running on ${HOST}:${port}`);
    }
  );
}

startServer();
