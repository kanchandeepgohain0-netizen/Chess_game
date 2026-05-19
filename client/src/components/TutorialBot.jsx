import React from 'react';
import styles from './TutorialBot.module.css';

export default function TutorialBot({ text, onNext, isLastStep }) {
  return (
    <div className={styles.botContainer}>
      <div className={styles.botIcon}>🤖</div>
      <div className={styles.speechBubble}>
        <p className={styles.botText}>{text}</p>
        <button 
          className={styles.nextButton} 
          onClick={onNext}
        >
          {isLastStep ? 'Done' : 'Next ➔'}
        </button>
      </div>
    </div>
  );
}
