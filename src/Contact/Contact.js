import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, faMapMarkerAlt, faPaperPlane, faClock 
} from '@fortawesome/free-solid-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import Swal from 'sweetalert2';
import s from './Contact.module.css';
import Footer from '../Footer/Footer';

const Contact = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    const messageData = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    };

    const { error } = await supabase.from('contact_messages').insert([messageData]);

    if (!error) {
      Swal.fire({
        title: 'Message Sent!',
        text: 'We typically respond within 1 hour.',
        icon: 'success',
        background: '#1a030d',
        color: '#fff',
        confirmButtonColor: '#f1c40f'
      });
      e.target.reset();
    } else {
      Swal.fire({ 
        title: 'Error', 
        text: 'Failed to send message. Please try again.', 
        icon: 'error',
        background: '#1a030d',
        color: '#fff' 
      });
    }
    setLoading(false);
  };

  return (
    <>
    <div className={s.pageWrapper}>
      <header className={s.header}>
        <h1 className={s.title}>GET IN <span className={s.gold}>TOUCH</span></h1>
        <p className={s.subtitle}>Have questions about Season 2? We're here to help.</p>
      </header>

      <div className={s.container}>
        <aside className={s.infoSection}>
          <div className={s.infoCard}>
            <div className={s.iconBox}><FontAwesomeIcon icon={faMapMarkerAlt} /></div>
            <div>
              <h4>Tournament Venue</h4>
              <p>Lions Primary Ground</p>
            </div>
          </div>
          <div className={s.infoCard}>
            <div className={s.iconBox}><FontAwesomeIcon icon={faEnvelope} /></div>
            <div>
              <h4>Email Us</h4>
              <p>nakuruleoclub@gmail.com</p>
            </div>
          </div>
          <div className={s.infoCard}>
            <div className={s.iconBox}><FontAwesomeIcon icon={faClock} /></div>
            <div>
              <h4>Response Time</h4>
              <p>Typically within 1 hour</p>
            </div>
          </div>
          <div className={s.socialGrid}>
            <a href="https://instagram.com/nakuruleoclub" className={s.socialLink} target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
          </div>
        </aside>

        <main className={s.formSection}>
          <form className={s.contactForm} onSubmit={handleSubmit}>
            <div className={s.inputGroup}>
              <input name="name" type="text" placeholder="Your Name" required className={s.input} />
              <input name="email" type="email" placeholder="Email Address" required className={s.input} />
            </div>
            <input name="subject" type="text" placeholder="Subject" className={s.input} />
            <textarea name="message" placeholder="Your Message..." rows="5" className={s.textarea} required></textarea>
            <button type="submit" className={s.submitBtn} disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'} <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </form>
        </main>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default Contact;