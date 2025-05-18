import React, { useState } from 'react';

const TrackingModal = ({ item, onClose, onStatusUpdate }) => {
  const [fields, setFields] = useState({
    coupaNumber: item.coupaNumber || '',
    rytmNumber: item.rytmNumber || '',
    ioNumber: item.ioNumber || '',
    iyrasNumber: item.iyrasNumber || '',
    status: item.status || 'Pending'
  });
  const [error, setError] = useState('');

  const unitCost = item.unitCost;
  const showIyras = unitCost > 1000;
  const showIo = unitCost > 150;
  const showCoupa = true;
  const showRytm = true;

  // Champs requis selon le montant
  const requiredFields = [];
  if (showIyras) requiredFields.push('iyrasNumber');
  if (showIo) requiredFields.push('ioNumber');
  if (showCoupa) requiredFields.push('coupaNumber');
  if (showRytm) requiredFields.push('rytmNumber');

  // Couleurs selon statut/champ rempli
  const getInputClass = (val) => {
    if (fields.status === 'Rejected') return 'border-red-500 bg-red-100';
    if (val) return 'border-green-500 bg-green-100';
    return 'border-gray-300';
  };

  // Gestion des boutons
  const handleStatus = (status) => {
    if (status === 'Approved') {
      // Validation : tous les champs requis doivent être remplis
      for (const key of requiredFields) {
        if (!fields[key]) {
          setError('Veuillez remplir tous les champs requis avant d\'approuver.');
          return;
        }
      }
    }
    setError('');
    setFields(f => ({
      ...f,
      status,
      ...(status === 'Rejected'
        ? { coupaNumber: '', rytmNumber: '', ioNumber: '', iyrasNumber: '' }
        : {})
    }));
  };

  const handleChange = (e) => {
    setFields(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    if (fields.status === 'Approved') {
      for (const key of requiredFields) {
        if (!fields[key]) {
          setError('Veuillez remplir tous les champs requis avant d\'approuver.');
          return;
        }
      }
    }
    setError('');
    onStatusUpdate({ ...item, ...fields });
  };

  // Désactivation IO/COUPA/RYTM si YIRAS non rempli (>1000€)
  const disableOtherFields = showIyras && !fields.iyrasNumber;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl" onClick={onClose}>×</button>
        <h3 className="text-xl font-bold mb-4">Suivi de l'item #{item.id}</h3>
        {showIyras && (
          <div>
            <label>YIRAS number</label>
            <input
              name="iyrasNumber"
              value={fields.iyrasNumber}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 mb-2 ${getInputClass(fields.iyrasNumber)}`}
              disabled={fields.status !== 'Under-approval' && fields.status !== 'Pending'}
            />
          </div>
        )}
        {showIo && (
          <div>
            <label>IO number</label>
            <input
              name="ioNumber"
              value={fields.ioNumber}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 mb-2 ${getInputClass(fields.ioNumber)}`}
              disabled={disableOtherFields}
            />
          </div>
        )}
        {showCoupa && (
          <div>
            <label>COUPA number</label>
            <input
              name="coupaNumber"
              value={fields.coupaNumber}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 mb-2 ${getInputClass(fields.coupaNumber)}`}
              disabled={disableOtherFields}
            />
          </div>
        )}
        {showRytm && (
          <div>
            <label>RYTM number</label>
            <input
              name="rytmNumber"
              value={fields.rytmNumber}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 mb-2 ${getInputClass(fields.rytmNumber)}`}
              disabled={disableOtherFields}
            />
          </div>
        )}
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex space-x-2 mt-4">
          {showIyras && (
            <button className="px-4 py-2 bg-yellow-500 text-white rounded" onClick={() => handleStatus('Under-approval')}>Under-approval</button>
          )}
          <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => handleStatus('Approved')}>Approved</button>
          <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={() => handleStatus('Rejected')}>Rejected</button>
        </div>
        <div className="flex justify-end mt-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSave}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
};

export default TrackingModal; 