import React from 'react';
import { useParams } from 'react-router-dom';

const TablePage: React.FC = () => {
  const { tableId } = useParams();

  return (
    <div className="min-h-screen bg-poker-dark-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Poker Table {tableId}</h1>
        <p className="text-gray-300">Poker table interface coming soon...</p>
      </div>
    </div>
  );
};

export default TablePage; 