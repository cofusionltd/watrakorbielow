import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import {
  buildGmailRawMessage,
  decryptMailboxRefreshToken,
  encryptMailboxRefreshToken,
} from './mailboxEmail.ts';

const originalEncryptionKey = process.env.MAILBOX_TOKEN_ENCRYPTION_KEY;
process.env.MAILBOX_TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 23).toString('base64');

after(() => {
  if (originalEncryptionKey === undefined) {
    delete process.env.MAILBOX_TOKEN_ENCRYPTION_KEY;
  } else {
    process.env.MAILBOX_TOKEN_ENCRYPTION_KEY = originalEncryptionKey;
  }
});

test('mailbox refresh tokens are encrypted and authenticated', () => {
  const encrypted = encryptMailboxRefreshToken('provider-refresh-token');
  assert.notEqual(encrypted, 'provider-refresh-token');
  assert.equal(decryptMailboxRefreshToken(encrypted), 'provider-refresh-token');
  const [version, iv, tagValue, ciphertext] = encrypted.split('.');
  const tag = Buffer.from(tagValue, 'base64url');
  tag[0] ^= 1;
  assert.throws(() => decryptMailboxRefreshToken(
    [version, iv, tag.toString('base64url'), ciphertext].join('.')
  ));
});

test('Gmail inquiry copy includes a safe Reply-To and UTF-8 message body', () => {
  const raw = buildGmailRawMessage('admin@example.com', {
    senderName: 'Gość Watra\r\nBcc: attacker@example.com',
    guestEmail: 'guest@example.com',
    message: 'Proszę o pokój w Korbielowie.',
    createdAt: new Date('2026-11-15T12:00:00.000Z'),
  });
  const decoded = Buffer.from(raw, 'base64url').toString('utf8');

  assert.match(decoded, /To: admin@example\.com/);
  assert.match(decoded, /Reply-To: =\?UTF-8\?B\?.*\?= <guest@example\.com>/);
  assert.doesNotMatch(decoded, /\r\nBcc: attacker@example\.com\r\n/);
  assert.match(decoded, /Content-Transfer-Encoding: base64/);
});
