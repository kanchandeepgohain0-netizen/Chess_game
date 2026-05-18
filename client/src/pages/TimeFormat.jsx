import { useState } from 'react';
import styles from './TimeFormat.module.css';

function TimeFormat({ navigateTo }) {
  const [selectedFormat, setSelectedFormat] = useState(null);

  const formats = [
    {
      id: 'classical',
      name: 'Classical',
      icon: '♜',
      time: 'Unlimited',
      description: 'Play without time constraints',
      details: 'Best for strategic play'
    },
    {
      id: 'rapid',
      name: 'Rapid',
      icon: '♞',
      time: '5 min',
      description: 'Faster pace with 5 minutes per player',
      details: 'Balanced and challenging'
    },
    {
      id: 'blitz',
      name: 'Blitz',
      icon: '♝',
      time: '3 min',
      description: 'Quick matches with 3 minutes per player',
      details: 'Test your speed'
    }
  ];

  const handleSelect = (formatId) => {
    setSelectedFormat(formatId);
    setTimeout(() => {
      navigateTo('matchmaking', formatId);
    }, 300);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => navigateTo('home')}
        >
          ← Back
        </button>
        <h2 className={styles.title}>Select Time Format</h2>
        <div className={styles.headerSpacer}></div>
      </header>

      <main className={styles.main}>
        <p className={styles.instructionText}>Choose your preferred game speed to find matching opponents</p>
        
        <div className={styles.formatsContainer}>
          {formats.map((format) => (
            <button
              key={format.id}
              className={`${styles.formatCard} ${selectedFormat === format.id ? styles.selected : ''}`}
              onClick={() => handleSelect(format.id)}
            >
              <div className={styles.formatIcon}>{format.icon}</div>
              <h3 className={styles.formatName}>{format.name}</h3>
              <p className={styles.formatTime}>{format.time}</p>
              <p className={styles.formatDescription}>{format.description}</p>
              <span className={styles.formatDetails}>{format.details}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

export default TimeFormat;
