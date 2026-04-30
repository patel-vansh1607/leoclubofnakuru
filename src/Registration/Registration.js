import React from 'react';
import styles from './Registration.module.css';

const Registration = () => {
  const playerCount = 12;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Use FormData to grab everything at once
    const formData = new FormData(e.target);
    const playerNames = [];
    
    for (let i = 0; i < playerCount; i++) {
      playerNames.push(formData.get(`player-${i}`));
    }

    console.log("Final Squad:", playerNames);
    alert("Team Registered!");
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.playerForm} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Leo Football Cup</h2>
        
        <div className={styles.grid}>
          {Array.from({ length: playerCount }).map((_, i) => (
            <div key={i} className={styles.field}>
              <label>Player {i + 1}</label>
              <input 
                name={`player-${i}`} 
                type="text" 
                placeholder="Name" 
                required 
              />
            </div>
          ))}
        </div>

        <button type="submit" className={styles.btn}>Submit Roster</button>
      </form>
    </div>
  );
};

export default Registration;