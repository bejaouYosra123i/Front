import React, { useEffect, useState } from 'react';
import { requestService } from '../../services/requestService';
import { toast } from 'react-hot-toast';
import { FaCheck, FaTimes, FaPrint, FaFilter } from 'react-icons/fa';
import jsPDF from 'jspdf';
import { authService } from '../../services/authService';
import useAuth from '../../hooks/useAuth.hook';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AssetRequest {
  id: number;
  fullName: string;
  department: string;
  function: string;
  pcType: string;
  reason: string;
  requestedBy: string;
  signatures: Record<string, string>;
  approvals: Record<string, string>;
  currentApprovals: number;
  requiredApprovals: number;
  createdAt: string;
  updatedAt: string;
  status: string;
}

const PAGE_SIZE = 10;

const pcTypeLabels: Record<string, string> = {
  'PC de bureau': 'Desktop PC',
  'PC Portable': 'Laptop',
  'Clavier': 'Keyboard',
  'Écran': 'Monitor',
  'Câble': 'Cable',
  'Modem': 'Modem',
  'Souris': 'Mouse',
};

const AssetRequestsListPage: React.FC = () => {
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [pcTypeFilter, setPcTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const userRole = user?.userName || user?.firstName || user?.email;

  const APPROVER_ROLES = ["MANAGER", "IT_MANAGER", "RH_MANAGER", "PLANT_MANAGER"];
  const isApprover = user?.roles?.some(role => APPROVER_ROLES.includes(role));

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await requestService.getAllRequests();
        // Filtrer les requêtes selon le rôle de l'utilisateur
        const filteredData = isApprover 
          ? data 
          : data.filter((req: AssetRequest) => req.requestedBy === userRole);
        setRequests(filteredData);
      } catch (e: any) {
        setError(e?.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [isApprover, userRole]);

  // Filter requests based on search criteria
  const filteredRequests = requests.filter(req => {
    const matchesSearch = search === '' || 
      req.fullName.toLowerCase().includes(search.toLowerCase()) ||
      req.department.toLowerCase().includes(search.toLowerCase()) ||
      req.reason.toLowerCase().includes(search.toLowerCase());

    const matchesDepartment = departmentFilter === '' || req.department === departmentFilter;
    const matchesPcType = pcTypeFilter === '' || req.pcType === pcTypeFilter;
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesPcType && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / PAGE_SIZE);
  const paginatedRequests = filteredRequests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Pour les menus déroulants
  const departments = Array.from(new Set(requests.map(r => r.department))).filter(Boolean);
  const pcTypes = Array.from(new Set(requests.map(r => r.pcType))).filter(Boolean);
  const statuses = ['All', 'Pending', 'Approved', 'Rejected'];

  // Statistiques
  const summaryFiltered = {
    total: filteredRequests.length,
    pending: filteredRequests.filter(r => r.status === 'Pending').length,
    approved: filteredRequests.filter(r => r.status === 'Approved').length,
    rejected: filteredRequests.filter(r => r.status === 'Rejected').length,
  };

  const handleStatus = async (id: number, status: string) => {
    if (!isApprover) {
      toast.error("Only authorized managers can approve or reject a request.");
      return;
    }
    try {
      await requestService.updateStatus(id, status);
      setRequests(reqs => reqs.map(r => r.id === id ? { ...r, status } : r));
      toast.success(`Your approval has been recorded.!`);
    } catch (e: any) {
      if (e.response?.status === 400) {
        toast.error("You have already approved this request..");
      } else {
        toast.error('Error while updating the status');
      }
    }
  };

  const handlePrint = (request: AssetRequest) => {
    const doc = new jsPDF();
    
    // Add company logo or header
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('Asset Request Form', 105, 20, { align: 'center' });
    
    // Add request ID and date
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    doc.text(`Request ID: #${request.id}`, 20, 35);
    doc.text(`Date: ${new Date(request.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 20, 42);

    // Add a line separator
    doc.setDrawColor(44, 62, 80);
    doc.line(20, 45, 190, 45);

    // Request details section
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Request Details', 20, 55);

    // Add request information in a structured format
    doc.setFontSize(11);
    doc.setTextColor(52, 73, 94);
    
    const details = [
      { label: 'Full Name', value: request.fullName },
      { label: 'Department', value: request.department },
      { label: 'Function', value: request.function },
      { label: 'Asset Type', value: pcTypeLabels[request.pcType] || request.pcType },
      { label: 'Requested By', value: request.requestedBy },
      { label: 'Status', value: request.status }
    ];

    let yPosition = 65;
    details.forEach(detail => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${detail.label}:`, 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(detail.value, 70, yPosition);
      yPosition += 10;
    });

    // Add reason section
    yPosition += 5;
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Reason for Request', 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(11);
    doc.setTextColor(52, 73, 94);
    doc.setFont('helvetica', 'normal');
    const splitReason = doc.splitTextToSize(request.reason, 170);
    doc.text(splitReason, 20, yPosition);

    // Add approval status section
    yPosition += splitReason.length * 7 + 10;
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Approval Status', 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(11);
    doc.setTextColor(52, 73, 94);
    doc.text(`Current Approvals: ${request.currentApprovals}/${request.requiredApprovals}`, 20, yPosition);

    // Add footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text('This is an official document generated by the Asset Management System', 105, pageHeight - 20, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString('en-US')}`, 105, pageHeight - 10, { align: 'center' });

    // Save the PDF
    doc.save(`asset-request-${request.id}.pdf`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Asset Request Management</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <FaFilter /> {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les départements</option>
              {departments.map(dep => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
            <select
              value={pcTypeFilter}
              onChange={e => setPcTypeFilter(e.target.value)}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les types</option>
              {pcTypes.map(type => (
                <option key={type} value={type}>{pcTypeLabels[type] || type}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-100 rounded-xl shadow p-6 text-center">
          <div className="text-lg font-semibold mb-2">Total</div>
          <div className="text-3xl font-bold">{summaryFiltered.total}</div>
        </div>
        <div className="bg-orange-100 text-orange-800 rounded-xl shadow p-6 text-center">
          <div className="text-lg font-semibold mb-2">En attente</div>
          <div className="text-3xl font-bold">{summaryFiltered.pending}</div>
        </div>
        <div className="bg-green-100 text-green-800 rounded-xl shadow p-6 text-center">
          <div className="text-lg font-semibold mb-2">Approuvées</div>
          <div className="text-3xl font-bold">{summaryFiltered.approved}</div>
        </div>
        <div className="bg-red-100 text-red-800 rounded-xl shadow p-6 text-center">
          <div className="text-lg font-semibold mb-2">Rejetées</div>
          <div className="text-3xl font-bold">{summaryFiltered.rejected}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Département</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRequests.map(request => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{request.fullName}</div>
                    <div className="text-sm text-gray-500">{request.function}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pcTypeLabels[request.pcType] || request.pcType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${request.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                        request.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {isApprover && request.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleStatus(request.id, 'Approved')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleStatus(request.id, 'Rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handlePrint(request)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FaPrint />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            Précédent
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium
                ${page === pageNum ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {pageNum}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            Suivant
          </button>
        </nav>
      </div>
    </div>
  );
};

export default AssetRequestsListPage; 