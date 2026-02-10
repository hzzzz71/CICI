import { Product } from '../types';

const baseUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export const fetchProducts = async (): Promise<Product[]> => {
  const res = await fetch(`${baseUrl}/api/products`);
  if (!res.ok) {
    return [];
  }
  return res.json();
};

export const seedProducts = async (products: Product[]) => {
  await fetch(`${baseUrl}/api/seed-products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products }),
  });
};
