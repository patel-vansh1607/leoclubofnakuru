import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import s from './TeamApprovals.module.css';

const TeamApprovals = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingTeams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('teams')
      .select('*, players(*)')
      .eq('is_approved', false)
      .order('created_at', { ascending: true });

    if (!error) setTeams(data);
    setLoading(false);
  };

  useEffect(() => { fetchPendingTeams(); }, []);

  const handleAction = async (id, type) => {
    if (type === 'approve') {
      const { error } = await supabase
        .from('teams')
        .update({ is_approved: true, payment_status: 'PAID' })
        .eq('id', id);
      if (error) alert("Update failed");
    } else {
      const confirm = window.confirm("PURGE DATA? This will permanently delete this team.");
      if (!confirm) return;
      await supabase.from('teams').delete().eq('id', id);
    }
    fetchPendingTeams();
  };

  if (loading) return <div className={s.loader}>LOADING PENDING REGISTRATIONS...</div>;

  return (
    <div className={s.container}>
      <div className={s.header}>
        <h2>Team <span>Approvals</span></h2>
        <button onClick={fetchPendingTeams} className={s.refreshBtn}>
          <FontAwesomeIcon icon={Icons.faRotate} />
        </button>
      </div>

      <div className={s.grid}>
        {teams.length === 0 ? (
          <p className={s.empty}>No teams awaiting approval.</p>
        ) : (
          teams.map(team => (
            <div key={team.id} className={s.teamCard}>
              <div className={s.cardTop}>
                <h3>{team.team_name}</h3>
                <p>Contact: {team.captain_whatsapp}</p>
              </div>
              
              <div className={s.playerList}>
                {team.players?.map((p, i) => (
                  <div key={p.id} className={s.playerRow}>
                    <span>{i + 1}</span> {p.name}
                  </div>
                ))}
              </div>

              <div className={s.cardActions}>
                <button onClick={() => handleAction(team.id, 'reject')} className={s.rejectBtn}>REJECT</button>
                <button onClick={() => handleAction(team.id, 'approve')} className={s.approveBtn}>APPROVE</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeamApprovals;