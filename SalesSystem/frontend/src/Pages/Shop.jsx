import React, { useState, useEffect } from 'react';
import { PiShoppingCartSimple } from 'react-icons/pi';
import apiService from '../services/api';
import './Shop.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await apiService.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.sku === product.sku);
    if (existing) {
      setCart(cart.map(item => 
        item.sku === product.sku ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (sku, quantity) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.sku !== sku));
    } else {
      setCart(cart.map(item => item.sku === sku ? { ...item, quantity } : item));
    }
  };

  const handleCheckout = async () => {
    try {
      const items = cart.map(item => ({
        product_sku: item.sku,
        quantity: item.quantity
      }));

      await apiService.createSale({ items });
      alert('Order placed successfully!');
      setCart([]);
      setShowCheckout(false);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to place order');
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price || item.unit_price) * item.quantity, 0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setCart([]);
  };

  if (loading) return <div className="shop-loading">Loading products...</div>;

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="shop-container">
        <div className="login-screen">
          <h1>Don Macchiato Shop</h1>
          <p>Please log in to continue shopping</p>
          <button onClick={() => window.location.href = '/login'} className="login-btn">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-container">
      <div className="shop-header">
        <h1>Don Macchiato Shop</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="cart-btn" onClick={() => setShowCheckout(true)}>
            <PiShoppingCartSimple /> Cart ({cart.length})
          </button>
          {/* <button 
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button> */}
        </div>
      </div>

      <div className="products-grid">
        {products.map(product => (
          <div key={product.sku} className="product-card">
            <h3>{product.name}</h3>
            <p className="product-price">₱{(product.price || product.unit_price).toFixed(2)}</p>
            <p className="product-stock">Stock: {product.stock}</p>
            <button 
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
              className="add-to-cart-btn"
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        ))}
      </div>

      {showCheckout && (
        <div className="checkout-modal">
          <div className="checkout-content">
            <h2>Your Cart</h2>
            {cart.length === 0 ? (
              <p>Your cart is empty</p>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.sku} className="cart-item">
                    <span>{item.name}</span>
                    <div className="cart-item-controls">
                      <button onClick={() => updateQuantity(item.sku, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.sku, item.quantity + 1)}>+</button>
                      <span>₱{((item.price || item.unit_price) * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
                <div className="cart-total">
                  <strong>Total: ₱{total.toFixed(2)}</strong>
                </div>
                <div className="checkout-actions">
                  <button onClick={() => setShowCheckout(false)} className="cancel-btn">Cancel</button>
                  <button onClick={handleCheckout} className="checkout-btn">Place Order</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
