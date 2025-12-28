
### 18. Имплементирај Custom Claims за Roles

**Тренутно**: Свака функција чита Firestore да провери role

**Проблем**: Slow, costly, екстра database read

**Фикс - Користи Firebase Custom Claims**:
```javascript
// Backend - setUserRole.js
export const setUserRole = onCall(async (request) => {
  const { uid, role } = request.data;

  // Set custom claim
  await admin.auth().setCustomUserClaims(uid, { role });

  // Също update Firestore за consistency
  await db.collection('users').doc(uid).update({ role });
});

// Frontend - provera
const checkAdmin = async () => {
  const token = await user.getIdTokenResult(true);
  return token.claims.role === 'admin';
};

// Backend - provera (BRŽE!)
export const confirmPayment = onCall(async (request) => {
  if (!request.auth || request.auth.token.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only admins');
  }
  // ...
});
```

**Benefit**: Нема database query, бржа провера!




### 23. Referral Program

**Додај**:
- ✅ Сваки корисник добија referral code
- ✅ Ако пријатељ користи твој код → оба добијају discount (10%)
- ✅ Tracking referral-а у dashboard-у

**Schema**:
```javascript
// users collection - додај:
{
  referralCode: 'MARKO-ABC123',  // Unique
  referredBy: 'JELENA-XYZ789',   // Who referred this user
  referralCount: 5,               // How many people they referred
  referralDiscount: 50,           // % discount earned
}

// referrals collection
{
  referrerId: 'user1',
  referredUserId: 'user2',
  discountApplied: true,
  createdAt: Timestamp
}
```

---



### 26. Analytics & Insights Dashboard за Teacher-a

**Додај**:
- ✅ Колико корисника гледа сваку лекцију
- ✅ Average completion rate
- ✅ Most popular courses
- ✅ Revenue по месецу
- ✅ Student engagement metrics

**Имплементација**:
```javascript
// analytics collection (aggregated daily)
{
  date: '2025-01-15',
  metrics: {
    newUsers: 25,
    activeUsers: 150,
    videosWatched: 320,
    averageWatchTime: 12.5,  // minutes
    revenue: 45000,           // RSD
    courseCompletions: 8
  }
}

// Компонента:
const AnalyticsDashboard = () => {
  return (
    <div className="grid grid-cols-4 gap-6">
      <StatCard title="Нови корисници" value={25} trend="+12%" />
      <StatCard title="Активни корисници" value={150} trend="+8%" />
      <StatCard title="Видеа гледана" value={320} trend="+15%" />
      <StatCard title="Приход" value="45,000 RSD" trend="+20%" />
    </div>
  );
};
```

---
