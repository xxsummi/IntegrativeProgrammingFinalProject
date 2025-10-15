import React, { useState } from 'react';
import './App.css'
import Login from './Pages/Login'
import Products from './Pages/Products'
import Sales from './Pages/Sales'

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentPage('products');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('login');
  };

  return (
    <div className="app">
      {!isLoggedIn ? (
        <div className="login-page">
          <h1 className="welcome-title">Welcome to Don Macchiato</h1>
          <Login onLoginSuccess={handleLoginSuccess} />
        </div>
      ) : (
        <div className="main-app">
          <nav className="app-nav">
            <h1 className="nav-title">Don Macchiato Admin</h1>
            <div className="nav-buttons">
              <button 
                className={`nav-btn ${currentPage === 'products' ? 'active' : ''}`}
                onClick={() => setCurrentPage('products')}
              >
                Products
              </button>
              <button 
                className={`nav-btn ${currentPage === 'sales' ? 'active' : ''}`}
                onClick={() => setCurrentPage('sales')}
              >
                Sales
              </button>
              <button
                className={`nav-btn ${currentPage === 'embedded-sales' ? 'active' : ''}`}
                onClick={() => setCurrentPage('embedded-sales')}
              >
                Embedded Sales (CRA)
              </button>
              <button 
                className="nav-btn logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </nav>
          
          <main className="app-content">
            {currentPage === 'products' && <Products />}
            {currentPage === 'sales' && <Sales />}
            {currentPage === 'embedded-sales' && (
              <div style={{ width: '100%', height: '100%' }}>
                <iframe
                  title="Embedded CRA Sales"
                  src="/sales-frontend/index.html"
                  style={{ width: '100%', height: '80vh', border: 'none' }}
                />
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  )
}

export default App
