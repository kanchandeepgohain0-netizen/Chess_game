import { useEffect } from "react";
import socket from "../services/socket";


function useSocket() {
    useEffect(()=>{
        socket.on("connect", ()=>{
            console.log("Connected to server");
        });
        return ()=>{
            socket.off("connect");
        };
    },[]);
}

export default useSocket;   