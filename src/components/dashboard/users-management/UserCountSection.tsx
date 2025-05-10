import UserCountCard from './UserCountCard';
import { IAuthUser, RolesEnum } from '../../../types/auth.types';
import { FaUser, FaUserCog, FaUserShield, FaUserTie } from 'react-icons/fa';
import Button from '../../../components/general/Button';
import { useNavigate } from 'react-router-dom';
import { PATH_DASHBOARD } from '../../../routes/paths';

interface IProps {
  usersList: IAuthUser[];
}

const UserCountSection = ({ usersList }: IProps) => {
  const navigate = useNavigate();
  let admins = 0;
  let managers = 0;
  let users = 0;

  usersList.forEach((item) => {
    if (item.roles.includes(RolesEnum.ADMIN)) {
      admins++;
    } else if (item.roles.includes(RolesEnum.MANAGER)) {
      managers++;
    } else if (item.roles.includes(RolesEnum.USER)) {
      users++;
    }
  });

  const userCountData = [
    { count: admins, role: RolesEnum.ADMIN, icon: FaUserShield, color: '#D7000F' },
    { count: managers, role: RolesEnum.MANAGER, icon: FaUserTie, color: '#333333' },
    { count: users, role: RolesEnum.USER, icon: FaUser, color: '#B0B0B0' },
  ];

  return (
    <div className='grid grid-cols-1 lg:grid-cols-4 gap-x-4'>
      {userCountData.map((item, index) => (
        <UserCountCard key={index} count={item.count} role={item.role} icon={item.icon} color={item.color} />
      ))}

      <div className='flex items-center bg-white justify-center rounded-md gap-2'>
            <Button label='Add New User' onClick={() => navigate(PATH_DASHBOARD.register)} type='button' variant='light' />
                </div>
    </div>
  );
};

export default UserCountSection;