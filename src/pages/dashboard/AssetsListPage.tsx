import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { FiTool, FiRefreshCw, FiTrash2, FiCheckCircle, FiSearch, FiDownload } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth.hook';
import { toast } from 'react-hot-toast';

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

const PAGE_SIZE = 10;

const AssetsListPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ADMIN');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<Asset[]>('/Asset');
        setAssets(response.data);
      } catch (err) {
        setError('Error loading assets');
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  // Filtering
  const filteredAssets = assets.filter(asset =>
    (search === '' ||
      asset.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      asset.description.toLowerCase().includes(search.toLowerCase()) ||
      asset.category.toLowerCase().includes(search.toLowerCase()) ||
      asset.assignedTo.toLowerCase().includes(search.toLowerCase())
    ) &&
    (statusFilter === 'All' || asset.status.toLowerCase() === statusFilter.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredAssets.length / PAGE_SIZE);
  const paginatedAssets = filteredAssets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

  // --- ADD FUNCTION TO CHANGE STATUS ---
  const updateAssetStatus = async (assetId: number, newStatus: string) => {
    try {
      await axiosInstance.put(
        `/Asset/${assetId}/status`,
        JSON.stringify(newStatus),
        { headers: { 'Content-Type': 'application/json' } }
      );
      setAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: newStatus } : a));
      toast.success('Asset status updated successfully!');
    } catch (err) {
      setError('Error updating status');
    }
  };

  // Ajout du mapping pour la description en anglais
  const descriptionLabels: Record<string, string> = {
    'Câble': 'Cable',
    'Clavier': 'Keyboard',
    'Souris': 'Mouse',
    'Écran': 'Monitor',
    'Modem': 'Modem',
    'Ordinateur': 'Desktop PC',
    'Portable': 'Laptop',
    'PC': 'Desktop PC',
    'Laptop': 'Laptop',
    'Cable': 'Cable',
    'Keyboard': 'Keyboard',
    'Mouse': 'Mouse',
    'Monitor': 'Monitor'
  };

  const translateDescription = (description: string): string => {
    // Supprimer le préfixe 'Desktop PC', 'PC' ou 'Ordinateur' au début, avec ou sans 'de bureau'
    let desc = description.replace(/^(Desktop PC|PC|Ordinateur)( de bureau)?\s+/i, '');
    // Supprimer 'de bureau' s'il reste ailleurs
    desc = desc.replace(/\bde bureau\b/gi, '').replace(/\s{2,}/g, ' ').trim();

    // Handle "requested by" format
    const match = desc.match(/^([A-Za-zÀ-ÿ]+) requested by (.+)$/i);
    if (match) {
      const typeFr = match[1];
      const who = match[2];
      const typeEn = descriptionLabels[typeFr] || typeFr;
      return `${typeEn} requested by ${who}`;
    }

    // Handle simple descriptions
    const words = desc.split(' ');
    const translatedWords = words.map(word => descriptionLabels[word] || word);
    return translatedWords.join(' ');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Assets List</h1>
          <p className="text-gray-500 text-sm">All company assets with their current status and assignment.</p>
        </div>
      </div>

      {/* Search bar and filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-72 shadow-sm"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Status</option>
          <option value="In Service">In Service</option>
          <option value="In Maintenance">In Maintenance</option>
          <option value="Replaced">Replaced</option>
          <option value="Scrap">Scrap</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div style={{ maxHeight: 700, overflowY: 'auto' }}>
          <table className="min-w-full divide-y divide-gray-200 text-base">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-8 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Asset Number</th>
                <th className="px-8 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="px-8 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-8 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Assigned To</th>
                <th className="px-8 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Location</th>
                {isAdmin && (
                  <th className="px-8 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-8 py-4 whitespace-nowrap text-base font-medium text-gray-900">{asset.serialNumber}</td>
                  <td className="px-8 py-4 whitespace-nowrap text-base text-gray-500">{translateDescription(asset.description)}</td>
                  <td className="px-8 py-4 whitespace-nowrap text-base text-gray-500">{
                    (() => {
                      switch (asset.category) {
                        case 'Câble': return 'Cable';
                        case 'Clavier': return 'Keyboard';
                        case 'Souris': return 'Mouse';
                        case 'Écran': return 'Monitor';
                        case 'Modem': return 'Modem';
                        case 'Ordinateur': return 'Desktop PC';
                        case 'Portable': return 'Laptop';
                        default: return asset.category;
                      }
                    })()
                  }</td>
                  <td className="px-8 py-4 whitespace-nowrap">{getStatusBadge(asset.status)}</td>
                  <td className="px-8 py-4 whitespace-nowrap text-base text-gray-500">{asset.assignedTo}</td>
                  <td className="px-8 py-4 whitespace-nowrap text-base text-gray-500">{asset.location}</td>
                  {isAdmin && (
                    <td className="px-8 py-4 whitespace-nowrap text-base font-medium">
                      <div className="flex space-x-3 justify-center">
                        <button className="text-yellow-600 hover:text-yellow-900 text-xl" title="Set to Maintenance" onClick={() => updateAssetStatus(asset.id, 'In Maintenance')}><FiTool /></button>
                        <button className="text-blue-600 hover:text-blue-900 text-xl" title="Set to Replaced" onClick={() => updateAssetStatus(asset.id, 'Replaced')}><FiRefreshCw /></button>
                        <button className="text-red-600 hover:text-red-900 text-xl" title="Set to Scrap" onClick={() => updateAssetStatus(asset.id, 'Scrap')}><FiTrash2 /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-2 border-t bg-gray-50">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      )}
      {error && (
        <div className="text-red-600 text-center py-4">{error}</div>
      )}
    </div>
  );
};

export default AssetsListPage; 