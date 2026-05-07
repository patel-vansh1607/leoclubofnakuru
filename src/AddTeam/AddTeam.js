import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { QRCodeCanvas } from 'qrcode.react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faCheckCircle, faBolt } from '@fortawesome/free-solid-svg-icons';
import s from './AddTeam.module.css';

const AddTeam = () => {
  const [loading, setLoading] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [pool, setPool] = useState('BOYS');
  const [players, setPlayers] = useState(Array(12).fill({ name: '', jersey: '' }));
  const [successData, setSuccessData] = useState(null);

  const generateUniqueID = (existingSet) => {
    let id;
    let isUnique = false;
    while (!isUnique) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      id = `LEO-CUP-${randomNum}`; 
      if (!existingSet.has(id)) isUnique = true;
    }
    return id;
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessData(null);

    try {
      const usedIDs = new Set();
      const customTeamId = `LEO-TEAM-${Math.floor(1000 + Math.random() * 9000)}`;

      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert([{ 
          team_id: customTeamId, 
          team_name: teamName.toUpperCase(), 
          pool: pool,
          is_approved: true,
          captain_whatsapp: "0000000000" 
        }])
        .select().single();

      if (teamError) throw teamError;

      const playersToInsert = players.map((p) => {
        const customPlayerId = generateUniqueID(usedIDs);
        usedIDs.add(customPlayerId);
        return {
          player_id: customPlayerId,
          team_id: teamData.id,
          name: p.name.toUpperCase(),
          jersey_number: p.jersey,
          qr_string: customPlayerId
        };
      });

      const { error: pError } = await supabase.from('players').insert(playersToInsert);
      if (pError) throw pError;

      setSuccessData({ teamId: customTeamId, teamName: teamName.toUpperCase(), playerIds: Array.from(usedIDs) });
      setTeamName('');
      setPlayers(Array(12).fill({ name: '', jersey: '' }));
      
    } catch (err) {
      alert(`SYSTEM ERROR: ${err.message}`);
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
      {/* Import Lato font directly */}
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap');
      </style>

      <header className={s.header}>
        <h1 className={s.title}>ADD NEW <span className={s.gold}>TEAM</span></h1>
        <p className={s.subtitle}>Add a new team to the competition.</p>
      </header>

      <form className={s.bentoGrid} onSubmit={handleAddTeam}>
        <div className={`${s.card} ${s.spanFull}`}>
          <div className={s.inputRow}>
            <div className={s.nameInputWrapper}>
              <label className={s.smallLabel}> TEAM NAME</label>
              <input className={s.mainInput} value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="ENTER NAME..." required />
            </div>
            <div className={s.poolWrapper}>
              <label className={s.smallLabel}>COMPETITION POOL</label>
              <div className={s.poolToggle}>
                {/* FIXED: Using activePool class name */}
                <button type="button" className={pool === 'BOYS' ? s.activePool : ''} onClick={() => setPool('BOYS')}>BOYS</button>
                <button type="button" className={pool === 'GIRLS' ? s.activePool : ''} onClick={() => setPool('GIRLS')}>GIRLS</button>
              </div>
            </div>
          </div>
        </div>

        <div className={s.playersGrid}>
          {players.map((p, i) => (
            <div key={i} className={s.playerCard}>
              <div className={s.playerHeader}>
                <span className={s.index}>#{String(i + 1).padStart(2, '0')}</span>
                <span className={s.tag}>ATHLETE_DATA</span>
              </div>
              <div className={s.playerInputs}>
                <div className={s.nameField}>
                  <input className={s.minimalInput} value={p.name} onChange={e => updatePlayer(i, 'name', e.target.value)} placeholder="FULL NAME" required />
                </div>
                <div className={s.jerseyField}>
                  <input className={s.minimalInput} value={p.jersey} onChange={e => updatePlayer(i, 'jersey', e.target.value)} placeholder="JRSY" required />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={s.actionArea}>
          <button type="submit" className={s.submitBtn} disabled={loading}>
            <FontAwesomeIcon icon={faBolt} />
            {loading ? 'SYNCING TO CLOUD...' : 'ADD TEAM'}
          </button>
        </div>
      </form>

      {successData && (
        <div className={s.successOverlay}>
          <div className={s.successModal}>
            <FontAwesomeIcon icon={faCheckCircle} className={s.successIcon} />
            <h2>DEPLOYMENT SUCCESS</h2>
            <div className={s.qrBox}>
              <QRCodeCanvas value={successData.playerIds[0]} size={180} level="H" includeMargin={false} />
            </div>
            <code className={s.teamIdCode}>{successData.teamId}</code>
            <p className={s.successNote}>Team data synchronized. Master QR key generated for Captain.</p>
            <button onClick={() => setSuccessData(null)} className={s.closeBtn}>ACKNOWLEDGE</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTeam;