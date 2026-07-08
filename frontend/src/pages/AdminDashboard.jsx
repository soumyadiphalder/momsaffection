import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LayoutGrid, ClipboardCheck, Users, Plus, Edit, Trash2, X, Upload, Layers, Lock, Image, Star, MessageSquare } from 'lucide-react';

const AdminDashboard = () => {
  const { token, user, showNotification } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('products'); // 'products', 'orders', 'customers'

  // Master lists state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
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
    } catch (err) {
      console.error(err);
      showNotification("Failed to load admin panel details.", "error");
    } finally {
      setLoading(false);
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

      const res = await fetch('http://localhost:8000/api/admin/profile.php', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message, 'success');
        loadAdminData();
      } else {
        alert(data.message || 'Failed to save admin profile.');
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
          <p style={{ color: 'var(--color-text-muted)' }}>Configure kitchen inventory directory, inspect customer order shipments, and regulate users.</p>
        </div>
        <button 
          onClick={handleOwnPasswordChangeOpen}
          className="btn btn-secondary" 
          style={{ padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}
        >
          <Lock size={16} /> Change Password
        </button>
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

      <div className="dashboard-grid">
        {/* Navigation Sidebar */}
        <aside className="dashboard-sidebar">
          <button
            onClick={() => setActiveTab('products')}
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
              backgroundColor: activeTab === 'products' ? 'var(--color-primary-light)' : 'var(--color-surface)',
              color: activeTab === 'products' ? 'var(--color-primary)' : 'var(--color-text)',
              boxShadow: activeTab === 'products' ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            <LayoutGrid size={18} /> Kitchen Inventory
          </button>

          <button
            onClick={() => setActiveTab('categories')}
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
              backgroundColor: activeTab === 'categories' ? 'var(--color-primary-light)' : 'var(--color-surface)',
              color: activeTab === 'categories' ? 'var(--color-primary)' : 'var(--color-text)',
              boxShadow: activeTab === 'categories' ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            <Layers size={18} /> Categories
          </button>
          
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
            <ClipboardCheck size={18} /> Client Orders
          </button>

          <button
            onClick={() => setActiveTab('customers')}
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
              backgroundColor: activeTab === 'customers' ? 'var(--color-primary-light)' : 'var(--color-surface)',
              color: activeTab === 'customers' ? 'var(--color-primary)' : 'var(--color-text)',
              boxShadow: activeTab === 'customers' ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            <Users size={18} /> Client Directory
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
            <Image size={18} /> My Profile
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
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
              backgroundColor: activeTab === 'reviews' ? 'var(--color-primary-light)' : 'var(--color-surface)',
              color: activeTab === 'reviews' ? 'var(--color-primary)' : 'var(--color-text)',
              boxShadow: activeTab === 'reviews' ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            <MessageSquare size={18} /> Customer Reviews
          </button>
        </aside>

        {/* Tab Panel Content */}
        <main className="glass-card" style={{ padding: '35px' }}>
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
                                  src={`http://localhost:8000/${prod.PRODUCT_IMAGE}`} 
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
                            <td><strong>#{order.ORDER_ID.substring(4, 12)}</strong></td>
                            <td>
                              <div style={{ fontSize: '0.85rem' }}>
                                <strong>{order.CUSTOMER_NAME}</strong>
                                <p style={{ color: 'var(--color-text-muted)' }}>{order.USER_EMAIL}</p>
                              </div>
                            </td>
                            <td>{new Date(order.ORDER_DATE).toLocaleDateString()}</td>
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
                              <span style={{
                                fontWeight: '600',
                                color: order.PAYMENT_STATUS === 'SUCCESS' ? 'var(--color-success)' : 'var(--color-danger)'
                              }}>
                                {order.PAYMENT_STATUS}
                              </span>
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
                          {adminProfile?.ADMIN_IMAGE ? (
                            <img
                              src={`http://localhost:8000/${adminProfile.ADMIN_IMAGE}`}
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
                                  src={`http://localhost:8000/${rev.PRODUCT_IMAGE}`} 
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
    </div>
  );
};

export default AdminDashboard;
