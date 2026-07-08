import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, MessageSquare, Plus, Minus, Tag, AlertTriangle, UtensilsCrossed } from 'lucide-react';

const Product = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProductDetails = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/products/detail.php?product_id=${id}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.product);
        setReviews(data.reviews);
        setRelated(data.related);
      }
    } catch (err) {
      console.error("Failed to load product details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const handleQtyChange = (val) => {
    if (val < 1) return;
    if (product && val > product.PRODUCT_STOCK) {
      alert(`Only ${product.PRODUCT_STOCK} items are currently available in stock.`);
      return;
    }
    setQty(val);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch('http://localhost:8000/api/products/detail.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: id,
          rating: rating,
          review: reviewText
        })
      });
      const data = await res.json();
      if (data.success) {
        setReviewText('');
        setRating(5);
        fetchProductDetails();
      } else {
        alert(data.message || "Failed to submit review.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '1.2rem', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg)' }}>
        Gathering product detail specs...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 24px', backgroundColor: 'var(--color-bg)' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Product Not Found</h2>
        <p style={{ margin: '15px 0 30px', color: 'var(--color-text-muted)' }}>The product you are looking for does not exist or has been removed.</p>
        <Link to="/shop" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '60px 24px', backgroundColor: 'var(--color-bg)' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '50px',
        marginBottom: '60px'
      }}>
        {/* Product Image Panel */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '420px',
          boxShadow: 'var(--shadow-sm)',
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
            <UtensilsCrossed size={64} style={{ color: 'var(--color-primary)', opacity: '0.4' }} />
          )}
        </div>

        {/* Product Info Panel */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <span style={{
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Tag size={12} /> {product.CATEGORY_NAME}
            </span>
            <span style={{
              backgroundColor: product.PRODUCT_STOCK > 0 ? '#E6F6F2' : '#FEEEC9',
              color: product.PRODUCT_STOCK > 0 ? 'var(--color-primary)' : '#D97706',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '700'
            }}>
              {product.PRODUCT_STOCK > 0 ? `In Stock (${product.PRODUCT_STOCK})` : 'Out of Stock'}
            </span>
          </div>

          <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', fontWeight: '800' }}>{product.PRODUCT_NAME}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '20px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} size={16} color="var(--color-secondary)" fill="var(--color-secondary)" />
            ))}
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginLeft: '8px', fontWeight: '500' }}>
              ({reviews.length} reviews)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '20px' }}>
            <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)' }}>
              ₹{parseFloat(product.PRODUCT_DISCOUNT) > 0 ? product.PRODUCT_SELL_PRICE : product.PRODUCT_PRICE}
            </span>
            {parseFloat(product.PRODUCT_DISCOUNT) > 0 && (
              <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', fontSize: '1.25rem' }}>
                ₹{product.PRODUCT_PRICE}
              </span>
            )}
            {parseFloat(product.PRODUCT_DISCOUNT) > 0 && (
              <span style={{
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '700'
              }}>
                Save ₹{product.PRODUCT_DISCOUNT}!
              </span>
            )}
          </div>

          <p style={{ color: 'var(--color-text-muted)', marginBottom: '30px', fontSize: '0.98rem', lineHeight: '1.6' }}>
            {product.PRODUCT_DESCRIPTION}
          </p>

          {product.PRODUCT_STOCK > 0 ? (
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: 'auto', flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#FFF'
              }}>
                <button onClick={() => handleQtyChange(qty - 1)} style={{ border: 'none', background: 'none', padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Minus size={16} />
                </button>
                <span style={{ padding: '0 16px', fontWeight: 'bold', fontSize: '1rem', minWidth: '40px', textAlign: 'center' }}>{qty}</span>
                <button onClick={() => handleQtyChange(qty + 1)} style={{ border: 'none', background: 'none', padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Plus size={16} />
                </button>
              </div>

              <button onClick={() => addToCart(product, qty)} className="btn btn-primary" style={{ flexGrow: 1, padding: '14px' }}>
                <ShoppingCart size={18} /> Add to Cart
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '16px', backgroundColor: '#FEF3C7', borderRadius: '12px', color: '#92400E' }}>
              <AlertTriangle size={18} />
              <span style={{ fontWeight: '500' }}>Currently out of stock. We will restock shortly!</span>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <section style={{ borderTop: '1px solid var(--color-border)', paddingTop: '50px', marginBottom: '60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px' }}>
          {/* Reviews List */}
          <div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800' }}>
              <MessageSquare size={24} color="var(--color-primary)" /> Customer Reviews
            </h2>

            {reviews.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No reviews yet. Be the first to review this product!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reviews.map(rev => (
                  <div key={rev.REVIEW_ID} className="glass-card" style={{ padding: '20px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <strong style={{ color: 'var(--color-text)' }}>{rev.CUSTOMER_NAME}</strong>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {Array.from({ length: rev.RATING }).map((_, i) => (
                          <Star key={i} size={12} color="var(--color-secondary)" fill="var(--color-secondary)" />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>{rev.REVIEW}</p>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                      {new Date(rev.REVIEW_DATE).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Review Form */}
          <div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '30px', fontWeight: '800' }}>Review This Product</h2>
            {token ? (
              user?.role === 'CUSTOMER' ? (
                <form onSubmit={handleReviewSubmit} className="glass-card" style={{ padding: '30px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                  <div className="form-group">
                    <label className="form-label">Rating</label>
                    <div style={{ display: 'flex', gap: '8px', margin: '8px 0' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                          <Star
                            size={28}
                            color="var(--color-secondary)"
                            fill={star <= rating ? "var(--color-secondary)" : "none"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Review Message</label>
                    <textarea
                      rows="4"
                      className="form-control"
                      placeholder="Write your review feedback..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      required
                      style={{ borderRadius: '8px', padding: '12px 14px' }}
                    ></textarea>
                  </div>

                  <button type="submit" disabled={submittingReview} className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '8px' }}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div style={{ padding: '20px', backgroundColor: 'var(--color-surface-hover)', borderRadius: '12px', color: 'var(--color-text-muted)', fontWeight: '500' }}>
                  Administrators cannot post reviews.
                </div>
              )
            ) : (
              <div style={{ padding: '30px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px', fontSize: '0.95rem' }}>Please login as a customer to write a review.</p>
                <Link to="/login" className="btn btn-secondary" style={{ padding: '10px 24px', borderRadius: '8px' }}>Login Now</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section style={{ borderTop: '1px solid var(--color-border)', paddingTop: '50px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '30px', fontWeight: '800' }}>Related Delicacies</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '30px'
          }}>
            {related.map(prod => (
              <div key={prod.PRODUCT_ID} className="glass-card product-card" style={{ 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: '16px',
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                transition: 'var(--transition)'
              }}>
                <Link to={`/product/${prod.PRODUCT_ID}`}>
                  <div style={{
                    height: '170px',
                    backgroundColor: 'var(--color-surface-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {prod.PRODUCT_IMAGE ? (
                      <img 
                        src={`http://localhost:8000/${prod.PRODUCT_IMAGE}`} 
                        alt={prod.PRODUCT_NAME} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <UtensilsCrossed size={36} style={{ color: 'var(--color-primary)', opacity: '0.4' }} />
                    )}
                  </div>
                </Link>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h4 style={{ fontSize: '0.98rem', marginBottom: '8px', fontWeight: '700' }}>
                    <Link to={`/product/${prod.PRODUCT_ID}`} style={{ color: 'var(--color-text)', transition: 'var(--transition)' }} className="product-title-link">{prod.PRODUCT_NAME}</Link>
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ fontWeight: '800', color: 'var(--color-text)', fontSize: '1.05rem' }}>₹{prod.PRODUCT_PRICE}</span>
                    <button
                      onClick={() => addToCart(prod)}
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', gap: '4px' }}
                    >
                      <ShoppingCart size={13} /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Product;
