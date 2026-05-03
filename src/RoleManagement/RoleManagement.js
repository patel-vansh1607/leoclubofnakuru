import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import r from './RoleManagement.module.css';

const RoleManagement = ({ session }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('scorer');

  const MASTER_EMAIL = 'pvansh830@gmail.com';
  const isMaster = session?.user?.email === MASTER_EMAIL;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role')
      .order('email', { ascending: true });
    
    if (!error) setUsers(data || []);
    setLoading(false);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!isMaster) return alert("Only Vansh can grant access.");

    const { error } = await supabase
      .from('profiles')
      .insert([{ 
        email: newUserEmail.toLowerCase().trim(), 
        role: newUserRole 
      }]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setNewUserEmail('');
      fetchUsers();
      alert("User pre-registered successfully.");
    }
  };

  const updateAccess = async (userId, newRole) => {
    if (!isMaster) return;
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (!error) fetchUsers();
  };

  if (loading) return <div className={r.loader}>Syncing Leo Cup Security...</div>;

  return (
    <div className={r.roleContainer}>
      <header className={r.header}>
        <h2 className={r.title}>Access Control</h2>
        <p className={r.subtitle}>Manage tournament permissions and staff levels.</p>
      </header>

      {/* 1. NEW USER FORM */}
      {isMaster && (
        <section className={r.addSection}>
          <form onSubmit={handleAddUser} className={r.addForm}>
            <div className={r.inputGroup}>
              <input 
                type="email" 
                placeholder="Staff Email" 
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                required
                className={r.input}
              />
              <select 
                value={newUserRole} 
                onChange={(e) => setNewUserRole(e.target.value)}
                className={r.roleSelect}
              >
                <option value="scorer">Scorer (Level 1)</option>
                <option value="admin">Admin (Level 2)</option>
                <option value="superadmin">Superadmin (Level 3)</option>
                <option value="master_admin">Master Admin (Level 4)</option>
              </select>
              <button type="submit" className={r.btnAdd}>Invite Staff</button>
            </div>
          </form>
        </section>
      )}

      {/* 2. USER LIST */}
      <div className={r.tableWrapper}>
        <table className={r.userTable}>
          <thead>
            <tr>
              <th>Account Email</th>
              <th>Current Rank</th>
              <th>Modify Access</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? users.map(u => (
              <tr key={u.id} className={r.userRow}>
                <td className={r.emailCell}>{u.email}</td>
                <td>
                  <span className={`${r.badge} ${r[u.role]}`}>
                    {u.role ? u.role.replace('_', ' ') : 'no role'}
                  </span>
                </td>
                <td>
                  <select 
                    className={r.tableSelect}
                    value={u.role || 'scorer'}
                    disabled={!isMaster || u.email === MASTER_EMAIL}
                    onChange={(e) => updateAccess(u.id, e.target.value)}
                  >
                    <option value="scorer">Scorer</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                    <option value="master_admin">Master Admin</option>
                  </select>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="3" className={r.noData}>No staff members found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleManagement;