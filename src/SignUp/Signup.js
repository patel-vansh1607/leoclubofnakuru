import React, { useEffect, useState } from 'react'; // Added useEffect
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import emailjs from '@emailjs/browser';
import s from '../Login/Login.module.css'; 

const Signup = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Initialize EmailJS immediately on mount to speed up the connection
  useEffect(() => {
    emailjs.init("OFZ1U63BcVMFtqezx");
  }, []);

  const handleStartSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      // PROMISE.ALL runs both at once - cuts wait time in half
      await Promise.all([
        // 1. Send via EmailJS
        emailjs.send(
          'service_fphi8xf', 
          'template_6ao8g8f', 
          {
            user_name: name,
            user_email: cleanEmail,
            otp_code: generatedOtp,
          }
        ),
        // 2. Register in Supabase (we don't 'await' this strictly to speed up UI)
        supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            shouldCreateUser: true,
            data: { full_name: name }
          },
        })
      ]);

      console.log("Protocol Success. Code:", generatedOtp);
      
      // Navigate immediately
      navigate('/signup/verify', { 
        state: { 
          email: cleanEmail, 
          manualOtp: generatedOtp 
        } 
      });

    } catch (err) {
      console.error("Critical Protocol Failure:", err);
      // If it takes too long, check if your EmailJS Service is "Active"
      alert("System Timeout. Verify connection or EmailJS Service status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.viewportWrapper}>
      <div className={s.loginCard}>
        <h1 className={s.loginTitle}>Identification</h1>
        <p className={s.loginSubtitle}>Step 1: Personnel Details</p>
        <form onSubmit={handleStartSignup} className={s.unifiedFormContainer}>
          <div className={s.inputBlock}>
            <input 
              className={s.inputField} 
              placeholder="Full Name" 
              onChange={e => setName(e.target.value)} 
              required 
            />
            <div className={s.fieldDivider} />
            <input 
              className={s.inputField} 
              type="email" 
              placeholder="Admin Email" 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <button className={s.submitBtn} disabled={loading}>
            {loading ? <div className={s.loader} /> : "SEND VERIFICATION CODE"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;