import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, functions } from '../../services/firebase';
import { httpsCallable } from 'firebase/functions';
import { getUserTransactionDocs } from '../../services/transactions';
import { Users, Mail, Phone, Calendar, BookOpen, Search, Ban, Trash2, ChevronLeft, ChevronRight, UserCheck, Eye } from 'lucide-react';
import { showToast } from '../../utils/toast';
import { useConfirm } from '../../hooks/useConfirm';
import UserDetailModal from './UserDetailModal';

export default function UsersList() {
  const { confirm, ConfirmDialog } = useConfirm();
  const [allUsers, setAllUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterAndPaginateUsers();
  }, [searchTerm, currentPage, allUsers]);

  const loadUsers = async () => {
    try {
      console.log('🔵 [UsersList] Loading all users...');

      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'korisnik')
      );

      const usersSnapshot = await getDocs(usersQuery);
      console.log('✅ [UsersList] Found', usersSnapshot.docs.length, 'users');

      const usersWithCourses = await Promise.all(
        usersSnapshot.docs.map(async (userDoc) => {
          const userData = { id: userDoc.id, ...userDoc.data() };

          const userCoursesQuery = query(
            collection(db, 'user_courses'),
            where('userId', '==', userDoc.id)
          );
          const userCoursesSnapshot = await getDocs(userCoursesQuery);

          let coursesCount = 0;
          if (!userCoursesSnapshot.empty) {
            const userCoursesData = userCoursesSnapshot.docs[0].data();
            coursesCount = Object.keys(userCoursesData.courses || {}).length;
          }

          return {
            ...userData,
            coursesCount
          };
        })
      );

      setAllUsers(usersWithCourses);
    } catch (error) {
      console.error('❌ [UsersList] Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndPaginateUsers = () => {
    let filtered = allUsers;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = allUsers.filter(user =>
        user.ime?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.telefon?.includes(search)
      );
    }

    const total = Math.ceil(filtered.length / itemsPerPage);
    setTotalPages(total);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedUsers(filtered.slice(startIndex, endIndex));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleBlockUser = async (userId, currentlyBlocked) => {
    const action = currentlyBlocked ? 'одблокирати' : 'блокирати';
    const confirmed = await confirm({
      title: currentlyBlocked ? 'Одблокирај корисника' : 'Блокирај корисника',
      message: `Да ли сте сигурни да желите да ${action} овог корисника?`,
      confirmText: 'Потврди',
      cancelText: 'Откажи',
      variant: currentlyBlocked ? 'warning' : 'danger'
    });

    if (!confirmed) return;

    try {
      await updateDoc(doc(db, 'users', userId), {
        blocked: !currentlyBlocked,
        blockedAt: !currentlyBlocked ? new Date().toISOString() : null
      });

      setAllUsers(allUsers.map(user =>
        user.id === userId ? { ...user, blocked: !currentlyBlocked } : user
      ));

      showToast.success(`Корисник је успешно ${currentlyBlocked ? 'одблокиран' : 'блокиран'}.`);
    } catch (error) {
      console.error('Error blocking user:', error);
      showToast.error('Грешка при блокирању корисника.');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const deleteAuth = await confirm({
      title: 'Обриши Authentication налог?',
      message: 'Да ли желите да обришете и Authentication налог?\n\n"Потврди" = обриши И из базе И из Authentication-а.\n"Откажи" = обриши САМО из базе (корисник ће моћи да се пријави).',
      confirmText: 'Потврди',
      cancelText: 'Откажи',
      variant: 'warning'
    });

    const finalConfirm = await confirm({
      title: 'Обриши корисника',
      message: `Да ли сте сигурни да желите да обришете корисника "${userName}"?\n\nОво ће обрисати све податке корисника укључујући његове курсеве и трансакције.`,
      confirmText: 'Обриши',
      cancelText: 'Откажи',
      variant: 'danger'
    });

    if (!finalConfirm) return;

    try {
      // Obriši user_courses
      const userCoursesQuery = query(
        collection(db, 'user_courses'),
        where('userId', '==', userId)
      );
      const userCoursesSnapshot = await getDocs(userCoursesQuery);
      for (const docSnap of userCoursesSnapshot.docs) {
        await deleteDoc(docSnap.ref);
      }

      // user_courses documents are keyed by user id
      await deleteDoc(doc(db, 'user_courses', userId));

      // Obriši transactions (both `userId` and legacy `user_id` documents)
      const transactionDocs = await getUserTransactionDocs(userId);
      for (const docSnap of transactionDocs) {
        await deleteDoc(docSnap.ref);
      }

      // Obriši online_enrollments
      const enrollmentsQuery = query(
        collection(db, 'online_enrollments'),
        where('userId', '==', userId)
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      for (const docSnap of enrollmentsSnapshot.docs) {
        await deleteDoc(docSnap.ref);
      }

      // Obriši korisnika iz Firestore
      await deleteDoc(doc(db, 'users', userId));

      // Obriši iz Authentication ako je odabrano
      if (deleteAuth) {
        try {
          const deleteUserAuthFn = httpsCallable(functions, 'deleteUserAuth');
          await deleteUserAuthFn({ userId });
          console.log(`User ${userId} deleted from Authentication`);
        } catch (authError) {
          console.error('Error deleting from Authentication:', authError);
          showToast.error(`Корисник је обрисан из базе, али НИЈЕ обрисан из Authentication:\n${authError.message}\n\nКористите Settings панел да обришете "сирочићке" налоге.`);
        }
      }

      setAllUsers(allUsers.filter(user => user.id !== userId));
      showToast.success(deleteAuth ? 'Корисник је успешно обрисан из базе и Authentication-а.' : 'Корисник је обрисан из базе (али не и из Authentication-а).');
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast.error('Грешка при брисању корисника.');
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedUser(null);
  };

  const handleUserUpdate = () => {
    // Reload users to reflect changes
    loadUsers();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent"></div>
      </div>
    );
  }

  if (allUsers.length === 0) {
    return (
      <div className="text-center py-20">
        <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-ink mb-2">Нема ученика</h3>
        <p className="text-gray-600">Тренутно нема регистрованих ученика.</p>
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog />
      {showDetailModal && (
        <UserDetailModal
          user={selectedUser}
          onClose={handleCloseDetailModal}
          onUpdate={handleUserUpdate}
        />
      )}
      <div className="space-y-6">
        {/* Header with search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-ink">
          Листа Ученика ({allUsers.length})
        </h2>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Претрага по имену, емаилу или телефону..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          />
        </div>
      </div>

      {/* Mobile: card list (below md) */}
      <ul className="md:hidden space-y-3" aria-label="Ученици">
        {displayedUsers.map((user) => (
          <li
            key={user.id}
            className={`rounded-2xl border shadow-sm p-4 ${user.blocked ? 'bg-red-50/40 border-red-100' : 'bg-white border-gray-100'}`}
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-brand flex items-center justify-center text-white font-bold flex-shrink-0">
                {user.ime?.charAt(0) || user.email.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-ink truncate">{user.ime || 'Без имена'}</div>
                <div className="text-sm text-gray-600 truncate">{user.email}</div>
                {user.telefon && (
                  <div className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5" />
                    {user.telefon}
                  </div>
                )}
              </div>
              {user.blocked ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 flex-shrink-0">
                  <Ban className="w-3.5 h-3.5" /> Блокиран
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex-shrink-0">
                  <UserCheck className="w-3.5 h-3.5" /> Активан
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-brand" />
                Курсеви: <strong className="text-ink">{user.coursesCount}</strong>
              </span>
              {user.registrovan_at && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(user.registrovan_at).toLocaleDateString('sr-RS')}
                </span>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2">
              <button
                onClick={() => handleViewUser(user)}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors"
              >
                <Eye className="w-4 h-4" /> Детаљи
              </button>
              <button
                onClick={() => handleBlockUser(user.id, user.blocked)}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  user.blocked
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                }`}
              >
                {user.blocked ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                {user.blocked ? 'Одблокирај' : 'Блокирај'}
              </button>
              <button
                onClick={() => handleDeleteUser(user.id, user.ime || user.email)}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-red-50 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Обриши
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Users Table (md and up) */}
      <div className="hidden md:block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Корисник</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Контакт</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Регистрован</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Курсеви</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Акције</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedUsers.map((user) => (
                <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.blocked ? 'bg-red-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {user.ime?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-ink truncate">
                          {user.ime || 'Без имена'}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-1 truncate">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.telefon ? (
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {user.telefon}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Нема телефона</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.registrovan_at ? (
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(user.registrovan_at).toLocaleDateString('sr-RS')}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-lg w-fit">
                      <BookOpen className="w-4 h-4 text-brand" />
                      <span className="font-bold text-ink text-sm">
                        {user.coursesCount}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.blocked ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        <Ban className="w-3.5 h-3.5" />
                        Блокиран
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        <UserCheck className="w-3.5 h-3.5" />
                        Активан
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="p-2 bg-red-100 text-[#D62828] rounded-lg hover:bg-red-200 transition-colors"
                        title="Прегледај и управљај курсевима"
                        aria-label="Прегледај и управљај курсевима"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleBlockUser(user.id, user.blocked)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.blocked
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        }`}
                        title={user.blocked ? 'Одблокирај' : 'Блокирај'}
                      >
                        {user.blocked ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.ime || user.email)}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        title="Обриши корисника"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            Страна {currentPage} од {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Претходна
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              Следећа
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
