import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Howl } from 'howler';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  
  faCircleNotch, 
  faCheckCircle, 
  faTimesCircle, 
  faMicrochip,
  faExpand,
  faShieldHalved
} from '@fortawesome/free-solid-svg-icons';
import s from './ScoreVerify.module.css';

const ScoreVerify = () => {
  const [status, setStatus] = useState('ready'); 
  const [player, setPlayer] = useState(null);
  const scannerRef = useRef(null);
  const isProcessing = useRef(false);

  const sounds = useRef({
    success: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'], volume: 0.6 }),
    error: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3'], volume: 0.6 }),
    heartbeat: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3'], loop: true, volume: 0.3 })
  });

  const handleScan = useCallback(async (decodedText) => {
    if (isProcessing.current) return;
    
    // Safety check for your specific ID format
    const upperText = decodedText.trim().toUpperCase();
    if (!upperText.includes('LEO-CUP-')) return;

    isProcessing.current = true;
    setStatus('verifying');
    sounds.current.heartbeat.play();

    try {
      const { data, error } = await supabase
        .from('players')
        .select('name, jersey_number, teams(team_name)')
        .eq('player_id', upperText)
        .single();

      sounds.current.heartbeat.stop();

      if (data && !error) {
        sounds.current.success.play();
        setPlayer(data);
        setStatus('success');
      } else {
        throw new Error("Invalid ID");
      }
    } catch (err) {
      sounds.current.heartbeat.stop();
      sounds.current.error.play();
      setStatus('error');
    }

    // Auto-reset after a delay
    setTimeout(() => {
      setStatus('ready');
      setPlayer(null);
      isProcessing.current = false;
    }, 3500); 
  }, []);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;
    
    // Capture the current heartbeat sound reference into a local variable
    const heartbeatRef = sounds.current.heartbeat;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" }, 
          { 
            fps: 30, 
            qrbox: (w, h) => {
                const size = Math.min(w, h) * 0.7;
                return { width: size, height: size };
            }
          }, 
          handleScan
        );
      } catch (err) {
        console.error("Scanner failed", err);
      }
    };

    startScanner();

    return () => {
      // Use the stable variable instead of the mutable .current
      if (html5QrCode.isScanning) {
        html5QrCode.stop().then(() => html5QrCode.clear());
      }
      
      // We use heartbeatRef here because we know exactly what it points to
      if (heartbeatRef) {
        heartbeatRef.stop();
      }
    };
  }, [handleScan]);
  return (
    <div className={s.page}>
      <div className={s.container}>
        {/* HEADER */}
        <div className={s.header}>
          <div className={s.glowIcon}><FontAwesomeIcon icon={faShieldHalved} /></div>
          <div className={s.headerText}>
            <h1>FIELD_VERIFIER</h1>
            <p>SQUAD_IDENTIFICATION_TERMINAL</p>
          </div>
        </div>

        {/* SCANNER AREA */}
        <div className={s.scannerFrame}>
          <div id="reader" className={s.reader}></div>
          
          {/* THE SCANNING UI GUIDES */}
          {status === 'ready' && (
            <>
              <div className={s.laser}></div>
              <div className={s.corners}>
                <div className={s.cTopLeft}></div>
                <div className={s.cTopRight}></div>
                <div className={s.cBottomLeft}></div>
                <div className={s.cBottomRight}></div>
              </div>
              <div className={s.guide}>
                <FontAwesomeIcon icon={faExpand} />
                <span>ALIGN_LEO_ID</span>
              </div>
            </>
          )}

          {/* STATUS OVERLAYS */}
          {status !== 'ready' && (
            <div className={`${s.overlay} ${s[status]}`}>
              {status === 'verifying' && (
                <div className={s.statusBox}>
                  <FontAwesomeIcon icon={faCircleNotch} spin className={s.iconVerifying} />
                  <h2>SEARCHING_DB...</h2>
                </div>
              )}

              {status === 'success' && (
                <div className={s.statusBox}>
                  <div className={s.successCircle}>
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                  <h2 className={s.successText}>AUTHORIZED</h2>
                  <div className={s.playerCard}>
                    <span className={s.teamName}>{player?.teams?.team_name}</span>
                    <span className={s.playerName}>{player?.name}</span>
                    <span className={s.jersey}>#{player?.jersey_number}</span>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className={s.statusBox}>
                  <FontAwesomeIcon icon={faTimesCircle} className={s.iconError} />
                  <h2 className={s.errorText}>DENIED</h2>
                  <p>INVALID_OR_UNREGISTERED</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className={s.footer}>
          <FontAwesomeIcon icon={faMicrochip} />
          <span>LEO CUP SECURE_CORE v2.06</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreVerify;