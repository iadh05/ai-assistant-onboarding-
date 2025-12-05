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
export declare class PromptBuilder {
    /**
     * Build RAG prompt with XML structure
     *
     * Structure:
     * <system> - Role and behavior instructions
     * <documents> - Retrieved context from vector store
     * <instructions> - How to use the documents
     * <question> - User's question
     */
    buildRAGPrompt(question: string, chunks: DocumentChunk[]): string;
    /**
     * Build the documents section with proper XML structure
     */
    private buildDocumentsSection;
    /**
     * Escape special XML characters
     */
    private escapeXML;
}
//# sourceMappingURL=PromptBuilder.d.ts.map