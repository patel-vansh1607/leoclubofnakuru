import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import s from './ScheduleMaker.module.css';

const ScheduleMaker = () => {
  const { session } = useOutletContext();
  const [teams, setTeams] = useState([]);
  const [matchCount, setMatchCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    team_a: '',
    team_b: '',
    pool: 'Boys',
    date: '',
    time: '',
    venue: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const { data: teamData } = await supabase.from('teams').select('*');
    setTeams(teamData || []);

    const { count } = await supabase.from('matches').select('*', { count: 'exact', head: true });
    setMatchCount(count || 0);
  };

  const filteredTeams = teams.filter(team => 
    team.pool?.toLowerCase() === formData.pool.toLowerCase()
  );

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    if (formData.team_a === formData.team_b) return alert("Select two different teams!");
    setLoading(true);

    const nextMatchNo = matchCount + 1;
    const combinedDateTime = `${formData.date}T${formData.time}:00`;

    const { error } = await supabase.from('matches').insert([{
      match_no: nextMatchNo,
      team_a: formData.team_a,
      team_b: formData.team_b,
      pool: formData.pool,
      scheduled_at: combinedDateTime,
      venue: formData.venue,
      status: 'upcoming',
      score_a: 0,
      score_b: 0
    }]);

    if (!error) {
      alert(`Match ${nextMatchNo} Scheduled Successfully!`);
      setMatchCount(nextMatchNo);
      setFormData({ ...formData, team_a: '', team_b: '', date: '', time: '', venue: '' });
    } else {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className={s.container}>
      <div className={s.glassCard}>
        <div className={s.header}>
          <div className={s.topRow}>
            <span className={s.label}>LEO_CUP_OPERATIONS</span>
            <span className={s.matchBadge}>NEXT: MATCH #{matchCount + 1}</span>
          </div>
          <h2 className={s.title}>ARRANGE MATCH</h2>
          <div className={s.accentBar}></div>
        </div>

        <form onSubmit={handleCreateMatch} className={s.form}>
          {/* CATEGORY & VENUE */}
          <div className={s.infoGrid}>
            <div className={s.section}>
              <label>TOURNAMENT CATEGORY</label>
              <select 
                className={s.input}
                value={formData.pool} 
                onChange={e => setFormData({...formData, pool: e.target.value, team_a: '', team_b: ''})}
              >
                <option value="Boys">BOYS POOL</option>
                <option value="Girls">GIRLS POOL</option>
              </select>
            </div>

            <div className={s.section}>
              <label>COURT / VENUE NAME</label>
              <input 
                type="text"
                placeholder="e.g. Main Court"
                className={s.input}
                value={formData.venue} 
                onChange={e => setFormData({...formData, venue: e.target.value})}
                required
              />
            </div>
          </div>

          {/* TEAMS SELECTION */}
          <div className={s.matchGrid}>
            <div className={s.inputGroup}>
              <label>TEAM A (HOME)</label>
              <select 
                required 
                className={s.input}
                value={formData.team_a} 
                onChange={e => setFormData({...formData, team_a: e.target.value})}
              >
                <option value="">Select Team</option>
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
                <option value="">Select Team</option>
                {filteredTeams.map(t => (
                  <option key={t.id} value={t.id}>{t.team_name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* DATE & ALARM-STYLE TIME */}
          <div className={s.infoGrid}>
            <div className={s.section}>
              <label>DATE</label>
              <input 
                type="date" 
                className={s.input}
                required 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})} 
              />
            </div>
            <div className={s.section}>
              <label>KICK-OFF TIME</label>
              <input 
                type="time" 
                className={s.input}
                required 
                value={formData.time}
                onChange={e => setFormData({...formData, time: e.target.value})} 
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className={s.submitBtn}>
            {loading ? 'INITIALIZING...' : 'CONFIRM & PUBLISH MATCH'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScheduleMaker;