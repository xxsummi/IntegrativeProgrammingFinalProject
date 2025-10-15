import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, test, expect } from 'vitest';
import Sales from './Sales';
import apiService from '../services/api';

vi.mock('../services/api', () => {
  return {
    default: {
      getProducts: vi.fn().mockResolvedValue([{ sku: 'CARAMEL001', name: 'Caramel Macchiato', unit_price: 45, stock: 50 }]),
      getSalesStats: vi.fn().mockResolvedValue([{ product_sku: 'CARAMEL001', product_name: 'Caramel Macchiato', total_quantity: 2500 }]),
      createSale: vi.fn()
    }
  };
});

test('renders products with times bought', async () => {
  render(<Sales />);
  const header = await screen.findByText(/Most Sold Coffees/i);
  expect(header).toBeTruthy();
  expect(await screen.findByText(/Caramel Macchiato/i)).toBeTruthy();
  expect(await screen.findByText(/Times bought/i)).toBeTruthy();
});
