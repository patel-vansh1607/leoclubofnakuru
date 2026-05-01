import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import r from './RoleManagement.module.css';

const RoleManagement = ({ session }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('restricted');

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
  
  // Use your hardcoded master email as a secondary safety check
  if (session?.user?.email !== 'pvansh830@gmail.com') {
    return alert("Only Vansh can add users.");
  }

  const { error } = await supabase
    .from('profiles')
    .insert([{ 
      email: newUserEmail.toLowerCase().trim(), 
      role: newUserRole 
    }]);

  if (error) {
    console.error("Insert Error:", error);
    alert("Database rejected the request: " + error.message);
  } else {
    setNewUserEmail('');
    fetchUsers();
    alert("User successfully pre-registered.");
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

  if (loading) return <div className={r.loader}>Syncing...</div>;

  return (
    <div className={r.roleContainer}>
      {/* 1. NEW USER FORM */}
      {isMaster && (
        <div className={r.addSection}>
          <h4>Add New User</h4>
          <form onSubmit={handleAddUser} className={r.addForm}>
            <input 
              type="email" 
              placeholder="User Email" 
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
              <option value="restricted">Restricted</option>
              <option value="admin">Admin</option>
              <option value="master_admin">Master Admin</option>
            </select>
            <button type="submit" className={r.btnAdd}>Add User</button>
          </form>
        </div>
      )}

      {/* 2. USER LIST */}
      <div className={r.headerBox}>
        <h3>Current Users</h3>
      </div>

      <div className={r.tableWrapper}>
        <table className={r.userTable}>
          <thead>
            <tr>
              <th>Account</th>
              <th>Status</th>
              <th>Assignment</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? users.map(u => (
              <tr key={u.id}>
                <td className={r.emailCell}>{u.email}</td>
                <td>
                  <span className={u.role === 'restricted' ? r.badgeBlocked : r.badgeActive}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <select 
                    className={r.roleSelect}
                    value={u.role || 'restricted'}
                    disabled={!isMaster || u.email === MASTER_EMAIL}
                    onChange={(e) => updateAccess(u.id, e.target.value)}
                  >
                    <option value="restricted">Restricted</option>
                    <option value="admin">Admin</option>
                    <option value="master_admin">Master Admin</option>
                  </select>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="3" className={r.noData}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleManagement;