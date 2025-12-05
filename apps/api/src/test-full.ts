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

const client = new chatProto.ChatService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

async function runTests() {
  console.log('=== Testing gRPC RAG Chatbot ===\n');

  // Test 1: Health Check
  console.log('1. Health Check...');
  await new Promise<void>((resolve, reject) => {
    client.healthCheck({}, (error: any, response: any) => {
      if (error) reject(error);
      else {
        console.log(`   ✓ Status: ${response.status}`);
        console.log(`   ✓ LLM: ${response.llm_model}`);
        console.log(`   ✓ Embedding: ${response.embedding_model}\n`);
        resolve();
      }
    });
  });

  // Test 2: Add Document
  console.log('2. Adding sample document...');
  await new Promise<void>((resolve, reject) => {
    client.addDocuments(
      {
        documents: [
          {
            content: `# Getting Started

## Installation

To install Node.js, visit nodejs.org and download the installer for your operating system.

## First Project

Create your first Node.js project with npm init.`,
            source: 'getting-started.md',
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

  // Test 3: Ask Question
  console.log('3. Asking question: "How do I install Node.js?"');
  await new Promise<void>((resolve, reject) => {
    client.askQuestion(
      {
        question: 'How do I install Node.js?',
        top_k: 5,
      },
      (error: any, response: any) => {
        if (error) reject(error);
        else {
          console.log(`\n   Answer: ${response.answer}`);
          console.log(`\n   Sources used (${response.sources.length}):`);
          response.sources.forEach((source: any, i: number) => {
            console.log(`     ${i + 1}. [${source.source}] ${source.heading}`);
          });
          console.log();
          resolve();
        }
      }
    );
  });

  console.log('✅ All tests passed!\n');
  process.exit(0);
}

runTests().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
