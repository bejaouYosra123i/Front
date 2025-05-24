import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { requestService } from '../../services/requestService';
import useAuth from '../../hooks/useAuth.hook';
import { FiUser, FiUsers, FiBriefcase, FiMonitor, FiEdit2 } from 'react-icons/fi';

interface AddRequestFormInputs {
  fullName: string;
  department: string;
  function: string;
  pcType: 'PC de bureau' | 'PC Portable' | 'Clavier' | 'Écran' | 'Câble' | 'Modem' | 'Souris';
  reason: string;
}

const pcTypeOptions = [
  { value: 'PC de bureau', label: 'Desktop PC' },
  { value: 'PC Portable', label: 'Laptop' },
  { value: 'Clavier', label: 'Keyboard' },
  { value: 'Écran', label: 'Monitor' },
  { value: 'Câble', label: 'Cable' },
  { value: 'Modem', label: 'Modem' },
  { value: 'Souris', label: 'Mouse' },
];

const AddRequestForm: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddRequestFormInputs>();

  const onSubmit = async (data: AddRequestFormInputs) => {
    setLoading(true);
    setError(null);
    try {
      await requestService.submitRequest({
        ...data,
        requestedBy: user?.userName || 'unknown',
        signatures: {},
        status: 'En attente',
      });
      setSuccess(true);
      reset();
    } catch (e: any) {
      setError(e?.message || 'Submission error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Red banner with centered title and icon */}
      <div className="bg-[#e53935] py-4 mb-10 flex items-center justify-center gap-3 rounded-t-2xl">
        <FiEdit2 className="text-white text-2xl" />
        <h2 className="text-white text-2xl md:text-3xl font-bold text-center">New Equipment Request</h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div>
            <label className="block text-base font-semibold mb-1 text-gray-800">Full Name</label>
            <input {...register('fullName', { required: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e53935] bg-white" placeholder="Enter your full name" />
            {errors.fullName && <span className="text-[#e53935] text-xs">This field is required</span>}
      </div>
      <div>
            <label className="block text-base font-semibold mb-1 text-gray-800">Department</label>
            <input {...register('department', { required: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e53935] bg-white" placeholder="e.g. IT, Finance, HR..." />
            {errors.department && <span className="text-[#e53935] text-xs">This field is required</span>}
      </div>
      <div>
            <label className="block text-base font-semibold mb-1 text-gray-800">Position</label>
            <input {...register('function', { required: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e53935] bg-white" placeholder="Your position in the company" />
            {errors.function && <span className="text-[#e53935] text-xs">This field is required</span>}
      </div>
      <div>
            <label className="block text-base font-semibold mb-1 text-gray-800">Equipment Type</label>
            <div className="grid grid-cols-2 gap-4">
              {pcTypeOptions.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-gray-800">
                  <input type="radio" value={opt.value} {...register('pcType', { required: true })} className="accent-[#e53935]" /> {opt.label}
                </label>
              ))}
      </div>
            {errors.pcType && <span className="text-[#e53935] text-xs">This field is required</span>}
        </div>
        </div>
        <div className="mb-4">
          <label className="block text-base font-semibold mb-1 text-gray-800">Reason</label>
          <textarea {...register('reason', { required: true })} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e53935] bg-white min-h-[80px]" placeholder="Please specify the reason for this request..." />
          <div className="text-xs text-gray-500 mt-1">Please provide a clear and detailed reason for your request. This helps us process it faster.</div>
          {errors.reason && <span className="text-[#e53935] text-xs">This field is required</span>}
        </div>
        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <button type="submit" className="w-full md:w-auto px-8 py-3 rounded-lg bg-[#e53935] text-white font-bold shadow-lg hover:bg-[#b71c1c] transition-all duration-200 text-lg" disabled={loading}>
            {loading ? 'Sending...' : 'Submit'}
        </button>
          <button type="button" className="w-full md:w-auto px-8 py-3 rounded-lg bg-gray-200 text-gray-800 font-bold shadow-lg hover:bg-gray-300 transition-all duration-200 text-lg" onClick={() => reset()} disabled={loading}>
            Cancel
        </button>
      </div>
        {success && <div className="text-green-600 mt-4">Request sent successfully!</div>}
        {error && <div className="text-[#e53935] mt-4">{error}</div>}
    </form>
    </div>
  );
};

export default AddRequestForm; 