import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Helper to show dynamic notifications/alerts
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load user data on startup
  useEffect(() => {
    const savedToken = localStorage.getItem('ma_token');
    const savedUser = localStorage.getItem('ma_user');
    if (savedToken && savedUser) {
      const userObj = JSON.parse(savedUser);
      if (userObj.role === 'ADMIN') {
        const loginTime = localStorage.getItem('ma_admin_login_time');
        if (loginTime && Date.now() - parseInt(loginTime) > 60 * 60 * 1000) {
          // Expired
          localStorage.removeItem('ma_token');
          localStorage.removeItem('ma_user');
          localStorage.removeItem('ma_admin_login_time');
          setToken(null);
          setUser(null);
          setLoading(false);
          return;
        }
      } else {
        const loginTime = localStorage.getItem('ma_customer_login_time');
        if (loginTime && Date.now() - parseInt(loginTime) > 2 * 60 * 60 * 1000) {
          // Expired
          localStorage.removeItem('ma_token');
          localStorage.removeItem('ma_user');
          localStorage.removeItem('ma_customer_login_time');
          setToken(null);
          setUser(null);
          setLoading(false);
          return;
        }
      }
      setToken(savedToken);
      setUser(userObj);
    }
    setLoading(false);
  }, []);

  // Auto-logout admin after 1 hour of session time
  useEffect(() => {
    if (user && user.role === 'ADMIN' && token) {
      const checkAndSchedule = () => {
        const loginTimeStr = localStorage.getItem('ma_admin_login_time');
        if (!loginTimeStr) {
          localStorage.setItem('ma_admin_login_time', Date.now().toString());
          return Date.now();
        }
        return parseInt(loginTimeStr);
      };

      const loginTime = checkAndSchedule();
      const elapsed = Date.now() - loginTime;
      const remaining = (60 * 60 * 1000) - elapsed;

      if (remaining <= 0) {
        showNotification('Admin session expired after 1 hour. Logging out...', 'info');
        logout();
      } else {
        const timer = setTimeout(() => {
          showNotification('Admin session expired. Logging out...', 'info');
          logout();
        }, remaining);
        return () => clearTimeout(timer);
      }
    }
  }, [user, token]);

  // Auto-logout customer after 2 hours of session time
  useEffect(() => {
    if (user && user.role !== 'ADMIN' && token) {
      const checkAndSchedule = () => {
        const loginTimeStr = localStorage.getItem('ma_customer_login_time');
        if (!loginTimeStr) {
          localStorage.setItem('ma_customer_login_time', Date.now().toString());
          return Date.now();
        }
        return parseInt(loginTimeStr);
      };

      const loginTime = checkAndSchedule();
      const elapsed = Date.now() - loginTime;
      const remaining = (2 * 60 * 60 * 1000) - elapsed;

      if (remaining <= 0) {
        showNotification('Customer session expired after 2 hours. Logging out...', 'info');
        logout();
      } else {
        const timer = setTimeout(() => {
          showNotification('Customer session expired. Logging out...', 'info');
          logout();
        }, remaining);
        return () => clearTimeout(timer);
      }
    }
  }, [user, token]);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('ma_token', data.token);
        localStorage.setItem('ma_user', JSON.stringify(data.user));
        if (data.user.role === 'ADMIN') {
          localStorage.setItem('ma_admin_login_time', Date.now().toString());
          localStorage.removeItem('ma_customer_login_time');
        } else {
          localStorage.setItem('ma_customer_login_time', Date.now().toString());
          localStorage.removeItem('ma_admin_login_time');
        }
        showNotification(data.message || 'Login successful!', 'success');
        return data;
      } else {
        showNotification(data.message || 'Login failed.', 'error');
        return data;
      }
    } catch (err) {
      showNotification('Connection to database failed.', 'error');
      return { success: false, message: 'Server connection failed.' };
    }
  };

  const loginWithGoogle = async (credential) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google_login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });
      const data = await response.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('ma_token', data.token);
        localStorage.setItem('ma_user', JSON.stringify(data.user));
        if (data.user.role === 'ADMIN') {
          localStorage.setItem('ma_admin_login_time', Date.now().toString());
          localStorage.removeItem('ma_customer_login_time');
        } else {
          localStorage.setItem('ma_customer_login_time', Date.now().toString());
          localStorage.removeItem('ma_admin_login_time');
        }
        showNotification(data.message || 'Login successful!', 'success');
        return data;
      } else {
        showNotification(data.message || 'Google Login failed.', 'error');
        return data;
      }
    } catch (err) {
      showNotification('Connection to database failed.', 'error');
      return { success: false, message: 'Server connection failed.' };
    }
  };

  const register = async (name, email, mobile, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, mobile, password })
      });
      const data = await response.json();
      if (data.success) {
        showNotification(data.message || 'Registration successful!', 'success');
        return data;
      } else {
        showNotification(data.message || 'Registration failed.', 'error');
        return data;
      }
    } catch (err) {
      showNotification('Connection to server failed.', 'error');
      return { success: false, message: 'Server connection failed.' };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout.php`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      // Ignore logout endpoint errors; continue clearing session locally.
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('ma_token');
    localStorage.removeItem('ma_user');
    localStorage.removeItem('ma_admin_login_time');
    localStorage.removeItem('ma_customer_login_time');
    showNotification('Logged out successfully.', 'info');
  };

  const updateProfile = async (profileData) => {
    try {
      const isFormData = profileData instanceof FormData;
      const endpoint = user?.role === 'ADMIN'
        ? `${API_BASE_URL}/api/admin/profile.php`
        : `${API_BASE_URL}/api/customer/profile.php`;

      const headers = {
        'Authorization': `Bearer ${token}`
      };
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: isFormData ? profileData : JSON.stringify(profileData)
      });
      const data = await response.json();
      if (data.success) {
        const getProfile = await fetch(endpoint, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileRes = await getProfile.json();
        if (profileRes.success) {
          let updatedUser = { ...user };
          if (user?.role === 'ADMIN') {
            updatedUser = {
              ...user,
              name: profileRes.profile.ADMIN_NAME,
              email: profileRes.profile.USER_EMAIL,
              mobile: profileRes.profile.USER_MOBILE,
              address: profileRes.profile.ADMIN_ADDRESS,
              image: profileRes.profile.ADMIN_IMAGE,
              status: profileRes.profile.USER_STATUS,
              last_login: profileRes.profile.USER_LAST_LOGIN,
              last_logout: profileRes.profile.USER_LAST_LOGOUT
            };
          } else {
            updatedUser = {
              ...user,
              name: profileRes.profile.CUSTOMER_NAME,
              email: profileRes.profile.USER_EMAIL,
              mobile: profileRes.profile.USER_MOBILE,
              address: profileRes.profile.CUSTOMER_ADDRESS,
              city: profileRes.profile.CUSTOMER_CITY,
              state: profileRes.profile.CUSTOMER_STATE,
              pincode: profileRes.profile.CUSTOMER_PINCODE,
              gender: profileRes.profile.CUSTOMER_GENDER,
              dob: profileRes.profile.CUSTOMER_DOB,
              image: profileRes.profile.CUSTOMER_IMAGE,
              status: profileRes.profile.USER_STATUS,
              last_login: profileRes.profile.USER_LAST_LOGIN,
              last_logout: profileRes.profile.USER_LAST_LOGOUT
            };
          }
          setUser(updatedUser);
          localStorage.setItem('ma_user', JSON.stringify(updatedUser));
        }
        showNotification('Profile updated successfully!', 'success');
        return data;
      } else {
        showNotification(data.message || 'Profile update failed.', 'error');
        return data;
      }
    } catch (err) {
      showNotification('Profile update failed: connection lost.', 'error');
      return { success: false, message: 'Server error.' };
    }
  };

  const deleteAccount = async (password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/profile.php`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      if (data.success) {
        logout();
        showNotification('Your account has been deleted.', 'success');
        return data;
      } else {
        showNotification(data.message || 'Account deletion failed.', 'error');
        return data;
      }
    } catch (err) {
      showNotification('Account deletion failed: connection lost.', 'error');
      return { success: false, message: 'Server error.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithGoogle, register, logout, updateProfile, deleteAccount, notification, showNotification }}>
      {children}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1100,
          padding: '16px 24px',
          borderRadius: '8px',
          color: '#fff',
          fontWeight: '600',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          backgroundColor: notification.type === 'success' ? '#4E8752' : (notification.type === 'error' ? '#C0392B' : '#D95D39'),
          animation: 'fadeIn 0.3s ease'
        }}>
          <span>{notification.message}</span>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
