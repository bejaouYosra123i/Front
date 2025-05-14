import React from 'react';
import useAuth from '../../hooks/useAuth.hook';
import { useNavigate } from 'react-router-dom';
import { PATH_DASHBOARD } from '../../routes/paths';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 mt-8">
      <h1 className="text-3xl font-bold mb-2">Informations personnelles</h1>
      <p className="text-gray-500 mb-6">Mettez à jour vos informations de profil.</p>
      <div className="flex flex-col items-center mb-8">
        <div className="w-32 h-32 rounded-full bg-red-100 flex items-center justify-center text-red-400 text-6xl">
          <span>{user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}</span>
        </div>
      </div>
      <form className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Nom</label>
          <input type="text" value={user?.firstName || ''} disabled className="w-full border rounded px-3 py-2 bg-gray-100" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Prénom</label>
          <input type="text" value={user?.lastName || ''} disabled className="w-full border rounded px-3 py-2 bg-gray-100" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input type="email" value={user?.email || ''} disabled className="w-full border rounded px-3 py-2 bg-gray-100" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Rôle</label>
          <input type="text" value={user?.roles?.[0] || ''} disabled className="w-full border rounded px-3 py-2 bg-gray-100" />
        </div>
        <button
          type="button"
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded mt-6"
          onClick={() => navigate(PATH_DASHBOARD.updateCredentials)}
        >
          Modifier mes informations
        </button>
      </form>
    </div>
  );
};

export default ProfilePage; 