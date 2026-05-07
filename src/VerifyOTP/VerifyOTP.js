import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import s from '../Login/Login.module.css';

const VerifyOTP = () => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const { state } = useLocation();
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email: state?.email,
      token: token,
      type: 'signup',
    });

    if (error) {
      alert("Invalid or Expired Code");
    } else {
      navigate('/signup/password');
    }
    setLoading(false);
  };

  return (
    <div className={s.viewportWrapper}>
      <div className={s.loginCard}>
        <h1 className={s.loginTitle}>Verification</h1>
        <p className={s.loginSubtitle}>Step 2: Enter 6-Digit Code</p>
        <form onSubmit={handleVerify} className={s.unifiedFormContainer}>
          <div className={s.inputBlock}>
            <input className={s.inputField} placeholder="000000" onChange={e => setToken(e.target.value)} required />
          </div>
          <button className={s.submitBtn}>VERIFY IDENTITY</button>
        </form>
      </div>
    </div>
  );
};
export default VerifyOTP;