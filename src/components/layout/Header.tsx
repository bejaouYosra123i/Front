import useAuth from '../../hooks/useAuth.hook';
import Button from '../general/Button';
import { AiOutlineHome } from 'react-icons/ai';
import { FiLock, FiUnlock, FiUser, FiBell, FiShield } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { PATH_DASHBOARD, PATH_PUBLIC } from '../../routes/paths';

const Header = () => {
  const { isAuthLoading, isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const userRolesLabelCreator = () => {
    if (user) {
      return user.roles.join(', ');
    }
    return '--';
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            <AiOutlineHome
              className="w-6 h-6 text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors duration-200"
              onClick={() => navigate('/')}
            />
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FiUser className="w-4 h-4" />
                <span>{user ? user.userName : 'Guest'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FiShield className="w-4 h-4" />
                <span>{userRolesLabelCreator()}</span>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                  <FiBell className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <Button
                  label="Dashboard"
                  onClick={() => navigate(PATH_DASHBOARD.dashboard)}
                  type="button"
                  variant="primary"
                  className="hidden md:block"
                />
                <Button 
                  label="Logout" 
                  onClick={logout} 
                  type="button" 
                  variant="secondary"
                />
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  label="Login" 
                  onClick={() => navigate(PATH_PUBLIC.login)} 
                  type="button" 
                  variant="primary"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;