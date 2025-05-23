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
    <div className="max-w-lg mx-auto">
      <div className="rounded-t-2xl p-8 bg-gradient-to-r from-yazaki-red to-yazaki-black flex items-center gap-3 shadow-lg">
        <FiEdit2 className="text-white text-2xl" />
        <h2 className="text-white text-2xl font-bold tracking-tight">New Equipment Request</h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white p-8 rounded-b-2xl shadow-xl border border-yazaki-gray">
        <div>
          <label className="block text-sm font-semibold mb-1 text-yazaki-black flex items-center gap-2">
            <FiUser className="text-yazaki-red" /> Full Name
          </label>
          <input {...register('fullName', { required: true })} className="input w-full rounded-lg border border-yazaki-gray focus:border-yazaki-red focus:ring-yazaki-red/50 transition-all" placeholder="Enter your full name" />
          {errors.fullName && <span className="text-yazaki-red text-xs">This field is required</span>}
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-yazaki-black flex items-center gap-2">
            <FiUsers className="text-yazaki-red" /> Department
          </label>
          <input {...register('department', { required: true })} className="input w-full rounded-lg border border-yazaki-gray focus:border-yazaki-red focus:ring-yazaki-red/50 transition-all" placeholder="e.g. IT, Finance, HR..." />
          {errors.department && <span className="text-yazaki-red text-xs">This field is required</span>}
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-yazaki-black flex items-center gap-2">
            <FiBriefcase className="text-yazaki-red" /> Position
          </label>
          <input {...register('function', { required: true })} className="input w-full rounded-lg border border-yazaki-gray focus:border-yazaki-red focus:ring-yazaki-red/50 transition-all" placeholder="Your position in the company" />
          {errors.function && <span className="text-yazaki-red text-xs">This field is required</span>}
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-yazaki-black flex items-center gap-2">
            <FiMonitor className="text-yazaki-red" /> Equipment Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            {pcTypeOptions.map(opt => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-yazaki-black">
                <input type="radio" value={opt.value} {...register('pcType', { required: true })} className="accent-yazaki-red" /> {opt.label}
              </label>
            ))}
          </div>
          {errors.pcType && <span className="text-yazaki-red text-xs">This field is required</span>}
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-yazaki-black flex items-center gap-2">
            <FiEdit2 className="text-yazaki-red" /> Reason
          </label>
          <textarea {...register('reason', { required: true })} className="input w-full rounded-lg border-2 border-yazaki-gray focus:border-yazaki-red focus:ring-yazaki-red/50 transition-all min-h-[80px]" placeholder="Please specify the reason for this request..." />
          <div className="text-xs text-yazaki-darkGray mt-1">Please provide a clear and detailed reason for your request. This helps us process it faster.</div>
          {errors.reason && <span className="text-yazaki-red text-xs">This field is required</span>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="border rounded-lg p-3 bg-yazaki-lightGray">
            <div className="font-semibold text-yazaki-black">Manager:</div>
            <div className="text-yellow-600">Pending</div>
            <div className="text-xs text-yazaki-darkGray mt-2">Signature required</div>
          </div>
          <div className="border rounded-lg p-3 bg-yazaki-lightGray">
            <div className="font-semibold text-yazaki-black">IT Manager:</div>
            <div className="text-yellow-600">Pending</div>
            <div className="text-xs text-yazaki-darkGray mt-2">Signature required</div>
          </div>
          <div className="border rounded-lg p-3 bg-yazaki-lightGray">
            <div className="font-semibold text-yazaki-black">HR Manager:</div>
            <div className="text-yellow-600">Pending</div>
            <div className="text-xs text-yazaki-darkGray mt-2">Signature required</div>
          </div>
          <div className="border rounded-lg p-3 bg-yazaki-lightGray">
            <div className="font-semibold text-yazaki-black">Plant Manager:</div>
            <div className="text-yellow-600">Pending</div>
            <div className="text-xs text-yazaki-darkGray mt-2">Signature required</div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <button type="submit" className="w-full md:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-yazaki-red to-yazaki-black text-white font-bold shadow-lg hover:from-yazaki-black hover:to-yazaki-red transition-all duration-200 text-lg" disabled={loading}>
            {loading ? 'Sending...' : 'Submit'}
          </button>
          <button type="button" className="w-full md:w-auto px-8 py-3 rounded-lg bg-yazaki-gray text-yazaki-black font-bold shadow-lg hover:bg-yazaki-darkGray hover:text-white transition-all duration-200 text-lg" onClick={() => reset()} disabled={loading}>
            Cancel
          </button>
        </div>
        {success && <div className="text-green-600 mt-4">Request sent successfully!</div>}
        {error && <div className="text-yazaki-red mt-4">{error}</div>}
      </form>
    </div>
  );
};

export default AddRequestForm; 