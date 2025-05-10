import PageAccessTemplate from '../../components/dashboard/page-access/PageAccessTemplate';
import { FaUser } from 'react-icons/fa';

const UserPage = () => {
  return (
    <div className='pageTemplate2'>
      <PageAccessTemplate color='#E60012' icon={FaUser} role='User' />
    </div>
  );
};

export default UserPage;