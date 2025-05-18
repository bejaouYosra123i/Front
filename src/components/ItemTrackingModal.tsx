import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';

interface ItemTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  item: any;
}

const ItemTrackingModal: React.FC<ItemTrackingModalProps> = ({ isOpen, onClose, onSave, item }) => {
  const [formData, setFormData] = useState({
    coupaNumber: item?.coupaNumber || '',
    rytmNumber: item?.rytmNumber || '',
    ioNumber: item?.ioNumber || '',
    iyrasNumber: item?.iyrasNumber || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData);
      toast.success('Suivi mis à jour avec succès');
      onClose();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du suivi');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="text-xl font-bold mb-4">Suivi de l'item #{item?.id}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Numéro COUPA</label>
            <input
              type="text"
              name="coupaNumber"
              value={formData.coupaNumber}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Numéro RYTM</label>
            <input
              type="text"
              name="rytmNumber"
              value={formData.rytmNumber}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Numéro IO</label>
            <input
              type="text"
              name="ioNumber"
              value={formData.ioNumber}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Numéro IYRAS</label>
            <input
              type="text"
              name="iyrasNumber"
              value={formData.iyrasNumber}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 rounded"
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemTrackingModal; 