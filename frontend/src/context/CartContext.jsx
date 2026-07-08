import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user, token } = useAuth();

  // Retrieve initial cart records (guest localstorage vs user DB syncs)
  useEffect(() => {
    const loadCart = async () => {
      if (user && token) {
        try {
          const res = await fetch('http://localhost:8000/api/cart/manage.php', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setCartItems(data.cart.map(item => ({
              product_id: item.PRODUCT_ID,
              name: item.PRODUCT_NAME,
              price: parseFloat(item.PRICE),
              quantity: parseInt(item.QUANTITY),
              image: item.PRODUCT_IMAGE,
              stock: parseInt(item.PRODUCT_STOCK)
            })));
          }
        } catch (err) {
          console.error("Failed to fetch backend cart elements", err);
        }
      } else {
        const guestCart = localStorage.getItem('ma_guest_cart');
        if (guestCart) {
          setCartItems(JSON.parse(guestCart));
        } else {
          setCartItems([]);
        }
      }
    };
    loadCart();
  }, [user, token]);

  // Sync offline guest cart items to user database upon successful sign in
  useEffect(() => {
    const syncCart = async () => {
      if (user && token && cartItems.length > 0) {
        const guestCart = localStorage.getItem('ma_guest_cart');
        if (guestCart) {
          const items = JSON.parse(guestCart);
          try {
            await fetch('http://localhost:8000/api/cart/manage.php', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ items })
            });
            localStorage.removeItem('ma_guest_cart');
            
            // Refetch unified cart
            const res = await fetch('http://localhost:8000/api/cart/manage.php', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
              setCartItems(data.cart.map(item => ({
                product_id: item.PRODUCT_ID,
                name: item.PRODUCT_NAME,
                price: parseFloat(item.PRICE),
                quantity: parseInt(item.QUANTITY),
                image: item.PRODUCT_IMAGE,
                stock: parseInt(item.PRODUCT_STOCK)
              })));
            }
          } catch (err) {
            console.error("Failed to sync guest cart with server DB", err);
          }
        }
      }
    };
    syncCart();
  }, [user, token]);

  // Persist offline guest cart state locally
  useEffect(() => {
    if (!user) {
      localStorage.setItem('ma_guest_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addToCart = async (product, qty = 1) => {
    const targetProduct = {
      product_id: product.PRODUCT_ID || product.product_id,
      name: product.PRODUCT_NAME || product.name,
      price: parseFloat(product.PRODUCT_SELL_PRICE || product.PRODUCT_PRICE || product.price),
      image: product.PRODUCT_IMAGE || product.image,
      stock: parseInt(product.PRODUCT_STOCK || product.stock)
    };

    if (user && token) {
      try {
        const res = await fetch('http://localhost:8000/api/cart/manage.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            product_id: targetProduct.product_id,
            quantity: qty,
            action: 'add'
          })
        });
        const data = await res.json();
        if (data.success) {
          const getCart = await fetch('http://localhost:8000/api/cart/manage.php', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const cartRes = await getCart.json();
          if (cartRes.success) {
            setCartItems(cartRes.cart.map(item => ({
              product_id: item.PRODUCT_ID,
              name: item.PRODUCT_NAME,
              price: parseFloat(item.PRICE),
              quantity: parseInt(item.QUANTITY),
              image: item.PRODUCT_IMAGE,
              stock: parseInt(item.PRODUCT_STOCK)
            })));
          }
        }
      } catch (err) {
        console.error("Failed to post cart addition to backend", err);
      }
    } else {
      setCartItems(prevItems => {
        const existing = prevItems.find(item => item.product_id === targetProduct.product_id);
        if (existing) {
          const newQty = existing.quantity + qty;
          if (newQty > targetProduct.stock) {
            alert(`Sorry, only ${targetProduct.stock} items are currently available.`);
            return prevItems;
          }
          return prevItems.map(item =>
            item.product_id === targetProduct.product_id
              ? { ...item, quantity: newQty }
              : item
          );
        }
        return [...prevItems, { ...targetProduct, quantity: qty }];
      });
    }
  };

  const updateQuantity = async (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (user && token) {
      try {
        const res = await fetch('http://localhost:8000/api/cart/manage.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            product_id: productId,
            quantity: qty,
            action: 'set'
          })
        });
        const data = await res.json();
        if (data.success) {
          setCartItems(prev =>
            prev.map(item =>
              item.product_id === productId ? { ...item, quantity: qty } : item
            )
          );
        }
      } catch (err) {
        console.error("Failed to update cart count in database", err);
      }
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.product_id === productId ? { ...item, quantity: qty } : item
        )
      );
    }
  };

  const removeFromCart = async (productId) => {
    if (user && token) {
      try {
        const res = await fetch(`http://localhost:8000/api/cart/manage.php?product_id=${productId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setCartItems(prev => prev.filter(item => item.product_id !== productId));
        }
      } catch (err) {
        console.error("Failed to delete cart item from database", err);
      }
    } else {
      setCartItems(prev => prev.filter(item => item.product_id !== productId));
    }
  };

  const clearCart = async () => {
    if (user && token) {
      try {
        const res = await fetch('http://localhost:8000/api/cart/manage.php', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setCartItems([]);
        }
      } catch (err) {
        console.error("Failed to clear cart database rows", err);
      }
    } else {
      setCartItems([]);
    }
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart, getCartCount, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
