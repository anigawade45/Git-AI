import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';


function getSecretKey() {
  const rawKey = process.env.ENCRYPTION_KEY;
  if (!rawKey) {
    throw new Error('ENCRYPTION_KEY configuration is missing in environment variables.');
  }
  return crypto.createHash('sha256').update(rawKey).digest();
}

export function encryptText(text) {
  if (!text || typeof text !== 'string') return '';
  if (text.startsWith('enc:')) return text;

  const iv = crypto.randomBytes(12);
  const key = getSecretKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `enc:${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptText(encryptedPayload) {
  if (!encryptedPayload || typeof encryptedPayload !== 'string') return '';
  
  if (!encryptedPayload.startsWith('enc:')) {
    throw new Error('Invalid encrypted payload: Must start with "enc:" prefix.');
  }

  const parts = encryptedPayload.split(':');
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted payload: Malformed structure.');
  }

  const [, ivHex, authTagHex, encryptedHex] = parts;
  const key = getSecretKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
