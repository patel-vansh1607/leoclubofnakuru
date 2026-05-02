import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import Registration from './Registration/Registration';
import Login from './Login/Login'; 
import Dashboard from './Dashboard/Dashboard';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Home Placeholder
const Home = () => (
  <div style={{ padding: '100px', textAlign: 'center' }}>
    <h1>Leo Cup Home</h1>
  </div>
);

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* We wrap everything in App so App can still handle Navbar/Auth logic */}
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="registration" element={<Registration />} />
          <Route path="admin" element={<Login />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();