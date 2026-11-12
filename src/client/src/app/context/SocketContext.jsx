import React, {createContext, useContext, useState, useEffect} from "react";
import {io} from "socket.io-client";

const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    const socketUrl = import.meta.env.PROD
        ? undefined  // En prod, on laisse vide pour que socket.io utilise l'hôte actuel
        : "http://localhost:3001"; // En dev, on force le port du serveur Node

    useEffect(() => {
        console.log('[SocketContextProvider] Mounting, creating socket...');
        // Slug de la page dans la poignée de main (refaite à chaque reconnexion) : le serveur
        // y place le socket dans la room du slug (tables actives, spec_tables.md §4.2).
        // Une page = un slug : il ne change pas pendant la vie du socket. Premier segment de
        // l'adresse tel quel (pas de slug par défaut : l'accueil n'entre dans aucune room ;
        // le serveur ignore ce qui n'est pas un slug chargé).
        const system = window.location.pathname.split('/').filter(Boolean)[0];
        const newSocket = io(socketUrl,{
            ...(system ? { query: { system } } : {}),
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000
        });

        newSocket.on('connect', () => {
            console.log('[SocketContextProvider] Socket connected:', newSocket.id);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('[SocketContextProvider] Socket disconnected:', reason);
        });

        setSocket(newSocket);

        return () => {
            if(newSocket) {
                newSocket.disconnect();
                console.log('[SocketContextProvider] disconnected');
            }
        }
    }, []);

    console.log('[SocketContextProvider] Rendering, socket:', socket ? socket.id : 'null');

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
};

export const useSocket = () => useContext(SocketContext);