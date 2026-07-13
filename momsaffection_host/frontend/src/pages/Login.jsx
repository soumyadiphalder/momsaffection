import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { Lock, Mail, User, Phone, LogIn, UserPlus } from 'lucide-react';

const Login = () => {
  const { login, loginWithGoogle, register, token, user, showNotification } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const [isLoginTab, setIsLoginTab] = useState(true);

  // Login form state
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPass, setRegPass] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMobile, setForgotMobile] = useState('');
  const [forgotOldPassword, setForgotOldPassword] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    if (token && user) {
      if (redirect === 'checkout') {
        navigate('/checkout');
      } else if (user.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [token, user, redirect, navigate]);

  const handleGoogleLoginResponse = async (response) => {
    if (!response.credential) return;
    setSubmitting(true);
    await loginWithGoogle(response.credential);
    setSubmitting(false);
  };

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '674668838593-s6esaop1j5qf4or3jaaqkc0eo6jvi0nu.apps.googleusercontent.com';
    
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleLoginResponse
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: "100%", text: "continue_with" }
        );
      }
    };

    // Check if script already exists
    if (!document.getElementById('google-gsi-client')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = 'google-gsi-client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }
  }, [isLoginTab]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginUser || !loginPass) return;
    setSubmitting(true);
    await login(loginUser, loginPass);
    setSubmitting(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regMobile || !regPass) return;
    setSubmitting(true);
    const res = await register(regName, regEmail, regMobile, regPass);
    setSubmitting(false);
    if (res.success) {
      setIsLoginTab(true);
      setLoginUser(regEmail);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !forgotMobile || !forgotOldPassword || !forgotPassword) return;
    if (forgotPassword.length < 6) {
      alert("New password must be at least 6 characters long.");
      return;
    }
    
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot_password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          mobile: forgotMobile,
          old_password: forgotOldPassword,
          new_password: forgotPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        if (showNotification) {
          showNotification(data.message, "success");
        } else {
          alert(data.message);
        }
        setShowForgotModal(false);
        setForgotEmail('');
        setForgotMobile('');
        setForgotOldPassword('');
        setForgotPassword('');
      } else {
        alert(data.message || "Failed to reset password.");
      }
    } catch (err) {
      console.error(err);
      alert("Error resetting password.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', padding: '60px 24px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '40px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Tab Toggle */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: 'var(--color-bg)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '30px'
        }}>
          <button
            onClick={() => setIsLoginTab(true)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '700',
              fontFamily: 'var(--font-display)',
              backgroundColor: isLoginTab ? 'var(--color-surface)' : 'transparent',
              color: isLoginTab ? 'var(--color-primary)' : 'var(--color-text-muted)',
              boxShadow: isLoginTab ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            Login
          </button>
          <button
            onClick={() => setIsLoginTab(false)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '700',
              fontFamily: 'var(--font-display)',
              backgroundColor: !isLoginTab ? 'var(--color-surface)' : 'transparent',
              color: !isLoginTab ? 'var(--color-primary)' : 'var(--color-text-muted)',
              boxShadow: !isLoginTab ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            Register
          </button>
        </div>

        {/* Google Login Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', width: '100%' }}>
          <div id="google-signin-btn" style={{ width: '100%', minHeight: '40px' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', margin: '16px 0 8px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></div>
            <span style={{ padding: '0 12px', fontWeight: '500' }}>or continue with credentials</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }}></div>
          </div>
        </div>

        {isLoginTab ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>Welcome Back</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>Login to access your dashboard and check order history.</p>
            
            <div className="form-group">
              <label className="form-label">Email or Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ width: '100%', paddingLeft: '40px' }}
                  placeholder="admin@momsaffection.com or customer email"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  required
                />
                <Mail size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    padding: 0,
                    marginBottom: '5px'
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-control"
                  style={{ width: '100%', paddingLeft: '40px' }}
                  placeholder="••••••••"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  required
                />
                <Lock size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '14px' }}>
              <LogIn size={16} /> {submitting ? 'Authenticating...' : 'Login to Account'}
            </button>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>Create Account</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>Join as a customer to order fresh delicacies!</p>
            
            <div className="form-group">
              <label className="form-label">Full Name*</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ width: '100%', paddingLeft: '40px' }}
                  placeholder="Full Name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
                <User size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email ID*</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-control"
                  style={{ width: '100%', paddingLeft: '40px' }}
                  placeholder="name@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
                <Mail size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number*</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ width: '100%', paddingLeft: '40px' }}
                  placeholder="10-digit number"
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value)}
                  required
                />
                <Phone size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password*</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-control"
                  style={{ width: '100%', paddingLeft: '40px' }}
                  placeholder="••••••••"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  required
                />
                <Lock size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '14px' }}>
              <UserPlus size={16} /> {submitting ? 'Registering...' : 'Register Account'}
            </button>
          </form>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card" style={{
            width: '90%',
            maxWidth: '440px',
            backgroundColor: '#FFF',
            borderRadius: '20px',
            padding: '30px',
            border: 'none',
            color: 'var(--color-text)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '15px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)' }}>Reset Password</h3>
              <button
                onClick={() => setShowForgotModal(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>&times;</span>
              </button>
            </div>

            <form onSubmit={handleForgotSubmit}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '15px' }}>
                Only registered customers can reset their password here. Please provide your email and mobile number to verify your identity.
              </p>

              <div className="form-group">
                <label className="form-label">Email ID*</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-control"
                    style={{ width: '100%', paddingLeft: '40px' }}
                    placeholder="registered_email@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                  <Mail size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number*</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    style={{ width: '100%', paddingLeft: '40px' }}
                    placeholder="registered 10-digit number"
                    value={forgotMobile}
                    onChange={(e) => setForgotMobile(e.target.value)}
                    required
                  />
                  <Phone size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Old Password*</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-control"
                    style={{ width: '100%', paddingLeft: '40px' }}
                    placeholder="Enter old password"
                    value={forgotOldPassword}
                    onChange={(e) => setForgotOldPassword(e.target.value)}
                    required
                  />
                  <Lock size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">New Password*</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-control"
                    style={{ width: '100%', paddingLeft: '40px' }}
                    placeholder="Minimum 6 characters"
                    value={forgotPassword}
                    onChange={(e) => setForgotPassword(e.target.value)}
                    required
                  />
                  <Lock size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                </div>
              </div>

              <button type="submit" disabled={forgotLoading} className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '14px' }}>
                {forgotLoading ? 'Verifying...' : 'Reset Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
