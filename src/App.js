import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Navbar from './Navbar/Navbar';
import Registration from './Registration/Registration';
import Login from './Login/Login'; 
import Dashboard from './Dashboard/Dashboard'; 
import styles from './App.module.css';

function AppContent() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false); 
  const location = useLocation();

  useEffect(() => {
    // Check session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkUserStatus(session);
      } else {
        setLoading(false);
      }
    });

    // Listen for sign-in/out
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkUserStatus(session);
      } else {
        setSession(null);
        setIsBlocked(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserStatus = async (currentSession) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentSession.user.id)
        .single();

      if (data?.role === 'restricted') {
        await supabase.auth.signOut();
        setIsBlocked(true);
        setSession(null);
      } else {
        setSession(currentSession);
        setIsBlocked(false);
      }
    } catch (err) {
      setSession(currentSession);
    } finally {
      setLoading(false);
    }
  };

  // Hides website navbar for both /admin (Login) and /dashboard
  const hideNavbar = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');

  if (loading) return <div className={styles.loader}>Verifying...</div>;

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

  return (
    <div className={styles.appContainer}>
      {!hideNavbar && <Navbar />}
      <main className={hideNavbar ? styles.dashboardWrapper : styles.mainContent}>
        <Routes>
          <Route path="/" element={<div className={styles.home}><h1>Leo Cup Home</h1></div>} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/admin" element={session ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/dashboard" element={session ? <Dashboard session={session} /> : <Navigate to="/admin" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;