import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Search, Filter, SlidersHorizontal, UtensilsCrossed } from 'lucide-react';

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

        const res = await fetch(`http://localhost:8000/api/products/list.php?${queryParams.toString()}`);
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

      <div className="shop-grid">
        {/* Filters Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Search bar */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)' }}>
              <Search size={16} color="var(--color-primary)" /> Search Products
            </h3>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                style={{ width: '100%', borderRadius: '8px', padding: '12px 14px' }}
                placeholder="Type to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Categories Filter */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)' }}>
              <Filter size={16} color="var(--color-primary)" /> Categories
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.92rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === ''}
                  onChange={() => setSelectedCategory('')}
                  style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px' }}
                />
                <span>All Categories</span>
              </label>
              {categories.map(cat => (
                <label key={cat.CATEGORY_ID} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.92rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat.CATEGORY_ID}
                    onChange={() => setSelectedCategory(cat.CATEGORY_ID)}
                    style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px' }}
                  />
                  <span>{cat.CATEGORY_NAME}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sorting Option */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)' }}>
              <SlidersHorizontal size={16} color="var(--color-primary)" /> Sort By
            </h3>
            <select
              className="form-control"
              style={{ width: '100%', borderRadius: '8px', cursor: 'pointer', padding: '10px 12px' }}
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
        </aside>

        {/* Products Grid */}
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
                          src={`http://localhost:8000/${product.PRODUCT_IMAGE}`} 
                          alt={product.PRODUCT_NAME} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <UtensilsCrossed size={40} style={{ color: 'var(--color-primary)', opacity: '0.4' }} />
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
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', fontWeight: '700' }}>
                      <Link to={`/product/${product.PRODUCT_ID}`} style={{ color: 'var(--color-text)', transition: 'var(--transition)' }} className="product-title-link">{product.PRODUCT_NAME}</Link>
                    </h3>
                    
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
                    }}>
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
                      <button
                        onClick={() => addToCart(product)}
                        className="btn btn-primary"
                        style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem', gap: '4px' }}
                      >
                        <ShoppingCart size={14} /> Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
