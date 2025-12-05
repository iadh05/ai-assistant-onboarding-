/**
 * Chunk - A piece of a document
 */
export interface Chunk {
  id: string;
  text: string;
  metadata: {
    source: string;      // Filename
    heading?: string;    // Section heading
    index: number;       // Position in document
  };
}

export class ChunkingService {
  private maxChunkSize: number;
  private chunkOverlap: number;

  constructor(maxChunkSize = 1000, chunkOverlap = 200) {
    this.maxChunkSize = maxChunkSize;
    this.chunkOverlap = chunkOverlap;
  }

  /**
   * Main method: Split document into chunks
   */
  chunkDocument(content: string, source: string): Chunk[] {
    const chunks: Chunk[] = [];

    // Step 1: Split by headings
    const sections = this.splitByHeadings(content);

    // Step 2: Convert each section to chunks (respecting max size)
    let chunkIndex = 0;
    for (const section of sections) {
      const sectionChunks = this.splitBySize(section.text.trim(), section.heading);

      for (const text of sectionChunks) {
        chunks.push({
          id: `${source}-chunk-${chunkIndex}`,
          text,
          metadata: {
            source,
            heading: section.heading,
            index: chunkIndex,
          },
        });
        chunkIndex++;
      }
    }

    return chunks;
  }

  /**
   * Split text into chunks respecting maxChunkSize with overlap
   */
  private splitBySize(text: string, _heading?: string): string[] {
    if (text.length <= this.maxChunkSize) {
      return [text];
    }

    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      let end = start + this.maxChunkSize;

      // Try to break at sentence or word boundary
      if (end < text.length) {
        const lastPeriod = text.lastIndexOf('. ', end);
        const lastNewline = text.lastIndexOf('\n', end);
        const breakPoint = Math.max(lastPeriod, lastNewline);

        if (breakPoint > start + this.maxChunkSize / 2) {
          end = breakPoint + 1;
        }
      }

      chunks.push(text.slice(start, end).trim());
      start = end - this.chunkOverlap;

      // Prevent infinite loop
      if (start >= text.length - this.chunkOverlap) {
        break;
      }
    }

    return chunks.filter(chunk => chunk.length > 0);
  }

  /**
   * Split content by markdown headings
   */
  private splitByHeadings(content: string): Array<{ heading?: string; text: string }> {
    const lines = content.split('\n');
    const sections: Array<{ heading?: string; text: string }> = [];
    let currentSection = { heading: undefined as string | undefined, text: '' };

    for (const line of lines) {
      // Check if line is a heading (# ## ###)
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

      if (headingMatch) {
        // Save previous section
        if (currentSection.text.trim()) {
          sections.push(currentSection);
        }

        // Start new section
        currentSection = {
          heading: headingMatch[2],
          text: line + '\n',
        };
      } else {
        currentSection.text += line + '\n';
      }
    }

    // Add last section
    if (currentSection.text.trim()) {
      sections.push(currentSection);
    }

    return sections.length > 0 ? sections : [{ text: content }];
  }
}
