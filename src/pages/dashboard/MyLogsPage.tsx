import { useEffect, useState } from 'react';
import { ILogDto } from '../../types/logs.types';
import axiosInstance from '../../utils/axiosInstance';
import { MY_LOGS_URL } from '../../utils/globalConfig';
import { toast } from 'react-hot-toast';
import Spinner from '../../components/general/Spinner';
import moment from 'moment';

const MyLogsPage = () => {
  const [myLogs, setMyLogs] = useState<ILogDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getLogs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<ILogDto[]>(MY_LOGS_URL);
      const { data } = response;
      setMyLogs(data);
      setLoading(false);
    } catch (error) {
      toast.error('An Error happened. Please Contact admins');
      setLoading(false);
    }
  };

  useEffect(() => {
    getLogs();
  }, []);

  if (loading) {
    return (
      <div className='w-full flex justify-center items-center h-screen'>
        <Spinner />
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 bg-[#FFFFFF] min-h-screen'>
      <h1 className='text-3xl font-bold text-[#000000] mb-6'>My Logs</h1>
      <div className='bg-[#D3DCE6] p-4 rounded-lg shadow-md'>
        <div className='grid grid-cols-6 gap-4 p-2 font-semibold text-[#000000] border-b-2 border-[#ED1C24]'>
          <span>No</span>
          <span>Date</span>
          <span>Username</span>
          <span className='col-span-3'>Description</span>
        </div>
        <div className='space-y-2 mt-4'>
          {myLogs.map((item, index) => (
            <div key={index} className='grid grid-cols-6 gap-4 p-3 bg-[#FFFFFF] rounded-lg shadow-sm hover:bg-[#D3DCE6] transition-colors duration-200 border border-[#D3DCE6]'>
              <span className='text-[#000000]'>{index + 1}</span>
              <span className='text-[#000000]'>{moment(item.createdAt).fromNow()}</span>
              <span className='text-[#000000]'>{item.userName}</span>
              <span className='col-span-3 text-[#000000] break-words'>{item.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyLogsPage;