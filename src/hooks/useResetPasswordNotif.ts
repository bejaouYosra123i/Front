import { useEffect, useRef, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { ALL_MESSAGES_URL } from '../utils/globalConfig';

const useResetPasswordNotif = () => {
  const [count, setCount] = useState(0);
  const prevCount = useRef(0);

  const fetchNotif = async () => {
    try {
      const { data } = await axiosInstance.get(ALL_MESSAGES_URL);
      const resetRequests = data.filter((m: any) => m.type === 'RESET_PASSWORD_REQUEST' && m.status === 'NEW');
      prevCount.current = count;
      setCount(resetRequests.length);
    } catch {
      prevCount.current = count;
      setCount(0);
    }
  };

  useEffect(() => {
    fetchNotif();
    const interval = setInterval(fetchNotif, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return { count, prevCount: prevCount.current, fetchNotif };
};

export default useResetPasswordNotif; 