import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const DraftTeams = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDrafts = async () => {
    console.log("--- DEBUG: STARTING FETCH ---");
    setLoading(true);
    
    const { data, error } = await supabase
      .from('teams')
      .select(`
        id, 
        team_id,
        team_name,
        captain_whatsapp,
        players (
          player_id,
          name,
          verified
        )
      `)
      .eq('is_approved', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("--- DEBUG: FETCH ERROR ---", error);
    } else {
      console.log("--- DEBUG: RAW DATA RECEIVED ---", data);
      
      // Check individual teams for nested players
      data.forEach((team, index) => {
        console.log(`Team [${index}] (${team.team_name}) Players Count:`, team.players?.length || 0);
        if (team.players?.length === 0) {
          console.warn(`Warning: Team ${team.team_name} has NO players linked to ID: ${team.id}`);
        }
      });

      setDrafts(data);
    }
    setLoading(false);
  };

  // Trigger fetch on component mount
  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleAction = async (teamId, approve = true) => {
    console.log(`--- DEBUG: ${approve ? 'APPROVING' : 'PURGING'} TEAM ID: ${teamId} ---`);
    if (approve) {
      await supabase.from('teams').update({ is_approved: true }).eq('id', teamId);
    } else {
      await supabase.from('teams').delete().eq('id', teamId);
    }
    fetchDrafts();
  };

  // ... (Keep your styles 's' object as it was)
  const s = {
    container: { padding: '20px', width: '100%', boxSizing: 'border-box' },
    title: { fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', marginBottom: '20px', color: '#fff' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
    card: { background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '10px' },
    teamName: { margin: 0, fontSize: '1.2rem', color: '#f1c40f' },
    info: { fontSize: '0.9rem', marginBottom: '15px', color: '#ccc' },
    squadTitle: { fontSize: '0.75rem', letterSpacing: '1px', color: '#f1c40f', marginBottom: '10px', textTransform: 'uppercase' },
    playerGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' },
    player: { fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '2px' },
    btnRow: { display: 'flex', gap: '10px', marginTop: 'auto' },
    approveBtn: { flex: 1, padding: '10px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
    deleteBtn: { flex: 1, padding: '10px', background: 'rgba(255, 94, 94, 0.1)', color: '#ff5e5e', border: '1px solid rgba(255, 94, 94, 0.2)', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
    loading: { textAlign: 'center', marginTop: '50px', opacity: 0.5, letterSpacing: '2px' }
  };

  if (loading) return <div style={s.loading}>FETCHING DRAFTS...</div>;

  return (
    <div style={s.container}>
      <h2 style={s.title}>DRAFT_TEAMS</h2>
      {drafts.length === 0 ? (
        <p style={s.loading}>NO DRAFTS IN QUEUE.</p>
      ) : (
        <div style={s.grid}>
          {drafts.map((team) => (
            <div key={team.id} style={s.card}>
              <div style={s.header}>
                <h3 style={s.teamName}>{team.team_name}</h3>
                <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>{team.team_id}</span>
              </div>
              <div style={s.info}>
                <strong>CONTACT:</strong> {team.captain_whatsapp}
              </div>
              <div style={s.squadTitle}>Squad Members ({team.players?.length || 0})</div>
              <div style={s.playerGrid}>
                {team.players?.map((p) => (
                  <div key={p.player_id} style={s.player}>
                    <div style={{ fontWeight: 'bold', color: '#f1c40f' }}>{p.name}</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.5 }}>ID: {p.player_id}</div>
                    <div style={{ fontSize: '0.6rem', color: p.verified ? '#27ae60' : '#e74c3c' }}>
                      {p.verified ? 'VERIFIED' : 'UNVERIFIED'}
                    </div>
                  </div>
                ))}
              </div>
              <div style={s.btnRow}>
                <button style={s.deleteBtn} onClick={() => handleAction(team.id, false)}>PURGE</button>
                <button style={s.approveBtn} onClick={() => handleAction(team.id, true)}>APPROVE</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DraftTeams;