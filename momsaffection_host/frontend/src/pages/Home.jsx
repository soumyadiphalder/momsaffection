import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config';
import { ShoppingCart, Award, Heart, CheckCircle2, ShieldCheck, ArrowRight, UtensilsCrossed, Star } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/list.php`);
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

        {/* Floating animated background emojis */}
        <div style={{ position: 'absolute', top: '15%', left: '5%', fontSize: '3rem', opacity: 0.15, animation: 'float-slow 6s ease-in-out infinite', zIndex: 0 }}>🌰</div>
        <div style={{ position: 'absolute', top: '70%', left: '8%', fontSize: '2.5rem', opacity: 0.1, animation: 'roll-slow 8s linear infinite', zIndex: 0 }}>🥜</div>
        <div style={{ position: 'absolute', top: '20%', right: '12%', fontSize: '3.5rem', opacity: 0.15, animation: 'sway-slow 7s ease-in-out infinite', zIndex: 0 }}>🍪</div>
        <div style={{ position: 'absolute', top: '65%', right: '5%', fontSize: '3rem', opacity: 0.12, animation: 'float-slow 5s ease-in-out infinite', zIndex: 0 }}>🥨</div>
        <div style={{ position: 'absolute', bottom: '15%', left: '45%', fontSize: '2.8rem', opacity: 0.1, animation: 'roll-slow 10s linear infinite', zIndex: 0 }}>🍞</div>
        <div style={{ position: 'absolute', top: '8%', left: '38%', fontSize: '2.6rem', opacity: 0.12, animation: 'sway-slow 6s ease-in-out infinite', zIndex: 0 }}>🍿</div>

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
              100% Desi Homemade & Pure
            </span>
            <h1 style={{ 
              fontSize: '3.6rem', 
              marginBottom: '20px', 
              lineHeight: '1.15',
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text)',
              fontWeight: '800'
            }}>
              Taste the <span style={{ color: 'var(--color-primary)' }}>Desi Love</span> in Every Single Bite
            </h1>
            <p style={{ fontSize: '1.12rem', color: 'var(--color-text-muted)', marginBottom: '35px', maxWidth: '540px', lineHeight: '1.6' }}>
              Handcrafted Desi snacks and dry foods made with high-quality, natural ingredients. Made locally using traditional family recipes and sealed with hygiene.
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
              maxWidth: '480px',
              position: 'relative'
            }}>
              {/* Decorative background shape */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                right: '-20px',
                bottom: '-20px',
                borderRadius: '30px',
                background: 'linear-gradient(135deg, var(--color-primary-light) 0%, rgba(245, 158, 11, 0.1) 100%)',
                zIndex: 0
              }} />
              
              <img 
                src="/image/desi_snacks.png" 
                alt="Desi Snacks and Delicacies" 
                style={{ 
                  width: '100%', 
                  borderRadius: '30px', 
                  boxShadow: 'var(--shadow-lg)',
                  border: '8px solid #FFFFFF',
                  position: 'relative',
                  zIndex: 1,
                  display: 'block',
                  transition: 'var(--transition)'
                }} 
              />
              
              {/* Overlay badges */}
              <div className="glass-card" style={{ 
                position: 'absolute', 
                top: '20px', 
                left: '-20px', 
                padding: '12px 20px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                borderRadius: '12px', 
                boxShadow: 'var(--shadow-md)',
                zIndex: 2
              }}>
                <Award color="var(--color-secondary)" fill="var(--color-secondary)" size={18} />
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text)' }}>Purity Certified</span>
              </div>
              <div className="glass-card" style={{ 
                position: 'absolute', 
                bottom: '20px', 
                right: '-20px', 
                padding: '12px 20px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                borderRadius: '12px', 
                boxShadow: 'var(--shadow-md)',
                zIndex: 2
              }}>
                <Heart color="var(--color-primary)" fill="var(--color-primary)" size={18} />
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text)' }}>100% Desi & Handcrafted</span>
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

      {/* Storefront Experience Story Section */}
      <section style={{ 
        padding: '100px 24px', 
        backgroundColor: '#FDFBF7', /* Warm, organic cream background */
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle background decoration */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '80%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.05) 0%, rgba(255,255,255,0) 70%)',
          zIndex: 0
        }} />

        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '60px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ position: 'relative' }}>
            {/* Decorative background border effect */}
            <div style={{
              position: 'absolute',
              top: '-15px',
              left: '-15px',
              right: '15px',
              bottom: '15px',
              border: '2px solid var(--color-primary-light)',
              borderRadius: '24px',
              zIndex: 0
            }} />
            <img 
              src="/image/store_experience.jpg" 
              alt="Mom's Affection Store Experience" 
              style={{ 
                width: '100%', 
                borderRadius: '24px', 
                boxShadow: 'var(--shadow-lg)',
                border: '8px solid #FFFFFF',
                position: 'relative',
                zIndex: 1,
                display: 'block'
              }} 
            />
            {/* Floating badge */}
            <div className="glass-card" style={{
              position: 'absolute',
              bottom: '20px',
              right: '-15px',
              padding: '12px 24px',
              borderRadius: '50px',
              boxShadow: 'var(--shadow-md)',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF'
            }}>
              <CheckCircle2 color="var(--color-success)" size={20} />
              <span style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--color-text)' }}>Freshly Crafted Daily</span>
            </div>
          </div>
          
          <div>
            <span style={{
              color: 'var(--color-primary)',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontSize: '0.9rem',
              display: 'block',
              marginBottom: '15px'
            }}>
              Crafting Pure Delight
            </span>
            <h2 style={{ 
              fontSize: '2.6rem', 
              fontWeight: '800', 
              marginBottom: '20px',
              lineHeight: '1.2',
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text)'
            }}>
              Bringing the Real Taste of <span style={{ color: 'var(--color-primary)' }}>Desi Goodness</span> to Your Home
            </h2>
            <p style={{ 
              fontSize: '1.08rem', 
              color: 'var(--color-text-muted)', 
              lineHeight: '1.7', 
              marginBottom: '20px' 
            }}>
              At Mom's Affection, we are dedicated to preserving the rich heritage of traditional Indian snacks and dry foods. Every pack of Masala Matar, crispy Sev, and wholesome seeds is curated to give you that familiar, comforting home taste.
            </p>
            <p style={{ 
              fontSize: '1.08rem', 
              color: 'var(--color-text-muted)', 
              lineHeight: '1.7', 
              marginBottom: '35px' 
            }}>
              We ensure each batch is handmade using natural ingredients, traditional grinding techniques, and minimal oil, maintaining the highest levels of hygiene and safety.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/about" className="btn btn-primary" style={{ padding: '14px 32px' }}>
                Our Kitchen Story
              </Link>
              <Link to="/shop" className="btn btn-secondary" style={{ padding: '14px 32px' }}>
                Shop All Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Healthy Dry Foods & Family Section */}
      <section style={{ 
        padding: '100px 24px', 
        backgroundColor: '#FFFFFF', 
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '60px',
          alignItems: 'center'
        }}>
          <div>
            <span style={{
              color: 'var(--color-secondary)',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontSize: '0.9rem',
              display: 'block',
              marginBottom: '15px'
            }}>
              Nourishment & Health
            </span>
            <h2 style={{ 
              fontSize: '2.6rem', 
              fontWeight: '800', 
              marginBottom: '20px',
              lineHeight: '1.2',
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text)'
            }}>
              Wholesome Dry Foods for Your <span style={{ color: 'var(--color-secondary)' }}>Little Ones</span>
            </h2>
            <p style={{ 
              fontSize: '1.08rem', 
              color: 'var(--color-text-muted)', 
              lineHeight: '1.7', 
              marginBottom: '20px' 
            }}>
              Give your family the daily boost of energy they deserve. Our handpicked, premium California almonds, cashews, and roasted Makhanas are packed with protein, fiber, and essential nutrients.
            </p>
            <p style={{ 
              fontSize: '1.08rem', 
              color: 'var(--color-text-muted)', 
              lineHeight: '1.7', 
              marginBottom: '35px' 
            }}>
              Cleaned and graded with extreme care under strict hygienic conditions, our dry foods are free from dust, empty shells, or preservatives. The perfect healthy bite for active kids and busy parents.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/shop?category=DRY_FOODS" className="btn btn-primary" style={{ padding: '14px 32px', backgroundColor: 'var(--color-secondary)', borderColor: 'var(--color-secondary)' }}>
                Shop Dry Foods
              </Link>
              <Link to="/shop" className="btn btn-secondary" style={{ padding: '14px 32px' }}>
                Explore All
              </Link>
            </div>
          </div>

          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            {/* Background shape */}
            <div style={{
              position: 'absolute',
              top: '30px',
              left: '30px',
              right: '-10px',
              bottom: '-10px',
              borderRadius: '30px',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, rgba(255,255,255,0) 70%)',
              zIndex: 0
            }} />
            <img 
              src="/image/healthy_kids.jpg" 
              alt="Healthy Kids Eating Almonds" 
              style={{ 
                width: '100%', 
                maxWidth: '420px',
                borderRadius: '30px', 
                boxShadow: 'var(--shadow-lg)',
                border: '8px solid #FFFFFF',
                position: 'relative',
                zIndex: 1,
                display: 'block'
              }} 
            />
            {/* Floating badge */}
            <div className="glass-card" style={{
              position: 'absolute',
              top: '30px',
              left: '-20px',
              padding: '12px 20px',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-md)',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF'
            }}>
              <span style={{ fontWeight: '800', fontSize: '0.85rem', color: 'var(--color-text)' }}>🥜 100% Organic & Raw</span>
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
                          src={`${API_BASE_URL}/${product.PRODUCT_IMAGE}`} 
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
