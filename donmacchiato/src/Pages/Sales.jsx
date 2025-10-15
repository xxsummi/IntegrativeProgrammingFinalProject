import React, { useEffect, useState } from 'react';
import { PiShoppingCartSimple, PiCoffeeFill, PiChartLineUpBold, PiMoneyBold } from "react-icons/pi";
import apiService from '../services/api';
import './Sales.css';

const Sales = () => {
  const [stats, setStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentSales, setRecentSales] = useState([]);
  const [recentSalesLoading, setRecentSalesLoading] = useState(true);
  const [recentSalesError, setRecentSalesError] = useState('');

  // After fetching both products and stats we'll join them into display list

  useEffect(() => {
    fetchProducts();
    fetchRecentSales();
    // For now use a dummy stats visualization (Caramel Macchiato as top-seller)
    // We'll still attempt to fetch real stats if the endpoint exists, but provide a deterministic fallback.
    const dummy = [
      { product_sku: 'CARAMEL001', product_name: 'Caramel Macchiato', total_quantity: 2500 },
      { product_sku: 'DONYA001', product_name: 'Donya Berry', total_quantity: 1200 },
      { product_sku: 'OREO001', product_name: 'Oreo Macchiato', total_quantity: 950 },
      { product_sku: 'SPANISH001', product_name: 'Spanish Latte', total_quantity: 600 }
    ];
    setStats(dummy);
    setStatsLoading(false);
    // still try to fetch real stats in background
    fetchStats();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProducts();
      setProducts(data);
      setError('');
    } catch (err) {
      console.error('Error fetching products for sales:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await apiService.getSalesStats();
      setStats(data);
      setStatsError('');
    } catch (err) {
      console.error('Error fetching sales stats:', err);
      // As a fallback, compute dummy stats from products (zero values) so chart still shows
      const fallback = products.map(p => ({ product_sku: p.sku, product_name: p.name, total_quantity: 0 }));
      setStats(fallback);
      setStatsError('Failed to load stats (showing placeholder)');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchRecentSales = async () => {
    try {
      setRecentSalesLoading(true);
      const data = await apiService.getRecentSales();
      setRecentSales(data);
      setRecentSalesError('');
    } catch (err) {
      console.error('Error fetching recent sales:', err);
      setRecentSalesError('Failed to load recent sales');
    } finally {
      setRecentSalesLoading(false);
    }
  };

  // Combine products with sales stats to compute total_sold (default 0)
  const mergedProducts = products.map(p => {
    const stat = stats.find(s => s.product_sku === p.sku);
    return {
      ...p,
      total_sold: stat ? stat.total_quantity : 0
    };
  });

  if (loading) return <div className="sales-container"><div className="loading">Loading products...</div></div>;

  return (
    <div className="sales-container">
      <div className="summary-boxes">
        <div className="summary-box">
          <PiChartLineUpBold className="summary-icon" />
          <div className="summary-content">
            <h3>Total Sales</h3>
            <p>{stats.reduce((sum, s) => sum + s.total_quantity, 0)}</p>
          </div>
        </div>
        <div className="summary-box">
          <PiMoneyBold className="summary-icon" />
          <div className="summary-content">
            <h3>Total Revenue</h3>
            <p>₱{mergedProducts.reduce((sum, p) => sum + (p.total_sold * p.unit_price), 0).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="stats-panel">
        <h2>Most Sold Coffees</h2>
        {statsLoading ? (
          <div className="loading">Loading stats...</div>
        ) : (
          <div className="chart-wrapper">
            {stats.length === 0 ? (
              <div className="no-stats">No sales yet</div>
            ) : (
              <svg className="bar-chart" viewBox={`0 0 100 ${Math.max(40, stats.length * 12)}`} preserveAspectRatio="none">
                {(() => {
                  const max = Math.max(...stats.map(s => s.total_quantity), 1);
                  return stats.map((s, i) => {
                    const y = 4 + i * 12;
                    const width = (s.total_quantity / max) * 80; // percent of 80 units
                    return (
                      <g key={s.product_sku}>
                        <rect x={18} y={y} width={width} height={8} fill="#6b4f4f" />
                        <text x={0} y={y + 6} fontSize={3.5} fill="#222">{s.product_name}</text>
                        <text x={19 + width} y={y + 6} fontSize={3.5} fill="#fff">{s.total_quantity}</text>
                      </g>
                    );
                  });
                })()}
              </svg>
            )}
            {statsError && <div className="error-message">{statsError}</div>}
          </div>
        )}
      </div>
      <div className="sales-header">
        <h1><PiCoffeeFill className="header-icon" /> Point of Sale</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="sales-body">
        <div className="products-list">
          {mergedProducts.length === 0 ? (
            <div className="no-products">No products available</div>
          ) : (
            mergedProducts.map(product => (
              <div key={product.sku} className="product-item">
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                  <div className="product-sku">SKU: {product.sku}</div>
                  <div className="product-price">₱{Number(product.unit_price).toFixed(2)}</div>
                  <div className={`product-stock ${product.stock < 5 ? 'low' : ''}`}>Stock: {product.stock}</div>
                  <div className="product-sold">Times bought: {product.total_sold}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="recent-sales-panel">
        <h2>Recent Sales</h2>
        {recentSalesLoading ? (
          <div className="loading">Loading recent sales...</div>
        ) : (
          <>
            {recentSalesError && <div className="error-message">{recentSalesError}</div>}
            {recentSales.length === 0 ? (
              <div className="no-sales">No recent sales</div>
            ) : (
              <table className="recent-sales-table">
                <thead>
                  <tr>
                    <th>Sale ID</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Total (₱)</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.id}</td>
                      <td>{sale.product_name}</td>
                      <td>{sale.quantity}</td>
                      <td>₱{(sale.unit_price * sale.quantity).toFixed(2)}</td>
                      <td>{new Date(sale.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Sales;
