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
    name: 'Месечни Пакет',
    price: 4999,
    duration: '1 месец',
    durationMonths: 1,
    description: 'Идеалан за пробу online наставе',
    features: [
      '4 часа месечно (сваке недеље)',
      'Интерактивна настава уживо',
      'Максимално 8 ученика по групи',
      'Материјали за вежбање',
      'Снимци свих часова',
    ],
    isActive: true
  },
  {
    id: 'semester',
    name: 'Полугодишњи Пакет',
    price: 24999,
    duration: '6 месеци',
    durationMonths: 6,
    description: 'Најбоља вредност за новац',
    features: [
      '24 часа (сваке недеље 6 месеци)',
      'Интерактивна настава уживо',
      'Максимално 8 ученика по групи',
      'Материјали за вежбање',
      'Снимци свих часова',
      'Бесплатан приступ свим видео курсевима',
      'Приоритетна подршка',
    ],
    isActive: true
  },
  {
    id: 'annual',
    name: 'Годишњи Пакет',
    price: 44999,
    duration: '12 месеци',
    durationMonths: 12,
    description: 'Комплетна припрема за малу матуру',
    features: [
      '48 часова (целе школске године)',
      'Интерактивна настава уживо',
      'Максимално 8 ученика по групи',
      'Материјали за вежбање',
      'Снимци свих часова',
      'Бесплатан приступ свим видео курсевима',
      'Приоритетна подршка',
      'Индивидуални тестови и оцене',
      'Завршни сертификат',
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
