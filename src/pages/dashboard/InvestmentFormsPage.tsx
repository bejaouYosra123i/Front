import React from 'react';
import InvestmentFormCreate from './InvestmentFormCreate';

const InvestmentFormsPage: React.FC = () => {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Créer une nouvelle demande d'investissement</h1>
        <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded transition" onClick={() => window.history.back()}>
          ← Retour
        </button>
      </div>
      <p className="text-gray-600 mb-6">Remplissez le formulaire ci-dessous pour soumettre une nouvelle demande d'investissement. Toutes les informations sont obligatoires pour un traitement rapide.</p>
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded shadow-sm">
        <span className="text-blue-700 font-semibold">Astuce :</span> Veillez à bien vérifier les montants et les justificatifs avant de valider votre demande.
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <InvestmentFormCreate />
      </div>
    </div>
  );
};

export default InvestmentFormsPage; 