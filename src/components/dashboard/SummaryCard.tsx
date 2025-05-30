import React from 'react';

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, label, value, color }) => (
  <div className={`rounded-xl shadow p-6 text-center flex flex-col items-center ${color} transition-transform hover:scale-105`}>
    <div className="text-3xl mb-2">{icon}</div>
    <div className="text-lg font-semibold mb-1">{label}</div>
    <div className="text-3xl font-bold">{value}</div>
  </div>
);

export default SummaryCard; 