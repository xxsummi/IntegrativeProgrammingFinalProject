import React, { useState, useEffect } from 'react';
import './EmbeddedSales.css';

const EmbeddedSales = () => {
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, salesRes] = await Promise.all([
        fetch('http://localhost:3000/api/sales/embedded/stats'),
        fetch('http://localhost:3000/api/sales/embedded')
      ]);
      
      if (statsRes.ok && salesRes.ok) {
        const statsData = await statsRes.json();
        const salesData = await salesRes.json();
        
        setStats(Array.isArray(statsData) ? statsData : []);
        setSales(Array.isArray(salesData) ? salesData : []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setStats([]);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalSales = Array.isArray(stats) ? stats.reduce((sum, item) => sum + (item.total_quantity || 0), 0) : 0;
  const totalRevenue = Array.isArray(sales) ? sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0) : 0;

  return (
    <div className="embedded-sales">
      <div className="stats-cards">
        <div className="stat-card">
          <h3>Total Sales</h3>
          <p>{totalSales}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>₱{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Orders</h3>
          <p>{sales.length}</p>
        </div>
      </div>s

      <div className="sales-table">
        <h2>Recent Sales</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cashier</th>
              <th>Total</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(sales) && sales.length > 0 ? sales.map(sale => (
              <tr key={sale.id}>
                <td>#{sale.id}</td>
                <td>{sale.cashier || sale.user_id}</td>
                <td>₱{Number(sale.total || 0).toFixed(2)}</td>
                <td>{new Date(sale.created_at).toLocaleString()}</td>
              </tr>
            )) : (
              <tr><td colSpan="4">No sales data</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmbeddedSales;