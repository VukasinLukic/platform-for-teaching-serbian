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
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
