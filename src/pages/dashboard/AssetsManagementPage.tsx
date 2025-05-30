import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import * as XLSX from 'xlsx';
import InvestmentFormCreate from './InvestmentFormCreate';
import { toast } from 'react-hot-toast';
import { investmentFormService } from '../../services/investmentFormService';
import useAuth from '../../hooks/useAuth.hook';
import { investmentItemService } from '../../services/investmentItemService';
import TrackingModal from './TrackingModal';
import usePrivileges from '../../hooks/usePrivileges';
import { Navigate } from 'react-router-dom';
import { PATH_PUBLIC } from '../../routes/paths';
import { FiTrash2, FiEye, FiInfo, FiBarChart2 } from 'react-icons/fi';

interface InvestmentFormData {
  id?: number;
  region: string;
  currency: string;
  location: string;
  typeOfInvestment: string;
  justification: string;
  reqDate: string;
  dueDate: string;
  observations: string;
  total: number;
  status: string;
  items: any[];
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

interface InvestmentItem {
  id?: number;
  formId?: number;
  description: string;
  supplier: string;
  unitCost: number;
  quantity: number;
  shipping: number;
  subTotal: number;
  total: number;
  investmentFormId: number;
  coupaNumber?: string;
  rytmNumber?: string;
  ioNumber?: string;
  iyrasNumber?: string;
  status?: string;
  region?: string;
  currency?: string;
  location?: string;
  typeOfInvestment?: string;
  reqDate?: string;
  dueDate?: string;
  justification?: string;
  observations?: string;
}

interface ChartData {
  date: string;
  Pending: number;
  Approved: number;
  Rejected: number;
  'Under-approval': number;
  [key: string]: number | string;
}

const AssetsManagementPage: React.FC = () => {
  const { user } = useAuth();
  const privileges = usePrivileges();
  const isAdmin = user?.roles?.includes('ADMIN');
  const canManageAssets = isAdmin || privileges.includes('ManageAssets');
  if (!canManageAssets) {
    return <Navigate to={PATH_PUBLIC.unauthorized} />;
  }

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState<string>('');
  const [regions, setRegions] = useState<string[]>([]);
  const [summary, setSummary] = useState<{ total: number; minDate: string; maxDate: string; pending: number; accepted: number; rejected: number; monthlyBudget: number }>({ total: 0, minDate: '', maxDate: '', pending: 0, accepted: 0, rejected: 0, monthlyBudget: 0 });
  const [filteredForms, setFilteredForms] = useState<InvestmentFormData[]>([]);
  const [selectedForm, setSelectedForm] = useState<InvestmentFormData | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [allItems, setAllItems] = useState<InvestmentItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InvestmentItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [deleteItem, setDeleteItem] = useState<InvestmentItem | null>(null);
  const [trackingItem, setTrackingItem] = useState<InvestmentItem | null>(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get<InvestmentFormData[]>('/InvestmentForm');
        const forms = response.data;
        setFilteredForms(forms);
        // 1. Préparer les données pour la courbe (groupement par date et status des items)
        const statusList = ['Pending', 'Approved', 'Rejected', 'Under-approval'];
        const grouped: Record<string, Record<string, number>> = {};
        forms.forEach(form => {
          const date = form.reqDate?.slice(0, 10);
          if (!date) return;
          if (!grouped[date]) grouped[date] = { Pending: 0, Approved: 0, Rejected: 0, 'Under-approval': 0 };
          form.items.forEach(item => {
            const s = item.status || 'Pending';
            if (statusList.includes(s)) grouped[date][s]++;
            else grouped[date]['Pending']++;
          });
        });
        // Générer les données pour recharts
        const allDates = Object.keys(grouped).sort();
        const chartData = allDates.map(date => ({
          date,
          Pending: grouped[date].Pending,
          Approved: grouped[date].Approved,
          Rejected: grouped[date].Rejected,
          'Under-approval': grouped[date]['Under-approval']
        }));
        setChartData(chartData);
        // 2. Calculer les totaux pour les cards (par items)
        const allItemsFlat = forms.flatMap(f => f.items || []);
        const pending = allItemsFlat.filter(item => item.status === 'Pending').length;
        const accepted = allItemsFlat.filter(item => item.status === 'Approved').length;
        const rejected = allItemsFlat.filter(item => item.status === 'Rejected').length;
        // 3. Calculer le budget mensuel (somme des total du mois courant)
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const monthlyBudget = forms
          .filter(f => {
            const d = new Date(f.reqDate);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          })
          .reduce((sum, f) => sum + (f.total || 0), 0);
        setSummary({
          total: forms.length,
          minDate: forms.length > 0 ? forms.reduce((min, f) => f.reqDate < min ? f.reqDate : min, forms[0].reqDate) : '',
          maxDate: forms.length > 0 ? forms.reduce((max, f) => f.reqDate > max ? f.reqDate : max, forms[0].reqDate) : '',
          pending,
          accepted,
          rejected,
          monthlyBudget
        });
        // Vérification automatique des demandes en retard
        const checkAndRejectLateRequests = async (forms: InvestmentFormData[]) => {
          const today = new Date();
          for (const form of forms) {
            if (
              form.status === 'Pending' &&
              form.dueDate &&
              new Date(form.dueDate) < today
            ) {
              try {
                await axiosInstance.put(`/InvestmentForm/${form.id}`, {
                  ...form,
                  status: 'Rejected',
                });
              } catch (err) {}
            }
          }
        };
        await checkAndRejectLateRequests(forms);
      } catch (err) {
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const items: InvestmentItem[] = [];
    filteredForms.forEach(form => {
      form.items.forEach((item: any) => {
        items.push({
          ...item,
          formId: form.id,
          investmentFormId: form.id,
          region: form.region,
          currency: form.currency,
          location: form.location,
          typeOfInvestment: form.typeOfInvestment,
          reqDate: form.reqDate,
          dueDate: form.dueDate,
          status: item.status,
          justification: form.justification,
          observations: form.observations,
        });
      });
    });
    setAllItems(items);
  }, [filteredForms]);

  useEffect(() => {
    // Calcul dynamique des cards à partir de allItems
    const pending = allItems.filter(item => item.status === 'Pending').length;
    const accepted = allItems.filter(item => item.status === 'Approved').length;
    const rejected = allItems.filter(item => item.status === 'Rejected').length;
    setSummary(s => ({
      ...s,
      pending,
      accepted,
      rejected
    }));
  }, [allItems]);

  function exportTableToExcel(forms: InvestmentFormData[]) {
    const wsData: any[][] = [];
    wsData.push(['ID', 'Region', 'Currency', 'Location', 'Type', 'Request Date', 'Status', 'Total']);
    forms.forEach(form => {
      wsData.push([
        form.id,
        form.region,
        form.currency,
        form.location,
        form.typeOfInvestment,
        form.reqDate?.slice(0, 10),
        form.status,
        form.total
      ]);
    });
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Requests');
    XLSX.writeFile(wb, 'Requests_Investment.xlsx');
  }

  const handleDelete = (id: number) => {
    // Ouvre le modal au lieu de demander une confirmation directe
    setDeletingId(id);
    setShowDeleteModal(true);
    setDeletePassword('');
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setDeleteError(null);
    try {
      await investmentFormService.deleteForm(deletingId, deletePassword);
      toast.success('Demande marquée comme supprimée avec succès');
      setFilteredForms(forms => forms.filter(f => f.id !== deletingId));
      setSelectedForm(null);
      setShowDeleteModal(false);
      setDeletePassword('');
      setDeleteError(null);
      setDeletingId(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Erreur lors de la suppression de la demande');
      console.error('Delete error:', err);
    }
  };

  // Filtrage des données selon le status sélectionné
  const displayedForms = statusFilter === 'All' ? filteredForms : filteredForms.filter(f => f.status === statusFilter);

  // Adapter les cards et la courbe selon le filtre
  const filteredChartData = chartData.map(d => {
    if (statusFilter === 'All') return d;
    return {
      date: d.date,
      [statusFilter]: d[statusFilter],
    };
  });

  // Adapter les cards
  const summaryFiltered = {
    total: displayedForms.length,
    pending: displayedForms.filter(f => f.status === 'Pending').length,
    accepted: displayedForms.filter(f => f.status === 'Approved').length,
    rejected: displayedForms.filter(f => f.status === 'Rejected').length,
    monthlyBudget: displayedForms
      .filter(f => {
        const d = new Date(f.reqDate);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, f) => sum + (f.total || 0), 0),
  };

  // Recherche filtrée
  const searchedForms = displayedForms.filter(form =>
    (form.id?.toString().includes(search)) ||
    form.region.toLowerCase().includes(search.toLowerCase()) ||
    form.currency.toLowerCase().includes(search.toLowerCase()) ||
    form.location.toLowerCase().includes(search.toLowerCase()) ||
    form.typeOfInvestment.toLowerCase().includes(search.toLowerCase()) ||
    form.status.toLowerCase().includes(search.toLowerCase())
  );

  const handleItemDetails = (item: InvestmentItem) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  const handleItemDelete = (item: InvestmentItem) => {
    setDeleteItem(item);
    setShowDeleteModal(true);
  };

  const confirmDeleteItem = async () => {
    if (!deleteItem) return;
    try {
      await investmentItemService.deleteItem(deleteItem.id!);
      toast.success('Item supprimé !');
      setShowDeleteModal(false);
      setDeleteItem(null);
      window.location.reload();
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleTracking = (item: InvestmentItem) => {
    setTrackingItem(item);
    setShowTrackingModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white py-10 px-2 md:px-8 flex flex-col items-center">
      <div style={{display: 'none'}}>{refresh}</div>
      {/* FILTRE PAR STATUS */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-center">
        <label className="font-medium">Filter by status :</label>
        <select
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Under-approval">Under-approval</option>
        </select>
      </div>
      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-6 text-center border border-blue-100">
          <div className="text-lg font-semibold mb-2 text-gray-700">Total Requests</div>
          <div className="text-3xl font-bold text-blue-900">{summaryFiltered.total}</div>
        </div>
        <div className="bg-blue-50 text-blue-900 rounded-2xl shadow-xl p-6 text-center border border-blue-100">
          <div className="text-lg font-semibold mb-2">Monthly Budget</div>
          <div className="text-3xl font-bold">€{summaryFiltered.monthlyBudget.toLocaleString()}</div>
        </div>
      </div>
      {/* COURBE PAR STATUS */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 mb-10 border border-blue-100 w-full max-w-5xl">
        <div className="flex items-center gap-2 mb-4">
          <FiBarChart2 className="text-blue-500 text-2xl" />
          <h2 className="text-xl font-bold text-gray-800 tracking-wide">Requests by Status Over Time</h2>
        </div>
        <ResponsiveContainer width="100%" height={380}>
          <AreaChart data={filteredChartData} margin={{ top: 30, right: 40, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFA500" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#FFA500" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#43a047" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#43a047" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e53935" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#e53935" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorUnderApproval" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f57f17" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f57f17" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="#e3e8ee" />
            <XAxis dataKey="date" tick={{ fontSize: 13, fill: '#8884d8' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 13, fill: '#8884d8' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 16, background: "#fff", border: "1px solid #e3e8ee", fontWeight: 500 }}
              labelFormatter={label => `Date : ${label}`}
              formatter={(value, name) => [`${value} request(s)`, name]}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontWeight: 500, fontSize: 15 }} />
            {(statusFilter === 'All' || statusFilter === 'Pending') && (
              <Area
                type="monotone"
                dataKey="Pending"
                stroke="#FFA500"
                fillOpacity={1}
                fill="url(#colorPending)"
                strokeWidth={3}
                dot={{ r: 5, fill: "#FFA500", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 8 }}
                name="Pending"
              />
            )}
            {(statusFilter === 'All' || statusFilter === 'Approved') && (
              <Area
                type="monotone"
                dataKey="Approved"
                stroke="#43a047"
                fillOpacity={1}
                fill="url(#colorApproved)"
                strokeWidth={3}
                dot={{ r: 5, fill: "#43a047", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 8 }}
                name="Approved"
              />
            )}
            {(statusFilter === 'All' || statusFilter === 'Rejected') && (
              <Area
                type="monotone"
                dataKey="Rejected"
                stroke="#e53935"
                fillOpacity={1}
                fill="url(#colorRejected)"
                strokeWidth={3}
                dot={{ r: 5, fill: "#e53935", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 8 }}
                name="Rejected"
              />
            )}
            {(statusFilter === 'All' || statusFilter === 'Under-approval') && (
              <Area
                type="monotone"
                dataKey="Under-approval"
                stroke="#f57f17"
                fillOpacity={1}
                fill="url(#colorUnderApproval)"
                strokeWidth={3}
                dot={{ r: 5, fill: "#f57f17", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 8 }}
                name="Under-approval"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {loading ? (
        <p>Loading…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-6xl border border-blue-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Items Table</h2>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition"
                onClick={() => exportTableToExcel(searchedForms)}
              >
                Export Excel
              </button>
            </div>
            <div className="overflow-x-auto">
              <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                <table className="min-w-full border">
                  <thead className="sticky top-0 bg-blue-50 z-10">
                    <tr className="bg-blue-50">
                      <th className="border px-2 py-1">Item ID</th>
                      <th className="border px-2 py-1">Form ID</th>
                      <th className="border px-2 py-1">Description</th>
                      <th className="border px-2 py-1">Supplier</th>
                      <th className="border px-2 py-1">Unit Cost</th>
                      <th className="border px-2 py-1">Quantity</th>
                      <th className="border px-2 py-1">Region</th>
                      <th className="border px-2 py-1">Status</th>
                      <th className="border px-2 py-1">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allItems.map(item => {
                      console.log('Item affiché dans le tableau:', item); // Debug
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="border px-2 py-1">{item.id}</td>
                          <td className="border px-2 py-1">{item.formId ?? item.investmentFormId}</td>
                          <td className="border px-2 py-1">{item.description}</td>
                          <td className="border px-2 py-1">{item.supplier}</td>
                          <td className="border px-2 py-1">{item.unitCost}</td>
                          <td className="border px-2 py-1">{item.quantity}</td>
                          <td className="border px-2 py-1">{item.region}</td>
                          <td className="border px-2 py-1">
                            {item.status && (
                              <span className={
                                item.status === 'Approved' ? 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold' :
                                item.status === 'Rejected' ? 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold' :
                                item.status === 'Under-approval' ? 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold' :
                                'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-bold'
                              }>
                                {item.status}
                              </span>
                            )}
                          </td>
                          <td className="border px-2 py-1">
                            <div className="flex flex-row items-center gap-2 justify-center">
                              <button title="Details" className="text-blue-600 hover:text-blue-800 text-xl" onClick={() => handleItemDetails(item)}>
                                <FiInfo />
                              </button>
                              <button title="Delete" className="text-red-600 hover:text-red-800 text-xl" onClick={() => handleItemDelete(item)} disabled={!canManageAssets}>
                                <FiTrash2 />
                              </button>
                              <button title="Tracking" className="text-purple-600 hover:text-purple-800 text-xl" onClick={() => handleTracking(item)}>
                                <FiEye />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Details modal */}
          {selectedForm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl"
                  onClick={() => setSelectedForm(null)}
                >
                  ×
                </button>
                <h3 className="text-xl font-bold mb-4">Request Details #{selectedForm.id}</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div><b>Region:</b> {selectedForm.region}</div>
                  <div><b>Currency:</b> {selectedForm.currency}</div>
                  <div><b>Location:</b> {selectedForm.location}</div>
                  <div><b>Type:</b> {selectedForm.typeOfInvestment}</div>
                  <div><b>Request Date:</b> {selectedForm.reqDate?.slice(0, 10)}</div>
                  <div><b>Due Date:</b> {selectedForm.dueDate?.slice(0, 10)}</div>
                  <div><b>Status:</b> {selectedForm.status}</div>
                  <div><b>Total:</b> {selectedForm.items.reduce((acc, item) => acc + (item.unitCost || 0), 0).toFixed(2)}</div>
                </div>
                <div className="mb-2"><b>Justification:</b> {selectedForm.justification}</div>
                <div className="mb-2"><b>Observations:</b> {selectedForm.observations}</div>
                <h4 className="font-bold mt-4 mb-2">Items</h4>
                <table className="min-w-full border mb-2">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1">Description</th>
                      <th className="border px-2 py-1">Supplier</th>
                      <th className="border px-2 py-1">Unit Price</th>
                      <th className="border px-2 py-1">Shipping</th>
                      <th className="border px-2 py-1">Qty</th>
                      <th className="border px-2 py-1">Subtotal</th>
                      <th className="border px-2 py-1">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedForm.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1">{item.description}</td>
                        <td className="border px-2 py-1">{item.supplier}</td>
                        <td className="border px-2 py-1">{item.unitCost}</td>
                        <td className="border px-2 py-1">{item.shipping}</td>
                        <td className="border px-2 py-1">{item.quantity}</td>
                        <td className="border px-2 py-1">{item.subTotal}</td>
                        <td className="border px-2 py-1">{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {showDetails && selectedItem && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl"
                  onClick={() => setShowDetails(false)}
                >×</button>
                <h3 className="text-xl font-bold mb-4">Item Details #{selectedItem.id}</h3>
                <div><b>Description:</b> {selectedItem.description}</div>
                <div><b>Supplier:</b> {selectedItem.supplier}</div>
                <div><b>Unit Cost:</b> {selectedItem.unitCost}</div>
                <div><b>Quantity:</b> {selectedItem.quantity}</div>
                <div><b>Region:</b> {selectedItem.region}</div>
                <div><b>Status:</b> {selectedItem.status}</div>
                {/* Ajoute d'autres infos si besoin */}
              </div>
            </div>
          )}
          {showDeleteModal && deleteItem && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl"
                  onClick={() => setShowDeleteModal(false)}
                >×</button>
                <h3 className="text-xl font-bold mb-4">Confirmer la suppression</h3>
                <p className="mb-4">Voulez-vous vraiment supprimer l'item <b>{deleteItem.description}</b> ?</p>
                <div className="flex justify-end space-x-2 mt-4">
                  <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowDeleteModal(false)}>Annuler</button>
                  <button type="button" className="px-4 py-2 bg-red-600 text-white rounded" onClick={confirmDeleteItem}>Supprimer</button>
                </div>
              </div>
            </div>
          )}
          {showTrackingModal && trackingItem && (
            <TrackingModal
              item={trackingItem}
              onClose={() => setShowTrackingModal(false)}
              onStatusUpdate={async (updatedItem: InvestmentItem) => {
                if (!updatedItem.id) return;
                const response = await investmentItemService.updateTracking(updatedItem.id, updatedItem);
                console.log('Réponse backend après update:', response?.data || response);
                setShowTrackingModal(false);
                setAllItems(items =>
                  items.map(item =>
                    item.id === updatedItem.id
                      ? { ...item, ...updatedItem, status: updatedItem.status }
                      : item
                  )
                );
                setFilteredForms(forms =>
                  forms.map(form => ({
                    ...form,
                    items: form.items.map(item =>
                      item.id === updatedItem.id
                        ? { ...item, ...updatedItem, status: updatedItem.status }
                        : item
                    )
                  }))
                );
                setRefresh(r => r + 1);
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AssetsManagementPage;