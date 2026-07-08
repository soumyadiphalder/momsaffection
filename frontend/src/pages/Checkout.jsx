import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
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

  useEffect(() => {
    if (!token) {
      navigate('/login?redirect=checkout');
      return;
    }

    const fetchAddresses = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/customer/address.php', {
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
        await fetch('http://localhost:8000/api/customer/address.php', {
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
      const orderRes = await fetch('http://localhost:8000/api/orders/place.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        showNotification(orderData.message || "Failed to create order.", "error");
        setPlacingOrder(false);
        return;
      }

      const orderId = orderData.order_id;
      const amount = orderData.amount;

      // 3. Initiate payment order creation on Razorpay backend
      const paymentRes = await fetch('http://localhost:8000/api/payment/razorpay.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'create',
          order_id: orderId,
          amount: amount
        })
      });
      const paymentData = await paymentRes.json();

      if (!paymentData.success) {
        showNotification("Failed to initiate payment gateway.", "error");
        setPlacingOrder(false);
        return;
      }

      const isMock = paymentData.razorpay_order_id.startsWith('rzp_order_mock_');

      if (isMock) {
        // Sandbox checkout simulation
        showNotification("Sandbox Mode: Simulating Razorpay payment...", "info");
        
        setTimeout(async () => {
          try {
            const verifyRes = await fetch('http://localhost:8000/api/payment/razorpay.php', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                action: 'verify',
                order_id: orderId,
                razorpay_order_id: paymentData.razorpay_order_id,
                razorpay_payment_id: 'pay_mock_' + bin2hex(8),
                razorpay_signature: 'sig_mock_1234567890'
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              clearCart();
              showNotification("Order placed successfully!", "success");
              navigate('/dashboard');
            } else {
              showNotification("Verification failed.", "error");
            }
          } catch (err) {
            console.error(err);
            showNotification("Verification connection error.", "error");
          } finally {
            setPlacingOrder(false);
          }
        }, 1500);

      } else {
        // Real Razorpay modal initialization
        const loadScript = () => {
          return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });
        };

        const loaded = await loadScript();
        if (!loaded) {
          alert("Failed to load Razorpay Payment Gateway. Check your internet connection.");
          setPlacingOrder(false);
          return;
        }

        const options = {
          key: paymentData.key_id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          name: "MomsAffection",
          description: "Homemade Food Products Order",
          order_id: paymentData.razorpay_order_id,
          handler: async function (response) {
            try {
              const verifyRes = await fetch('http://localhost:8000/api/payment/razorpay.php', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  action: 'verify',
                  order_id: orderId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                clearCart();
                showNotification("Order placed and payment received!", "success");
                navigate('/dashboard');
              } else {
                showNotification(verifyData.message || "Payment signature verify failed.", "error");
              }
            } catch (err) {
              console.error(err);
              showNotification("Payment verify request failed.", "error");
            } finally {
              setPlacingOrder(false);
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.mobile
          },
          theme: {
            color: "#009F7F"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
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

          {/* Sandbox Warning Notice */}
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

          <button
            type="submit"
            disabled={placingOrder}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '25px', padding: '14px' }}
          >
            <CreditCard size={18} /> {placingOrder ? 'Processing Payment...' : `Place Order (₹${getCartTotal()})`}
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
