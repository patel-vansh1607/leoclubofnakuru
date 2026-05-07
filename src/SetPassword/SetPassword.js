import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Eye, EyeOff } from 'lucide-react'; // Standard icons
import s from '../Login/Login.module.css';

const SetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleFinalize = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    // Update the password
    const { error } = await supabase.auth.updateUser({
      password: password 
    });

    if (error) {
      alert(`Security Error: ${error.message}`);
    } else {
      await supabase.auth.signOut(); 
      alert("Account Secured! Awaiting Master Admin approval.");
      navigate('/admin'); 
    }
    setLoading(false);
  };

  return (
    <div className={s.viewportWrapper}>
      <div className={s.loginCard}>
        <h1 className={s.loginTitle}>Security</h1>
        <p className={s.loginSubtitle}>Step 3: Finalize Password</p>
        
        <form onSubmit={handleFinalize} className={s.unifiedFormContainer}>
          <div className={s.inputBlock}>
            {/* Main Password */}
            <div style={{ position: 'relative' }}>
              <input 
                className={s.inputField} 
                type={showPassword ? "text" : "password"} 
                placeholder="Create Password" 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className={s.fieldDivider} />

            {/* Confirm Password */}
            <div style={{ position: 'relative' }}>
              <input 
                className={s.inputField} 
                type={showConfirm ? "text" : "password"} 
                placeholder="Confirm Password" 
                onChange={e => setConfirmPassword(e.target.value)} 
                required 
              />
              <button 
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className={s.submitBtn} disabled={loading}>
            {loading ? <div className={s.loader} /> : "FINALIZE ACCOUNT"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetPassword;