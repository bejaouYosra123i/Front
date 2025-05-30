import React from 'react';
import InvestmentFormCreate from './InvestmentFormCreate';

const InvestmentFormsPage: React.FC = () => {
  return (
    <div>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <InvestmentFormCreate />
      </div>
    </div>
  );
};

export default InvestmentFormsPage; 