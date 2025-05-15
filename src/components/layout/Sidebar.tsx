import { useState } from 'react';
import { PATH_DASHBOARD } from '../../routes/paths';
import useAuth from '../../hooks/useAuth.hook';
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
  FiRefreshCw
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  isAdminOnly?: boolean;
  isCollapsed: boolean;
}

const NavItem = ({ icon, label, to, isAdminOnly = false, isCollapsed }: NavItemProps) => {
  const { user } = useAuth();
  
  if (isAdminOnly && !user?.roles?.includes('ADMIN')) return null;

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center p-3 rounded-lg transition-all duration-200 group ${
          isActive 
            ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`
      }
      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
    >
      <span className="text-xl">{icon}</span>
      {!isCollapsed && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="ml-3 font-medium"
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

  const navigation = [
    {
      group: 'main',
      items: [
        { icon: <FiHome />, label: 'Dashboard', to: PATH_DASHBOARD.dashboard, adminOnly: false },
        { icon: <FiLayers />, label: 'Assets Management', to: PATH_DASHBOARD.assetsManagement, adminOnly: true },
        { icon: <FiFileText />, label: 'Investment Forms', to: PATH_DASHBOARD.investmentForms, adminOnly: true },
        { icon: <FiPlusCircle />, label: 'Ajouter une demande', to: PATH_DASHBOARD.addRequest, adminOnly: false },
        { icon: <FiList />, label: 'Liste demandes PC', to: PATH_DASHBOARD.pcRequests, adminOnly: false },
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
        { icon: <FiUsers />, label: 'Users Management', to: PATH_DASHBOARD.usersManagement, adminOnly: true },
        { icon: <FiActivity />, label: 'System Logs', to: PATH_DASHBOARD.systemLogs, adminOnly: true },
        { icon: <FiActivity />, label: 'My Logs', to: PATH_DASHBOARD.myLogs, adminOnly: false },
      ]
    },
    {
      group: 'roles',
      label: 'Role Pages',
      icon: <FiShield />,
      items: [
        // Removed: { icon: <FiShield />, label: 'Admin Page', to: PATH_DASHBOARD.admin, adminOnly: true },
        // Removed: { icon: <FiUserCheck />, label: 'Manager Page', to: PATH_DASHBOARD.manager, adminOnly: false },
        // Removed: { icon: <FiUser />, label: 'User Page', to: PATH_DASHBOARD.user, adminOnly: false },
      ]
    }
  ];

  return (
    <motion.div
      initial={false}
      animate={{
        width: isCollapsed ? '4rem' : '16rem'
      }}
      className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden transition-all duration-300 shadow-xl"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-center">
              <FiUser className="text-white" />
            </div>
            <div className="text-sm font-medium">
              <div>{user?.firstName} {user?.lastName}</div>
              <div className="text-xs text-gray-400">{user?.email}</div>
            </div>
          </motion.div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-center mx-auto">
            <FiUser className="text-white" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-full hover:bg-gray-800 transition-colors duration-200 text-gray-400 hover:text-white"
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
              <div className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.label}
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
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
        <li>
          <a href="/dashboard/AssetScrubPage" className="sidebar-link">Asset Scrub</a>
        </li>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-gray-800 text-center text-xs text-gray-500"
        >
          © {new Date().getFullYear()} Asset Management
        </motion.div>
      )}
    </motion.div>
  );
};

export default Sidebar;