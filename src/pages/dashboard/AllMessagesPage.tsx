import { useEffect, useState } from 'react';
import { IMessageDto } from '../../types/message.types';
import axiosInstance from '../../utils/axiosInstance';
import { ALL_MESSAGES_URL } from '../../utils/globalConfig';
import { toast } from 'react-hot-toast';
import Spinner from '../../components/general/Spinner';
import moment from 'moment';
import useAuth from '../../hooks/useAuth.hook';
import usePrivileges from '../../hooks/usePrivileges';
import { Navigate } from 'react-router-dom';
import { PATH_PUBLIC } from '../../routes/paths';

const AllMessagesPage = () => {
  const [messages, setMessages] = useState<IMessageDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();
  const privileges = usePrivileges();
  const isAdmin = user?.roles?.includes('ADMIN');
  if (!(isAdmin || privileges.includes('ManagePrivileges'))) {
    return <Navigate to={PATH_PUBLIC.unauthorized} />;
  }

  const getAllMessages = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<IMessageDto[]>(ALL_MESSAGES_URL);
      const { data } = response;
      setMessages(data);
      setLoading(false);
    } catch (error) {
      toast.error('An Error happened. Please Contact admins');
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllMessages();
  }, []);

  // Badge pour demandes de reset non traitées
  const resetRequests = messages.filter(m => m.type === 'RESET_PASSWORD_REQUEST' && m.status !== 'DONE');

  const markAsDone = async (id: number) => {
    try {
      await axiosInstance.patch(`/Messages/${id}/mark-done`);
      toast.success('Request marked as done');
      getAllMessages();
    } catch (err) {
      toast.error('Error marking as done');
    }
  };

  if (loading) {
    return (
      <div className='w-full flex justify-center items-center h-screen'>
        <Spinner />
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 bg-[#FFFFFF] min-h-screen'>
      <div className="flex items-center gap-4 mb-4">
        <h1 className='text-3xl font-bold text-[#000000]'>All Messages</h1>
        {resetRequests.length > 0 && (
          <span className="bg-red-600 text-white rounded-full px-3 py-1 text-xs font-bold">{resetRequests.length} password reset request(s)</span>
        )}
      </div>
      <div className='bg-[#D3DCE6] p-4 rounded-lg shadow-md'>
        <div className='grid grid-cols-8 gap-4 p-2 font-semibold text-[#000000] border-b-2 border-[#ED1C24]'>
          <span>Date</span>
          <span className='col-span-5'>Text</span>
          <span>Sender</span>
          <span>Receiver</span>
        </div>
        <div className='space-y-2 mt-4'>
          {messages.map((item) => (
            <div key={item.id} className={`grid grid-cols-8 gap-4 p-3 rounded-lg shadow-sm border ${item.type === 'RESET_PASSWORD_REQUEST' ? 'bg-yellow-50 border-yellow-300' : 'bg-[#FFFFFF] border-[#D3DCE6]'} hover:bg-[#D3DCE6] transition-colors duration-200`}>
              <span className='text-[#000000]'>{moment(item.createdAt).fromNow()}</span>
              <span className='col-span-5 text-[#000000] break-words'>
                {item.text}
                {item.type === 'RESET_PASSWORD_REQUEST' && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">Password Reset</span>
                )}
              </span>
              <span className='text-[#000000]'>{item.senderUserName}</span>
              <span className='text-[#000000]'>{item.receiverUserName}</span>
              {item.type === 'RESET_PASSWORD_REQUEST' && item.status !== 'DONE' && (
                <button
                  className="col-span-8 mt-2 bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700 transition"
                  onClick={() => markAsDone(item.id)}
                >
                  Mark as done
                </button>
              )}
              {item.type === 'RESET_PASSWORD_REQUEST' && item.status === 'DONE' && (
                <span className="col-span-8 mt-2 text-green-700 text-xs font-bold">Request treated</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllMessagesPage;