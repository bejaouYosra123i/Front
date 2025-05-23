import UserCountCard from './UserCountCard';
import { IAuthUser, RolesEnum } from '../../../types/auth.types';
import { FaUser, FaUserCog, FaUserShield, FaUserTie, FaUserSecret, FaUserNurse, FaUserAstronaut } from 'react-icons/fa';
import Button from '../../../components/general/Button';
import { useNavigate } from 'react-router-dom';
import { PATH_DASHBOARD } from '../../../routes/paths';
import useAuth from '../../../hooks/useAuth.hook';
import usePrivileges from '../../../hooks/usePrivileges';

interface IProps {
  usersList: IAuthUser[];
}

const UserCountSection = ({ usersList }: IProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const privileges = usePrivileges();
  const canManageUsers = user?.roles.includes('ADMIN') || privileges.includes('ManageUsers');
  let admins = 0;
  let managers = 0;
  let users = 0;
  let itManagers = 0;
  let rhManagers = 0;
  let plantManagers = 0;

  usersList.forEach((item) => {
    if (item.roles.includes(RolesEnum.ADMIN)) {
      admins++;
    } else if (item.roles.includes(RolesEnum.MANAGER)) {
      managers++;
    } else if (item.roles.includes(RolesEnum.USER)) {
      users++;
    } else if (item.roles.includes(RolesEnum.IT_MANAGER)) {
      itManagers++;
    } else if (item.roles.includes(RolesEnum.RH_MANAGER)) {
      rhManagers++;
    } else if (item.roles.includes(RolesEnum.PLANT_MANAGER)) {
      plantManagers++;
    }
  });

  const userCountData = [
    { count: admins, role: RolesEnum.ADMIN, icon: FaUserShield, color: '#D7000F' },
    { count: managers, role: RolesEnum.MANAGER, icon: FaUserTie, color: '#333333' },
    { count: users, role: RolesEnum.USER, icon: FaUser, color: '#B0B0B0' },
    { count: itManagers, role: RolesEnum.IT_MANAGER, icon: FaUserSecret, color: '#FFD600' },
    { count: rhManagers, role: RolesEnum.RH_MANAGER, icon: FaUserNurse, color: '#7C3AED' },
    { count: plantManagers, role: RolesEnum.PLANT_MANAGER, icon: FaUserAstronaut, color: '#FF9900' },
  ];

  return (
    <div className='flex flex-col gap-2 mb-4'>
      <div className='w-full flex flex-col lg:flex-row gap-4'>
        <div className='flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4'>
          {userCountData.map((item, index) => (
            <UserCountCard key={index} count={item.count} role={item.role} icon={item.icon} color={item.color} />
          ))}
        </div>
        <div className='flex items-center justify-end min-w-[180px] mt-2 lg:mt-0'>
          <Button label='Add New User' onClick={() => navigate(PATH_DASHBOARD.register)} type='button' variant='light' disabled={!canManageUsers} />
        </div>
      </div>
    </div>
  );
};

export default UserCountSection;