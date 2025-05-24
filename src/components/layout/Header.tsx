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
          {/* Header is intentionally left blank for a minimal look */}
          <div></div>
          {/* Right section: show Login button if not authenticated */}
          {!isAuthenticated && (
            <Button
              label="Login"
              onClick={() => navigate(PATH_PUBLIC.login)}
              type="button"
              variant="primary"
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;