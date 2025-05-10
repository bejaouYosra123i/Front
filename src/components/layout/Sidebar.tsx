import { useState } from 'react';
import { CiUser, CiMenuBurger, CiMenuKebab } from 'react-icons/ci';
import useAuth from '../../hooks/useAuth.hook';
import Button from '../general/Button';
import { useNavigate } from 'react-router-dom';
import { PATH_DASHBOARD } from '../../routes/paths';

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleClick = (url: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    navigate(url);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`shrink-0 bg-black text-white ${
        isCollapsed ? 'w-16' : 'w-60'
      } p-2 min-h-[calc(100vh-48px)] flex flex-col items-stretch gap-8 transition-all duration-300`}
    >
      <div className="flex justify-between items-center">
        <div className="self-center flex flex-col items-center">
          <CiUser className="w-10 h-10 text-white" />
          <h4 className="text-white">
            {user?.firstName} {user?.lastName}
          </h4>
        </div>
        <button
          onClick={toggleSidebar}
          className="flex justify-center items-center outline-none duration-300 h-6 w-6 text-xs font-semibold rounded-full border-2 text-[#ED1C24] border-[#ED1C24] bg-transparent hover:shadow-[0_0_5px_5px_#ED1C244C]"
        >
          {isCollapsed ? <CiMenuKebab className="w-4 h-4" /> : <CiMenuBurger className="w-4 h-4" />}
        </button>
      </div>

      <Button
        label="Users Management"
        onClick={() => handleClick(PATH_DASHBOARD.usersManagement)}
        type="button"
        variant="primary"
        isAdmin={user?.roles?.includes('ADMIN')}
      />
      <Button
        label="Send Message"
        onClick={() => handleClick(PATH_DASHBOARD.sendMessage)}
        type="button"
        variant="primary"
      />
      <Button
        label="Inbox"
        onClick={() => handleClick(PATH_DASHBOARD.inbox)}
        type="button"
        variant="primary"
      />
      <Button
        label="All Messages"
        onClick={() => handleClick(PATH_DASHBOARD.allMessages)}
        type="button"
        variant="primary"
        isAdmin={user?.roles?.includes('ADMIN')}
      />
      <Button
        label="All Logs"
        onClick={() => handleClick(PATH_DASHBOARD.systemLogs)}
        type="button"
        variant="primary"
        isAdmin={user?.roles?.includes('ADMIN')}
      />
      <Button
        label="My Logs"
        onClick={() => handleClick(PATH_DASHBOARD.myLogs)}
        type="button"
        variant="primary"
      />
      <Button
        label="Investment Forms"
        onClick={() => handleClick(PATH_DASHBOARD.investmentForms)}
        type="button"
        variant="primary"
      />
      <Button
        label="Assets Management"
        onClick={() => handleClick(PATH_DASHBOARD.assetsManagement)}
        type="button"
        variant="primary"
      />
      <hr className="border-[#ED1C24]" />
      <Button
        label="Admin Page"
        onClick={() => handleClick(PATH_DASHBOARD.admin)}
        type="button"
        variant="primary"
      />
      <Button
        label="Manager Page"
        onClick={() => handleClick(PATH_DASHBOARD.manager)}
        type="button"
        variant="primary"
      />
      <Button
        label="User Page"
        onClick={() => handleClick(PATH_DASHBOARD.user)}
        type="button"
        variant="primary"
      />
    </div>
  );
};

export default Sidebar;