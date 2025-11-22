/**
 * Document chunk interface for prompt building
 *
 * This avoids circular dependency with core package
 */
export interface DocumentChunk {
  text: string;
  metadata: {
    heading?: string;
    source: string;
  };
}

/**
 * Prompt Builder
 *
 * Builds XML-formatted prompts for LLMs
 *
 * Why XML format?
 * - Clear section boundaries (easier for LLM to parse)
 * - Industry standard (Anthropic Claude uses XML heavily)
 * - Easy to extract/modify sections programmatically
 * - Less ambiguous than plain text
 */
export class PromptBuilder {
  /**
   * Build RAG prompt with XML structure
   *
   * Structure:
   * <system> - Role and behavior instructions
   * <documents> - Retrieved context from vector store
   * <instructions> - How to use the documents
   * <question> - User's question
   */
  buildRAGPrompt(question: string, chunks: DocumentChunk[]): string {
    const documentsXML = this.buildDocumentsSection(chunks);

    return `<system>
You are a helpful assistant that answers questions based on provided documentation.
Your goal is to give accurate, concise answers using only the information provided.
</system>

${documentsXML}

<instructions>
- Answer the user's question using ONLY the information from the documents above
- If the documentation doesn't contain the answer, say "I don't have information about that in the documentation"
- Be concise and helpful
- When relevant, mention which document section supports your answer (e.g., "According to the Installation guide...")
- If multiple documents are relevant, synthesize the information into a coherent answer
</instructions>

<question>
${question}
</question>

Please provide your answer:`;
  }

  /**
   * Build the documents section with proper XML structure
   */
  private buildDocumentsSection(chunks: DocumentChunk[]): string {
    const documentTags = chunks
      .map((chunk, index) => {
        const heading = chunk.metadata.heading || 'No heading';
        const source = chunk.metadata.source;

        return `  <document id="${index + 1}" heading="${heading}" source="${source}">
${this.escapeXML(chunk.text.trim())}
  </document>`;
      })
      .join('\n\n');

    return `<documents>
${documentTags}
</documents>`;
  }

  /**
   * Escape special XML characters
   */
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
