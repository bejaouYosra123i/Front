import { useState } from 'react';
import { PATH_DASHBOARD } from '../../routes/paths';
import useAuth from '../../hooks/useAuth.hook';
import usePrivileges from '../../hooks/usePrivileges';
import { 
  FiUsers, 
  FiMessageSquare, 
  FiInbox, 
  FiMail, 
  FiActivity, 
  FiFileText, 
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiLayers,
  FiShield,
  FiUserCheck,
  FiHome,
  FiPlusCircle,
  FiList,
  FiRefreshCw,
  FiGrid,
  FiDatabase
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  isAdminOnly?: boolean;
  isCollapsed: boolean;
  show?: boolean;
}

const NavItem = ({ icon, label, to, isAdminOnly = false, isCollapsed, show }: NavItemProps) => {
  const { user } = useAuth();
  
  if (isAdminOnly && !user?.roles?.includes('ADMIN')) return null;
  if (show === false) return null;

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center p-3 rounded-lg transition-all duration-200 group text-sm font-medium
        ${isActive
          ? 'bg-yazaki-red/10 text-yazaki-red font-semibold shadow-md'
          : 'text-yazaki-gray hover:bg-yazaki-lightGray hover:text-yazaki-red'}
        focus:outline-none focus:ring-2 focus:ring-yazaki-red`
      }
      style={{ marginBottom: '0.25rem' }}
      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
    >
      <span className="text-lg mr-2 group-hover:text-yazaki-red transition-colors duration-200">{icon}</span>
      {!isCollapsed && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="ml-1"
        >
          {label}
        </motion.span>
      )}
    </NavLink>
  );
};

const Sidebar = () => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isAdmin = user?.roles?.includes('ADMIN');
  const privileges = usePrivileges();
  const canManagePrivileges = isAdmin || privileges.includes('ManagePrivileges');
  const canManageUsers = isAdmin || privileges.includes('ManageUsers');

  const navigation = [
    {
      group: 'main',
      items: [
        { icon: <FiHome />, label: 'Dashboard', to: PATH_DASHBOARD.dashboard, adminOnly: false },
        { icon: <FiLayers />, label: 'Asset Management', to: PATH_DASHBOARD.assetsManagement, adminOnly: true },
        { icon: <FiFileText />, label: 'Investment Forms', to: PATH_DASHBOARD.investmentForms, adminOnly: true },
        { icon: <FiPlusCircle />, label: 'New Request', to: PATH_DASHBOARD.addRequest, adminOnly: false },
        { icon: <FiList />, label: 'Asset List', to: PATH_DASHBOARD.pcRequests, adminOnly: false },
        { icon: <FiUser />, label: 'Profile', to: PATH_DASHBOARD.profile, adminOnly: false },
      ]
    },
    {
      group: 'communication',
      label: 'Communication',
      icon: <FiMessageSquare />,
      items: [
        { icon: <FiMail />, label: 'Send Message', to: PATH_DASHBOARD.sendMessage, adminOnly: false },
        { icon: <FiInbox />, label: 'Inbox', to: PATH_DASHBOARD.inbox, adminOnly: false },
        { icon: <FiMail />, label: 'All Messages', to: PATH_DASHBOARD.allMessages, adminOnly: true },
      ]
    },
    {
      group: 'administration',
      label: 'Administration',
      icon: <FiSettings />,
      items: [
        { icon: <FiUsers />, label: 'User Management', to: PATH_DASHBOARD.usersManagement, adminOnly: false, show: canManageUsers },
        { icon: <FiActivity />, label: 'System Logs', to: PATH_DASHBOARD.systemLogs, adminOnly: true },
        { icon: <FiShield />, label: 'Privileges', to: PATH_DASHBOARD.privileges, adminOnly: false, show: canManagePrivileges },
        { icon: <FiActivity />, label: 'My Logs', to: PATH_DASHBOARD.myLogs, adminOnly: false },
        { icon: <FiRefreshCw style={{ color: '#ED1C24' }} />, label: 'Asset Scrap', to: '/dashboard/AssetScrubPage', adminOnly: true },
      ]
    }
  ];

  return (
    <motion.div
      initial={false}
      animate={{
        width: isCollapsed ? '4rem' : '16rem'
      }}
      className="flex flex-col min-h-screen h-full bg-yazaki-black text-yazaki-gray overflow-hidden transition-all duration-300 shadow-xl"
      style={{ height: '100vh', minHeight: '100%', position: 'sticky', top: 0 }}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-yazaki-darkGray">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-full bg-yazaki-red flex items-center justify-center">
              <FiUser className="text-white" />
            </div>
            <div className="text-sm font-medium">
              <div className="text-yazaki-gray">{user?.firstName} {user?.lastName}</div>
              <div className="text-xs text-yazaki-lightGray">{user?.email}</div>
            </div>
          </motion.div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-full bg-yazaki-red flex items-center justify-center mx-auto">
            <FiUser className="text-white" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-full hover:bg-yazaki-lightGray transition-colors duration-200 text-yazaki-gray hover:text-yazaki-red"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navigation.map((section) => (
          <div key={section.group} className="mb-6">
            {!isCollapsed && section.label && (
              <div className="px-2 mb-2 text-xs font-semibold text-yazaki-darkGray uppercase tracking-wider">
                {section.label}
              </div>
            )}
            <div className="space-y-1">
              {section.items.filter(item => item.show === undefined || item.show).map((item) => (
                <NavItem
                  key={item.to}
                  icon={item.icon}
                  label={item.label}
                  to={item.to}
                  isAdminOnly={item.adminOnly}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-yazaki-darkGray text-center text-xs text-yazaki-gray"
        >
          © {new Date().getFullYear()} Asset Management System
        </motion.div>
      )}
    </motion.div>
  );
};

export default Sidebar;