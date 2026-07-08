import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart, MessageSquare } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer" style={{
      backgroundColor: '#111827',
      color: '#9CA3AF',
      padding: '60px 24px 30px',
      fontSize: '0.9rem',
      borderTop: '1px solid #1F2937'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
      }}>
        <div>
          <h4 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.4rem', 
            color: '#FFFFFF', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Heart size={20} fill="var(--color-primary)" style={{ color: 'var(--color-primary)' }} />
            <span>Mom's Affection</span>
          </h4>
          <p style={{ fontSize: '0.92rem', color: '#9CA3AF', lineHeight: '1.6', marginBottom: '20px' }}>
            Pure, homemade food products made with organic ingredients and overflowing motherly love. Taste the flavor of traditional grandmother's recipes delivered directly to your doorstep.
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" style={{ 
              color: '#9CA3AF', 
              backgroundColor: '#1F2937', 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              transition: 'var(--transition)'
            }} className="footer-social-link">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ 
              color: '#9CA3AF', 
              backgroundColor: '#1F2937', 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              transition: 'var(--transition)'
            }} className="footer-social-link">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="https://whatsapp.com" target="_blank" rel="noreferrer" style={{ 
              color: '#9CA3AF', 
              backgroundColor: '#1F2937', 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              transition: 'var(--transition)'
            }} className="footer-social-link">
              <MessageSquare size={18} />
            </a>
          </div>
        </div>

        <div>
          <h4 style={{ color: '#FFFFFF', marginBottom: '20px', fontFamily: 'var(--font-display)' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><Link to="/" style={{ color: '#9CA3AF', transition: 'var(--transition)' }} className="footer-link">Home</Link></li>
            <li><Link to="/shop" style={{ color: '#9CA3AF', transition: 'var(--transition)' }} className="footer-link">Shop Products</Link></li>
            <li><Link to="/about" style={{ color: '#9CA3AF', transition: 'var(--transition)' }} className="footer-link">About Our Kitchen</Link></li>
            <li><Link to="/contact" style={{ color: '#9CA3AF', transition: 'var(--transition)' }} className="footer-link">Contact Support</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#FFFFFF', marginBottom: '20px', fontFamily: 'var(--font-display)' }}>Support & Policy</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><span style={{ color: '#9CA3AF', cursor: 'pointer', transition: 'var(--transition)' }} className="footer-link">FAQ</span></li>
            <li><span style={{ color: '#9CA3AF', cursor: 'pointer', transition: 'var(--transition)' }} className="footer-link">Shipping Details</span></li>
            <li><span style={{ color: '#9CA3AF', cursor: 'pointer', transition: 'var(--transition)' }} className="footer-link">Refund Policy</span></li>
            <li><span style={{ color: '#9CA3AF', cursor: 'pointer', transition: 'var(--transition)' }} className="footer-link">Terms of Service</span></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#FFFFFF', marginBottom: '20px', fontFamily: 'var(--font-display)' }}>Get in Touch</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#9CA3AF' }}>
              <Phone size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              <span>+91 98765 43210</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#9CA3AF' }}>
              <Mail size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              <span>support@momsaffection.com</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'start', gap: '10px', color: '#9CA3AF' }}>
              <MapPin size={18} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
              <span>Kolkata, West Bengal, India</span>
            </li>
          </ul>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid #1F2937',
        paddingTop: '20px',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: '#6B7280',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <p>&copy; {new Date().getFullYear()} MomsAffection. All rights reserved.</p>
        <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          Made with <Heart size={12} style={{ color: 'var(--color-primary)' }} fill="var(--color-primary)" /> for healthy home food lovers.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
