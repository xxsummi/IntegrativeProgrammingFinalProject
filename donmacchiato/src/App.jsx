import React, { useState, useEffect } from 'react';
import { PiCoffeeFill, PiShoppingCartSimple, PiChartLineUpBold, PiSignOut, PiStorefront } from 'react-icons/pi';
import './App.css'
import Login from './Pages/Login'
import Products from './Pages/Products'
import Sales from './Pages/Sales'
import EmbeddedSales from './Pages/EmbeddedSales'
import apiService from './services/api';

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname;
    if (path.includes('products')) return 'products';
    if (path.includes('embedded-sales')) return 'embedded-sales';
    return 'sales';
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const authenticated = apiService.isAuthenticated();
    setIsLoggedIn(authenticated);
    if (authenticated) {
      setUser(apiService.getCurrentUser());
    }
    
    // Handle browser back/forward buttons
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.includes('products')) setCurrentPage('products');
      else if (path.includes('embedded-sales')) setCurrentPage('embedded-sales');
      else setCurrentPage('sales');
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setUser(apiService.getCurrentUser());
    setCurrentPage('sales');
    window.history.pushState({}, '', '/sales');
  };

  const handleLogout = () => {
    apiService.logout();
    setIsLoggedIn(false);
    setUser(null);
    setCurrentPage('login');
    window.history.pushState({}, '', '/login');
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
    window.history.pushState({}, '', `/${page}`);
  };

  if (!isLoggedIn) {
    return (
      <div className="app login-app">
        <div className="login-container">
          <div className="login-brand">
            <PiCoffeeFill className="brand-icon" />
            <h1>Don Macchiato</h1>
            <p>Coffee Shop Management System</p>
          </div>
          <Login onLoginSuccess={handleLoginSuccess} />
        </div>
      </div>
    );
  }

  return (
    <div className="app dashboard-app">
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <PiCoffeeFill className="brand-icon" />
            {!sidebarCollapsed && <span>Don Macchiato</span>}
          </div>
          <button 
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            ☰
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${currentPage === 'sales' ? 'active' : ''}`}
            onClick={() => handleNavigation('sales')}
          >
            <PiChartLineUpBold className="nav-icon" />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </button>
          <button 
            className={`nav-item ${currentPage === 'products' ? 'active' : ''}`}
            onClick={() => handleNavigation('products')}
          >
            <PiStorefront className="nav-icon" />
            {!sidebarCollapsed && <span>Products</span>}
          </button>
          <button
            className={`nav-item ${currentPage === 'embedded-sales' ? 'active' : ''}`}
            onClick={() => handleNavigation('embedded-sales')}
          >
            <PiShoppingCartSimple className="nav-icon" />
            {!sidebarCollapsed && <span>POS System</span>}
          </button>
        </nav>
        
        <div className="sidebar-footer">
          {!sidebarCollapsed && (
            <div className="user-info">
              <div className="user-avatar">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.name || 'User'}</span>
                <span className="user-role">{user?.role || 'Staff'}</span>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            <PiSignOut className="nav-icon" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
      
      <main className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <header className="page-header">
          <div className="page-title">
            {currentPage === 'sales' && (
              <>
                <PiChartLineUpBold className="page-icon" />
                <h1>Sales Dashboard</h1>
              </>
            )}
            {currentPage === 'products' && (
              <>
                <PiStorefront className="page-icon" />
                <h1>Product Management</h1>
              </>
            )}
            {currentPage === 'embedded-sales' && (
              <>
                <PiShoppingCartSimple className="page-icon" />
                <h1>Point of Sale</h1>
              </>
            )}
          </div>
          <div className="page-actions">
            <div className="user-badge">
              <span>Welcome, {user?.name}</span>
            </div>
          </div>
        </header>
        
        <div className="page-content">
          {currentPage === 'products' && <Products />}
          {currentPage === 'sales' && <Sales />}
          {currentPage === 'embedded-sales' && <EmbeddedSales />}
        </div>
      </main>
    </div>
  );
}

export default App
