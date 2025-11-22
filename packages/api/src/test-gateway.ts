import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the protobuf definition from @onboarding/contracts package
const PROTO_PATH = join(__dirname, '../../contracts/proto/chat.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = (grpc.loadPackageDefinition(packageDefinition) as any)
  .onboarding.chatbot.v1;

// Client connects to GATEWAY only (not individual services!)
const GATEWAY_URL = 'localhost:8080';

console.log(`🌐 Connecting to API Gateway: ${GATEWAY_URL}`);
console.log('   (Gateway will route to backend microservices)\n');

// Create clients to gateway
const documentClient = new proto.DocumentService(
  GATEWAY_URL,
  grpc.credentials.createInsecure()
);

const chatClient = new proto.ChatService(
  GATEWAY_URL,
  grpc.credentials.createInsecure()
);

const systemClient = new proto.SystemService(
  GATEWAY_URL,
  grpc.credentials.createInsecure()
);

async function runTests() {
  console.log('=== Testing Microservices via Gateway ===\n');

  // Test 1: Health Check (via System Service)
  console.log('1. Health Check (System Service via Gateway)...');
  await new Promise<void>((resolve, reject) => {
    systemClient.healthCheck({}, (error: any, response: any) => {
      if (error) reject(error);
      else {
        console.log(`   ✓ Status: ${response.status}`);
        console.log(`   ✓ LLM: ${response.llm_model}`);
        console.log(`   ✓ Embedding: ${response.embedding_model}\n`);
        resolve();
      }
    });
  });

  // Test 2: Add Document (via Document Service)
  console.log('2. Adding document (Document Service via Gateway)...');
  await new Promise<void>((resolve, reject) => {
    documentClient.addDocuments(
      {
        documents: [
          {
            content: `# Microservices Guide

## What are Microservices?

Microservices are small, independent services that work together.

## Benefits

- Independent deployment
- Easier to scale
- Technology flexibility`,
            source: 'microservices-guide.md',
          },
        ],
      },
      (error: any, response: any) => {
        if (error) reject(error);
        else {
          console.log(`   ✓ ${response.message}\n`);
          resolve();
        }
      }
    );
  });

  // Test 3: Ask Question (via Chat Service)
  console.log('3. Asking question (Chat Service via Gateway)...');
  await new Promise<void>((resolve, reject) => {
    chatClient.askQuestion(
      {
        question: 'What are microservices?',
        top_k: 5,
      },
      (error: any, response: any) => {
        if (error) reject(error);
        else {
          console.log(`\n   Answer: ${response.answer}`);
          console.log(`\n   Sources (${response.sources.length}):`);
          response.sources.forEach((source: any, i: number) => {
            console.log(`     ${i + 1}. [${source.source}] ${source.heading}`);
          });
          console.log();
          resolve();
        }
      }
    );
  });

  console.log('✅ All microservices working via Gateway!\n');
  console.log('Key Learning:');
  console.log('  - Client connected to ONE address (localhost:8080)');
  console.log('  - Gateway routed requests to 3 different services:');
  console.log('    • Document Service (port 50051)');
  console.log('    • Chat Service (port 50052)');
  console.log('    • System Service (port 50053)');
  console.log('  - Client doesn\'t know about backend services!');

  process.exit(0);
}

runTests().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
