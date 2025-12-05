import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the protobuf definition from @onboarding/contracts package
const PROTO_PATH = join(__dirname, '../../../packages/contracts/proto/chat.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const chatProto = grpc.loadPackageDefinition(packageDefinition).chatbot as any;

// Create gRPC client
const HOST = process.env.GRPC_HOST || 'localhost';
const PORT = process.env.GRPC_PORT || '50051';

const client = new chatProto.ChatService(
  `${HOST}:${PORT}`,
  grpc.credentials.createInsecure()
);

// Helper function to promisify gRPC calls
function promisifyCall(method: string, request: any): Promise<any> {
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

// Example usage
async function testClient() {
  try {
    // 1. Health Check
    console.log('--- Health Check ---');
    const health = await promisifyCall('healthCheck', {});
    console.log('Status:', health.status);
    console.log('LLM Model:', health.llm_model);
    console.log('Embedding Model:', health.embedding_model);

    // 2. Add sample document
    console.log('\n--- Adding Document ---');
    const addResult = await promisifyCall('addDocuments', {
      documents: [
        {
          content: `# Getting Started

## Installation

To install Node.js, visit nodejs.org and download the installer.

## First Project

Create your first Node.js project with npm init.`,
          source: 'getting-started.md',
        },
      ],
    });
    console.log(addResult.message);

    // 3. Ask a question
    console.log('\n--- Asking Question ---');
    const answer = await promisifyCall('askQuestion', {
      question: 'How do I install Node.js?',
      top_k: 5,
    });
    console.log('Answer:', answer.answer);
    console.log('\nSources:');
    answer.sources.forEach((source: any, i: number) => {
      console.log(`  ${i + 1}. ${source.source} - ${source.heading}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testClient().catch(console.error);
}

export { client, promisifyCall };
