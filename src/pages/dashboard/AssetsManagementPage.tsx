import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import InvestmentFormCreate from './InvestmentFormCreate';
import { toast } from 'react-hot-toast';
import { investmentFormService } from '../../services/investmentFormService';
import useAuth from '../../hooks/useAuth.hook';
import { investmentItemService } from '../../services/investmentItemService';
import TrackingModal from './TrackingModal';

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
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

interface ChartData {
  date: string;
  count: number;
}

const AssetsManagementPage: React.FC = () => {
  const { user } = useAuth();
  if (!user?.roles?.includes('ADMIN')) {
    return <div className="text-red-600 font-bold text-center p-8">Accès refusé : réservé aux administrateurs.</div>;
  }

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState<string>('');
  const [regions, setRegions] = useState<string[]>([]);
  const [summary, setSummary] = useState<{ total: number; minDate: string; maxDate: string; pending: number; accepted: number; rejected: number; monthlyBudget: number }>({ total: 0, minDate: '', maxDate: '', pending: 0, accepted: 0, rejected: 0, monthlyBudget: 0 });
  const [filteredForms, setFilteredForms] = useState<InvestmentFormData[]>([]);
  const [selectedForm, setSelectedForm] = useState<InvestmentFormData | null>(null);
  const [editForm, setEditForm] = useState<InvestmentFormData | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [allItems, setAllItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [trackingItem, setTrackingItem] = useState(null);
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
        const approved = allItemsFlat.filter(item => item.status === 'Approved').length;
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
          pending,
          approved,
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
    const items = [];
    filteredForms.forEach(form => {
      form.items.forEach(item => {
        items.push({
          ...item,
          formId: form.id,
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
    const approved = allItems.filter(item => item.status === 'Approved').length;
    const rejected = allItems.filter(item => item.status === 'Rejected').length;
    setSummary(s => ({
      ...s,
      pending,
      approved,
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

  const handleEdit = (form: InvestmentFormData) => {
    setEditForm(form);
    setShowEdit(true);
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
    accepted: displayedForms.filter(f => f.status === 'Accepted').length,
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

  const handleItemDetails = (item) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  const handleItemEdit = (item) => {
    setEditItem(item);
    setEditForm({
      description: item.description,
      supplier: item.supplier,
      unitCost: item.unitCost,
      quantity: item.quantity,
      shipping: item.shipping || 0,
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: name === 'unitCost' || name === 'quantity' || name === 'shipping' ? Number(value) : value }));
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await investmentItemService.updateItem(editItem.id, { ...editItem, ...editForm });
      toast.success('Item modifié !');
      setShowEditModal(false);
      setEditItem(null);
      window.location.reload();
    } catch (err) {
      toast.error('Erreur lors de la modification');
    }
  };

  const handleItemDelete = (item) => {
    setDeleteItem(item);
    setShowDeleteModal(true);
  };

  const confirmDeleteItem = async () => {
    try {
      await investmentItemService.deleteItem(deleteItem.id);
      toast.success('Item supprimé !');
      setShowDeleteModal(false);
      setDeleteItem(null);
      window.location.reload();
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleTracking = (item) => {
    setTrackingItem(item);
    setShowTrackingModal(true);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div style={{display: 'none'}}>{refresh}</div>
      <h1 className="text-2xl font-bold mb-6">Asset Management Dashboard</h1>
      {/* FILTRE PAR STATUS */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <label className="font-medium">Filtrer par status :</label>
        <select
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e53935]"
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
      {/* BARRE DE RECHERCHE */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Rechercher une demande..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e53935] w-72"
        />
      </div>
      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-100 rounded-xl shadow p-6 text-center">
          <div className="text-lg font-semibold mb-2">Total Requests</div>
          <div className="text-3xl font-bold">{summaryFiltered.total}</div>
        </div>
        <div className="bg-blue-100 text-blue-800 rounded-xl shadow p-6 text-center">
          <div className="text-lg font-semibold mb-2">Monthly Budget</div>
          <div className="text-3xl font-bold">€{summaryFiltered.monthlyBudget.toLocaleString()}</div>
        </div>
      </div>
      {/* COURBE PAR STATUS */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={filteredChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            {(statusFilter === 'All' || statusFilter === 'Pending') && (
              <Line type="monotone" dataKey="Pending" stroke="#FFA500" strokeWidth={3} dot={{ r: 5 }} name="Pending" />
            )}
            {(statusFilter === 'All' || statusFilter === 'Approved') && (
              <Line type="monotone" dataKey="Approved" stroke="#43a047" strokeWidth={3} dot={{ r: 5 }} name="Approved" />
            )}
            {(statusFilter === 'All' || statusFilter === 'Rejected') && (
              <Line type="monotone" dataKey="Rejected" stroke="#e53935" strokeWidth={3} dot={{ r: 5 }} name="Rejected" />
            )}
            {(statusFilter === 'All' || statusFilter === 'Under-approval') && (
              <Line type="monotone" dataKey="Under-approval" stroke="#f57f17" strokeWidth={3} dot={{ r: 5 }} name="Under-approval" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {loading ? (
        <p>Loading…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          {showEdit && editForm && (
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <InvestmentFormCreate
                editData={editForm}
                onSuccess={() => { setShowEdit(false); setEditForm(null); setSelectedForm(null); window.location.reload(); }}
                onCancel={() => { setShowEdit(false); setEditForm(null); }}
              />
            </div>
          )}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Items Table</h2>
              <button
                className="bg-[#43a047] text-white px-4 py-2 rounded-lg shadow-sm hover:bg-[#388e3c] transition"
                onClick={() => exportTableToExcel(searchedForms)}
              >
                Export Excel
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-100">
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
                        <td className="border px-2 py-1">{item.formId}</td>
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
                        <td className="border px-2 py-1 space-x-2">
                          <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm" onClick={() => handleItemDetails(item)}>Details</button>
                          <button className="bg-yellow-500 text-white px-3 py-1 rounded text-sm" onClick={() => handleItemEdit(item)}>Edit</button>
                          <button className="bg-red-600 text-white px-3 py-1 rounded text-sm" onClick={() => handleItemDelete(item)}>Delete</button>
                          <button className="bg-purple-600 text-white px-3 py-1 rounded text-sm" onClick={() => handleTracking(item)}>Suivi</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
          {showEditModal && editItem && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl"
                  onClick={() => setShowEditModal(false)}
                >×</button>
                <h3 className="text-xl font-bold mb-4">Edit Item #{editItem.id}</h3>
                <form onSubmit={handleEditFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <input name="description" value={editForm.description} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Supplier</label>
                    <input name="supplier" value={editForm.supplier} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Unit Cost</label>
                    <input name="unitCost" type="number" min="0" step="0.01" value={editForm.unitCost} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <input name="quantity" type="number" min="1" value={editForm.quantity} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Shipping</label>
                    <input name="shipping" type="number" min="0" step="0.01" value={editForm.shipping} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowEditModal(false)}>Annuler</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Enregistrer</button>
                  </div>
                </form>
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
              onStatusUpdate={async (updatedItem) => {
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