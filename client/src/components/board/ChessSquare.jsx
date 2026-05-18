import React from 'react';
import ChessPiece from './ChessPiece.jsx';

function ChessSquare({color, isHighlighted, isCheckmateSquare, onClick, piece}){
    const squareClass = `square ${color} ${isHighlighted ? "highlight": ""} ${isCheckmateSquare ? "checkmate-highlight": ""}`;

    return(
        <div className={squareClass} onClick={onClick}>
            {piece && (<ChessPiece piece={piece}/>)}
        </div>
    );
}

export default ChessSquare;