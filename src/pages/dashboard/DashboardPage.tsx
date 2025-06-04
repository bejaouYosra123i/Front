import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth.hook';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { useSmartNotifications } from '../../hooks/useSmartNotifications';
import { FiAlertTriangle, FiInfo, FiBell, FiTrash2, FiRefreshCw, FiTool, FiDatabase, FiCheckCircle, FiSearch } from 'react-icons/fi';
import SummaryCard from '../../components/dashboard/SummaryCard';
import type { SmartNotification } from '../../hooks/useSmartNotifications';
import { Navigate } from 'react-router-dom';
import { PATH_DASHBOARD } from '../../routes/paths';

interface Asset {
  id: number;
  serialNumber: string;
  description: string;
  category: string;
  status: string;
  assignedTo: string;
  location: string;
  acquisitionDate: string;
  lastUpdate: string;
}

const statusList = ['In Service', 'In Maintenance', 'Replaced', 'Scrap'];

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [chartData, setChartData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const notifications = useSmartNotifications();
  const [visibleNotifications, setVisibleNotifications] = useState<any[]>([]);
  const [disappearing, setDisappearing] = useState<string[]>([]);
  const timers = useRef<{[key:number]: NodeJS.Timeout}>({});

  const isManager = user?.roles?.some(role =>
    typeof role === 'string' && role.toUpperCase().includes('MANAGER')
  );
  const isAdmin = user?.roles?.includes('ADMIN');
  const isSimpleUser = !isAdmin && !isManager;

  if (!isAdmin) {
    return <Navigate to={PATH_DASHBOARD.addRequest} />;
  }

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    // Generate chart data
    const grouped: Record<string, Record<string, number>> = {};
    assets.forEach(asset => {
      const date = asset.acquisitionDate.slice(0, 10);
      if (!grouped[date]) grouped[date] = { 'In Service': 0, 'In Maintenance': 0, 'Replaced': 0, 'Scrap': 0 };
      if (statusList.includes(asset.status)) grouped[date][asset.status]++;
    });
    const allDates = Object.keys(grouped).sort();
    const data = allDates.map(date => ({
      date,
      'In Service': grouped[date]['In Service'],
      'In Maintenance': grouped[date]['In Maintenance'],
      'Replaced': grouped[date]['Replaced'],
      'Scrap': grouped[date]['Scrap'],
    }));
    setChartData(data);
  }, [assets]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<Asset[]>('/Asset');
      setAssets(response.data);
    } catch (err) {
      setError('Error loading assets');
      toast.error('Error loading assets');
    } finally {
      setLoading(false);
    }
  };

  const updateAssetStatus = async (assetId: number, newStatus: string) => {
    try {
      await axiosInstance.put(
        `/Asset/${assetId}/status`,
        JSON.stringify(newStatus),
        { headers: { 'Content-Type': 'application/json' } }
      );
      toast.success('Status updated successfully');
      fetchAssets(); // Refresh the list
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in service':
        return 'bg-green-100 text-green-800';
      case 'in maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'replaced':
        return 'bg-blue-100 text-blue-800';
      case 'scrap':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const visibleAssets = assets;

  const filteredAssets = statusFilter === 'All' 
    ? visibleAssets
    : visibleAssets.filter(asset => asset.status.toLowerCase() === statusFilter.toLowerCase());

  // Filtered search
  const searchedAssets = filteredAssets.filter(asset =>
    asset.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
    asset.description.toLowerCase().includes(search.toLowerCase()) ||
    asset.category.toLowerCase().includes(search.toLowerCase()) ||
    asset.assignedTo.toLowerCase().includes(search.toLowerCase())
  );

  // Adapt chart based on filter
  const filteredChartData = chartData.map(d => {
    if (statusFilter === 'All') return d;
    return {
      date: d.date,
      [statusFilter]: d[statusFilter as keyof typeof d],
    };
  });

  // Calculate summary cards (use visibleAssets for user-specific view)
  const summary = {
    total: visibleAssets.length,
    inService: visibleAssets.filter(a => a.status === 'In Service').length,
    inMaintenance: visibleAssets.filter(a => a.status === 'In Maintenance').length,
    replaced: visibleAssets.filter(a => a.status === 'Replaced').length,
    scrap: visibleAssets.filter(a => a.status === 'Scrap').length,
  };

  // Generate chart data (use visibleAssets for user-specific view)
  useEffect(() => {
    // Generate chart data
    const grouped: Record<string, Record<string, number>> = {};
    visibleAssets.forEach(asset => {
      const date = asset.acquisitionDate.slice(0, 10);
      if (!grouped[date]) grouped[date] = { 'In Service': 0, 'In Maintenance': 0, 'Replaced': 0, 'Scrap': 0 };
      if (statusList.includes(asset.status)) grouped[date][asset.status]++;
    });
    const allDates = Object.keys(grouped).sort();
    const data = allDates.map(date => ({
      date,
      'In Service': grouped[date]['In Service'],
      'In Maintenance': grouped[date]['In Maintenance'],
      'Replaced': grouped[date]['Replaced'],
      'Scrap': grouped[date]['Scrap'],
    }));
    setChartData(data);
  }, [visibleAssets]);

  // Grouper les notifications par date
  const notificationsByDate = notifications.reduce((acc: Record<string, typeof notifications>, notif) => {
    if (!acc[notif.date]) acc[notif.date] = [];
    acc[notif.date].push(notif);
    return acc;
  }, {});

  // Ne garder que les notifications du jour actuel (toutes catégories)
  const today = new Date().toISOString().slice(0, 10);
  const todaysNotifications: SmartNotification[] = notificationsByDate[today] || [];

  let filteredNotifications = todaysNotifications;
  if (isSimpleUser) {
    filteredNotifications = todaysNotifications.filter(
      notif => notif.category !== 'request'
    );
  }

  // Gestion de l'apparition/disparition des notifications
  useEffect(() => {
    // Nettoyer les timers existants
    Object.values(timers.current).forEach(timer => clearTimeout(timer));
    timers.current = {};

    // Mettre à jour les notifications visibles
    setVisibleNotifications(filteredNotifications);

    // Configurer la disparition automatique après 3 secondes
    filteredNotifications.forEach((notif, index) => {
      const timer = setTimeout(() => {
        setDisappearing(prev => [...prev, notif.text]);
        setTimeout(() => {
          setVisibleNotifications(prev => prev.filter(n => n.text !== notif.text));
          setDisappearing(prev => prev.filter(text => text !== notif.text));
        }, 300); // Durée de l'animation de disparition
      }, 3000 + (index * 500)); // Délai progressif pour chaque notification
      timers.current[index] = timer;
    });

    return () => {
      Object.values(timers.current).forEach(timer => clearTimeout(timer));
    };
  }, [JSON.stringify(filteredNotifications)]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in service':
        return <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold"><FiCheckCircle className="mr-1" />In Service</span>;
      case 'in maintenance':
        return <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold"><FiTool className="mr-1" />In Maintenance</span>;
      case 'replaced':
        return <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold"><FiRefreshCw className="mr-1" />Replaced</span>;
      case 'scrap':
        return <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold"><FiTrash2 className="mr-1" />Scrap</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white py-10 px-2 md:px-8 flex flex-col items-center">
      {/* NOTIFICATIONS À DROITE */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {visibleNotifications.map((notif, idx) => (
          <div
            key={`${notif.text}-${idx}`}
            className={`transform transition-all duration-300 ease-in-out ${
              disappearing.includes(notif.text) 
                ? 'opacity-0 translate-x-[100%]' 
                : 'opacity-100 translate-x-0'
            }`}
          >
            <div className="bg-white rounded-lg shadow-lg p-3 border-l-4 border-yazaki-red flex items-center gap-3 min-w-[300px]">
              {notif.type === 'urgent' && <FiAlertTriangle className="text-yazaki-red text-xl" />}
              {notif.type === 'warning' && <FiInfo className="text-yazaki-red text-xl" />}
              {notif.type === 'info' && <FiInfo className="text-yazaki-red text-xl" />}
              <span className="text-sm font-medium text-gray-700">{notif.text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8 w-full max-w-6xl">
        <SummaryCard icon={<FiDatabase size={28} />} label="Total Assets" value={summary.total} color="bg-gray-100" />
        <SummaryCard icon={<FiCheckCircle size={28} />} label="In Service" value={summary.inService} color="bg-green-100 text-green-800" />
        <SummaryCard icon={<FiTool size={28} />} label="In Maintenance" value={summary.inMaintenance} color="bg-orange-100 text-orange-800" />
        <SummaryCard icon={<FiRefreshCw size={28} />} label="Replaced" value={summary.replaced} color="bg-blue-100 text-blue-800" />
        <SummaryCard icon={<FiTrash2 size={28} />} label="Scrap" value={summary.scrap} color="bg-red-100 text-red-800" />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-center">
        <label className="font-medium">Filter by status:</label>
        <select
          className="border rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="In Service">In Service</option>
          <option value="In Maintenance">In Maintenance</option>
          <option value="Replaced">Replaced</option>
          <option value="Scrap">Scrap</option>
        </select>
      </div>

      {/* STATUS CHART */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border border-blue-100 w-full max-w-5xl">
        <h2 className="text-xl font-bold text-gray-800 mb-4 tracking-wide">Assets by Status Over Time</h2>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={filteredChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorInService" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#43a047" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#43a047" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorInMaintenance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFA500" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#FFA500" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorReplaced" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#1976d2" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorScrap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e53935" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#e53935" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="#e3e8ee" />
            <XAxis dataKey="date" label={{ value: "Acquisition Date", position: "insideBottomRight", offset: -5, fontSize: 13, fill: '#8884d8' }} tick={{ fontSize: 13, fill: '#8884d8' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} label={{ value: "Number of assets", angle: -90, position: "insideLeft", fontSize: 13, fill: '#8884d8' }} tick={{ fontSize: 13, fill: '#8884d8' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 16, background: "#fff", border: "1px solid #e3e8ee", fontWeight: 500 }}
              labelFormatter={label => `Date : ${label}`}
              formatter={(value, name) => [`${value} asset(s)`, name]}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontWeight: 500, fontSize: 15 }} />
            {(statusFilter === 'All' || statusFilter === 'In Service') && (
              <Area
                type="monotone"
                dataKey="In Service"
                stroke="#43a047"
                fillOpacity={1}
                fill="url(#colorInService)"
                strokeWidth={3}
                dot={{ r: 5, fill: "#43a047", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 8 }}
                name="In Service"
              />
            )}
            {(statusFilter === 'All' || statusFilter === 'In Maintenance') && (
              <Area
                type="monotone"
                dataKey="In Maintenance"
                stroke="#FFA500"
                fillOpacity={1}
                fill="url(#colorInMaintenance)"
                strokeWidth={3}
                dot={{ r: 5, fill: "#FFA500", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 8 }}
                name="In Maintenance"
              />
            )}
            {(statusFilter === 'All' || statusFilter === 'Replaced') && (
              <Area
                type="monotone"
                dataKey="Replaced"
                stroke="#1976d2"
                fillOpacity={1}
                fill="url(#colorReplaced)"
                strokeWidth={3}
                dot={{ r: 5, fill: "#1976d2", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 8 }}
                name="Replaced"
              />
            )}
            {(statusFilter === 'All' || statusFilter === 'Scrap') && (
              <Area
                type="monotone"
                dataKey="Scrap"
                stroke="#e53935"
                fillOpacity={1}
                fill="url(#colorScrap)"
                strokeWidth={3}
                dot={{ r: 5, fill: "#e53935", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 8 }}
                name="Scrap"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      )}

      {error && (
        <div className="text-red-600 text-center py-4">
          {error}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;