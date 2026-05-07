import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import { supabase } from '../supabaseClient';
import loginStyles from './Login.module.css';
import Navbar from '../Navbar/Navbar';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook for redirection

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
    <>
      <Navbar />
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
              {loading ? <div className={loginStyles.loader}></div> : "LOGIN"}
            </button>

            {/* Added Request Access Button */}
            <div className={loginStyles.requestWrapper}>
              <p className={loginStyles.requestText}>New personnel?</p>
              <button 
                type="button" 
                className={loginStyles.requestBtn}
                onClick={() => navigate('/signup')}
              >
                REQUEST ACCESS
              </button>
            </div>
          </form>
          
          <footer className={loginStyles.footer}>
            System access is logged and monitored.
            <br />Unauthorized entry attempts are prohibited.
          </footer>
        </div>
      </div>
    </>
  );
};

export default Login;