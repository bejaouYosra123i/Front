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
    <div className='container mx-auto p-6 bg-[#FFFFFF] min-h-screen'>
      <h1 className='text-3xl font-bold text-[#000000] mb-6'>System Logs</h1>
      <div className='bg-[#D3DCE6] p-4 rounded-lg shadow-md'>
        <div className='grid grid-cols-6 gap-4 p-2 font-semibold text-[#000000] border-b-2 border-[#ED1C24]'>
          <span>No</span>
          <span>Date</span>
          <span>Username</span>
          <span className='col-span-3'>Description</span>
        </div>
        <div className='space-y-2 mt-4'>
          {logs.filter(item => item.userName !== 'TEST').map((item, index) => (
            <div key={index} className='grid grid-cols-6 gap-4 p-3 bg-[#FFFFFF] rounded-lg shadow-sm hover:bg-[#D3DCE6] transition-colors duration-200 border border-[#D3DCE6]'>
              <span className='text-[#000000]'>{index + 1}</span>
              <span className='text-[#000000]'>{moment(item.createdAt).fromNow()}</span>
              <span className='text-[#000000]'>{item.userName}</span>
              <span className='col-span-3 text-[#000000] break-words'>{translateEquipmentType(item.description)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemLogsPage;