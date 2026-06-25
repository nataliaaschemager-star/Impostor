import React, { useState, useEffect } from "react";
import { ref, onValue, remove } from "firebase/database";
import { db } from "./firebase";
import { Room, GameStatus } from "./types";
import Home from "./components/Home";
import Lobby from "./components/Lobby";
import GameArea from "./components/GameArea";
import { motion, AnimatePresence } from "motion/react";
import { Radio, AlertCircle, RefreshCw, LogOut, HelpCircle, Gamepad2 } from "lucide-react";

export default function App() {
  const [roomCode, setRoomCode] = useState<string>("");
  const [playerId, setPlayerId] = useState<string>("");
  const [room, setRoom] = useState<Room | null>(null);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // 1. Listen to global connection state
  useEffect(() => {
    const connectedRef = ref(db, ".info/connected");
    const unsubscribe = onValue(connectedRef, (snap) => {
      setFirebaseConnected(!!snap.val());
    });
    return () => unsubscribe();
  }, []);

  // 2. Listen to room changes in real-time
  useEffect(() => {
    if (!roomCode) {
      setRoom(null);
      return;
    }

    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        setRoom(snapshot.val());
      } else {
        // Room was deleted or closed
        setRoom(null);
        setRoomCode("");
        triggerToast("La sala ha sido cerrada o eliminada.");
      }
    });

    return () => unsubscribe();
  }, [roomCode]);

  // Handle room join success from Home screen
  const handleRoomJoined = (code: string, pId: string) => {
    setPlayerId(pId);
    setRoomCode(code);
  };

  // Trigger brief alert toast
  const triggerToast = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => {
      setErrorToast(null);
    }, 4000);
  };

  // Leaving/Exiting the room
  const handleLeaveRoom = () => {
    setRoomCode("");
    setRoom(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col justify-between selection:bg-red-600 selection:text-white">
      {/* Background decoration lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111113_1px,transparent_1px),linear-gradient(to_bottom,#111113_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between" id="app-header">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleLeaveRoom}>
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-red-950/35">
            I
          </div>
          <span className="font-bold tracking-wider text-base text-white">
            EL IMPOSTOR
          </span>
        </div>

        {/* Real-time status badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/60 border border-zinc-800 text-[11px] font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${firebaseConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500 animate-ping"}`} />
            {firebaseConnected ? (
              <span className="text-zinc-400">EN LÍNEA</span>
            ) : (
              <span className="text-red-400 font-bold">DESCONECTADO</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content View with Slide transitions */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center py-6">
        <AnimatePresence mode="wait">
          {!roomCode || !room ? (
            <motion.div
              key="home-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <Home onRoomJoined={handleRoomJoined} />
            </motion.div>
          ) : room.status === GameStatus.LOBBY ? (
            <motion.div
              key="lobby-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <Lobby room={room} playerId={playerId} onLeave={handleLeaveRoom} />
            </motion.div>
          ) : (
            <motion.div
              key="game-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <GameArea room={room} playerId={playerId} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900 bg-zinc-950/40 py-4 px-6 text-center text-[10px] text-zinc-500 font-mono">
        &copy; 2026 El Impostor &bull; Multiusuario en Tiempo Real con Firebase RTDB &bull; Creado con ❤️
      </footer>

      {/* Error / Alert Toast Notification */}
      <AnimatePresence>
        {errorToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-zinc-800 shadow-2xl px-5 py-3 rounded-xl flex items-center gap-3 text-sm text-zinc-200 font-medium"
            id="toast-notification"
          >
            <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
            <span>{errorToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
