import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import loginStyles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className={loginStyles.viewportWrapper}>
      <div className={loginStyles.loginCard}>
        <div className={loginStyles.headerArea}>
          <h1 className={loginStyles.loginTitle}>Admin Access</h1>
          <p className={loginStyles.loginSubtitle}>Authorized Personnel Only</p>
        </div>

        {/* All inputs and button in one unified container */}
        <form onSubmit={handleLogin} className={loginStyles.unifiedFormContainer}>
          <div className={loginStyles.inputBlock}>
            <input 
              className={loginStyles.inputField}
              type="email" 
              placeholder="Admin Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <div className={loginStyles.fieldDivider}></div>
            <input 
              className={loginStyles.inputField}
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
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
          System access monitored.
        </footer>
      </div>
    </div>
  );
};

export default Login;