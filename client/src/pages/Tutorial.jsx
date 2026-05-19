import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import ChessBoard from '../components/board/ChessBoard';
import TutorialBot from '../components/TutorialBot';
import { pieceDemos } from '../data/pieceDemos';
import styles from './Tutorial.module.css';

export default function Tutorial({ navigateTo }) {
  const [selectedPiece, setSelectedPiece] = useState('pawn');
  const [stepIndex, setStepIndex] = useState(0);
  const [boardFen, setBoardFen] = useState(pieceDemos['pawn'][0].fen);
  const [chessObj, setChessObj] = useState(new Chess(pieceDemos['pawn'][0].fen));

  const demo = pieceDemos[selectedPiece];
  const currentStep = demo[stepIndex];
  const isLastStep = stepIndex === demo.length - 1;

  // Update FEN when changing pieces or steps
  useEffect(() => {
    const step = pieceDemos[selectedPiece][stepIndex];
    if (step.fen) {
      const c = new Chess(step.fen);
      setBoardFen(c.fen());
      setChessObj(c);
    }
  }, [selectedPiece, stepIndex]);

  const handleNext = () => {
    if (isLastStep) {
      // Could show "Done" or auto-select next piece, for now just stay or go back
      if (selectedPiece === 'king') {
        navigateTo('home');
      }
      return;
    }
    
    const nextStepIndex = stepIndex + 1;
    const nextStep = demo[nextStepIndex];
    
    // Automatically move piece before fully setting the next step if we want to animate,
    // but the user requested simplicity: just jump/teleport to next step.
    setStepIndex(nextStepIndex);
  };

  const handlePieceSelect = (pieceKey) => {
    setSelectedPiece(pieceKey);
    setStepIndex(0);
  };

  const pieces = [
    { key: 'pawn', icon: '♟', label: 'Pawn' },
    { key: 'knight', icon: '♞', label: 'Knight' },
    { key: 'bishop', icon: '♝', label: 'Bishop' },
    { key: 'rook', icon: '♜', label: 'Rook' },
    { key: 'queen', icon: '♛', label: 'Queen' },
    { key: 'king', icon: '♚', label: 'King' }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigateTo('home')}>
          ← Back
        </button>
        <h1 className={styles.title}>How Chess Pieces Move</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Select Piece</h2>
          <div className={styles.pieceList}>
            {pieces.map((p) => (
              <button
                key={p.key}
                className={`${styles.pieceButton} ${selectedPiece === p.key ? styles.active : ''}`}
                onClick={() => handlePieceSelect(p.key)}
              >
                <span className={styles.pieceIcon}>{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.boardContainer}>
          <div className={styles.boardWrapper}>
            <ChessBoard 
              board={chessObj.board()}
              legalMoves={currentStep.highlights || []} 
              onSquareClick={() => {}} 
              checkmateSquare={null}
              mode="tutorial"
            />
          </div>
          
          <TutorialBot 
            text={currentStep.text} 
            onNext={handleNext} 
            isLastStep={isLastStep} 
          />
        </div>
      </main>
    </div>
  );
}
