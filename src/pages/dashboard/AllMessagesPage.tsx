import { useEffect, useState } from 'react';
import { IMessageDto } from '../../types/message.types';
import axiosInstance from '../../utils/axiosInstance';
import { ALL_MESSAGES_URL } from '../../utils/globalConfig';
import { toast } from 'react-hot-toast';
import Spinner from '../../components/general/Spinner';
import moment from 'moment';

const AllMessagesPage = () => {
  const [messages, setMessages] = useState<IMessageDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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

  if (loading) {
    return (
      <div className='w-full flex justify-center items-center h-screen'>
        <Spinner />
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 bg-[#FFFFFF] min-h-screen'>
      <h1 className='text-3xl font-bold text-[#000000] mb-6'>All Messages</h1>
      <div className='bg-[#D3DCE6] p-4 rounded-lg shadow-md'>
        <div className='grid grid-cols-8 gap-4 p-2 font-semibold text-[#000000] border-b-2 border-[#ED1C24]'>
          <span>Date</span>
          <span className='col-span-5'>Text</span>
          <span>Sender</span>
          <span>Receiver</span>
        </div>
        <div className='space-y-2 mt-4'>
          {messages.map((item) => (
            <div key={item.id} className='grid grid-cols-8 gap-4 p-3 bg-[#FFFFFF] rounded-lg shadow-sm hover:bg-[#D3DCE6] transition-colors duration-200 border border-[#D3DCE6]'>
              <span className='text-[#000000]'>{moment(item.createdAt).fromNow()}</span>
              <span className='col-span-5 text-[#000000] break-words'>{item.text}</span>
              <span className='text-[#000000]'>{item.senderUserName}</span>
              <span className='text-[#000000]'>{item.receiverUserName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllMessagesPage;