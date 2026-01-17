import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, AlertCircle, Info, Trash2, CheckCheck, X } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';

/**
 * NotificationDropdown - Dropdown za prikaz svih notifikacija u admin panelu
 * Prikazuje istoriju svih toast poruka sa mogucnoscu oznacavanja kao procitane
 */
export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  } = useNotificationStore();

  // Zatvori dropdown kada se klikne van njega
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = (type, read) => {
    if (read) return 'bg-gray-50';

    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
      case 'warning':
        return 'bg-yellow-50';
      default:
        return 'bg-blue-50';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Upravo sada';
    if (diffInMinutes < 60) return `Pre ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Pre ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Juce';
    if (diffInDays < 7) return `Pre ${diffInDays} dana`;

    return date.toLocaleDateString('sr-Latn-RS', {
      day: 'numeric',
      month: 'short'
    });
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-[#1A1A1A] transition rounded-lg hover:bg-gray-100"
      >
        <Bell size={20} className="md:w-6 md:h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-[#D62828] text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-scale-in">
          {/* Header */}
          <div className="px-4 py-3 bg-[#1A1A1A] text-white flex items-center justify-between">
            <h3 className="font-bold text-lg">Obavestenja</h3>
            {notifications.length > 0 && (
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[#F2C94C] hover:text-white transition flex items-center gap-1"
                    title="Oznaci sve kao procitano"
                  >
                    <CheckCheck size={14} />
                    <span className="hidden md:inline">Procitaj sve</span>
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-400 hover:text-red-400 transition flex items-center gap-1"
                  title="Obrisi sve"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Nema obavestenja</p>
                <p className="text-sm text-gray-400">Ovde ce se pojaviti sve aktivnosti</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                      getBackgroundColor(notification.type, notification.read)
                    } ${!notification.read ? 'border-l-4 border-l-[#D62828]' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        {notification.title && (
                          <p className="font-bold text-[#1A1A1A] text-sm mb-0.5">
                            {notification.title}
                          </p>
                        )}
                        <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-[#1A1A1A]'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                        title="Obrisi"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                {notifications.length} obavestenj{notifications.length === 1 ? 'e' : 'a'} ukupno
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
