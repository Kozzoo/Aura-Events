import crypto from 'crypto';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyHash(password, stored) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'));
  } catch {
    return false;
  }
}

// Test
const testPassword = 'Eyad@1622004';
const hashedPassword = hashPassword(testPassword);
console.log('Original hash:', hashedPassword);

const isValid = verifyHash(testPassword, hashedPassword);
console.log('Verification result:', isValid);

const isInvalid = verifyHash('wrongpassword', hashedPassword);
console.log('Wrong password result:', isInvalid);
