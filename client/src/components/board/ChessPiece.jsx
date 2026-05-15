import React from 'react';

function ChessPiece({piece}){
    const pieceSymbol ={
        wp: "♙",
        wr: "♖",
        wn: "♘",
        wb: "♗",
        wq: "♕",
        wk: "♔",

        bp: "♟",
        br: "♜",
        bn: "♞",
        bb: "♝",
        bq: "♛",
        bk: "♚",
    };
    const pieceKey = piece.color + piece.type;

    return(
        <div className="chess-piece">
            {pieceSymbol[pieceKey]}
        </div>
    );
}

export default ChessPiece;