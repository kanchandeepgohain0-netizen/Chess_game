import { useState } from 'react';
import { Chess } from "chess.js";

function useChessGame() {
    const [game] = useState(new Chess());
    const [board, setBoard] = useState(game.board());
    const [selected, setSelected] = useState(null);
    const [legalMoves, setLegalMoves] = useState([]);
    const [turn, setTurn] = useState(game.turn());
    const [isCheckmate, setIsCheckmate] = useState(game.isCheckmate());
    const [checkmateSquare, setCheckmateSquare] = useState(null);

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
                const currentBoard = game.board();
                setBoard(currentBoard);
                setTurn(game.turn());
                const currentIsCheckmate = game.isCheckmate();
                setIsCheckmate(currentIsCheckmate);
                if (currentIsCheckmate) {
                    let cmSquare = null;
                    for (let r = 0; r < 8; r++) {
                        for (let c = 0; c < 8; c++) {
                            const p = currentBoard[r][c];
                            if (p && p.type === 'k' && p.color === game.turn()) {
                                cmSquare = `${String.fromCharCode(97 + c)}${8 - r}`;
                            }
                        }
                    }
                    setCheckmateSquare(cmSquare);
                } else {
                    setCheckmateSquare(null);
                }
            }
            setSelected(null);
            setLegalMoves([]);
        }
    }

    return {
        board,
        legalMoves,
        onSquareClick,
        turn,
        isCheckmate,
        checkmateSquare
    };
}

export default useChessGame;