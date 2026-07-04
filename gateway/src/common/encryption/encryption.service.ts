import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_ITERATIONS = 100000;
const KEY_LENGTH = 32;
const HASH_ALGORITHM = 'sha512';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly masterKey: Buffer;
  private readonly hmacKey: Buffer;

  constructor(private configService: ConfigService) {
    const rawKey = configService.get<string>('encryption.key') || 'default-dev-key-32-chars-long!!';
    const salt = crypto.createHash('sha256').update('finance-gateway-salt').digest().slice(0, 16);
    this.masterKey = crypto.pbkdf2Sync(rawKey, salt, KEY_ITERATIONS, KEY_LENGTH, HASH_ALGORITHM);
    this.hmacKey = crypto.pbkdf2Sync(rawKey, Buffer.from('finance-gateway-hmac'), KEY_ITERATIONS, KEY_LENGTH, HASH_ALGORITHM);
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.masterKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    const hmac = this.createHmac(iv.toString('hex') + encrypted + authTag);
    return `${iv.toString('hex')}:${encrypted}:${authTag}:${hmac}`;
  }

  decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted text format');
    }
    const [ivHex, encrypted, authTagHex, hmac] = parts;
    const expectedHmac = this.createHmac(ivHex + encrypted + authTagHex);
    if (!crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expectedHmac, 'hex'))) {
      throw new Error('Encryption HMAC verification failed — data may have been tampered with');
    }
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, this.masterKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  deterministicEncrypt(text: string): string {
    const iv = crypto.createHash('sha256').update(text).digest().slice(0, IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.masterKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  maskCardNumber(pan: string): string {
    if (pan.length < 8) return '****';
    return pan.slice(0, 6) + '******' + pan.slice(-4);
  }

  private createHmac(data: string): string {
    return crypto.createHmac('sha256', this.hmacKey).update(data).digest('hex');
  }
}
