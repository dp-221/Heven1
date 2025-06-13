import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { AdminProvider } from './context/AdminContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminLayout from './components/admin/AdminLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Auth from './pages/Auth';
import About from './pages/About';
import Contact from './pages/Contact';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import UserManagement from './pages/admin/UserManagement';
import CouponManagement from './pages/admin/CouponManagement';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AdminProvider>
            <Router>
              <Routes>
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/*" element={
                  <AdminLayout>
                    <Routes>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="products" element={<ProductManagement />} />
                      <Route path="orders" element={<OrderManagement />} />
                      <Route path="users" element={<UserManagement />} />
                      <Route path="coupons" element={<CouponManagement />} />
                    </Routes>
                  </AdminLayout>
                } />
                
                {/* Customer Routes */}
                <Route path="/*" element={
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-grow">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                } />
              </Routes>
            </Router>
          </AdminProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;