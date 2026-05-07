import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import s from './Login.module.css';

const Gatekeeper = ({ children }) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setRole(data?.role);
      }
      setLoading(false);
    };
    checkRole();
  }, []);

  if (loading) return <div className={s.loader}>SYSTEM_CHECKING...</div>;

  if (role === 'unauthorized' || !role) {
    return (
      <div className={s.viewportWrapper}>
        <div className={s.loginCard}>
          <h1 className={s.loginTitle} style={{color: '#e74c3c'}}>ACCESS_DENIED</h1>
          <p className={s.loginSubtitle}>Account Pending Authorization</p>
          <div className={s.unifiedFormContainer} style={{padding: '40px'}}>
             <p style={{color: '#fff', fontSize: '0.9rem', lineHeight: '1.6'}}>
               Your identity has been verified, but your account is <strong>Locked</strong>. 
               Contact the Master Admin (Vansh) to grant system clearance.
             </p>
          </div>
          <footer className={s.footer}>Terminal ID: {supabase.auth.getUser()?.id}</footer>
        </div>
      </div>
    );
  }

  return children;
};
export default Gatekeeper;