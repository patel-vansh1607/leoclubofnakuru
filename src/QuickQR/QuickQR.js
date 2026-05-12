import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

const QuickQR = ({ initialLink = "https://leofootball.online" }) => {
  const [link, setLink] = useState(initialLink);
  const [svg, setSvg] = useState('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        const svgString = await QRCode.toString(link, {
          type: 'svg',
          margin: 1, // Reduced margin for a cleaner look
          color: {
            dark: '#000000',
            light: '#ffffff'
          },
          width: 1000 // Sets the default internal size to 1000px for high-res handling
        });
        setSvg(svgString);
      } catch (err) {
        console.error(err);
      }
    };

    if (link) generateQR();
  }, [link]);

  const downloadQR = () => {
    // We wrap the SVG in a blob. Because it's an SVG, 
    // it will remain crystal clear even if you "enlarge" it later.
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const linkElement = document.createElement('a');
    linkElement.href = url;
    // Naming it clearly for your 2026 tournament files
    linkElement.download = `LeoCup_QR_${new Date().getTime()}.svg`;
    document.body.appendChild(linkElement);
    linkElement.click();
    
    document.body.removeChild(linkElement);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '20px',
      background: '#0a0a0a',
      color: 'white'
    }}>
      <h2 style={{ marginBottom: '20px', fontWeight: '800' }}>QR <span style={{ color: '#ffd700' }}>VECTOR</span> ENGINE</h2>

      <input 
        type="text" 
        value={link} 
        onChange={(e) => setLink(e.target.value)}
        placeholder="Enter URL for QR"
        style={{
          padding: '15px',
          width: '100%',
          maxWidth: '500px',
          borderRadius: '12px',
          border: '2px solid #333',
          background: '#111',
          color: '#fff',
          fontSize: '16px',
          marginBottom: '30px',
          textAlign: 'center'
        }}
      />

      <div 
        style={{ 
          width: '350px', 
          height: '350px', 
          background: 'white', 
          padding: '20px', 
          borderRadius: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        dangerouslySetInnerHTML={{ __html: svg }} 
        onClick={downloadQR} // Click the QR itself to download
      />

      <div style={{ marginTop: '40px' }}>
        <button 
          onClick={downloadQR}
          style={{
            padding: '15px 40px',
            backgroundColor: '#ffd700',
            color: '#000',
            border: 'none',
            borderRadius: '50px',
            fontWeight: '900',
            cursor: 'pointer',
            fontSize: '18px',
            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
          }}
        >
          DOWNLOAD VECTOR SVG
        </button>
      </div>
      
      <p style={{ marginTop: '25px', fontSize: '14px', color: '#666' }}>
        Status: Ready for high-resolution print or digital use.
      </p>
    </div>
  );
};

export default QuickQR;