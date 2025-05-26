import { useNavigate } from 'react-router-dom';
import { IAuthUser, RolesEnum } from '../../../types/auth.types';
import Button from '../../general/Button';
import moment from 'moment';
import { isAuthorizedForUpdateRole, isAuthorizedForDelete } from '../../../auth/auth.utils';
import useAuth from '../../../hooks/useAuth.hook';
import usePrivileges from '../../../hooks/usePrivileges';
import axiosInstance from '../../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { ClipboardIcon } from '@heroicons/react/24/outline';
import { FiEdit2, FiKey, FiTrash2 } from 'react-icons/fi';

interface IProps {
  usersList: IAuthUser[];
  onDeleteClick: (user: IAuthUser) => void;
}

const ROLES = [
  { value: 'MANAGER', label: 'Manager Général' },
  { value: 'ITMANAGER', label: 'IT Manager' },
  { value: 'HRMANAGER', label: 'HR Manager' },
  { value: 'PLANTMANAGER', label: 'Plant Manager' },
];

const handleRoleChange = async (userId: string, newRole: string) => {
  try {
    await fetch(`/auth/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    window.location.reload(); // Recharge la liste après modification
  } catch (error) {
    alert('Erreur lors de la mise à jour du rôle');
  }
};

const UsersTableSection = ({ usersList, onDeleteClick }: IProps) => {
  const { user: loggedInUser } = useAuth();
  const privileges = usePrivileges();
  const canManageUsers = loggedInUser?.roles.includes('ADMIN') || privileges.includes('ManageUsers');
  const navigate = useNavigate();
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [resetPwd, setResetPwd] = useState('');
  const [resetUser, setResetUser] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  const RoleClassNameCreator = (Roles: string[]) => {
    let className = 'px-3 py-1 text-white rounded-3xl ';
    if (Roles.includes(RolesEnum.ADMIN)) {
      className += 'bg-[#9333EA]'; // violet
    } else if (Roles.includes(RolesEnum.MANAGER)) {
      className += 'bg-[#0B96BC]'; // bleu
    } else if (Roles.includes(RolesEnum.USER)) {
      className += 'bg-[#FEC223] text-black'; // jaune
    } else if (Roles.includes(RolesEnum.IT_MANAGER)) {
      className += 'bg-[#22C55E]'; // vert
    } else if (Roles.includes(RolesEnum.RH_MANAGER)) {
      className += 'bg-[#EC4899]'; // rose
    } else if (Roles.includes(RolesEnum.PLANT_MANAGER)) {
      className += 'bg-[#2563EB]'; // bleu foncé
    } else {
      className += 'bg-gray-400';
    }
    return className;
  };

  const handleResetPassword = async (userName: string) => {
    setResetLoading(true);
    try {
      const { data } = await axiosInstance.post('/Auth/reset-password', { userName });
      setResetPwd(data.newPassword);
      setResetUser(userName);
      setShowPwdModal(true);
    } catch (err: any) {
      toast.error('Error resetting password');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className='bg-white p-4 rounded-2xl shadow-xl'>
      <h1 className='text-3xl font-bold text-yazaki-black mb-6'>Users Table</h1>
      <div className='overflow-x-auto rounded-xl border border-gray-200'>
        <div className='grid grid-cols-9 px-2 py-3 text-lg font-semibold bg-yazaki-lightGray sticky top-0 z-10 rounded-t-xl border-b border-yazaki-red'>
          <div>No</div>
          <div>User Name</div>
          <div>First Name</div>
          <div>Last Name</div>
          <div>Creation Time</div>
          <div className='flex justify-center'>Roles</div>
          <div>Update Role</div>
          <div>Reset Password</div>
          <div>Delete</div>
        </div>
        {usersList.map((user, index) => (
          <div
            key={user.id}
            className={`grid grid-cols-9 px-2 h-14 items-center border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-yazaki-lightGray transition`}
            style={{ borderRadius: index === usersList.length - 1 ? '0 0 1rem 1rem' : undefined }}
          >
            <div className='flex items-center font-medium text-gray-700'>{index + 1}</div>
            <div className='flex items-center font-bold text-yazaki-black'>{user.userName}</div>
            <div className='flex items-center text-gray-700'>{user.firstName}</div>
            <div className='flex items-center text-gray-700'>{user.lastName}</div>
            <div className='flex items-center text-gray-500'>{moment(user.createdAt).format('YYYY-MM-DD | HH:mm')}</div>
            <div className='flex justify-center items-center'>
              <span className={RoleClassNameCreator(user.roles) + ' text-xs px-2 py-1 rounded-full flex items-center gap-1'}>
                {/* Optionally add icon here */}
                {user.roles}
              </span>
            </div>
            <div className='flex items-center justify-center'>
              <Button
                label={<span className="flex items-center gap-2"><FiEdit2 /> Update</span>}
                onClick={() => navigate(`/dashboard/update-role/${user.userName}`)}
                type='button'
                variant='primary'
                className='rounded-full px-4 py-1 shadow hover:scale-105 transition'
                disabled={!canManageUsers}
              />
            </div>
            <div className='flex items-center justify-center'>
              <Button
                label={<span className="flex items-center gap-2"><FiKey />{resetLoading && resetUser === user.userName ? 'Resetting...' : 'Reset'}</span>}
                onClick={() => handleResetPassword(user.userName)}
                type='button'
                variant='danger'
                className='rounded-full px-6 py-2 shadow font-bold text-lg bg-yazaki-red hover:bg-yazaki-darkRed transition border-2 border-yazaki-red text-white'
                disabled={!canManageUsers || (resetLoading && resetUser === user.userName)}
              />
            </div>
            <div className='flex items-center justify-center'>
              <Button
                label={<span className="flex items-center gap-2"><FiTrash2 /> Delete</span>}
                onClick={() => onDeleteClick(user)}
                type='button'
                variant='danger'
                className='rounded-full px-4 py-1 shadow hover:scale-105 transition bg-yazaki-darkRed text-white border-2 border-yazaki-darkRed'
                disabled={!canManageUsers}
              />
            </div>
          </div>
        ))}
      </div>
      {showPwdModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-96">
            <h2 className="text-xl font-bold mb-2 text-yazaki-black">New password for <span className="text-blue-700">{resetUser}</span></h2>
            <div className="mb-4 flex items-center gap-2">
              <input type="text" value={resetPwd} readOnly className="w-full p-2 border rounded font-mono text-lg bg-gray-50" />
              <button
                className="p-2 bg-yazaki-red text-white rounded hover:bg-yazaki-darkRed transition"
                onClick={() => {navigator.clipboard.writeText(resetPwd); toast.success('Copied!')}}
                title="Copy password"
              >
                <ClipboardIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex justify-end">
              <Button label="Close" onClick={() => setShowPwdModal(false)} type="button" variant="primary" className="rounded-full px-4" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTableSection;