// src/App.jsx
import React from "react";

function App() {
  // Dummy sales data
  const sales = [
    { id: 1, customer: "Alice", total: 120.5, date: "2025-09-06" },
    { id: 2, customer: "Bob", total: 89.99, date: "2025-09-06" },
    { id: 3, customer: "Charlie", total: 45.0, date: "2025-09-05" },
  ];

  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">💰 Sales Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-600">Total Sales</h2>
          <p className="text-2xl font-bold mt-2">{totalSales}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-600">Total Revenue</h2>
          <p className="text-2xl font-bold mt-2">₱{totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Sales</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">Sale ID</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Total</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{sale.id}</td>
                <td className="p-2">{sale.customer}</td>
                <td className="p-2">₱{sale.total.toFixed(2)}</td>
                <td className="p-2">{sale.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
