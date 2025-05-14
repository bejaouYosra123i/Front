import React, { useState } from 'react';

interface TrackingFields {
  numRitm?: string;
  numCoupa?: string;
  numIyras?: string;
  ioNumber?: string;
}

interface TrackingModalProps {
  trackingData: TrackingFields & { total?: number };
  onClose: () => void;
  onSave: (fields: TrackingFields) => void;
}

const TrackingModal: React.FC<TrackingModalProps> = ({ trackingData, onClose, onSave }) => {
  const [fields, setFields] = useState<TrackingFields>({ ...trackingData });
  const [saving, setSaving] = useState(false);

  const isOpex = (trackingData.total ?? 0) < 1000;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(fields);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="text-xl font-bold mb-4">Informations de suivi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">Numéro RITM (ServiceNow)</label>
            <input name="numRitm" value={fields.numRitm || ''} onChange={handleChange} placeholder="RITM..." className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e53935] bg-white" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">Numéro Coupa (PR)</label>
            <input name="numCoupa" value={fields.numCoupa || ''} onChange={handleChange} placeholder="PR..." className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e53935] bg-white" />
          </div>
          {!isOpex && (
            <>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Numéro YIRAS</label>
                <input name="numIyras" value={fields.numIyras || ''} onChange={handleChange} placeholder="YIRAS..." className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e53935] bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Numéro IO</label>
                <input name="ioNumber" value={fields.ioNumber || ''} onChange={handleChange} placeholder="IO..." className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e53935] bg-white" />
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold shadow-sm hover:bg-gray-400 transition"
            onClick={onClose}
            disabled={saving}
          >
            Annuler
          </button>
          <button
            className="bg-[#e53935] text-white px-6 py-2 rounded-lg font-semibold shadow-sm hover:bg-[#b71c1c] transition"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackingModal; 