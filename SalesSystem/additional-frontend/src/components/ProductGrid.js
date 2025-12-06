import React, { useState, useEffect } from "react";
import axios from "axios";
import websocketService from "../services/websocket";
import "./ProductGrid.css";

// Fetch all data function
const fetchAllData = async (setProducts, setRecentSales, setStats, setTopProducts) => {
  try {
    console.log("Fetching all data...");
    const [productsRes, salesRes, statsRes, topRes] = await Promise.all([
      axios.get("http://localhost:3000/api/products"),
      axios.get("http://localhost:3000/api/sales"),
      axios.get("http://localhost:3000/api/sales/embedded/summary"),
      axios.get("http://localhost:3000/api/sales/embedded/stats")
    ]);
    
    console.log("Products:", productsRes.data);
    console.log("Stats:", statsRes.data);
    console.log("Top Products:", topRes.data);
    
    setProducts(productsRes.data);
    setRecentSales(Array.isArray(salesRes.data) ? salesRes.data : salesRes.data.sales || []);
    setStats(statsRes.data || { total_sales: 0, total_revenue: 0 });
    setTopProducts(Array.isArray(topRes.data) ? topRes.data : []);
  } catch (err) {
    console.error("Failed to fetch data:", err);
  }
};

function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [recentSales, setRecentSales] = useState([]);
  const [stats, setStats] = useState({ total_sales: 0, total_revenue: 0 });
  const [topProducts, setTopProducts] = useState([]);
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantityInput, setQuantityInput] = useState(1);

  // Fetch products and stats
  const fetchAllDataCallback = async () => {
    await fetchAllData(setProducts, setRecentSales, setStats, setTopProducts);
  };

  // Fetch on component mount
  useEffect(() => {
    fetchAllDataCallback();

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
      }
    };

    websocketService.on('message', handleMessage);

    return () => {
      websocketService.off('message', handleMessage);
      websocketService.disconnect();
    };
  }, []);

  // Show quantity dialog when user clicks buy
  const handleBuy = (product) => {
    setSelectedProduct(product);
    setQuantityInput(1);
    setShowQuantityDialog(true);
  };

  // Add item to cart with specified quantity
  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    const quantity = parseInt(quantityInput) || 1;
    
    // Check if quantity exceeds available stock
    if (quantity > selectedProduct.stock) {
      alert(`Only ${selectedProduct.stock} items available!`);
      return;
    }

    // Check if product already in cart
    const existingItem = cart.find(item => item.sku === selectedProduct.sku);
    let updatedCart;
    let newTotal;

    if (existingItem) {
      // Update quantity if product already in cart
      updatedCart = cart.map(item =>
        item.sku === selectedProduct.sku
          ? {
              ...item,
              cartQuantity: item.cartQuantity + quantity
            }
          : item
      );
    } else {
      // Add new item to cart
      updatedCart = [...cart, {
        ...selectedProduct,
        cartQuantity: quantity
      }];
    }

    // Validate total cart quantity doesn't exceed stock
    const cartItem = updatedCart.find(item => item.sku === selectedProduct.sku);
    if (cartItem.cartQuantity > selectedProduct.stock) {
      alert(`Cannot add more than ${selectedProduct.stock} items!`);
      return;
    }

    setCart(updatedCart);
    newTotal = updatedCart.reduce((sum, item) => sum + (item.unit_price * item.cartQuantity), 0);
    setTotal(newTotal);
    
    setShowQuantityDialog(false);
    setSelectedProduct(null);
  };

  // Finalize purchase
  const handlePurchase = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      const salePayload = {
        items: cart.map(item => ({
          product_sku: item.sku,
          quantity: item.cartQuantity
        }))
      };

      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to purchase.");
        return;
      }

      // Send request with Authorization header
      await axios.post(
        "http://localhost:3000/api/sales",
        salePayload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert(`Purchase successful! Total: ₱${total}`);

      // Refresh all data after purchase
      await fetchAllDataCallback();

      // Reset cart
      setCart([]);
      setTotal(0);
    } catch (err) {
      console.error("Purchase error:", err);
      alert("Purchase failed!");
    }
  };

  // Remove item from cart
  const handleRemove = (index) => {
    const itemToRemove = cart[index];
    const updatedCart = cart.filter((_, idx) => idx !== index);
    setCart(updatedCart);
    const newTotal = updatedCart.reduce((sum, item) => sum + (item.unit_price * item.cartQuantity), 0);
    setTotal(newTotal);
  };


  return (
    <div>
      <div className="grid-container">
        {products.map(p => (
          <div className="product-card" key={p.sku}>
            <div className="product-image">📷</div>
            <h3>{p.name}</h3>
            <p>₱{p.unit_price}</p>
            <p style={{ fontSize: '12px', color: p.stock > 0 ? '#666' : '#ff6b6b' }}>
              {p.stock > 0 ? `Stock: ${p.stock}` : 'Out of Stock'}
            </p>
            <button 
              onClick={() => handleBuy(p)} 
              disabled={p.stock === 0}
              style={{
                opacity: p.stock === 0 ? 0.5 : 1,
                cursor: p.stock === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {p.stock === 0 ? 'Out of Stock' : 'Buy'}
            </button>
          </div>
        ))}
      </div>

      {/* Quantity Dialog */}
      {showQuantityDialog && selectedProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            width: '400px'
          }}>
            <h2>{selectedProduct.name}</h2>
            <p style={{ color: '#666' }}>Price: ₱{selectedProduct.unit_price}</p>
            <p style={{ color: '#666' }}>Available Stock: {selectedProduct.stock}</p>
            
            <label style={{ display: 'block', marginTop: '15px', marginBottom: '10px' }}>
              Quantity:
              <input
                type="number"
                min="1"
                max={selectedProduct.stock}
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
                style={{
                  marginLeft: '10px',
                  padding: '5px',
                  width: '60px',
                  fontSize: '16px'
                }}
              />
            </label>
            
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Add to Cart
              </button>
              <button 
                onClick={() => setShowQuantityDialog(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#ccc',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart UI */}
      <div className="cart">
        <h2>Cart</h2>
        <ul>
          {cart.map((item, idx) => (
            <li key={idx}>
              {item.name} x{item.cartQuantity} - ₱{(item.unit_price * item.cartQuantity).toFixed(2)}{" "}
              <button onClick={() => handleRemove(idx)}>Remove</button>
            </li>
          ))}
        </ul>
        <h3>Total: ₱{total.toFixed(2)}</h3>
        <button onClick={handlePurchase} disabled={cart.length === 0}>
          Purchase
        </button>
      </div>

      {/* Stats Section */}
      <div className="stats-section" style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h2>Sales Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Total Sales</h3>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0', color: '#333' }}>{stats.total_sales}</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Total Revenue</h3>
            <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0', color: '#333' }}>₱{Number(stats.total_revenue).toFixed(2)}</p>
          </div>
        </div>

        <h3>Top Selling Products</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Product Name</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Quantity Sold</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.length > 0 ? (
              topProducts.slice(0, 5).map((product) => (
                <tr key={product.product_sku} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{product.product_name}</td>
                  <td style={{ padding: '10px' }}>{product.total_quantity}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" style={{ padding: '10px', textAlign: 'center' }}>
                  No sales data yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Recent Sales Table */}
      <div className="recent-sales" style={{ marginTop: '30px' }}>
        <h2>Recent Sales</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f0f0f0' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Sale ID</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Products</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentSales && recentSales.length > 0 ? (
              recentSales.map((sale) => (
                <tr key={sale.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{sale.id}</td>
                  <td style={{ padding: '10px' }}>
                    {sale.items && sale.items.length > 0
                      ? sale.items.map((item) => `${item.product_name} (${item.quantity})`).join(', ')
                      : 'No items'}
                  </td>
                  <td style={{ padding: '10px' }}>
                    {sale.created_at ? new Date(sale.created_at).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ padding: '10px', textAlign: 'center', color: '#999' }}>
                  No recent sales
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductGrid;
            {recentSales.length > 0 ? (
              recentSales.map((sale) => (
                <tr key={sale.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{sale.id}</td>
                  <td style={{ padding: '10px' }}>
                    {sale.items && sale.items.length > 0
                      ? sale.items.map((item) => `${item.product_name} (${item.quantity})`).join(', ')
                      : 'No items'}
                  </td>
                  <td style={{ padding: '10px' }}>
                    {sale.created_at ? new Date(sale.created_at).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ padding: '10px', textAlign: 'center' }}>
                  No sales yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductGrid;
