import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import styles from './Registration.module.css';
import Navbar from '../Navbar/Navbar';

const Registration = () => {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [formData, setFormData] = useState({ 
    teamName: '', 
    captainWhatsapp: '', 
    players: Array(12).fill({ name: '', jersey: '' }) 
  });
  const formRef = useRef(null);

  const playerCount = 12;
  const SUPPORT_CONTACT = "+254 712 345 678";

  const generateID = (type, index = null) => {
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return type === 'TEAM' ? `LEO-S2-T-${random}` : `LEO-S2-P${index + 1}-${random}`;
  };

  const handleOpenPreview = (e) => {
    e.preventDefault();
    const data = new FormData(formRef.current);
    const teamName = data.get('teamName').toUpperCase();
    const whatsapp = data.get('captainWhatsapp');
    
    const players = Array.from({ length: playerCount }).map((_, i) => ({
      name: data.get(`player-${i}`).toUpperCase(),
      jersey: data.get(`jersey-${i}`)
    }));

    if (players.some(p => p.name.trim().length < 3 || !p.jersey) || !whatsapp || teamName.length < 3) {
      alert("ERROR: PROVIDE FULL TEAM NAME, WHATSAPP, AND ALL PLAYER NAMES/JERSEY NUMBERS.");
      return;
    }

    setFormData({ teamName, captainWhatsapp: whatsapp, players });
    setShowPreview(true);
    document.body.style.overflow = 'hidden';
  };

  const finalizeSubmission = async () => {
    setLoading(true);
    const teamCustomId = generateID('TEAM');

    const playersData = formData.players.map((player, i) => ({
      player_id: generateID('PLAYER', i),
      name: player.name,
      jersey: player.jersey,
      verified: false
    }));

    try {
      const { error } = await supabase
        .from('public_reg')
        .insert([{ 
          team_id: teamCustomId,
          team_name: formData.teamName,
          captain_whatsapp: formData.captainWhatsapp,
          players: playersData, 
          category: "UNDER 19",
          payment_status: "PENDING",
          is_approved: false,
          status: 'PENDING'
        }]);

      if (error) throw error;
      setSubmittedId(teamCustomId);
      setShowPreview(false);
      setShowSuccess(true);
      
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
                <span className={styles.idTag}>
                  {i === 0 ? "CAPTAIN" : `PLAYER ${String(i + 1).padStart(2, '0')}`}
                </span>
                
<div className={styles.inputGroup}>
  <input 
    name={`jersey-${i}`} 
    type="number" 
    placeholder="00" 
    min="0" 
    max="99" 
    className={styles.jerseyInput} 
    onKeyDown={(e) => ["e", "E", "-", "+"].includes(e.key) && e.preventDefault()}
    required 
  />
  <input 
    name={`player-${i}`} 
    placeholder="FULL NAME" 
    className={styles.nameInput} 
    required 
  />
</div>
                {i === 0 && (
                  <div className={styles.whatsappBox}>
                    <label>CAPTAIN'S WHATSAPP NUMBER</label>
                    <input name="captainWhatsapp" placeholder="+254..." className={styles.contactInput} required />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={styles.rulesSection}>
  <label className={styles.label}>TOURNAMENT ADVISORY</label>
  <div className={styles.rulesDesktopGrid}>
    <div className={styles.ruleItem}>
      <strong>1. ELIGIBILITY AUDIT</strong> 
      <p>Submissions remain pending until a mandatory age and identity audit is completed.</p>
    </div>
    <div className={styles.ruleItem}>
      <strong>2. SLOT CONFIRMATION</strong> 
      <p>Participation is guaranteed only after payment and roster clearance.</p>
    </div>
    <div className={styles.ruleItem}>
      <strong>3. ROSTER FINALIZATION</strong> 
      <p>Details cannot be modified once the audit begins.</p>
    </div>
    <div className={styles.ruleItem}>
      <strong>4. CONDUCT CODE</strong> 
      <p>Teams must adhere to professional standards or face disqualification.</p>
    </div>
    <div className={styles.ruleItem}>
      <strong>5. VERIFICATION & PAYMENTS</strong>
      <p>
        You will be contacted to submit birth certificates and payments. 
        <strong className={styles.warning}> DO NOT</strong> make payments to any number until contacted directly by the 
        <strong className={styles.warning}> LEO CLUB OF NAKURU</strong>. Reach out to 
        nakuruleoclub@gmail.com for validation.
      </p>
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
                  {formData.players.map((p, i) => (
                    <div key={i} className={styles.previewPlayer}>
                      <span className={styles.goldText}>#{p.jersey}</span> {p.name}
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.btnRow}>
                <button onClick={finalizeSubmission} className={styles.confirmBtn} disabled={loading}>
                  {loading ? "INITIALIZING..." : "SUBMIT APPLICATION"}
                </button>
                <button onClick={() => { setShowPreview(false); document.body.style.overflow = 'auto'; }} className={styles.cancelBtn}>EDIT SQUAD</button>
              </div>
            </div>
          </div>
        )}

       {showSuccess && (
  <div className={styles.modalOverlay}>
    <div className={styles.successBox}>
      <div className={styles.successIcon}>✓</div>
      <h2 className={styles.sakanaTitle}>FILED_SUCCESSFULLY</h2>
      <p className={styles.idText}>TEAM_ID: <span>{submittedId}</span></p>
      <p className={styles.descText}>Your application is pending approval. Please save your Team ID.</p>
      
      <div className={styles.supportBox}>
        <p>For further queries, contact support:</p>
        <a href={`tel:${SUPPORT_CONTACT}`} className={styles.supportLink}>{SUPPORT_CONTACT}</a>
      </div>

      {/* Button is now centered via the .successBox flex properties */}
      <button onClick={() => window.location.reload()} className={styles.confirmBtnCentered}>
        CLOSE
      </button>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default Registration;