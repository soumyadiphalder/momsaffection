import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config';
import { ShoppingCart, Search, Filter, SlidersHorizontal, UtensilsCrossed, Star } from 'lucide-react';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedCategory) queryParams.append('category_id', selectedCategory);
        if (searchTerm) queryParams.append('search', searchTerm);
        if (sortOrder) queryParams.append('sort', sortOrder);

        const res = await fetch(`${API_BASE_URL}/api/products/list.php?${queryParams.toString()}`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
          setCategories(data.categories);
        }
      } catch (err) {
        console.error("Failed to load products list", err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [selectedCategory, searchTerm, sortOrder]);

  return (
    <div className="container animate-fade-in" style={{ padding: '60px 24px', backgroundColor: 'var(--color-bg)' }}>
      <div style={{ marginBottom: '40px' }}>
        <span style={{
          backgroundColor: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: '700',
          display: 'inline-block',
          marginBottom: '10px'
        }}>
          Fresh Stock Available
        </span>
        <h1 style={{ fontSize: '2.6rem', marginBottom: '10px', fontWeight: '800' }}>Our Kitchen Store</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.02rem' }}>Browse our fresh, homemade selections. Prepared locally and packed under absolute care.</p>
      </div>

      {/* Horizontal Top Filters Bar - Medium Size Compact Layout */}
      <div className="glass-card" style={{ 
        padding: '16px 20px', 
        borderRadius: '12px', 
        border: '1px solid var(--color-border)', 
        backgroundColor: '#FFFFFF',
        marginBottom: '35px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: '16px',
          alignItems: 'center'
        }} className="shop-top-row">
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
              <Search size={16} color="var(--color-primary)" />
            </span>
            <input
              type="text"
              className="form-control"
              style={{ width: '100%', borderRadius: '8px', padding: '10px 12px 10px 36px', fontSize: '0.9rem' }}
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              className="form-control"
              style={{ width: '100%', borderRadius: '8px', cursor: 'pointer', padding: '10px 12px', fontSize: '0.9rem' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.CATEGORY_ID} value={cat.CATEGORY_ID}>{cat.CATEGORY_NAME}</option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <select
              className="form-control"
              style={{ width: '100%', borderRadius: '8px', cursor: 'pointer', padding: '10px 12px', fontSize: '0.9rem' }}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="">Default sorting</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <main>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>
            Gathering fresh foods...
          </div>
        ) : products.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 24px',
            backgroundColor: 'var(--color-surface)',
            borderRadius: '16px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <p style={{ fontSize: '1.15rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
              No products found matching your search.
            </p>
            <button onClick={() => { setSearchTerm(''); setSelectedCategory(''); }} className="btn btn-primary">
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '30px'
          }}>
            {products.map(product => (
              <div key={product.PRODUCT_ID} className="glass-card product-card" style={{
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                transition: 'var(--transition)'
              }}>
                <Link to={`/product/${product.PRODUCT_ID}`}>
                  <div style={{
                    height: '210px',
                    backgroundColor: 'var(--color-surface-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {product.PRODUCT_IMAGE ? (
                      <img
                        src={`${API_BASE_URL}/${product.PRODUCT_IMAGE}`}
                        alt={product.PRODUCT_NAME}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <UtensilsCrossed size={40} style={{ color: 'var(--color-primary)', opacity: '0.4' }} />
                    )}

                    {product.PRODUCT_STATUS === 'OUT OF STOCK' && (
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: 'var(--color-danger)',
                        color: '#FFFFFF',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        boxShadow: 'var(--shadow-sm)',
                        zIndex: 2
                      }}>
                        Out of Stock
                      </span>
                    )}

                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: 'var(--color-primary)',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      {product.CATEGORY_NAME}
                    </span>
                  </div>
                </Link>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', fontWeight: '700' }}>
                    <Link to={`/product/${product.PRODUCT_ID}`} style={{ color: 'var(--color-text)', transition: 'var(--transition)' }} className="product-title-link">{product.PRODUCT_NAME}</Link>
                  </h3>

                  {/* Star Rating Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                    {Array.from({ length: 5 }).map((_, i) => {
                      const starValue = i + 1;
                      const rating = parseFloat(product.PRODUCT_RATING) || 0;
                      const isFilled = rating >= starValue;
                      return (
                        <Star
                          key={i}
                          size={14}
                          color={isFilled ? 'var(--color-secondary)' : 'var(--color-border)'}
                          fill={isFilled ? 'var(--color-secondary)' : 'transparent'}
                        />
                      );
                    })}
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '4px', fontWeight: '600' }}>
                      {parseFloat(product.PRODUCT_RATING) > 0 ? parseFloat(product.PRODUCT_RATING).toFixed(1) : '0.0'}
                    </span>
                  </div>

                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--color-text-muted)',
                    marginBottom: '15px',
                    height: '38px',
                    lineHeight: '1.5',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }} title={product.PRODUCT_DESCRIPTION}>
                    {product.PRODUCT_DESCRIPTION}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {parseFloat(product.PRODUCT_DISCOUNT) > 0 && (
                        <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '1px' }}>
                          ₹{product.PRODUCT_PRICE}
                        </span>
                      )}
                      <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-text)' }}>
                        ₹{parseFloat(product.PRODUCT_DISCOUNT) > 0 ? product.PRODUCT_SELL_PRICE : product.PRODUCT_PRICE}
                      </span>
                    </div>

                    {product.PRODUCT_STATUS === 'OUT OF STOCK' ? (
                      <button
                        disabled
                        className="btn btn-secondary"
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          cursor: 'not-allowed',
                          color: 'var(--color-danger)',
                          borderColor: 'var(--color-danger)',
                          backgroundColor: '#FFEBEE'
                        }}
                      >
                        Out of stock
                      </button>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        className="btn btn-primary"
                        style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem', gap: '4px' }}
                      >
                        <ShoppingCart size={14} /> Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Shop;
