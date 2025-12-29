/**
 * Script to set admin custom claim for the first admin user
 * Run once to initialize the admin role with custom claims
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
initializeApp();

const adminEmail = 'vukasin.lukic@fonis.rs';

async function setAdminClaim() {
  try {
    const auth = getAuth();
    const db = getFirestore();

    // Get user by email
    const userRecord = await auth.getUserByEmail(adminEmail);
    console.log(`Found user: ${userRecord.uid} - ${userRecord.email}`);

    // Set custom claim
    await auth.setCustomUserClaims(userRecord.uid, { role: 'admin' });
    console.log('✅ Custom claim "role: admin" set successfully!');

    // Verify it's set
    const updatedUser = await auth.getUser(userRecord.uid);
    console.log('Custom claims:', updatedUser.customClaims);

    // Also ensure Firestore has the role
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.role !== 'admin') {
        await db.collection('users').doc(userRecord.uid).update({ role: 'admin' });
        console.log('✅ Firestore role updated to admin');
      } else {
        console.log('✅ Firestore already has admin role');
      }
    }

    console.log('\n🎉 Admin setup complete!');
    console.log('The user must log out and log back in for the custom claim to take effect.');

    process.exit(0);
  } catch (error) {
    console.error('Error setting admin claim:', error);
    process.exit(1);
  }
}

setAdminClaim();
