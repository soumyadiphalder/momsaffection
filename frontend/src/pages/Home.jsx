import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Award, Heart, CheckCircle2, ShieldCheck, ArrowRight, UtensilsCrossed, Star } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/products/list.php');
        const data = await res.json();
        if (data.success) {
          // Display top 4 seeded products
          setProducts(data.products.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load featured products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  return (
    <div className="animate-fade-in" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Hero Header Banner */}
      <section className="hero" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        minHeight: '650px',
        padding: '80px 24px',
        background: 'linear-gradient(135deg, #F3FBF9 0%, #FAFAFA 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract background decorative blobs */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 159, 127, 0.05) 0%, rgba(255,255,255,0) 70%)',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.04) 0%, rgba(255,255,255,0) 70%)',
          zIndex: 0
        }} />

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '50px',
          alignItems: 'center',
          width: '100%',
          position: 'relative',
          zIndex: 1
        }}>
          <div>
            <span style={{
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              padding: '6px 16px',
              borderRadius: '30px',
              fontSize: '0.85rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'inline-block',
              marginBottom: '20px',
              boxShadow: '0 2px 10px rgba(0, 159, 127, 0.08)'
            }}>
              100% Homemade & Pure
            </span>
            <h1 style={{ 
              fontSize: '3.6rem', 
              marginBottom: '20px', 
              lineHeight: '1.15',
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text)',
              fontWeight: '800'
            }}>
              Taste the <span style={{ color: 'var(--color-primary)' }}>Love</span> in Every Single Bite
            </h1>
            <p style={{ fontSize: '1.12rem', color: 'var(--color-text-muted)', marginBottom: '35px', maxWidth: '540px', lineHeight: '1.6' }}>
              Handcrafted food products made with high-quality, natural ingredients. Made locally using traditional family recipes and sealed with hygiene.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/shop" className="btn btn-primary" style={{ padding: '14px 32px' }}>
                Explore Products <ArrowRight size={18} />
              </Link>
              <Link to="/about" className="btn btn-secondary" style={{ padding: '14px 32px' }}>
                Our Kitchen Story
              </Link>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', width: '100%' }}>
            <div style={{
              width: '100%',
              maxWidth: '380px',
              aspectRatio: '1/1',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 50px rgba(0, 159, 127, 0.15)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                width: '92%',
                height: '92%',
                borderRadius: '50%',
                backgroundColor: '#FFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '30px',
                textAlign: 'center',
                boxShadow: 'inset 0 0 30px rgba(0, 159, 127, 0.06)'
              }}>
                <UtensilsCrossed size={42} style={{ color: 'var(--color-primary)', marginBottom: '12px' }} />
                <h3 style={{ fontSize: '2.1rem', color: 'var(--color-text)', marginBottom: '8px', fontWeight: '800' }}>Mom's Affection</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', fontWeight: '500', lineHeight: '1.4' }}>Homemade Food Products Made with Love</p>
                <div style={{
                  marginTop: '20px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  padding: '6px 16px',
                  borderRadius: '30px',
                  fontSize: '0.8rem',
                  fontWeight: '700'
                }}>
                  Est. 2026
                </div>
              </div>
              
              {/* Overlay badges */}
              <div className="glass-card" style={{ position: 'absolute', top: '15px', left: '-15px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
                <Award color="var(--color-secondary)" fill="var(--color-secondary)" size={18} />
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-text)' }}>Purity Certified</span>
              </div>
              <div className="glass-card" style={{ position: 'absolute', bottom: '25px', right: '-15px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}>
                <Heart color="var(--color-primary)" fill="var(--color-primary)" size={18} style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-text)' }}>100% Handcrafted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section style={{ padding: '80px 24px', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.4rem', marginBottom: '12px', fontWeight: '800' }}>More Than a Store – A Promise of Purity</h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>We select every ingredient with extreme care to maintain perfect safety and premium homemade quality.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            <div className="glass-card" style={{ padding: '40px 30px', textAlign: 'center', borderRadius: '20px', border: '1px solid var(--color-border)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--color-primary)' }}>
                <ShieldCheck size={30} />
              </div>
              <h3 style={{ marginBottom: '14px', fontWeight: '700' }}>Strict Quality Checks</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>Every pack goes through hygiene clearance. We package food in small batches to protect freshness.</p>
            </div>

            <div className="glass-card" style={{ padding: '40px 30px', textAlign: 'center', borderRadius: '20px', border: '1px solid var(--color-border)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--color-primary)' }}>
                <CheckCircle2 size={30} />
              </div>
              <h3 style={{ marginBottom: '14px', fontWeight: '700' }}>No Artificial Preservatives</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>Free from synthetic coloring, additives, or shelf stabilizers. Tastes exactly like home.</p>
            </div>

            <div className="glass-card" style={{ padding: '40px 30px', textAlign: 'center', borderRadius: '20px', border: '1px solid var(--color-border)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--color-primary)' }}>
                <Heart size={30} />
              </div>
              <h3 style={{ marginBottom: '14px', fontWeight: '700' }}>Authentic Recipes</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>Made using hand-ground spices and organic condiments following traditional recipes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '45px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '2.4rem', marginBottom: '8px', fontWeight: '800' }}>Hot-Selling Delicacies</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '1.02rem' }}>Handmade under expert care and sealed under absolute hygiene.</p>
            </div>
            <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontWeight: '700', transition: 'var(--transition)' }} className="hover-underline-link">
              View All Products <ArrowRight size={18} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>
              Loading products...
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
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
                      height: '230px',
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
                        <UtensilsCrossed size={48} style={{ color: 'var(--color-primary)', opacity: '0.4' }} />
                      )}
                      
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        padding: '4px 12px',
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

                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', fontWeight: '700' }}>
                      <Link to={`/product/${product.PRODUCT_ID}`} style={{ color: 'var(--color-text)', transition: 'var(--transition)' }} className="product-title-link">{product.PRODUCT_NAME}</Link>
                    </h3>
                    <p style={{
                      fontSize: '0.88rem',
                      color: 'var(--color-text-muted)',
                      marginBottom: '20px',
                      height: '42px',
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
                          <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: '2px' }}>
                            ₹{product.PRODUCT_PRICE}
                          </span>
                        )}
                        <span style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--color-text)' }}>
                          ₹{parseFloat(product.PRODUCT_DISCOUNT) > 0 ? product.PRODUCT_SELL_PRICE : product.PRODUCT_PRICE}
                        </span>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="btn btn-primary"
                        style={{ padding: '10px 18px', borderRadius: '8px', fontSize: '0.88rem', gap: '6px' }}
                      >
                        <ShoppingCart size={15} /> Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section style={{ padding: '80px 24px', backgroundColor: 'var(--color-primary-light)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.4rem', marginBottom: '12px', fontWeight: '800', color: 'var(--color-text)' }}>What Happy Families Say</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '50px', fontSize: '1.05rem' }}>Real reviews from real home food lovers.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            <div className="glass-card" style={{ padding: '35px', border: 'none', backgroundColor: '#FFFFFF', borderRadius: '20px', textAlign: 'left', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '15px' }}>
                {[1, 2, 3, 4, 5].map(star => <Star key={star} size={15} color="var(--color-secondary)" fill="var(--color-secondary)" />)}
              </div>
              <p style={{ fontStyle: 'italic', marginBottom: '24px', color: 'var(--color-text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                "The Mayuri Chanachur is absolutely outstanding! It has the exact spice kick, is not oily, and tastes just like the traditional recipe my grandmother used to make. Ordered three times already!"
              </p>
              <div>
                <h4 style={{ color: 'var(--color-primary)', fontWeight: '700' }}>Riya Sen</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Kolkata</span>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '35px', border: 'none', backgroundColor: '#FFFFFF', borderRadius: '20px', textAlign: 'left', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '15px' }}>
                {[1, 2, 3, 4, 5].map(star => <Star key={star} size={15} color="var(--color-secondary)" fill="var(--color-secondary)" />)}
              </div>
              <p style={{ fontStyle: 'italic', marginBottom: '24px', color: 'var(--color-text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                "We were looking for pure dry fruits and seeds. MomsAffection Almonds and Makhanas are incredibly clean, crispy, and packaged beautifully. Highly recommended for daily snacks."
              </p>
              <div>
                <h4 style={{ color: 'var(--color-primary)', fontWeight: '700' }}>Dr. Amit Patel</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Mumbai</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
