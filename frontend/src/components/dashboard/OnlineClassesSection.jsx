import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../services/firebase';
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

        // Group and next class (with Meet link) come from the server,
        // which only returns them for the student's own active enrollment
        if (enrollmentData.groupId) {
          const getMyOnlineGroup = httpsCallable(functions, 'getMyOnlineGroup');
          const result = await getMyOnlineGroup();
          setGroupData(result.data.group);
          setNextSession(result.data.nextSession);
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
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return null; // Don't show section if user doesn't have active enrollment
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-ink mb-6 flex items-center gap-3">
        <Video className="w-8 h-8 text-brand" />
        Ваши Часови
      </h2>

      {/* Active Package Info */}
      <div className="bg-gradient-to-r from-brand/10 to-gold/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">Активан пакет</div>
            <div className="text-xl font-bold text-ink">
              {packageData?.name || 'Online настава'}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Важи до: {enrollment.endDate ? new Date(enrollment.endDate.toDate ? enrollment.endDate.toDate() : enrollment.endDate).toLocaleDateString('sr-RS') : '-'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Преостало часова</div>
            <div className="text-3xl font-black text-brand">
              {enrollment.remainingClasses || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Next Session Card */}
      {nextSession ? (
        <div className="border-2 border-brand rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Следећи час</div>
              <div className="text-lg font-bold text-ink mb-1">
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
              className="w-full bg-brand text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
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
              <div className="p-2 bg-brand/10 rounded-lg">
                <Users className="w-5 h-5 text-brand" />
              </div>
              <div>
                <div className="font-bold text-ink">{groupData.name}</div>
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
                <div className="font-bold text-ink">
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
