import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import { Product } from '../types';
import { fetchProducts } from '../lib/api';

interface ProductPageProps {
  addToCart: (product: Product, size?: number, color?: string) => void;
}

const ProductPage: React.FC<ProductPageProps> = ({ addToCart }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<number>(0);
  
  useEffect(() => {
    fetchProducts()
      .then((res) => {
        const source = Array.isArray(res) && res.length > 0
          ? res.map((p: any) => ({
              id: p.id || '',
              name: p.name,
              category: p.category,
              price: Number(p.price),
              stockLow: !!p.stock_low,
              image: p.image,
              images: p.images || undefined,
              description: p.description || undefined,
              colors: p.colors || undefined,
              rating: p.rating || undefined,
              reviews: p.reviews || undefined,
              isNew: p.is_new || false,
              isSale: p.is_sale || false,
              isLimited: p.is_limited || false,
            }))
          : PRODUCTS;
        const found = source.find(p => p.id === id);
        if (!found) {
          setProduct(null);
          return;
        }
        setProduct(found);
        setSelectedImage(found.image);
        if (found.colors && found.colors.length > 0) {
            setSelectedColor(found.colors[0]);
        }
        setSelectedSize(8);
      })
      .catch(() => {
        const found = PRODUCTS.find(p => p.id === id);
        if (!found) {
          setProduct(null);
          return;
        }
        setProduct(found);
        setSelectedImage(found.image);
        if (found.colors && found.colors.length > 0) {
            setSelectedColor(found.colors[0]);
        }
        setSelectedSize(8);
      });
  }, [id]);

  if (!product) return <div className="layout-container flex h-full grow flex-col px-4 md:px-10 py-10 max-w-7xl mx-auto w-full">该商品已售罄或不存在。</div>;

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor);
  };
  
  const handleBuyNow = () => {
    const buyNowItem: any = {
      ...product,
      quantity: 1,
      selectedSize: selectedSize || 8,
      selectedColor: selectedColor || product.colors?.[0] || '#000',
    };
    navigate('/checkout', { state: { buyNowItems: [buyNowItem] } });
  };

  return (
    <div className="layout-container flex h-full grow flex-col px-4 md:px-10 py-6 md:py-10 max-w-7xl mx-auto w-full">
      <nav className="flex flex-wrap gap-2 pb-6">
        <Link to="/" className="text-[#78716c] hover:text-primary text-sm font-medium leading-normal transition-colors">Home</Link>
        <span className="text-[#78716c] text-sm font-medium leading-normal">/</span>
        <Link to="/shop" className="text-[#78716c] hover:text-primary text-sm font-medium leading-normal transition-colors">Shoes</Link>
        <span className="text-[#78716c] text-sm font-medium leading-normal">/</span>
        <span className="text-[#292524] text-sm font-medium leading-normal">{product.name}</span>
      </nav>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-orange-50 relative group">
            <div 
                className="absolute inset-0 bg-center bg-contain bg-no-repeat transition-transform duration-500 hover:scale-105" 
                style={{ backgroundImage: `url("${selectedImage}")` }}
            ></div>
             {product.isNew && <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm text-primary">New Release</div>}
             {product.name.includes("Air-Stride") && <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm text-primary">Bestseller</div>}

          </div>
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {product.images?.map((img, idx) => (
                <button 
                    key={idx} 
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer relative bg-white transition-all ${selectedImage === img ? 'border-primary' : 'border-transparent hover:border-[#d6d3d1]'}`}
                >
                    <div className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-90 hover:opacity-100 transition-opacity" style={{ backgroundImage: `url("${img}")` }}></div>
                </button>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
          <div className="space-y-2">
            <h1 className="text-[#292524] text-3xl md:text-4xl font-bold leading-tight">{product.name}</h1>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-[#292524]">${product.price.toFixed(2)}</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map(i => <span key={i} className="material-symbols-outlined text-orange-400 text-lg fill-current">star</span>)}
                <span className="material-symbols-outlined text-orange-400 text-lg fill-current">star_half</span>
                <span className="text-sm text-[#78716c] ml-1">({product.reviews || 124} reviews)</span>
              </div>
            </div>
            {product.stockLow && (
              <div className="text-xs font-medium text-red-600">库存紧张</div>
            )}
          </div>
          <p className="text-[#78716c] text-base leading-relaxed">
            {product.description || "Engineered for maximum comfort and style. Perfect for everyday wear or your next adventure."}
          </p>
          <hr className="border-[#e7e5e4]" />
          <div className="space-y-3">
            <span className="text-sm font-semibold text-[#292524]">Color: <span className="font-normal text-[#78716c]">Selected</span></span>
            <div className="flex gap-3">
              {product.colors?.map((color, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedColor(color)}
                    className={`size-10 rounded-full ring-2 ring-offset-2 transition-all ${selectedColor === color ? 'ring-primary' : 'ring-transparent hover:ring-[#d6d3d1]'} focus:outline-none relative`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  >
                  </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center mb-1">
              <span className="text-sm font-semibold text-[#292524]">Size (US)</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {[7, 7.5, 8, 8.5, 9, 9.5, 10].map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-10 rounded-lg border text-sm font-medium transition-colors focus:outline-none ${selectedSize === size ? 'border-primary bg-primary text-white' : 'border-[#e7e5e4] bg-white text-[#292524] hover:border-primary hover:text-primary'}`}
                  >
                    {size}
                  </button>
              ))}
              <button className="h-10 rounded-lg border border-[#e7e5e4] bg-white text-sm font-medium text-[#78716c] opacity-50 cursor-not-allowed relative overflow-hidden" disabled>
                11
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full border-t border-[#a8a29e] rotate-45 transform origin-center"></div>
                </div>
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <button 
                onClick={handleAddToCart}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-6 py-4 text-base font-bold text-white transition-transform active:scale-[0.98] shadow-lg shadow-primary/25"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              Add to Cart
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#e7e5e4] bg-transparent px-6 py-3.5 text-base font-bold text-[#292524] transition-colors hover:bg-orange-50"
            >
              Buy It Now
            </button>
          </div>
          <div className="mt-4 space-y-4">
            <div className="group">
              <div className="flex cursor-pointer items-center justify-between py-2 border-b border-[#e7e5e4]">
                <span className="text-sm font-medium text-[#292524]">Free Delivery & Returns</span>
                <span className="material-symbols-outlined text-[#78716c]">expand_more</span>
              </div>
              <div className="pt-2 pb-2 text-sm text-[#78716c]">
                 Free standard delivery on orders over $100. Returns accepted within 30 days.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
