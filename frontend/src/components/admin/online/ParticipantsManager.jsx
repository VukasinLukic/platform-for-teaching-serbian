import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Users, Search, UserCheck, Calendar, Clock, Edit2, X, Save } from 'lucide-react';
import { formatDate } from '../../../utils/helpers';
import { getPackageById } from '../../../utils/packageHelpers';
import { showToast } from '../../../utils/toast';

export default function ParticipantsManager() {
  const [enrollments, setEnrollments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load all groups
      const groupsSnapshot = await getDocs(collection(db, 'online_groups'));
      const groupsList = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroups(groupsList);

      // Load all enrollments
      const enrollmentsSnapshot = await getDocs(collection(db, 'online_enrollments'));

      const enrollmentsList = await Promise.all(
        enrollmentsSnapshot.docs.map(async (enrollDoc) => {
          const enrollData = { id: enrollDoc.id, ...enrollDoc.data() };

          // Load user data
          if (enrollData.userId) {
            const userDoc = await getDoc(doc(db, 'users', enrollData.userId));
            if (userDoc.exists()) {
              enrollData.user = userDoc.data();
            }
          }

          // Load package data from JSON file
          if (enrollData.packageId) {
            const packageData = await getPackageById(enrollData.packageId);
            if (packageData) {
              enrollData.package = packageData;
            }
          }

          // Load group data
          if (enrollData.groupId) {
            const group = groupsList.find(g => g.id === enrollData.groupId);
            if (group) {
              enrollData.group = group;
            }
          }

          return enrollData;
        })
      );

      // Filter out enrollments without valid users
      const validEnrollments = enrollmentsList.filter(enrollment =>
        enrollment.user && enrollment.user !== null && enrollment.user !== undefined
      );

      setEnrollments(validEnrollments);
    } catch (error) {
      console.error('Error loading participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToGroup = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setSelectedGroupId(enrollment.groupId || '');
    setShowAssignModal(true);
  };

  const handleSaveGroupAssignment = async () => {
    if (!selectedEnrollment) return;

    try {
      await updateDoc(doc(db, 'online_enrollments', selectedEnrollment.id), {
        groupId: selectedGroupId || null,
        updatedAt: new Date()
      });

      showToast.success('Учесник је успешно додат у групу');
      setShowAssignModal(false);
      loadData();
    } catch (error) {
      console.error('Error assigning to group:', error);
      showToast.error('Грешка при додавању у групу');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'На чекању' },
      active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Активан' },
      expired: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Истекао' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Отказан' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  // Filter enrollments
  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = !searchTerm ||
      enrollment.user?.ime?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || enrollment.status === filterStatus;
    const matchesGroup = filterGroup === 'all' ||
      (filterGroup === 'unassigned' && !enrollment.groupId) ||
      enrollment.groupId === filterGroup;

    return matchesSearch && matchesStatus && matchesGroup;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D62828] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-[#1A1A1A]">
          Учесници ({filteredEnrollments.length})
        </h3>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Претрага по имену или емаилу..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent"
        >
          <option value="all">Сви статуси</option>
          <option value="pending">На чекању</option>
          <option value="active">Активан</option>
          <option value="expired">Истекао</option>
          <option value="cancelled">Отказан</option>
        </select>

        {/* Group Filter */}
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent"
        >
          <option value="all">Све групе</option>
          <option value="unassigned">Без групе</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
      </div>

      {/* Participants Table */}
      {filteredEnrollments.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Нема учесника</h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'all' || filterGroup !== 'all'
              ? 'Нема резултата за задате филтере'
              : 'Тренутно нема регистрованих учесника'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Учесник</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Пакет</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Група</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Часови</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Статус</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Важи до</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Акције</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-[#1A1A1A]">
                          {enrollment.user?.ime || 'Непознато име'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {enrollment.user?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {enrollment.package?.name || 'Непознат пакет'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {enrollment.group ? (
                        <div className="text-sm">
                          <div className="font-semibold text-[#1A1A1A]">{enrollment.group.name}</div>
                          <div className="text-gray-500">{enrollment.group.teacherName}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Није додељено</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-black text-[#D62828]">
                          {enrollment.remainingClasses || 0}
                        </div>
                        <div className="text-xs text-gray-500">
                          / {(enrollment.remainingClasses || 0) + (enrollment.usedClasses || 0)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(enrollment.status)}
                    </td>
                    <td className="px-6 py-4">
                      {enrollment.endDate ? (
                        <div className="text-sm text-gray-600">
                          {new Date(enrollment.endDate.toDate ? enrollment.endDate.toDate() : enrollment.endDate).toLocaleDateString('sr-RS')}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleAssignToGroup(enrollment)}
                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Додели групу"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign to Group Modal */}
      {showAssignModal && selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[#1A1A1A]">Додели групу</h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="font-semibold text-[#1A1A1A] mb-1">
                  {selectedEnrollment.user?.ime}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedEnrollment.user?.email}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Пакет: {selectedEnrollment.package?.name}
                </div>
              </div>

              {/* Group Selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Изабери групу
                </label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent"
                >
                  <option value="">Без групе</option>
                  {groups.filter(g => g.isActive).map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.currentStudents || 0}/{group.maxStudents})
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveGroupAssignment}
                  className="flex-1 bg-[#D62828] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#B91F1F] transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Сачувај
                </button>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="bg-gray-100 text-[#1A1A1A] px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Откажи
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
