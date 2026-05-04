import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import s from './ScheduleMaker.module.css';

const ScheduleMaker = () => {
  const { session } = useOutletContext();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    team_a: '',
    team_b: '',
    pool: 'Boys', 
    scheduled_at: ''
  });

  useEffect(() => {
    const fetchAllTeams = async () => {
      const { data, error } = await supabase.from('teams').select('*'); 
      if (error) {
        console.error("Supabase Error:", error);
      } else {
        console.log("Teams fetched from DB:", data); // Check your console!
        setTeams(data || []);
      }
    };
    fetchAllTeams();
  }, []);

  // Filter logic: Checks if 'pool' matches regardless of case
  const filteredTeams = teams.filter(team => 
    team.pool?.toLowerCase() === formData.pool.toLowerCase()
  );

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    if (formData.team_a === formData.team_b) return alert("Select two different teams!");
    setLoading(true);

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

    if (!error) {
      alert(`Match ${nextMatchNo} Scheduled!`);
      setFormData({ ...formData, team_a: '', team_b: '', scheduled_at: '' });
    }
    setLoading(false);
  };

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
            <label>MATCH CATEGORY</label>
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
                <option value="">Select {formData.pool} Team</option>
                {filteredTeams.map(t => (
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
                <option value="">Select {formData.pool} Team</option>
                {filteredTeams.map(t => (
                  <option key={t.id} value={t.id}>{t.team_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={s.section}>
            <label>KICK-OFF TIME</label>
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