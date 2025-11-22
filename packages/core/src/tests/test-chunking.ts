import { ChunkingService } from '../chunking.js';

const sampleDoc = `# Getting Started

## Installation

To install Node.js, visit nodejs.org.
Download the installer for your OS.
Run the installer and follow prompts.

## Configuration

After installing, configure your PATH.
Open terminal and type: node --version
This verifies the installation.

## First Project

Create a folder: mkdir my-project
Navigate: cd my-project
Initialize: npm init`;

console.log('Testing Chunking Service...\n');

const chunker = new ChunkingService();
const chunks = chunker.chunkDocument(sampleDoc, 'getting-started.md');

console.log(`Total chunks: ${chunks.length}\n`);

chunks.forEach((chunk, i) => {
  console.log(`--- Chunk ${i + 1} ---`);
  console.log(`ID: ${chunk.id}`);
  console.log(`Heading: ${chunk.metadata.heading || 'No heading'}`);
  console.log(`Text length: ${chunk.text.length} chars`);
  console.log(`Preview: ${chunk.text.substring(0, 100)}...`);
  console.log();
});

console.log('✅ Chunking test complete!');
