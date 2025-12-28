import React, { useEffect, useState } from 'react';
import { PiShoppingCartSimple, PiCoffeeFill, PiChartLineUpBold, PiMoneyBold, PiStorefront } from "react-icons/pi";
import apiService from '../services/api';
import websocketService from '../services/websocket';
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
  const [embeddedSalesData, setEmbeddedSalesData] = useState([]);
  const [embeddedStatsData, setEmbeddedStatsData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      await fetchProducts();
      await fetchRecentSales();
      await fetchEmbeddedSalesForRevenue();
      setStatsLoading(false);
      fetchStats();
    };
    loadData();

    // Connect to WebSocket for real-time updates
    websocketService.connect();

    const handleMessage = (data) => {
      console.log('Received real-time update:', data);
      if (data.type === 'stockUpdated') {
        setProducts(prevProducts =>
          prevProducts.map(p =>
            p.sku === data.sku ? { ...p, stock: data.stock } : p
          )
        );
        fetchStats();
        fetchRecentSales();
      } else if (data.status === 'success') {
        fetchProducts();
        fetchStats();
        fetchRecentSales();
        fetchEmbeddedSalesForRevenue();
      }
    };
    
    // Handle inventory updates from WebSocket
    const handleProductUpdated = (data) => {
      console.log('Product updated from inventory:', data);
      const product = {
        id: data.product.Id || data.product.id,
        sku: data.product.Sku || data.product.sku,
        name: data.product.Name || data.product.name,
        description: data.product.Description || data.product.description,
        price: data.product.Price || data.product.price || data.product.unit_price,
        stock: data.product.Stock || data.product.stock
      };
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.sku === product.sku ? { ...p, ...product } : p
        )
      );
      fetchStats();
    };
    
    const handleProductAdded = (data) => {
      console.log('Product added from inventory:', data);
      fetchProducts();
      fetchStats();
    };
    
    const handleProductDeleted = (data) => {
      console.log('Product deleted from inventory:', data);
      const productId = data.productId || data.ProductId;
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      fetchStats();
    };

    const handleConnected = () => {
      console.log('WebSocket connected - real-time updates enabled');
    };

    const handleDisconnected = () => {
      console.log('WebSocket disconnected - real-time updates disabled');
    };

    websocketService.on('message', handleMessage);
    websocketService.on('productUpdated', handleProductUpdated);
    websocketService.on('productAdded', handleProductAdded);
    websocketService.on('productDeleted', handleProductDeleted);
    websocketService.on('stockUpdated', handleMessage); // Reuse existing handler
    websocketService.on('connected', handleConnected);
    websocketService.on('disconnected', handleDisconnected);

    return () => {
      websocketService.off('message', handleMessage);
      websocketService.off('productUpdated', handleProductUpdated);
      websocketService.off('productAdded', handleProductAdded);
      websocketService.off('productDeleted', handleProductDeleted);
      websocketService.off('stockUpdated', handleMessage);
      websocketService.off('connected', handleConnected);
      websocketService.off('disconnected', handleDisconnected);
      websocketService.disconnect();
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProducts();
      const productsArray = Array.isArray(data) ? data : (data?.products || []);
      setProducts(productsArray);
      setError('');
    } catch (err) {
      console.error('Error fetching products for sales:', err);
      setProducts([]);
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
      const fallback = (Array.isArray(products) ? products : []).map(p => ({ product_sku: p.sku, product_name: p.name, total_quantity: 0 }));
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
      setRecentSales(data || []);
      setRecentSalesError('');
    } catch (err) {
      console.error('Error fetching recent sales:', err);
      setRecentSalesError('Failed to load recent sales');
    } finally {
      setRecentSalesLoading(false);
    }
  };

  const fetchEmbeddedSalesForRevenue = async () => {
    try {
      const [salesRes, statsRes] = await Promise.all([
        fetch('http://localhost:3000/api/sales/embedded'),
        fetch('http://localhost:3000/api/sales/embedded/stats')
      ]);
      
      if (salesRes.ok) {
        const salesData = await salesRes.json();
        setEmbeddedSalesData(salesData || []);
      }
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setEmbeddedStatsData(statsData || []);
      }
    } catch (err) {
      console.error('Error fetching embedded sales for revenue:', err);
    }
  };

  // Merge products with total sold from recentSales dynamically
  const mergedProducts = (Array.isArray(products) ? products : []).map(p => {
    const totalSold = recentSales
      .filter(sale => sale.product_name === p.name)
      .reduce((sum, sale) => sum + Number(sale.quantity), 0);

    return {
      ...p,
      total_sold: totalSold
    };
  });

  // Get top 5 selling products dynamically
  const topProducts = mergedProducts
    .sort((a, b) => b.total_sold - a.total_sold)
    .slice(0, 5);

  const handleNavigation = (page) => {
    window.history.pushState({}, '', `/${page}`);
    window.location.reload();
  };

  if (loading) return <div className="dashboard-container"><div className="loading">Loading dashboard...</div></div>;

  return (
    <div className="dashboard-container">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card revenue">
          <div className="kpi-icon"><PiMoneyBold /></div>
          <div className="kpi-content">
            <div className="kpi-value">₱{embeddedSalesData.reduce((sum, sale) => sum + Number(sale.total || 0), 0)}</div>
            <div className="kpi-label">Total Revenue</div>
          </div>
        </div>

        <div className="kpi-card sales">
          <div className="kpi-icon"><PiChartLineUpBold /></div>
          <div className="kpi-content">
            <div className="kpi-value">{Array.isArray(embeddedStatsData) ? embeddedStatsData.reduce((sum, item) => sum + Number(item.total_quantity || 0), 0) : 0}</div>
            <div className="kpi-label">Total Sales</div>
          </div>
        </div>

        <div className="kpi-card products">
          <div className="kpi-icon"><PiCoffeeFill /></div>
          <div className="kpi-content">
            <div className="kpi-value">{mergedProducts.length}</div>
            <div className="kpi-label">Products</div>
          </div>
        </div>

        <div className="kpi-card inventory">
          <div className="kpi-icon"><PiShoppingCartSimple /></div>
          <div className="kpi-content">
            <div className="kpi-value">{mergedProducts.reduce((sum, p) => sum + (p.stock || 0), 0)}</div>
            <div className="kpi-label">Total Stock</div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Sales Chart */}
        <div className="dashboard-card chart-card">
          <div className="card-header"><h3>Top Selling Products</h3></div>
          <div className="card-content">
            {statsLoading ? (
              <div className="loading">Loading stats...</div>
            ) : topProducts.length === 0 ? (
              <div className="no-data">
                <PiChartLineUpBold className="no-data-icon" />
                <p>No sales data available</p>
              </div>
            ) : (
              <div className="chart-container">
                {topProducts.map(item => {
                  const maxValue = Math.max(...topProducts.map(p => p.total_sold), 1);
                  const percentage = (item.total_sold / maxValue) * 100;
                  return (
                    <div key={item.sku} className="chart-bar">
                      <div className="bar-info">
                        <span className="bar-label">{item.name}</span>
                        <span className="bar-value">{item.total_sold}</span>
                      </div>
                      <div className="bar-container">
                        <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Product Inventory */}
        <div className="dashboard-card inventory-card">
          <div className="card-header"><h3>Product Inventory</h3></div>
          <div className="card-content">
            {loading ? (
              <div className="loading">Loading products...</div>
            ) : mergedProducts.length === 0 ? (
              <div className="no-data">
                <PiCoffeeFill className="no-data-icon" />
                <p>No products available</p>
              </div>
            ) : (
              <div className="inventory-list">
                {mergedProducts.slice(0, 6).map(product => (
                  <div key={product.sku} className="inventory-item">
                    <div className="item-info">
                      <div className="item-name">{product.name}</div>
                      <div className="item-sku">{product.sku}</div>
                    </div>
                    <div className="item-stats">
                      <div className="item-price">₱{Number(product.price || product.unit_price || 0).toFixed(2)}</div>
                      <div className={`item-stock ${product.stock < 10 ? 'low' : ''}`}>
                        Stock: {product.stock}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="dashboard-card sales-card">
          <div className="card-header"><h3>Recent Transactions</h3></div>
          <div className="card-content">
            {recentSalesLoading ? (
              <div className="loading">Loading sales...</div>
            ) : recentSales.length === 0 ? (
              <div className="no-data">
                <PiShoppingCartSimple className="no-data-icon" />
                <p>No recent sales</p>
              </div>
            ) : (
              <div className="sales-list">
                {recentSales.slice(0, 5).map(sale => (
                  <div key={sale.id} className="sale-item">
                    <div className="sale-info">
                      <div className="sale-product">{sale.product_name}</div>
                      <div className="sale-details">
                        Qty: {sale.quantity} • {new Date(sale.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="sale-amount">
                      ₱{(sale.unit_price * sale.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card actions-card">
          <div className="card-header"><h3>Quick Actions</h3></div>
          <div className="card-content">
            <div className="action-buttons">
              <button className="action-btn primary" onClick={() => handleNavigation('products')}>
                <PiStorefront className="action-icon" />
                <span>Manage Products</span>
              </button>
              <button className="action-btn secondary" onClick={() => handleNavigation('embedded-sales')}>
                <PiShoppingCartSimple className="action-icon" />
                <span>Open POS</span>
              </button>
            </div>

            <div className="quick-stats">
              <div className="quick-stat">
                <span className="stat-label">Low Stock Items</span>
                <span className="stat-value warning">{mergedProducts.filter(p => p.stock < 10).length}</span>
              </div>
              <div className="quick-stat">
                <span className="stat-label">Out of Stock</span>
                <span className="stat-value danger">{mergedProducts.filter(p => p.stock === 0).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Sales;
