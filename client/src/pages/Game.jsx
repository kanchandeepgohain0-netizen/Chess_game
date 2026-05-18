import React, { useState, useEffect } from "react";
import ChessBoard from "../components/board/ChessBoard.jsx";
import useChessGame from "../hooks/useChessGame";
import styles from "./Game.module.css";

function Game({ navigateTo, gameMode }) {
    const { board, legalMoves, onSquareClick, turn } = useChessGame();
    const [showQuitModal, setShowQuitModal] = useState(false);

    // Timer state
    const [playerTime, setPlayerTime] = useState(600);
    const [opponentTime, setOpponentTime] = useState(600);

    // If classical mode, we don't use timers
    const hasTimer = gameMode !== 'classical';

    useEffect(() => {
        if (!hasTimer) return;
        
        let time = 600; // default 10 minutes
        if (gameMode === 'blitz') time = 180; // 3 minutes
        else if (gameMode === 'rapid') time = 300; // 5 minutes
        
        setPlayerTime(time);
        setOpponentTime(time);
    }, [gameMode, hasTimer]);

    useEffect(() => {
        if (!hasTimer) return;

        const timer = setInterval(() => {
            if (turn === 'w') {
                setPlayerTime(prev => Math.max(0, prev - 1));
            } else {
                setOpponentTime(prev => Math.max(0, prev - 1));
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [turn, hasTimer]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleConfirmQuit = () => {
        setShowQuitModal(false);
        // Decrease ELO logic would go here if we had backend
        navigateTo('home');
    };

    // Mock player data for now
    const opponent = {
        name: "Grandmaster_Bot",
        elo: 2850,
        avatar: "🤖"
    };

    const player = {
        name: "Player_01",
        elo: 1200,
        avatar: "👤"
    };

    return (
        <div className={styles.container}>

            <button
                className={styles.quitButton}
                onClick={() => setShowQuitModal(true)}
            >
                ← Quit Game
            </button>

            <div className={styles.gameWrapper}>
                {/* Opponent Info (Top) */}
                <div className={styles.playerInfo}>
                    <div className={styles.playerAvatar}>{opponent.avatar}</div>
                    <div className={styles.playerDetails}>
                        <p className={styles.playerName}>{opponent.name}</p>
                        <p className={styles.playerElo}>Rating: {opponent.elo}</p>
                    </div>
                    {hasTimer && (
                        <div className={`${styles.playerTimer} ${turn === 'b' ? styles.active : ''}`}>
                            {formatTime(opponentTime)}
                        </div>
                    )}
                </div>

                {/* The actual chess board */}
                <div className={styles.boardContainer}>
                    <ChessBoard
                        board={board}
                        legalMoves={legalMoves}
                        onSquareClick={onSquareClick}
                    />
                </div>

                {/* Player Info (Bottom) */}
                <div className={styles.playerInfo}>
                    <div className={styles.playerAvatar}>{player.avatar}</div>
                    <div className={styles.playerDetails}>
                        <p className={styles.playerName}>{player.name}</p>
                        <p className={styles.playerElo}>Rating: {player.elo}</p>
                    </div>
                    {hasTimer && (
                        <div className={`${styles.playerTimer} ${turn === 'w' ? styles.active : ''}`}>
                            {formatTime(playerTime)}
                        </div>
                    )}
                </div>
            </div>

            {/* Quit Warning Modal */}
            {showQuitModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalTitle}>Are you sure you want to quit?</h3>
                        <p className={styles.modalWarning}>
                            If you quit now, you will lose the game and your ELO rating will decrease.
                        </p>
                        <div className={styles.modalButtons}>
                            <button
                                className={`${styles.modalButton} ${styles.cancelBtn}`}
                                onClick={() => setShowQuitModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={`${styles.modalButton} ${styles.confirmBtn}`}
                                onClick={handleConfirmQuit}
                            >
                                Confirm Quit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Game;
