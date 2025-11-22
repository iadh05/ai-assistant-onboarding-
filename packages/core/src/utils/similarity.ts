/**
 * Cosine Similarity Utility
 *
 * Calculates similarity between two embedding vectors.
 * Used by VectorStore for semantic search.
 *
 * Note: When upgrading to a real vector database (Pinecone, Weaviate, etc.),
 * this utility can be removed as the database handles similarity internally.
 */

/**
 * Calculate cosine similarity between two vectors
 *
 * Cosine similarity measures the angle between two vectors:
 * - 1.0 = identical direction (same meaning)
 * - 0.0 = perpendicular (unrelated)
 * - -1.0 = opposite direction (opposite meaning)
 *
 * @param vec1 - First embedding vector
 * @param vec2 - Second embedding vector
 * @returns Similarity score between -1 and 1 (typically 0 to 1 for embeddings)
 */
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  // Step 1: Dot product (multiply matching positions and sum)
  let dotProduct = 0;
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
  }

  // Step 2: Calculate magnitude (length) of each vector
  let mag1 = 0;
  let mag2 = 0;
  for (let i = 0; i < vec1.length; i++) {
    mag1 += vec1[i] * vec1[i];
    mag2 += vec2[i] * vec2[i];
  }
  mag1 = Math.sqrt(mag1);
  mag2 = Math.sqrt(mag2);

  // Step 3: Cosine similarity = dot product / (magnitude1 * magnitude2)
  return dotProduct / (mag1 * mag2);
}
