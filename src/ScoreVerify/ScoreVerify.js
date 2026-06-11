import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../supabaseClient';
import s from './ScoreVerify.module.css';

const ScoreVerify = () => {
  const [player, setPlayer] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const scannerRef = useRef(null);
  const lastScanTime = useRef(0);
  const clearTimerRef = useRef(null);

  const handleScan = useCallback(async (decodedText) => {
    const now = Date.now();
    
    // Fast 400ms scan debounce to stop accidental duplicate frame captures
    if (now - lastScanTime.current < 400) return;
    lastScanTime.current = now;

    const targetId = decodedText.trim();
    if (!targetId) return;

    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);

    try {
      const { data, error } = await supabase
        .from('players')
        .select(`
          name, 
          jersey_number, 
          teams (team_name)
        `)
        .eq('player_id', targetId)
        .maybeSingle();

      if (data && !error) {
        setPlayer(data);
        setErrorMsg(null);
      } else {
        throw new Error("ID_NOT_FOUND");
      }
    } catch (err) {
      setPlayer(null);
      setErrorMsg(`NOT FOUND: ${targetId}`);
    }

    // Auto-dismiss layout window clears out completely after exactly 3 seconds
    clearTimerRef.current = setTimeout(() => {
      setPlayer(null);
      setErrorMsg(null);
    }, 3000);
  }, []);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    html5QrCode.start(
      { facingMode: "environment" },
      { 
        fps: 60, 
        qrbox: (width, height) => {
          const size = Math.min(width, height) * 0.8;
          return { width: size, height: size };
        }
      }, 
      handleScan,
      () => {} 
    ).catch(err => console.error("Scanner failed to bind:", err));

    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      if (scannerRef.current) {
        const state = scannerRef.current.getState();
        if (state === 2 || state === 3) {
          scannerRef.current.stop()
            .then(() => scannerRef.current.clear())
            .catch(e => console.warn(e));
        }
      }
    };
  }, [handleScan]);
  
  return (
    <div className={s.page}>
      {/* FEEDBACK REGION MOVED ON TOP */}
      <div className={s.feedbackRegion}>
        {player && (
          <div className={`${s.messageCard} ${s.success}`}>
            <span className={s.statusTag}>FOUND</span>
            <h2 className={s.playerName}>{player.name}</h2>
            <div className={s.metaRow}>
              <span><strong>Team:</strong> {player.teams?.team_name || "UNKNOWN"}</span>
              <span><strong>Squad:</strong> {player.jersey_number ? `#${player.jersey_number}` : "##"}</span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className={`${s.messageCard} ${s.error}`}>
            <span className={s.statusTag}>FAILED</span>
            <p className={s.errorText}>{errorMsg}</p>
          </div>
        )}
      </div>

      {/* SCANNER VIEWPORT UNDER OVERLAYS */}
      <div className={s.scannerFrame}>
        <div id="reader" className={s.reader}></div>
      </div>
    </div>
  );
};

export default ScoreVerify;
