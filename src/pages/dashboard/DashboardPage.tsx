import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth.hook';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSmartNotifications } from '../../hooks/useSmartNotifications';
import { FiAlertTriangle, FiInfo, FiBell, FiTrash2, FiRefreshCw, FiTool } from 'react-icons/fi';

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

  // Filter assets for USER role
  const isUser = user?.roles?.includes('USER');
  const userName = user?.userName || user?.firstName || user?.email;
  const visibleAssets = isUser
    ? assets.filter(asset => asset.assignedTo?.toLowerCase() === userName?.toLowerCase())
    : assets;

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

  // Ajout d'une variable pour vérifier si l'utilisateur est admin
  const isAdmin = user?.roles?.includes('ADMIN');

  // Affichage toast uniforme pour toutes les notifications
  useEffect(() => {
    notifications.forEach((notif) => {
      const toastId = `notif-${notif.type}-${notif.text}`;
      toast.dismiss(toastId); // éviter les doublons
      toast(notif.text, {
        id: toastId,
        icon: notif.type === 'urgent' ? '🔔' : notif.type === 'warning' ? '⚠️' : 'ℹ️',
        duration: 5000,
        style: {
          background: '#fff',
          color: notif.type === 'urgent'
            ? '#e60012'
            : notif.type === 'warning'
            ? '#e6a800'
            : '#1976d2',
          fontWeight: 'bold',
          fontSize: '1rem',
          borderRadius: '12px',
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
          padding: '16px 24px',
        },
        position: 'top-right',
      });
    });
  }, [notifications]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Asset Lifecycle</h1>

      {/* SEARCH BAR */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search for an asset..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e53935] w-72"
        />
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-gray-100 rounded-xl shadow p-6 text-center">
          <div className="text-lg font-semibold mb-2">Total Assets</div>
          <div className="text-3xl font-bold">{summary.total}</div>
        </div>
        <div className="bg-green-100 text-green-800 rounded-xl shadow p-6 text-center">
          <div className="text-lg font-semibold mb-2">In Service</div>
          <div className="text-3xl font-bold">{summary.inService}</div>
        </div>
        <div className="bg-orange-100 text-orange-800 rounded-xl shadow p-6 text-center">
          <div className="text-lg font-semibold mb-2">In Maintenance</div>
          <div className="text-3xl font-bold">{summary.inMaintenance}</div>
        </div>
        <div className="bg-blue-100 text-blue-800 rounded-xl shadow p-6 text-center">
          <div className="text-lg font-semibold mb-2">Replaced</div>
          <div className="text-3xl font-bold">{summary.replaced}</div>
        </div>
        <div className="bg-red-100 text-red-800 rounded-xl shadow p-6 text-center">
          <div className="text-lg font-semibold mb-2">Scrap</div>
          <div className="text-3xl font-bold">{summary.scrap}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <label className="font-medium">Filter by status:</label>
        <select
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e53935]"
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
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            {(statusFilter === 'All' || statusFilter === 'In Service') && (
              <Line type="monotone" dataKey="In Service" stroke="#43a047" strokeWidth={3} dot={{ r: 5 }} name="In Service" />
            )}
            {(statusFilter === 'All' || statusFilter === 'In Maintenance') && (
              <Line type="monotone" dataKey="In Maintenance" stroke="#FFA500" strokeWidth={3} dot={{ r: 5 }} name="In Maintenance" />
            )}
            {(statusFilter === 'All' || statusFilter === 'Replaced') && (
              <Line type="monotone" dataKey="Replaced" stroke="#1976d2" strokeWidth={3} dot={{ r: 5 }} name="Replaced" />
            )}
            {(statusFilter === 'All' || statusFilter === 'Scrap') && (
              <Line type="monotone" dataKey="Scrap" stroke="#e53935" strokeWidth={3} dot={{ r: 5 }} name="Scrap" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div style={{ maxHeight: 420, overflowY: 'auto' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {searchedAssets.map((asset) => (
                <tr key={asset.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {asset.serialNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {asset.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {asset.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(asset.status)}`}> 
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {asset.assignedTo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {asset.location}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3 justify-center">
                        <button
                          onClick={() => updateAssetStatus(asset.id, 'In Maintenance')}
                          className="text-yellow-600 hover:text-yellow-900 text-xl"
                          title="Set to Maintenance"
                        >
                          <FiTool />
                        </button>
                        <button
                          onClick={() => updateAssetStatus(asset.id, 'Replaced')}
                          className="text-blue-600 hover:text-blue-900 text-xl"
                          title="Set to Replaced"
                        >
                          <FiRefreshCw />
                        </button>
                        <button
                          onClick={() => updateAssetStatus(asset.id, 'Scrap')}
                          className="text-red-600 hover:text-red-900 text-xl"
                          title="Set to Scrap"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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