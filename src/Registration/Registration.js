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

    if (players.some(name => name.trim().length < 3) || !whatsapp || teamName.length < 3) {
      alert("ERROR: PROVIDE FULL TEAM NAME, CAPTAIN WHATSAPP, AND ALL 12 PLAYER NAMES.");
      return;
    }

    setFormData({ teamName, captainWhatsapp: whatsapp, players });
    setShowPreview(true);
    document.body.style.overflow = 'hidden';
  };

  const finalizeSubmission = async () => {
    setLoading(true);
    const teamCustomId = generateID('TEAM');

    try {
      // 1. Insert Team and retrieve the database-generated UUID
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert([{ 
          team_id: teamCustomId,
          team_name: formData.teamName,
          captain_whatsapp: formData.captainWhatsapp,
          category: "UNDER 19",
          payment_status: "PENDING",
          is_approved: false
        }])
        .select()
        .single();

      if (teamError) throw teamError;

      // 2. Prepare Players linked via the UUID (teamData.id)
      const playersToInsert = formData.players.map((name, i) => {
        const pId = generateID('PLAYER', i);
        return {
          player_id: pId,
          team_id: teamData.id, 
          name: name,
          qr_string: `https://leocup.com/verify/${pId}`,
          verified: false
        };
      });

      const { error: playerError } = await supabase.from('players').insert(playersToInsert);
      
      if (playerError) {
        // Cleanup orphaned team if player insertion fails
        await supabase.from('teams').delete().eq('id', teamData.id);
        throw playerError;
      }

      alert(`APPLICATION FILED: ${teamCustomId}. Awaiting Master Admin approval.`);
      window.location.reload();
      
    } catch (err) {
      console.error("Submission error:", err);
      alert(`CRITICAL ERROR: ${err.message || "DATABASE UPLINK FAILED"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.scanlineOverlay}></div>
        
        <form ref={formRef} className={styles.form} onSubmit={handleOpenPreview}>
          <header className={styles.header}>
            <h1 className={styles.sakanaTitle}>LEO FOOTBALL CUP <span>SEASON 2</span></h1>
            <div className={styles.metaRow}>
              <span className={styles.tag}>OFFICIAL REGISTRATION PAGE</span>
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
            <div className={styles.rulesDesktopGrid}>
              <div className={styles.ruleItem}>
                <strong>1. ADMIN REVIEW:</strong>
                <p>Data is inactive until Master Admin approval.</p>
              </div>
              <div className={styles.ruleItem}>
                <strong>2. PURGE POLICY:</strong>
                <p>Rejected applications result in permanent data deletion.</p>
              </div>
              <div className={styles.ruleItem}>
                <strong>3. PAYMENT:</strong>
                <p>Manual verification required for "PAID" status.</p>
              </div>
              <div className={styles.ruleItem}>
                <strong>4. ACCESS:</strong>
                <p>Only Vansh can grant super admin or admin access.</p>
              </div>
            </div>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={acceptedRules} onChange={(e) => setAcceptedRules(e.target.checked)} required />
              <span>I AGREE TO THE DATA RETENTION AND APPROVAL POLICIES.</span>
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
                <button onClick={() => { setShowPreview(false); document.body.style.overflow = 'auto'; }} className={styles.cancelBtn}>EDIT</button>
                <button onClick={finalizeSubmission} className={styles.confirmBtn} disabled={loading}>
                  {loading ? "INITIALIZING..." : "SUBMIT APPLICATION"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Registration;