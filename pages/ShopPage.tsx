import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import { fetchProducts, seedProducts } from '../lib/api';

const ShopPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [data, setData] = useState(PRODUCTS);

  useEffect(() => {
    fetchProducts().then((res) => {
      if (!Array.isArray(res) || res.length === 0) {
        seedProducts(PRODUCTS).catch(() => {});
        return;
      }
      const mapped = res.map((p: any) => ({
        id: p.id || '',
        name: p.name,
        category: p.category,
        price: Number(p.price),
        stockLow: !!p.stock_low,
        image: p.image,
        description: p.description || undefined,
        colors: p.colors || undefined,
        rating: p.rating || undefined,
        reviews: p.reviews || undefined,
        isNew: p.is_new || false,
        isSale: p.is_sale || false,
        isLimited: p.is_limited || false,
      }));
      setData(mapped);
    }).catch(() => {});
  }, []);

  const filteredProducts = data.filter(p => {
    if (!query) return true;
    const lowerQuery = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery) ||
      (p.description && p.description.toLowerCase().includes(lowerQuery))
    );
  });

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-8 flex items-center text-sm text-stone-500">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="mx-2 text-stone-300">/</span>
        <span className="font-medium text-stone-900">Shoes</span>
      </nav>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">All Shoes</h1>
          <p className="mt-2 text-stone-500">
            {query 
              ? `Showing results for "${query}". ${filteredProducts.length} styles found.` 
              : `Step into comfort with our latest collection. ${filteredProducts.length} styles found.`}
          </p>
        </div>
      </div>
      <div className="flex gap-8 lg:gap-12">
        <aside className="hidden w-64 flex-shrink-0 lg:block space-y-8">
          <div className="space-y-4">
            <h3 className="font-semibold text-stone-900">Category</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input defaultChecked={!query} className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary bg-white" type="checkbox" />
                <span className="text-sm text-stone-600 group-hover:text-primary transition-colors">All Shoes</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary bg-white" type="checkbox" />
                <span className="text-sm text-stone-600 group-hover:text-primary transition-colors">Sneakers</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary bg-white" type="checkbox" />
                <span className="text-sm text-stone-600 group-hover:text-primary transition-colors">Running</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary bg-white" type="checkbox" />
                <span className="text-sm text-stone-600 group-hover:text-primary transition-colors">Formal</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary bg-white" type="checkbox" />
                <span className="text-sm text-stone-600 group-hover:text-primary transition-colors">Sandals</span>
              </label>
            </div>
          </div>
          <div className="space-y-4 border-t border-border-subtle pt-8">
            <h3 className="font-semibold text-stone-900">Price Range</h3>
            <div className="space-y-4">
              <div className="relative h-2 w-full rounded-full bg-stone-200">
                <div className="absolute left-0 top-0 h-full w-2/3 rounded-full bg-primary"></div>
                <div className="absolute -top-1 left-2/3 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-primary bg-white shadow cursor-grab hover:scale-110 transition-transform"></div>
              </div>
              <div className="flex items-center justify-between text-sm text-stone-600">
                <span>$0</span>
                <span>$250+</span>
              </div>
            </div>
          </div>
        </aside>
        <section className="flex-1">
          {filteredProducts.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 rounded-full bg-stone-100 p-4">
                    <span className="material-symbols-outlined text-4xl text-stone-400">search_off</span>
                </div>
                <h3 className="text-lg font-bold text-stone-900">No matches found</h3>
                <p className="mt-2 text-stone-500">Try checking your spelling or using different keywords.</p>
                <Link to="/shop" className="mt-6 text-sm font-semibold text-primary hover:text-primary-hover">
                    Clear Search
                </Link>
             </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`} className="group relative flex flex-col gap-3">
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-stone-100">
                      {product.isNew && (
                        <span className="absolute left-3 top-3 z-10 rounded-full bg-white px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-stone-900 shadow-sm">New</span>
                      )}
                      {product.isSale && (
                        <span className="absolute left-3 top-3 z-10 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm">Sale</span>
                      )}
                      {product.isLimited && (
                        <span className="absolute left-3 top-3 z-10 rounded-full bg-stone-900 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm">Limited</span>
                      )}
                      <img
                        alt={product.name}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        src={product.image}
                      />
                      <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex justify-center">
                        <button className="w-full rounded-lg bg-white/90 backdrop-blur-sm py-2.5 text-sm font-semibold text-stone-900 shadow-lg hover:bg-primary hover:text-white transition-colors">Quick Add</button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-base font-semibold text-stone-900">
                          <span className="absolute inset-0"></span>{product.name}
                        </h3>
                        <div className="flex flex-col items-end">
                            {product.isSale ? (
                                <>
                                    <p className="text-base font-medium text-red-600">${product.price.toFixed(2)}</p>
                                    <p className="text-xs text-stone-400 line-through">${product.originalPrice?.toFixed(2)}</p>
                                </>
                            ) : (
                                <p className="text-base font-medium text-stone-900">${product.price.toFixed(2)}</p>
                            )}
                        </div>
                      </div>
                      <p className="text-sm text-stone-500">{product.category}</p>
                      <div className="mt-1 flex gap-1 relative z-20">
                        {product.colors?.map((color, idx) => (
                            <div key={idx} className="h-4 w-4 rounded-full border border-stone-200" style={{backgroundColor: color}}></div>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-12 flex justify-center border-t border-stone-200 pt-8">
                <nav className="flex items-center gap-1">
                  <button disabled className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-300 cursor-not-allowed">
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>
                  <button className="h-10 w-10 rounded-lg bg-primary text-sm font-semibold text-white">1</button>
                  <button disabled className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-300 cursor-not-allowed">
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </nav>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default ShopPage;
