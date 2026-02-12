import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, ScrollToTop } from 'react-router-dom';
import { Layout } from './components/Layout';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import LoginPage from './pages/LoginPage';
import AccountPage from './pages/AccountPage';
import AddressesPage from './pages/AddressesPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import OrdersPage from './pages/OrdersPage';
import { CartItem, Product } from './types';

// ScrollToTop component to reset scroll on route change
const ScrollToTopEffect = () => {
    const { pathname } = React.useMemo(() => window.location, []);
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}

const App: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCartItemIds, setSelectedCartItemIds] = useState<string[]>([]);

  const addToCart = (product: Product, size?: number, color?: string) => {
    setSelectedCartItemIds((ids) => (ids.includes(product.id) ? ids : [...ids, product.id]));
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { 
          ...product, 
          quantity: 1, 
          selectedSize: size || 42, 
          selectedColor: color || product.colors?.[0] || '#000' 
      }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    setSelectedCartItemIds((ids) => ids.filter((x) => x !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, Number.isFinite(quantity) ? Math.floor(quantity) : 1);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const selectedCartItems = cartItems.filter((i) => selectedCartItemIds.includes(i.id));

  return (
    <Router>
      <Layout cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductPage addToCart={addToCart} />} />
          <Route
            path="/cart"
            element={
              <CartPage
                items={cartItems}
                removeFromCart={removeFromCart}
                updateQuantity={updateQuantity}
                selectedIds={selectedCartItemIds}
                setSelectedIds={setSelectedCartItemIds}
              />
            }
          />
          <Route path="/checkout" element={<CheckoutPage items={selectedCartItems} />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/account/orders" element={<OrdersPage />} />
          <Route path="/account/addresses" element={<AddressesPage />} />
          <Route path="/account/settings" element={<SettingsPage />} />
          <Route path="/support" element={<SupportPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
