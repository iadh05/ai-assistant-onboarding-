export interface ValidationResult {
  valid: boolean;
  error?: string;
  fileType?: AllowedFileType;
}

export type AllowedFileType = 'pdf' | 'docx' | 'txt' | 'md';

export interface FileValidatorConfig {
  maxSizeBytes: number;
  allowedTypes: AllowedFileType[];
}

// Magic bytes for binary format detection
const MAGIC_BYTES: Record<string, { bytes: number[]; offset: number }> = {
  pdf: { bytes: [0x25, 0x50, 0x44, 0x46], offset: 0 },   // %PDF
  docx: { bytes: [0x50, 0x4b, 0x03, 0x04], offset: 0 },  // PK.. (ZIP)
};

const MIME_TYPES: Record<AllowedFileType, string[]> = {
  pdf: ['application/pdf'],
  docx: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
  ],
  txt: ['text/plain'],
  md: ['text/plain', 'text/markdown', 'text/x-markdown'],
};

const EXTENSIONS: Record<AllowedFileType, string[]> = {
  pdf: ['.pdf'],
  docx: ['.docx'],
  txt: ['.txt'],
  md: ['.md', '.markdown'],
};

const DEFAULT_CONFIG: FileValidatorConfig = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['pdf', 'docx', 'txt', 'md'],
};

export class FileValidator {
  private config: FileValidatorConfig;

  constructor(config: Partial<FileValidatorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  validate(buffer: Buffer, filename: string, mimetype: string): ValidationResult {
    const extensionResult = this.validateExtension(filename);
    if (!extensionResult.valid) return extensionResult;

    const fileType = extensionResult.fileType!;

    const sizeResult = this.validateSize(buffer);
    if (!sizeResult.valid) return sizeResult;

    this.validateMimeType(mimetype, fileType);

    const magicResult = this.validateMagicBytes(buffer, fileType);
    if (!magicResult.valid) return magicResult;

    if (fileType === 'txt' || fileType === 'md') {
      const textResult = this.validateTextContent(buffer);
      if (!textResult.valid) return textResult;
    }

    return { valid: true, fileType };
  }

  private validateExtension(filename: string): ValidationResult {
    const ext = this.getExtension(filename);

    for (const type of this.config.allowedTypes) {
      if (EXTENSIONS[type].includes(ext)) {
        return { valid: true, fileType: type };
      }
    }

    const allowedExts = this.config.allowedTypes
      .flatMap((t) => EXTENSIONS[t])
      .join(', ');

    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedExts}`,
    };
  }

  private validateSize(buffer: Buffer): ValidationResult {
    if (buffer.length > this.config.maxSizeBytes) {
      const maxMB = this.config.maxSizeBytes / (1024 * 1024);
      const fileMB = (buffer.length / (1024 * 1024)).toFixed(2);
      return {
        valid: false,
        error: `File too large (${fileMB}MB). Maximum size: ${maxMB}MB`,
      };
    }
    return { valid: true };
  }

  private validateMimeType(mimetype: string, fileType: AllowedFileType): ValidationResult {
    const allowedMimes = MIME_TYPES[fileType];
    if (!allowedMimes.includes(mimetype)) {
      console.warn(`MIME mismatch: got "${mimetype}", expected: ${allowedMimes.join(', ')}`);
    }
    return { valid: true };
  }

  private validateMagicBytes(buffer: Buffer, fileType: AllowedFileType): ValidationResult {
    const signature = MAGIC_BYTES[fileType];
    if (!signature) return { valid: true };

    if (buffer.length < signature.offset + signature.bytes.length) {
      return {
        valid: false,
        error: `File too small to be a valid ${fileType.toUpperCase()} file`,
      };
    }

    for (let i = 0; i < signature.bytes.length; i++) {
      if (buffer[signature.offset + i] !== signature.bytes[i]) {
        return {
          valid: false,
          error: `Invalid ${fileType.toUpperCase()} file. Content doesn't match extension.`,
        };
      }
    }

    return { valid: true };
  }

  private validateTextContent(buffer: Buffer): ValidationResult {
    try {
      const text = buffer.toString('utf-8');

      if (text.includes('\0')) {
        return { valid: false, error: 'File appears to be binary, not text' };
      }

      const nonPrintable = text.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g);
      if (nonPrintable && nonPrintable.length > text.length * 0.1) {
        return { valid: false, error: 'File contains too many non-printable characters' };
      }

      return { valid: true };
    } catch {
      return { valid: false, error: 'File is not valid UTF-8 text' };
    }
  }

  private getExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return '';
    return filename.slice(lastDot).toLowerCase();
  }

  static formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

export const fileValidator = new FileValidator();
