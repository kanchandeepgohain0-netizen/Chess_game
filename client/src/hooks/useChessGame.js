import { useState } from 'react';
import { Chess } from "chess.js";

function useChessGame() {
    const [game] = useState(new Chess());
    const [board, setBoard] = useState(game.board());
    const [selected, setSelected] = useState(null);
    const [legalMoves, setLegalMoves] = useState([]);

    function onSquareClick(square) {
        if (selected === null) {
            const piece = game.get(square);
            if (!piece) return;
            if (piece.color !== game.turn()) return;
            setSelected(square);
            const moves = game.moves({ square, verbose: true });
            const moveSquares = moves.map(move => move.to);
            setLegalMoves(moveSquares);
        }
        else {

            const clickedPiece = game.get(square);
            if(clickedPiece && clickedPiece.color === game.turn()){
                setSelected(square);

                const moves = game.moves({ square, verbose: true});

                const moveSquares = moves.map(
                    move => move.to
                );

                setLegalMoves(moveSquares);
                return;
            }

            if (!legalMoves.includes(square)) {
                setSelected(null);
                setLegalMoves([]);

                return;
            }


            const move = game.move({ from: selected, to: square, promotion: "q" });
            if (move) {
                setBoard(game.board());
            }
            setSelected(null);
            setLegalMoves([]);
        }
    }

    return {
        board,
        legalMoves,
        onSquareClick
    };
}

export default useChessGame;