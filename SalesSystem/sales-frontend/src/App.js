import React from "react";
import "./App.css";

function App() {
  // dummy sales data (removed the total field)
  const salesData = [
    { id: 1, product: "Donya Berry", quantity: 2, price: 39 },
    { id: 2, product: "Spanish Latte", quantity: 5, price: 39 },
    { id: 3, product: "Matcha Berry", quantity: 3, price: 39 },
  ];

  // dummy - recent sales data
  const recentSales = [
    { id: 1, customerId: "2", product: "Donya Berry", quantity: 1, price: 39, date: "2025-10-09" },
    { id: 2, customerId: "2", product: "Spanish Latte", quantity: 2, price: 39, date: "2025-10-09" },
    { id: 3, customerId: "3", product: "Matcha Berry", quantity: 1, price: 39, date: "2025-10-10" },
  ];

  const totalSales = salesData.length;
  const totalRevenue = salesData.reduce(
    (sum, sale) => sum + sale.price * sale.quantity,
    0
  );

  return (
    <div>
      <header style={styles.header}>
        <h1 style={styles.title}>Sales Dashboard</h1>
      </header>

      <main style={styles.main}>
        <div style={styles.summaryContainer}>
          <div style={styles.box}>
            <h3 style={{ fontSize: "18px", color: "#FAEAB1" }}>Total Sales</h3>
            <p style={{ fontSize: "28px", fontWeight: "bold" }}>{totalSales}</p>
          </div>
          <div style={styles.box}>
            <h3 style={{ fontSize: "18px", color: "#FAEAB1" }}>Total Revenue</h3>
            <p style={{ fontSize: "28px", fontWeight: "bold" }}>₱{totalRevenue}</p>
          </div>
        </div>

        <h2>Sales Records</h2>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Product</th>
              <th style={styles.th}>Quantity</th>
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Total (₱)</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((sale) => (
              <tr key={sale.id}>
                <td style={styles.td}>{sale.id}</td>
                <td style={styles.td}>{sale.product}</td>
                <td style={styles.td}>{sale.quantity}</td>
                <td style={styles.td}>{sale.price}</td>
                <td style={styles.td}>{sale.price * sale.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 style={{ marginTop: "30px" }}>Recent Sales</h2>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>Sale ID</th>
              <th style={styles.th}>Customer ID</th>
              <th style={styles.th}>Product</th>
              <th style={styles.th}>Quantity</th>
              <th style={styles.th}>Total (₱)</th>
              <th style={styles.th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentSales.map((sale) => (
              <tr key={sale.id}>
                <td style={styles.td}>{sale.id}</td>
                <td style={styles.td}>{sale.customerId}</td>
                <td style={styles.td}>{sale.product}</td>
                <td style={styles.td}>{sale.quantity}</td>
                <td style={styles.td}>{sale.price * sale.quantity}</td>
                <td style={styles.td}>{sale.date}</td>
              </tr>
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
    background: "#334443",
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
