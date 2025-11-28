import { createHash } from 'crypto';
import { textSanitizer } from './TextSanitizer.js';

export interface DeduplicationResult {
  isDuplicate: boolean;
  contentHash: string;
  existingDocumentId?: string;
}

// In-memory store for MVP - replace with DB in production
const contentHashes = new Map<string, string>();

export class DocumentDeduplicator {
  checkDuplicate(text: string, documentId?: string): DeduplicationResult {
    const sanitized = textSanitizer.sanitizeText(text);
    const contentHash = createHash('sha256').update(sanitized).digest('hex');

    const existingId = contentHashes.get(contentHash);

    if (existingId && existingId !== documentId) {
      return {
        isDuplicate: true,
        contentHash,
        existingDocumentId: existingId,
      };
    }

    return { isDuplicate: false, contentHash };
  }

  register(contentHash: string, documentId: string): void {
    contentHashes.set(contentHash, documentId);
  }

  unregister(contentHash: string): void {
    contentHashes.delete(contentHash);
  }

  clear(): void {
    contentHashes.clear();
  }

  getStats(): { totalHashes: number } {
    return { totalHashes: contentHashes.size };
  }
}

export const documentDeduplicator = new DocumentDeduplicator();
