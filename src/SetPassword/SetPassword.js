import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import s from '../Login/Login.module.css';

const SetPassword = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFinalize = async (e) => {
  e.preventDefault();
  setLoading(true);

  // 1. Update the password for the newly verified session
  const { error } = await supabase.auth.updateUser({
    password: password 
  });

  if (error) {
    alert(`Security Error: ${error.message}`);
  } else {
    // 2. Clear the session so they have to log in fresh
    await supabase.auth.signOut(); 
    
    alert("Account Secured! Awaiting Master Admin approval.");
    
    // 3. Take them to the Login (Admin) page
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
            <input className={s.inputField} type="password" placeholder="Create Password" onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className={s.submitBtn}>FINALIZE ACCOUNT</button>
        </form>
      </div>
    </div>
  );
};

export default SetPassword;