import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { User, ClipboardList, Settings, Trash2, Eye, X, Calendar, DollarSign, Clock, MapPin, Download, CreditCard, Zap } from 'lucide-react';

const CustomerDashboard = () => {
  const { user, token, updateProfile, deleteAccount, showNotification } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'profile'
  
  // Orders history state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);

  // Profile Edit fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [pincode, setPincode] = useState(user?.pincode || '');

  const [updating, setUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [timeLeftStr, setTimeLeftStr] = useState('');

  // Customer session countdown timer loop
  useEffect(() => {
    const updateTimer = () => {
      const loginTimeStr = localStorage.getItem('ma_customer_login_time');
      if (!loginTimeStr) {
        setTimeLeftStr('');
        return;
      }
      const loginTime = parseInt(loginTimeStr);
      const elapsed = Date.now() - loginTime;
      const remaining = (2 * 60 * 60 * 1000) - elapsed;
      if (remaining <= 0) {
        setTimeLeftStr('Expired');
        return;
      }
      
      const totalSeconds = Math.floor(remaining / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      const hrStr = String(hours).padStart(2, '0');
      const minStr = String(minutes).padStart(2, '0');
      const secStr = String(seconds).padStart(2, '0');
      setTimeLeftStr(`${hrStr}:${minStr}:${secStr}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTenYearsAgoDate = () => {
    const today = new Date();
    const tenYearsAgo = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
    const yyyy = tenYearsAgo.getFullYear();
    const mm = String(tenYearsAgo.getMonth() + 1).padStart(2, '0');
    const dd = String(tenYearsAgo.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrdersList();
  }, [token, navigate]);

  const fetchOrdersList = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/list.php`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to load customer orders", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const viewOrderDetails = async (orderId) => {
    setLoadingOrderDetail(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/status.php?order_id=${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedOrder(data);
      } else {
        alert(data.message || "Failed to load order details.");
      }
    } catch (err) {
      console.error(err);
      alert("Error loading order logs.");
    } finally {
      setLoadingOrderDetail(false);
    }
  };

  const handleDownloadReceipt = (orderObj, itemsList = null) => {
    const orderId = orderObj.ORDER_ID;
    const orderDate = orderObj.ORDER_DATE;
    const paymentMethod = orderObj.PAYMENT_METHOD;
    const paymentStatus = orderObj.PAYMENT_STATUS;
    const totalAmount = orderObj.TOTAL_AMOUNT;
    const items = itemsList || orderObj.items || [];

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert("Please allow popups to download/print the receipt.");
      return;
    }

    const itemsRows = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.PRODUCT_NAME}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.QUANTITY}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.PRODUCT_PRICE}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">₹${item.TOTAL_PRICE}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <title>Payment Receipt - Order #${orderId.substring(4, 12)}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 40px; line-height: 1.6; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); border-radius: 10px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #009F7F; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 1.8rem; font-weight: bold; color: #009F7F; }
            .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .invoice-details h4 { margin: 0 0 8px 0; color: #009F7F; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background-color: #f9f9f9; padding: 12px 10px; text-align: left; border-bottom: 2px solid #ddd; }
            .total { display: flex; justify-content: flex-end; font-size: 1.2rem; font-weight: bold; border-top: 2px solid #ddd; padding-top: 10px; }
            .footer { text-align: center; margin-top: 40px; font-size: 0.85rem; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; }
            .badge-success { background-color: #E8F5E9; color: #2E7D32; }
            @media print {
              body { margin: 0; }
              .invoice-box { border: none; box-shadow: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div class="logo">
                <img src="${window.location.origin}/image/logo.png" alt="Logo" style="height: 45px; width: auto; object-fit: contain;" />
              </div>
              <div>
                <h2 style="margin: 0; font-size: 1.6rem; color: #333;">Payment Receipt</h2>
                <p style="margin: 5px 0 0 0; font-size: 0.9rem;">Order Reference: <strong>#${orderId.substring(4, 12)}</strong></p>
              </div>
            </div>
            
            <div class="invoice-details">
              <div>
                <h4>Customer Information</h4>
                <p style="margin: 4px 0;"><strong>Name:</strong> ${user?.name || 'Customer'}</p>
                <p style="margin: 4px 0;"><strong>Email:</strong> ${user?.email || ''}</p>
                <p style="margin: 4px 0;"><strong>Mobile:</strong> ${user?.mobile || ''}</p>
              </div>
              <div>
                <h4>Transaction Details</h4>
                <p style="margin: 4px 0;"><strong>Order Date:</strong> ${new Date(orderDate).toLocaleString()}</p>
                <p style="margin: 4px 0;"><strong>Payment Method:</strong> ${paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}</p>
                <p style="margin: 4px 0;"><strong>Payment Status:</strong> <span class="badge badge-success">${paymentStatus}</span></p>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th style="width: 50%;">Product Details</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>
            
            <div class="total">
              <div>
                Total Paid Amount: <span style="color: #009F7F; margin-left: 10px;">₹${totalAmount}</span>
              </div>
            </div>
            
            <div class="footer">
              <p>Thank you for choosing Mom's Affection! Handcrafted Homemade Delights Made with Love.</p>
              <p>&copy; ${new Date().getFullYear()} MomsAffection. All rights reserved.</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (dob) {
      const today = new Date();
      const birthDate = new Date(dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 10) {
        showNotification("Customers under 10 years of age are not allowed.", "error");
        return;
      }
    }
    setUpdating(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('mobile', mobile);
    formData.append('gender', gender);
    formData.append('dob', dob);
    formData.append('address', address);
    formData.append('city', city);
    formData.append('state', state);
    formData.append('pincode', pincode);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    await updateProfile(formData);
    setUpdating(false);
    setImageFile(null);
  };

  const handleDeleteProfile = () => {
    setDeletePassword('');
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      alert("Password is required.");
      return;
    }
    
    setDeleting(true);
    try {
      const res = await deleteAccount(deletePassword);
      if (res.success) {
        setShowDeleteModal(false);
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during account deletion.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', marginBottom: '40px', borderBottom: '1px solid var(--color-border)', paddingBottom: '25px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {user?.image ? (
            <img 
              src={`${API_BASE_URL}/${user.image}`} 
              alt="Profile Avatar" 
              style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary-light)' }} 
            />
          ) : (
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              fontSize: '1.5rem',
              fontWeight: '700'
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>My Dashboard</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', margin: 0 }}>
              Welcome back, <strong>{user?.name}</strong>. Track your order shipments and manage profile information.
            </p>
          </div>
        </div>
        {timeLeftStr && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFEBEE',
            color: '#C62828',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '700',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid rgba(198, 40, 40, 0.1)',
            whiteSpace: 'nowrap'
          }}>
            <Clock size={16} />
            <span>Session Ends In: <strong>{timeLeftStr}</strong></span>
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        {/* Sidebar tabs */}
        <aside className="dashboard-sidebar">
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 20px',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              textAlign: 'left',
              width: '100%',
              backgroundColor: activeTab === 'orders' ? 'var(--color-primary-light)' : 'var(--color-surface)',
              color: activeTab === 'orders' ? 'var(--color-primary)' : 'var(--color-text)',
              boxShadow: activeTab === 'orders' ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            <ClipboardList size={18} /> Order History
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 20px',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              textAlign: 'left',
              width: '100%',
              backgroundColor: activeTab === 'profile' ? 'var(--color-primary-light)' : 'var(--color-surface)',
              color: activeTab === 'profile' ? 'var(--color-primary)' : 'var(--color-text)',
              boxShadow: activeTab === 'profile' ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            <User size={18} /> Manage Profile
          </button>

        </aside>

        {/* Tab Content Panel */}
        <main className="glass-card" style={{ padding: '35px' }}>
          
          {activeTab === 'orders' && (
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '24px' }}>Order History</h2>
              
              {loadingOrders ? (
                <div>Loading orders...</div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
                  <p>You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.ORDER_ID}>
                          <td><strong>#{order.ORDER_ID.substring(4, 12)}</strong></td>
                          <td>{new Date(order.ORDER_DATE).toLocaleString()}</td>
                          <td style={{ fontWeight: '700' }}>₹{order.TOTAL_AMOUNT}</td>
                          <td>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              backgroundColor: order.ORDER_STATUS === 'DELIVERED' ? '#E8F5E9' : (order.ORDER_STATUS === 'CANCELLED' ? '#FFEBEE' : '#FFF3CD'),
                              color: order.ORDER_STATUS === 'DELIVERED' ? '#2E7D32' : (order.ORDER_STATUS === 'CANCELLED' ? '#C62828' : '#856404')
                            }}>
                              {order.ORDER_STATUS}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.85rem' }}>
                              <span style={{
                                fontWeight: '600',
                                color: order.PAYMENT_STATUS === 'SUCCESS' ? 'var(--color-success)' : 'var(--color-danger)'
                              }}>
                                {order.PAYMENT_STATUS}
                              </span>
                              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', margin: '2px 0 0' }}>
                                {order.PAYMENT_METHOD === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                              </p>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => viewOrderDetails(order.ORDER_ID)}
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Eye size={12} /> Track
                              </button>
                              {order.PAYMENT_STATUS !== 'SUCCESS' && order.ORDER_STATUS !== 'CANCELLED' && order.ORDER_STATUS !== 'DELIVERED' && (
                                <button
                                  onClick={() => navigate(`/payment?order_id=${order.ORDER_ID}&amount=${order.TOTAL_AMOUNT}`)}
                                  className="btn btn-primary"
                                  style={{ 
                                    padding: '6px 12px', 
                                    fontSize: '0.8rem', 
                                    borderRadius: '6px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '4px',
                                    fontWeight: '600',
                                    animation: 'pulse 2s infinite'
                                  }}
                                  title={order.PAYMENT_METHOD === 'COD' ? "Pay online now for fast delivery" : "Retry your online payment"}
                                >
                                  <CreditCard size={12} /> {order.PAYMENT_METHOD === 'COD' ? 'Pay Now (Fast Delivery)' : 'Pay Now'}
                                </button>
                              )}
                              {order.PAYMENT_STATUS === 'SUCCESS' && (
                                <button
                                  onClick={() => handleDownloadReceipt(order)}
                                  className="btn btn-primary"
                                  style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  title="Download / Print Payment Receipt"
                                >
                                  <Download size={12} /> Receipt
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '24px' }}>Edit Profile</h2>

              {/* Profile Picture Uploader */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                marginBottom: '30px',
                padding: '20px',
                backgroundColor: '#F9FAFB',
                borderRadius: '16px',
                border: '1px solid var(--color-border)'
              }}>
                <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                  {imageFile ? (
                    <img 
                      src={URL.createObjectURL(imageFile)} 
                      alt="Profile preview" 
                      style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-primary-light)' }} 
                    />
                  ) : user?.image ? (
                    <img 
                      src={`${API_BASE_URL}/${user.image}`} 
                      alt="Profile" 
                      style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-primary-light)' }} 
                    />
                  ) : (
                    <div style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-primary)',
                      fontSize: '2rem',
                      fontWeight: '700',
                      border: '3px solid var(--color-primary-light)'
                    }}>
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '15px' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-text)' }}>
                      {user?.name || 'Customer'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#2E7D32',
                          display: 'inline-block'
                        }}></span>
                        <strong style={{ color: '#2E7D32' }}>{user?.status || 'ACTIVE'}</strong>
                      </span>
                      {user?.last_login && (
                        <span style={{ color: 'var(--color-text-muted)' }}>
                          Last Login: {new Date(user.last_login).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <label className="btn btn-secondary" style={{ 
                      padding: '8px 16px', 
                      fontSize: '0.85rem', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      display: 'inline-block',
                      margin: 0
                    }}>
                      Choose Photo
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setImageFile(e.target.files[0]);
                          }
                        }}
                        style={{ display: 'none' }} 
                      />
                    </label>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      JPG, JPEG or PNG. Max 2MB.
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name*</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address*</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Mobile Number*</label>
                  <input
                    type="text"
                    className="form-control"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-control"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ width: '50%' }}>
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-control"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  max={getTenYearsAgoDate()}
                />
              </div>

              <h3 style={{ fontSize: '1.25rem', borderTop: '1px solid var(--color-border)', paddingTop: '25px', marginTop: '25px', marginBottom: '15px' }}>Default Delivery Address</h3>
              
              <div className="form-group">
                <label className="form-label">Street / Full Address</label>
                <textarea
                  rows="3"
                  className="form-control"
                  placeholder="Address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                ></textarea>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-control"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    className="form-control"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="btn btn-primary"
                style={{ marginTop: '20px', padding: '12px 30px' }}
              >
                {updating ? 'Updating...' : 'Save Profile Details'}
              </button>

              {/* Danger Zone */}
              <div style={{
                borderTop: '1px dashed #FCA5A5',
                marginTop: '45px',
                paddingTop: '30px'
              }}>
                <h4 style={{ color: 'var(--color-danger)', fontSize: '1.1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Trash2 size={18} /> Danger Zone
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '15px' }}>
                  Permanently remove your account and all associated order logs, reviews, and profile data from our servers.
                </p>
                <button
                  type="button"
                  onClick={handleDeleteProfile}
                  className="btn btn-danger"
                  style={{ padding: '10px 20px', fontSize: '0.88rem', borderRadius: '8px' }}
                >
                  Delete Account
                </button>
              </div>
            </form>
          )}
        </main>
      </div>

      {/* Track Details Modal */}
      {selectedOrder && (
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
            maxWidth: '650px',
            backgroundColor: '#FFF',
            borderRadius: '20px',
            padding: '30px',
            maxHeight: '90%',
            overflowY: 'auto',
            border: 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '15px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.4rem' }}>Track Order #{selectedOrder.order.ORDER_ID.substring(4, 12)}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="var(--color-primary)" /> 
                  <strong>Order Date:</strong> {new Date(selectedOrder.order.ORDER_DATE).toLocaleString()}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={14} color="var(--color-primary)" />
                  <strong>Total:</strong> ₹{selectedOrder.order.TOTAL_AMOUNT}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} color="var(--color-primary)" />
                  <strong>Status:</strong> {selectedOrder.order.ORDER_STATUS}
                </span>
              </div>
              <div>
                <span style={{ display: 'flex', alignItems: 'start', gap: '6px' }}>
                  <MapPin size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Shipping Details:</strong>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      {user.address || address || "No address set"}, {user.city || city}, {user.state || state} - {user.pincode || pincode}
                    </p>
                  </div>
                </span>
              </div>
            </div>

            {selectedOrder.payment?.PAYMENT_STATUS !== 'SUCCESS' && selectedOrder.order.ORDER_STATUS !== 'CANCELLED' && selectedOrder.order.ORDER_STATUS !== 'DELIVERED' && (
              <div style={{
                backgroundColor: 'var(--color-primary-light)',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '25px',
                border: '1px solid rgba(0, 159, 127, 0.15)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Zap size={22} color="var(--color-primary)" style={{ flexShrink: 0, animation: 'pulse 1.5s infinite' }} />
                  <div>
                    <strong style={{ color: 'var(--color-primary)', fontSize: '0.92rem', display: 'block' }}>
                      {selectedOrder.payment?.PAYMENT_METHOD === 'COD' ? 'Pay Online for Fast Delivery!' : 'Finish Online Payment!'}
                    </strong>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '2px', display: 'block', lineHeight: '1.4' }}>
                      {selectedOrder.payment?.PAYMENT_METHOD === 'COD' 
                        ? 'Convert your Cash on Delivery to an online payment now to prioritize and expedite delivery.' 
                        : 'Complete your online payment now to confirm your order details and speed up shipping.'
                      }
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/payment?order_id=${selectedOrder.order.ORDER_ID}&amount=${selectedOrder.order.TOTAL_AMOUNT}`)}
                  className="btn btn-primary"
                  style={{ 
                    padding: '8px 16px', 
                    fontSize: '0.85rem', 
                    borderRadius: '8px', 
                    whiteSpace: 'nowrap', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    fontWeight: '600'
                  }}
                >
                  <CreditCard size={14} /> Pay Now
                </button>
              </div>
            )}

            {/* Status logs */}
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '15px' }}>Shipment Updates</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', borderLeft: '2px solid var(--color-border)', paddingLeft: '20px', marginLeft: '10px' }}>
                {selectedOrder.status_history.map((hist, i) => (
                  <div key={hist.STATUS_ID} style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '-26px',
                      top: '4px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: i === selectedOrder.status_history.length - 1 ? 'var(--color-primary)' : 'var(--color-accent)'
                    }}></div>
                    <strong style={{ fontSize: '0.9rem' }}>{hist.STATUS_NAME}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {new Date(hist.STATUS_DATE).toLocaleString()}
                    </span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>{hist.REMARKS}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Item list */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4 style={{ fontSize: '1.05rem', margin: 0 }}>Items Purchased</h4>
                {selectedOrder.payment?.PAYMENT_STATUS === 'SUCCESS' && (
                  <button
                    onClick={() => handleDownloadReceipt(selectedOrder.order, selectedOrder.items)}
                    className="btn btn-primary"
                    style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={14} /> Download Receipt
                  </button>
                )}
              </div>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map(item => (
                      <tr key={item.ORDER_DETAILS_ID}>
                        <td>{item.PRODUCT_NAME}</td>
                        <td>{item.QUANTITY}</td>
                        <td>₹{item.PRODUCT_PRICE}</td>
                        <td style={{ fontWeight: '700' }}>₹{item.TOTAL_PRICE}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Profile Confirmation Modal */}
      {showDeleteModal && (
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
            maxWidth: '450px',
            backgroundColor: '#FFF',
            borderRadius: '20px',
            padding: '30px',
            border: 'none',
            color: 'var(--color-text)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '15px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', color: 'var(--color-danger)' }}>Delete Account</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleConfirmDelete}>
              <div style={{
                padding: '12px',
                backgroundColor: '#FEEEC9',
                border: '1px solid #F59E0B',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#D97706',
                marginBottom: '20px',
                fontWeight: '500',
                lineHeight: '1.4'
              }}>
                <strong>Warning:</strong> This will permanently delete all order histories, addresses, and details. This action is irreversible.
              </div>

              <div className="form-group">
                <label className="form-label">Enter Login Password*</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="btn btn-danger"
                  style={{ flex: 1, padding: '12px' }}
                >
                  {deleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
