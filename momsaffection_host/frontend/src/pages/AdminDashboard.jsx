import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { Shield, LayoutGrid, ClipboardCheck, Users, Plus, Edit, Trash2, X, Upload, Layers, Lock, Image, Star, MessageSquare, Eye, Calendar, Clock, User, Mail, Phone, Menu, Store, LogOut } from 'lucide-react';

const fetch = async (url, options) => {
  let mappedUrl = url;
  if (typeof url === 'string' && url.startsWith('http://localhost:8000')) {
    mappedUrl = url.replace('http://localhost:8000', API_BASE_URL);
  }
  return window.fetch(mappedUrl, options);
};

const AdminDashboard = () => {
  const { token, user, showNotification, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('products'); // 'products', 'orders', 'customers'

  // Master lists state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [adminProfile, setAdminProfile] = useState(null);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminMobile, setAdminMobile] = useState('');
  const [adminAddress, setAdminAddress] = useState('');
  const [adminImageFile, setAdminImageFile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(products.length / productsPerPage));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [products.length, currentPage]);

  // Form toggles
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Category Form fields
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catStatus, setCatStatus] = useState('ACTIVE');

  // Change Password states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');

  // Order Details Modal states
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const activeOrder = orders.find(o => o.ORDER_ID === selectedOrderId);

  // Session countdown timer state
  const [timeLeftStr, setTimeLeftStr] = useState('');

  // Form fields
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodBrand, setProdBrand] = useState('MOMSAFFECTION');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDiscount, setProdDiscount] = useState('0');
  const [prodSellPrice, setProdSellPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodStatus, setProdStatus] = useState('ACTIVE');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImageFile, setProdImageFile] = useState(null);

  const handlePriceChange = (val) => {
    setProdPrice(val);
    const p = parseFloat(val) || 0;
    const d = parseFloat(prodDiscount) || 0;
    setProdSellPrice((p - d).toFixed(2));
  };

  const handleDiscountChange = (val) => {
    setProdDiscount(val);
    const p = parseFloat(prodPrice) || 0;
    const d = parseFloat(val) || 0;
    setProdSellPrice((p - d).toFixed(2));
  };

  const handleSellPriceChange = (val) => {
    setProdSellPrice(val);
    const p = parseFloat(prodPrice) || 0;
    const s = parseFloat(val) || 0;
    setProdDiscount((p - s).toFixed(2));
  };

  useEffect(() => {
    if (!token || user?.role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    loadAdminData();
  }, [token, user, navigate]);

  // Session countdown timer loop
  useEffect(() => {
    const updateTimer = () => {
      const loginTimeStr = localStorage.getItem('ma_admin_login_time');
      if (!loginTimeStr) {
        setTimeLeftStr('');
        return;
      }
      const loginTime = parseInt(loginTimeStr);
      const elapsed = Date.now() - loginTime;
      const remaining = (60 * 60 * 1000) - elapsed;
      if (remaining <= 0) {
        setTimeLeftStr('Expired');
        return;
      }
      
      const totalSeconds = Math.floor(remaining / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      
      const minStr = String(minutes).padStart(2, '0');
      const secStr = String(seconds).padStart(2, '0');
      setTimeLeftStr(`${minStr}:${secStr}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Load products list and metadata configs
      const pRes = await fetch('http://localhost:8000/api/admin/products.php', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const pData = await pRes.json();
      if (pData.success) {
        setProducts(pData.products);
        setBrands(pData.brands);
      }

      // Load categories list directly from categories manager
      const catRes = await fetch('http://localhost:8000/api/admin/categories.php', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const catData = await catRes.json();
      if (catData.success) {
        setCategories(catData.categories);
      }

      // Load orders list
      const oRes = await fetch('http://localhost:8000/api/admin/orders.php', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const oData = await oRes.json();
      if (oData.success) {
        setOrders(oData.orders);
      }

      // Load client directory
      const cRes = await fetch('http://localhost:8000/api/admin/customers.php', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const cData = await cRes.json();
      if (cData.success) {
        setCustomers(cData.customers);
      }

      const profileRes = await fetch('http://localhost:8000/api/admin/profile.php', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      if (profileData.success) {
        setAdminProfile(profileData.profile);
        setAdminName(profileData.profile.ADMIN_NAME || '');
        setAdminEmail(profileData.profile.USER_EMAIL || '');
        setAdminMobile(profileData.profile.USER_MOBILE || '');
        setAdminAddress(profileData.profile.ADMIN_ADDRESS || '');
      }

      // Load all customer reviews
      const revsRes = await fetch('http://localhost:8000/api/admin/reviews.php', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const revsData = await revsRes.json();
      if (revsData.success) {
        setAllReviews(revsData.reviews);
      }

      // Load contact messages
      const msgRes = await fetch('http://localhost:8000/api/admin/messages.php', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const msgData = await msgRes.json();
      if (msgData.success) {
        setContactMessages(msgData.messages);
      }
    } catch (err) {
      console.error(err);
      showNotification("Failed to load admin panel details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMessageDelete = async (contactId) => {
    if (!window.confirm("Are you sure you want to delete this contact message?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/messages.php?contact_id=${contactId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showNotification("Message deleted successfully.", "success");
        // Refresh contact messages list
        const refRes = await fetch('http://localhost:8000/api/admin/messages.php', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const refData = await refRes.json();
        if (refData.success) {
          setContactMessages(refData.messages);
        }
      } else {
        showNotification(data.message || "Failed to delete message.", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error occurred deleting message.", "error");
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this customer review?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/reviews.php?review_id=${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Review deleted successfully.');
        // Refresh reviews list
        const refRes = await fetch('http://localhost:8000/api/admin/reviews.php', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const refData = await refRes.json();
        if (refData.success) {
          setAllReviews(refData.reviews);
        }
      } else {
        showNotification('error', data.message || 'Failed to delete review.');
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Error occurred deleting review.');
    }
  };

  const handleProductEditOpen = (prod) => {
    setEditingProduct(prod);
    setProdName(prod.PRODUCT_NAME);
    setProdCategory(prod.CATEGORY_ID);
    setProdBrand(prod.BRAND_ID);
    setProdPrice(prod.PRODUCT_PRICE);
    setProdDiscount(prod.PRODUCT_DISCOUNT || '0');
    setProdSellPrice(prod.PRODUCT_SELL_PRICE || prod.PRODUCT_PRICE);
    setProdStock(prod.PRODUCT_STOCK);
    setProdStatus(prod.PRODUCT_STATUS);
    setProdDesc(prod.PRODUCT_DESCRIPTION);
    setProdImageFile(null);
    setShowProductModal(true);
  };

  const handleProductAddOpen = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCategory(categories[0]?.CATEGORY_ID || '');
    setProdBrand('MOMSAFFECTION');
    setProdPrice('');
    setProdDiscount('0');
    setProdSellPrice('');
    setProdStock('');
    setProdStatus('ACTIVE');
    setProdDesc('');
    setProdImageFile(null);
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!prodName || !prodCategory || !prodPrice) {
      alert("Product Name, Category, and Price are required.");
      return;
    }

    const formData = new FormData();
    if (editingProduct) {
      formData.append('product_id', editingProduct.PRODUCT_ID);
    }
    formData.append('name', prodName);
    formData.append('category_id', prodCategory);
    formData.append('brand_id', prodBrand);
    formData.append('price', prodPrice);
    formData.append('discount', prodDiscount);
    formData.append('sell_price', prodSellPrice);
    formData.append('stock', prodStock);
    formData.append('status', prodStatus);
    formData.append('description', prodDesc);
    if (prodImageFile) {
      formData.append('image', prodImageFile);
    }

    try {
      const res = await fetch('http://localhost:8000/api/admin/products.php', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message, "success");
        setShowProductModal(false);
        loadAdminData();
      } else {
        alert(data.message || "Failed to save product.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving product.");
    }
  };

  const handleProductDelete = async (prodId) => {
    if (window.confirm("Are you sure you want to remove this product?")) {
      try {
        const res = await fetch(`http://localhost:8000/api/admin/products.php?product_id=${prodId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          showNotification(data.message, "success");
          loadAdminData();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCategoryEditOpen = (cat) => {
    setEditingCategory(cat);
    setCatName(cat.CATEGORY_NAME);
    setCatDesc(cat.CATEGORY_DESCRIPTION || '');
    setCatStatus(cat.CATEGORY_STATUS);
    setShowCategoryModal(true);
  };

  const handleCategoryAddOpen = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDesc('');
    setCatStatus('ACTIVE');
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!catName) {
      alert("Category Name is required.");
      return;
    }
    try {
      const bodyData = {
        name: catName,
        description: catDesc,
        status: catStatus
      };
      if (editingCategory) {
        bodyData.category_id = editingCategory.CATEGORY_ID;
      }
      const res = await fetch('http://localhost:8000/api/admin/categories.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message, "success");
        setShowCategoryModal(false);
        loadAdminData();
      } else {
        alert(data.message || "Failed to save category.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving category.");
    }
  };

  const handleCategoryDelete = async (catId) => {
    if (window.confirm("Are you sure you want to remove this category?")) {
      try {
        const res = await fetch(`http://localhost:8000/api/admin/categories.php?category_id=${catId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          showNotification(data.message, "success");
          loadAdminData();
        } else {
          alert(data.message || "Failed to delete category.");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    const remarks = window.prompt(`Enter delivery update remarks for setting order status to ${newStatus}:`, `Order marked as ${newStatus} by administrator.`);
    if (remarks === null) return;
    
    try {
      const res = await fetch('http://localhost:8000/api/admin/orders.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          order_id: orderId,
          status: newStatus,
          remarks: remarks
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message, "success");
        loadAdminData();
      } else {
        alert(data.message || "Failed to update order status.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCustomerDelete = async (userId) => {
    if (window.confirm("WARNING: Are you sure you want to permanently delete this customer profile? This clears all past order logs and cannot be undone.")) {
      try {
        const res = await fetch(`http://localhost:8000/api/admin/customers.php?user_id=${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          showNotification(data.message, "success");
          loadAdminData();
        } else {
          alert(data.message || "Failed to delete customer.");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOwnPasswordChangeOpen = () => {
    setPasswordTargetUser(null);
    setNewPasswordVal('');
    setShowPasswordModal(true);
  };

  const handleUserPasswordChangeOpen = (cust) => {
    setPasswordTargetUser(cust);
    setNewPasswordVal('');
    setShowPasswordModal(true);
  };

  const handleAdminProfileSubmit = async (e) => {
    e.preventDefault();
    if (!adminName || !adminEmail || !adminMobile) {
      alert('Name, email, and mobile are required.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', adminName);
      formData.append('email', adminEmail);
      formData.append('mobile', adminMobile);
      formData.append('address', adminAddress);
      if (adminImageFile) {
        formData.append('image', adminImageFile);
      }

      // Use updateProfile from AuthContext to sync state globally
      const data = await updateProfile(formData);
      if (data.success) {
        setAdminImageFile(null);
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
      alert('Error saving admin profile.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPasswordVal || newPasswordVal.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    try {
      const res = await fetch('http://localhost:8000/api/admin/change_password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: passwordTargetUser ? passwordTargetUser.USER_ID : '',
          new_password: newPasswordVal
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message, "success");
        setShowPasswordModal(false);
      } else {
        alert(data.message || "Failed to update password.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating password.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalRevenue = orders
    .filter(o => o.PAYMENT_STATUS === 'SUCCESS')
    .reduce((sum, o) => sum + parseFloat(o.TOTAL_AMOUNT), 0);

  return (
    <div className="container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield color="var(--color-primary)" /> Admin Console
          </h1>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Configure kitchen inventory directory, inspect customer order shipments, and regulate users.</p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.85rem', color: 'var(--color-text-muted)', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} color="var(--color-primary)" />
              <strong>Last Login:</strong> {adminProfile?.USER_LAST_LOGIN ? new Date(adminProfile.USER_LAST_LOGIN).toLocaleString() : 'Never'}
            </span>
            <span>|</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} color="var(--color-primary)" />
              <strong>Last Logout:</strong> {adminProfile?.USER_LAST_LOGOUT ? new Date(adminProfile.USER_LAST_LOGOUT).toLocaleString() : 'Never'}
            </span>
            {timeLeftStr && (
              <>
                <span>|</span>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#FFEBEE',
                  color: '#C62828',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <Clock size={12} />
                  Session Ends In: {timeLeftStr}
                </span>
              </>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Admin Info Profile Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingRight: '16px', borderRight: '1px solid var(--color-border)' }}>
            {adminProfile?.ADMIN_IMAGE ? (
              <img 
                src={`${API_BASE_URL}/${adminProfile.ADMIN_IMAGE}`} 
                alt="Admin Avatar" 
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary-light)' }} 
              />
            ) : user?.image ? (
              <img 
                src={`${API_BASE_URL}/${user.image}`} 
                alt="Admin Avatar" 
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary-light)' }} 
              />
            ) : (
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
                fontSize: '1rem',
                fontWeight: '700'
              }}>
                {(adminName || user?.name || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-text)' }}>
                {adminName || user?.name || 'Administrator'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                System Admin
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link 
              to="/shop" 
              className="btn btn-primary"
              style={{ padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}
            >
              <Store size={16} /> View Menu
            </Link>
            <button 
              onClick={handleOwnPasswordChangeOpen}
              className="btn btn-secondary" 
              style={{ padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}
            >
              <Lock size={16} /> Change Password
            </button>
            <button 
              onClick={handleLogout}
              className="btn btn-secondary" 
              style={{ padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Widgets */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--color-primary)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total Products</span>
          <h2 style={{ fontSize: '2rem', marginTop: '5px' }}>{products.length}</h2>
        </div>
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--color-secondary)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total Orders</span>
          <h2 style={{ fontSize: '2rem', marginTop: '5px' }}>{orders.length}</h2>
        </div>
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--color-success)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total Revenue</span>
          <h2 style={{ fontSize: '2rem', marginTop: '5px', color: 'var(--color-success)' }}>₹{totalRevenue}</h2>
        </div>
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--color-accent)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Registered Clients</span>
          <h2 style={{ fontSize: '2rem', marginTop: '5px' }}>{customers.length}</h2>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        {/* Tab Panel Content */}
        <main className="glass-card" style={{ padding: '35px' }}>
          {/* Horizontal Navigation Menu */}
          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '30px',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '16px'
          }}>
            <button
              onClick={() => setActiveTab('products')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                backgroundColor: activeTab === 'products' ? 'var(--color-primary-light)' : 'transparent',
                color: activeTab === 'products' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                transition: 'var(--transition)'
              }}
            >
              <LayoutGrid size={16} /> Kitchen Inventory
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                backgroundColor: activeTab === 'categories' ? 'var(--color-primary-light)' : 'transparent',
                color: activeTab === 'categories' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                transition: 'var(--transition)'
              }}
            >
              <Layers size={16} /> Category
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                backgroundColor: activeTab === 'orders' ? 'var(--color-primary-light)' : 'transparent',
                color: activeTab === 'orders' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                transition: 'var(--transition)'
              }}
            >
              <ClipboardCheck size={16} /> Client Orders
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                backgroundColor: activeTab === 'customers' ? 'var(--color-primary-light)' : 'transparent',
                color: activeTab === 'customers' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                transition: 'var(--transition)'
              }}
            >
              <Users size={16} /> Client Directory
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                backgroundColor: activeTab === 'profile' ? 'var(--color-primary-light)' : 'transparent',
                color: activeTab === 'profile' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                transition: 'var(--transition)'
              }}
            >
              <User size={16} /> My Profile
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                backgroundColor: activeTab === 'reviews' ? 'var(--color-primary-light)' : 'transparent',
                color: activeTab === 'reviews' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                transition: 'var(--transition)'
              }}
            >
              <MessageSquare size={16} /> Customer Reviews
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                backgroundColor: activeTab === 'messages' ? 'var(--color-primary-light)' : 'transparent',
                color: activeTab === 'messages' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                transition: 'var(--transition)'
              }}
            >
              <Mail size={16} /> Contact Messages
            </button>
          </div>
          {loading ? (
            <div>Loading panel contents...</div>
          ) : (
            <>
              {activeTab === 'products' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.6rem' }}>Kitchen Products</h2>
                    <button onClick={handleProductAddOpen} className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '8px' }}>
                      <Plus size={16} /> Add Product
                    </button>
                  </div>

                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th style={{ width: '60px' }}>Image</th>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentProducts.map(prod => (
                          <tr key={prod.PRODUCT_ID}>
                            <td>
                              {prod.PRODUCT_IMAGE ? (
                                <img 
                                  src={`${API_BASE_URL}/${prod.PRODUCT_IMAGE}`} 
                                  alt={prod.PRODUCT_NAME} 
                                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)' }} 
                                  className="product-mini-icon"
                                />
                              ) : (
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '8px',
                                  backgroundColor: 'var(--color-bg)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--color-text-muted)',
                                  border: '1px dashed var(--color-border)'
                                }}>
                                  <Image size={18} />
                                </div>
                              )}
                            </td>
                            <td><strong>{prod.PRODUCT_NAME}</strong></td>
                            <td>{prod.CATEGORY_NAME}</td>
                            <td>
                              {parseFloat(prod.PRODUCT_DISCOUNT) > 0 ? (
                                <div>
                                  <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginRight: '6px' }}>
                                    ₹{prod.PRODUCT_PRICE}
                                  </span>
                                  <strong style={{ color: 'var(--color-success)' }}>
                                    ₹{prod.PRODUCT_SELL_PRICE}
                                  </strong>
                                </div>
                              ) : (
                                <strong>₹{prod.PRODUCT_PRICE}</strong>
                              )}
                            </td>
                            <td>{prod.PRODUCT_STOCK}</td>
                            <td>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                backgroundColor: prod.PRODUCT_STATUS === 'ACTIVE' ? '#E8F5E9' : '#FFEBEE',
                                color: prod.PRODUCT_STATUS === 'ACTIVE' ? '#2E7D32' : '#C62828'
                              }}>
                                {prod.PRODUCT_STATUS}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleProductEditOpen(prod)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-accent)' }} title="Edit Product">
                                  <Edit size={16} />
                                </button>
                                <button onClick={() => handleProductDelete(prod.PRODUCT_ID)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-danger)' }} title="Delete Product">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination controls */}
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '24px' }}>
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', borderRadius: '8px', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                        id="prev-page-btn"
                      >
                        Previous
                      </button>
                      <span style={{ fontWeight: '600', color: 'var(--color-text-muted)', fontSize: '0.95rem' }} id="page-indicator">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', borderRadius: '8px', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                        id="next-page-btn"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 style={{ fontSize: '1.6rem', marginBottom: '24px' }}>Customer Orders</h2>

                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Date</th>
                          <th>Total Amount</th>
                          <th>Status</th>
                          <th>Payment</th>
                          <th>Update Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.ORDER_ID}>
                            <td>
                              <button
                                onClick={() => setSelectedOrderId(order.ORDER_ID)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--color-primary)',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                  padding: 0,
                                  fontSize: 'inherit',
                                  textAlign: 'left'
                                }}
                                title="Click to view order details & products"
                              >
                                #{order.ORDER_ID.substring(4, 12)}
                              </button>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.85rem' }}>
                                <strong>{order.CUSTOMER_NAME}</strong>
                                <p style={{ color: 'var(--color-text-muted)' }}>{order.USER_EMAIL}</p>
                              </div>
                            </td>
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
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', margin: '2px 0 0' }}>
                                  {order.PAYMENT_METHOD === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                                </p>
                              </div>
                            </td>
                            <td>
                              <select
                                className="form-control"
                                style={{ padding: '6px 12px', fontSize: '0.85rem', width: '130px' }}
                                value={order.ORDER_STATUS}
                                onChange={(e) => handleOrderStatusUpdate(order.ORDER_ID, e.target.value)}
                              >
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirm</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancel</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'customers' && (
                <div>
                  <h2 style={{ fontSize: '1.6rem', marginBottom: '24px' }}>Client Directory</h2>

                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Mobile</th>
                          <th>Joined</th>
                          <th>Last Login</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map(cust => (
                          <tr key={cust.CUSTOMER_ID}>
                            <td><strong>{cust.CUSTOMER_NAME}</strong></td>
                            <td>{cust.USER_EMAIL}</td>
                            <td>{cust.USER_MOBILE}</td>
                            <td>{new Date(cust.CUSTOMER_CREATED_AT).toLocaleDateString()}</td>
                            <td>{cust.USER_LAST_LOGIN ? new Date(cust.USER_LAST_LOGIN).toLocaleString() : 'Never'}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => handleUserPasswordChangeOpen(cust)}
                                  className="btn btn-secondary"
                                  style={{ padding: '6px 10px', color: 'var(--color-accent)', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Lock size={12} /> Password
                                </button>
                                <button
                                  onClick={() => handleCustomerDelete(cust.USER_ID)}
                                  className="btn btn-secondary"
                                  style={{ padding: '6px 10px', color: 'var(--color-danger)', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Trash2 size={12} /> Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div>
                  <h2 style={{ fontSize: '1.6rem', marginBottom: '24px' }}>Admin Profile</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
                    <div>
                      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          {adminImageFile ? (
                            <img
                              src={URL.createObjectURL(adminImageFile)}
                              alt="Admin Avatar Preview"
                              style={{ width: '90px', height: '90px', borderRadius: '24px', objectFit: 'cover', border: '2px solid var(--color-primary-light)' }}
                            />
                          ) : adminProfile?.ADMIN_IMAGE ? (
                            <img
                              src={`${API_BASE_URL}/${adminProfile.ADMIN_IMAGE}`}
                              alt="Admin Avatar"
                              style={{ width: '90px', height: '90px', borderRadius: '24px', objectFit: 'cover', border: '2px solid var(--color-primary-light)' }}
                            />
                          ) : (
                            <div style={{ width: '90px', height: '90px', borderRadius: '24px', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontSize: '2rem', fontWeight: '700' }}>
                              {adminName?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h3 style={{ margin: 0 }}>{adminName || 'Admin'}</h3>
                            <p style={{ margin: '8px 0 0', color: 'var(--color-text-muted)' }}>{adminEmail}</p>
                            <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)' }}>{adminMobile}</p>
                          </div>
                        </div>

                        <div style={{ marginTop: '20px', color: 'var(--color-text-muted)' }}>
                          <p><strong>Last Login:</strong> {adminProfile?.USER_LAST_LOGIN ? new Date(adminProfile.USER_LAST_LOGIN).toLocaleString() : 'Never'}</p>
                          <p><strong>Last Logout:</strong> {adminProfile?.USER_LAST_LOGOUT ? new Date(adminProfile.USER_LAST_LOGOUT).toLocaleString() : 'Never'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card" style={{ padding: '24px' }}>
                      <form onSubmit={handleAdminProfileSubmit}>
                        <div className="form-group">
                          <label className="form-label">Full Name*</label>
                          <input
                            type="text"
                            className="form-control"
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Email*</label>
                          <input
                            type="email"
                            className="form-control"
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Mobile*</label>
                          <input
                            type="text"
                            className="form-control"
                            value={adminMobile}
                            onChange={(e) => setAdminMobile(e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Address</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={adminAddress}
                            onChange={(e) => setAdminAddress(e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Profile Photo</label>
                          <input
                            type="file"
                            accept="image/*"
                            className="form-control"
                            onChange={(e) => setAdminImageFile(e.target.files[0])}
                          />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                          Save Profile
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'categories' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.6rem' }}>Product Categories</h2>
                    <button onClick={handleCategoryAddOpen} className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '8px' }}>
                      <Plus size={16} /> Add Category
                    </button>
                  </div>

                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Category ID</th>
                          <th>Name</th>
                          <th>Description</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map(cat => (
                          <tr key={cat.CATEGORY_ID}>
                            <td><code>{cat.CATEGORY_ID}</code></td>
                            <td><strong>{cat.CATEGORY_NAME}</strong></td>
                            <td>{cat.CATEGORY_DESCRIPTION || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No description</span>}</td>
                            <td>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                backgroundColor: cat.CATEGORY_STATUS === 'ACTIVE' ? '#E8F5E9' : '#FFEBEE',
                                color: cat.CATEGORY_STATUS === 'ACTIVE' ? '#2E7D32' : '#C62828'
                              }}>
                                {cat.CATEGORY_STATUS}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleCategoryEditOpen(cat)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-accent)' }} title="Edit Category">
                                  <Edit size={16} />
                                </button>
                                <button onClick={() => handleCategoryDelete(cat.CATEGORY_ID)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-danger)' }} title="Delete Category">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <h2 style={{ fontSize: '1.6rem', marginBottom: '24px' }}>Customer Reviews</h2>

                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th style={{ width: '80px' }}>Product</th>
                          <th>Product Name</th>
                          <th>Customer</th>
                          <th>Rating</th>
                          <th>Review Feedback</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allReviews.map(rev => (
                          <tr key={rev.REVIEW_ID}>
                            <td>
                              {rev.PRODUCT_IMAGE ? (
                                <img 
                                  src={`${API_BASE_URL}/${rev.PRODUCT_IMAGE}`} 
                                  alt={rev.PRODUCT_NAME} 
                                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)' }} 
                                />
                              ) : (
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '8px',
                                  backgroundColor: 'var(--color-bg)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--color-text-muted)',
                                  border: '1px dashed var(--color-border)'
                                }}>
                                  <Image size={18} />
                                </div>
                              )}
                            </td>
                            <td>
                              <strong>
                                <Link to={`/product/${rev.PRODUCT_ID}`} style={{ color: 'var(--color-primary)' }}>
                                  {rev.PRODUCT_NAME}
                                </Link>
                              </strong>
                            </td>
                            <td>{rev.CUSTOMER_NAME}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '2px' }}>
                                {Array.from({ length: rev.RATING }).map((_, i) => (
                                  <Star key={i} size={12} color="var(--color-secondary)" fill="var(--color-secondary)" />
                                ))}
                              </div>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>
                                {rev.REVIEW}
                              </span>
                            </td>
                            <td>{new Date(rev.REVIEW_DATE).toLocaleDateString()}</td>
                            <td>
                              <button
                                onClick={() => handleReviewDelete(rev.REVIEW_ID)}
                                className="btn btn-secondary"
                                style={{ padding: '6px 10px', color: 'var(--color-danger)', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Trash2 size={12} /> Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'messages' && (
                <div>
                  <h2 style={{ fontSize: '1.6rem', marginBottom: '24px' }}>Contact Messages</h2>

                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Mobile</th>
                          <th>Subject</th>
                          <th>Message</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contactMessages.map(msg => (
                          <tr key={msg.CONTACT_ID}>
                            <td><strong>{msg.NAME}</strong></td>
                            <td>{msg.EMAIL}</td>
                            <td>{msg.MOBILE || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>N/A</span>}</td>
                            <td>{msg.SUBJECT || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No Subject</span>}</td>
                            <td style={{ maxWidth: '300px' }}>
                              <span style={{ fontSize: '0.9rem', color: 'var(--color-text)', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                {msg.MESSAGE}
                              </span>
                            </td>
                            <td>{new Date(msg.CREATED_AT).toLocaleString()}</td>
                            <td>
                              <button
                                onClick={() => handleMessageDelete(msg.CONTACT_ID)}
                                className="btn btn-secondary"
                                style={{ padding: '6px 10px', color: 'var(--color-danger)', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Trash2 size={12} /> Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                        {contactMessages.length === 0 && (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '20px' }}>
                              No contact messages received yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Add / Edit Product Modal */}
      {showProductModal && (
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
          <div className="glass-card modal-content-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '15px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.4rem' }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button
                onClick={() => setShowProductModal(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name*</label>
                <input
                  type="text"
                  className="form-control"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Category*</label>
                  <select
                    className="form-control"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.CATEGORY_ID} value={cat.CATEGORY_ID}>{cat.CATEGORY_NAME}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <select
                    className="form-control"
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                  >
                    {brands.map(b => (
                      <option key={b.BRAND_ID} value={b.BRAND_ID}>{b.BRAND_NAME}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Price (INR)*</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={prodPrice}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount (INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={prodDiscount}
                    onChange={(e) => handleDiscountChange(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sell Price (INR)*</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={prodSellPrice}
                    onChange={(e) => handleSellPriceChange(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Product Status</label>
                  <select
                    className="form-control"
                    value={prodStatus}
                    onChange={(e) => setProdStatus(e.target.value)}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="OUT OF STOCK">Out of Stock</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows="3"
                  className="form-control"
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Product Image</label>
                <div style={{
                  border: '2px dashed var(--color-border)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'var(--color-bg)',
                  position: 'relative'
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProdImageFile(e.target.files[0])}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                  <Upload size={24} color="var(--color-text-muted)" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {prodImageFile ? `Selected: ${prodImageFile.name}` : 'Click or Drag image file to upload'}
                  </p>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '12px' }}>
                Save Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {showCategoryModal && (
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
            maxWidth: '500px',
            backgroundColor: '#FFF',
            borderRadius: '20px',
            padding: '30px',
            maxHeight: '90%',
            overflowY: 'auto',
            border: 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '15px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.4rem' }}>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit}>
              <div className="form-group">
                <label className="form-label">Category Name*</label>
                <input
                  type="text"
                  className="form-control"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category Status</label>
                <select
                  className="form-control"
                  value={catStatus}
                  onChange={(e) => setCatStatus(e.target.value)}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows="3"
                  className="form-control"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '12px' }}>
                Save Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
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
            border: 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '15px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.4rem' }}>
                {passwordTargetUser 
                  ? `Change Password for ${passwordTargetUser.CUSTOMER_NAME}` 
                  : 'Change Your Password'}
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              {passwordTargetUser && (
                <div style={{ marginBottom: '15px', padding: '10px 14px', backgroundColor: '#F8F9FA', borderRadius: '8px', fontSize: '0.9rem' }}>
                  <p><strong>Email:</strong> {passwordTargetUser.USER_EMAIL}</p>
                  <p><strong>Mobile:</strong> {passwordTargetUser.USER_MOBILE}</p>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">New Password*</label>
                <input
                  type="password"
                  className="form-control"
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '12px' }}>
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Order Details Modal */}
      {selectedOrderId && activeOrder && (
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
              <h3 style={{ fontSize: '1.4rem' }}>Order Details #{activeOrder.ORDER_ID.substring(4, 12)}</h3>
              <button
                onClick={() => setSelectedOrderId(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Customer, Order & Payment Metadata Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '25px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ fontSize: '1.05rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px', margin: '0 0 5px' }}>Customer Info</h4>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={14} color="var(--color-primary)" />
                  <strong>Name:</strong> {activeOrder.CUSTOMER_NAME}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={14} color="var(--color-primary)" />
                  <strong>Email:</strong> {activeOrder.USER_EMAIL}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={14} color="var(--color-primary)" />
                  <strong>Mobile:</strong> {activeOrder.USER_MOBILE}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ fontSize: '1.05rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px', margin: '0 0 5px' }}>Order Info</h4>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={14} color="var(--color-primary)" />
                  <strong>Date:</strong> {new Date(activeOrder.ORDER_DATE).toLocaleString()}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong>Status:</strong>
                  <select
                    className="form-control"
                    style={{ padding: '4px 10px', fontSize: '0.85rem', width: '130px', margin: 0 }}
                    value={activeOrder.ORDER_STATUS}
                    onChange={(e) => handleOrderStatusUpdate(activeOrder.ORDER_ID, e.target.value)}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirm</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancel</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ fontSize: '1.05rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px', margin: '0 0 5px' }}>Payment Info</h4>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong>Method:</strong> {activeOrder.PAYMENT_METHOD === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong>Status:</strong>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    backgroundColor: activeOrder.PAYMENT_STATUS === 'SUCCESS' ? '#E8F5E9' : (activeOrder.PAYMENT_STATUS === 'FAILED' ? '#FFEBEE' : '#FFF3CD'),
                    color: activeOrder.PAYMENT_STATUS === 'SUCCESS' ? '#2E7D32' : (activeOrder.PAYMENT_STATUS === 'FAILED' ? '#C62828' : '#856404')
                  }}>
                    {activeOrder.PAYMENT_STATUS}
                  </span>
                </span>
                {activeOrder.PAYMENT_ID && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-all' }}>
                    <strong>Txn ID:</strong> <code style={{ fontSize: '0.8rem' }}>{activeOrder.PAYMENT_ID}</code>
                  </span>
                )}
                {activeOrder.PAYMENT_AMOUNT && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong>Amount:</strong> ₹{activeOrder.PAYMENT_AMOUNT}
                  </span>
                )}
                {activeOrder.PAYMENT_DATE && activeOrder.PAYMENT_STATUS === 'SUCCESS' && (
                  <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <strong>Paid On:</strong>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                      {new Date(activeOrder.PAYMENT_DATE).toLocaleString()}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Products Table */}
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '15px' }}>Items Purchased</h4>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeOrder.items && activeOrder.items.map(item => (
                      <tr key={item.ORDER_DETAILS_ID || item.PRODUCT_ID}>
                        <td>
                          {item.PRODUCT_IMAGE ? (
                            <img
                              src={`${API_BASE_URL}/${item.PRODUCT_IMAGE}`}
                              alt={item.PRODUCT_NAME}
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                            />
                          ) : (
                            <div style={{
                              width: '40px',
                              height: '40px',
                              backgroundColor: 'var(--color-surface)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '8px',
                              border: '1px dashed var(--color-border)'
                            }}>
                              <Image size={16} color="var(--color-text-muted)" />
                            </div>
                          )}
                        </td>
                        <td>
                          <strong>{item.PRODUCT_NAME}</strong>
                        </td>
                        <td>{item.QUANTITY}</td>
                        <td>₹{item.PRODUCT_PRICE}</td>
                        <td style={{ fontWeight: '700' }}>₹{item.TOTAL_PRICE}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '20px', marginTop: '10px' }}>
              <div>
                <span style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Total Amount Paid: </span>
                <strong style={{ fontSize: '1.4rem', color: 'var(--color-primary)' }}>₹{activeOrder.TOTAL_AMOUNT}</strong>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="btn btn-secondary"
                style={{ padding: '10px 24px', borderRadius: '8px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
