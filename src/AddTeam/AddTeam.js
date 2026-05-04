import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { QRCodeCanvas } from 'qrcode.react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faUsers, faCloudUploadAlt, faCheckCircle, faVenusMars } from '@fortawesome/free-solid-svg-icons';
import s from './AddTeam.module.css';

const AddTeam = () => {
  const [loading, setLoading] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [pool, setPool] = useState('BOYS'); // Default Pool
  const [players, setPlayers] = useState(Array(12).fill({ name: '', jersey: '' }));
  const [successData, setSuccessData] = useState(null);

  const generateUniqueID = (type, existingSet) => {
    let id;
    let isUnique = false;
    while (!isUnique) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      id = type === 'TEAM' ? `LEO-TEAM-${randomNum}` : `LEO-PLYR-${randomNum}`;
      if (!existingSet.has(id)) isUnique = true;
    }
    return id;
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessData(null);

    console.log("🚀 INITIATING DEPLOYMENT...");

    try {
      const usedIDs = new Set();
      const customTeamId = generateUniqueID('TEAM', usedIDs);
      usedIDs.add(customTeamId);

      // --- STAGE 1: TEAM INSERTION ---
      console.log("📡 SYNCING TEAM DATA...", { teamName, pool });
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert([{ 
          team_id: customTeamId, 
          team_name: teamName.toUpperCase(), 
          pool: pool,
          is_approved: true,
          captain_whatsapp: "0000000000" // Placeholder for DB constraint
        }])
        .select().single();

      if (teamError) throw teamError;

      // --- STAGE 2: PLAYER INSERTION ---
      const playersToInsert = players.map((p) => {
        const customPlayerId = generateUniqueID('PLAYER', usedIDs);
        usedIDs.add(customPlayerId);
        return {
          player_id: customPlayerId,
          team_id: teamData.id,
          name: p.name.toUpperCase(),
          jersey_number: p.jersey,
          qr_string: `https://leofootball.online/verify/${customPlayerId}`
        };
      });

      console.log("📡 SYNCING PLAYER ROSTER...");
      const { error: pError } = await supabase.from('players').insert(playersToInsert);
      if (pError) throw pError;

      console.log("✅ DEPLOYMENT COMPLETE");
      setSuccessData({ teamId: customTeamId, teamName: teamName.toUpperCase() });
      
      // Reset Form
      setTeamName('');
      setPlayers(Array(12).fill({ name: '', jersey: '' }));
      
    } catch (err) {
      console.error("🚨 CRITICAL ERROR:", err);
      alert(`DATABASE ERROR: ${err.message || "Check Console"}`);
    } finally {
      setLoading(false);
    }
  };

  const updatePlayer = (index, field, value) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };

  return (
    <div className={s.container}>
      <header className={s.header}>
        <div className={s.badge}>
          <FontAwesomeIcon icon={faShieldHalved} /> SYSTEM_ADMIN_MODULE
        </div>
        <h1 className={s.title}>CREATE_TEAM_PROFILE</h1>
        <p className={s.subtitle}>Syncing registration data for LEO CUP 2026.</p>
      </header>

      <form className={s.bentoGrid} onSubmit={handleAddTeam}>
        {/* Core ID Card */}
        <div className={`${s.card} ${s.spanFull}`}>
          <div className={s.cardHeader}>
            <FontAwesomeIcon icon={faUsers} className={s.accentIcon} />
            <h3>CORE_IDENTIFICATION</h3>
          </div>
          
          <div className={s.inputRow}>
            <div className={s.nameInputWrapper}>
              <label className={s.smallLabel}>OFFICIAL TEAM NAME</label>
              <input 
                className={s.mainInput}
                value={teamName} 
                onChange={e => setTeamName(e.target.value)} 
                placeholder="E.G. NAKURU WARRIORS" 
                required 
              />
            </div>
            
            <div className={s.poolWrapper}>
              <label className={s.smallLabel}>TOURNAMENT_POOL</label>
              <div className={s.poolToggle}>
                <button 
                  type="button" 
                  className={pool === 'BOYS' ? s.activePool : ''} 
                  onClick={() => setPool('BOYS')}
                >BOYS</button>
                <button 
                  type="button" 
                  className={pool === 'GIRLS' ? s.activePool : ''} 
                  onClick={() => setPool('GIRLS')}
                >GIRLS</button>
              </div>
            </div>
          </div>
        </div>

        {/* Players Grid (2 Columns) */}
        <div className={s.playersGrid}>
          {players.map((p, i) => (
            <div key={i} className={s.playerCard}>
              <div className={s.playerHeader}>
                <span className={s.index}>#{String(i + 1).padStart(2, '0')}</span>
                <span className={s.tag}>{i === 0 ? 'CAPTAIN' : 'ROSTER'}</span>
              </div>
              <div className={s.playerInputs}>
                <div className={s.nameField}>
                  <label className={s.smallLabel}>FULL NAME</label>
                  <input 
                    className={s.minimalInput}
                    value={p.name} 
                    onChange={e => updatePlayer(i, 'name', e.target.value)} 
                    placeholder="PLAYER NAME" 
                    required 
                  />
                </div>
                <div className={s.jerseyField}>
                  <label className={s.smallLabel}>JRSY</label>
                  <input 
                    className={s.minimalInput}
                    value={p.jersey} 
                    onChange={e => updatePlayer(i, 'jersey', e.target.value)} 
                    placeholder="00" 
                    maxLength="3"
                    required 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Panel */}
        <div className={`${s.card} ${s.spanFull} ${s.actionCard}`}>
          <div className={s.disclaimer}>
            <p>Verification IDs are generated upon database commit.</p>
            <span>MASTER_ADMIN: AUTHORIZED ACCESS ONLY.</span>
          </div>
          <button type="submit" className={s.submitBtn} disabled={loading}>
            <FontAwesomeIcon icon={faCloudUploadAlt} /> {loading ? 'SYNCING...' : 'DEPLOY TEAM PROFILE'}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {successData && (
        <div className={s.successOverlay}>
          <div className={s.successModal}>
            <FontAwesomeIcon icon={faCheckCircle} className={s.successIcon} />
            <h2>DEPLOYMENT SUCCESSFUL</h2>
            <p className={s.modalTeamName}>{successData.teamName} ({pool})</p>
            <div className={s.qrBox}>
              <QRCodeCanvas value={`https://leofootball.online/team/${successData.teamId}`} size={160} />
            </div>
            <code className={s.teamIdCode}>{successData.teamId}</code>
            <button onClick={() => setSuccessData(null)} className={s.closeBtn}>CONTINUE</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTeam;