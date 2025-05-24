import React from 'react';
import useAuth from '../../hooks/useAuth.hook';
import { FiUser, FiMail, FiShield } from 'react-icons/fi';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const initial = user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="flex justify-center items-start min-h-[60vh] w-full bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 mt-8 border border-gray-100 transition-all duration-300 hover:shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-md">
            {initial}
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 text-center">Profile Information</h1>
          <p className="text-gray-500 text-center max-w-md">Manage your personal information and account settings</p>
        </div>
        
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiUser className="text-gray-400" />
                First Name
              </label>
              <input 
                type="text" 
                value={user?.firstName || ''} 
                disabled 
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FiUser className="text-gray-400" />
                Last Name
              </label>
              <input 
                type="text" 
                value={user?.lastName || ''} 
                disabled 
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FiMail className="text-gray-400" />
              Email Address
            </label>
            <input 
              type="email" 
              value={user?.email || ''} 
              disabled 
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FiShield className="text-gray-400" />
              Role
            </label>
            <input 
              type="text" 
              value={user?.roles?.[0] || ''} 
              disabled 
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage; 