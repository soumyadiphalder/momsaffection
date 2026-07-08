import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

const Contact = () => {
  const { showNotification } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      alert("Name, Email and Message are required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, mobile, subject, message })
      });
      const data = await res.json();
      if (data.success) {
        setName('');
        setEmail('');
        setMobile('');
        setSubject('');
        setMessage('');
        showNotification(data.message || "Message submitted successfully!", "success");
      } else {
        showNotification(data.message || "Failed to send message.", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Failed to send message: connection lost.", "error");
    } finally {
      setLoading(false);
    }
  };

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
          Get In Touch
        </span>
        <h1 style={{ fontSize: '3rem', marginBottom: '15px' }}>We'd Love to Hear from You</h1>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
          Have questions about our ingredients, ordering, or delivery? Reach out to us today!
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '50px',
        alignItems: 'start'
      }}>
        {/* Contact info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Contact Channels</h2>
          
          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justify: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
              <Phone size={22} />
            </div>
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Phone / Whatsapp</strong>
              <p style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: '4px' }}>+91 98765 43210</p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justify: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
              <Mail size={22} />
            </div>
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Email Support</strong>
              <p style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: '4px' }}>support@momsaffection.com</p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justify: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
              <MapPin size={22} />
            </div>
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Our Kitchen</strong>
              <p style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: '4px' }}>Kolkata, West Bengal, India</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleContactSubmit} className="glass-card" style={{ padding: '35px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageSquare size={24} color="var(--color-primary)" /> Send Us a Message
          </h2>

          <div className="form-group">
            <label className="form-label">Full Name*</label>
            <input
              type="text"
              className="form-control"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Email Address*</label>
              <input
                type="email"
                className="form-control"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="Mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Subject</label>
            <input
              type="text"
              className="form-control"
              placeholder="Topic of inquiry"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message*</label>
            <textarea
              rows="5"
              className="form-control"
              placeholder="Write details of your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
            <Send size={16} /> {loading ? 'Sending Message...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
