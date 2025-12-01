/**
 * Test script to verify all environment variables are loaded correctly
 * Run with: node test-env.js
 */

// Test Frontend Environment Variables (simulating Vite)
console.log('🧪 Testing Environment Variables Configuration\n');

console.log('📁 FRONTEND Environment Variables (would be loaded by Vite):');
console.log('━'.repeat(70));

const frontendEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID',
  'VITE_API_URL',
  'VITE_EMAILJS_SERVICE_ID',
  'VITE_EMAILJS_PUBLIC_KEY',
  'VITE_EMAILJS_TEMPLATE_CONTACT',
  'VITE_EMAILJS_TEMPLATE_PAYMENT',
  'VITE_EMAILJS_TEMPLATE_PAYMENT_REJECT',
  'VITE_EMAILJS_TEMPLATE_WELCOME',
  'VITE_USE_EMULATORS',
];

// Load frontend .env
import { readFileSync } from 'fs';

try {
  const frontendEnv = readFileSync('./frontend/.env', 'utf-8');
  const frontendEnvLines = frontendEnv.split('\n').filter(line => line.trim() && !line.startsWith('#'));

  console.log(`✅ Frontend .env found with ${frontendEnvLines.length} variables\n`);

  frontendEnvVars.forEach(varName => {
    const found = frontendEnvLines.find(line => line.startsWith(varName));
    if (found) {
      const [key, ...valueParts] = found.split('=');
      const value = valueParts.join('=');
      const masked = value.length > 20 ? value.substring(0, 20) + '...' : value;
      console.log(`  ✓ ${key.padEnd(40)} = ${masked}`);
    } else {
      console.log(`  ✗ ${varName.padEnd(40)} = MISSING`);
    }
  });
} catch (error) {
  console.error('❌ Error reading frontend/.env:', error.message);
}

console.log('\n' + '━'.repeat(70));
console.log('\n📁 BACKEND Environment Variables:');
console.log('━'.repeat(70));

const backendEnvVars = [
  'R2_ACCOUNT_ID',
  'R2_BUCKET_NAME',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
];

try {
  const backendEnv = readFileSync('./backend/functions/.env', 'utf-8');
  const backendEnvLines = backendEnv.split('\n').filter(line => line.trim() && !line.startsWith('#'));

  console.log(`✅ Backend .env found with ${backendEnvLines.length} variables\n`);

  backendEnvVars.forEach(varName => {
    const found = backendEnvLines.find(line => line.startsWith(varName));
    if (found) {
      const [key, ...valueParts] = found.split('=');
      const value = valueParts.join('=');
      const masked = value.length > 20 ? value.substring(0, 20) + '...' : value;
      console.log(`  ✓ ${key.padEnd(40)} = ${masked}`);
    } else {
      console.log(`  ✗ ${varName.padEnd(40)} = MISSING`);
    }
  });
} catch (error) {
  console.error('❌ Error reading backend/functions/.env:', error.message);
}

console.log('\n' + '━'.repeat(70));
console.log('\n📊 SUMMARY:');
console.log('━'.repeat(70));
console.log(`Frontend Variables: ${frontendEnvVars.length} expected`);
console.log(`Backend Variables: ${backendEnvVars.length} expected`);
console.log(`Total: ${frontendEnvVars.length + backendEnvVars.length} environment variables`);
console.log('\n✅ Environment variables test complete!');
console.log('\n💡 Next steps:');
console.log('  1. Run "npm run build" in frontend/ to verify Vite loads them');
console.log('  2. Create EmailJS templates in dashboard');
console.log('  3. Deploy backend functions: firebase deploy --only functions');
