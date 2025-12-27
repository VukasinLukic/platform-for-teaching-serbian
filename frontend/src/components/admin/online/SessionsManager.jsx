import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Calendar, Plus, Edit2, Trash2, X, Save, Video, Users, Clock } from 'lucide-react';
import { showToast } from '../../../utils/toast';
import { useConfirm } from '../../../hooks/useConfirm';

export default function SessionsManager() {
  const { confirm, ConfirmDialog } = useConfirm();
  const [sessions, setSessions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    groupId: '',
    scheduledDate: '',
    scheduledTime: '10:00',
    duration: 90,
    meetLink: '',
    notes: '',
    status: 'scheduled'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load groups
      const groupsSnapshot = await getDocs(collection(db, 'online_groups'));
      const groupsList = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroups(groupsList);

      // Load sessions
      const sessionsSnapshot = await getDocs(
        query(collection(db, 'online_sessions'), orderBy('scheduledDate', 'desc'))
      );

      const sessionsList = await Promise.all(
        sessionsSnapshot.docs.map(async (sessionDoc) => {
          const sessionData = { id: sessionDoc.id, ...sessionDoc.data() };

          // Load group data
          if (sessionData.groupId) {
            const group = groupsList.find(g => g.id === sessionData.groupId);
            if (group) {
              sessionData.group = group;
            }
          }

          return sessionData;
        })
      );

      setSessions(sessionsList);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (session = null) => {
    if (session) {
      setEditingSession(session);
      const sessionDate = session.scheduledDate.toDate ? session.scheduledDate.toDate() : new Date(session.scheduledDate);
      setFormData({
        groupId: session.groupId,
        scheduledDate: sessionDate.toISOString().split('T')[0],
        scheduledTime: session.scheduledTime,
        duration: session.duration,
        meetLink: session.meetLink || '',
        notes: session.notes || '',
        status: session.status
      });
    } else {
      setEditingSession(null);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData({
        groupId: '',
        scheduledDate: tomorrow.toISOString().split('T')[0],
        scheduledTime: '10:00',
        duration: 90,
        meetLink: '',
        notes: '',
        status: 'scheduled'
      });
    }
    setShowModal(true);
  };

  const handleSaveSession = async () => {
    if (!formData.groupId || !formData.scheduledDate || !formData.scheduledTime) {
      showToast.error('Молимо попуните сва обавезна поља');
      return;
    }

    try {
      const sessionData = {
        groupId: formData.groupId,
        scheduledDate: new Date(formData.scheduledDate + 'T' + formData.scheduledTime),
        scheduledTime: formData.scheduledTime,
        duration: parseInt(formData.duration),
        meetLink: formData.meetLink,
        notes: formData.notes,
        status: formData.status,
        attendance: {},
        updatedAt: new Date()
      };

      if (editingSession) {
        // Check if status is changing to completed
        const wasNotCompleted = editingSession.status !== 'completed';
        const isNowCompleted = formData.status === 'completed';

        await updateDoc(doc(db, 'online_sessions', editingSession.id), sessionData);

        // If status changed to completed, reduce remaining classes for all students in the group
        if (wasNotCompleted && isNowCompleted) {
          await reduceClassesForGroup(formData.groupId);
        }

        showToast.success('Час је успешно ажуриран');
      } else {
        await addDoc(collection(db, 'online_sessions'), {
          ...sessionData,
          enrollmentIds: [],
          createdAt: new Date()
        });
        showToast.success('Час је успешно креиран');
      }

      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving session:', error);
      showToast.error('Грешка при чувању часа');
    }
  };

  const reduceClassesForGroup = async (groupId) => {
    try {
      // Get all enrollments for this group
      const enrollmentsQuery = query(
        collection(db, 'online_enrollments'),
        where('groupId', '==', groupId),
        where('status', '==', 'active')
      );

      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

      // Update each enrollment
      const updatePromises = enrollmentsSnapshot.docs.map(async (enrollDoc) => {
        const enrollData = enrollDoc.data();
        const remainingClasses = enrollData.remainingClasses || 0;
        const usedClasses = enrollData.usedClasses || 0;

        // Only reduce if there are remaining classes
        if (remainingClasses > 0) {
          await updateDoc(doc(db, 'online_enrollments', enrollDoc.id), {
            remainingClasses: remainingClasses - 1,
            usedClasses: usedClasses + 1,
            updatedAt: new Date()
          });
        }
      });

      await Promise.all(updatePromises);
      console.log(`Reduced classes for ${enrollmentsSnapshot.docs.length} students in group ${groupId}`);
    } catch (error) {
      console.error('Error reducing classes for group:', error);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    const confirmed = await confirm({
      title: 'Обриши час',
      message: 'Да ли сте сигурни да желите да обришете овај час?',
      confirmText: 'Обриши',
      cancelText: 'Откажи',
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'online_sessions', sessionId));
      showToast.success('Час је успешно обрисан');
      loadData();
    } catch (error) {
      console.error('Error deleting session:', error);
      showToast.error('Грешка при брисању часа');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Заказано' },
      ongoing: { bg: 'bg-green-100', text: 'text-green-700', label: 'У току' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Завршено' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Отказано' }
    };
    const badge = badges[status] || badges.scheduled;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
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
          Часови ({sessions.length})
        </h3>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#D62828] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#B91F1F] transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Закажи Час
        </button>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Нема заказаних часова</h3>
          <p className="text-gray-600 mb-6">Закажите први час за групу</p>
          <button
            onClick={() => handleOpenModal()}
            className="bg-[#D62828] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#B91F1F] transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Закажи Час
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const sessionDate = session.scheduledDate.toDate ? session.scheduledDate.toDate() : new Date(session.scheduledDate);

            return (
              <div
                key={session.id}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Group & Date */}
                    <div className="flex items-center gap-4 mb-3">
                      <h4 className="text-lg font-bold text-[#1A1A1A]">
                        {session.group?.name || 'Непозната група'}
                      </h4>
                      {getStatusBadge(session.status)}
                    </div>

                    {/* Notes */}
                    {session.notes && (
                      <p className="text-gray-600 mb-3">{session.notes}</p>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                          <Calendar className="w-4 h-4" />
                          Датум
                        </div>
                        <div className="font-semibold text-[#1A1A1A]">
                          {sessionDate.toLocaleDateString('sr-RS')}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                          <Clock className="w-4 h-4" />
                          Време
                        </div>
                        <div className="font-semibold text-[#1A1A1A]">
                          {session.scheduledTime}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                          <Clock className="w-4 h-4" />
                          Трајање
                        </div>
                        <div className="font-semibold text-[#1A1A1A]">
                          {session.duration} мин
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                          <Users className="w-4 h-4" />
                          Наставник
                        </div>
                        <div className="font-semibold text-[#1A1A1A]">
                          {session.group?.teacherName || '-'}
                        </div>
                      </div>
                    </div>

                    {/* Meet Link */}
                    {session.meetLink && (
                      <div className="flex items-center gap-2 bg-green-50 rounded-lg p-3">
                        <Video className="w-5 h-5 text-green-600" />
                        <a
                          href={session.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-700 hover:text-green-800 font-medium text-sm break-all"
                        >
                          {session.meetLink}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleOpenModal(session)}
                      className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Измени"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      title="Обриши"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
                  {editingSession ? 'Измени Час' : 'Закажи Час'}
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
                    Група *
                  </label>
                  <select
                    value={formData.groupId}
                    onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent"
                  >
                    <option value="">Изаберите групу</option>
                    {groups.filter(g => g.isActive).map(group => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Датум *
                    </label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Време *
                    </label>
                    <input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Трајање (минути)
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

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Google Meet Link
                  </label>
                  <input
                    type="url"
                    value={formData.meetLink}
                    onChange={(e) => setFormData({ ...formData, meetLink: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent"
                    placeholder="https://meet.google.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Белешке
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent"
                    rows="3"
                    placeholder="нпр. Тема: Основе српског језика"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Статус
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent"
                  >
                    <option value="scheduled">Заказано</option>
                    <option value="ongoing">У току</option>
                    <option value="completed">Завршено</option>
                    <option value="cancelled">Отказано</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveSession}
                  disabled={!formData.groupId || !formData.scheduledDate || !formData.scheduledTime}
                  className="flex-1 bg-[#D62828] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#B91F1F] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingSession ? 'Сачувај Измене' : 'Закажи Час'}
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
