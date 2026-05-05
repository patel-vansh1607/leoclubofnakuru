import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import s from './ScoringPanel.module.css';

const ScoringPanel = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState(null); 
  const [goalData, setGoalData] = useState({ scorer: '', assist: '' });

  useEffect(() => {
    fetchMatches();
    const channel = supabase
      .channel('live-scoring')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => fetchMatches())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const fetchMatches = async () => {
    console.log("Fetching active matches...");
    
    // Removed 'players' from the select to fix the 400 error
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        team_a_info:teams!team_a(id, team_name),
        team_b_info:teams!team_b(id, team_name)
      `)
      .or('status.eq.upcoming,status.eq.live')
      .order('match_no', { ascending: true });
    
    if (error) {
      console.error("Fetch Error:", error.message);
    } else {
      console.log("Matches loaded successfully:", data);
      setMatches(data || []);
    }
    setLoading(false);
  };

  const startMatch = async (id) => {
    const { error } = await supabase.from('matches').update({ status: 'live' }).eq('id', id);
    if (error) console.error("Start Error:", error.message);
  };

  const completeMatch = async (id) => {
    if (window.confirm("End match and move to results?")) {
      await supabase.from('matches').update({ status: 'completed' }).eq('id', id);
    }
  };

  const handleGoalRecord = async (matchId, teamSide) => {
    const match = matches.find(m => m.id === matchId);
    const field = teamSide === 'a' ? 'score_a' : 'score_b';
    const newScore = (match[field] || 0) + 1;

    const { error } = await supabase
      .from('matches')
      .update({ [field]: newScore })
      .eq('id', matchId);

    if (!error) {
      setActiveEvent(null);
      setGoalData({ scorer: '', assist: '' });
    }
  };

  if (loading) return <div className={s.loader}>INITIALIZING LIVE CONSOLE...</div>;

  return (
    <div className={s.container}>
      {matches.length === 0 ? (
        <div className={s.noMatches}>No upcoming or live matches found.</div>
      ) : (
        <div className={s.matchGrid}>
          {matches.map((match) => (
            <div key={match.id} className={`${s.matchCard} ${match.status === 'live' ? s.livePulse : ''}`}>
              
              <div className={s.matchHeader}>
                <span className={s.matchNo}>MATCH #{match.match_no}</span>
                {match.status === 'live' && <span className={s.liveIndicator}>● LIVE</span>}
                <span className={s.poolBadge}>{match.pool}</span>
              </div>

              <div className={s.mainConsole}>
                <div className={s.teamSide}>
                  <p className={s.teamName}>{match.team_a_info?.team_name || "Team A"}</p>
                  <h2 className={s.bigScore}>{match.score_a || 0}</h2>
                  {match.status === 'live' && (
                    <button className={s.goalBtn} onClick={() => setActiveEvent({ matchId: match.id, side: 'a' })}>
                      + GOAL
                    </button>
                  )}
                </div>

                <div className={s.centerInfo}>
                  <div className={s.vsText}>VS</div>
                </div>

                <div className={s.teamSide}>
                  <p className={s.teamName}>{match.team_b_info?.team_name || "Team B"}</p>
                  <h2 className={s.bigScore}>{match.score_b || 0}</h2>
                  {match.status === 'live' && (
                    <button className={s.goalBtn} onClick={() => setActiveEvent({ matchId: match.id, side: 'b' })}>
                      + GOAL
                    </button>
                  )}
                </div>
              </div>

              <div className={s.footer}>
                {match.status === 'upcoming' ? (
                  <button className={s.startBtn} onClick={() => startMatch(match.id)}>
                    START MATCH
                  </button>
                ) : (
                  <button className={s.finishBtn} onClick={() => completeMatch(match.id)}>
                    END FULL TIME
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScoringPanel;