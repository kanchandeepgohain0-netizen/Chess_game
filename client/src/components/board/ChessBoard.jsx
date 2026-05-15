import React from 'react';
import ChessSquare from './ChessSquare.jsx';
import './ChessBoard.css';

function ChessBoard({ board, legalMoves, onSquareClick }) {
    return (
        <div className="board">
            {board.map((row, rowIndex) => (

                row.map((piece, colIndex) => {
                    const squareName = `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}`;
                    const color = (rowIndex + colIndex) % 2 === 0 ? "light" : "dark";

                    const isHighlighted = legalMoves.includes(squareName);

                    return (
                        <ChessSquare
                            key={squareName}
                            color={color}
                            isHighlighted={isHighlighted}
                            onClick={() => onSquareClick(squareName)}
                            piece={piece}
                        />
                    );
                })

            ))}
        </div>
    );
}


export default ChessBoard;