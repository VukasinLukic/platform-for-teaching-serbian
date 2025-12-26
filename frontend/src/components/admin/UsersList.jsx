import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Users, Mail, Phone, Calendar, BookOpen } from 'lucide-react';
import Card, { CardBody } from '../ui/Card';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      console.log('🔵 [UsersList] Loading all users...');

      // Dohvati sve korisnike sa role 'korisnik'
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'korisnik')
      );

      const usersSnapshot = await getDocs(usersQuery);
      console.log('✅ [UsersList] Found', usersSnapshot.docs.length, 'users');

      // Za svakog korisnika, dohvati njegove kurseve
      const usersWithCourses = await Promise.all(
        usersSnapshot.docs.map(async (userDoc) => {
          const userData = { id: userDoc.id, ...userDoc.data() };
          console.log('  👤 Processing user:', userData.email);

          // Dohvati kurseve korisnika
          const userCoursesQuery = query(
            collection(db, 'user_courses'),
            where('userId', '==', userDoc.id)
          );
          const userCoursesSnapshot = await getDocs(userCoursesQuery);

          let coursesCount = 0;
          if (!userCoursesSnapshot.empty) {
            const userCoursesData = userCoursesSnapshot.docs[0].data();
            coursesCount = Object.keys(userCoursesData.courses || {}).length;
            console.log('    📚 User has', coursesCount, 'courses');
          }

          return {
            ...userData,
            coursesCount
          };
        })
      );

      console.log('✅ [UsersList] Loaded all users with course data');
      setUsers(usersWithCourses);
    } catch (error) {
      console.error('❌ [UsersList] Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D62828] border-t-transparent"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-20">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Нема ученика</h3>
        <p className="text-gray-600">Тренутно нема регистрованих ученика.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#1A1A1A]">
          Листа Ученика ({users.length})
        </h2>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} variant="elevated">
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-[#D62828] flex items-center justify-center text-white font-bold text-lg">
                    {user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </div>

                  {/* User Info */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-[#1A1A1A]">
                      {user.displayName || 'Без имена'}
                    </h3>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>

                      {user.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {user.phone}
                        </div>
                      )}

                      {user.created_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Регистрован: {new Date(user.created_at).toLocaleDateString('sr-RS')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Courses Count */}
                <div className="flex items-center gap-2 bg-[#F7F7F7] px-4 py-2 rounded-lg">
                  <BookOpen className="w-5 h-5 text-[#D62828]" />
                  <span className="font-bold text-[#1A1A1A]">
                    {user.coursesCount} {user.coursesCount === 1 ? 'курс' : 'курсева'}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
