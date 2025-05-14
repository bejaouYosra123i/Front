import { Routes, Route, Navigate } from 'react-router-dom';
import { PATH_DASHBOARD, PATH_PUBLIC } from './paths';
import AuthGuard from '../auth/AuthGuard';
import { allAccessRoles, managerAccessRoles, adminAccessRoles } from '../auth/auth.utils';
import Layout from '../components/layout';
import AdminPage from '../pages/dashboard/AdminPage';
import AllMessagesPage from '../pages/dashboard/AllMessagesPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import InboxPage from '../pages/dashboard/InboxPage';
import ManagerPage from '../pages/dashboard/ManagerPage';
import MyLogsPage from '../pages/dashboard/MyLogsPage';
import SendMessagePage from '../pages/dashboard/SendMessagePage';
import SystemLogsPage from '../pages/dashboard/SystemLogsPage';
import UpdateRolePage from '../pages/dashboard/UpdateRolePage';
import UserPage from '../pages/dashboard/UserPage';
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
import ProfilePage from '../pages/dashboard/ProfilePage';
import AssetLifecyclePage from '../pages/dashboard/AssetLifecyclePage';


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
          <Route path={PATH_DASHBOARD.user} element={<UserPage />} />
          <Route path={PATH_DASHBOARD.updateCredentials} element={<UpdateCredentialsPage/>}/>
          <Route path={PATH_DASHBOARD.investmentForms} element={<InvestmentFormsPage />} />
          <Route path={PATH_DASHBOARD.assetsManagement} element={<AssetsManagementPage />} />
          <Route path={PATH_DASHBOARD.addRequest} element={<AddRequestPage />} />
          <Route path="/asset-scrub" element={<AssetScrubPage />} />
          <Route path={PATH_DASHBOARD.pcRequests} element={<PcRequestsListPage />} />
          <Route path={PATH_DASHBOARD.profile} element={<ProfilePage />} />
          <Route path={PATH_DASHBOARD.assetLifecycle} element={<AssetLifecyclePage />} />
        </Route>
        <Route element={<AuthGuard roles={managerAccessRoles} />}>
          <Route path={PATH_DASHBOARD.manager} element={<ManagerPage />} />
        </Route>
        <Route element={<AuthGuard roles={adminAccessRoles} />}>
          <Route path={PATH_DASHBOARD.usersManagement} element={<UsersManagementPage />} />
          <Route path={PATH_DASHBOARD.updateRole} element={<UpdateRolePage />} />
          <Route path={PATH_DASHBOARD.allMessages} element={<AllMessagesPage />} />
          <Route path={PATH_DASHBOARD.systemLogs} element={<SystemLogsPage />} />
          <Route path={PATH_DASHBOARD.admin} element={<AdminPage />} />
          <Route path={PATH_DASHBOARD.register} element={<RegisterPage />} />
        </Route>
        {/* Protected routes -------------------------------------------------- */}

        {/* Catch all (404) */}
        <Route path={PATH_PUBLIC.notFound} element={<NotFoundPage />} />
        <Route path='*' element={<Navigate to={PATH_PUBLIC.notFound} replace />} />
      </Route>
    </Routes>
  );
};

export default GlobalRouter;