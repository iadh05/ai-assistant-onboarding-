/**
 * Test: Semantic Caching Risk
 *
 * This demonstrates why semantic caching is risky:
 * Similar embeddings don't always mean same answer!
 *
 * Run: npx tsx packages/core/src/tests/test-semantic-risk.ts
 */

import { OllamaEmbeddingProvider } from '@onboarding/llm';
import { cosineSimilarity } from '../utils/similarity.js';

const embeddingProvider = new OllamaEmbeddingProvider();

// Test pairs: [query1, query2, shouldBeSameAnswer]
const testPairs: [string, string, boolean][] = [
  // DANGEROUS: High similarity but DIFFERENT answers
  ["How to delete my account?", "How to create my account?", false],
  ["How to enable dark mode?", "How to disable dark mode?", false],
  ["How to start the server?", "How to stop the server?", false],
  ["Minimum PC requirements?", "Maximum PC requirements?", false],
  ["How to add a user?", "How to remove a user?", false],

  // SAFE: High similarity AND same answer
  ["What is onboarding?", "Explain onboarding", true],
  ["PC requirements?", "System requirements?", true],
  ["How to reset password?", "Forgot my password", true],
  ["Contact support", "How to reach support?", true],
];

async function runTests() {
  console.log("\n🧪 SEMANTIC CACHING RISK TEST\n");
  console.log("=" .repeat(80));
  console.log("Testing if similar embeddings = same answer (spoiler: NOT ALWAYS!)\n");

  const results: { query1: string; query2: string; similarity: number; shouldBeSame: boolean; wouldCacheHit: boolean }[] = [];

  for (const [query1, query2, shouldBeSame] of testPairs) {
    const embedding1 = await embeddingProvider.generateEmbedding(query1);
    const embedding2 = await embeddingProvider.generateEmbedding(query2);

    const similarity = cosineSimilarity(embedding1, embedding2);
    const wouldCacheHit = similarity > 0.90; // Common threshold

    results.push({ query1, query2, similarity, shouldBeSame, wouldCacheHit });
  }

  // Display results
  console.log("DANGEROUS PAIRS (high similarity, different answers):");
  console.log("-".repeat(80));

  for (const r of results.filter(r => !r.shouldBeSame)) {
    const status = r.wouldCacheHit ? "❌ WRONG CACHE HIT" : "✅ Correctly missed";
    console.log(`\nQ1: "${r.query1}"`);
    console.log(`Q2: "${r.query2}"`);
    console.log(`Similarity: ${(r.similarity * 100).toFixed(1)}%`);
    console.log(`With 0.90 threshold: ${status}`);
  }

  console.log("\n" + "=".repeat(80));
  console.log("\nSAFE PAIRS (high similarity, same answer):");
  console.log("-".repeat(80));

  for (const r of results.filter(r => r.shouldBeSame)) {
    const status = r.wouldCacheHit ? "✅ Correct cache hit" : "⚠️ Missed opportunity";
    console.log(`\nQ1: "${r.query1}"`);
    console.log(`Q2: "${r.query2}"`);
    console.log(`Similarity: ${(r.similarity * 100).toFixed(1)}%`);
    console.log(`With 0.90 threshold: ${status}`);
  }

  // Summary
  console.log("\n" + "=".repeat(80));
  console.log("\n📊 SUMMARY:\n");

  const dangerous = results.filter(r => !r.shouldBeSame);
  const safe = results.filter(r => r.shouldBeSame);

  const falsePositives = dangerous.filter(r => r.wouldCacheHit).length;
  const missedOpportunities = safe.filter(r => !r.wouldCacheHit).length;

  console.log(`Dangerous pairs: ${dangerous.length}`);
  console.log(`  → Would wrongly cache hit: ${falsePositives} (FALSE POSITIVES!)`);
  console.log(`\nSafe pairs: ${safe.length}`);
  console.log(`  → Would miss cache: ${missedOpportunities}`);

  console.log("\n🎓 LESSON:");
  console.log("High similarity ≠ Same answer");
  console.log("That's why we need LLM verification for semantic caching!\n");
}

runTests().catch(console.error);
