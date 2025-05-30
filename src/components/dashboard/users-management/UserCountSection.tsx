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
    // Toutes les cartes sont supprimées
  ];

  return (
    <div className='flex flex-col items-center gap-6 mb-8 w-full'>
      <div className='w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6'>
        {userCountData.map((item, index) => (
          <UserCountCard key={index} count={item.count} role={item.role} icon={item.icon} color={item.color} />
        ))}
      </div>
    </div>
  );
};

export default UserCountSection;