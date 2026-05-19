import React from 'react';
import ChessSquare from './ChessSquare.jsx';
import './ChessBoard.css';

function ChessBoard({ board, legalMoves, onSquareClick, checkmateSquare, mode, playerColor = 'white' }) {
    const isBlack = playerColor === 'black';

    // Reverse rows if black, else keep original
    const renderBoard = isBlack ? [...board].reverse() : board;

    return (
        <div className="board">
            {renderBoard.map((row, rIndex) => {
                const rowIndex = isBlack ? 7 - rIndex : rIndex;
                const renderRow = isBlack ? [...row].reverse() : row;

                return renderRow.map((piece, cIndex) => {
                    const colIndex = isBlack ? 7 - cIndex : cIndex;
                    const squareName = `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}`;
                    const color = (rowIndex + colIndex) % 2 === 0 ? "light" : "dark";

                    const isHighlighted = legalMoves.includes(squareName);
                    const isCheckmateSquare = checkmateSquare === squareName;

                    return (
                        <ChessSquare
                            key={squareName}
                            color={color}
                            isHighlighted={isHighlighted}
                            isCheckmateSquare={isCheckmateSquare}
                            onClick={() => mode !== 'tutorial' && onSquareClick(squareName)}
                            piece={piece}
                            mode={mode}
                        />
                    );
                });
            })}
        </div>
    );
}


export default ChessBoard;