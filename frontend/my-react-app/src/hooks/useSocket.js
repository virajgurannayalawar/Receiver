// hooks/useSocket.js

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export default function useSocket(eventName, callback) {
    const socketRef = useRef(null);

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io(SOCKET_URL, {
                transports: ["websocket"],
                withCredentials: true,
                autoConnect: true,
            });
        }

        const socket = socketRef.current;

        socket.on(eventName, callback);

        return () => {
            socket.off(eventName, callback);
        };
    }, [eventName, callback]);

    return socketRef.current;
}