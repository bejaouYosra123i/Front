import { useState, useEffect } from 'react';
import { PATH_DASHBOARD } from '../../routes/paths';
import useAuth from '../../hooks/useAuth.hook';
import usePrivileges from '../../hooks/usePrivileges';
import useResetPasswordNotif from '../../hooks/useResetPasswordNotif';
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
import { toast } from 'react-hot-toast';

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
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  const { count: resetNotif, prevCount: prevResetNotif } = useResetPasswordNotif();
  const [hasShownResetNotif, setHasShownResetNotif] = useState(false);

  // Toast notification for new reset password request (fix: useEffect)
  useEffect(() => {
    const alreadySeen = localStorage.getItem('resetNotifSeen') === '1';
    if (resetNotif > prevResetNotif && !alreadySeen) {
      toast.dismiss('reset-request');
      toast('Someone wants to reset their password.', {
        id: 'reset-request',
        icon: '🔔',
        duration: 5000, // 5 seconds
        style: { background: '#fff', color: '#e60012', fontWeight: 'bold', fontSize: '1rem' },
        position: 'top-right',
      });
      localStorage.setItem('resetNotifSeen', '1');
      setHasShownResetNotif(true);
    }
  }, [resetNotif, prevResetNotif]);

  const isAdmin = user?.roles?.includes('ADMIN');
  const privileges = usePrivileges();
  const canManagePrivileges = isAdmin || privileges.includes('ManagePrivileges');
  const canManageUsers = isAdmin || privileges.includes('ManageUsers');

  const navigation = [
    {
      group: 'main',
      items: [
        { icon: <FiHome />, label: 'Dashboard', to: PATH_DASHBOARD.dashboard, adminOnly: false },
        { icon: <FiLayers />, label: 'Investment Management', to: PATH_DASHBOARD.assetsManagement, adminOnly: true },
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
        { icon: (
            <span className="relative">
              <FiInbox />
              {resetNotif > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full px-1.5 py-0.5 text-xs font-bold animate-pulse">
                  {resetNotif}
                </span>
              )}
            </span>
          ), label: 'Inbox', to: PATH_DASHBOARD.inbox, adminOnly: false },
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

      {/* Footer with Logout */}
      {!isCollapsed && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-yazaki-darkGray text-center text-xs text-yazaki-gray flex flex-col gap-4"
        >
          <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-all duration-200 text-base shadow"
        >
            Logout
          </button>
          <div className="text-xs text-yazaki-gray mt-2">
            © {new Date().getFullYear()} Asset Management System
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Sidebar;