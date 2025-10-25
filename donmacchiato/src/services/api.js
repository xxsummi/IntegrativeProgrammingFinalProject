// API service for connecting to the backend
const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Parse response safely: try JSON, fall back to text
  async parseResponse(response) {
    const text = await response.text();
    try {
      // If empty body, return null
      if (!text) return null;
      return JSON.parse(text);
    } catch (jsonErr) {
      // Not JSON — return raw text
      return text;
    }
  }

  // Helper method to get headers with auth token
  getHeaders(includeAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  // Login user
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout user
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Get current user from localStorage
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  // Get products
  async getProducts() {
    try {
      const response = await fetch(`${this.baseURL}/products`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products');
      }

      return data;
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  }

  // Get recent sales
  async getRecentSales() {
    try {
      const response = await fetch(`${this.baseURL}/sales/recent`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch recent sales');
      }

      return data;
    } catch (error) {
      console.error('Get recent sales error:', error);
      throw error;
    }
  }

  // Get sales (admin only)
  async getSales() {
    try {
      const response = await fetch(`${this.baseURL}/sales`, {
        method: 'GET',
        headers: this.getHeaders(true), // Include auth
      });

      const data = await this.parseResponse(response);
      if (!response.ok) {
        // if data is object with message, use it; otherwise convert to string
        const msg = data && data.message ? data.message : String(data || response.statusText);
        throw new Error(msg || 'Failed to fetch sales');
      }

      return data;
    } catch (error) {
      console.error('Get sales error:', error);
      throw error;
    }
  }

  // Get sales stats (aggregated quantities per product)
  async getSalesStats() {
    try {
      const response = await fetch(`${this.baseURL}/sales/stats`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      const data = await this.parseResponse(response);
      if (!response.ok) {
        const msg = data && data.message ? data.message : String(data || response.statusText);
        throw new Error(msg || 'Failed to fetch sales stats');
      }

      return data;
    } catch (error) {
      console.error('Get sales stats error:', error);
      throw error;
    }
  }

  // Create a new sale
  async createSale(saleData) {
    try {
      const response = await fetch(`${this.baseURL}/sales`, {
        method: 'POST',
        headers: this.getHeaders(true), // Include auth
        body: JSON.stringify(saleData),
      });

      const data = await this.parseResponse(response);
      if (!response.ok) {
        const msg = data && data.message ? data.message : String(data || response.statusText);
        throw new Error(msg || 'Failed to create sale');
      }

      return data;
    } catch (error) {
      console.error('Create sale error:', error);
      throw error;
    }
  }

  // Get aggregated sales stats per product (admin only)
  async getSalesStats() {
    try {
      const response = await fetch(`${this.baseURL}/sales/stats`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch sales stats');
      return data;
    } catch (error) {
      console.error('Get sales stats error:', error);
      throw error;
    }
  }

  // Update product (may create sale if stock decreased)
  async updateProduct(sku, productData) {
    try {
      const response = await fetch(`${this.baseURL}/products/${encodeURIComponent(sku)}`, {
        method: 'PATCH',
        headers: this.getHeaders(true),
        body: JSON.stringify(productData),
      });

      const data = await this.parseResponse(response);
      if (!response.ok) {
        const msg = data && data.message ? data.message : String(data || response.statusText);
        throw new Error(msg || 'Failed to update product');
      }
      return data;
    } catch (error) {
      console.error('Update product error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
