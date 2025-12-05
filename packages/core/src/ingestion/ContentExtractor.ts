import type { AllowedFileType } from './FileValidator.js';

export interface ExtractionResult {
  success: boolean;
  text?: string;
  error?: string;
  metadata?: DocumentMetadata;
}

export interface DocumentMetadata {
  pageCount?: number;
  wordCount: number;
  charCount: number;
  title?: string;
  author?: string;
}

export class ContentExtractor {
  async extract(buffer: Buffer, fileType: AllowedFileType): Promise<ExtractionResult> {
    try {
      let text: string;
      let metadata: Partial<DocumentMetadata> = {};

      switch (fileType) {
        case 'pdf':
          const pdfResult = await this.extractPDF(buffer);
          text = pdfResult.text;
          metadata = pdfResult.metadata;
          break;

        case 'docx':
          const docxResult = await this.extractDOCX(buffer);
          text = docxResult.text;
          metadata = docxResult.metadata;
          break;

        case 'txt':
        case 'md':
          text = buffer.toString('utf-8');
          break;

        default:
          return { success: false, error: `Unsupported file type: ${fileType}` };
      }

      return {
        success: true,
        text,
        metadata: {
          ...metadata,
          wordCount: this.countWords(text),
          charCount: text.length,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: `Failed to extract text: ${message}` };
    }
  }

  private async extractPDF(buffer: Buffer): Promise<{ text: string; metadata: Partial<DocumentMetadata> }> {
    const pdfParse = (await import('pdf-parse')).default;

    try {
      const data = await pdfParse(buffer);

      return {
        text: data.text,
        metadata: {
          pageCount: data.numpages,
          title: data.info?.Title,
          author: data.info?.Author,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message.includes('XRef') || message.includes('xref')) {
        throw new Error('PDF is corrupted or has an invalid structure. Try re-exporting from the original application.');
      }
      throw error;
    }
  }

  private async extractDOCX(buffer: Buffer): Promise<{ text: string; metadata: Partial<DocumentMetadata> }> {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });

    return { text: result.value, metadata: {} };
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
  }
}

export const contentExtractor = new ContentExtractor();
