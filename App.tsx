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
  const [cartItems, setCartItems] = useState<CartItem[]>([
      {
          id: '101',
          name: 'Velocity Runner',
          category: 'Running',
          price: 120.00,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGRQLI3gt3RVKiuCNMYtQEcxD-s7i4GukYHxZbAp-XM7hy-Okosm_jhtOUe4Nl2yokoh4isP-6lRRp1Lmd7y2mrvvBPfWp4NuIb9XUe8q2XUgppTgd1H3VM91S_KcV271_hMtZUUvtGE5XJt3KuRac0xTpMJKE76ruisp8hFXi142782iE6QIgyzBvF2LHrb7CViFmZx61-W9G3obPJAgh_BXz7eoBfgN-zO6W5F8t4Ravoso-tLJqtO2Vpu9iOI0LyPN-VJjLpSo',
          quantity: 1,
          selectedSize: 42,
          selectedColor: '#dc2626'
      },
      {
          id: '102',
          name: 'Urban Trekker',
          category: 'Casual',
          price: 145.00,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA33kBR-TlQoGN04vGB8vYJX7DZAnyJzBrTYmcCyDc2KNblywEdCNczFpQfCYsNgKsom-s9u6D7WcWO_WTLGFJUtd854yoUk50j32D6HUdp5ptivXNr_FXfBzNiflmhnKfWXEE-O3IsNi-KSqgjledN1jG4RbE4AH5nbqY2N2AmSkSgKLzWU3KMPh7ueBDvFRxF_4QORtUof5r09y1-2Bt2_tPavACDLfdZD9MmZMxO6O2v3-Ga5qv0yG6yTcRyGLSxTtgaPHLt86E',
          quantity: 1,
          selectedSize: 40,
          selectedColor: '#6b7280'
      },
      {
          id: '103',
          name: 'Court Classic',
          category: 'Tennis',
          price: 95.00,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkR2337pSk7n3a6DKA0ue9MEbkBqmpb22Fik6H2Irf7K_NvkEZJ5clkcjVaV7D5QrjNYTzA1BkjZiwP7fOnA7Adu_02VTNVtiltKSfMjtWnGLg88aFXFtkp1a2qh9bm4ZbNdcvAX1J_byXvrijFpr9pEoQw3UicoDJOIXFuftPbAN9rb8TirWpxd24OhC0Ryl946OwkzYXFY0ApDdrrg4wD038BnrM2qiLChRCYzNgoFgcCLbKpC0K3Z6Hyzl9J6mRhExcUL-A0fg',
          quantity: 1,
          selectedSize: 41,
          selectedColor: '#ffffff'
      }
  ]);

  const addToCart = (product: Product, size?: number, color?: string) => {
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
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  return (
    <Router>
      <Layout cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductPage addToCart={addToCart} />} />
          <Route path="/cart" element={<CartPage items={cartItems} removeFromCart={removeFromCart} updateQuantity={updateQuantity} />} />
          <Route path="/checkout" element={<CheckoutPage items={cartItems} />} />
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
