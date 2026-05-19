import React from 'react';
import ChessSquare from './ChessSquare.jsx';
import './ChessBoard.css';

function ChessBoard({ board, legalMoves, onSquareClick, checkmateSquare, mode }) {
    return (
        <div className="board">
            {board.map((row, rowIndex) => (

                row.map((piece, colIndex) => {
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
                })

            ))}
        </div>
    );
}


export default ChessBoard;