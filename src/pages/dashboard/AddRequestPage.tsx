import React from 'react';
import AddRequestForm from '../../components/requests/AddRequestForm';
import { FiFilePlus } from 'react-icons/fi';

const AddRequestPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 py-10">
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#e60012] text-white rounded-full p-3 shadow">
          <FiFilePlus size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Request</h1>
          <p className="text-gray-500 text-sm">Fill in the form below to submit a new request.</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <AddRequestForm />
      </div>
    </div>
  </div>
);

export default AddRequestPage; 