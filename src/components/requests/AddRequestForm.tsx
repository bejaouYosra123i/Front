import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { requestService } from '../../services/requestService';
import useAuth from '../../hooks/useAuth.hook';

interface AddRequestFormInputs {
  fullName: string;
  department: string;
  function: string;
  pcType: 'PC de bureau' | 'PC Portable';
  reason: string;
}

const AddRequestForm: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddRequestFormInputs>();

  // Simuler la signature automatique
  const getAutoSignature = (managerRole: string) => {
    return `${managerRole}: ${user?.firstName || ''} ${user?.lastName || ''} (auto) - ${new Date().toLocaleDateString()}`;
  };

  const onSubmit = async (data: AddRequestFormInputs) => {
    setLoading(true);
    setError(null);
    try {
      // Envoyer la demande au backend (adapter selon votre API)
      await requestService.submitRequest({
        ...data,
        requestedBy: user?.userName || 'inconnu',
        signatures: {
          manager: getAutoSignature('Manager'),
          itManager: getAutoSignature('IT Manager'),
          hrManager: getAutoSignature('HR Manager'),
          plantManager: getAutoSignature('Plant Manager'),
        },
        status: 'En attente',
      });
      setSuccess(true);
      reset();
    } catch (e: any) {
      setError(e?.message || 'Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded shadow">
      <div>
        <label className="block font-semibold mb-1">Nom & Prénom:</label>
        <input {...register('fullName', { required: true })} className="input w-full" placeholder="Entrez votre nom complet" />
        {errors.fullName && <span className="text-red-500 text-xs">Ce champ est requis</span>}
      </div>
      <div>
        <label className="block font-semibold mb-1">Département:</label>
        <input {...register('department', { required: true })} className="input w-full" placeholder="Ex: IT, Finance, HR..." />
        {errors.department && <span className="text-red-500 text-xs">Ce champ est requis</span>}
      </div>
      <div>
        <label className="block font-semibold mb-1">Fonction:</label>
        <input {...register('function', { required: true })} className="input w-full" placeholder="Votre poste dans l'entreprise" />
        {errors.function && <span className="text-red-500 text-xs">Ce champ est requis</span>}
      </div>
      <div>
        <label className="block font-semibold mb-1">Type de PC:</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" value="PC de bureau" {...register('pcType', { required: true })} /> PC de bureau
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="PC Portable" {...register('pcType', { required: true })} /> PC Portable
          </label>
        </div>
        {errors.pcType && <span className="text-red-500 text-xs">Ce champ est requis</span>}
      </div>
      <div>
        <label className="block font-semibold mb-1">Motif:</label>
        <textarea {...register('reason', { required: true })} className="input w-full" placeholder="Précisez la raison de cette demande..." />
        {errors.reason && <span className="text-red-500 text-xs">Ce champ est requis</span>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="border rounded p-3">
          <div className="font-semibold">Manager:</div>
          <div className="text-yellow-600">En attente</div>
          <div className="text-xs text-gray-400 mt-2">Signature requise</div>
          <div className="mt-2 text-green-700 text-xs">{getAutoSignature('Manager')}</div>
        </div>
        <div className="border rounded p-3">
          <div className="font-semibold">IT Manager:</div>
          <div className="text-yellow-600">En attente</div>
          <div className="text-xs text-gray-400 mt-2">Signature requise</div>
          <div className="mt-2 text-green-700 text-xs">{getAutoSignature('IT Manager')}</div>
        </div>
        <div className="border rounded p-3">
          <div className="font-semibold">HR Manager:</div>
          <div className="text-yellow-600">En attente</div>
          <div className="text-xs text-gray-400 mt-2">Signature requise</div>
          <div className="mt-2 text-green-700 text-xs">{getAutoSignature('HR Manager')}</div>
        </div>
        <div className="border rounded p-3">
          <div className="font-semibold">Plant Manager:</div>
          <div className="text-yellow-600">En attente</div>
          <div className="text-xs text-gray-400 mt-2">Signature requise</div>
          <div className="mt-2 text-green-700 text-xs">{getAutoSignature('Plant Manager')}</div>
        </div>
      </div>
      <div className="flex gap-4 mt-6">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Envoi...' : 'Soumettre'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => reset()} disabled={loading}>
          Annuler
        </button>
      </div>
      {success && <div className="text-green-600 mt-4">Demande envoyée avec succès !</div>}
      {error && <div className="text-red-600 mt-4">{error}</div>}
    </form>
  );
};

export default AddRequestForm; 