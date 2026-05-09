import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Howl } from 'howler';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  
  faCircleNotch, 
  faCheckCircle, 
  faTimesCircle, 
  faFingerprint,
  faExpand,
  faUserShield
} from '@fortawesome/free-solid-svg-icons';
import s from './ScoreVerify.module.css';

const ScoreVerify = () => {
  const [status, setStatus] = useState('ready'); 
  const [player, setPlayer] = useState(null);
  const [scannerReady, setScannerReady] = useState(false);
  const scannerRef = useRef(null);
  const isProcessing = useRef(false);

  // High-performance sound effects (Retained your URLs)
  const sounds = useRef({
    success: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'], volume: 0.5 }),
    error: new Howl({ src: ['https://res.cloudinary.com/dxgkcyfrl/video/upload/v1778316785/mixkit-wrong-answer-fail-notification-946_x1n4mf.wav'], volume: 0.5 }),
    heartbeat: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3'], loop: true, volume: 0.2 })
  });

  const handleScan = useCallback(async (decodedText) => {
    if (isProcessing.current || status !== 'ready') return;
    
    // Strict ID validation
    const upperText = decodedText.trim().toUpperCase();
    if (!upperText.includes('LEO-CUP-')) return;

    isProcessing.current = true;
    setStatus('verifying');
    sounds.current.heartbeat.play();
    if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback

    try {
      // Direct query for speed
      const { data, error } = await supabase
        .from('players')
        .select(`
          name, 
          jersey_number, 
          teams (team_name)
        `)
        .eq('player_id', upperText)
        .maybeSingle();

      sounds.current.heartbeat.stop();

      if (data && !error) {
        sounds.current.success.play();
        setPlayer(data);
        setStatus('success');
      } else {
        throw new Error("NOT_FOUND");
      }
    } catch (err) {
      sounds.current.heartbeat.stop();
      sounds.current.error.play();
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Error buzz
      setStatus('error');
    }

    // Cooldown period
    setTimeout(() => {
      setStatus('ready');
      setPlayer(null);
      isProcessing.current = false;
    }, 3000); 
  }, [status]);

 useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    const config = { 
      fps: 60, // Maximum frame rate
      // Large box forces full-frame scanning
      qrbox: (vw, vh) => { return { width: vw, height: vh } }, 
      aspectRatio: 1.0,
      disableFlip: false,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true // Native mobile hardware accel
      }
    };

    html5QrCode.start(
      { facingMode: "environment" }, 
      config, 
      (decodedText) => {
        if (decodedText.toUpperCase().includes('LEO-CUP-')) {
          handleScan(decodedText);
        }
      }
    ).then(() => setScannerReady(true))
     .catch(err => console.error("Ultra-scan failed:", err));

    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.getState() === 2) {
          scannerRef.current.stop()
            .then(() => scannerRef.current.clear())
            .catch(e => console.warn("Scanner cleanup failed:", e));
        }
      }
    };
  }, [handleScan]);
  
  return (
    <div className={s.page}>
      <div className={s.container}>
        {/* TOP HUD */}
        <div className={s.header}>
          <div className={s.themeIcon}><FontAwesomeIcon icon={faUserShield} /></div>
          <div className={s.headerText}>
            <h1>CORE<span>_VERIFIER</span></h1>
            <p>ENCRYPTED_SQUAD_UPLINK</p>
          </div>
          <div className={s.liveIndicator}>
            <div className={s.dot}></div>
            LIVE
          </div>
        </div>

        {/* SCANNER VIEWPORT */}
        <div className={`${s.scannerFrame} ${!scannerReady ? s.loading : ''}`}>
          <div id="reader" className={s.reader}></div>
          
          {/* UI OVERLAY LAYER */}
          <div className={s.interfaceLayer}>
             {status === 'ready' && (
               <>
                 <div className={s.laser}></div>
                 <div className={s.reticle}>
                   <div className={s.cTopLeft}></div>
                   <div className={s.cTopRight}></div>
                   <div className={s.cBottomLeft}></div>
                   <div className={s.cBottomRight}></div>
                 </div>
                 <div className={s.hint}>
                    <FontAwesomeIcon icon={faExpand} className={s.pulse} />
                    <span>SCAN PLAYER CHIP</span>
                 </div>
               </>
             )}
          </div>

          {/* DYNAMIC FEEDBACK OVERLAYS */}
          {status !== 'ready' && (
            <div className={`${s.overlay} ${s[status]}`}>
              <div className={s.statusContent}>
                {status === 'verifying' && (
                  <>
                    <FontAwesomeIcon icon={faCircleNotch} spin className={s.spinIcon} />
                    <h2 className={s.verifyingText}>DECRYPTING...</h2>
                  </>
                )}

                {status === 'success' && (
                  <div className={s.resultCard}>
                    <div className={s.badge}>
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </div>
                    <span className={s.label}>IDENTITY_CONFIRMED</span>
                    <h2 className={s.pName}>{player?.name}</h2>
                    <div className={s.pMeta}>
                       <div className={s.metaItem}>
                          <small>TEAM</small>
                          <strong>{player?.teams?.team_name}</strong>
                       </div>
                       <div className={s.metaItem}>
                          <small>SQUAD_NO</small>
                          <strong>#{player?.jersey_number}</strong>
                       </div>
                    </div>
                  </div>
                )}

                {status === 'error' && (
                  <>
                    <FontAwesomeIcon icon={faTimesCircle} className={s.errorIcon} />
                    <h2 className={s.errorText}>ACCESS_DENIED</h2>
                    <p className={s.errorSub}>UNKNOWN_IDENTIFIER</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SYSTEM STATUS FOOTER */}
        <div className={s.footer}>
          <div className={s.sysInfo}>
            <FontAwesomeIcon icon={faFingerprint} />
            <span>DB_UPLINK: ACTIVE</span>
          </div>
          <div className={s.version}>
            v2.1.0 // SECURE_BOOT
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreVerify;