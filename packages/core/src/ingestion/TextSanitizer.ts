import { createHash } from 'crypto';

export interface SanitizeResult {
  text: string;
  changes: SanitizeChange[];
}

export interface SanitizeChange {
  type: string;
  count: number;
}

export interface SanitizeOptions {
  normalizeUnicode?: boolean;
  removeZeroWidth?: boolean;
  normalizeQuotes?: boolean;
  normalizeWhitespace?: boolean;
  removeControlChars?: boolean;
  maxConsecutiveNewlines?: number;
}

const ZERO_WIDTH_CHARS = /[\u200B-\u200D\u2060\uFEFF]/g;
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

const QUOTE_REPLACEMENTS: [RegExp, string][] = [
  [/[\u2018\u2019\u201A\u201B]/g, "'"],
  [/[\u201C\u201D\u201E\u201F]/g, '"'],
  [/[\u2013\u2014]/g, '-'],
  [/\u2026/g, '...'],
];

const DEFAULT_OPTIONS: Required<SanitizeOptions> = {
  normalizeUnicode: true,
  removeZeroWidth: true,
  normalizeQuotes: true,
  normalizeWhitespace: true,
  removeControlChars: true,
  maxConsecutiveNewlines: 2,
};

export class TextSanitizer {
  private options: Required<SanitizeOptions>;

  constructor(options: SanitizeOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  sanitize(text: string): SanitizeResult {
    const changes: SanitizeChange[] = [];
    let result = text;

    if (this.options.normalizeUnicode) {
      const before = result;
      result = result.normalize('NFC');
      if (before !== result) {
        changes.push({ type: 'unicode_normalized', count: 1 });
      }
    }

    if (this.options.removeZeroWidth) {
      const matches = result.match(ZERO_WIDTH_CHARS);
      if (matches) {
        result = result.replace(ZERO_WIDTH_CHARS, '');
        changes.push({ type: 'zero_width_removed', count: matches.length });
      }
    }

    if (this.options.removeControlChars) {
      const matches = result.match(CONTROL_CHARS);
      if (matches) {
        result = result.replace(CONTROL_CHARS, '');
        changes.push({ type: 'control_chars_removed', count: matches.length });
      }
    }

    if (this.options.normalizeQuotes) {
      let quoteCount = 0;
      for (const [pattern, replacement] of QUOTE_REPLACEMENTS) {
        const matches = result.match(pattern);
        if (matches) {
          quoteCount += matches.length;
          result = result.replace(pattern, replacement);
        }
      }
      if (quoteCount > 0) {
        changes.push({ type: 'quotes_normalized', count: quoteCount });
      }
    }

    if (this.options.normalizeWhitespace) {
      const before = result;
      result = result.replace(/\t/g, ' ');
      result = result.replace(/ {2,}/g, ' ');
      const newlinePattern = new RegExp(
        `\n{${this.options.maxConsecutiveNewlines + 1},}`,
        'g'
      );
      result = result.replace(
        newlinePattern,
        '\n'.repeat(this.options.maxConsecutiveNewlines)
      );
      result = result.replace(/^ +| +$/gm, '');
      if (before !== result) {
        changes.push({ type: 'whitespace_normalized', count: 1 });
      }
    }

    result = result.trim();
    return { text: result, changes };
  }

  sanitizeText(text: string): string {
    return this.sanitize(text).text;
  }

  needsSanitization(text: string): boolean {
    if (ZERO_WIDTH_CHARS.test(text)) return true;
    if (CONTROL_CHARS.test(text)) return true;
    if (/[\u2018-\u201F\u2013\u2014\u2026]/.test(text)) return true;
    if (/  |\t|\n{3,}/.test(text)) return true;
    return false;
  }

  // Hash sanitized text for deduplication
  getContentHash(text: string): string {
    const sanitized = this.sanitizeText(text);
    return createHash('sha256').update(sanitized).digest('hex');
  }
}

export const textSanitizer = new TextSanitizer();
