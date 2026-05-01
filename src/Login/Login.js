import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import loginStyles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // New state for visibility
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert(`Access Denied: ${error.message}`);
    } else {
      console.log('Login successful:', data.user.email);
    }
    
    setLoading(false);
  };

  return (
    <div className={loginStyles.viewportWrapper}>
      <div className={loginStyles.loginCard}>
        <div className={loginStyles.headerArea}>
          <h1 className={loginStyles.loginTitle}>Admin Access</h1>
          <p className={loginStyles.loginSubtitle}>Authorized Personnel Only</p>
          <div className={loginStyles.accentLine}></div>
        </div>

        <form onSubmit={handleLogin} className={loginStyles.unifiedFormContainer}>
          <div className={loginStyles.inputBlock}>
            <input 
              className={loginStyles.inputField}
              type="email" 
              placeholder="Admin Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              autoComplete="email"
            />
            <div className={loginStyles.fieldDivider}></div>
            
            {/* Password section with Toggle */}
            <div className={loginStyles.passwordWrapper}>
              <input 
                className={loginStyles.inputField}
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                autoComplete="current-password"
              />
              <button 
                type="button" 
                className={loginStyles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? "HIDE" : "VIEW"}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className={loginStyles.submitBtn} 
            disabled={loading}
          >
            {loading ? <div className={loginStyles.loader}></div> : "SECURE LOGIN"}
          </button>
        </form>
        
        <footer className={loginStyles.footer}>
          System access is logged and monitored.
          <br />Unauthorized entry attempts are prohibited.
        </footer>
      </div>
    </div>
  );
};

export default Login;