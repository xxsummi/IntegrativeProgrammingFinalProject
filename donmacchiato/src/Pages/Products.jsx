import React, { useState, useEffect } from 'react';
import { PiCoffeeFill, PiShoppingCartSimple } from "react-icons/pi";
import { MdAdd, MdEdit, MdDelete } from "react-icons/md";
import apiService from '../services/api';
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
    unit_price: '',
    stock: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProducts();
      setProducts(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch products');
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
          sku: formData.sku,
          name: formData.name,
          unit_price: parseFloat(formData.unit_price),
          stock: parseInt(formData.stock, 10)
        };
        if (!apiService.isAuthenticated()) {
          alert('You must be logged in to update products. Please login and try again.');
          return;
        }

        const res = await apiService.updateProduct(editingProduct.sku, payload);
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
      unit_price: product.unit_price.toString(),
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
      <div className="products-header">
        <h1>
          <PiCoffeeFill className="header-icon" />
          Don Macchiato Products
        </h1>
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

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Add/Edit Product Form */}
      {showAddForm && (
        <div className="product-form-overlay">
          <div className="product-form">
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>SKU:</label>
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
                <label>Product Name:</label>
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
                <label>Price (₱):</label>
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
                <label>Stock:</label>
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
              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="products-grid">
        {products.length === 0 ? (
          <div className="no-products">
            <PiCoffeeFill className="no-products-icon" />
            <p>No products available</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.sku} className="product-card">
              <div className="product-header">
                <h3>{product.name}</h3>
                <div className="product-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(product)}
                    title="Edit Product"
                  >
                    <MdEdit />
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(product.sku)}
                    title="Delete Product"
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>
              <div className="product-details">
                <p className="product-sku">SKU: {product.sku}</p>
                <p className="product-price">₱{parseFloat(product.unit_price).toFixed(2)}</p>
                <p className={`product-stock ${product.stock < 10 ? 'low-stock' : ''}`}>
                  Stock: {product.stock}
                </p>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Products;
