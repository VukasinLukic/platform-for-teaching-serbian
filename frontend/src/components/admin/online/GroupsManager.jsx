import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useAuthStore } from '../../../store/authStore';
import { Users, Plus, Edit2, Trash2, X, Save, Calendar, Clock } from 'lucide-react';
import { showToast } from '../../../utils/toast';
import { useConfirm } from '../../../hooks/useConfirm';

export default function GroupsManager() {
  const { confirm, ConfirmDialog } = useConfirm();
  const { userProfile } = useAuthStore();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    level: 'beginner',
    maxStudents: 8,
    teacherId: '',
    teacherName: '',
    dayOfWeek: 6, // Saturday
    time: '10:00',
    duration: 90,
    isActive: true
  });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'online_groups'));
      const groupsList = await Promise.all(
        snapshot.docs.map(async (groupDoc) => {
          const groupData = { id: groupDoc.id, ...groupDoc.data() };

          // Count current students
          const enrollmentsQuery = query(
            collection(db, 'online_enrollments'),
            where('groupId', '==', groupDoc.id),
            where('status', '==', 'active')
          );
          const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
          groupData.currentStudents = enrollmentsSnapshot.size;

          return groupData;
        })
      );

      setGroups(groupsList);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (group = null) => {
    if (group) {
      setEditingGroup(group);
      setFormData({
        name: group.name,
        level: group.level,
        maxStudents: group.maxStudents,
        teacherId: group.teacherId || '',
        teacherName: group.teacherName,
        dayOfWeek: group.schedule?.dayOfWeek || 6,
        time: group.schedule?.time || '10:00',
        duration: group.schedule?.duration || 90,
        isActive: group.isActive
      });
    } else {
      setEditingGroup(null);
      setFormData({
        name: '',
        level: 'beginner',
        maxStudents: 8,
        teacherId: userProfile?.uid || '',
        teacherName: userProfile?.ime || '',
        dayOfWeek: 6,
        time: '10:00',
        duration: 90,
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleSaveGroup = async () => {
    try {
      const groupData = {
        name: formData.name,
        level: formData.level,
        maxStudents: parseInt(formData.maxStudents),
        teacherId: formData.teacherId,
        teacherName: formData.teacherName,
        schedule: {
          dayOfWeek: parseInt(formData.dayOfWeek),
          time: formData.time,
          duration: parseInt(formData.duration)
        },
        isActive: formData.isActive,
        updatedAt: new Date()
      };

      if (editingGroup) {
        await updateDoc(doc(db, 'online_groups', editingGroup.id), groupData);
        showToast.success('Група је успешно ажурирана');
      } else {
        await addDoc(collection(db, 'online_groups'), {
          ...groupData,
          currentStudents: 0,
          createdAt: new Date()
        });
        showToast.success('Група је успешно креирана');
      }

      setShowModal(false);
      loadGroups();
    } catch (error) {
      console.error('Error saving group:', error);
      showToast.error('Грешка при чувању групе');
    }
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    const confirmed = await confirm({
      title: 'Обриши групу',
      message: `Да ли сте сигурни да желите да обришете групу "${groupName}"?`,
      confirmText: 'Обриши',
      cancelText: 'Откажи',
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      // Remove group assignment from enrollments
      const enrollmentsQuery = query(
        collection(db, 'online_enrollments'),
        where('groupId', '==', groupId)
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

      for (const enrollDoc of enrollmentsSnapshot.docs) {
        await updateDoc(enrollDoc.ref, {
          groupId: null
        });
      }

      await deleteDoc(doc(db, 'online_groups', groupId));
      showToast.success('Група је успешно обрисана');
      loadGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      showToast.error('Грешка при брисању групе');
    }
  };

  const getDayName = (dayOfWeek) => {
    const days = ['Недеља', 'Понедељак', 'Уторак', 'Среда', 'Четвртак', 'Петак', 'Субота'];
    return days[dayOfWeek] || '';
  };

  const getLevelName = (level) => {
    const levels = {
      beginner: 'Почетни',
      intermediate: 'Средњи',
      advanced: 'Напредни'
    };
    return levels[level] || level;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D62828] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-[#1A1A1A]">
          Групе ({groups.length})
        </h3>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#D62828] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#B91F1F] transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Креирај Групу
        </button>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Нема група</h3>
          <p className="text-gray-600 mb-6">Креирајте своју прву групу за онлајн часове</p>
          <button
            onClick={() => handleOpenModal()}
            className="bg-[#D62828] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#B91F1F] transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Креирај Групу
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className={`bg-white rounded-2xl p-6 border-2 ${
                group.isActive ? 'border-gray-100' : 'border-gray-300 opacity-60'
              } shadow-sm hover:shadow-md transition-all`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-[#1A1A1A] mb-1">{group.name}</h4>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {getLevelName(group.level)}
                  </span>
                </div>
                {!group.isActive && (
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                    Неактивна
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="bg-gradient-to-r from-[#D62828]/10 to-[#F2C94C]/10 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#D62828]" />
                    <span className="text-sm text-gray-600">Ученика:</span>
                  </div>
                  <span className="text-xl font-black text-[#1A1A1A]">
                    {group.currentStudents || 0}/{group.maxStudents}
                  </span>
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-[#D62828]" />
                  <span>{getDayName(group.schedule?.dayOfWeek)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-[#D62828]" />
                  <span>{group.schedule?.time} ({group.schedule?.duration} мин)</span>
                </div>
              </div>

              {/* Teacher */}
              <div className="pt-4 border-t border-gray-100 mb-4">
                <div className="text-xs text-gray-500 mb-1">Наставник</div>
                <div className="font-semibold text-[#1A1A1A]">{group.teacherName}</div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(group)}
                  className="flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Измени
                </button>
                <button
                  onClick={() => handleDeleteGroup(group.id, group.name)}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[#1A1A1A]">
                  {editingGroup ? 'Измени Групу' : 'Креирај Групу'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Назив групе *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent"
                    placeholder="нпр. Група А - Почетни ниво"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Ниво
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent"
                    >
                      <option value="beginner">Почетни</option>
                      <option value="intermediate">Средњи</option>
                      <option value="advanced">Напредни</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Макс. број ученика
                    </label>
                    <input
                      type="number"
                      value={formData.maxStudents}
                      onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent"
                      min="1"
                      max="20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Наставник
                  </label>
                  <input
                    type="text"
                    value={formData.teacherName}
                    onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent"
                    placeholder="Име наставника"
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-bold text-[#1A1A1A] mb-4">Распоред</h4>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Дан
                      </label>
                      <select
                        value={formData.dayOfWeek}
                        onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent"
                      >
                        <option value="0">Недеља</option>
                        <option value="1">Понедељак</option>
                        <option value="2">Уторак</option>
                        <option value="3">Среда</option>
                        <option value="4">Четвртак</option>
                        <option value="5">Петак</option>
                        <option value="6">Субота</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Време
                      </label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Трајање (мин)
                      </label>
                      <input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent"
                        min="30"
                        step="15"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-[#D62828] border-gray-300 rounded focus:ring-[#D62828]"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                    Група је активна
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveGroup}
                  disabled={!formData.name || !formData.teacherName}
                  className="flex-1 bg-[#D62828] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#B91F1F] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingGroup ? 'Сачувај Измене' : 'Креирај Групу'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
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
    </>
  );
}
