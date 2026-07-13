import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SidebarCart from './components/SidebarCart';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Shop from './pages/Shop';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Contact from './pages/Contact';

function PageLoader() {
  const [visible, setVisible] = useState(true);
  const location = useLocation();

  // Show loader on initial load and route changes
  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 800); // Transition loader runs for 800ms

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      pointerEvents: 'all'
    }}>
      {/* Horizontal Emoji Group with different movements */}
      <div style={{
        display: 'flex',
        gap: '30px',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80px',
        marginBottom: '20px'
      }}>
        {/* 🌰 spins on axis */}
        <span style={{ fontSize: '2.5rem', display: 'inline-block', animation: 'spin-self 1.3s linear infinite' }}>🌰</span>
        {/* 🥜 bounces up and down */}
        <span style={{ fontSize: '2.5rem', display: 'inline-block', animation: 'bounce 0.9s ease-in-out infinite', animationDelay: '0.1s' }}>🥜</span>
        {/* 🍪 pulses in scale */}
        <span style={{ fontSize: '2.5rem', display: 'inline-block', animation: 'pulse-scale 1.6s ease-in-out infinite', animationDelay: '0.3s' }}>🍪</span>
        {/* 🥨 sways left and right */}
        <span style={{ fontSize: '2.5rem', display: 'inline-block', animation: 'sway 1.1s ease-in-out infinite', animationDelay: '0.2s' }}>🥨</span>
        {/* 🍞 rolls around */}
        <span style={{ fontSize: '2.5rem', display: 'inline-block', animation: 'roll-slow 2s linear infinite', animationDelay: '0.4s' }}>🍞</span>
        {/* 🍿 bounces */}
        <span style={{ fontSize: '2.5rem', display: 'inline-block', animation: 'bounce 1.2s ease-in-out infinite', animationDelay: '0.5s' }}>🍿</span>
      </div>
      
      <p style={{
        marginTop: '25px',
        fontFamily: 'var(--font-display)',
        fontWeight: '800',
        fontSize: '1.1rem',
        color: 'var(--color-primary)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        animation: 'pulse 1.5s ease-in-out infinite'
      }}>
        Preparing Foods...
      </p>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminDashboard = location.pathname === '/admin-dashboard';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PageLoader />
      <SidebarCart />
      {!isAdminDashboard && <Navbar />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
      {!isAdminDashboard && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
