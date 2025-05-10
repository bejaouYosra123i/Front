import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { USERS_LIST_URL } from '../../utils/globalConfig';
import { IAuthUser } from '../../types/auth.types';
import LatestUsersSection from '../../components/dashboard/users-management/LatestUsersSection';
import UserChartSection from '../../components/dashboard/users-management/UserChartSection';
import UserCountSection from '../../components/dashboard/users-management/UserCountSection';
import UsersTableSection from '../../components/dashboard/users-management/UsersTableSection';
import { toast } from 'react-hot-toast';
import Spinner from '../../components/general/Spinner';
import Button from '../../components/general/Button';
import useAuth from '../../hooks/useAuth.hook';

const UsersManagementPage = () => {
  const [users, setUsers] = useState<IAuthUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IAuthUser | null>(null);
  const [password, setPassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user: currentUser } = useAuth();

  const getUsersList = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<IAuthUser[]>(USERS_LIST_URL);
      const { data } = response;
      setUsers(data);
      setLoading(false);
    } catch (error) {
      toast.error('An Error happened. Please Contact admins');
      setLoading(false);
    }
  };

  const handleDeleteClick = (user: IAuthUser) => {
    if (user.id === currentUser?.id) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      setDeleteLoading(true);
      await axiosInstance.delete(`/auth/users/${selectedUser.id}`);
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      setPassword('');
      setSelectedUser(null);
      getUsersList();
    } catch (error: any) {
      toast.error('Error deleting user');
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    getUsersList();
  }, []);

  if (loading) {
    return (
      <div className='w-full flex justify-center items-center min-h-screen'>
        <Spinner />
      </div>
    );
  }

  return (
    <div className='pageTemplate2 bg-gray-50'>
      <h1 className='text-2xl font-bold text-gray-800'>Users Management</h1>
      <UserCountSection usersList={users} />
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-x-4'>
        <UserChartSection usersList={users} />
        <LatestUsersSection usersList={users} />
      </div>
      <UsersTableSection 
        usersList={users} 
        onDeleteClick={handleDeleteClick}
      />

      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Confirm deletion</h2>
            <p className="mb-4">
            Are you sure you want to delete the user <span className="font-semibold">{selectedUser.userName}</span> ?
            </p>
            <p className="mb-4">To confirm, please enter <span className="font-semibold">your password</span> :</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              placeholder="Enter your password"
            />
            <div className="flex justify-end space-x-4">
              <Button
                label="Annuler"
                onClick={() => {
                  setShowDeleteModal(false);
                  setPassword('');
                  setSelectedUser(null);
                }}
                type="button"
                variant="light"
                disabled={deleteLoading}
              />
              <Button
                label={deleteLoading ? "Suppression..." : "Supprimer"}
                onClick={handleDelete}
                type="button"
                variant="danger"
                disabled={deleteLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagementPage;