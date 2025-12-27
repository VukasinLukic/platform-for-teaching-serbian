import { useState } from 'react';
import { Users, UserCheck, Calendar, Clock } from 'lucide-react';
import GroupsManager from './online/GroupsManager';
import ParticipantsManager from './online/ParticipantsManager';
import SessionsManager from './online/SessionsManager';
import ScheduleManager from './online/ScheduleManager';

export default function OnlineClassManager() {
  const [activeTab, setActiveTab] = useState('groups');

  const tabs = [
    { id: 'groups', label: 'Групе', icon: Users },
    { id: 'participants', label: 'Учесници', icon: UserCheck },
    { id: 'sessions', label: 'Часови', icon: Calendar },
    { id: 'schedule', label: 'Распоред', icon: Clock }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#D62828] text-[#D62828]'
                : 'border-transparent text-gray-500 hover:text-[#1A1A1A]'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'groups' && <GroupsManager />}
        {activeTab === 'participants' && <ParticipantsManager />}
        {activeTab === 'sessions' && <SessionsManager />}
        {activeTab === 'schedule' && <ScheduleManager />}
      </div>
    </div>
  );
}
