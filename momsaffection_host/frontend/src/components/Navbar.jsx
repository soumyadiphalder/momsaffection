import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, User, LogOut, LayoutDashboard, Shield, Menu, X, Phone, Mail, Heart } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Premium Top Bar */}
      <div className="navbar-top-bar" style={{
        backgroundColor: 'var(--color-primary)',
        color: '#FFFFFF',
        padding: '8px 24px',
        fontSize: '0.82rem',
        fontWeight: '500',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={13} /> +91 84818 35873 / +91 98744 22779
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={13} /> momsaffection0@gmail.com
            </span>
          </div>
          <div className="topbar-tagline" style={{ opacity: '0.9', fontSize: '0.78rem', fontWeight: '400' }}>
            100% Pure, Homemade Food Products Made with Love
          </div>
        </div>
      </div>

      {/* Main Navbar Navigation */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img 
              src="/image/logo.png" 
              alt="Mom's Affection Logo" 
              style={{ height: '40px', width: 'auto', objectFit: 'contain' }} 
            />
          </Link>

          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              display: 'none',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: 'var(--color-text)',
              padding: '8px'
            }}
            title="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <ul className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/shop" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shop
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/about" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/contact" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact Us
              </NavLink>
            </li>

            {/* Mobile view only items */}
            {user && (
              <li className="mobile-only-link">
                {user.role === 'ADMIN' ? (
                  <NavLink 
                    to="/admin-dashboard" 
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin Console
                  </NavLink>
                ) : (
                  <NavLink 
                    to="/dashboard" 
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    User Dashboard
                  </NavLink>
                )}
              </li>
            )}
            {user && (
              <li className="mobile-only-link">
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: 'var(--color-danger)',
                    cursor: 'pointer',
                    fontSize: 'inherit',
                    fontFamily: 'inherit',
                    fontWeight: 'inherit',
                    width: '100%',
                    textAlign: 'center',
                    padding: '10px 0'
                  }}
                >
                  Logout Account
                </button>
              </li>
            )}
            {!user && (
              <li className="mobile-only-link">
                <NavLink 
                  to="/login" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login Account
                </NavLink>
              </li>
            )}
          </ul>

          <div className="nav-actions">
            <button 
              onClick={() => setIsCartOpen(true)}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '8px', color: 'var(--color-text)', border: 'none', background: 'none', cursor: 'pointer' }} 
              title="Shopping Cart"
            >
              <ShoppingBag size={22} style={{ transition: 'var(--transition)' }} className="nav-cart-icon" />
              {getCartCount() > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 5px rgba(0, 159, 127, 0.3)'
                }}>
                  {getCartCount()}
                </span>
              )}
            </button>

            <div className="desktop-nav-profile">
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {user.image ? (
                      <img 
                        src={`http://localhost:8000/${user.image}`} 
                        alt="Avatar" 
                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--color-primary-light)' }} 
                      />
                    ) : (
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-primary)',
                        fontSize: '0.8rem',
                        fontWeight: '700'
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>
                      Hi, <strong>{user.name.split(' ')[0]}</strong>
                    </span>
                  </div>
                  
                  {user.role === 'ADMIN' ? (
                    <Link to="/admin-dashboard" className="btn btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px', gap: '6px' }}>
                      <Shield size={15} /> Admin
                    </Link>
                  ) : (
                    <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px', gap: '6px' }}>
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                  )}

                  <button onClick={handleLogout} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-danger)', padding: '4px', transition: 'var(--transition)' }} title="Logout">
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn btn-primary" style={{ padding: '8px 20px', borderRadius: '8px', gap: '6px' }}>
                  <User size={15} /> Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
