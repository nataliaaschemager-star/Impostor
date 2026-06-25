import React, { useState, useEffect } from "react";
import { ref, get, set } from "firebase/database";
import { db } from "../firebase";
import { GameStatus, Player } from "../types";
import { motion } from "motion/react";
import { Users, UserPlus, Key, HelpCircle, ArrowRight } from "lucide-react";

interface HomeProps {
  onRoomJoined: (roomCode: string, playerId: string) => void;
}

export default function Home({ onRoomJoined }: HomeProps) {
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [hostName, setHostName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Load saved names from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("impostor_player_name") || "";
    if (savedName) {
      setHostName(savedName);
      setJoinName(savedName);
    }
  }, []);

  // Generate a random 4-letter uppercase code
  const generateRoomCode = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Generate or get unique player ID
  const getOrCreatePlayerId = (): string => {
    let pid = localStorage.getItem("impostor_player_id");
    if (!pid) {
      pid = "p_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("impostor_player_id", pid);
    }
    return pid;
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostName.trim()) {
      setError("Por favor, ingresa tu nombre.");
      return;
    }

    setLoading(true);
    setError(null);

    const name = hostName.trim();
    localStorage.setItem("impostor_player_name", name);
    const playerId = getOrCreatePlayerId();
    const roomCode = generateRoomCode();

    try {
      const roomRef = ref(db, `rooms/${roomCode}`);
      
      const hostPlayer: Player = {
        id: playerId,
        name: name,
        isHost: true
      };

      const initialRoomState = {
        code: roomCode,
        hostId: playerId,
        status: GameStatus.LOBBY,
        category: "",
        secretWord: "",
        imposterId: "",
        players: {
          [playerId]: hostPlayer
        },
        turnOrder: [],
        currentTurnIndex: 0
      };

      await set(roomRef, initialRoomState);
      onRoomJoined(roomCode, playerId);
    } catch (err: any) {
      console.error(err);
      setError("Error al crear la sala. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    const name = joinName.trim();

    if (!code) {
      setError("Ingresa el código de la sala.");
      return;
    }
    if (code.length !== 4) {
      setError("El código debe ser de 4 letras.");
      return;
    }
    if (!name) {
      setError("Por favor, ingresa tu nombre.");
      return;
    }

    setLoading(true);
    setError(null);
    localStorage.setItem("impostor_player_name", name);
    const playerId = getOrCreatePlayerId();

    try {
      const roomRef = ref(db, `rooms/${code}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        setError("La sala no existe. Verifica el código.");
        setLoading(false);
        return;
      }

      const roomData = snapshot.val();

      // Check if room is already in progress
      if (roomData.status !== GameStatus.LOBBY) {
        setError("La partida ya ha comenzado en esta sala.");
        setLoading(false);
        return;
      }

      // Check for duplicate names
      const existingPlayers = roomData.players ? Object.values(roomData.players) as Player[] : [];
      const nameExists = existingPlayers.some(
        (p) => p.name.toLowerCase() === name.toLowerCase() && p.id !== playerId
      );
      if (nameExists) {
        setError("Ya hay un jugador con ese nombre en la sala.");
        setLoading(false);
        return;
      }

      // Save player to the database
      const playerRef = ref(db, `rooms/${code}/players/${playerId}`);
      const newPlayer: Player = {
        id: playerId,
        name: name,
        isHost: false
      };

      await set(playerRef, newPlayer);
      onRoomJoined(code, playerId);
    } catch (err: any) {
      console.error(err);
      setError("Error al unirse a la sala. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-8">
      {/* Title Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
        id="home-header"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
          🕵️‍♂️ MISTERIO EN TIEMPO REAL
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-2 font-sans">
          El <span className="text-red-500 text-shadow-red">Impostor</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto">
          ¿Serás capaz de camuflarte entre los investigadores o descubrirás quién está fingiendo?
        </p>
      </motion.div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
        id="home-card"
      >
        {/* Glow effect */}
        <div className="absolute top-0 left-1/4 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 mb-6">
          <button
            onClick={() => {
              setActiveTab("create");
              setError(null);
            }}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === "create"
                ? "text-red-500 border-red-500"
                : "text-gray-400 border-transparent hover:text-gray-200"
            }`}
            id="tab-create"
          >
            <Users className="w-4 h-4" />
            Crear Sala
          </button>
          <button
            onClick={() => {
              setActiveTab("join");
              setError(null);
            }}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === "join"
                ? "text-red-500 border-red-500"
                : "text-gray-400 border-transparent hover:text-gray-200"
            }`}
            id="tab-join"
          >
            <UserPlus className="w-4 h-4" />
            Unirse a Sala
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 mb-4 text-xs bg-red-950/40 border border-red-900/50 text-red-200 rounded-lg text-center"
            id="home-error"
          >
            {error}
          </motion.div>
        )}

        {/* Tab content */}
        {activeTab === "create" ? (
          <form onSubmit={handleCreateRoom} className="space-y-4" id="form-create">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Tu nombre (Anfitrión)
              </label>
              <input
                type="text"
                maxLength={14}
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Ej. Carlos"
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-zinc-600 transition-all"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-800/40 text-white font-semibold rounded-xl py-3.5 text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 active:scale-[0.98]"
              id="btn-create-room"
            >
              {loading ? "Creando sala..." : "Crear Sala Nueva"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinRoom} className="space-y-4" id="form-join">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Código de la sala (4 letras)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">
                  #
                </span>
                <input
                  type="text"
                  maxLength={4}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="CODE"
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-9 pr-4 py-3 text-sm font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-zinc-600 transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5">
                Tu nombre
              </label>
              <input
                type="text"
                maxLength={14}
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                placeholder="Ej. Sofía"
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-zinc-600 transition-all"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-800/40 text-white font-semibold rounded-xl py-3.5 text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 active:scale-[0.98]"
              id="btn-join-room"
            >
              {loading ? "Uniéndose..." : "Unirse a la Partida"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </motion.div>

      {/* Guide section button */}
      <div className="mt-8">
        <button
          onClick={() => setShowHowToPlay(!showHowToPlay)}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 text-xs font-medium bg-zinc-900/40 border border-zinc-800/60 rounded-full px-4 py-2 transition-all cursor-pointer"
          id="btn-how-to-play"
        >
          <HelpCircle className="w-4 h-4 text-red-500" />
          ¿Cómo se juega a El Impostor?
        </button>
      </div>

      {/* How to play modal/drawer */}
      {showHowToPlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowHowToPlay(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
            id="how-to-play-modal"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <HelpCircle className="text-red-500" /> Reglas del Juego
            </h3>
            <div className="space-y-4 text-sm text-gray-300">
              <p>
                <strong>1. Los Roles:</strong> Al iniciar, un jugador al azar es el <span className="text-red-400 font-semibold">Impostor</span> y los demás son <span className="text-green-400 font-semibold">Investigadores</span>.
              </p>
              <p>
                <strong>2. Las Pistas:</strong> Se elige una categoría y palabra secreta. Los Investigadores ven la palabra (ej: <em>Pizza</em>). El Impostor solo ve la pista genérica de la categoría (ej: <em>Alimentos</em>) y debe disimular.
              </p>
              <p>
                <strong>3. Ronda de Palabras:</strong> Por turnos, cada jugador escribe una única palabra relacionada en la pantalla. ¡Piensa bien! Si eres investigador, no seas muy obvio para que el impostor no adivine, pero tampoco seas tan críptico que parezcas sospechoso.
              </p>
              <p>
                <strong>4. Votación Secreta:</strong> Al final de la ronda, todos votan secretamente por quien creen que es el Impostor.
              </p>
              <p>
                <strong>5. Resolución:</strong> 
                <br />• Si la mayoría descubre al <span className="text-red-400 font-semibold">Impostor</span>: Ganan los Investigadores.
                <br />• Si votan a un inocente: El Impostor gana y se le revela la palabra.
                <br />• Si hay empate: Se repite la fase de palabras como desempate.
              </p>
            </div>
            <button
              onClick={() => setShowHowToPlay(false)}
              className="mt-6 w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl py-2.5 text-xs transition-all"
              id="btn-close-how-to"
            >
              Entendido
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
