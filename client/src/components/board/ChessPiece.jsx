import React from 'react';

function ChessPiece({piece, mode}){
    const pieceSymbol ={
        wp: "♟",
        wr: "♜",
        wn: "♞",
        wb: "♝",
        wq: "♛",
        wk: "♚",

        bp: "♟",
        br: "♜",
        bn: "♞",
        bb: "♝",
        bq: "♛",
        bk: "♚",
    };
    const pieceKey = piece.color + piece.type;
    
    const isWhite = piece.color === 'w';
    const pieceStyle = {
        color: isWhite ? '#ffffff' : '#111111',
        textShadow: isWhite ? '0 0 2px #000, 0 1px 4px rgba(0,0,0,0.8)' : '0 1px 2px rgba(255,255,255,0.4)',
        transition: mode === 'tutorial' ? 'transform 0.4s ease' : 'none',
    };

    return(
        <div className="chess-piece" style={pieceStyle}>
            {pieceSymbol[pieceKey]}
        </div>
    );
}

export default ChessPiece;