import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserMinus, faCrown, faUsersGear, faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';
import r from './RoleManagement.module.css';

const RoleManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [targetUser, setTargetUser] = useState(null);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role')
      .order('role', { ascending: false });
    
    if (!error) setUsers(data || []);
    setLoading(false);
  };

  const openRevokeModal = (user) => {
    if (user.role === 'master_admin') return;
    setTargetUser(user);
    setModalStep(1);
    setConfirmText('');
    setShowModal(true);
  };

  const closeRevokeModal = () => {
    setShowModal(false);
    setTargetUser(null);
  };

  const handleFinalRevoke = async () => {
    if (confirmText !== 'REVOKE') return;

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', targetUser.id);

    if (!error) {
      fetchUsers();
      closeRevokeModal();
    }
  };

  const updateAccess = async (userId, user, newRole) => {
    if (user.role === 'master_admin') return;
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);
    if (!error) fetchUsers();
  };

  if (loading) return <div className={r.loader}>Syncing Leo Cup Protocols...</div>;

  return (
    <div className={r.roleContainer}>
      <header className={r.header}>
        <div className={r.titleRow}>
          <h2 className={r.title}><FontAwesomeIcon icon={faUsersGear} /> Staff_Management</h2>
        </div>
        <p className={r.subtitle}>Modify staff hierarchy and manage active personnel.</p>
      </header>

      <div className={r.tableWrapper}>
        <table className={r.userTable}>
          <thead>
            <tr>
              <th>USER_IDENTIFIER</th>
              <th>RANK</th>
              <th>CHANGE_RANK</th>
              <th className={r.centerText}>REVOKE_ACCESS</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className={r.userRow}>
                <td className={r.emailCell}>
                  {u.email} {u.role === 'master_admin' && <FontAwesomeIcon icon={faCrown} className={r.masterIcon} />}
                </td>
                <td>
                  <span className={`${r.badge} ${r[u.role]}`}>
                    {u.role ? u.role.replace('_', ' ').toUpperCase() : 'NO ROLE'}
                  </span>
                </td>
                <td>
                  <select 
                    className={r.tableSelect}
                    value={u.role || 'scorer'}
                    disabled={u.role === 'master_admin'}
                    onChange={(e) => updateAccess(u.id, u, e.target.value)}
                  >
                    <option value="scorer">Scorer</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                    <option value="master_admin">Master Admin</option>
                  </select>
                </td>
                <td className={r.centerText}>
                  <button 
                    className={r.btnRevoke}
                    disabled={u.role === 'master_admin'}
                    onClick={() => openRevokeModal(u)}
                  >
                    <FontAwesomeIcon icon={faUserMinus} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- TRIPLE LOCK MODAL --- */}
      {showModal && (
        <div className={r.modalOverlay}>
          <div className={r.modalContent}>
            <button className={r.closeBtn} onClick={closeRevokeModal}><FontAwesomeIcon icon={faTimes} /></button>
            
            <div className={r.modalHeader}>
              <FontAwesomeIcon icon={faExclamationTriangle} className={r.warnIcon} />
              <h3>CRITICAL_REVOCATION</h3>
              <div className={r.progressBar}>
                <div className={r.progressFill} style={{ width: `${(modalStep / 3) * 100}%` }}></div>
              </div>
            </div>

            <div className={r.modalBody}>
              {modalStep === 1 && (
                <>
                  <p>Are you sure you want to remove access for:</p>
                  <div className={r.targetBox}>{targetUser?.email}</div>
                  <button className={r.nextBtn} onClick={() => setModalStep(2)}>PROCEED_TO_STEP_2</button>
                </>
              )}

              {modalStep === 2 && (
                <>
                  <p className={r.dangerText}>This action will immediately disconnect this user from the tournament engine.</p>
                  <button className={r.nextBtn} onClick={() => setModalStep(3)}>PROCEED_TO_FINAL_CLEARANCE</button>
                </>
              )}

              {modalStep === 3 && (
                <>
                  <p>Type <strong>REVOKE</strong> to authorize permanent removal.</p>
                  <input 
                    type="text" 
                    className={r.modalInput} 
                    value={confirmText} 
                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                    placeholder="TYPE HERE..."
                    autoFocus
                  />
                  <button 
                    className={r.finalBtn} 
                    disabled={confirmText !== 'REVOKE'} 
                    onClick={handleFinalRevoke}
                  >
                    EXECUTE_REVOKE
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;