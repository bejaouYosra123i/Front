import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth.hook';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface InvestmentItem {
  description: string;
  supplier: string;
  unitCost: number;
  shipping: number;
  subTotal: number;
  quantity: number;
  total: number;
}

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
  items: InvestmentItem[];
  numRitm?: string;
  numCoupa?: string;
  numIyras?: string;
  et?: string;
  ioNumber?: string;
}

const defaultItem: InvestmentItem = {
  description: '',
  supplier: '',
  unitCost: 0,
  shipping: 0,
  subTotal: 0,
  quantity: 1,
  total: 0,
};

interface InvestmentFormCreateProps {
  onSuccess?: () => void;
  editData?: InvestmentFormData | null;
  onCancel?: () => void;
}

const softRed = 'bg-[#e53935]';
const softRedText = 'text-[#e53935]';
const softGray = 'bg-gray-50';
const borderGray = 'border-gray-200';

function getItemDisplayNumber(items: InvestmentItem[], idx: number): string {
  const name = items[idx].description.trim();
  if (!name) return (idx + 1).toString();
  let count = 0;
  let sub = 0;
  for (let i = 0; i <= idx; i++) {
    if (items[i].description.trim() === name) {
      count++;
      if (i === idx) sub = count;
    }
  }
  // Premier du nom : juste le numéro, sinon numéro.sous-numéro
  const firstIdx = items.findIndex((it, i) => i <= idx && it.description.trim() === name);
  const baseNum = firstIdx + 1;
  return sub === 1 ? `${baseNum}` : `${baseNum}.${sub - 1}`;
}

function exportFormToExcel(form: InvestmentFormData) {
  const wsData: any[][] = [];
  // Ligne 1 : Titre fusionné
  wsData.push(['IT Investment Form', '', '', '', '', '', '', '', '', '', '', '']);
  // Ligne 2 : vide
  wsData.push([]);
  // Ligne 3 : Infos générales (Region, Currency, Requested, Approved, Req. Date, Due Date)
  wsData.push([
    'Region', form.region, '', 'Currency', form.currency, '', 'Requested', '', 'Approved', '', 'Req. Date', form.reqDate
  ]);
  // Ligne 4 : Location, Due Date
  wsData.push([
    'Location', form.location, '', '', '', '', '', '', '', 'Due Date', form.dueDate
  ]);
  // Ligne 5 : Type of Investment
  wsData.push(['Type of Investment', form.typeOfInvestment, '', '', '', '', '', '', '', '', '', '']);
  // Ligne 6 : Justification
  wsData.push(['Justification', form.justification, '', '', '', '', '', '', '', '', '', '']);
  // Ligne 7 : vide
  wsData.push([]);
  // Ligne 8 : En-tête du tableau
  wsData.push(['No.', 'Item', 'Description', 'Supplier', 'Unit Cost', 'Shipping', 'SubTotal', 'Quantity', 'Total']);
  // Items
  let itemNum = 1;
  let lastItemName = '';
  let subNum = 1;
  form.items.forEach((item, idx) => {
    const name = item.description.trim();
    if (name !== lastItemName) {
      wsData.push([`${itemNum}`, name, '', '', '', '', '', '', '']);
      lastItemName = name;
      subNum = 1;
      itemNum++;
    }
    wsData.push([
      `${itemNum - 1},${subNum}`,
      '',
      item.description,
      item.supplier,
      item.unitCost,
      item.shipping,
      item.subTotal,
      item.quantity,
      item.total
    ]);
    subNum++;
  });
  // Ligne vide
  wsData.push([]);
  // Observations
  wsData.push(['Observations:', form.observations]);
  // Total
  wsData.push(['', '', '', '', '', '', '', 'Total:', form.total]);

  // Création du workbook et worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  // Fusions
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }, // Titre fusionné sur 12 colonnes
    { s: { r: 2, c: 1 }, e: { r: 2, c: 2 } }, // Region
    { s: { r: 2, c: 4 }, e: { r: 2, c: 5 } }, // Currency
    { s: { r: 2, c: 7 }, e: { r: 2, c: 8 } }, // Approved
    { s: { r: 3, c: 1 }, e: { r: 3, c: 8 } }, // Location
    { s: { r: 5, c: 1 }, e: { r: 5, c: 11 } }, // Justification
    { s: { r: 4, c: 1 }, e: { r: 4, c: 11 } }, // Type of Investment
    { s: { r: wsData.length - 2, c: 1 }, e: { r: wsData.length - 2, c: 11 } }, // Observations
  ];
  // Largeur des colonnes
  ws['!cols'] = [
    { wch: 8 }, // No.
    { wch: 15 }, // Item
    { wch: 40 }, // Description
    { wch: 18 }, // Supplier
    { wch: 12 }, // Unit Cost
    { wch: 12 }, // Shipping
    { wch: 14 }, // SubTotal
    { wch: 10 }, // Quantity
    { wch: 14 }, // Total
    { wch: 12 }, // Pour Req. Date/Due Date
    { wch: 14 },
    { wch: 14 },
  ];
  // Styles (basique)
  ws['A1'].s = { font: { bold: true, sz: 16, color: { rgb: 'FFFFFF' } }, alignment: { horizontal: 'center' }, fill: { fgColor: { rgb: '4472C4' } } };
  // En-tête du tableau
  const headerRow = 7;
  for (let col = 0; col < 9; col++) {
    const cell = ws[XLSX.utils.encode_cell({ r: headerRow, c: col })];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4472C4' } },
        alignment: { horizontal: 'center' },
        border: { top: { style: 'thin', color: { rgb: '000000' } }, bottom: { style: 'thin', color: { rgb: '000000' } }, left: { style: 'thin', color: { rgb: '000000' } }, right: { style: 'thin', color: { rgb: '000000' } } }
      };
    }
  }
  // Total en gras
  const totalCell = ws[XLSX.utils.encode_cell({ r: wsData.length - 1, c: 8 })];
  if (totalCell) {
    totalCell.s = { font: { bold: true, color: { rgb: '4472C4' } } };
  }
  // Création du workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'InvestmentForm');
  XLSX.writeFile(wb, `InvestmentForm_${form.region}_${form.reqDate}.xlsx`);
}

function exportFormToExcelPro(form: InvestmentFormData) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Investment Form');

  // Largeur des colonnes
  sheet.columns = [
    { width: 4 }, // A
    { width: 18 }, // B
    { width: 38 }, // C
    { width: 18 }, // D
    { width: 12 }, // E
    { width: 12 }, // F
    { width: 14 }, // G
    { width: 10 }, // H
    { width: 14 }, // I
    { width: 12 }, // J
    { width: 14 }, // K
    { width: 14 }, // L
  ];

  // Titre fusionné
  sheet.mergeCells('A1:L1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'IT Investment Form';
  titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
  titleCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } };

  // Encadré infos générales
  sheet.mergeCells('A3:B3'); sheet.mergeCells('C3:D3');
  sheet.mergeCells('E3:F3'); sheet.mergeCells('G3:H3');
  sheet.mergeCells('I3:J3'); sheet.mergeCells('K3:L3');
  sheet.mergeCells('A4:D4'); sheet.mergeCells('E4:H4'); sheet.mergeCells('I4:L4');
  sheet.mergeCells('A5:D5'); sheet.mergeCells('E5:H5'); sheet.mergeCells('I5:L5');
  sheet.mergeCells('A6:L6');

  sheet.getCell('A3').value = 'Region';
  sheet.getCell('A3').font = { bold: true };
  sheet.getCell('C3').value = form.region;
  sheet.getCell('E3').value = 'Currency';
  sheet.getCell('E3').font = { bold: true };
  sheet.getCell('G3').value = form.currency;
  sheet.getCell('I3').value = 'Requested';
  sheet.getCell('I3').font = { bold: true };
  sheet.getCell('K3').value = 'Approved';
  sheet.getCell('K3').font = { bold: true };

  sheet.getCell('A4').value = 'Location';
  sheet.getCell('A4').font = { bold: true };
  sheet.getCell('E4').value = '';
  sheet.getCell('I4').value = 'Req. Date:';
  sheet.getCell('I4').font = { bold: true };
  sheet.getCell('J4').value = form.reqDate;
  sheet.getCell('K4').value = 'Due Date:';
  sheet.getCell('K4').font = { bold: true };
  sheet.getCell('L4').value = form.dueDate;

  sheet.getCell('A5').value = 'Type of Investment:';
  sheet.getCell('A5').font = { bold: true };
  sheet.getCell('E5').value = form.typeOfInvestment;
  sheet.getCell('E5').alignment = { horizontal: 'center' };

  sheet.getCell('A6').value = 'Justification:';
  sheet.getCell('A6').font = { bold: true };
  sheet.getCell('B6').value = form.justification;
  sheet.getCell('B6').alignment = { wrapText: true };

  // Encadré autour des infos générales
  for (let row = 3; row <= 6; row++) {
    for (let col = 1; col <= 12; col++) {
      sheet.getCell(row, col).border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
      };
    }
  }

  // Ligne vide
  sheet.addRow([]);

  // En-tête du tableau
  const headerRow = sheet.addRow(['No.', 'Item', 'Description', 'Supplier', 'Unit Cost', 'Shipping', 'SubTotal', 'Quantity', 'Total']);
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' }
    };
  });

  // Items
  let itemNum = 1;
  let lastItemName = '';
  let subNum = 1;
  form.items.forEach((item, idx) => {
    const name = item.description.trim();
    if (name !== lastItemName) {
      const row = sheet.addRow([`${itemNum}`, name, '', '', '', '', '', '', '']);
      row.getCell(1).font = { bold: true };
      row.getCell(2).font = { bold: true };
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' }
        };
      });
      lastItemName = name;
      subNum = 1;
      itemNum++;
    }
    const row = sheet.addRow([
      `${itemNum - 1},${subNum}`,
      '',
      item.description,
      item.supplier,
      item.unitCost,
      item.shipping,
      item.subTotal,
      item.quantity,
      item.total
    ]);
    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });
    subNum++;
  });

  // Ligne grise pour compléter le tableau (optionnel)
  for (let i = 0; i < 5; i++) {
    const row = sheet.addRow(['', '', '', '', '', '', '', '', '']);
    row.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' }
      };
    });
  }

  // Observations
  const obsRow = sheet.addRow(['Observations:', form.observations]);
  obsRow.getCell(1).font = { bold: true };
  obsRow.getCell(2).alignment = { wrapText: true };
  sheet.mergeCells(`B${obsRow.number}:I${obsRow.number}`);
  obsRow.eachCell(cell => {
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' }
    };
  });

  // Total
  const totalRow = sheet.addRow(['', '', '', '', '', '', '', 'Total:', form.total]);
  totalRow.getCell(8).font = { bold: true };
  totalRow.getCell(9).font = { bold: true };
  totalRow.eachCell(cell => {
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' }
    };
  });

  // Générer le fichier
  workbook.xlsx.writeBuffer().then(buffer => {
    saveAs(new Blob([buffer]), `InvestmentForm_${form.region}_${form.reqDate}.xlsx`);
  });
}

const InvestmentFormCreate: React.FC<InvestmentFormCreateProps> = ({ onSuccess, editData, onCancel }) => {
  const { user } = useAuth();
  if (!user?.roles?.includes('ADMIN')) {
    return <div className="text-red-600 font-bold text-center p-8">Accès refusé : réservé aux administrateurs.</div>;
  }
  const isEdit = !!editData;
  const [form, setForm] = useState<InvestmentFormData>(
    editData ? { ...editData } : {
    region: '',
    currency: '',
    location: '',
    typeOfInvestment: '',
    justification: '',
      reqDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    observations: '',
    total: 0,
      status: 'Pending',
      items: [{ ...defaultItem }],
    }
  );
  const [requested, setRequested] = useState(true);
  const [approved, setApproved] = useState(false);
  useEffect(() => {
    if (editData) setForm({ ...editData });
  }, [editData]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'date' ? e.target.value : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const calculateItemTotals = (item: InvestmentItem): InvestmentItem => {
    const subTotal = Number((item.unitCost * item.quantity).toFixed(2));
    const total = Number((subTotal + item.shipping).toFixed(2));
    return { ...item, subTotal, total };
  };

  const handleItemChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const items = [...form.items];
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    items[idx] = calculateItemTotals({ ...items[idx], [e.target.name]: value });
    setForm({ ...form, items });
    // Mettre à jour le total général
    const total = Number(items.reduce((acc, it) => acc + it.total, 0).toFixed(2));
    setForm(f => ({ ...f, total }));
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { ...defaultItem }] });
  };

  const removeItem = (idx: number) => {
    const items = form.items.filter((_, i) => i !== idx);
    setForm({ ...form, items });
    const total = Number(items.reduce((acc, it) => acc + it.total, 0).toFixed(2));
    setForm(f => ({ ...f, total }));
  };

  const validateForm = (): boolean => {
    if (!form.region || !form.currency || !form.location || !form.typeOfInvestment || !form.justification || !form.reqDate) {
      setError('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    if (form.items.some(item => !item.description || !item.supplier || item.quantity <= 0)) {
      setError('Veuillez remplir correctement tous les items');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      let response;
      if (isEdit && editData?.id) {
        response = await axiosInstance.put(`/InvestmentForm/${editData.id}`, form);
      } else {
        response = await axiosInstance.post('/InvestmentForm', form);
      }
      if (response.status === 200 || response.status === 201) {
        toast.success(isEdit ? 'Formulaire modifié avec succès !' : 'Formulaire créé avec succès !');
      setSuccess(true);
      if (onSuccess) onSuccess();
        setForm({
          region: '',
          currency: '',
          location: '',
          typeOfInvestment: '',
          justification: '',
          reqDate: new Date().toISOString().split('T')[0],
          dueDate: '',
          observations: '',
          total: 0,
          status: 'Pending',
          items: [{ ...defaultItem }],
        });
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Vous n\'avez pas les droits nécessaires');
        toast.error('Vous n\'avez pas les droits nécessaires');
      } else if (err.response?.status === 400) {
        const errorMessage = err.response.data?.message || 'Données invalides';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError('Erreur lors de la sauvegarde du formulaire');
        toast.error('Erreur lors de la sauvegarde du formulaire');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-8 rounded-2xl shadow-xl bg-white border border-gray-100">
      <div className={`${softRed} text-white text-2xl font-semibold rounded-t-2xl px-6 py-4 mb-8 flex items-center justify-between shadow-sm`}>
        <span className="tracking-wide">IT Investment Form</span>
        <div className="flex items-center space-x-6">
          <label className="flex items-center space-x-2 text-sm">
            <input type="checkbox" checked={requested} onChange={e => setRequested(e.target.checked)} className="accent-[#e53935] rounded" />
            <span>Requested</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input type="checkbox" checked={approved} onChange={e => setApproved(e.target.checked)} className="accent-[#e53935] rounded" />
            <span>Approved</span>
          </label>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">Region</label>
          <select name="region" value={form.region} onChange={handleChange} className="w-full border ${borderGray} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e53935] bg-white" required>
            <option value="">Sélectionner une région</option>
            <option value="Europe">Europe</option>
            <option value="North America">North America</option>
            <option value="Asia">Asia</option>
            <option value="Africa">Africa</option>
            <option value="South America">South America</option>
            <option value="Middle East">Middle East</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">Currency</label>
          <select name="currency" value={form.currency} onChange={handleChange} className="w-full border ${borderGray} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e53935] bg-white" required>
            <option value="">Sélectionner une devise</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
            <option value="CNY">CNY</option>
            <option value="MAD">MAD</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">Location</label>
          <select name="location" value={form.location} onChange={handleChange} className="w-full border ${borderGray} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e53935] bg-white" required>
            <option value="">Sélectionner un lieu</option>
            <option value="Paris">Paris</option>
            <option value="Lyon">Lyon</option>
            <option value="Berlin">Berlin</option>
            <option value="New York">New York</option>
            <option value="Casablanca">Casablanca</option>
            <option value="Tokyo">Tokyo</option>
            <option value="Shanghai">Shanghai</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">Type of Investment</label>
          <select name="typeOfInvestment" value={form.typeOfInvestment} onChange={handleChange} className="w-full border ${borderGray} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e53935] bg-white" required>
            <option value="">Sélectionner le type</option>
            <option value="New">New</option>
            <option value="Refresh">Refresh</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">Req. Date</label>
          <input name="reqDate" type="date" value={form.reqDate} onChange={handleChange} className="w-full border ${borderGray} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e53935] bg-white" required />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">Due Date</label>
          <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} className="w-full border ${borderGray} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e53935] bg-white" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">Status</label>
          <input name="status" value={form.status} onChange={handleChange} placeholder="Status" className="w-full border ${borderGray} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e53935] bg-white" required />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-600">Total</label>
          <input name="total" value={form.total.toFixed(2)} readOnly className="w-full border ${borderGray} rounded-lg px-3 py-2 bg-gray-100 text-gray-700" placeholder="Total" />
        </div>
        
        
      </div>
      <div className="mb-4">
        <label className="block text-xs font-medium mb-1 text-gray-600">Justification</label>
        <textarea name="justification" value={form.justification} onChange={handleChange} placeholder="Justification" className="w-full border ${borderGray} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e53935] bg-white" required />
      </div>
      <div className="mb-4">
        <label className="block text-xs font-medium mb-1 text-gray-600">Observations</label>
        <textarea name="observations" value={form.observations} onChange={handleChange} placeholder="Observations" className="w-full border ${borderGray} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e53935] bg-white" />
      </div>
      <h2 className="font-bold text-lg mt-8 mb-2 border-b-2 border-[#e53935] pb-1 tracking-wide">Items</h2>
      <table className="min-w-full border mb-4 rounded-xl overflow-hidden shadow-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-700 text-sm">
            <th className="border ${borderGray} px-2 py-1">No.</th>
            <th className="border ${borderGray} px-2 py-1">Description</th>
            <th className="border ${borderGray} px-2 py-1">Supplier</th>
            <th className="border ${borderGray} px-2 py-1">Unit Cost</th>
            <th className="border ${borderGray} px-2 py-1">Shipping</th>
            <th className="border ${borderGray} px-2 py-1">Quantity</th>
            <th className="border ${borderGray} px-2 py-1">SubTotal</th>
            <th className="border ${borderGray} px-2 py-1">Total</th>
            <th className="border ${borderGray} px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {form.items.map((item, idx) => (
            <tr key={idx} className="hover:bg-gray-100">
              <td className="border ${borderGray} px-2 py-1 text-center font-semibold text-gray-700">{getItemDisplayNumber(form.items, idx)}</td>
              <td className="border ${borderGray} px-2 py-1"><input name="description" value={item.description} onChange={e => handleItemChange(idx, e)} placeholder="Description" className="w-full border ${borderGray} rounded-md px-2 py-1 bg-gray-50" required /></td>
              <td className="border ${borderGray} px-2 py-1"><input name="supplier" value={item.supplier} onChange={e => handleItemChange(idx, e)} placeholder="Supplier" className="w-full border ${borderGray} rounded-md px-2 py-1 bg-gray-50" required /></td>
              <td className="border ${borderGray} px-2 py-1"><input name="unitCost" type="number" step="0.01" min="0" value={item.unitCost} onChange={e => handleItemChange(idx, e)} placeholder="Unit Cost" className="w-full border ${borderGray} rounded-md px-2 py-1 bg-gray-50" required /></td>
              <td className="border ${borderGray} px-2 py-1"><input name="shipping" type="number" step="0.01" min="0" value={item.shipping} onChange={e => handleItemChange(idx, e)} placeholder="Shipping" className="w-full border ${borderGray} rounded-md px-2 py-1 bg-gray-50" /></td>
              <td className="border ${borderGray} px-2 py-1"><input name="quantity" type="number" min="1" value={item.quantity} onChange={e => handleItemChange(idx, e)} placeholder="Quantity" className="w-full border ${borderGray} rounded-md px-2 py-1 bg-gray-50" required /></td>
              <td className="border ${borderGray} px-2 py-1"><input name="subTotal" value={item.subTotal.toFixed(2)} readOnly className="w-full border ${borderGray} rounded-md px-2 py-1 bg-gray-200 text-gray-700" placeholder="SubTotal" /></td>
              <td className="border ${borderGray} px-2 py-1"><input name="total" value={item.total.toFixed(2)} readOnly className="w-full border ${borderGray} rounded-md px-2 py-1 bg-gray-200 text-gray-700" placeholder="Total" /></td>
              <td className="border ${borderGray} px-2 py-1 text-center">
                <button type="button" className="text-[#e53935] underline font-medium" onClick={() => removeItem(idx)} disabled={form.items.length === 1}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="bg-[#43a047] text-white px-4 py-2 rounded-lg mb-6 shadow-sm hover:bg-[#388e3c] transition" onClick={addItem}>Ajouter un item</button>
      <div className="flex space-x-2 mt-4">
        <button type="submit" className="bg-[#1e88e5] text-white px-6 py-2 rounded-lg font-semibold shadow-sm hover:bg-[#1565c0] transition" disabled={loading}>
          {loading ? (isEdit ? 'Modification…' : 'Envoi…') : (isEdit ? 'Modifier le formulaire' : 'Créer le formulaire')}
        </button>
        <button
          type="button"
          className="bg-[#00bcd4] text-white px-6 py-2 rounded-lg font-semibold shadow-sm hover:bg-[#008ba3] transition"
          onClick={() => exportFormToExcelPro(form)}
        >
          Download Excel
        </button>
        {onCancel && (
          <button type="button" className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold shadow-sm hover:bg-gray-400 transition" onClick={onCancel} disabled={loading}>
            Annuler
          </button>
        )}
      </div>
      {error && <div className="text-[#e53935] mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">{isEdit ? 'Formulaire modifié avec succès !' : 'Formulaire créé avec succès !'}</div>}
    </form>
  );
};

export default InvestmentFormCreate; 