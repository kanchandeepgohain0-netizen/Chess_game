import React from "react";
import ChessBoard from "./components/board/ChessBoard.jsx";
import useChessGame from "./hooks/useChessGame";
// import useSocket from "./hooks/useSocket";

function App(){
    // useSocket();
    const{board, legalMoves, onSquareClick} = useChessGame();
    return(
        <ChessBoard
        board={board}
        legalMoves={legalMoves}
        onSquareClick={onSquareClick}
        />
    )
}

export default App;