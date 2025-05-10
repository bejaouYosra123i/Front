import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import InvestmentFormCreate from './InvestmentFormCreate';
import { toast } from 'react-hot-toast';

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
}

interface ChartData {
  date: string;
  count: number;
}

const AssetsManagementPage: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState<string>('');
  const [regions, setRegions] = useState<string[]>([]);
  const [summary, setSummary] = useState<{ total: number; minDate: string; maxDate: string }>({ total: 0, minDate: '', maxDate: '' });
  const [filteredForms, setFilteredForms] = useState<InvestmentFormData[]>([]);
  const [selectedForm, setSelectedForm] = useState<InvestmentFormData | null>(null);
  const [editForm, setEditForm] = useState<InvestmentFormData | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get<InvestmentFormData[]>('/InvestmentForm');
        const forms = response.data;
        // Extraire toutes les régions uniques
        const uniqueRegions = Array.from(new Set(forms.map(f => f.region).filter(Boolean)));
        setRegions(uniqueRegions);
        // Filtrer par région si sélectionnée
        const filtered = region ? forms.filter(f => f.region === region) : forms;
        setFilteredForms(filtered);
        // Grouper par date (YYYY-MM-DD)
        const counts: Record<string, number> = {};
        filtered.forEach(form => {
          const date = form.reqDate?.slice(0, 10);
          if (date) {
            counts[date] = (counts[date] || 0) + 1;
          }
        });
        // Transformer en tableau trié
        const data: ChartData[] = Object.entries(counts)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date));
        setChartData(data);
        // Résumé
        setSummary({
          total: filtered.length,
          minDate: data.length ? data[0].date : '',
          maxDate: data.length ? data[data.length - 1].date : '',
        });
      } catch (err) {
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [region]);

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

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette demande ?')) return;
    setDeletingId(id);
    try {
      await axiosInstance.delete(`/InvestmentForm/${id}`);
      toast.success('Demande supprimée avec succès');
      setFilteredForms(forms => forms.filter(f => f.id !== id));
      setSelectedForm(null);
    } catch (err: any) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (form: InvestmentFormData) => {
    setEditForm(form);
    setShowEdit(true);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Investment Requests Trend (per day)</h1>
      <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-6 space-y-2 md:space-y-0">
        <div>
          <label className="text-sm font-medium mr-2">Filter by region:</label>
          <select
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#e53935]"
            value={region}
            onChange={e => setRegion(e.target.value)}
          >
            <option value="">All</option>
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-4 mt-2 md:mt-0">
          <div className="bg-[#e53935] text-white rounded-lg px-4 py-2 text-sm font-semibold shadow">Total requests: {summary.total}</div>
          {summary.minDate && <div className="bg-gray-100 rounded-lg px-4 py-2 text-sm">From <b>{summary.minDate}</b> to <b>{summary.maxDate}</b></div>}
        </div>
      </div>
      {loading ? (
        <p>Loading…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#e53935" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
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
                onClick={() => exportTableToExcel(filteredForms)}
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
                  {filteredForms.map(form => (
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
        </>
      )}
    </div>
  );
};

export default AssetsManagementPage; 