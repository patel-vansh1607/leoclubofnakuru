import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import s from './ScoringPanel.module.css';

const ScoringPanel = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
    // Subscribe to realtime updates so multiple scorers stay in sync
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => fetchMatches())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchMatches = async () => {
    const { data } = await supabase
      .from('matches')
      .select(`
        *,
        team_a_info:teams!team_a(team_name),
        team_b_info:teams!team_b(team_name)
      `)
      .or('status.eq.upcoming,status.eq.live')
      .order('match_no', { ascending: true });
    
    setMatches(data || []);
    setLoading(false);
  };

  const updateScore = async (id, team, currentScore) => {
    const field = team === 'a' ? 'score_a' : 'score_b';
    await supabase
      .from('matches')
      .update({ [field]: currentScore + 1, status: 'live' })
      .eq('id', id);
  };

  const completeMatch = async (id) => {
    if (window.confirm("End this match? This will move it to results.")) {
      await supabase.from('matches').update({ status: 'completed' }).eq('id', id);
    }
  };

  if (loading) return <div className={s.loader}>Loading Matches...</div>;

  return (
    <div className={s.container}>
      {matches.length === 0 ? (
        <p className={s.noMatches}>No active matches to score.</p>
      ) : (
        <div className={s.matchGrid}>
          {matches.map((match) => (
            <div key={match.id} className={s.matchCard}>
              <div className={s.matchHeader}>
                <span className={s.matchNo}>MATCH {match.match_no}</span>
                <span className={s.poolBadge}>{match.pool}</span>
              </div>

              <div className={s.scoreboard}>
                <div className={s.teamBlock}>
                  <p className={s.teamName}>{match.team_a_info?.team_name}</p>
                  <h2 className={s.score}>{match.score_a}</h2>
                  <button className={s.addBtn} onClick={() => updateScore(match.id, 'a', match.score_a)}>+</button>
                </div>

                <div className={s.vs}>VS</div>

                <div className={s.teamBlock}>
                  <p className={s.teamName}>{match.team_b_info?.team_name}</p>
                  <h2 className={s.score}>{match.score_b}</h2>
                  <button className={s.addBtn} onClick={() => updateScore(match.id, 'b', match.score_b)}>+</button>
                </div>
              </div>

              <button className={s.finishBtn} onClick={() => completeMatch(match.id)}>
                FINISH MATCH
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScoringPanel;