/**
 * Seed script to populate online_packages collection in Firestore
 * Run with: node seedOnlinePackages.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

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
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function seedPackages() {
  console.log('Starting to seed online packages...');

  try {
    for (const pkg of packages) {
      const { id, ...data } = pkg;
      await db.collection('online_packages').doc(id).set(data);
      console.log(`✓ Created package: ${data.name}`);
    }

    console.log('\n✓ All packages seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding packages:', error);
    process.exit(1);
  }
}

seedPackages();
