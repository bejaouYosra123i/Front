import React from 'react';
import InvestmentFormCreate from './InvestmentFormCreate';

const InvestmentFormsPage: React.FC = () => {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create a New Investment Form</h1>
      <div className="bg-white p-4 rounded shadow">
        <InvestmentFormCreate />
      </div>
    </div>
  );
};

export default InvestmentFormsPage; 