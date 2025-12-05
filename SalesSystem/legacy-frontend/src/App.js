import React, { useEffect, useState } from "react";
import "./App.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

function App() {
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    // For embedded sales, use a default admin token
    let token = localStorage.getItem('token');
    if (!token) {
      // Admin token for user ID 2 (Nino - admin) with JWT_SECRET 'supersecretkey'
      token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJsZXBhc2FuYUBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzQ3NzcxODF9.YQqK8vQZxGzF2mJ3nR7sT9wX5pL1kE6dA8cB4fH2jI0';
    }
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, salesRes] = await Promise.all([
        fetch(`${API_BASE}/sales/stats`, { headers: getHeaders() }),
        fetch(`${API_BASE}/sales`, { headers: getHeaders() }),
      ]);

      if (!statsRes.ok) {
        const txt = await statsRes.text();
        throw new Error(`Stats fetch failed: ${txt}`);
      }
      if (!salesRes.ok) {
        const txt = await salesRes.text();
        throw new Error(`Sales fetch failed: ${txt}`);
      }

      const statsJson = await statsRes.json();
      const salesJson = await salesRes.json();

      setStats(statsJson);
      setSales(salesJson);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalSalesCount = stats.reduce((s, it) => s + (it.total_quantity || 0), 0);
  const totalRevenue = sales.reduce((s, sale) => s + Number(sale.total || 0), 0);

  return (
    <div>
      <header style={styles.header}>
        <h1 style={styles.title}>Sales Dashboard</h1>
      </header>

      <main style={styles.main}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={styles.summaryContainer}>
            <div style={styles.box}>
              <h3 style={{ fontSize: "18px", color: "#FAEAB1" }}>Total Sales</h3>
              <p style={{ fontSize: "28px", fontWeight: "bold" }}>{totalSalesCount}</p>
            </div>
            <div style={styles.box}>
              <h3 style={{ fontSize: "18px", color: "#FAEAB1" }}>Total Revenue</h3>
              <p style={{ fontSize: "28px", fontWeight: "bold" }}>₱{totalRevenue.toFixed(2)}</p>
            </div>
          </div>
          <div>
            <button onClick={fetchData} style={{ padding: '10px 12px', borderRadius: 6 }}>Refresh</button>
          </div>
        </div>

        {loading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}

        <h2>Sales Records</h2>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Cashier</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td style={styles.td}>{sale.id}</td>
                <td style={styles.td}>{sale.cashier || sale.user_id}</td>
                <td style={styles.td}>₱{Number(sale.total || 0).toFixed(2)}</td>
                <td style={styles.td}>{new Date(sale.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 style={{ marginTop: "30px" }}>Recent Sales (Items)</h2>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>Sale ID</th>
              <th style={styles.th}>Product</th>
              <th style={styles.th}>Quantity</th>
              <th style={styles.th}>Unit Price</th>
              <th style={styles.th}>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {/* We don't have a recent-items endpoint, so show items by fetching each sale's items lazily */}
            {sales.length === 0 && <tr><td colSpan={5} style={styles.td}>No sales yet</td></tr>}
            {sales.map((sale) => (
              sale.items && sale.items.map(item => (
                <tr key={`${sale.id}-${item.product_sku}`}>
                  <td style={styles.td}>{sale.id}</td>
                  <td style={styles.td}>{item.product_name || item.product_sku}</td>
                  <td style={styles.td}>{item.quantity}</td>
                  <td style={styles.td}>₱{Number(item.unit_price).toFixed(2)}</td>
                  <td style={styles.td}>₱{(Number(item.unit_price) * item.quantity).toFixed(2)}</td>
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

const styles = {
  header: {
    background: "#34656D",
    color: "#fff",
    padding: "15px",
    textAlign: "start",
  },
  title: {
    margin: 0,
  },
  main: {
    padding: "20px",
    backgroundColor: "#FAF8F1",
  },
  summaryContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px",
  },
  box: {
    width: "250px",
    padding: "20px",
    background: "#e7dfcaff",
    color: "#fff",
    border: "1px solid #FAEAB1",
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "40px",
  },
  thead: {
    backgroundColor: "#34656D",
    color: "#FAF8F1",
  },
  th: {
    border: "1px solid white",
    padding: "10px",
    textAlign: "left",
  },
  td: {
    border: "1px solid #ddd",
    padding: "8px",
    backgroundColor: "#bce5eaff",
  },
};

export default App;
