import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

function getEncryptionKey(): Buffer {
  const configuredKey = process.env.MAILBOX_TOKEN_ENCRYPTION_KEY?.trim();
  if (!configuredKey) throw new Error('MAILBOX_TOKEN_ENCRYPTION_KEY is not configured');
  const key = /^[0-9a-f]{64}$/i.test(configuredKey)
    ? Buffer.from(configuredKey, 'hex')
    : Buffer.from(configuredKey, 'base64');
  if (key.length !== 32) {
    throw new Error('MAILBOX_TOKEN_ENCRYPTION_KEY must encode exactly 32 bytes');
  }
  return key;
}

export function validateMailboxTokenEncryptionKey(): void {
  getEncryptionKey();
}

export function encryptMailboxRefreshToken(refreshToken: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(refreshToken, 'utf8'), cipher.final()]);
  return [
    'v1',
    iv.toString('base64url'),
    cipher.getAuthTag().toString('base64url'),
    encrypted.toString('base64url'),
  ].join('.');
}

export function decryptMailboxRefreshToken(encryptedToken: string): string {
  const [version, ivValue, tagValue, encryptedValue] = encryptedToken.split('.');
  if (version !== 'v1' || !ivValue || !tagValue || !encryptedValue) {
    throw new Error('Stored mailbox token has an unsupported format');
  }
  const decipher = createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    Buffer.from(ivValue, 'base64url')
  );
  decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

function encodeHeader(value: string): string {
  return `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`;
}

export function inquiryEmailContent(inquiry: {
  senderName: string;
  guestEmail: string;
  message: string;
  createdAt: Date | null;
}): { subject: string; body: string } {
  const subject = `Website inquiry from ${inquiry.senderName.replace(/[\r\n]+/g, ' ').trim()}`;
  const body = [
    'A new contact form inquiry was submitted on the Watra Korbielow website.',
    '',
    `Name: ${inquiry.senderName}`,
    `Email: ${inquiry.guestEmail}`,
    `Received: ${inquiry.createdAt?.toISOString() ?? 'Unknown'}`,
    '',
    inquiry.message,
  ].join('\n');
  return { subject, body };
}

export function buildGmailRawMessage(
  accountEmail: string,
  inquiry: {
    senderName: string;
    guestEmail: string;
    message: string;
    createdAt: Date | null;
  }
): string {
  const { subject, body } = inquiryEmailContent(inquiry);
  const replyToName = encodeHeader(inquiry.senderName.replace(/[\r\n]+/g, ' ').trim());
  const rawMessage = [
    `From: ${encodeHeader('Watra Korbielow website')} <${accountEmail}>`,
    `To: ${accountEmail}`,
    `Reply-To: ${replyToName} <${inquiry.guestEmail}>`,
    `Subject: ${encodeHeader(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(body, 'utf8').toString('base64'),
  ].join('\r\n');
  return Buffer.from(rawMessage, 'utf8').toString('base64url');
}
