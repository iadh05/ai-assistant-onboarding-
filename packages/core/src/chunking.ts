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

    // Step 2: Convert each section to chunk
    sections.forEach((section, index) => {
      chunks.push({
        id: `${source}-chunk-${index}`,
        text: section.text.trim(),
        metadata: {
          source,
          heading: section.heading,
          index,
        },
      });
    });

    return chunks;
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
