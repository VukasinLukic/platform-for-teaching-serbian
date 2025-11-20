import { collection, query, where, getCountFromServer, getDocs } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Fetches dashboard statistics for the admin panel.
 * @returns {Promise<{totalCourses: number, activeStudents: number, pendingPayments: number, monthlyRevenue: number}>}
 */
export const getDashboardStats = async () => {
  try {
    // 1. Total Courses
    const coursesColl = collection(db, 'courses');
    const coursesSnapshot = await getCountFromServer(coursesColl);
    const totalCourses = coursesSnapshot.data().count;

    // 2. Active Students (users with role 'korisnik')
    const studentsQuery = query(collection(db, 'users'), where('role', '==', 'korisnik'));
    const studentsSnapshot = await getCountFromServer(studentsQuery);
    const activeStudents = studentsSnapshot.data().count;

    // 3. Pending Payments
    const pendingQuery = query(collection(db, 'transactions'), where('status', '==', 'pending'));
    const pendingSnapshot = await getCountFromServer(pendingQuery);
    const pendingPayments = pendingSnapshot.data().count;

    // 4. Monthly Revenue (current month)
    // Note: Firestore filtering by date requires creating an index. 
    // For MVP/Low traffic, we can fetch all confirmed transactions and filter client-side to avoid index management initially,
    // BUT it's better to do it right. Let's fetch confirmed transactions and filter.
    // Since we don't have a composite index yet probably, let's keep it simple.
    // We'll fetch all 'confirmed' transactions and filter by date in JS to avoid "index required" errors for now.
    
    const revenueQuery = query(collection(db, 'transactions'), where('status', '==', 'confirmed'));
    const revenueSnapshot = await getDocs(revenueQuery);
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyRevenue = revenueSnapshot.docs.reduce((acc, doc) => {
      const data = doc.data();
      // Check if created_at exists and is in current month
      if (data.created_at) {
        // Firestore timestamp to Date
        const date = data.created_at.toDate ? data.created_at.toDate() : new Date(data.created_at);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          return acc + (Number(data.amount) || 0);
        }
      }
      return acc;
    }, 0);

    return {
      totalCourses,
      activeStudents,
      pendingPayments,
      monthlyRevenue
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    // Return zeros on error to not break UI
    return {
      totalCourses: 0,
      activeStudents: 0,
      pendingPayments: 0,
      monthlyRevenue: 0
    };
  }
};

