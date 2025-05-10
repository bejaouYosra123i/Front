import PageAccessTemplate from '../../components/dashboard/page-access/PageAccessTemplate';
import { BsGlobeAmericas } from 'react-icons/bs';
import Button from '../../components/general/Button';
import { useNavigate } from 'react-router-dom';
import { PATH_DASHBOARD } from '../../routes/paths';

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className='container mx-auto p-6 bg-[#FFFFFF] min-h-screen'>
      <PageAccessTemplate color='#000' icon={BsGlobeAmericas} role='Dashboard'>
        <div className='text-3xl space-y-4 text-[#000000]'>
          <h1 className='font-bold'>Dashboard Access can be either:</h1>
          <h1 className='pl-4 text-[#003087]'>Admin</h1>
          <h1 className='pl-4 text-[#003087]'>Manager</h1>
          <h1 className='pl-4 text-[#003087]'>User</h1>
        </div>
        <div className='flex items-center justify-center mt-6 space-x-4'>
          <Button 
            label='Update Credentials' 
            onClick={() => navigate(PATH_DASHBOARD.updateCredentials)} 
            type='button' 
            variant='light' 
            className='bg-[#D3DCE6] text-[#000000] border-2 border-[#ED1C24] hover:bg-[#ED1C24] hover:text-[#FFFFFF] transition-colors duration-200 rounded-md shadow-md px-4 py-2'
          />
        </div>
      </PageAccessTemplate>
    </div>
  );
};

export default DashboardPage;