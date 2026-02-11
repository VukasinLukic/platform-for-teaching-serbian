/**
 * Cloud Function to seed online packages
 * Deploy with: firebase deploy --only functions:seedOnlinePackages
 * Call via HTTP GET request or from Firebase Console
 */

import { https } from 'firebase-functions/v2';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

// Initialize app if not already initialized
try {
  initializeApp();
} catch (e) {
  // App already initialized
}

const db = getFirestore();

const packages = [
  {
    id: 'basic',
    name: 'Уводни Пакет',
    price: 1500,
    duration: 'први месец',
    durationMonths: 1,
    description: 'Први месец по промотивној цени',
    features: [
      'Приступ свим видео лекцијама',
      'Учење у своје време',
      'Материјали за преузимање',
      'Вежбе са решењима',
      'Идеалан за нове ученике који желе да пробају курс',
    ],
    isActive: true
  },
  {
    id: 'group',
    name: 'Групни Часови',
    price: 3500,
    duration: 'месечно',
    durationMonths: 1,
    description: 'Групна настава уживо',
    features: [
      '4 часа месечно по 1 сат',
      'Термин: четвртком',
      'Максимално 8 ученика по групи',
      'Интерактивна настава уживо',
      'Снимци свих часова',
      'Идеалан за ученике који желе да уче у групи и имају интеракцију са вршњацима',
    ],
    isActive: true
  },
  {
    id: 'individual',
    name: 'Индивидуални Часови',
    price: 6000,
    duration: 'месечно',
    durationMonths: 1,
    description: 'Индивидуална настава 1-на-1',
    features: [
      '4 часа месечно по 1 сат',
      'Термин: уторком',
      '1-на-1 са професорком',
      'Персонализован приступ',
      'Снимци свих часова',
      'Идеалан за ученике који желе максималну пажњу и персонализован приступ',
    ],
    isActive: true
  }
];

export const seedOnlinePackages = https.onRequest(async (req, res) => {
  try {
    console.log('Starting to seed online packages...');

    const results = [];

    for (const pkg of packages) {
      const { id, ...data } = pkg;
      await db.collection('online_packages').doc(id).set({
        ...data,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });

      results.push(`✓ Created package: ${data.name}`);
      console.log(`✓ Created package: ${data.name}`);
    }

    res.status(200).json({
      success: true,
      message: 'All packages seeded successfully!',
      results
    });
  } catch (error) {
    console.error('Error seeding packages:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
