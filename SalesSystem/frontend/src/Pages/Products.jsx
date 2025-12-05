import React, { useState, useEffect } from 'react';
import { PiCoffeeFill, PiShoppingCartSimple } from "react-icons/pi";
import { MdAdd, MdEdit, MdDelete } from "react-icons/md";
import apiService from '../services/api';
import wsService from '../services/websocket';
import signalRService from '../services/signalr';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form state for adding/editing products
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    unit_price: '',
    stock: ''
  });

  useEffect(() => {
    fetchProducts();
    
    // Connect to SignalR for real-time updates
    signalRService.connect();
    
    // Listen for inventory updates
    signalRService.on('StockUpdated', (data) => {
      setProducts(prev => prev.map(p => 
        p.sku === data.sku ? { ...p, stock: data.stock } : p
      ));
    });
    
    signalRService.on('ProductAdded', () => {
      fetchProducts();
    });
    
    signalRService.on('ProductDeleted', () => {
      fetchProducts();
    });
    
    return () => {
      signalRService.disconnect();
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProducts();
      console.log('Products data received:', data);
      // Handle both array and object with products property
      const productsArray = Array.isArray(data) ? data : (data?.products || []);
      console.log('Products array:', productsArray);
      setProducts(productsArray);
      setError('');
    } catch (err) {
      setError('Failed to fetch products');
      setProducts([]);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Update existing product (may create a sale on stock decrease)
        const payload = {
          id: editingProduct.id,
          sku: formData.sku,
          name: formData.name,
          description: formData.description || '',
          price: parseFloat(formData.unit_price),
          stock: parseInt(formData.stock, 10)
        };
        if (!apiService.isAuthenticated()) {
          alert('You must be logged in to update products. Please login and try again.');
          return;
        }

        const res = await apiService.updateProduct(editingProduct.id, payload);
        if (res && res.sale) {
          alert(`Stock reduced by ${res.sale.quantity}. Sale recorded (id: ${res.sale.id}).`);
        } else if (res && res.product) {
          alert('Product updated');
        } else {
          alert('Product updated (no additional info)');
        }
        setShowAddForm(false);
        setFormData({ sku: '', name: '', unit_price: '', stock: '' });
        setEditingProduct(null);
        fetchProducts(); // Refresh the list
        // optionally refresh sales/stats page if you have it visible
      } else {
        // Create new product - backend endpoint missing
        alert('Product added successfully! (Backend endpoint needed)');
        setShowAddForm(false);
        setFormData({ sku: '', name: '', unit_price: '', stock: '' });
        fetchProducts(); // Refresh the list
      }
    } catch (err) {
      console.error('Product save failed:', err);
      const message = err && err.message ? err.message : 'Failed to save product';
      alert(message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      unit_price: (product.price || product.unit_price || 0).toString(),
      stock: product.stock.toString()
    });
    setShowAddForm(true);
  };

  const handleDelete = async (sku) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // This would need a backend endpoint for deleting products
        alert('Product deleted! (Backend endpoint needed)');
        fetchProducts(); // Refresh the list
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  if (loading) {
    return (
      <div className="products-container">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="products-container">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon products">
            <PiCoffeeFill />
          </div>
          <div className="stat-content">
            <h3>Total Products</h3>
            <p>{products.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stock">
            <MdAdd />
          </div>
          <div className="stat-content">
            <h3>Total Stock</h3>
            <p>{products.reduce((sum, p) => sum + (p.stock || 0), 0)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon low-stock">
            <MdDelete />
          </div>
          <div className="stat-content">
            <h3>Low Stock Items</h3>
            <p>{products.filter(p => p.stock < 10).length}</p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="search-section">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="search-input"
          />
        </div>
        <div className="action-buttons">
          <button 
            className="add-product-btn"
            onClick={() => {
              setShowAddForm(true);
              setEditingProduct(null);
              setFormData({ sku: '', name: '', unit_price: '', stock: '' });
            }}
          >
            <MdAdd /> Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Products Table */}
      <div className="products-table-container">
        {products.length === 0 ? (
          <div className="no-products">
            <PiCoffeeFill className="no-products-icon" />
            <h3>No products available</h3>
            <p>Start by adding your first product to the inventory</p>
          </div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.sku} className="product-row">
                  <td className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-description">{product.description || 'No description'}</div>
                  </td>
                  <td className="product-sku">{product.sku}</td>
                  <td className="product-price">₱{parseFloat(product.price || product.unit_price || 0).toFixed(2)}</td>
                  <td className="product-stock">{product.stock}</td>
                  <td className="product-status">
                    <span className={`status-badge ${product.stock < 10 ? 'low-stock' : 'in-stock'}`}>
                      {product.stock < 10 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="product-actions">
                    <button 
                      className="action-btn edit"
                      onClick={() => handleEdit(product)}
                      title="Edit Product"
                    >
                      <MdEdit />
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDelete(product.sku)}
                      title="Delete Product"
                    >
                      <MdDelete />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Caramel Macchiato"
                  />
                </div>
                <div className="form-group">
                  <label>SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., CARAMEL001"
                  />
                </div>
                <div className="form-group">
                  <label>Price (₱)</label>
                  <input
                    type="number"
                    name="unit_price"
                    value={formData.unit_price}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
