/**
 * Simple seed script for online packages
 * This will create the packages using browser Firebase SDK
 * Open this file in a browser console or run with Node (if firebase is installed globally)
 */

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
    createdAt: new Date(),
    updatedAt: new Date()
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
    createdAt: new Date(),
    updatedAt: new Date()
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
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

console.log('Online Packages Data:');
console.log(JSON.stringify(packages, null, 2));

console.log('\n=== Instructions ===');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/project/naucisprski/firestore');
console.log('2. Click "online_packages" collection (or create it)');
console.log('3. For each package above, click "Add document"');
console.log('4. Use the package ID as document ID (basic, semester, annual)');
console.log('5. Copy the fields from the JSON above');
