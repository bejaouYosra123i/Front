import { useNavigate } from 'react-router-dom';
import { IAuthUser, RolesEnum } from '../../../types/auth.types';
import Button from '../../general/Button';
import moment from 'moment';
import { isAuthorizedForUpdateRole, isAuthorizedForDelete } from '../../../auth/auth.utils';
import useAuth from '../../../hooks/useAuth.hook';

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
  const navigate = useNavigate();

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

  return (
    <div className='bg-white p-2 rounded-md'>
      <h1 className='text-xl font-bold'>Users Table</h1>
      <div className='grid grid-cols-8 px-2 my-1 text-lg font-semibold border border-gray-300 rounded-md'>
        <div>No</div>
        <div>User Name</div>
        <div>First Name</div>
        <div>Last Name</div>
        <div>Creation Time</div>
        <div className='flex justify-center'>Roles</div>
        <div>Operations</div>
        <div>Action</div>
      </div>
      {usersList.map((user, index) => (
        <div
          key={user.id}
          className='grid grid-cols-8 px-2 h-12 my-1 border border-gray-200 hover:bg-gray-200 rounded-md'
        >
          <div className='flex items-center'>{index + 1}</div>
          <div className='flex items-center font-semibold'>{user.userName}</div>
          <div className='flex items-center'>{user.firstName}</div>
          <div className='flex items-center'>{user.lastName}</div>
          <div className='flex items-center'>{moment(user.createdAt).format('YYYY-MM-DD|HH:mm')}</div>
          <div className='flex justify-center items-center'>
            <span className={RoleClassNameCreator(user.roles)}>{user.roles}</span>
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              label='Update Role'
              onClick={() => navigate(`/dashboard/update-role/${user.userName}`)}
              type='button'
              variant='primary'
              disabled={!isAuthorizedForUpdateRole(loggedInUser!.roles[0], user.roles[0])}
            />
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              label='Delete'
              onClick={() => onDeleteClick(user)}
              type='button'
              variant='danger'
              disabled={!isAuthorizedForDelete(loggedInUser!.roles[0], user.roles[0])}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default UsersTableSection;