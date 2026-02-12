import { Product } from '../types';
import { supabase } from './supabaseClient';

const baseUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export const fetchProducts = async (): Promise<Product[]> => {
  const session = (await supabase.auth.getSession()).data.session;
  const headers: Record<string, string> = {};
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  const res = await fetch(`${baseUrl}/api/products`, {
    headers: Object.keys(headers).length > 0 ? headers : undefined,
  });
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
