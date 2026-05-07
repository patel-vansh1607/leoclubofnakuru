import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import s from '../Login/Login.module.css'; 

const Signup = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

 const handleStartSignup = async (e) => {
  e.preventDefault();
  setLoading(true);

  // 1. Clean the email to prevent invisible space errors
  const cleanEmail = email.trim().toLowerCase();

  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: true, // Forces it to create an account if it doesn't exist
        data: {
          full_name: name, // Saves the name to metadata
        }
      },
    });

    if (error) {
      console.error("Supabase Error:", error.message);
      alert(`Error: ${error.message}`);
    } else {
      console.log("Success! Data returned:", data);
      // Even if data is an empty object {}, as long as there is no error, the email is queued
      alert("Verification code sent to " + cleanEmail);
      navigate('/signup/verify', { state: { email: cleanEmail } });
    }
  } catch (err) {
    console.error("Connection error:", err);
    alert("Check your internet connection.");
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
            <input className={s.inputField} placeholder="Full Name" onChange={e => setName(e.target.value)} required />
            <div className={s.fieldDivider} />
            <input className={s.inputField} type="email" placeholder="Admin Email" onChange={e => setEmail(e.target.value)} required />
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