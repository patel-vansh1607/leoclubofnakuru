import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import s from '../Login/Login.module.css';

const VerifyOTP = () => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const { state } = useLocation();
  const navigate = useNavigate();

  // Retrieve the email and the code we sent via EmailJS
  const email = state?.email;
  const manualOtp = state?.manualOtp;

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Instead of calling Supabase, we check the code locally
    if (token.trim() === manualOtp?.toString()) {
      console.log("Identity Verified via Local Protocol");
      // Pass the email forward so the password screen knows which user to update
      navigate('/signup/password', { state: { email: email } });
    } else {
      alert("INVALID OR EXPIRED CLEARANCE CODE");
      console.error("Verification mismatch.");
    }
    
    setLoading(false);
  };

  return (
    <div className={s.viewportWrapper}>
      <div className={s.loginCard}>
        <h1 className={s.loginTitle}>Verification</h1>
        <p className={s.loginSubtitle}>Step 2: Enter 6-Digit Code</p>
        <p style={{ color: '#666', fontSize: '0.8rem', textAlign: 'center', marginBottom: '20px' }}>
          Code sent to: {email}
        </p>
        <form onSubmit={handleVerify} className={s.unifiedFormContainer}>
          <div className={s.inputBlock}>
            <input 
              className={s.inputField} 
              placeholder="000000" 
              maxLength="6"
              value={token}
              onChange={e => setToken(e.target.value)} 
              required 
            />
          </div>
          <button className={s.submitBtn} disabled={loading}>
            {loading ? "CHECKING..." : "VERIFY IDENTITY"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;