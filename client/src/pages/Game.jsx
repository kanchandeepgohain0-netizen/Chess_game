import React from "react";
import ChessBoard from "../components/board/ChessBoard.jsx";
import useChessGame from "../hooks/useChessGame";

function Game({ navigateTo }) {
    const { board, legalMoves, onSquareClick } = useChessGame();
    
    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh', 
            backgroundColor: '#121212', // Assuming a dark theme
            position: 'relative'
        }}>
            
            {/* Simple button to leave the game and go back to home */}
            <button 
                onClick={() => navigateTo('home')} 
                style={{ 
                    position: 'absolute', 
                    top: '20px', 
                    left: '20px', 
                    padding: '8px 16px', 
                    cursor: 'pointer', 
                    background: '#333', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    fontSize: '14px'
                }}
            >
                ← Quit Game
            </button>

            {/* The actual chess board */}
            <ChessBoard
                board={board}
                legalMoves={legalMoves}
                onSquareClick={onSquareClick}
            />
        </div>
    );
}

export default Game;
