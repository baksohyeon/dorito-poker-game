import React from 'react';

export const TestComponent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-poker-green to-gray-900 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">CSS Test</h1>
        <p className="text-gray-600">If you can see this styled content, CSS is working!</p>
        <div className="mt-4 space-y-2">
          <div className="bg-poker-green text-white px-4 py-2 rounded">Poker Green Button</div>
          <div className="bg-red-500 text-white px-4 py-2 rounded">Red Button</div>
          <div className="bg-blue-500 text-white px-4 py-2 rounded">Blue Button</div>
        </div>
      </div>
    </div>
  );
}; 