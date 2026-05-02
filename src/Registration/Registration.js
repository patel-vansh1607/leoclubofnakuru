import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import styles from './Registration.module.css';
import Navbar from '../Navbar/Navbar';

const Registration = () => {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [formData, setFormData] = useState({ teamName: '', captainWhatsapp: '', players: Array(12).fill('') });
  const formRef = useRef(null);

  const playerCount = 12;

  // Professional ID Generation (LEO-S2-XXXX)
  const generateID = (type, index = null) => {
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return type === 'TEAM' ? `LEO-S2-T-${random}` : `LEO-S2-P${index + 1}-${random}`;
  };

  const handleOpenPreview = (e) => {
    e.preventDefault();
    const data = new FormData(formRef.current);
    const teamName = data.get('teamName').toUpperCase();
    const whatsapp = data.get('captainWhatsapp');
    const players = Array.from({ length: playerCount }).map((_, i) => data.get(`player-${i}`).toUpperCase());

    // Strict Validation: Every player name and the WhatsApp contact must be present
    if (players.some(name => name.trim().length < 3) || !whatsapp || teamName.length < 3) {
      alert("ERROR: PROVIDE FULL TEAM NAME, CAPTAIN WHATSAPP, AND ALL 12 PLAYER NAMES.");
      return;
    }

    setFormData({ teamName, captainWhatsapp: whatsapp, players });
    setShowPreview(true);
  };

  const finalizeSubmission = async () => {
    setLoading(true);
    const teamId = generateID('TEAM');
    
    const squadData = formData.players.map((name, i) => ({
      player_id: generateID('PLAYER', i),
      name: name,
      qr_string: `VAL_P_${generateID('PLAYER', i)}`,
      verified: false 
    }));

    try {
      const { error } = await supabase
        .from('registrations')
        .insert([{ 
          team_name: formData.teamName,
          team_id: teamId,
          captain_whatsapp: formData.captainWhatsapp,
          category: "UNDER 19",
          players: squadData,
          payment_status: "PENDING",
          created_at: new Date()
        }]);

      if (error) throw error;
      alert("APPLICATION RECEIVED. VERIFYING AGES AND PAYMENT STATUS...");
      window.location.reload();
    } catch (err) {
      alert("UPLINK FAILURE: DATABASE REJECTED PAYLOAD");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar />
    <div className={styles.container}>
      <div className={styles.scanlineOverlay}></div>
      
      <form ref={formRef} className={styles.form} onSubmit={handleOpenPreview}>
        <header className={styles.header}>
          <h1 className={styles.sakanaTitle}>LEO FOOTBALL CUP <span>SEASON 2</span></h1>
          <div className={styles.metaRow}>
            <span className={styles.tag}>OFFICAL REGISTRATION PAGE</span>
            <span className={styles.tag}>U19_ONLY</span>
          </div>
        </header>

        <section className={styles.heroInput}>
          <label className={styles.label}>TEAM NAME</label>
          <input name="teamName" placeholder="TEAM NAME..." className={styles.sakanaInput} required />
        </section>

        <div className={styles.grid}>
          {Array.from({ length: playerCount }).map((_, i) => (
            <div key={i} className={styles.playerCard}>
              <span className={styles.idTag}>{i === 0 ? "CAPTAIN" : `PLAYER_P${i + 1}`}</span>
              <input name={`player-${i}`} placeholder="FULL NAME" className={styles.inputField} required />
              {i === 0 && (
                <div className={styles.whatsappBox}>
                  <label>WHATSAPP (CAPTAIN ONLY)</label>
                  <input name="captainWhatsapp" placeholder="+254..." className={styles.contactInput} required />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.rulesSection}>
          <label className={styles.label}>TOURNAMENT_ADVISORY</label>
          <div className={styles.rulesScroll}>
            <p>1. <strong>PENDING STATUS:</strong> Registration is <strong>NOT</strong> complete upon submission.</p>
            <p>2. <strong>AGE AUDIT:</strong> Leo Club will audit all players. Any player 19+ results in team disqualification.</p>
            <p>3. <strong>PAYMENT:</strong> Confirmation will only be sent via WhatsApp after the registration fee is cleared.</p>
            <p>4. <strong>ID ACTIVATION:</strong> QR codes remain inactive until physical certificates are verified.</p>
          </div>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              checked={acceptedRules} 
              onChange={(e) => setAcceptedRules(e.target.checked)} 
              required 
            />
            <span>I UNDERSTAND REGISTRATION IS PENDING UNTIL VERIFICATION AND PAYMENT.</span>
          </label>
        </div>

        <button type="submit" className={styles.actionBtn} disabled={!acceptedRules}>
          PROCEED TO REVIEW
        </button>
      </form>

      {showPreview && (
        <div className={styles.modalOverlay}>
          <div className={styles.previewBox}>
            <h2 className={styles.previewTitle}>VERIFY_SQUAD</h2>
            <div className={styles.scrollArea}>
              <p className={styles.previewTeam}>{formData.teamName}</p>
              <p className={styles.previewContact}>CONTACT: {formData.captainWhatsapp}</p>
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
                {loading ? "INITIALIZING..." : "SUBMIT APPLICATION"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Registration;