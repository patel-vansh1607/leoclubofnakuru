import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const DraftTeams = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const fetchDrafts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('public_reg')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error) setDrafts(data);
    setLoading(false);
  };

  useEffect(() => { fetchDrafts(); }, []);

  const formatDraftId = (index) => `DRAFT_${String(index + 1).padStart(4, '0')}`;

  const s = {
    container: { 
      padding: '60px 8%', 
      minHeight: '100vh', 
      color: '#fff', 
      fontFamily: "'Inter', sans-serif",
      background: 'transparent' 
    },
    title: { 
      fontSize: 'clamp(2rem, 6vw, 3rem)', 
      fontWeight: '900', 
      letterSpacing: '-2px', 
      marginBottom: '60px',
      textTransform: 'uppercase'
    },
    grid: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
      gap: '30px' 
    },
    card: { 
      background: 'rgba(255, 255, 255, 0.02)', 
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.08)', 
      borderRadius: '28px', 
      padding: '35px', 
      cursor: 'pointer',
      transition: 'all 0.4s ease-out',
    },
    idBadge: { 
      fontSize: '0.65rem', 
      background: 'rgba(241, 196, 15, 0.15)', 
      color: '#f1c40f', 
      padding: '5px 12px', 
      borderRadius: '8px',
      letterSpacing: '1.5px',
      fontWeight: '800'
    },
    teamName: { fontSize: '1.6rem', fontWeight: '800', margin: '20px 0 10px 0', color: '#fff' },
    contactInfo: { 
      fontSize: '0.85rem', 
      color: 'rgba(255,255,255,0.6)', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      marginTop: '15px'
    },
    
    // Modal UI
    overlay: { 
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
      background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', 
      alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(20px)',
      padding: '20px'
    },
    modal: { 
      width: '100%', maxWidth: '750px', maxHeight: '85vh', 
      background: 'rgba(15, 15, 15, 0.7)', borderRadius: '40px', 
      border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', 
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 40px 100px rgba(0,0,0,0.8)'
    },
    modalHeader: { padding: '50px 50px 30px 50px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    playerList: { padding: '20px 50px', overflowY: 'auto' },
    playerRow: { 
      display: 'flex', justifyContent: 'space-between', padding: '22px 0', 
      borderBottom: '1px solid rgba(255,255,255,0.03)', alignItems: 'center' 
    }
  };

  return (
    <div style={s.container}>
      <h2 style={s.title}>DRAFT_VAULT</h2>
      
      <div style={s.grid}>
        {drafts.map((team, index) => (
          <div 
            key={team.id} 
            style={s.card} 
            onClick={() => setSelectedTeam({...team, displayId: formatDraftId(index)})}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.borderColor = 'rgba(241, 196, 15, 0.4)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
            }}
          >
            <span style={s.idBadge}>{formatDraftId(index)}</span>
            <h3 style={s.teamName}>{team.team_name}</h3>
            
            <div style={s.contactInfo}>
              <span style={{ color: '#f1c40f' }}>WA:</span> 
              <span>{team.captain_whatsapp}</span>
            </div>
            
            <div style={{ marginTop: '20px', opacity: 0.4, fontSize: '0.75rem', letterSpacing: '1px' }}>
              {team.players?.length} PLAYERS REGISTERED
            </div>
          </div>
        ))}
      </div>

      {selectedTeam && (
        <div style={s.overlay} onClick={() => setSelectedTeam(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <span style={s.idBadge}>{selectedTeam.displayId}</span>
              <h1 style={{ fontSize: '2.8rem', margin: '20px 0 10px 0', fontWeight: '900' }}>
                {selectedTeam.team_name}
              </h1>
              <div style={{ display: 'flex', gap: '30px', marginTop: '10px' }}>
                <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>
                   <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>CAPTAIN:</span> {selectedTeam.captain_whatsapp}
                </p>
                <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>
                   <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>CAT:</span> {selectedTeam.category}
                </p>
              </div>
            </div>

            {/* Inside the Player List in DraftTeams.js */}
<div style={s.playerList}>
  {selectedTeam.players?.map((p, idx) => (
    <div key={idx} style={s.playerRow}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
        {/* Display Jersey Number instead of Index */}
        <span style={{ color: '#f1c40f', fontWeight: '900', fontSize: '1.1rem', width: '35px' }}>
            #{p.jersey}
        </span>
        <span style={{ fontSize: '1.2rem', fontWeight: '500' }}>
            {p.name}
        </span>
      </div>
      <span style={{ fontSize: '0.7rem', opacity: 0.2 }}>
        {p.player_id}
      </span>
    </div>
  ))}
</div>
            
            <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                <button 
                  onClick={() => setSelectedTeam(null)}
                  style={{ 
                    background: '#f1c40f', 
                    color: '#000', 
                    border: 'none', 
                    padding: '15px 45px', 
                    borderRadius: '15px', 
                    fontWeight: '900', 
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  CLOSE ROSTER
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftTeams;