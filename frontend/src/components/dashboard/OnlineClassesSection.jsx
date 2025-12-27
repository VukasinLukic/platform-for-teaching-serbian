import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';
import { Video, Calendar, Clock, Users, BookOpen } from 'lucide-react';

export default function OnlineClassesSection() {
  const { user } = useAuthStore();
  const [enrollment, setEnrollment] = useState(null);
  const [packageData, setPackageData] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const [nextSession, setNextSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadEnrollments();
    }
  }, [user]);

  const loadEnrollments = async () => {
    try {
      // Fetch active enrollments for current user
      const enrollmentQuery = query(
        collection(db, 'online_enrollments'),
        where('userId', '==', user.uid),
        where('status', '==', 'active')
      );
      const enrollmentSnapshot = await getDocs(enrollmentQuery);

      if (!enrollmentSnapshot.empty) {
        const enrollmentDoc = enrollmentSnapshot.docs[0];
        const enrollmentData = { id: enrollmentDoc.id, ...enrollmentDoc.data() };
        setEnrollment(enrollmentData);

        // Fetch package data
        if (enrollmentData.packageId) {
          const packageDoc = await getDoc(doc(db, 'online_packages', enrollmentData.packageId));
          if (packageDoc.exists()) {
            setPackageData(packageDoc.data());
          }
        }

        // Fetch group data if assigned
        if (enrollmentData.groupId) {
          const groupDoc = await getDoc(doc(db, 'online_groups', enrollmentData.groupId));
          if (groupDoc.exists()) {
            setGroupData(groupDoc.data());
          }

          // Fetch next scheduled session for this group
          const now = new Date();
          const sessionsQuery = query(
            collection(db, 'online_sessions'),
            where('groupId', '==', enrollmentData.groupId),
            where('status', '==', 'scheduled'),
            orderBy('scheduledDate', 'asc'),
            limit(1)
          );
          const sessionsSnapshot = await getDocs(sessionsQuery);

          if (!sessionsSnapshot.empty) {
            const sessionDoc = sessionsSnapshot.docs[0];
            const sessionData = { id: sessionDoc.id, ...sessionDoc.data() };

            // Only show future sessions
            const sessionDate = sessionData.scheduledDate.toDate ? sessionData.scheduledDate.toDate() : new Date(sessionData.scheduledDate);
            if (sessionDate > now) {
              setNextSession(sessionData);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D62828] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return null; // Don't show section if user doesn't have active enrollment
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-3">
        <Video className="w-8 h-8 text-[#D62828]" />
        Ваши Часови
      </h2>

      {/* Active Package Info */}
      <div className="bg-gradient-to-r from-[#D62828]/10 to-[#F2C94C]/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">Активан пакет</div>
            <div className="text-xl font-bold text-[#1A1A1A]">
              {packageData?.name || 'Online Настава'}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Важи до: {enrollment.endDate ? new Date(enrollment.endDate.toDate ? enrollment.endDate.toDate() : enrollment.endDate).toLocaleDateString('sr-RS') : '-'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Преостало часова</div>
            <div className="text-3xl font-black text-[#D62828]">
              {enrollment.remainingClasses || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Next Session Card */}
      {nextSession ? (
        <div className="border-2 border-[#D62828] rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Следећи час</div>
              <div className="text-lg font-bold text-[#1A1A1A] mb-1">
                {nextSession.notes || 'Online час'}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(nextSession.scheduledDate.toDate ? nextSession.scheduledDate.toDate() : nextSession.scheduledDate).toLocaleDateString('sr-RS')}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {nextSession.scheduledTime}
                </div>
              </div>
            </div>
            <div className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
              Заказано
            </div>
          </div>

          {nextSession.meetLink && (
            <a
              href={nextSession.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#D62828] text-white py-3 rounded-xl font-bold hover:bg-[#B91F1F] transition-all flex items-center justify-center gap-2"
            >
              <Video className="w-5 h-5" />
              Придружи се часу
            </a>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-2xl mb-6">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="font-medium">Тренутно нема заказаних часова</p>
          {!groupData && (
            <p className="text-sm mt-2">
              Администратор ће вас ускоро додати у групу
            </p>
          )}
        </div>
      )}

      {/* Group Info */}
      {groupData && (
        <div className="pt-6 border-t border-gray-100">
          <div className="text-sm text-gray-600 mb-2">Ваша група</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#D62828]/10 rounded-lg">
                <Users className="w-5 h-5 text-[#D62828]" />
              </div>
              <div>
                <div className="font-bold text-[#1A1A1A]">{groupData.name}</div>
                <div className="text-sm text-gray-600">
                  Наставник: {groupData.teacherName}
                </div>
              </div>
            </div>
            {groupData.schedule && (
              <div className="text-right text-sm text-gray-600">
                <div>
                  {['Недеља', 'Понедељак', 'Уторак', 'Среда', 'Четвртак', 'Петак', 'Субота'][groupData.schedule.dayOfWeek || 0]}
                </div>
                <div className="font-bold text-[#1A1A1A]">
                  {groupData.schedule.time}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
