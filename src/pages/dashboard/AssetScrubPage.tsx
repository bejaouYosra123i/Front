import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AssetScrub {
  id: number;
  companyCode: string;
  plantCode: string;
  assetNumber: string;
  subNumber: string;
  serialNumber: string;
  quantity: number;
  totalPartialRetirement: string;
  costCenter: string;
  description: string;
  location: string;
  acquisitionDate?: string;
  acquisitionAmountEuro?: number;
  acquisitionAmountLocal?: number;
  netBookValueEuro?: number;
  netBookValueLocal?: number;
  assetOwner: string;
  dataInputDate?: string;
}

const emptyAsset: Omit<AssetScrub, 'id'> = {
  companyCode: '',
  plantCode: '',
  assetNumber: '',
  subNumber: '',
  serialNumber: '',
  quantity: 1,
  totalPartialRetirement: '',
  costCenter: '',
  description: '',
  location: '',
  acquisitionDate: '',
  acquisitionAmountEuro: undefined,
  acquisitionAmountLocal: undefined,
  netBookValueEuro: undefined,
  netBookValueLocal: undefined,
  assetOwner: '',
  dataInputDate: '',
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5137/api';

const AssetScrubPage = () => {
  const [data, setData] = useState<AssetScrub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newAsset, setNewAsset] = useState<Omit<AssetScrub, 'id'>>(emptyAsset);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/AssetScrub');
      setData(response.data);
    } catch (err: any) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id: number) => {
    setSelected((prev) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleAdd = async () => {
    try {
      await axios.post('/api/AssetScrub', newAsset);
      setShowAdd(false);
      setNewAsset(emptyAsset);
      fetchData();
    } catch (err) {
      alert('Erreur lors de l\'ajout');
    }
  };

  const handleDelete = async () => {
    if (selected.length === 0) return;
    try {
      await axios.post('/api/AssetScrub/delete-batch', { req: selected }, {
        headers: { 'Content-Type': 'application/json' }
      });
      toast.success('Suppression réussie !');
      setSelected([]);
      fetchData();
    } catch (err: any) {
      if (err.response && err.response.data) {
        toast.error('Erreur: ' + JSON.stringify(err.response.data));
      } else {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  // Fonction d'export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });
    // Titre centré
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Asset Scrap Request Report', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
    // Date en dessous
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.getWidth() / 2, 60, { align: 'center' });
    // Tableau principal
    autoTable(doc, {
      head: [[
        'Company Code', 'Plant Code', 'Asset Number', 'Sub Number', 'Serial Number', 'Quantity',
        'Total/Partial retirement', 'Cost Center', 'Description', 'Location', 'Acquisition Date',
        'Acquisition Amount Euro', 'Acquisition Amount Local', 'Net Book Value Euro',
        'Net Book Value Local', 'Asset Owner', 'Data Input Date']],
      body: data.map(asset => [
        asset.companyCode,
        asset.plantCode,
        asset.assetNumber,
        asset.subNumber,
        asset.serialNumber,
        asset.quantity.toString(),
        asset.totalPartialRetirement,
        asset.costCenter,
        asset.description,
        asset.location,
        asset.acquisitionDate ? asset.acquisitionDate.slice(0, 10) : '',
        asset.acquisitionAmountEuro?.toString() || '',
        asset.acquisitionAmountLocal?.toString() || '',
        asset.netBookValueEuro?.toString() || '',
        asset.netBookValueLocal?.toString() || '',
        asset.assetOwner,
        asset.dataInputDate ? asset.dataInputDate.slice(0, 10) : ''
      ]),
      startY: 80,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [255, 193, 7], textColor: 20, fontStyle: 'bold', halign: 'center', valign: 'middle' },
      bodyStyles: { valign: 'middle' },
      columnStyles: {
        0: { minCellWidth: 60 },
        1: { minCellWidth: 60 },
        2: { minCellWidth: 80 },
        3: { minCellWidth: 60 },
        4: { minCellWidth: 80 },
        5: { minCellWidth: 50 },
        6: { minCellWidth: 80 },
        7: { minCellWidth: 70 },
        8: { minCellWidth: 100 },
        9: { minCellWidth: 80 },
        10: { minCellWidth: 70 },
        11: { minCellWidth: 80 },
        12: { minCellWidth: 80 },
        13: { minCellWidth: 80 },
        14: { minCellWidth: 80 },
        15: { minCellWidth: 80 },
        16: { minCellWidth: 120 }
      },
      didDrawPage: (data) => {
        // Optionnel : ajouter un pied de page ou logo ici
      }
    });
    // Section d'approbation espacée et encadrée
    const approvalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 40 : 200;
    autoTable(doc, {
      body: [[
        { content: 'Asset Owner manager', styles: { halign: 'center', fontSize: 14, cellPadding: 16, lineWidth: 1, lineColor: [180,180,180] } },
        { content: 'Local Finance Approval', styles: { halign: 'center', fontSize: 14, cellPadding: 16, lineWidth: 1, lineColor: [180,180,180] } },
        { content: 'Plant Manager Approval', styles: { halign: 'center', fontSize: 14, cellPadding: 16, lineWidth: 1, lineColor: [180,180,180] } },
        { content: 'Bernhard Approval', styles: { halign: 'center', fontSize: 14, cellPadding: 16, lineWidth: 1, lineColor: [180,180,180] } }
      ]],
      startY: approvalY,
      theme: 'plain',
      styles: { fontSize: 14, halign: 'center', valign: 'middle', cellPadding: 16, lineWidth: 1, lineColor: [180,180,180] },
      tableLineWidth: 1,
      tableLineColor: [180, 180, 180],
      columnStyles: {
        0: { cellWidth: 180 },
        1: { cellWidth: 180 },
        2: { cellWidth: 180 },
        3: { cellWidth: 180 }
      }
    });
    doc.save('asset-scrap-report.pdf');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Asset Scrap Request</h1>
      <div className="flex gap-4 mb-4">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600"
          onClick={() => setShowAdd(true)}
        >
          + Ajouter un actif
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 flex items-center gap-2"
          onClick={handleExportPDF}
        >
          <span role="img" aria-label="export">📄</span> Exporter en PDF
        </button>
      </div>
      {loading ? (
        <p>Chargement…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-yellow-200">
                <th>Company Code</th>
                <th>Plant Code</th>
                <th>Asset Number</th>
                <th>Sub Number</th>
                <th>Serial Number</th>
                <th>Quantity</th>
                <th>Total/Partial retirement</th>
                <th>Cost Center</th>
                <th>Asset Description in English</th>
                <th>Location/Area</th>
                <th>Acquisition Date</th>
                <th>Acquisition Amount in Euro</th>
                <th>Acquisition Amount in Local currency</th>
                <th>Net Book Value in Euro</th>
                <th>Net Book Value in Local Currency</th>
                <th>Asset Owner</th>
                <th>Data input Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id}>
                  <td>{row.companyCode}</td>
                  <td>{row.plantCode}</td>
                  <td>{row.assetNumber}</td>
                  <td>{row.subNumber}</td>
                  <td>{row.serialNumber}</td>
                  <td>{row.quantity}</td>
                  <td>{row.totalPartialRetirement}</td>
                  <td>{row.costCenter}</td>
                  <td>{row.description}</td>
                  <td>{row.location}</td>
                  <td>{row.acquisitionDate ? row.acquisitionDate.slice(0, 10) : ''}</td>
                  <td>{row.acquisitionAmountEuro ?? ''}</td>
                  <td>{row.acquisitionAmountLocal ?? ''}</td>
                  <td>{row.netBookValueEuro ?? ''}</td>
                  <td>{row.netBookValueLocal ?? ''}</td>
                  <td>{row.assetOwner}</td>
                  <td>{row.dataInputDate ? row.dataInputDate.slice(0, 10) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex gap-8 mt-8">
        <div className="border p-4 w-48 text-center">Asset Owner manager</div>
        <div className="border p-4 w-48 text-center">Local Finance Approval</div>
        <div className="border p-4 w-48 text-center">Plant Manager Approval</div>
        <div className="border p-4 w-48 text-center">Bernhard Approval</div>
      </div>

      {/* Modal d'ajout */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl"
              onClick={() => setShowAdd(false)}
            >×</button>
            <h3 className="text-xl font-bold mb-4">Ajouter un actif</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input className="border p-2 rounded" placeholder="Company Code" value={newAsset.companyCode} onChange={e => setNewAsset(a => ({ ...a, companyCode: e.target.value }))} />
              <input className="border p-2 rounded" placeholder="Plant Code" value={newAsset.plantCode} onChange={e => setNewAsset(a => ({ ...a, plantCode: e.target.value }))} />
              <input className="border p-2 rounded" placeholder="Asset Number" value={newAsset.assetNumber} onChange={e => setNewAsset(a => ({ ...a, assetNumber: e.target.value }))} />
              <input className="border p-2 rounded" placeholder="Sub Number" value={newAsset.subNumber} onChange={e => setNewAsset(a => ({ ...a, subNumber: e.target.value }))} />
              <input className="border p-2 rounded" placeholder="Serial Number" value={newAsset.serialNumber} onChange={e => setNewAsset(a => ({ ...a, serialNumber: e.target.value }))} />
              <input className="border p-2 rounded" type="number" placeholder="Quantity" value={newAsset.quantity} onChange={e => setNewAsset(a => ({ ...a, quantity: Number(e.target.value) }))} />
              <input className="border p-2 rounded" placeholder="Total/Partial retirement" value={newAsset.totalPartialRetirement} onChange={e => setNewAsset(a => ({ ...a, totalPartialRetirement: e.target.value }))} />
              <input className="border p-2 rounded" placeholder="Cost Center" value={newAsset.costCenter} onChange={e => setNewAsset(a => ({ ...a, costCenter: e.target.value }))} />
              <input className="border p-2 rounded" placeholder="Description" value={newAsset.description} onChange={e => setNewAsset(a => ({ ...a, description: e.target.value }))} />
              <input className="border p-2 rounded" placeholder="Location" value={newAsset.location} onChange={e => setNewAsset(a => ({ ...a, location: e.target.value }))} />
              <input className="border p-2 rounded" type="date" placeholder="Acquisition Date" value={newAsset.acquisitionDate?.slice(0,10) || ''} onChange={e => setNewAsset(a => ({ ...a, acquisitionDate: e.target.value }))} />
              <input className="border p-2 rounded" type="number" placeholder="Acquisition Amount Euro" value={newAsset.acquisitionAmountEuro ?? ''} onChange={e => setNewAsset(a => ({ ...a, acquisitionAmountEuro: Number(e.target.value) }))} />
              <input className="border p-2 rounded" type="number" placeholder="Acquisition Amount Local" value={newAsset.acquisitionAmountLocal ?? ''} onChange={e => setNewAsset(a => ({ ...a, acquisitionAmountLocal: Number(e.target.value) }))} />
              <input className="border p-2 rounded" type="number" placeholder="Net Book Value Euro" value={newAsset.netBookValueEuro ?? ''} onChange={e => setNewAsset(a => ({ ...a, netBookValueEuro: Number(e.target.value) }))} />
              <input className="border p-2 rounded" type="number" placeholder="Net Book Value Local" value={newAsset.netBookValueLocal ?? ''} onChange={e => setNewAsset(a => ({ ...a, netBookValueLocal: Number(e.target.value) }))} />
              <input className="border p-2 rounded" placeholder="Asset Owner" value={newAsset.assetOwner} onChange={e => setNewAsset(a => ({ ...a, assetOwner: e.target.value }))} />
              <input className="border p-2 rounded" type="date" placeholder="Data Input Date" value={newAsset.dataInputDate?.slice(0,10) || ''} onChange={e => setNewAsset(a => ({ ...a, dataInputDate: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2">
              <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowAdd(false)}>Annuler</button>
              <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={handleAdd}>Ajouter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetScrubPage; 