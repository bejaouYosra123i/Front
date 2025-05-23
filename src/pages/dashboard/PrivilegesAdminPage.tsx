import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { USERS_LIST_URL } from '../../utils/globalConfig';
import { IAuthUser } from '../../types/auth.types';
import { toast } from 'react-hot-toast';

interface Privilege {
  id: number;
  name: string;
  description: string;
}

interface UserPrivilege {
  id: number;
  privilegeId: number;
  privilegeName: string;
  userId: string;
  startDate?: string;
  endDate?: string;
}

const PrivilegesAdminPage: React.FC = () => {
  const [users, setUsers] = useState<IAuthUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<IAuthUser | null>(null);
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [userPrivileges, setUserPrivileges] = useState<UserPrivilege[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedPrivilegeId, setSelectedPrivilegeId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Charger la liste des utilisateurs
  useEffect(() => {
    setLoading(true);
    axiosInstance.get<IAuthUser[]>(USERS_LIST_URL)
      .then(res => setUsers(res.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  // Charger la liste des privilèges
  useEffect(() => {
    axiosInstance.get<Privilege[]>('/Privilege/all')
      .then(res => setPrivileges(res.data))
      .catch(() => toast.error('Failed to load privileges'));
  }, []);

  // Charger les privilèges de l'utilisateur sélectionné
  useEffect(() => {
    if (selectedUser) {
      setLoading(true);
      axiosInstance.get<UserPrivilege[]>(`/Privilege/user/${selectedUser.id}`)
        .then(res => setUserPrivileges(res.data))
        .catch(() => toast.error('Failed to load user privileges'))
        .finally(() => setLoading(false));
    } else {
      setUserPrivileges([]);
    }
  }, [selectedUser]);

  const handleAssign = async () => {
    if (!selectedUser || !selectedPrivilegeId) return;
    setAssigning(true);
    try {
      await axiosInstance.post('/Privilege/assign', {
        userId: selectedUser.id,
        privilegeId: selectedPrivilegeId,
        startDate: startDate || null,
        endDate: endDate || null,
      });
      toast.success('Privilege assigned!');
      // Refresh user privileges
      const res = await axiosInstance.get<UserPrivilege[]>(`/Privilege/user/${selectedUser.id}`);
      setUserPrivileges(res.data);
    } catch {
      toast.error('Failed to assign privilege');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async (privilegeId: number) => {
    if (!selectedUser) return;
    setAssigning(true);
    try {
      await axiosInstance.post('/Privilege/remove', {
        userId: selectedUser.id,
        privilegeId,
      });
      toast.success('Privilege removed!');
      // Refresh user privileges
      const res = await axiosInstance.get<UserPrivilege[]>(`/Privilege/user/${selectedUser.id}`);
      setUserPrivileges(res.data);
    } catch {
      toast.error('Failed to remove privilege');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Privileges Management</h1>
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <label className="block font-semibold mb-2">Select a user:</label>
        <select
          className="border rounded px-3 py-2 w-full mb-4"
          value={selectedUser?.id || ''}
          onChange={e => {
            const user = users.find(u => u.id === e.target.value);
            setSelectedUser(user || null);
            setSelectedPrivilegeId(null);
            setStartDate('');
            setEndDate('');
          }}
        >
          <option value="">-- Select user --</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.firstName} {user.lastName} ({user.userName})
            </option>
          ))}
        </select>
        {selectedUser && (
          <div className="mb-4">
            <div className="font-medium mb-2">Current privileges:</div>
            <ul className="mb-2">
              {userPrivileges.length === 0 && <li className="text-gray-500">No privileges assigned.</li>}
              {userPrivileges.map(up => (
                <li key={up.id} className="flex items-center justify-between border-b py-1">
                  <span>
                    <b>{up.privilegeName}</b>
                    {up.startDate && (
                      <span className="ml-2 text-xs text-gray-500">from {up.startDate.split('T')[0]}</span>
                    )}
                    {up.endDate && (
                      <span className="ml-2 text-xs text-gray-500">to {up.endDate.split('T')[0]}</span>
                    )}
                  </span>
                  <button
                    className="text-red-600 hover:underline text-sm"
                    onClick={() => handleRemove(up.privilegeId)}
                    disabled={assigning}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <div className="font-medium mb-2 mt-4">Assign new privilege:</div>
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <select
                className="border rounded px-3 py-2"
                value={selectedPrivilegeId || ''}
                onChange={e => setSelectedPrivilegeId(Number(e.target.value))}
              >
                <option value="">-- Select privilege --</option>
                {privileges.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - {p.description}</option>
                ))}
              </select>
              <div>
                <label className="block text-xs">Start date</label>
                <input
                  type="date"
                  className="border rounded px-2 py-1"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs">End date</label>
                <input
                  type="date"
                  className="border rounded px-2 py-1"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                onClick={handleAssign}
                disabled={assigning || !selectedPrivilegeId}
              >
                Assign
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivilegesAdminPage; 