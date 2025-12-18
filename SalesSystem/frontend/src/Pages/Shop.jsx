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
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
      if (existing.quantity >= product.stock) {
        alert(`Only ${product.stock} stocks available`);
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
      alert(`${product.name} quantity increased in cart`);
    } else {
      if (product.stock === 0) {
        alert('Product out of stock');
        return;
      }
      setCart([...cart, { ...product, quantity: 1 }]);
      alert(`${product.name} added to cart`);
    }
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item => item.id === id ? { ...item, quantity } : item));
    }
  };

  const handleCheckout = async () => {
    try {
      if (!cart.length) return alert("Cart is empty!");

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user?.id) return alert("User not found. Please login again.");

      const items = cart.map(item => ({
        sku: item.sku,
        quantity: item.quantity
      }));

      // Call backend API to create sale
      const response = await apiService.createSale({ items });

      alert(`Order placed successfully! Total: ₱${response.total.toFixed(2)}`);

      // 🔹 Update stock locally
      setProducts(prevProducts => prevProducts.map(prod => {
        const purchased = items.find(i => i.sku === prod.sku);
        if (purchased) {
          return { ...prod, stock: prod.stock - purchased.quantity };
        }
        return prod;
      }));

      setCart([]);
      setShowCheckout(false);

    } catch (err) {
      console.error("Checkout error:", err);
      alert(err.message || "Failed to place order");
    }
  };



  const total = cart.reduce((sum, item) => sum + (item.price || item.unit_price || 0) * item.quantity, 0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setCart([]);
  };

  if (loading) return <div className="shop-loading">Loading products...</div>;

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
        </div>
      </div>

      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
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
                  <div key={item.id} className="cart-item">
                    <span>{item.name}</span>
                    <div className="cart-item-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span className="cart-quantity">{item.quantity}</span>
                      <button
                        onClick={() => {
                          if (item.quantity + 1 > item.stock) {
                            alert(`Only ${item.stock} stocks available`);
                          } else {
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        }}
                      >
                        +
                      </button>

                      <span className="cart-quantity">₱{((item.price || item.unit_price || 0) * item.quantity).toFixed(2)}</span>
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
