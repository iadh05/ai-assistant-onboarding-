export { FileValidator, fileValidator } from './FileValidator.js';
export type { ValidationResult, AllowedFileType, FileValidatorConfig } from './FileValidator.js';

export { ContentExtractor, contentExtractor } from './ContentExtractor.js';
export type { ExtractionResult, DocumentMetadata } from './ContentExtractor.js';

export { TextSanitizer, textSanitizer } from './TextSanitizer.js';
export type { SanitizeResult, SanitizeChange, SanitizeOptions } from './TextSanitizer.js';

export { DocumentDeduplicator, documentDeduplicator } from './DocumentDeduplicator.js';
export type { DeduplicationResult } from './DocumentDeduplicator.js';
