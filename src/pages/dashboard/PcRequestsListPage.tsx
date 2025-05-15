import React, { useEffect, useState } from 'react';
import { requestService } from '../../services/requestService';
import { toast } from 'react-hot-toast';
import { FaCheck, FaTimes, FaPrint } from 'react-icons/fa';
import jsPDF from 'jspdf';
import { authService } from '../../services/authService';
import useAuth from '../../hooks/useAuth.hook';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PcRequest {
  id: number;
  fullName: string;
  department: string;
  function: string;
  pcType: string;
  reason: string;
  requestedBy: string;
  signatures: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  status: string;
}

const PAGE_SIZE = 5;

const PcRequestsListPage: React.FC = () => {
  const [requests, setRequests] = useState<PcRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [pcTypeFilter, setPcTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const userRole = user?.roles?.[0];

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await requestService.getAllRequests();
        setRequests(data);
      } catch (e: any) {
        setError(e?.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Filter requests for USER role
  const isUser = user?.roles?.includes('USER');
  const userName = user?.userName || user?.firstName || user?.email;
  const visibleRequests = isUser
    ? requests.filter(req => req.requestedBy?.toLowerCase() === userName?.toLowerCase())
    : requests;

  // Filtres dynamiques
  const filtered = visibleRequests.filter(req =>
    (!departmentFilter || req.department === departmentFilter) &&
    (!pcTypeFilter || req.pcType === pcTypeFilter) &&
    (!statusFilter || req.status === statusFilter) &&
    (search === '' || req.fullName.toLowerCase().includes(search.toLowerCase()) || req.reason.toLowerCase().includes(search.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Pour les menus déroulants
  const departments = Array.from(new Set(requests.map(r => r.department))).filter(Boolean);
  const pcTypes = Array.from(new Set(requests.map(r => r.pcType))).filter(Boolean);
  const statuses = Array.from(new Set(requests.map(r => r.status))).filter(Boolean);

  // Filtrage des données selon le status sélectionné
  const displayedRequests = statusFilter === 'All' ? visibleRequests : visibleRequests.filter(r => r.status === statusFilter);

  // Adapter les cards
  const summaryFiltered = {
    total: displayedRequests.length,
    pending: displayedRequests.filter(r => r.status === 'Pending').length,
    approved: displayedRequests.filter(r => r.status === 'Approved').length,
    rejected: displayedRequests.filter(r => r.status === 'Rejected').length,
  };

  // Générer les données pour la courbe par status et date (corrigé)
  const statusList = ['Pending', 'Approved', 'Rejected'];
  const grouped: Record<string, Record<string, number>> = {};
  requests.forEach(req => {
    const date = req.createdAt.slice(0, 10);
    if (!grouped[date]) grouped[date] = { 'Pending': 0, 'Approved': 0, 'Rejected': 0 };
    if (statusList.includes(req.status)) grouped[date][req.status]++;
  });
  const allDates = Object.keys(grouped).sort();
  const chartDataAll = allDates.map(date => ({
    date,
    'Pending': grouped[date]['Pending'],
    'Approved': grouped[date]['Approved'],
    'Rejected': grouped[date]['Rejected'],
  }));

  // Adapter la courbe filtrée
  const filteredChartData = chartDataAll.map(d => {
    if (statusFilter === 'All') return d;
    return {
      date: d.date,
      [statusFilter]: d[statusFilter as 'Pending' | 'Approved' | 'Rejected'],
    };
  });

  // Recherche filtrée
  const searchedRequests = displayedRequests.filter(req =>
    req.fullName.toLowerCase().includes(search.toLowerCase()) ||
    req.department.toLowerCase().includes(search.toLowerCase()) ||
    req.function.toLowerCase().includes(search.toLowerCase()) ||
    req.pcType.toLowerCase().includes(search.toLowerCase()) ||
    req.reason.toLowerCase().includes(search.toLowerCase()) ||
    req.status.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatus = async (id: number, status: string) => {
    console.log("handleStatus appelé avec id:", id, "status:", status);
    if (!user?.roles || user.roles[0] !== "MANAGER") {
      toast.error("Seul un manager peut valider ou refuser une demande.");
      return;
    }
    try {
      console.log("Avant appel requestService.updateStatus");
      await requestService.updateStatus(id, status);
      console.log("Après appel requestService.updateStatus");
      setRequests(reqs => reqs.map(r => r.id === id ? { ...r, status } : r));
      toast.success(`Demande ${status === 'Approved' ? 'validée' : 'refusée'} !`);
    } catch (e: any) {
      console.error("Erreur dans handleStatus:", e);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handlePrint = (req: PcRequest) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Demande de PC', 10, 15);
    doc.setFontSize(12);
    doc.text(`Nom & Prénom: ${req.fullName}`, 10, 30);
    doc.text(`Département: ${req.department}`, 10, 40);
    doc.text(`Fonction: ${req.function}`, 10, 50);
    doc.text(`Type de PC: ${req.pcType}`, 10, 60);
    doc.text(`Motif: ${req.reason}`, 10, 70);
    doc.text(`Demandé par: ${req.requestedBy}`, 10, 80);
    doc.text(`Statut: ${req.status}`, 10, 90);
    doc.text(`Date: ${new Date(req.createdAt).toLocaleString()}`, 10, 100);
    doc.text('Signatures:', 10, 110);
    let y = 120;
    Object.entries(req.signatures).forEach(([role, sig]) => {
      doc.text(`${role}: ${sig}`, 15, y);
      y += 10;
    });
    doc.save(`Demande_PC_${req.fullName.replace(/\s+/g, '_')}_${req.id}.pdf`);
  };

  // DEBUG : Affichage du rôle utilisateur
  console.log("user?.roles :", user?.roles);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div style={{color: 'red', fontWeight: 'bold'}}>Rôle détecté : {user?.roles && user.roles[0]}</div>
      <h1 className="text-2xl font-bold mb-6">PC Requests Dashboard</h1>
      <div className="flex flex-wrap gap-4 mb-4">
        <input type="text" placeholder="Recherche..." value={search} onChange={e => setSearch(e.target.value)} className="input" />
        <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="input">
          <option value="">Département</option>
          {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
        </select>
        <select value={pcTypeFilter} onChange={e => setPcTypeFilter(e.target.value)} className="input">
          <option value="">Type de PC</option>
          {pcTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>
      {/* FILTRE PAR STATUS */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <label className="font-medium">Filter by status:</label>
        <select
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e53935]"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
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
          <div className="text-lg font-semibold mb-2">Pending</div>
          <div className="text-3xl font-bold">{summaryFiltered.pending}</div>
        </div>
        <div className="bg-green-100 text-green-800 rounded-xl shadow p-6 text-center">
          <div className="text-lg font-semibold mb-2">Approved</div>
          <div className="text-3xl font-bold">{summaryFiltered.approved}</div>
        </div>
        <div className="bg-red-100 text-red-800 rounded-xl shadow p-6 text-center">
          <div className="text-lg font-semibold mb-2">Rejected</div>
          <div className="text-3xl font-bold">{summaryFiltered.rejected}</div>
        </div>
      </div>
      {/* COURBE PAR STATUS */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <ResponsiveContainer width="100%" height={300}>
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
          </LineChart>
        </ResponsiveContainer>
      </div>
      {loading && <div>Chargement...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Nom & Prénom</th>
                <th className="px-4 py-2 border">Département</th>
                <th className="px-4 py-2 border">Fonction</th>
                <th className="px-4 py-2 border">Type de PC</th>
                <th className="px-4 py-2 border">Motif</th>
                <th className="px-4 py-2 border">Demandé par</th>
                <th className="px-4 py-2 border">Signatures</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {searchedRequests.map((req) => (
                <tr key={req.id}>
                  <td className="px-4 py-2 border">{req.fullName}</td>
                  <td className="px-4 py-2 border">{req.department}</td>
                  <td className="px-4 py-2 border">{req.function}</td>
                  <td className="px-4 py-2 border">{req.pcType}</td>
                  <td className="px-4 py-2 border">{req.reason}</td>
                  <td className="px-4 py-2 border">{req.requestedBy}</td>
                  <td className="px-4 py-2 border">
                    <ul className="text-xs">
                      {Object.entries(req.signatures).map(([role, sig]) => (
                        <li key={role}><b>{role}:</b> {sig}</li>
                      ))}
                    </ul>
                  </td>
                  <td className={`px-4 py-2 border font-bold ${req.status === 'Approved' ? 'text-green-600' : req.status === 'Rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{req.status}</td>
                  <td className="px-4 py-2 border">{new Date(req.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2 border flex flex-col gap-2 items-center">
                    {user?.roles?.includes("MANAGER") && req.status === 'Pending' && (
                      <div className="flex gap-2">
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 shadow flex items-center"
                          title="Approve"
                          onClick={() => handleStatus(req.id, 'Approved')}
                        >
                          <FaCheck />
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow flex items-center"
                          title="Reject"
                          onClick={() => handleStatus(req.id, 'Rejected')}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    )}
                    {user?.roles && user.roles[0] !== "MANAGER" && req.status === 'Pending' && (
                      <div className="text-xs text-gray-500">Seul un manager peut valider ou refuser.</div>
                    )}
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow flex items-center mt-1"
                      title="Imprimer PDF"
                      onClick={() => handlePrint(req)}
                    >
                      <FaPrint />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PcRequestsListPage; 