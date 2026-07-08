import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, UtensilsCrossed } from 'lucide-react';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckoutRedirect = () => {
    if (!user) {
      // Force logins before checking out
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 24px', backgroundColor: 'var(--color-bg)' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          color: 'var(--color-primary)'
        }}>
          <ShoppingBag size={36} />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '12px', fontWeight: '800' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '30px', fontSize: '1rem' }}>Looks like you haven't added any homemade snacks to your cart yet.</p>
        <Link to="/shop" className="btn btn-primary" style={{ padding: '12px 28px' }}>Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '60px 24px', backgroundColor: 'var(--color-bg)' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '30px', fontWeight: '800' }}>Your Shopping Cart</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '40px',
        alignItems: 'start'
      }} className="shop-grid">
        {/* Cart items */}
        <div className="table-wrapper" style={{ borderRadius: '16px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB' }}>
                <th style={{ padding: '16px 20px', fontWeight: '700' }}>Product</th>
                <th style={{ padding: '16px 20px', fontWeight: '700' }}>Price</th>
                <th style={{ padding: '16px 20px', fontWeight: '700' }}>Quantity</th>
                <th style={{ padding: '16px 20px', fontWeight: '700' }}>Total</th>
                <th style={{ padding: '16px 20px' }}></th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(item => (
                <tr key={item.product_id}>
                  <td style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '8px', 
                        backgroundColor: 'var(--color-surface-hover)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        {item.image ? (
                          <img 
                            src={`http://localhost:8000/${item.image}`} 
                            alt={item.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <UtensilsCrossed size={20} style={{ color: 'var(--color-primary)', opacity: '0.4' }} />
                        )}
                      </div>
                      <div>
                        <Link to={`/product/${item.product_id}`} style={{ fontWeight: '700', color: 'var(--color-text)', fontSize: '0.98rem' }}>
                          {item.name}
                        </Link>
                        {item.stock < item.quantity && (
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: '700', marginTop: '4px' }}>
                            Exceeds stock! Max: {item.stock}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px', color: 'var(--color-text)', fontWeight: '500' }}>₹{item.price}</td>
                  <td style={{ padding: '20px' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      border: '1px solid var(--color-border)',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      backgroundColor: '#FFF'
                    }}>
                      <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} style={{ border: 'none', background: 'none', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Minus size={12} />
                      </button>
                      <span style={{ padding: '0 8px', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--color-text)' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} style={{ border: 'none', background: 'none', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Plus size={12} />
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '20px', fontWeight: '800', color: 'var(--color-text)', fontSize: '1.05rem' }}>₹{item.price * item.quantity}</td>
                  <td style={{ padding: '20px', textAlign: 'center' }}>
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      style={{ border: 'none', background: 'none', color: 'var(--color-danger)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', padding: '4px' }}
                      title="Remove Item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="glass-card" style={{ padding: '30px', borderRadius: '16px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
          <h3 style={{ fontSize: '1.3rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '20px', fontWeight: '800', color: 'var(--color-text)' }}>Cart Totals</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '0.95rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>
            <span>Subtotal</span>
            <span style={{ color: 'var(--color-text)', fontWeight: '600' }}>₹{getCartTotal()}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '0.95rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>
            <span>Delivery</span>
            <span style={{ color: 'var(--color-success)', fontWeight: '700' }}>FREE</span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '20px',
            marginBottom: '30px',
            fontSize: '1.3rem',
            fontWeight: '800'
          }}>
            <span>Total</span>
            <span style={{ color: 'var(--color-primary)' }}>₹{getCartTotal()}</span>
          </div>

          <button onClick={handleCheckoutRedirect} className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '8px' }}>
            Proceed to Checkout <ArrowRight size={18} />
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/shop" style={{ fontSize: '0.88rem', color: 'var(--color-primary)', fontWeight: '700' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
