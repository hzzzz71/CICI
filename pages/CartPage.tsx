import React from 'react';
import { Link } from 'react-router-dom';
import { CartItem } from '../types';

interface CartPageProps {
  items: CartItem[];
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const CartPage: React.FC<CartPageProps> = ({ items, removeFromCart, updateQuantity, selectedIds, setSelectedIds }) => {
  const selectedItems = items.filter((i) => selectedIds.includes(i.id));
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = selectedItems.length > 0 ? 12.00 : 0.00;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  const allSelected = items.length > 0 && items.every((i) => selectedIds.includes(i.id));

  if (items.length === 0) {
    return (
        <div className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-20 max-w-[1440px] mx-auto text-center">
            <h1 className="text-3xl font-black text-stone-900 mb-4">Your Cart is Empty</h1>
            <p className="text-stone-500 mb-8">Looks like you haven't added any shoes yet.</p>
            <Link to="/shop" className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-md hover:bg-primary-hover transition-all">
                Start Shopping
            </Link>
        </div>
    )
  }

  return (
    <div className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-[1440px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-stone-900 mb-2">Your Shopping Cart</h1>
        <p className="text-stone-500">{items.length} items in your cart</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">
        <div className="flex-1 flex flex-col gap-6">
          <div className="hidden sm:grid grid-cols-12 gap-4 pb-4 border-b border-border-light text-sm font-medium text-stone-500 uppercase tracking-wider">
            <div className="col-span-6 flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary bg-white"
                checked={allSelected}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSelectedIds(checked ? items.map((i) => i.id) : []);
                }}
              />
              <span>Product</span>
            </div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
          </div>
          
          {items.map((item) => (
            <div key={item.id} className="group relative flex flex-col sm:grid sm:grid-cols-12 gap-4 sm:items-center py-6 border-b border-border-light last:border-0">
              <div className="col-span-6 flex gap-4">
                <div className="pt-1">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary bg-white"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => {
                      setSelectedIds((prev) =>
                        prev.includes(item.id) ? prev.filter((x) => x !== item.id) : [...prev, item.id],
                      );
                    }}
                  />
                </div>
                <div className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                  <img
                    alt={item.name}
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    src={item.image}
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-base sm:text-lg font-bold text-stone-900">{item.name}</h3>
                  <div className="mt-1 flex items-center gap-2 text-sm text-stone-500">
                    <span>Color:</span>
                    <div 
                        className="h-4 w-4 rounded-full border border-stone-200 shadow-sm" 
                        style={{ backgroundColor: item.selectedColor }}
                        title={item.selectedColor}
                    ></div>
                  </div>
                  <p className="text-sm text-stone-500">Size: {item.selectedSize}</p>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="mt-2 text-sm font-medium text-red-500 hover:text-red-600 flex items-center gap-1 w-fit transition-colors"
                  >
                    <span className="material-symbols-outlined !text-[16px]">delete</span>
                    Remove
                  </button>
                </div>
              </div>
              <div className="col-span-2 flex items-center sm:justify-center">
                <div className="flex items-center rounded-lg border border-border-light bg-white">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-l-lg hover:bg-orange-50 text-stone-600 transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined !text-[16px]">remove</span>
                  </button>
                  <input
                    className="h-8 w-10 border-0 bg-transparent p-0 text-center text-sm font-medium text-stone-900 focus:ring-0"
                    type="number"
                    value={item.quantity}
                    min={1}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const next = raw === '' ? 1 : Number(raw);
                      updateQuantity(item.id, next);
                    }}
                  />
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-r-lg hover:bg-orange-50 text-stone-600 transition-colors"
                  >
                    <span className="material-symbols-outlined !text-[16px]">add</span>
                  </button>
                </div>
              </div>
              <div className="col-span-2 text-right hidden sm:block">
                <p className="text-sm font-medium text-stone-900">${item.price.toFixed(2)}</p>
              </div>
              <div className="col-span-2 flex justify-between sm:block sm:text-right items-center mt-2 sm:mt-0">
                <span className="sm:hidden text-sm font-medium text-stone-500">Total:</span>
                <p className="text-base font-bold text-stone-900">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}

          <div className="mt-6">
            <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-primary transition-colors">
              <span className="material-symbols-outlined !text-[18px]">arrow_back</span>
              Continue Shopping
            </Link>
          </div>
        </div>
        <div className="lg:w-[380px] shrink-0">
          <div className="sticky top-24 rounded-2xl border border-border-light bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-stone-900 mb-6">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-600">Subtotal</p>
                <p className="text-sm font-medium text-stone-900">
                  ${subtotal.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-600">Shipping Estimate</p>
                <p className="text-sm font-medium text-stone-900">${shipping.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-600">Tax Estimate</p>
                <p className="text-sm font-medium text-stone-900">${tax.toFixed(2)}</p>
              </div>
              <div className="pt-4 border-t border-border-light">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-base font-bold text-stone-900">Order Total</p>
                  <p className="text-2xl font-black text-primary">
                    ${total.toFixed(2)}
                  </p>
                </div>
                {selectedItems.length > 0 ? (
                  <Link to="/checkout" className="block w-full rounded-xl bg-primary py-4 text-center text-sm font-bold text-white shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all">
                    Proceed to Checkout
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="block w-full rounded-xl bg-stone-200 py-4 text-center text-sm font-bold text-stone-500 cursor-not-allowed"
                  >
                    请选择要购买的商品
                  </button>
                )}
                <div className="mt-6 flex flex-col gap-3">
                  <p className="text-center text-xs text-stone-500">We accept:</p>
                  <div className="flex justify-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
                    {['VISA', 'MC', 'AMEX', 'PAYPAL'].map(card => (
                        <div key={card} className="h-6 w-10 rounded bg-stone-200 relative overflow-hidden flex items-center justify-center">
                        <span className="text-[8px] font-bold text-stone-500">{card}</span>
                        </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <span className="material-symbols-outlined !text-[14px] text-green-600">lock</span>
                    <span className="text-xs font-medium text-stone-500">Secure Checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
