import React from 'react';
import ChessPiece from './ChessPiece.jsx';

function ChessSquare({color, isHighlighted, isCheckmateSquare, onClick, piece, mode}){
    const squareClass = `square ${color} ${isHighlighted ? "highlight": ""} ${isCheckmateSquare ? "checkmate-highlight": ""}`;

    return(
        <div className={squareClass} onClick={onClick}>
            {piece && (<ChessPiece piece={piece} mode={mode}/>)}
        </div>
    );
}

export default ChessSquare;