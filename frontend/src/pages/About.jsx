import React from 'react';
import { ChefHat, Flame, ShieldCheck, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="container animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <span style={{
          backgroundColor: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'inline-block',
          marginBottom: '15px'
        }}>
          Our Philosophy
        </span>
        <h1 style={{ fontSize: '3rem', marginBottom: '15px' }}>About MomsAffection</h1>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
          Born from a mother's kitchen, built for every family table. Offering pure, fresh, and preservative-free delicacies.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '50px',
        alignItems: 'center',
        marginBottom: '80px'
      }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: 'var(--color-primary)' }}>Who We Are</h2>
          <p style={{ marginBottom: '20px', color: 'var(--color-text-muted)' }}>
            MomsAffection started with a simple belief: everyone deserves food prepared with the same love, purity, and hygiene as in our own homes. 
            We observed that modern fast food and snacks are loaded with hydrogenated oils, chemical tasting powders, and artificial shelf-stabilizers, which impact health over time.
          </p>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>
            To bring back the healthy snack options of our childhood, we set up our boutique kitchen. Today, we prepare traditional Bengali delicacies, nutritious dry fruits, and seed mixes in small batches using local ingredients and grandmother's signature hand-ground spices.
          </p>
          <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ChefHat color="var(--color-primary)" />
              <strong style={{ fontSize: '0.9rem' }}>Traditional Cooking</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck color="var(--color-primary)" />
              <strong style={{ fontSize: '0.9rem' }}>100% Safety Clearance</strong>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--color-surface)',
          padding: '40px',
          borderRadius: '24px',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          position: 'relative'
        }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Flame color="var(--color-secondary)" fill="var(--color-secondary)" /> Our Kitchen Standards
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <li style={{ display: 'flex', gap: '12px' }}>
              <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>01.</div>
              <div>
                <strong>Triple-Filtered Refined Oil</strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>We never reuse oils. Every batch is cooked in freshly opened, high-grade refined sunflower or mustard oil.</p>
              </div>
            </li>
            <li style={{ display: 'flex', gap: '12px' }}>
              <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>02.</div>
              <div>
                <strong>Hand-Graded Raw Ingredients</strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>From gram flour (besan) to cashew nuts, each grain is inspected by hand to remove dust and damaged pieces.</p>
              </div>
            </li>
            <li style={{ display: 'flex', gap: '12px' }}>
              <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>03.</div>
              <div>
                <strong>Hermetically Sealed Packing</strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Packed in air-tight pouches immediately after cooling to protect natural crispness without chemical gases.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Quote Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #2F221F, #1F1715)',
        color: '#FFF',
        padding: '50px 30px',
        borderRadius: '24px',
        textAlign: 'center',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <Heart size={40} color="var(--color-primary)" fill="var(--color-primary)" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ color: '#FFF', fontSize: '2rem', marginBottom: '20px', fontFamily: 'var(--font-display)' }}>
            "A mother knows what is best for her children. We run our kitchen with the same protective instinct."
          </h2>
          <p style={{ color: 'var(--color-secondary)', fontWeight: '700', fontSize: '1.1rem' }}>— The MomsAffection Kitchen Team</p>
        </div>
      </div>
    </div>
  );
};

export default About;
