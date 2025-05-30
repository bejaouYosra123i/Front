import { useEffect, useState } from 'react';
import useAuth from './useAuth.hook';
import axiosInstance from '../utils/axiosInstance';

export interface SmartNotification {
  type: 'info' | 'warning' | 'urgent';
  text: string;
  priority: number;
  date: string; // format YYYY-MM-DD
  category: 'investment' | 'asset' | 'request' | 'message' | 'security' | 'other';
}

export function useSmartNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);

  useEffect(() => {
    async function fetchData() {
      const notifs: SmartNotification[] = [];
      const today = new Date().toISOString().slice(0, 10);
      // Messages non lus
      try {
        const messagesRes = await axiosInstance.get('/Messages/my');
        const unread = (messagesRes.data || []).filter((m: any) => !m.read);
        if (unread.length > 0) {
          // Grouper par date de message
          const byDate: Record<string, number> = {};
          unread.forEach((m: any) => {
            const d = m.date ? m.date.slice(0, 10) : today;
            byDate[d] = (byDate[d] || 0) + 1;
          });
          Object.entries(byDate).forEach(([date, count]) => {
            notifs.push({ type: 'info', text: `You have ${count} unread message(s).`, priority: 1, date, category: 'message' });
          });
        }
      } catch {}
      // Demandes en attente (InvestmentForm items)
      try {
        const formsRes = await axiosInstance.get('/InvestmentForm');
        const forms = formsRes.data || [];
        const allItems = forms.flatMap((f: any) => f.items || []);
        const pendingByDate: Record<string, number> = {};
        allItems.forEach((item: any) => {
          if (item.status === 'Pending') {
            const d = item.createdAt ? item.createdAt.slice(0, 10) : today;
            pendingByDate[d] = (pendingByDate[d] || 0) + 1;
          }
        });
        Object.entries(pendingByDate).forEach(([date, count]) => {
          notifs.push({ type: 'urgent', text: `You have ${count} pending investment item(s).`, priority: 0, date, category: 'investment' });
        });
      } catch {}
      // Demandes approuvées (PC Requests)
      try {
        const requestsRes = await axiosInstance.get('/PcRequest/requests');
        const approved = (requestsRes.data || []).filter((r: any) => r.status === 'Approved');
        const approvedByDate: Record<string, number> = {};
        approved.forEach((r: any) => {
          const d = r.updatedAt ? r.updatedAt.slice(0, 10) : today;
          approvedByDate[d] = (approvedByDate[d] || 0) + 1;
        });
        Object.entries(approvedByDate).forEach(([date, count]) => {
          notifs.push({ type: 'info', text: `You have ${count} approved request(s).`, priority: 1, date, category: 'request' });
        });
      } catch {}
      // Assets approuvés
      try {
        const assetsRes = await axiosInstance.get('/Asset');
        const approved = (assetsRes.data || []).filter((a: any) => a.status === 'Approved');
        const approvedByDate: Record<string, number> = {};
        approved.forEach((a: any) => {
          const d = a.lastUpdate ? a.lastUpdate.slice(0, 10) : today;
          approvedByDate[d] = (approvedByDate[d] || 0) + 1;
        });
        Object.entries(approvedByDate).forEach(([date, count]) => {
          notifs.push({ type: 'info', text: `You have ${count} approved asset(s).`, priority: 1, date, category: 'asset' });
        });
      } catch {}
      // Trier par priorité puis par date décroissante
      notifs.sort((a, b) => a.priority - b.priority || b.date.localeCompare(a.date));
      setNotifications(notifs);
    }
    fetchData();
  }, [user]);

  return notifications;
} 