import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth.hook';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

const statusList = ['En service', 'En maintenance', 'Remplacé', 'Scrap'];

const AssetLifecyclePage: React.FC = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [chartData, setChartData] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    // Générer les données pour la courbe
    const grouped: Record<string, Record<string, number>> = {};
    assets.forEach(asset => {
      const date = asset.acquisitionDate.slice(0, 10);
      if (!grouped[date]) grouped[date] = { 'En service': 0, 'En maintenance': 0, 'Remplacé': 0, 'Scrap': 0 };
      if (statusList.includes(asset.status)) grouped[date][asset.status]++;
    });
    const allDates = Object.keys(grouped).sort();
    const data = allDates.map(date => ({
      date,
      'En service': grouped[date]['En service'],
      'En maintenance': grouped[date]['En maintenance'],
      'Remplacé': grouped[date]['Remplacé'],
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
      setError('Erreur lors du chargement des assets');
      toast.error('Erreur lors du chargement des assets');
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
      toast.success('Statut mis à jour avec succès');
      fetchAssets(); // Rafraîchir la liste
    } catch (err) {
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'en service':
        return 'bg-green-100 text-green-800';
      case 'en maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'remplacé':
        return 'bg-blue-100 text-blue-800';
      case 'scrap':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAssets = statusFilter === 'All' 
    ? assets 
    : assets.filter(asset => asset.status.toLowerCase() === statusFilter.toLowerCase());

  // Recherche filtrée
  const searchedAssets = filteredAssets.filter(asset =>
    asset.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
    asset.description.toLowerCase().includes(search.toLowerCase()) ||
    asset.category.toLowerCase().includes(search.toLowerCase()) ||
    asset.assignedTo.toLowerCase().includes(search.toLowerCase())
  );

  // Adapter la courbe selon le filtre
  const filteredChartData = chartData.map(d => {
    if (statusFilter === 'All') return d;
    return {
      date: d.date,
      [statusFilter]: d[statusFilter as keyof typeof d],
    };
  });

  // Calcul des cards récapitulatives
  const summary = {
    total: assets.length,
    enService: assets.filter(a => a.status === 'En service').length,
    enMaintenance: assets.filter(a => a.status === 'En maintenance').length,
    remplace: assets.filter(a => a.status === 'Remplacé').length,
    scrap: assets.filter(a => a.status === 'Scrap').length,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Cycle de Vie des Assets</h1>

      {/* BARRE DE RECHERCHE */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Rechercher un asset..."
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
          <div className="text-lg font-semibold mb-2">En service</div>
          <div className="text-3xl font-bold">{summary.enService}</div>
        </div>
        <div className="bg-orange-100 text-orange-800 rounded-xl shadow p-6 text-center">
          <div className="text-lg font-semibold mb-2">En maintenance</div>
          <div className="text-3xl font-bold">{summary.enMaintenance}</div>
        </div>
        <div className="bg-blue-100 text-blue-800 rounded-xl shadow p-6 text-center">
          <div className="text-lg font-semibold mb-2">Remplacé</div>
          <div className="text-3xl font-bold">{summary.remplace}</div>
        </div>
        <div className="bg-red-100 text-red-800 rounded-xl shadow p-6 text-center">
          <div className="text-lg font-semibold mb-2">Scrap</div>
          <div className="text-3xl font-bold">{summary.scrap}</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <label className="font-medium">Filtrer par statut :</label>
        <select
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e53935]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">Tous</option>
          <option value="En service">En Service</option>
          <option value="En maintenance">En Maintenance</option>
          <option value="Remplacé">Remplacé</option>
          <option value="Scrap">Scrap</option>
        </select>
      </div>

      {/* COURBE PAR STATUS */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            {(statusFilter === 'All' || statusFilter === 'En service') && (
              <Line type="monotone" dataKey="En service" stroke="#43a047" strokeWidth={3} dot={{ r: 5 }} name="En service" />
            )}
            {(statusFilter === 'All' || statusFilter === 'En maintenance') && (
              <Line type="monotone" dataKey="En maintenance" stroke="#FFA500" strokeWidth={3} dot={{ r: 5 }} name="En maintenance" />
            )}
            {(statusFilter === 'All' || statusFilter === 'Remplacé') && (
              <Line type="monotone" dataKey="Remplacé" stroke="#1976d2" strokeWidth={3} dot={{ r: 5 }} name="Remplacé" />
            )}
            {(statusFilter === 'All' || statusFilter === 'Scrap') && (
              <Line type="monotone" dataKey="Scrap" stroke="#e53935" strokeWidth={3} dot={{ r: 5 }} name="Scrap" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tableau des Assets */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Numéro d'actif
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigné à
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Localisation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateAssetStatus(asset.id, 'En maintenance')}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      Maintenance
                    </button>
                    <button
                      onClick={() => updateAssetStatus(asset.id, 'Remplacé')}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Remplacer
                    </button>
                    <button
                      onClick={() => updateAssetStatus(asset.id, 'Scrap')}
                      className="text-red-600 hover:text-red-900"
                    >
                      Scrap
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default AssetLifecyclePage; 