import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiService from './api';

describe('apiService', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    if (typeof localStorage === 'undefined' || localStorage === null) {
      global.localStorage = {
        _data: {},
        setItem(k, v) { this._data[k] = String(v); },
        getItem(k) { return this._data.hasOwnProperty(k) ? this._data[k] : null; },
        removeItem(k) { delete this._data[k]; },
        clear() { this._data = {}; }
      };
    }
    localStorage.clear();
  });

  it('getProducts returns products array', async () => {
    const fakeProducts = [{ sku: 'A', name: 'A', unit_price: 10, stock: 5 }];
    global.fetch.mockResolvedValue({ ok: true, json: async () => fakeProducts });

    const res = await apiService.getProducts();
    expect(res).toEqual(fakeProducts);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/products', expect.any(Object));
  });

  it('createSale posts with auth header', async () => {
    localStorage.setItem('token', 'fake-token');
    const fakeResponse = { id: 1, total: 100 };
    global.fetch.mockResolvedValue({ ok: true, json: async () => fakeResponse });

    const res = await apiService.createSale({ items: [{ product_sku: 'A', quantity: 1 }] });
    expect(res).toEqual(fakeResponse);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/sales', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer fake-token' })
    }));
  });
});
