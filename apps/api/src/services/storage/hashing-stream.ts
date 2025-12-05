import { createHash, Hash } from 'crypto';
import { Transform, TransformCallback } from 'stream';

/**
 * Transform stream that computes SHA-256 hash while passing data through unchanged.
 * Enables single-pass hashing during upload.
 */
export class HashingStream extends Transform {
  private hash: Hash;
  public digest: string = '';

  constructor() {
    super();
    this.hash = createHash('sha256');
  }

  _transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback): void {
    this.hash.update(chunk);
    callback(null, chunk);
  }

  _flush(callback: TransformCallback): void {
    this.digest = this.hash.digest('hex');
    callback();
  }
}
