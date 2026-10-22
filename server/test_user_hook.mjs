import mongoose from 'mongoose';
import User from './models/userModel.js';
import bcrypt from 'bcryptjs';

console.log('\n======================================================');
console.log('🧪 RUNNING MONGOOSE USER PRE-SAVE HOOK VERIFICATION');
console.log('======================================================\n');

let results = [];
function assert(desc, condition, details = '') {
  if (condition) {
    results.push({ desc, status: 'PASS' });
    console.log(`  ✅ PASS: ${desc}`);
  } else {
    results.push({ desc, status: 'FAIL', details });
    console.error(`  ❌ FAIL: ${desc} ${details}`);
  }
}

// Extract the password hashing pre-save hook function registered on userSchema
const hooks = User.schema.s.hooks._pres.get('save') || [];
const passwordHookEntry = hooks.find(h => h.fn.toString().includes('isModified') && h.fn.toString().includes('bcrypt'));
if (!passwordHookEntry) {
  throw new Error('Password hashing hook not found on User schema');
}
const preSaveHook = passwordHookEntry.fn;

// Test 1: New user with plaintext password
const user1 = new User({
  name: 'Hook Test User',
  email: 'hooktest@autocare.com',
  password: 'originalPassword123!',
  phone: '555-0100',
});

assert('User initialized with plaintext password', user1.isModified('password'));
await preSaveHook.call(user1);

assert('Pre-save hook hashed the plaintext password', user1.password.startsWith('$2a$') || user1.password.startsWith('$2b$'));
assert('bcrypt matchPassword verifies original password', await user1.matchPassword('originalPassword123!'));

// Test 2: Saving unrelated profile fields leaves hash unchanged
const originalHash = user1.password;
// Reset modified state to simulate post-save
user1.$__reset();
user1.phone = '555-0200';
user1.name = 'Updated Name';

assert('isModified("password") is false on unrelated field update', !user1.isModified('password'));
await preSaveHook.call(user1);
assert('Password hash unchanged when modifying unrelated fields', user1.password === originalHash);

// Test 3: Updating password hashes the new password
user1.password = 'brandNewPassword456!';
assert('isModified("password") is true on new password set', user1.isModified('password'));
await preSaveHook.call(user1);

const newHash = user1.password;
assert('New password was hashed into different hash', newHash !== originalHash);
assert('matchPassword verifies brandNewPassword456!', await user1.matchPassword('brandNewPassword456!'));
assert('matchPassword rejects originalPassword123!', !(await user1.matchPassword('originalPassword123!')));

// Test 4: Deactivation and restoration does not alter password hash
user1.$__reset();
user1.isActive = false;
assert('isModified("password") is false on deactivation', !user1.isModified('password'));
await preSaveHook.call(user1);
assert('Password hash preserved across deactivation (isActive=false)', user1.password === newHash);

user1.isActive = true;
assert('isModified("password") is false on reactivation', !user1.isModified('password'));
await preSaveHook.call(user1);
assert('Password hash preserved across reactivation (isActive=true)', user1.password === newHash);

console.log('\n======================================================');
const passCount = results.filter(r => r.status === 'PASS').length;
console.log(`📊 RESULT: ${passCount}/${results.length} CHECKS PASSED`);
console.log('======================================================\n');
