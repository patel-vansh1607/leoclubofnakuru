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
  faBolt,
  faUserShield
} from '@fortawesome/free-solid-svg-icons';
import s from './ScoreVerify.module.css';

const ScoreVerify = () => {
  const [status, setStatus] = useState('ready'); 
  const [player, setPlayer] = useState(null);
  const [scannerReady, setScannerReady] = useState(false);
  
  const scannerRef = useRef(null);
  const sounds = useRef(null);
  
  const lastScanTime = useRef(0);
  const ignoreScansUntil = useRef(0);

  // Mute internal library race warnings globally during setup
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = function (...args) {
      const msg = args[0]?.message || args[0] || '';
      if (typeof msg === 'string' && msg.includes('Cannot transition to a new state')) {
        return;
      }
      originalConsoleError.apply(console, args);
    };
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  if (!sounds.current) {
    sounds.current = {
      success: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'], volume: 0.5 }),
      error: new Howl({ src: ['https://res.cloudinary.com/dxgkcyfrl/video/upload/v1778316785/mixkit-wrong-answer-fail-notification-946_x1n4mf.wav'], volume: 0.5 }),
      heartbeat: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3'], loop: true, volume: 0.2 })
    };
  }

  const handleScan = useCallback(async (decodedText) => {
    const now = Date.now();
    if (now < ignoreScansUntil.current) return;
    if (now - lastScanTime.current < 1500) return; 
    lastScanTime.current = now;

    const upperText = decodedText.trim().toUpperCase();
    if (!upperText.includes('LEO-CUP-')) return;

    ignoreScansUntil.current = now + 5000;
    setStatus('verifying');
    sounds.current.heartbeat.play();
    if (navigator.vibrate) navigator.vibrate(50);

    try {
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
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      setStatus('error');
    }

    setTimeout(() => {
      setStatus('ready');
      setTimeout(() => {
        setPlayer(null);
        ignoreScansUntil.current = Date.now();
      }, 300);
    }, 3000); 
  }, []);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    // High performance config parameters
    const config = { 
      fps: 60, 
      qrbox: undefined, // Fully unconstrained view rendering for extreme distance scans
      aspectRatio: 1.0,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true 
      }
    };

    // FIXED: Formatted strictly to match the library's required syntax blueprint
    const cameraTargetOptions = {
      facingMode: "environment"
    };

    const processIncomingText = (rawText) => {
      if (Date.now() < ignoreScansUntil.current) return;
      handleScan(rawText);
    };

    // Clean initialization line wrapper execution
    html5QrCode.start(
      cameraTargetOptions, 
      config, 
      processIncomingText,
      () => {}
    )
    .then(() => {
      setScannerReady(true);
      
      // Apply focal length parameters to the live track AFTER camera channel negotiation succeeds
      try {
        const videoTrack = html5QrCode.getRunningTrack();
        if (videoTrack && typeof videoTrack.applyConstraints === 'function') {
          videoTrack.applyConstraints({
            width: { min: 1280, ideal: 1920, max: 3840 },
            height: { min: 720, ideal: 1080, max: 2160 },
            advanced: [{ focusMode: "continuous" }, { zoom: 1.0 }]
          }).catch(e => console.warn("Fine-tuning constraints skipped by hardware:", e));
        }
      } catch (trackErr) {
        console.warn("Optical track optimization bypassed:", trackErr);
      }
    })
    .catch(err => {
      console.error("Critical: Camera matrix failed to connect:", err);
    });

    return () => {
      if (scannerRef.current) {
        const state = scannerRef.current.getState();
        if (state === 2 || state === 3) {
          scannerRef.current.stop()
            .then(() => scannerRef.current.clear())
            .catch(e => console.warn("Clean device stream release skipped:", e));
        }
      }
      if (sounds.current) {
        Object.values(sounds.current).forEach(sound => sound.unload());
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
            <p>LONG_RANGE_STABILIZED</p>
          </div>
          <div className={s.liveIndicator}>
            <div className={s.dot}></div>
            AUTO
          </div>
        </div>

        {/* SCANNER VIEWPORT */}
        <div className={`${s.scannerFrame} ${!scannerReady ? s.loading : ''}`}>
          <div id="reader" className={s.reader}></div>
          
          {/* OMNIDIRECTIONAL INTERFACE OVERLAY */}
          <div className={s.interfaceLayer}>
             {status === 'ready' && (
               <>
                 <div className={s.laser}></div>
                 <div className={s.openViewportHighlight}></div>
                 <div className={s.hint}>
                    <FontAwesomeIcon icon={faBolt} className={s.pulse} />
                    <span>FAR-FIELD SCANNING // POINT ANYWHERE</span>
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
                    <h2 className={s.pName}>{player?.name || "---"}</h2>
                    <div className={s.pMeta}>
                       <div className={s.metaItem}>
                          <small>TEAM</small>
                          <strong>{player?.teams?.team_name || "UNKNOWN"}</strong>
                       </div>
                       <div className={s.metaItem}>
                          <small>SQUAD_NO</small>
                          <strong>{player?.jersey_number ? `#${player.jersey_number}` : "##"}</strong>
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
            <span>NATIVE_OPTIMIZATION: STABLE</span>
          </div>
          <div className={s.version}>
            v3.5.0 // ALIGNED
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreVerify;