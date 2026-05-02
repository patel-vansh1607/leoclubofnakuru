import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Navbar from './Navbar/Navbar';
import Registration from './Registration/Registration';
import styles from './App.module.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const location = useLocation();
  const hostname = window.location.hostname;

  // Domain Check
  const isRegisterSubdomain = hostname === 'register.leofootball.online' || hostname === 'register.localhost';

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await checkUserStatus(session);
      else setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) checkUserStatus(session);
      else {
        setSession(null);
        setIsBlocked(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserStatus = async (currentSession) => {
    try {
      const { data } = await supabase.from('profiles').select('role').eq('id', currentSession.user.id).single();
      if (data?.role === 'restricted') {
        await supabase.auth.signOut();
        setIsBlocked(true);
        setSession(null);
      } else {
        setSession(currentSession);
        setIsBlocked(false);
      }
    } catch {
      setSession(currentSession);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loader}>Verifying...</div>;

  // 1. SUBDOMAIN OVERRIDE
  if (isRegisterSubdomain) return <Registration />;

  // 2. BLOCKED OVERRIDE
  if (isBlocked) {
    return (
      <div className={styles.blockedOverlay}>
        <div className={styles.blockedCard}>
          <h1>Access Restricted</h1>
          <p>Please contact Vansh for an upgrade.</p>
          <button onClick={() => setIsBlocked(false)}>Return Home</button>
        </div>
      </div>
    );
  }

  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAdmin = location.pathname.startsWith('/admin');
  const hideNavbar = isDashboard || isAdmin;

  // 3. AUTH GUARD FOR DASHBOARD
  if (isDashboard && !session) return <Navigate to="/admin" replace />;
  if (isAdmin && session) return <Navigate to="/dashboard" replace />;

  return (
    <div className={styles.appContainer}>
      {!hideNavbar && <Navbar />}
      <main className={hideNavbar ? styles.dashboardWrapper : styles.mainContent}>
        {/* Outlet renders the components you defined in index.js (Home, Admin, etc.) */}
        <Outlet context={{ session }} />
      </main>
    </div>
  );
}

export default App;