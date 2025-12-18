import React, { useState, useEffect } from 'react';
import './EmbeddedSales.css';

const EmbeddedSales = () => {
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // number of sales per page

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

  const totalSales = Array.isArray(stats)
    ? stats.reduce((sum, item) => sum + Number(item.total_quantity || 0), 0)
    : 0;
  const totalRevenue = sales.reduce(
    (sum, sale) => sum + Number(sale.total || 0),
    0
  );

  // Pagination helpers
  const totalPages = Math.ceil(sales.length / pageSize);
  const paginatedSales = sales.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const goToPage = (page) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

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
      </div>

      <div className="sales-table">
        <h2>Recent Sales</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
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
                {paginatedSales.length > 0 ? (
                  paginatedSales.map((sale) => (
                    <tr key={sale.id}>
                      <td>#{sale.id}</td>
                      <td>{sale.cashier || sale.user_id}</td>
                      <td>₱{Number(sale.total || 0).toFixed(2)}</td>
                      <td>{new Date(sale.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No sales data</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="pagination">
              <button className="pagination-btn"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button className="pagination-btn"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmbeddedSales;
