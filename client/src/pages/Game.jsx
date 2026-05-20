import React, { useState, useEffect, useRef } from "react";
import ChessBoard from "../components/board/ChessBoard.jsx";
import useChessGame from "../hooks/useChessGame";
import styles from "./Game.module.css";
import socket from "../services/socket";

function Game({ navigateTo, gameMode }) {
    const myColor = localStorage.getItem('myColor') || 'white';
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isBotGame = localStorage.getItem('isBotGame') === 'true';
    const activeRoomId = localStorage.getItem('roomId');
    const [activeGameId, setActiveGameId] = useState(localStorage.getItem('gameId'));
    
    const handleLocalMove = (move) => {
        // Both bot games and multiplayer games use server-side make_move flow
        socket.emit('make_move', {
            gameId: localStorage.getItem('gameId'),
            move,
            userId: user.userId
        });
    };

    const { board, legalMoves, onSquareClick, applyMove, turn, isCheckmate, checkmateSquare, game } = useChessGame(myColor, handleLocalMove);
    const [showQuitModal, setShowQuitModal] = useState(false);
    const [isBotThinking, setIsBotThinking] = useState(false);
    const [opponentDisconnected, setOpponentDisconnected] = useState(false);
    const [disconnectCountdown, setDisconnectCountdown] = useState(60);
    const disconnectTimerRef = useRef(null);


    const [playerTime, setPlayerTime] = useState(600);
    const [opponentTime, setOpponentTime] = useState(600);
    const botDepth = parseInt(localStorage.getItem('botDepth') || '10', 10);
    const botElo = parseInt(localStorage.getItem('botElo') || '1200', 10);

    const hasTimer = gameMode !== 'classical';
    const botTimerRef = useRef(null);

    useEffect(() => {
        if (!hasTimer) return;
        let time = 600;
        if (gameMode === 'blitz') time = 180;
        else if (gameMode === 'rapid') time = 300;
        setPlayerTime(time);
        setOpponentTime(time);
    }, [gameMode, hasTimer]);


    useEffect(() => {
        if (!hasTimer || isCheckmate) return;
        const isMyTurn = (myColor === 'white' && turn === 'w') || (myColor === 'black' && turn === 'b');
        const timer = setInterval(() => {
            if (isMyTurn) {
                setPlayerTime(prev => Math.max(0, prev - 1));
            } else {
                setOpponentTime(prev => Math.max(0, prev - 1));
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [turn, hasTimer, isCheckmate, myColor]);


    // NOTE: Bot games (ranked) use the server-side make_move → board_update flow.
    // The server's gameHandler.js automatically calls makeBotMove after the player moves.
    // The computer_move/computer_response flow is only used for Tutorial mode.


    useEffect(() => {
        // Show bot thinking indicator when it's bot's turn
        if (isBotGame) {
            const isBotTurn = (myColor === 'white' && turn === 'b') || (myColor === 'black' && turn === 'w');
            setIsBotThinking(isBotTurn);
        }
    }, [turn, isBotGame, myColor]);

    useEffect(() => {
        // Both bot and multiplayer games need board_update for server-synced state
        socket.on('board_update', ({ fen, whiteTime, blackTime, lastMove }) => {
            const isWhite = myColor === 'white';
            if (whiteTime !== undefined && blackTime !== undefined) {
                setPlayerTime(isWhite ? Math.floor(whiteTime / 1000) : Math.floor(blackTime / 1000));
                setOpponentTime(isWhite ? Math.floor(blackTime / 1000) : Math.floor(whiteTime / 1000));
            }
            setIsBotThinking(false);
            if (game.fen() !== fen && lastMove) {
                const { from, to, promotion } = lastMove;
                applyMove(from, to, promotion || 'q');
            }
        });

        // Join the game socket room so server can push events to us
        if (activeGameId) {
            if (!socket.connected) socket.connect();
            socket.emit('register_user', { userId: user.userId });
            socket.emit('join_game', { gameId: activeGameId });
        }

        return () => {
            socket.off('board_update');
        };
    }, [isBotGame, myColor, activeGameId]);

    useEffect(() => {
        const handleRoomReady = ({ gameId, white, black, format }) => {
            console.log('Room ready on client! Game ID:', gameId);
            localStorage.setItem('gameId', gameId);
            setActiveGameId(gameId);
        };

        socket.on('room_ready', handleRoomReady);

        // Join room if we have roomId but no gameId yet (waiting lobby state)
        if (activeRoomId && !activeGameId) {
            if (!socket.connected) socket.connect();
            socket.emit('register_user', { userId: user.userId });
            socket.emit('join_room', { roomId: activeRoomId, userId: user.userId });
        }

        return () => {
            socket.off('room_ready', handleRoomReady);
        };
    }, [activeRoomId, activeGameId]);

    useEffect(() => {
        if (isBotGame) return;

        socket.on('opponent_disconnected', () => {
            setOpponentDisconnected(true);
            setDisconnectCountdown(30);
            disconnectTimerRef.current = setInterval(() => {
                setDisconnectCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(disconnectTimerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        });

        socket.on('opponent_reconnected', () => {
            setOpponentDisconnected(false);
            clearInterval(disconnectTimerRef.current);
        });

        socket.on('player_reconnect', ({ fen, whiteTime, blackTime }) => {
            const isWhite = myColor === 'white';
            setPlayerTime(isWhite ? Math.floor(whiteTime / 1000) : Math.floor(blackTime / 1000));
            setOpponentTime(isWhite ? Math.floor(blackTime / 1000) : Math.floor(whiteTime / 1000));

            try { game.load(fen); } catch(e) { console.warn('FEN resync failed', e); }
        });

        return () => {
            socket.off('opponent_disconnected');
            socket.off('opponent_reconnected');
            socket.off('player_reconnect');
            clearInterval(disconnectTimerRef.current);
        };
    }, [isBotGame, myColor]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleConfirmQuit = () => {
        setShowQuitModal(false);
        localStorage.removeItem('roomId');
        localStorage.removeItem('gameId');
        localStorage.removeItem('isBotGame');
        navigateTo('home');
    };

    const handleReturnHome = () => {
        localStorage.removeItem('roomId');
        localStorage.removeItem('gameId');
        localStorage.removeItem('isBotGame');
        navigateTo('home');
    };


    const player = {
        name: user.username || 'You',
        elo: user.elo || 1200,
        avatar: '👤'
    };
    const opponent = isBotGame
        ? { name: `ChessBot (ELO ~${botElo})`, elo: botElo, avatar: '🤖' }
        : { name: 'Opponent', elo: '?', avatar: '🧑' };


        const isMyTurnNow = (myColor === 'white' && turn === 'w') || (myColor === 'black' && turn === 'b');
    const winnerName = turn === 'w' ? opponent.name : player.name;

    // Custom room lobby state
    if (activeRoomId && !activeGameId) {
        return (
            <div className={styles.lobbyContainer}>
                <div className={styles.lobbyCard}>
                    <h2>Custom Room Lobby</h2>
                    <div className={styles.roomCodeSection}>
                        <span className={styles.roomCodeLabel}>Room Code:</span>
                        <span className={styles.roomCodeValue}>{activeRoomId}</span>
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(activeRoomId);
                                alert('Room Code copied to clipboard!');
                            }}
                            className={styles.copyButton}
                        >
                            Copy
                        </button>
                    </div>
                    <p className={styles.lobbyStatus}>Waiting for opponent to join...</p>
                    <div className={styles.spinner}></div>
                    <button 
                        onClick={handleReturnHome}
                        className={styles.cancelLobbyButton}
                    >
                        Leave Room
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>

            <button
                className={styles.quitButton}
                onClick={() => setShowQuitModal(true)}
            >
                ← Quit Game
            </button>

            <div className={styles.gameWrapper}>
                {/* Opponent disconnected banner */}
                {opponentDisconnected && (
                    <div style={{
                        background: 'rgba(255, 80, 80, 0.15)',
                        border: '1px solid rgba(255, 80, 80, 0.4)',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        marginBottom: '8px',
                        textAlign: 'center',
                        fontSize: '0.85rem',
                        color: '#ff8080'
                    }}>
                        ⚡ Opponent disconnected — auto-resign in <strong>{disconnectCountdown}s</strong>
                    </div>
                )}

                {/* Opponent Info (Top) */}
                <div className={styles.playerInfo}>
                    <div className={styles.playerAvatar}>{opponent.avatar}</div>
                    <div className={styles.playerDetails}>
                        <p className={styles.playerName}>
                            {opponent.name}
                            {isBotThinking && <span style={{ marginLeft: 8, fontSize: '0.75rem', opacity: 0.7 }}>thinking…</span>}
                            {opponentDisconnected && <span style={{ marginLeft: 8, fontSize: '0.75rem', color: '#ff6060' }}>● disconnected</span>}
                        </p>
                        <p className={styles.playerElo}>Rating: {opponent.elo}</p>
                    </div>
                    {hasTimer && (
                        <div className={`${styles.playerTimer} ${!isMyTurnNow ? styles.active : ''}`}>
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
                        checkmateSquare={checkmateSquare}
                        playerColor={myColor}
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
                        <div className={`${styles.playerTimer} ${isMyTurnNow ? styles.active : ''}`}>
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
                            {isBotGame
                                ? 'This will end your game against the bot.'
                                : 'If you quit now, you will lose the game and your ELO rating will decrease.'}
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

            {/* End Game Modal */}
            {(isCheckmate || playerTime === 0 || opponentTime === 0) && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalTitle}>
                            {isCheckmate ? 'Checkmate!' : "Time's up!"}
                        </h3>
                        <p className={styles.modalWarning} style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
                            {isCheckmate
                                ? `${winnerName} wins by checkmate!`
                                : playerTime === 0
                                ? "Time's up! You lost on time."
                                : "Your opponent ran out of time. You won!"}
                        </p>
                        <div className={styles.modalButtons} style={{ justifyContent: 'center' }}>
                            <button
                                className={`${styles.modalButton} ${styles.confirmBtn}`}
                                onClick={handleReturnHome}
                            >
                                Return to Homepage
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Game;
