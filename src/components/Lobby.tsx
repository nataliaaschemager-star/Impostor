import React, { useState } from "react";
import { ref, set, update, remove } from "firebase/database";
import { db } from "../firebase";
import { Player, Room, GameStatus } from "../types";
import { getRandomWord } from "../categories";
import { BOT_NAMES } from "../bots";
import { motion } from "motion/react";
import { Copy, Check, Play, LogOut, Shield, Users, Loader2, Bot, Trash2 } from "lucide-react";

interface LobbyProps {
  room: Room;
  playerId: string;
  onLeave: () => void;
}

export default function Lobby({ room, playerId, onLeave }: LobbyProps) {
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  const playersList = Object.values(room.players || {}) as Player[];
  const isHost = room.hostId === playerId;
  const canStart = playersList.length >= 3;

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddBot = async () => {
    if (!isHost) return;
    
    // Find bot names not already taken
    const existingNames = playersList.map((p) => p.name.toLowerCase());
    const availableBotNames = BOT_NAMES.filter((name) => !existingNames.includes(name.toLowerCase()));

    if (availableBotNames.length === 0) {
      return;
    }

    const chosenName = availableBotNames[Math.floor(Math.random() * availableBotNames.length)];
    const botId = "bot_" + Math.random().toString(36).substring(2, 11);

    const botPlayer: Player = {
      id: botId,
      name: chosenName,
      isHost: false,
      isBot: true
    };

    try {
      await set(ref(db, `rooms/${room.code}/players/${botId}`), botPlayer);
    } catch (err) {
      console.error("Error adding bot:", err);
    }
  };

  const handleRemoveBot = async (botId: string) => {
    if (!isHost) return;
    try {
      await remove(ref(db, `rooms/${room.code}/players/${botId}`));
    } catch (err) {
      console.error("Error removing bot:", err);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      if (isHost) {
        // If host leaves and there are other players, transfer hosting. Otherwise delete room.
        const otherPlayers = playersList.filter((p) => p.id !== playerId && !p.isBot);
        if (otherPlayers.length > 0) {
          const nextHost = otherPlayers[0];
          const updates: any = {};
          updates[`/rooms/${room.code}/hostId`] = nextHost.id;
          updates[`/rooms/${room.code}/players/${nextHost.id}/isHost`] = true;
          updates[`/rooms/${room.code}/players/${playerId}`] = null;
          await update(ref(db), updates);
        } else {
          // No other players (or only bots left), remove whole room
          await remove(ref(db, `rooms/${room.code}`));
        }
      } else {
        // Just remove player
        await remove(ref(db, `rooms/${room.code}/players/${playerId}`));
      }
      onLeave();
    } catch (err) {
      console.error("Error leaving room:", err);
      onLeave();
    }
  };

  const handleStartGame = async () => {
    if (!isHost || !canStart || starting) return;

    setStarting(true);
    try {
      // 1. Choose a category and word
      const { category, word } = getRandomWord();

      // 2. Select a random Impostor (bots can be the impostor too!)
      const playerIds = playersList.map((p) => p.id);
      const randomImposterId = playerIds[Math.floor(Math.random() * playerIds.length)];

      // 3. Shuffle player turn order
      const shuffledIds = [...playerIds].sort(() => Math.random() - 0.5);

      // 4. Update the room fields in database
      const updates: any = {};
      updates[`/rooms/${room.code}/category`] = category;
      updates[`/rooms/${room.code}/secretWord`] = word;
      updates[`/rooms/${room.code}/imposterId`] = randomImposterId;
      updates[`/rooms/${room.code}/turnOrder`] = shuffledIds;
      updates[`/rooms/${room.code}/currentTurnIndex`] = 0;
      updates[`/rooms/${room.code}/status`] = GameStatus.WORDS;
      updates[`/rooms/${room.code}/winner`] = null;
      updates[`/rooms/${room.code}/votedOutId`] = null;
      updates[`/rooms/${room.code}/turnStartedAt`] = Date.now(); // Start turn timer!

      // Clean players' inputs
      playersList.forEach((p) => {
        updates[`/rooms/${room.code}/players/${p.id}/word`] = "";
        updates[`/rooms/${room.code}/players/${p.id}/vote`] = "";
      });

      await update(ref(db), updates);
    } catch (err) {
      console.error("Error starting game:", err);
      setStarting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center">
      {/* Lobby Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl mb-6 text-center relative overflow-hidden"
        id="lobby-info-card"
      >
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-1">
          CÓDIGO DE LA SALA
        </p>
        
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-4xl md:text-5xl font-extrabold tracking-widest text-red-500 font-mono">
            {room.code}
          </span>
          <button
            onClick={copyCode}
            className="p-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-xl transition-all border border-zinc-800 active:scale-95 cursor-pointer"
            title="Copiar Código"
            id="btn-copy-code"
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-500 animate-bounce" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
        </div>

        <p className="text-xs text-zinc-500 max-w-xs mx-auto">
          Comparte este código con tus amigos para que se unan desde sus dispositivos.
        </p>

        {copied && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-green-400 bg-green-950/40 px-2.5 py-0.5 rounded-full border border-green-900/30"
          >
            ¡Código copiado al portapapeles!
          </motion.span>
        )}
      </motion.div>

      {/* Players List Container */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl mb-6 flex-1"
        id="lobby-players-card"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-4 mb-4 gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-white font-sans">
              Jugadores en la Sala
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400">
              {playersList.length} conectados
            </span>

            {isHost && (
              <button
                onClick={handleAddBot}
                className="flex items-center gap-1 text-[11px] font-bold bg-red-600/10 hover:bg-red-600 hover:text-white text-red-400 border border-red-500/20 rounded-full px-3 py-1 transition-all active:scale-95 cursor-pointer"
                id="btn-add-bot"
              >
                <Bot className="w-3.5 h-3.5" />
                + Bot
              </button>
            )}
          </div>
        </div>

        {/* Players List */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1" id="lobby-players-list">
          {playersList.map((player, idx) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                player.id === playerId
                  ? "bg-red-500/5 border-red-500/20 text-white"
                  : player.isBot
                  ? "bg-zinc-950/40 border-zinc-900 text-zinc-400"
                  : "bg-zinc-950 border-zinc-850/60 text-zinc-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    player.id === playerId ? "bg-red-500" : player.isBot ? "bg-blue-500" : "bg-zinc-600 animate-pulse"
                  }`}
                />
                <span className="font-semibold text-sm flex items-center gap-1.5">
                  {player.name} {player.id === playerId && " (Tú)"}
                  {player.isBot && (
                    <span className="flex items-center gap-0.5 text-[9px] font-mono font-extrabold bg-blue-950/40 text-blue-400 px-1.5 py-0.5 rounded border border-blue-900/30">
                      <Bot className="w-2.5 h-2.5" />
                      BOT
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {player.isHost && (
                  <span className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-900/30">
                    <Shield className="w-3 h-3" />
                    Anfitrión
                  </span>
                )}

                {isHost && player.isBot && (
                  <button
                    onClick={() => handleRemoveBot(player.id)}
                    className="p-1.5 hover:bg-red-950/50 hover:text-red-400 text-zinc-500 rounded-lg transition-all cursor-pointer"
                    title="Eliminar Bot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hint for starting the game */}
        {!isHost && (
          <div className="mt-6 p-4 bg-zinc-950 border border-zinc-850 rounded-xl text-center">
            <Loader2 className="w-5 h-5 text-red-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-zinc-400">
              Esperando que el anfitrión inicie la partida...
            </p>
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <div className="w-full space-y-3" id="lobby-actions">
        {isHost && (
          <button
            onClick={handleStartGame}
            disabled={!canStart || starting}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all shadow-lg ${
              canStart
                ? "bg-red-600 hover:bg-red-500 text-white cursor-pointer active:scale-[0.98] shadow-red-900/15"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
            }`}
            id="btn-start-game"
          >
            {starting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Iniciando...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                Iniciar Partida
              </>
            )}
          </button>
        )}

        {isHost && !canStart && (
          <p className="text-center text-[11px] font-mono text-zinc-500">
            ⚠️ Necesitas al menos 3 jugadores para comenzar (actualmente {playersList.length}). ¡Puedes añadir bots si lo necesitas!
          </p>
        )}

        <button
          onClick={handleLeaveRoom}
          className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-[0.98]"
          id="btn-leave-lobby"
        >
          <LogOut className="w-4 h-4" />
          Salir de la Sala
        </button>
      </div>
    </div>
  );
}
