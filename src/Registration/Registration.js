import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import styles from './Registration.module.css';

const Registration = () => {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({ teamName: '', players: Array(12).fill('') });

  const playerCount = 12;

  // Professional ID Generation (LEO-S2-XXXX)
  const generateID = (type, index = null) => {
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    if (type === 'TEAM') return `LEO-S2-T-${random}`;
    return `LEO-S2-P${index + 1}-${random}`;
  };

  const handleOpenPreview = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    setFormData({
      teamName: data.get('teamName').toUpperCase(),
      players: Array.from({ length: playerCount }).map((_, i) => data.get(`player-${i}`).toUpperCase())
    });
    setShowPreview(true);
  };

  const finalizeSubmission = async () => {
    setLoading(true);
    const teamId = generateID('TEAM');
    
    // Map players to include IDs and QR data strings
    const squadData = formData.players.map((name, i) => ({
      player_id: generateID('PLAYER', i),
      name: name,
      qr_string: `VAL_P_${generateID('PLAYER', i)}`
    }));

    try {
      const { error } = await supabase
        .from('registrations')
        .insert([{ 
          team_name: formData.teamName,
          team_id: teamId,
          category: "UNDER 19",
          players: squadData,
          team_qr: `VAL_T_${teamId}`,
          created_at: new Date()
        }]);

      if (error) throw error;
      alert("SQUAD REGISTERED. IDs GENERATED.");
      window.location.reload();
    } catch (err) {
      alert("UPLINK ERROR: DATABASE REJECTED SUBMISSION");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.scanlineOverlay}></div>
      
      <form className={styles.form} onSubmit={handleOpenPreview}>
        <header className={styles.header}>
          <h1 className={styles.sakanaTitle}>LEO CUP <span>S2</span></h1>
          <div className={styles.metaRow}>
            <span className={styles.tag}>REGISTRATION_OPEN</span>
            <span className={styles.tag}>LOC: NAKURU_COUNTY</span>
          </div>
        </header>

        <section className={styles.heroInput}>
          <label className={styles.label}>[TEAM_IDENTITY_ENTRY]</label>
          <input 
            name="teamName" 
            placeholder="ENTER SQUAD NAME" 
            className={styles.sakanaInput} 
            required 
          />
        </section>

        <div className={styles.grid}>
          {Array.from({ length: playerCount }).map((_, i) => (
            <div key={i} className={styles.playerCard}>
              <div className={styles.cardInfo}>
                <span className={styles.idTag}>{i === 0 ? "CPT" : `P${i + 1}`}</span>
              </div>
              <input 
                name={`player-${i}`} 
                placeholder="PLAYER FULL NAME" 
                className={styles.inputField} 
                required 
              />
            </div>
          ))}
        </div>

        <button type="submit" className={styles.actionBtn}>
          VERIFY SQUAD DATA
        </button>
      </form>

      {showPreview && (
        <div className={styles.modalOverlay}>
          <div className={styles.previewBox}>
            <h2 className={styles.previewTitle}>DATA_VERIFICATION</h2>
            <div className={styles.scrollArea}>
              <p className={styles.previewTeam}>TEAM: {formData.teamName}</p>
              <div className={styles.previewGrid}>
                {formData.players.map((name, i) => (
                  <div key={i} className={styles.previewPlayer}>
                    <span className={styles.goldText}>[{i + 1}]</span> {name}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.btnRow}>
              <button onClick={() => setShowPreview(false)} className={styles.cancelBtn}>EDIT</button>
              <button onClick={finalizeSubmission} className={styles.confirmBtn} disabled={loading}>
                {loading ? "GENERATING_IDS..." : "CONFIRM & SUBMIT"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registration;