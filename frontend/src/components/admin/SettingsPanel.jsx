import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';
import { Settings, User, Mail, Phone, Lock, Save, Bell, Globe, Shield, Trash2, AlertTriangle } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';
import { showToast } from '../../utils/toast';
import { useConfirm } from '../../hooks/useConfirm';

export default function SettingsPanel() {
  const { confirm, ConfirmDialog } = useConfirm();
  const { user, userProfile } = useAuthStore();
  const [profile, setProfile] = useState({
    ime: '',
    email: '',
    telefon: ''
  });
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    autoApprovePayments: false,
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cleaningAuth, setCleaningAuth] = useState(false);
  const [orphanedUsers, setOrphanedUsers] = useState([]);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      if (userProfile) {
        setProfile({
          ime: userProfile.ime || '',
          email: userProfile.email || '',
          telefon: userProfile.telefon || ''
        });
      }

      // Učitaj settings iz Firestore
      const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
      if (settingsDoc.exists()) {
        setSettings({ ...settings, ...settingsDoc.data() });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSettingChange = (key) => {
    setSettings({
      ...settings,
      [key]: !settings[key]
    });
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...userProfile,
        ...profile,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      showToast.success('Профил је успешно ажуриран.');
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast.error('Грешка при чувању профила.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'general'), {
        ...settings,
        updatedAt: new Date().toISOString()
      });

      showToast.success('Подешавања су успешно сачувана.');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast.error('Грешка при чувању подешавања.');
    } finally {
      setSaving(false);
    }
  };

  const handleFindOrphanedUsers = async () => {
    setCleaningAuth(true);
    try {
      // Get all users from Firestore
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const firestoreUserIds = usersSnapshot.docs.map(doc => doc.id);

      // Note: We can't directly query Firebase Auth from frontend
      // We'll show a message that they need to use the bulk delete feature
      showToast.info(`Пронађено је ${firestoreUserIds.length} корисника у Firestore бази.\n\nКористите опцију "Обриши налоге избрисаних корисника" да обришете налоге из Authentication који не постоје више у бази података.`);
    } catch (error) {
      console.error('Error finding orphaned users:', error);
      showToast.error('Грешка при претрази корисника.');
    } finally {
      setCleaningAuth(false);
    }
  };

  const handleCleanOrphanedAuthAccounts = async () => {
    const confirmed = await confirm({
      title: 'Обриши сирочићке налоге',
      message: 'Да ли сте сигурни да желите да обришете све Authentication налоге који не постоје у Firestore бази?\n\nОво ће обрисати све "сирочићке" налоге из Authentication система.',
      confirmText: 'Обриши',
      cancelText: 'Откажи',
      variant: 'danger'
    });

    if (!confirmed) return;

    setCleaningAuth(true);
    try {
      // Get all user IDs from Firestore
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const firestoreUserIds = usersSnapshot.docs.map(doc => doc.id);

      // Call Cloud Function to get all auth users and delete orphaned ones
      // Note: This would require a Cloud Function that lists all auth users and compares
      showToast.info('Ова функција захтева Cloud Function који листа све Authentication кориснике.\n\nЗа сада користите "Списак ученика" да ручно обришете кориснике.');
    } catch (error) {
      console.error('Error cleaning orphaned accounts:', error);
      showToast.error('Грешка при чишћењу налога.');
    } finally {
      setCleaningAuth(false);
    }
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
      <div className="space-y-8">
        {/* Profile Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D62828] rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A]">Профил</h3>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Име и презиме
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="ime"
                value={profile.ime}
                onChange={handleProfileChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent"
                placeholder="Унесите име и презиме"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent"
                placeholder="email@example.com"
                disabled
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Емаил адреса се не може променити</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Телефон
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="telefon"
                value={profile.telefon}
                onChange={handleProfileChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent"
                placeholder="0601234567"
              />
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 bg-[#D62828] text-white rounded-xl font-bold hover:bg-[#B91F1F] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Чување...' : 'Сачувај профил'}
          </button>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D62828] rounded-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A]">Системска подешавања</h3>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Email Notifications */}
          <div className="flex items-start justify-between pb-6 border-b border-gray-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-[#1A1A1A] mb-1">Емаил нотификације</h4>
                <p className="text-sm text-gray-600">Примајте обавештења на емаил о новим уплатама и корисницима</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleSettingChange('emailNotifications')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#D62828]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D62828]"></div>
            </label>
          </div>

          {/* SMS Notifications */}
          <div className="flex items-start justify-between pb-6 border-b border-gray-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-[#1A1A1A] mb-1">SMS нотификације</h4>
                <p className="text-sm text-gray-600">Примајте СМС поруке о важним догађајима</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={() => handleSettingChange('smsNotifications')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#D62828]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D62828]"></div>
            </label>
          </div>

          {/* Auto Approve Payments */}
          <div className="flex items-start justify-between pb-6 border-b border-gray-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Shield className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-bold text-[#1A1A1A] mb-1">Аутоматско одобравање уплата</h4>
                <p className="text-sm text-gray-600">Аутоматски одобри уплате без ручне провере (не препоручује се)</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoApprovePayments}
                onChange={() => handleSettingChange('autoApprovePayments')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#D62828]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D62828]"></div>
            </label>
          </div>

          {/* Maintenance Mode */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Globe className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-[#1A1A1A] mb-1">Режим одржавања</h4>
                <p className="text-sm text-gray-600">Привремено онемогући приступ платформи за кориснике</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={() => handleSettingChange('maintenanceMode')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#D62828]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D62828]"></div>
            </label>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 bg-[#D62828] text-white rounded-xl font-bold hover:bg-[#B91F1F] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Чување...' : 'Сачувај подешавања'}
          </button>
        </div>
      </div>

      {/* Authentication Management */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-red-50 to-white px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1A1A1A]">Управљање Authentication налозима</h3>
              <p className="text-sm text-gray-600 mt-1">Обриши кориснике из Firebase Authentication система</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-bold mb-2">Важно упозорење:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Када обришете корисника из "Списак ученика", он се брише само из Firestore базе</li>
                  <li>Корисник и даље може да се пријави јер његов налог постоји у Firebase Authentication</li>
                  <li>Користите дугме испод да обришете налоге из Authentication система</li>
                  <li>Ова акција је ТРАЈНА и не може се опозвати!</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#1A1A1A] mb-2">Обриши "сирочићке" Authentication налоге</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Ово ће пронаћи и обрисати све налоге из Firebase Authentication који више не постоје у Firestore бази података.
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Напомена: Тренутно морате ручно да обришете налоге преко "Списак ученика" панела. Ова опција ће бити доступна након deploy-а Cloud Function-а.
                  </p>
                  <button
                    onClick={handleFindOrphanedUsers}
                    disabled={cleaningAuth}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    {cleaningAuth ? 'Обрада...' : 'Провери статус'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-200 rounded-lg">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#1A1A1A] mb-2">Како ово ради?</h4>
                  <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                    <li>Одите на <strong>"Списак ученика"</strong> и обришите кориснике које желите да уклоните</li>
                    <li>То ће их обрисати из Firestore базе, али не и из Authentication-а</li>
                    <li>Одите на <strong>"Списак ученика"</strong> поново и користите дугме за брисање Authentication налога</li>
                    <li>Корисник више неће моћи да се пријави</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
