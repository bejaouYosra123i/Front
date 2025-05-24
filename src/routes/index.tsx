import { Routes, Route, Navigate } from 'react-router-dom';
import { PATH_DASHBOARD, PATH_PUBLIC } from './paths';
import AuthGuard from '../auth/AuthGuard';
import { allAccessRoles, managerAccessRoles, adminAccessRoles } from '../auth/auth.utils';
import Layout from '../components/layout';
import AllMessagesPage from '../pages/dashboard/AllMessagesPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import InboxPage from '../pages/dashboard/InboxPage';
import MyLogsPage from '../pages/dashboard/MyLogsPage';
import SendMessagePage from '../pages/dashboard/SendMessagePage';
import SystemLogsPage from '../pages/dashboard/SystemLogsPage';
import UpdateRolePage from '../pages/dashboard/UpdateRolePage';
import UsersManagementPage from '../pages/dashboard/UsersManagementPage';
import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/public/LoginPage';
import NotFoundPage from '../pages/public/NotFoundPage';
import RegisterPage from '../pages/dashboard/RegisterPage';
import UnauthorizedPage from '../pages/public/UnauthorizedPage';
import UpdateCredentialsPage from '../pages/dashboard/UpdateCredentialsPage';
import InvestmentFormsPage from '../pages/dashboard/InvestmentFormsPage';
import AssetsManagementPage from '../pages/dashboard/AssetsManagementPage';
import AssetScrubPage from '../pages/dashboard/AssetScrubPage';
import AddRequestPage from '../pages/dashboard/AddRequestPage';
import PcRequestsListPage from '../pages/dashboard/PcRequestsListPage';
import ProfileTabsPage from '../pages/dashboard/ProfileTabsPage';
import PrivilegesAdminPage from '../pages/dashboard/PrivilegesAdminPage';
import useAuth from '../hooks/useAuth.hook';
import usePrivileges from '../hooks/usePrivileges';
import UpdateProfilePage from '../pages/dashboard/UpdateProfilePage';
import UpdatePasswordPage from '../pages/dashboard/UpdatePasswordPage';

// Guards personnalisés
const UsersManagementGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const privileges = usePrivileges();
  const isAdmin = user?.roles?.includes('ADMIN');
  if (isAdmin || privileges.includes('ManageUsers')) {
    return <>{children}</>;
  }
  return <Navigate to={PATH_PUBLIC.unauthorized} />;
};
const SystemLogsGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const privileges = usePrivileges();
  const isAdmin = user?.roles?.includes('ADMIN');
  if (isAdmin || privileges.includes('ManagePrivileges')) {
    return <>{children}</>;
  }
  return <Navigate to={PATH_PUBLIC.unauthorized} />;
};
const AllMessagesGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const privileges = usePrivileges();
  const isAdmin = user?.roles?.includes('ADMIN');
  if (isAdmin || privileges.includes('ManagePrivileges')) {
    return <>{children}</>;
  }
  return <Navigate to={PATH_PUBLIC.unauthorized} />;
};
const AssetsManagementGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const privileges = usePrivileges();
  const isAdmin = user?.roles?.includes('ADMIN');
  if (isAdmin || privileges.includes('ManageAssets')) {
    return <>{children}</>;
  }
  return <Navigate to={PATH_PUBLIC.unauthorized} />;
};
const PrivilegeGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const privileges = usePrivileges();
  const isAdmin = user?.roles?.includes('ADMIN');
  if (isAdmin || privileges.includes('ManagePrivileges')) {
    return <>{children}</>;
  }
  return <Navigate to={PATH_PUBLIC.unauthorized} />;
};

const GlobalRouter = () => {
  return (
    <Routes>
      {/* <Route path='' element /> */}
      <Route element={<Layout />}>
        
        {/* Public routes */}
        <Route index element={<HomePage />} />
        <Route path={PATH_PUBLIC.login} element={<LoginPage />} />
        <Route path={PATH_PUBLIC.unauthorized} element={<UnauthorizedPage />} />

        {/* Protected routes -------------------------------------------------- */}
        <Route element={<AuthGuard roles={allAccessRoles} />}>
          <Route path={PATH_DASHBOARD.dashboard} element={<DashboardPage />} />
          <Route path={PATH_DASHBOARD.sendMessage} element={<SendMessagePage />} />
          <Route path={PATH_DASHBOARD.inbox} element={<InboxPage />} />
          <Route path={PATH_DASHBOARD.myLogs} element={<MyLogsPage />} />
          <Route path={PATH_DASHBOARD.updateCredentials} element={<UpdateCredentialsPage/>}/>
          <Route path={PATH_DASHBOARD.investmentForms} element={<InvestmentFormsPage />} />
          <Route path={PATH_DASHBOARD.assetsManagement} element={<AssetsManagementGuard><AssetsManagementPage /></AssetsManagementGuard>} />
          <Route path={PATH_DASHBOARD.addRequest} element={<AddRequestPage />} />
          <Route path="/dashboard/AssetScrubPage" element={<AssetScrubPage />} />
          <Route path={PATH_DASHBOARD.pcRequests} element={<PcRequestsListPage />} />
          <Route path={PATH_DASHBOARD.profile} element={<ProfileTabsPage />} />
          <Route path="/dashboard/update-profile" element={<UpdateProfilePage />} />
          <Route path="/dashboard/update-password" element={<UpdatePasswordPage />} />
        </Route>
        <Route element={<AuthGuard roles={managerAccessRoles} />}>
          {/* <Route path={PATH_DASHBOARD.manager} element={<ManagerPage />} /> */}
        </Route>
        <Route path={PATH_DASHBOARD.usersManagement} element={<UsersManagementGuard><UsersManagementPage /></UsersManagementGuard>} />
        <Route path={PATH_DASHBOARD.updateRole} element={<UsersManagementGuard><UpdateRolePage /></UsersManagementGuard>} />
        <Route path={PATH_DASHBOARD.allMessages} element={<AllMessagesGuard><AllMessagesPage /></AllMessagesGuard>} />
        <Route path={PATH_DASHBOARD.systemLogs} element={<SystemLogsGuard><SystemLogsPage /></SystemLogsGuard>} />
        <Route path={PATH_DASHBOARD.register} element={<PrivilegeGuard><RegisterPage /></PrivilegeGuard>} />
        <Route path={PATH_DASHBOARD.privileges} element={<PrivilegeGuard><PrivilegesAdminPage /></PrivilegeGuard>} />
        {/* Protected routes -------------------------------------------------- */}

        {/* Catch all (404) */}
        <Route path={PATH_PUBLIC.notFound} element={<NotFoundPage />} />
        <Route path='*' element={<Navigate to={PATH_PUBLIC.notFound} replace />} />
      </Route>
    </Routes>
  );
};

export default GlobalRouter;