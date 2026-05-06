import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Howl } from 'howler';
import { supabase } from '../supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBolt, 
  faCircleNotch, 
  faCheckCircle, 
  faTimesCircle, 
  faMicrochip,
  faExpand
} from '@fortawesome/free-solid-svg-icons';
import s from './ScoreVerify.module.css';

const ScoreVerify = () => {
  const [status, setStatus] = useState('ready'); 
  const [player, setPlayer] = useState(null);
  const scannerRef = useRef(null);
  const isProcessing = useRef(false);

  const sounds = useRef({
    success: new Howl({ src: ['https://www.reactsounds.com/sounds/notification/success.mp3'], volume: 0.8 }),
    error: new Howl({ src: ['https://www.reactsounds.com/sounds/notification/error.mp3'], volume: 0.8 }),
    heartbeat: new Howl({ src: ['https://www.reactsounds.com/sounds/ambient/heartbeat.mp3'], loop: true, volume: 0.4 })
  });

  const handleScan = useCallback(async (decodedText) => {
    if (isProcessing.current) return;
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

    // Auto-Reset logic for "Quick Scan"
    setTimeout(() => {
      setStatus('ready');
      setPlayer(null);
      isProcessing.current = false;
    }, 2800); 
  }, []);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" }, 
          { 
            fps: 25, 
            qrbox: (viewfinderWidth, viewfinderHeight) => {
                // Dynamic big scan area: 80% of the smallest dimension
                const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                const size = Math.floor(minEdge * 0.8);
                return { width: size, height: size };
            },
            aspectRatio: 1.0 
          }, 
          handleScan
        );
      } catch (err) {
        console.error("Scanner failed", err);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().then(() => scannerRef.current.clear()).catch(() => {});
      }
      sounds.current.heartbeat.stop();
    };
  }, [handleScan]);

  return (
    <div className={s.mainWrapper}>
      <div className={s.scannerContainer}>
        {/* Permanent Camera Node to prevent removeChild error */}
        <div id="reader" className={s.reader}></div>
        
        {/* Dynamic Overlays */}
        {status !== 'ready' && (
          <div className={`${s.fullOverlay} ${s[status]}`}>
            {status === 'verifying' && (
              <div className={s.content}>
                <FontAwesomeIcon icon={faCircleNotch} spin className={s.loader} />
                <h2 className={s.statusTitle}>VALIDATING...</h2>
              </div>
            )}

            {status === 'success' && (
              <div className={s.content}>
                <FontAwesomeIcon icon={faCheckCircle} className={s.popIcon} />
                <h2 className={s.authTitle}>AUTHORIZED</h2>
                <div className={s.playerInfo}>
                  <p className={s.playerName}>{player?.name}</p>
                  <p className={s.playerSub}>{player?.teams?.team_name} | #{player?.jersey_number}</p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className={s.content}>
                <FontAwesomeIcon icon={faTimesCircle} className={s.popIcon} />
                <h2 className={s.errorTitle}>ACCESS DENIED</h2>
                <p>UNREGISTERED CREDENTIALS</p>
              </div>
            )}
          </div>
        )}

        {/* Framing Guides for the user */}
        {status === 'ready' && (
            <div className={s.uiGuides}>
                <div className={s.targetBox}></div>
                <p className={s.guideText}><FontAwesomeIcon icon={faExpand} /> ALIGN QR CODE</p>
            </div>
        )}
      </div>

      <div className={s.bottomBar}>
        <FontAwesomeIcon icon={faMicrochip} />
        <span>LEO CUP SYSTEM v2.06</span>
      </div>
    </div>
  );
};

export default ScoreVerify;