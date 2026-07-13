import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config';
import { CreditCard, ShieldCheck, ArrowLeft, Clock } from 'lucide-react';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const { token, user, showNotification } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const orderId = searchParams.get('order_id') || '';
  const amountParam = searchParams.get('amount') || '';

  const [loadingConfig, setLoadingConfig] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login?redirect=checkout');
      return;
    }

    if (!orderId || !amountParam) {
      showNotification('Missing payment context parameters.', 'error');
      navigate('/shop');
      return;
    }

    const initPaymentConfig = async () => {
      try {
        const paymentRes = await fetch(`${API_BASE_URL}/api/payment/razorpay.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            action: 'create',
            order_id: orderId,
            amount: parseFloat(amountParam)
          })
        });

        if (!paymentRes.ok) {
          const errorText = await paymentRes.text();
          let errMsg = 'Failed to load payment credentials.';
          try {
            const errJson = JSON.parse(errorText);
            errMsg = errJson.message || errMsg;
          } catch (_) {}
          showNotification(errMsg, 'error');
          navigate('/checkout');
          return;
        }

        const data = await paymentRes.json();
        if (data.success) {
          setPaymentData(data);
        } else {
          showNotification('Payment initialization failed.', 'error');
          navigate('/checkout');
        }
      } catch (err) {
        console.error('Payment Init Error:', err);
        showNotification('Failed to initialize payment gateway.', 'error');
        navigate('/checkout');
      } finally {
        setLoadingConfig(false);
      }
    };

    initPaymentConfig();
  }, [token, orderId, amountParam, navigate]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async () => {
    if (!paymentData) return;
    setPaying(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        showNotification('Failed to load Razorpay SDK. Verify connection.', 'error');
        setPaying(false);
        return;
      }

      const isMock = paymentData.razorpay_order_id.startsWith('rzp_order_mock_');
      const activeKey = paymentData.key_id && paymentData.key_id !== 'rzp_test_mock_key_12345'
        ? paymentData.key_id
        : 'rzp_test_SrhFoJk7Ui7OBT'; // Fallback test mode key

      const options = {
        key: activeKey,
        amount: paymentData.amount,
        currency: paymentData.currency || 'INR',
        name: "Mom's Affection",
        description: 'Homemade Food Products Order',
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/api/payment/razorpay.php`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                action: 'verify',
                order_id: orderId,
                razorpay_order_id: response.razorpay_order_id || paymentData.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id || 'pay_mock_' + Math.random().toString(36).substring(7),
                razorpay_signature: response.razorpay_signature || 'sig_mock_fallback'
              })
            });

            if (!verifyRes.ok) {
              showNotification('Payment verification failed on the server.', 'error');
              return;
            }

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              clearCart();
              showNotification('Order placed and payment received successfully!', 'success');
              navigate('/dashboard');
            } else {
              showNotification(verifyData.message || 'Signature verify failed.', 'error');
            }
          } catch (err) {
            console.error(err);
            showNotification('Payment verify request failed.', 'error');
          } finally {
            setPaying(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.mobile || ''
        },
        theme: {
          color: '#009F7F'
        }
      };

      if (!isMock) {
        options.order_id = paymentData.razorpay_order_id;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      showNotification('Payment gateway invocation failed.', 'error');
      setPaying(false);
    }
  };

  if (loadingConfig) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <Clock size={40} className="animate-spin" color="var(--color-primary)" />
          <h2>Preparing Payment Gateway...</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Secure connection being initialized. Please wait.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '40px', position: 'relative' }}>
        <button
          onClick={() => navigate('/checkout')}
          style={{
            position: 'absolute',
            top: '25px',
            left: '25px',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.88rem'
          }}
        >
          <ArrowLeft size={16} /> Back to Checkout
        </button>

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: 'var(--color-primary-light)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
            margin: '0 auto 20px'
          }}>
            <CreditCard size={30} />
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Secure Online Payment</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Mom's Affection Checkout Gateway</p>
        </div>

        <div style={{
          backgroundColor: 'var(--color-bg)',
          borderRadius: '12px',
          padding: '24px',
          margin: '30px 0',
          border: '1px solid var(--color-border)',
          fontSize: '0.95rem',
          display: 'grid',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Order ID:</span>
            <strong>#{orderId.substring(4, 12)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Payment Provider:</span>
            <span>Razorpay Secure Connection</span>
          </div>
          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Total Payable Amount:</span>
            <strong style={{ fontSize: '1.3rem', color: 'var(--color-primary)' }}>₹{amountParam}</strong>
          </div>
        </div>

        <button
          onClick={handlePayNow}
          disabled={paying}
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '1.05rem', gap: '8px' }}
        >
          <CreditCard size={20} />
          {paying ? 'Processing Gateway...' : `Pay Now (₹${amountParam})`}
        </button>

        <div style={{
          marginTop: '25px',
          padding: '16px',
          backgroundColor: 'var(--color-primary-light)',
          borderRadius: '12px',
          border: '1px solid rgba(0, 159, 127, 0.15)',
          display: 'flex',
          gap: '10px',
          fontSize: '0.82rem',
          color: 'var(--color-text)',
          lineHeight: '1.4'
        }}>
          <ShieldCheck size={20} style={{ flexShrink: 0, color: 'var(--color-primary)' }} />
          <div>
            <strong>Secure Transaction Protocol:</strong>
            <p style={{ marginTop: '2px' }}>
              Your transaction is fully encrypted and processed securely by Razorpay. Please do not refresh the page or click back while the payment process is underway.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
