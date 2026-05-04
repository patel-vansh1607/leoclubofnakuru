import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import s from './ScheduleMaker.module.css';

const ScheduleMaker = () => {
  const { userRole } = useOutletContext();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    team_a: '',
    team_b: '',
    pool: 'Boys',
    scheduled_at: ''
  });

  // Fetch only approved teams from Supabase
  useEffect(() => {
    const fetchTeams = async () => {
      const { data } = await supabase
        .from('teams')
        .select('*')
        .eq('status', 'approved');
      setTeams(data || []);
    };
    fetchTeams();
  }, []);

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    if (formData.team_a === formData.team_b) return alert("Select two different teams!");
    setLoading(true);

    // Auto-calculate the next match number
    const { count } = await supabase.from('matches').select('*', { count: 'exact', head: true });
    const nextMatchNo = (count || 0) + 1;

    const { error } = await supabase.from('matches').insert([{
      match_no: nextMatchNo,
      team_a: formData.team_a,
      team_b: formData.team_b,
      pool: formData.pool,
      scheduled_at: formData.scheduled_at,
      status: 'upcoming',
      score_a: 0,
      score_b: 0
    }]);

    if (error) {
      alert("Error scheduling match: " + error.message);
    } else {
      alert(`Match ${nextMatchNo} Scheduled!`);
      setFormData({ team_a: '', team_b: '', pool: 'Boys', scheduled_at: '' });
    }
    setLoading(false);
  };

  // Only Master Admin can access this tool
  if (userRole !== 'master_admin') return <div className={s.denied}>Access Restricted</div>;

  return (
    <div className={s.container}>
      <div className={s.glassCard}>
        <div className={s.header}>
          <span className={s.label}>TOURNAMENT_OPERATIONS</span>
          <h2 className={s.title}>ARRANGE MATCH</h2>
          <div className={s.accentBar}></div>
        </div>

        <form onSubmit={handleCreateMatch} className={s.form}>
          <div className={s.section}>
            <label>1. SELECT CATEGORY</label>
            <select 
              className={s.input}
              value={formData.pool} 
              onChange={e => setFormData({...formData, pool: e.target.value, team_a: '', team_b: ''})}
            >
              <option value="Boys">BOYS POOL</option>
              <option value="Girls">GIRLS POOL</option>
            </select>
          </div>

          <div className={s.matchGrid}>
            <div className={s.inputGroup}>
              <label>TEAM A (HOME)</label>
              <select 
                required 
                className={s.input}
                value={formData.team_a} 
                onChange={e => setFormData({...formData, team_a: e.target.value})}
              >
                <option value="">Choose Team</option>
                {teams.filter(t => t.pool === formData.pool).map(t => (
                  <option key={t.id} value={t.id}>{t.team_name}</option>
                ))}
              </select>
            </div>

            <div className={s.vsBox}>VS</div>

            <div className={s.inputGroup}>
              <label>TEAM B (AWAY)</label>
              <select 
                required 
                className={s.input}
                value={formData.team_b} 
                onChange={e => setFormData({...formData, team_b: e.target.value})}
              >
                <option value="">Choose Team</option>
                {teams.filter(t => t.pool === formData.pool).map(t => (
                  <option key={t.id} value={t.id}>{t.team_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={s.section}>
            <label>2. SCHEDULE TIME</label>
            <input 
              type="datetime-local" 
              className={s.input}
              required 
              value={formData.scheduled_at}
              onChange={e => setFormData({...formData, scheduled_at: e.target.value})} 
            />
          </div>

          <button type="submit" disabled={loading} className={s.submitBtn}>
            {loading ? 'PUBLISHING...' : 'PUBLISH TO LIVE PANEL'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScheduleMaker;