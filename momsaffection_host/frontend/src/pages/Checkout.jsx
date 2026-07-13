import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { CreditCard, MapPin, ShieldCheck } from 'lucide-react';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { token, user, showNotification } = useAuth();
  const navigate = useNavigate();

  // Address form fields
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [country, setCountry] = useState('India');
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Razorpay'); // 'Razorpay' or 'COD'

  useEffect(() => {
    if (!token) {
      navigate('/login?redirect=checkout');
      return;
    }

    const fetchAddresses = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/customer/address.php`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.addresses.length > 0) {
          setSavedAddresses(data.addresses);
        }
      } catch (err) {
        console.error("Failed to load saved addresses", err);
      }
    };
    fetchAddresses();
  }, [token, navigate]);

  const selectSavedAddress = (addr) => {
    setAddress(addr.FULL_ADDRESS);
    setCity(addr.CITY);
    setState(addr.STATE);
    setPincode(addr.PINCODE);
    setCountry(addr.COUNTRY);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!address || !city || !state || !pincode) {
      alert("Please fill in all shipping details.");
      return;
    }

    setPlacingOrder(true);
    try {
      // 1. Save shipping address if not already registered
      const isSaved = savedAddresses.some(sa => sa.FULL_ADDRESS === address && sa.PINCODE === pincode);
      if (!isSaved) {
        await fetch(`${API_BASE_URL}/api/customer/address.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            full_address: address,
            city: city,
            state: state,
            pincode: pincode,
            country: country
          })
        });
      }

      // 2. Post order creation request to DB
      const orderRes = await fetch(`${API_BASE_URL}/api/orders/place.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          payment_method: paymentMethod
        })
      });

      if (!orderRes.ok) {
        const errorText = await orderRes.text();
        let errMsg = "Failed to create order.";
        try {
          const errJson = JSON.parse(errorText);
          errMsg = errJson.message || errMsg;
        } catch (_) {
          console.error("Order Creation Error Response:", errorText);
        }
        showNotification(errMsg, "error");
        setPlacingOrder(false);
        return;
      }
      const orderData = await orderRes.json();

      if (!orderData.success) {
        showNotification(orderData.message || "Failed to create order.", "error");
        setPlacingOrder(false);
        return;
      }

      if (paymentMethod === 'COD') {
        clearCart();
        showNotification("Order placed successfully! Cash on Delivery selected.", "success");
        navigate('/dashboard');
        setPlacingOrder(false);
        return;
      }

      const orderId = orderData.order_id;
      const amount = orderData.amount;

      // Redirect to the dedicated payment portal page
      showNotification("Order registered. Redirecting to payment gateway...", "info");
      navigate(`/payment?order_id=${orderId}&amount=${amount}`);
      setPlacingOrder(false);
    } catch (err) {
      console.error(err);
      showNotification("Checkout processing error.", "error");
      setPlacingOrder(false);
    }
  };

  const bin2hex = (len) => {
    let result = '';
    const chars = '0123456789abcdef';
    for (let i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2>No Items to Checkout</h2>
        <p style={{ margin: '15px 0 30px', color: 'var(--color-text-muted)' }}>Add items to your cart before checking out.</p>
        <Link to="/shop" className="btn btn-primary">Go to Shop</Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <h1 style={{ fontSize: '2.5rem', marginBottom: '30px' }}>Checkout</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '40px',
        alignItems: 'start'
      }}>
        {/* Shipping Form */}
        <form onSubmit={handleCheckoutSubmit} className="glass-card" style={{ padding: '35px' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={22} color="var(--color-primary)" /> Shipping Address
          </h3>

          {savedAddresses.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <label className="form-label">Select Saved Address</label>
              <div style={{ display: 'grid', gap: '10px', marginTop: '8px' }}>
                {savedAddresses.map(sa => (
                  <div
                    key={sa.ADDRESS_ID}
                    onClick={() => selectSavedAddress(sa)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      backgroundColor: 'var(--color-bg)'
                    }}
                  >
                    <strong>{sa.CITY}, {sa.STATE}</strong> - {sa.PINCODE}
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>{sa.FULL_ADDRESS}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Street / Full Address</label>
            <textarea
              rows="3"
              className="form-control"
              placeholder="House No, Street name, Locality..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            ></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-control"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                className="form-control"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input
                type="text"
                className="form-control"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                className="form-control"
                value={country}
                disabled
              />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div style={{ marginTop: '25px', marginBottom: '25px' }}>
            <label className="form-label" style={{ marginBottom: '12px', display: 'block', fontWeight: '600' }}>Payment Option</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div 
                onClick={() => setPaymentMethod('COD')}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  border: `2px solid ${paymentMethod === 'COD' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  backgroundColor: paymentMethod === 'COD' ? 'var(--color-primary-light)' : 'var(--color-surface)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <strong style={{ fontSize: '0.92rem', color: paymentMethod === 'COD' ? 'var(--color-primary)' : 'inherit' }}>Cash on Delivery</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: '1.3' }}>Pay with cash when order arrives</span>
              </div>
              <div 
                onClick={() => setPaymentMethod('Razorpay')}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  border: `2px solid ${paymentMethod === 'Razorpay' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  backgroundColor: paymentMethod === 'Razorpay' ? 'var(--color-primary-light)' : 'var(--color-surface)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <strong style={{ fontSize: '0.92rem', color: paymentMethod === 'Razorpay' ? 'var(--color-primary)' : 'inherit' }}>Online Delivery</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: '1.3' }}>Pay instantly via UPI, Cards, Netbanking</span>
              </div>
            </div>
          </div>

          {/* Sandbox Warning Notice */}
          {paymentMethod === 'Razorpay' && (
            <div style={{
              marginTop: '25px',
              padding: '16px',
              backgroundColor: 'var(--color-primary-light)',
              borderRadius: '12px',
              border: '1px solid rgba(0, 159, 127, 0.15)',
              display: 'flex',
              alignItems: 'start',
              gap: '12px'
            }}>
              <ShieldCheck size={20} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: '700' }}>Sandbox Checkout Enabled</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                  If no live Razorpay API keys are configured, checkout runs in simulation. Clicking "Place Order" will place a mock order and confirm payment.
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={placingOrder}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '25px', padding: '14px' }}
          >
            <CreditCard size={18} /> {placingOrder ? 'Processing...' : (paymentMethod === 'COD' ? `Confirm COD Order (₹${getCartTotal()})` : `Pay & Place Order (₹${getCartTotal()})`)}
          </button>
        </form>

        {/* Summary Card */}
        <div className="glass-card" style={{ padding: '30px' }}>
          <h3 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '20px' }}>Order Details</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
            {cartItems.map(item => (
              <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  {item.name} <strong>x {item.quantity}</strong>
                </span>
                <span style={{ fontWeight: '600' }}>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '1.2rem',
            fontWeight: '800'
          }}>
            <span>Total Payable</span>
            <span style={{ color: 'var(--color-primary)' }}>₹{getCartTotal()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
