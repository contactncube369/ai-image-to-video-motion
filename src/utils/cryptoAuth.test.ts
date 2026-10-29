import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sha256,
  verifyAdminPasskey,
  maskAdminEmail,
  ADMIN_PASSKEY_SHA256,
  ADMIN_EMAIL_SHA256,
  ADMIN_MASKED_EMAIL,
} from './cryptoAuth';

test('sha256 computes valid 64-character hexadecimal digests for strings', async () => {
  // Test with standard deterministic input
  const hashEmpty = await sha256('');
  assert.equal(hashEmpty, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

  const hashTest = await sha256('motionai_secure_test');
  assert.equal(hashTest.length, 64);
  assert.match(hashTest, /^[0-9a-f]{64}$/);
});

test('ADMIN_PASSKEY_SHA256 and ADMIN_EMAIL_SHA256 are valid cryptographic SHA-256 hashes', () => {
  assert.equal(ADMIN_PASSKEY_SHA256.length, 64, 'Passkey hash must be 256 bits (64 hex characters)');
  assert.match(ADMIN_PASSKEY_SHA256, /^[0-9a-f]{64}$/, 'Passkey hash must be valid hex');

  assert.equal(ADMIN_EMAIL_SHA256.length, 64, 'Email hash must be 256 bits (64 hex characters)');
  assert.match(ADMIN_EMAIL_SHA256, /^[0-9a-f]{64}$/, 'Email hash must be valid hex');
});

test('verifyAdminPasskey denies invalid and empty credentials', async () => {
  const isInvalid1 = await verifyAdminPasskey('WrongPassword123');
  assert.equal(isInvalid1, false, 'Must reject incorrect passwords');

  const isInvalid2 = await verifyAdminPasskey('');
  assert.equal(isInvalid2, false, 'Must reject empty passwords');

  const isInvalid3 = await verifyAdminPasskey('admin');
  assert.equal(isInvalid3, false, 'Must reject standard dictionary words');
});

test('maskAdminEmail protects administrator privacy behind asterisks', () => {
  const masked = maskAdminEmail('admin@example.com');
  assert.equal(masked, ADMIN_MASKED_EMAIL);
  assert.equal(masked, '********************');
  assert.ok(!masked.includes('@'), 'Must never expose @ domain symbol');
  assert.ok(!masked.includes('admin'), 'Must never expose usernames');
});
