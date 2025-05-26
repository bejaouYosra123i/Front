import { useEffect, useState } from 'react';
import useAuth from './useAuth.hook';
import axiosInstance from '../utils/axiosInstance';

export interface SmartNotification {
  type: 'info' | 'warning' | 'urgent';
  text: string;
  priority: number;
}

export function useSmartNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);

  useEffect(() => {
    async function fetchData() {
      const notifs: SmartNotification[] = [];
      // Messages non lus
      try {
        const messagesRes = await axiosInstance.get('/Messages/my');
        const unread = (messagesRes.data || []).filter((m: any) => !m.read);
        if (unread.length > 0) {
          notifs.push({ type: 'info', text: `You have ${unread.length} unread message(s).`, priority: 1 });
        }
      } catch {}
      // Demandes en attente (InvestmentForm items)
      try {
        const formsRes = await axiosInstance.get('/InvestmentForm');
        const forms = formsRes.data || [];
        const allItems = forms.flatMap((f: any) => f.items || []);
        const pending = allItems.filter((item: any) => item.status === 'Pending').length;
        if (pending > 0) {
          notifs.push({ type: 'urgent', text: `You have ${pending} pending investment item(s).`, priority: 0 });
        }
      } catch {}
      // Demandes approuvées (PC Requests)
      try {
        const requestsRes = await axiosInstance.get('/PcRequest/requests');
        const approved = (requestsRes.data || []).filter((r: any) => r.status === 'Approved');
        if (approved.length > 0) {
          notifs.push({ type: 'info', text: `You have ${approved.length} approved request(s).`, priority: 1 });
        }
      } catch {}
      // Assets approuvés
      try {
        const assetsRes = await axiosInstance.get('/Asset');
        const approved = (assetsRes.data || []).filter((a: any) => a.status === 'Approved');
        if (approved.length > 0) {
          notifs.push({ type: 'info', text: `You have ${approved.length} approved asset(s).`, priority: 1 });
        }
      } catch {}
      // Trier par priorité
      notifs.sort((a, b) => a.priority - b.priority);
      setNotifications(notifs);
    }
    fetchData();
  }, [user]);

  return notifications;
} 