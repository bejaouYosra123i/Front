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
import usePrivileges from '../../hooks/usePrivileges';
import { Navigate } from 'react-router-dom';
import { PATH_PUBLIC } from '../../routes/paths';
import { FiTrash2, FiX, FiPlus } from 'react-icons/fi';
import RegisterFormOnly from './RegisterPage';

const UsersManagementPage = () => {
  const [users, setUsers] = useState<IAuthUser[]>([]);
  const [existingEmails, setExistingEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IAuthUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user: currentUser } = useAuth();
  const privileges = usePrivileges();
  const isAdmin = currentUser?.roles?.includes('ADMIN');
  if (!(isAdmin || privileges.includes('ManageUsers'))) {
    return <Navigate to={PATH_PUBLIC.unauthorized} />;
  }

  const getUsersList = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<IAuthUser[]>(USERS_LIST_URL);
      const { data } = response;
      setUsers(data);
      setExistingEmails(data.map(u => u.email?.toLowerCase() || ''));
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
    <div className='min-h-screen bg-gray-50 p-6'>
      {/* Header moderne */}
      <div className='flex flex-col sm:flex-row items-center justify-between mb-8 gap-4'>
        <h1 className='text-3xl font-bold text-gray-900 tracking-tight'>User Management</h1>
        <Button
          label={<span className='flex items-center gap-2'><FiPlus className='text-lg' /> Add User</span>}
          onClick={() => setShowRegisterModal(true)}
          type='button'
          variant='primary'
          className='shadow-lg px-6 py-2 rounded-xl text-base font-semibold'
        />
      </div>
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-xl w-full relative">
            <button onClick={() => setShowRegisterModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl font-bold">&times;</button>
            <h2 className='text-2xl font-bold text-yazaki-red mb-6 text-center'>Register New User</h2>
            <RegisterFormOnly
              existingEmails={existingEmails}
              onErrorEmailExists={() => setShowRegisterModal(false)}
              onSuccessRegister={() => {
                setShowRegisterModal(false);
                getUsersList();
              }}
            />
          </div>
        </div>
      )}
      <div className='mb-8'>
        <UserCountSection usersList={users} />
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8'>
        <UserChartSection usersList={users} />
        <LatestUsersSection usersList={users} />
      </div>
      <div className='mb-8'>
        <UsersTableSection 
          usersList={users} 
          onDeleteClick={handleDeleteClick}
        />
      </div>

      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-yazaki-red text-center">Confirm Deletion</h2>
            <p className="mb-6 text-center text-gray-700">
              Are you sure you want to delete the user <span className="font-semibold">{selectedUser.userName}</span>?
            </p>
            <div className="flex justify-end space-x-4">
              <Button
                label={<span className="flex items-center gap-2"><FiX /> Cancel</span>}
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                type="button"
                variant="light"
                disabled={deleteLoading}
                className="px-6 py-2 rounded-lg text-base"
              />
              <Button
                label={<span className="flex items-center gap-2"><FiTrash2 /> {deleteLoading ? "Deleting..." : "Delete"}</span>}
                onClick={handleDelete}
                type="button"
                variant="danger"
                disabled={deleteLoading}
                className="px-6 py-2 rounded-lg text-base"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagementPage;