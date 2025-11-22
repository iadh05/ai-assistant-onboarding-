# Learning Progress - Onboarding Chatbot

## Session: 2025-11-22

### ✅ Completed
- [x] Project setup (Turborepo, TypeScript, packages structure)
- [x] Understanding: What are embeddings?
  - Text → Numbers (arrays of 768 numbers)
  - AI captures meaning, not just letters
  - Similar meaning = similar numbers
- [x] Built embedding service
  - `generateEmbedding()` - converts text to 768 numbers
  - `cosineSimilarity()` - compares two embeddings
  - Tested: "Hello" vs "Hi" = 0.879 (high!), "Hello" vs "Installing" = 0.334 (low!)

### 🔄 In Progress
- [ ] Understanding chunking

### 📋 To Do
- [ ] Understanding chunking
- [ ] Building chunking service
- [ ] Understanding vector store
- [ ] Building vector store
- [ ] Understanding RAG pattern
- [ ] Building chat service
- [ ] Building CLI interface
- [ ] Testing the chatbot

---

## Key Learnings

### Embeddings
- **Purpose:** Convert text to numbers to compare meaning
- **Model:** nomic-embed-text (via Ollama)
- **Output:** 768 numbers per text
- **Use case:** Find similar docs by comparing number arrays

### Cosine Similarity
- **Purpose:** Measure how similar two embeddings are
- **Formula:** dotProduct / (magnitude1 × magnitude2)
- **Score:** 0.0 (different) to 1.0 (identical)
- **How it works:**
  1. Dot product: Multiply matching positions, sum them
  2. Magnitude: Calculate "length" of each vector
  3. Divide: Normalizes for fair comparison
- **Visual:** Measures the "angle" between vectors (small angle = similar)
