import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import InvestmentFormCreate from './InvestmentFormCreate';
import { toast } from 'react-hot-toast';
import { investmentFormService } from '../../services/investmentFormService';
import TrackingModal from './TrackingModal';
import useAuth from '../../hooks/useAuth.hook';

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
  numRitm?: string;
  numCoupa?: string;
  numIyras?: string;
  et?: string;
  ioNumber?: string;
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
  const [showDeleteModal, setShowDeleteModal] = useState(false); // État pour le modal
  const [deletePassword, setDeletePassword] = useState(''); // État pour le mot de passe
  const [deleteError, setDeleteError] = useState<string | null>(null); // État pour les erreurs
  const [deletingId, setDeletingId] = useState<number | null>(null); // ID de la demande à supprimer
  const [showTracking, setShowTracking] = useState(false);
  const [trackingForm, setTrackingForm] = useState<InvestmentFormData | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get<InvestmentFormData[]>('/InvestmentForm');
        const forms = response.data;
        setFilteredForms(forms);
        // 1. Préparer les données pour la courbe (groupement par date et status)
        const statusList = ['Pending', 'Accepted', 'Rejected'];
        const grouped: Record<string, Record<string, number>> = {};
        forms.forEach(form => {
          const date = form.reqDate?.slice(0, 10);
          if (!date) return;
          if (!grouped[date]) grouped[date] = { Pending: 0, Accepted: 0, Rejected: 0 };
          if (statusList.includes(form.status)) grouped[date][form.status]++;
        });
        // Générer les données pour recharts
        const allDates = Object.keys(grouped).sort();
        const chartData = allDates.map(date => ({
          date,
          Pending: grouped[date].Pending,
          Accepted: grouped[date].Accepted,
          Rejected: grouped[date].Rejected
        }));
        setChartData(chartData);
        // 2. Calculer les totaux pour les cards
        const total = forms.length;
        const pending = forms.filter(f => f.status === 'Pending').length;
        const accepted = forms.filter(f => f.status === 'Accepted').length;
        const rejected = forms.filter(f => f.status === 'Rejected').length;
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
          total,
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

  return (
    <div className="p-8 max-w-6xl mx-auto">
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
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-100 rounded-xl shadow p-6 text-center">
          <div className="text-lg font-semibold mb-2">Total Requests</div>
          <div className="text-3xl font-bold">{summaryFiltered.total}</div>
        </div>
        <div className="bg-orange-100 text-orange-800 rounded-xl shadow p-6 text-center">
          <div className="text-lg font-semibold mb-2">Pending Requests</div>
          <div className="text-3xl font-bold">{summaryFiltered.pending}</div>
        </div>
        <div className="bg-green-100 text-green-800 rounded-xl shadow p-6 text-center">
          <div className="text-lg font-semibold mb-2">Accepted Assets</div>
          <div className="text-3xl font-bold">{summaryFiltered.accepted}</div>
        </div>
        <div className="bg-red-100 text-red-800 rounded-xl shadow p-6 text-center">
          <div className="text-lg font-semibold mb-2">Monthly Budget</div>
          <div className="text-3xl font-bold">£{summaryFiltered.monthlyBudget.toLocaleString()}</div>
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
            {(statusFilter === 'All' || statusFilter === 'Accepted') && (
              <Line type="monotone" dataKey="Accepted" stroke="#43a047" strokeWidth={3} dot={{ r: 5 }} name="Accepted" />
            )}
            {(statusFilter === 'All' || statusFilter === 'Rejected') && (
              <Line type="monotone" dataKey="Rejected" stroke="#e53935" strokeWidth={3} dot={{ r: 5 }} name="Rejected" />
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
              <h2 className="text-xl font-bold">Requests Table</h2>
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
                    <th className="border px-2 py-1">ID</th>
                    <th className="border px-2 py-1">Region</th>
                    <th className="border px-2 py-1">Currency</th>
                    <th className="border px-2 py-1">Location</th>
                    <th className="border px-2 py-1">Type</th>
                    <th className="border px-2 py-1">Request Date</th>
                    <th className="border px-2 py-1">Status</th>
                    <th className="border px-2 py-1">Total</th>
                    <th className="border px-2 py-1">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {searchedForms.map(form => (
                    <tr key={form.id} className="hover:bg-gray-50">
                      <td className="border px-2 py-1">{form.id}</td>
                      <td className="border px-2 py-1">{form.region}</td>
                      <td className="border px-2 py-1">{form.currency}</td>
                      <td className="border px-2 py-1">{form.location}</td>
                      <td className="border px-2 py-1">{form.typeOfInvestment}</td>
                      <td className="border px-2 py-1">{form.reqDate?.slice(0, 10)}</td>
                      <td className="border px-2 py-1">{form.status}</td>
                      <td className="border px-2 py-1">{form.total.toFixed(2)}</td>
                      <td className="border px-2 py-1 space-x-2">
                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          onClick={() => setSelectedForm(form)}
                        >
                          Details
                        </button>
                        <button
                          className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
                          onClick={() => { setTrackingForm(form); setShowTracking(true); }}
                        >
                          Suivi
                        </button>
                        <button
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                          onClick={() => handleEdit(form)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                          onClick={() => handleDelete(form.id!)}
                          disabled={deletingId === form.id}
                        >
                          {deletingId === form.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
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
                  <div><b>Total:</b> {selectedForm.total.toFixed(2)}</div>
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
          {/* Ajouter le modal de suppression */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
                <p className="mb-4">Veuillez entrer votre mot de passe pour confirmer la suppression :</p>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mb-4"
                  placeholder="Mot de passe"
                />
                {deleteError && <p className="text-red-600 mb-4">{deleteError}</p>}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletePassword('');
                      setDeleteError(null);
                      setDeletingId(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    disabled={!deletePassword}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          )}
          {showTracking && trackingForm && (
            <TrackingModal
              trackingData={trackingForm}
              onClose={() => { setShowTracking(false); setTrackingForm(null); }}
              onSave={async (fields) => {
                try {
                  await axiosInstance.put(`/InvestmentForm/${trackingForm.id}`, {
                    ...trackingForm,
                    ...fields,
                    status: 'Accepted',
                  });
                  toast.success('Informations de suivi enregistrées !');
                  setShowTracking(false);
                  setTrackingForm(null);
                  window.location.reload();
                } catch (err) {
                  toast.error('Erreur lors de l\'enregistrement du suivi');
                }
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AssetsManagementPage;