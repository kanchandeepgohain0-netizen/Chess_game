import { useState } from 'react';
import { Chess } from "chess.js";

function useChessGame(playerColor = null, onMove = null) {
    const [game] = useState(new Chess());
    const [board, setBoard] = useState(game.board());
    const [selected, setSelected] = useState(null);
    const [legalMoves, setLegalMoves] = useState([]);
    const [turn, setTurn] = useState(game.turn());
    const [isCheckmate, setIsCheckmate] = useState(game.isCheckmate());
    const [checkmateSquare, setCheckmateSquare] = useState(null);

    function onSquareClick(square) {
        const currentTurnColor = game.turn(); 
        if (playerColor) {
            const myChessColor = playerColor === 'white' ? 'w' : 'b';
            if (currentTurnColor !== myChessColor) return;
        }

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
                
                if (onMove) {
                    onMove({ from: selected, to: square, promotion: "q" });
                }
            }
            setSelected(null);
            setLegalMoves([]);
        }
    }

    function applyMove(from, to, promotion = 'q') {
        let move;
        try {
            move = game.move({ from, to, promotion });
        } catch (e) {
            console.error("Move error:", e);
            return false;
        }
        if (!move) return false;

        const currentBoard = game.board();
        setBoard(currentBoard);
        setTurn(game.turn());
        setSelected(null);
        setLegalMoves([]);

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
        return true;
    }

    return {
        game,
        board,
        legalMoves,
        onSquareClick,
        applyMove,
        turn,
        isCheckmate,
        checkmateSquare
    };
}

export default useChessGame;