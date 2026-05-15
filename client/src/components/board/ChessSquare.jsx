import React from 'react';
import ChessPiece from './ChessPiece.jsx';

function ChessSquare({color, isHighlighted, onClick, piece}){
    const squareClass = `square ${color} ${isHighlighted ? "highlight": ""}`;

    return(
        <div className={squareClass} onClick={onClick}>
            {piece && (<ChessPiece piece={piece}/>)}
        </div>
    );
}

export default ChessSquare;