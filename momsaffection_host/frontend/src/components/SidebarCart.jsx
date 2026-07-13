import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';

const SidebarCart = () => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal, 
    isCartOpen, 
    setIsCartOpen 
  } = useCart();
  
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleViewCartClick = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 99999,
          backdropFilter: 'blur(4px)',
          transition: 'all 0.3s ease'
        }}
      />

      {/* Drawer */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: '420px',
          height: '100vh',
          backgroundColor: '#FFFFFF',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.1)',
          zIndex: 100000,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.3s ease-out forwards'
        }}
      >
        {/* CSS Keyframes helper inline injection */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}} />

        {/* Header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <ShoppingBag size={20} color="var(--color-primary)" /> Shopping Cart ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
          </h3>
          <button 
            onClick={() => setIsCartOpen(false)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body (Scrollable Cart Items) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {cartItems.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%', color: 'var(--color-text-muted)' }}>
              <ShoppingBag size={64} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <p style={{ fontSize: '1.05rem', fontWeight: '500' }}>Your cart is empty</p>
              <button 
                onClick={() => { setIsCartOpen(false); navigate('/shop'); }}
                className="btn btn-primary" 
                style={{ marginTop: '16px', padding: '10px 20px', fontSize: '0.85rem' }}
              >
                Shop Fresh Homemade Food
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cartItems.map(item => (
                <div 
                  key={item.product_id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid var(--color-border)'
                  }}
                >
                  {/* Product Image */}
                  <div style={{ width: '70px', height: '70px', borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justify: 'center', backgroundColor: 'var(--color-surface-hover)' }}>
                    {item.image ? (
                      <img 
                        src={`http://localhost:8000/${item.image}`} 
                        alt={item.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <ShoppingBag size={24} style={{ opacity: 0.3 }} />
                    )}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--color-text)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</strong>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--color-text)' }}>₹{item.price * item.quantity}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      {/* Quantity Selector */}
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden' }}>
                        <button 
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          style={{ padding: '6px 8px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ padding: '0 8px', fontSize: '0.85rem', fontWeight: '600' }}>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          style={{ padding: '6px 8px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button 
                        onClick={() => removeFromCart(item.product_id)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: '4px' }}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer (Subtotal & Actions) */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '24px 20px',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: '#FAFAFA'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: '500' }}>Subtotal</span>
              <strong style={{ fontSize: '1.25rem', color: 'var(--color-text)' }}>₹{getCartTotal()}</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={handleCheckoutClick}
                className="btn btn-primary" 
                style={{ width: '100%', padding: '14px', borderRadius: '8px' }}
              >
                Proceed to Checkout
              </button>
              <button 
                onClick={handleViewCartClick}
                className="btn btn-secondary" 
                style={{ width: '100%', padding: '12px', borderRadius: '8px' }}
              >
                View Full Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SidebarCart;
