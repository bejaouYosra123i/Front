import { useState } from 'react';
import { HiUser, HiPencil, HiKey } from 'react-icons/hi';
import ProfilePage from './ProfilePage';
import UpdateProfilePage from './UpdateProfilePage';
import UpdatePasswordPage from './UpdatePasswordPage';

const tabs = [
  { label: 'Profile', icon: <HiUser className="inline text-xl mr-2" /> },
  { label: 'Modifier infos', icon: <HiPencil className="inline text-xl mr-2" /> },
  { label: 'Update password', icon: <HiKey className="inline text-xl mr-2" /> },
];

const ProfileTabsPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-2 bg-[#f7f7f7] font-['Roboto','Arial',sans-serif]">
      <div className="w-full max-w-2xl flex bg-white rounded-lg shadow border border-gray-200 mb-8 overflow-hidden">
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            className={`flex-1 flex items-center justify-center py-3 px-2 text-base font-semibold transition-all duration-200
              border-r border-gray-200 last:border-r-0
              ${activeTab === idx
                ? 'bg-[#e60012] text-white shadow-sm'
                : 'bg-white text-gray-800 hover:bg-gray-100 hover:text-[#e60012]'}
              `}
            style={{ fontFamily: 'Roboto, Arial, sans-serif', borderBottom: activeTab === idx ? '3px solid #e60012' : '3px solid transparent' }}
            onClick={() => setActiveTab(idx)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="w-full max-w-2xl">
        {activeTab === 0 && <ProfilePage />}
        {activeTab === 1 && <UpdateProfilePage />}
        {activeTab === 2 && <UpdatePasswordPage />}
      </div>
    </div>
  );
};

export default ProfileTabsPage; 