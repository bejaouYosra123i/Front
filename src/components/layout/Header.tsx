import useAuth from '../../hooks/useAuth.hook';
import Button from '../general/Button';
import { AiOutlineHome } from 'react-icons/ai';
import { FiLock, FiUnlock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { PATH_DASHBOARD, PATH_PUBLIC } from '../../routes/paths';

const Header = () => {
  const { isAuthLoading, isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const userRolesLabelCreator = () => {
    if (user) {
      let result = '';
      user.roles.forEach((role, index) => {
        result += role;
        if (index < user.roles.length - 1) {
          result += ', ';
        }
      });
      return result;
    }
    return '--';
  };

  return (
    <div className="flex justify-between items-center bg-[#F5F5F5] h-12 px-4 rounded-md shadow-sm">
      <div className="flex items-center gap-4">
        <AiOutlineHome
          className="w-8 h-8 text-[#ED1C24] hover:text-[#B71C1C] cursor-pointer transition-colors duration-200"
          onClick={() => navigate('/')}
        />
        <div className="flex gap-1">
          <h1 className="px-1 border border-solid border-[#ED1C24] rounded-lg text-[#1E272E]">
            AuthLoading: {isAuthLoading ? 'True' : '--'}
          </h1>
          <h1 className="px-1 border border-solid border-[#ED1C24] rounded-lg flex items-center gap-1 text-[#1E272E] bg-white">
            Auth:
            {isAuthenticated ? <FiUnlock className="text-[#1E272E]" /> : <FiLock className="text-[#ED1C24]" />}
          </h1>
          <h1 className="px-1 border border-solid border-[#ED1C24] rounded-lg text-[#1E272E]">
            UserName: {user ? user.userName : '--'}
          </h1>
          <h1 className="px-1 border border-solid border-[#ED1C24] rounded-lg text-[#1E272E]">
            UserRole: {userRolesLabelCreator()}
          </h1>
        </div>
      </div>
      <div>
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Button
              label="Dashboard"
              onClick={() => navigate(PATH_DASHBOARD.dashboard)}
              type="button"
              variant="light"
            />
            <Button label="Logout" onClick={logout} type="button" variant="light" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button label="Login" onClick={() => navigate(PATH_PUBLIC.login)} type="button" variant="light" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;