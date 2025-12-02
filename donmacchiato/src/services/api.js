// API service for connecting to the backend
const API_BASE_URL = 'http://localhost:3000/api'; // Sales backend

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async parseResponse(response) {
    const text = await response.text();
    try {
      if (!text) return null;
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  // Helper method to get headers with optional auth
  getHeaders(includeAuth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (includeAuth) {
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // ----------------- Auth -----------------
  async login(email, password) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  // ----------------- Products -----------------
  async getProducts() {
    try {
      const response = await fetch(`${this.baseURL}/sales/products`, { // Updated route
        method: 'GET',
        headers: this.getHeaders(true),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch products');
      return data;
    } catch (err) {
      console.error('Get products error:', err);
      throw err;
    }
  }

  async updateProduct(sku, productData) {
    try {
      const response = await fetch(`${this.baseURL}/products/${encodeURIComponent(sku)}`, {
        method: 'PATCH',
        headers: this.getHeaders(true),
        body: JSON.stringify(productData),
      });
      const data = await this.parseResponse(response);
      if (!response.ok) throw new Error(data.message || 'Failed to update product');
      return data;
    } catch (err) {
      console.error('Update product error:', err);
      throw err;
    }
  }

  // ----------------- Sales -----------------
  async getRecentSales() {
    try {
      const response = await fetch(`${this.baseURL}/sales/recent`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch recent sales');
      return data;
    } catch (err) {
      console.error('Get recent sales error:', err);
      throw err;
    }
  }

  async getSales() {
    try {
      const response = await fetch(`${this.baseURL}/sales`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });
      const data = await this.parseResponse(response);
      if (!response.ok) throw new Error(data.message || 'Failed to fetch sales');
      return data;
    } catch (err) {
      console.error('Get sales error:', err);
      throw err;
    }
  }

  async getSalesStats() {
    try {
      const response = await fetch(`${this.baseURL}/sales/stats`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });
      const data = await this.parseResponse(response);
      if (!response.ok) throw new Error(data.message || 'Failed to fetch sales stats');
      return data;
    } catch (err) {
      console.error('Get sales stats error:', err);
      throw err;
    }
  }

  async createSale(saleData) {
    try {
      const response = await fetch(`${this.baseURL}/sales`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(saleData),
      });
      const data = await this.parseResponse(response);
      if (!response.ok) throw new Error(data.message || 'Failed to create sale');
      return data;
    } catch (err) {
      console.error('Create sale error:', err);
      throw err;
    }
  }
}

// Export a singleton instance
const apiService = new ApiService();
export default apiService;
