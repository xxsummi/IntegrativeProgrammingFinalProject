import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Sales from './Sales';
import apiService from '../services/api';

vi.mock('../services/api', () => ({
  getProducts: vi.fn().mockResolvedValue([]),
  getSalesStats: vi.fn().mockResolvedValue([]),
  createSale: vi.fn()
}));

test('renders Most Sold Coffees chart (dummy)', async () => {
  render(<Sales />);
  expect(await screen.findByText(/Most Sold Coffees/i)).toBeInTheDocument();
  // check that the dummy top seller text is visible in the SVG (Caramel Macchiato)
  expect(await screen.findByText(/Caramel Macchiato/i)).toBeInTheDocument();
});