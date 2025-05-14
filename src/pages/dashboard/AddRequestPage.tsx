import React from 'react';
import AddRequestForm from '../../components/requests/AddRequestForm';

const AddRequestPage: React.FC = () => (
  <div className="p-8 max-w-3xl mx-auto">
    <h1 className="text-2xl font-bold mb-6">Nouvelle Demande de PC</h1>
    <AddRequestForm />
  </div>
);

export default AddRequestPage; 