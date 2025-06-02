import { useEffect, useState } from 'react';
import { ILogDto } from '../../types/logs.types';
import axiosInstance from '../../utils/axiosInstance';
import { LOGS_URL } from '../../utils/globalConfig';
import { toast } from 'react-hot-toast';
import Spinner from '../../components/general/Spinner';
import moment from 'moment';
import useAuth from '../../hooks/useAuth.hook';
import usePrivileges from '../../hooks/usePrivileges';
import { Navigate } from 'react-router-dom';
import { PATH_PUBLIC } from '../../routes/paths';

const SystemLogsPage = () => {
  const [logs, setLogs] = useState<ILogDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();
  const privileges = usePrivileges();
  const isAdmin = user?.roles?.includes('ADMIN');
  if (!(isAdmin || privileges.includes('ManagePrivileges'))) {
    return <Navigate to={PATH_PUBLIC.unauthorized} />;
  }

  const getLogs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<ILogDto[]>(LOGS_URL);
      const { data } = response;
      setLogs(data);
      setLoading(false);
    } catch (error) {
      toast.error('An Error happened. Please Contact admins');
      setLoading(false);
    }
  };

  useEffect(() => {
    getLogs();
  }, []);

  moment.locale('en');

  const equipmentTypeTranslation: Record<string, string> = {
    'Câble': 'Cable',
    'Clavier': 'Keyboard',
    'Écran': 'Monitor',
    'PC de bureau': 'Desktop PC',
    'Ordinateur portable': 'Laptop',
    'Modem': 'Modem',
    'Souris': 'Mouse',
  };

  function translateEquipmentType(description: string): string {
    let result = description;
    Object.entries(equipmentTypeTranslation).forEach(([fr, en]) => {
      // Remplace le type français par l'anglais, insensible à la casse
      result = result.replace(new RegExp(fr, 'gi'), en);
    });
    // Remplace "PC request" par "Asset request" si besoin
    result = result.replace(/PC request/gi, 'Asset request');
    return result;
  }

  if (loading) {
    return (
      <div className='w-full flex justify-center items-center h-screen'>
        <Spinner />
      </div>
    );
  }

  return (
    <div className='container mx-auto p-8 bg-gradient-to-br from-white via-gray-50 to-gray-100 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex items-center justify-between mb-8'>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent'>System Logs</h1>
          <div className='text-sm text-gray-500'>Total Logs: {logs.length}</div>
        </div>
        <div className='bg-white p-8 rounded-2xl shadow-xl backdrop-blur-sm border border-gray-100'>
          <div className='grid grid-cols-6 gap-6 p-4 font-semibold text-gray-700 border-b-2 border-red-500 bg-gray-50/50 rounded-t-lg'>
            <span className='text-gray-600'>No</span>
            <span className='text-gray-600'>Date</span>
            <span className='text-gray-600'>Username</span>
            <span className='col-span-3 text-gray-600'>Description</span>
          </div>
          <div className='space-y-4 mt-4'>
            {logs.filter(item => item.userName !== 'TEST').map((item, index) => (
              <div 
                key={index} 
                className='grid grid-cols-6 gap-6 p-5 bg-white rounded-xl shadow-sm hover:shadow-md hover:bg-red-50/30 transition-all duration-300 border border-gray-100 group'
              >
                <span className='text-gray-700 font-medium'>{index + 1}</span>
                <span className='text-gray-700'>{moment(item.createdAt).fromNow()}</span>
                <span className='text-gray-700 font-medium'>{item.userName}</span>
                <span className='col-span-3 text-gray-700 break-words group-hover:text-gray-900'>{translateEquipmentType(item.description)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemLogsPage;