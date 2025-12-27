import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Calendar, Clock, Users, Video, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ScheduleManager() {
  const [sessions, setSessions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));

  useEffect(() => {
    loadData();
  }, []);

  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    return new Date(d.setDate(diff));
  }

  const loadData = async () => {
    try {
      // Load groups
      const groupsSnapshot = await getDocs(collection(db, 'online_groups'));
      const groupsList = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroups(groupsList);

      // Load all sessions
      const sessionsSnapshot = await getDocs(
        query(
          collection(db, 'online_sessions'),
          where('status', 'in', ['scheduled', 'ongoing']),
          orderBy('scheduledDate', 'asc')
        )
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
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = (startDate) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getSessionsForDay = (date) => {
    return sessions.filter(session => {
      const sessionDate = session.scheduledDate.toDate ? session.scheduledDate.toDate() : new Date(session.scheduledDate);
      return sessionDate.toDateString() === date.toDateString();
    });
  };

  const handlePrevWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const handleNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const handleToday = () => {
    setCurrentWeekStart(getStartOfWeek(new Date()));
  };

  const weekDays = getWeekDays(currentWeekStart);
  const dayNames = ['Понедељак', 'Уторак', 'Среда', 'Четвртак', 'Петак', 'Субота', 'Недеља'];

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
          Недељни Распоред
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleToday}
            className="px-4 py-2 bg-gray-100 text-[#1A1A1A] rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Данас
          </button>
          <button
            onClick={handlePrevWeek}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-[#1A1A1A] min-w-[200px] text-center">
            {weekDays[0].toLocaleDateString('sr-RS', { day: 'numeric', month: 'long' })} -{' '}
            {weekDays[6].toLocaleDateString('sr-RS', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={handleNextWeek}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map((day, index) => {
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div
                key={index}
                className={`p-4 text-center border-r border-gray-100 last:border-r-0 ${
                  isToday ? 'bg-[#D62828]/10' : 'bg-gray-50'
                }`}
              >
                <div className="text-sm font-bold text-gray-600">{dayNames[index]}</div>
                <div className={`text-2xl font-black mt-1 ${isToday ? 'text-[#D62828]' : 'text-[#1A1A1A]'}`}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Days Content */}
        <div className="grid grid-cols-7 min-h-[400px]">
          {weekDays.map((day, index) => {
            const daySessions = getSessionsForDay(day);
            const isToday = day.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={`border-r border-gray-100 last:border-r-0 p-3 ${
                  isToday ? 'bg-[#D62828]/5' : ''
                }`}
              >
                <div className="space-y-2">
                  {daySessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      Нема часова
                    </div>
                  ) : (
                    daySessions.map((session) => (
                      <div
                        key={session.id}
                        className="bg-white border-2 border-[#D62828] rounded-lg p-3 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <Clock className="w-4 h-4 text-[#D62828] flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-[#1A1A1A] text-sm">
                              {session.scheduledTime}
                            </div>
                            <div className="text-xs text-gray-600">
                              {session.duration} мин
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 mb-2">
                          <Users className="w-4 h-4 text-[#D62828] flex-shrink-0 mt-0.5" />
                          <div className="text-sm font-semibold text-[#1A1A1A] truncate">
                            {session.group?.name || 'Непозната група'}
                          </div>
                        </div>

                        {session.notes && (
                          <div className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {session.notes}
                          </div>
                        )}

                        {session.meetLink && (
                          <a
                            href={session.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
                          >
                            <Video className="w-3 h-3" />
                            Meet
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6 text-[#D62828]" />
            <h4 className="font-bold text-gray-700">Ова недеља</h4>
          </div>
          <div className="text-3xl font-black text-[#1A1A1A]">
            {sessions.filter(s => {
              const sessionDate = s.scheduledDate.toDate ? s.scheduledDate.toDate() : new Date(s.scheduledDate);
              return sessionDate >= weekDays[0] && sessionDate <= weekDays[6];
            }).length}
          </div>
          <div className="text-sm text-gray-600">часова заказано</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-[#D62828]" />
            <h4 className="font-bold text-gray-700">Активне групе</h4>
          </div>
          <div className="text-3xl font-black text-[#1A1A1A]">
            {groups.filter(g => g.isActive).length}
          </div>
          <div className="text-sm text-gray-600">у раду</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-[#D62828]" />
            <h4 className="font-bold text-gray-700">Укупно часова</h4>
          </div>
          <div className="text-3xl font-black text-[#1A1A1A]">
            {sessions.length}
          </div>
          <div className="text-sm text-gray-600">заказано</div>
        </div>
      </div>
    </div>
  );
}
