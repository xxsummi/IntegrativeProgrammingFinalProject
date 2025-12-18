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

  // ✅ Search state
  const [searchTerm, setSearchTerm] = useState('');

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
      const payload = {
        id: editingProduct ? editingProduct.id : undefined,
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || 'No Description',
        price: parseFloat(formData.unit_price) || 0,
        stock: parseInt(formData.stock, 10) || 0
      };

      if (editingProduct) {
        if (!apiService.isAuthenticated()) {
          alert('You must be logged in to update products.');
          return;
        }

        const res = await apiService.updateProduct(editingProduct.id, payload);
        alert('Product updated successfully!');
        setEditingProduct(null);
      } else {
        if (!apiService.isAuthenticated()) {
          alert('You must be logged in to add products.');
          return;
        }

        const newProduct = await apiService.addProduct(payload);
        alert(`Product "${newProduct.name}" added successfully!`);
      }

      setShowAddForm(false);
      setFormData({ sku: '', name: '', unit_price: '', stock: '' });
      fetchProducts();
    } catch (err) {
      console.error('Product save failed:', err);
      alert(err?.message || 'Failed to save product');
    }
  };



  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      unit_price: (product.price || product.unit_price || 0).toString(),
      stock: product.stock.toString()
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        if (!apiService.isAuthenticated()) {
          alert('You must be logged in to delete products.');
          return;
        }

        await apiService.deleteProduct(id);
        alert('Product deleted successfully!');
        fetchProducts(); // Refresh list
      } catch (err) {
        console.error(err);
        alert('Failed to delete product');
      }
    }
  };


  // ✅ Filter products based on search
  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    return (
      product.name?.toLowerCase().includes(term) ||
      product.sku?.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term)
    );
  });

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
          {/* ✅ Search input */}
          <input
            type="text"
            placeholder="Search products..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
        {filteredProducts.length === 0 ? (
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
              {filteredProducts.map((product) => (
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
                      <MdEdit /> <span>Edit</span>
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(product.id)}
                      title="Delete Product"
                    >
                      <MdDelete /> <span>Delete</span>
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
                  <label>Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Has Caramel"
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
