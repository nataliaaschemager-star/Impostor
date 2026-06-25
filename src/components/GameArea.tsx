import React, { useState, useEffect, useRef } from "react";
import { ref, update, set } from "firebase/database";
import { db } from "../firebase";
import { Room, Player, GameStatus } from "../types";
import { getBotWord, getBotVote } from "../bots";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, Vote, Shield, AlertTriangle, Eye, EyeOff, Award, 
  RefreshCw, CheckCircle2, User, Play, Clock, HelpCircle, Bot 
} from "lucide-react";

interface GameAreaProps {
  room: Room;
  playerId: string;
}

export default function GameArea({ room, playerId }: GameAreaProps) {
  const [wordInput, setWordInput] = useState("");
  const [selectedVoteId, setSelectedVoteId] = useState<string | null>(null);
  const [showSecretWord, setShowSecretWord] = useState(false);
  const [isSubmittingWord, setIsSubmittingWord] = useState(false);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [tieNotification, setTieNotification] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25);
  const prevStatusRef = useRef<GameStatus | null>(null);
  const lastInitializedTurnIndex = useRef<number>(-1);

  const playersList = Object.values(room.players || {}) as Player[];
  const orderedPlayers = room.turnOrder && room.turnOrder.length > 0
    ? room.turnOrder
        .map((pId) => room.players[pId])
        .filter((p): p is Player => !!p)
    : playersList;

  const localPlayer = room.players[playerId];
  const isImposter = room.imposterId === playerId;
  const isHost = room.hostId === playerId;

  // Turn management variables
  const currentTurnPlayerId = room.turnOrder ? room.turnOrder[room.currentTurnIndex] : null;
  const isMyTurn = currentTurnPlayerId === playerId;
  const currentTurnPlayer = currentTurnPlayerId ? room.players[currentTurnPlayerId] : null;

  // Track if we just came from an EMPATE reset to show a nice notification
  useEffect(() => {
    if (prevStatusRef.current === GameStatus.VOTING && room.status === GameStatus.WORDS) {
      // It means a tie triggered a reset!
      setTieNotification(true);
      const timer = setTimeout(() => {
        setTieNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = room.status;
  }, [room.status]);

  // Turn timer countdown effect
  useEffect(() => {
    if (room.status !== GameStatus.WORDS) return;

    // Set countdown duration to 25s
    setTimeLeft(25);
    lastInitializedTurnIndex.current = room.currentTurnIndex;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [room.currentTurnIndex, room.status]);

  // Handle timeout submission automatically for the active human player
  useEffect(() => {
    if (
      timeLeft === 0 && 
      isMyTurn && 
      room.status === GameStatus.WORDS && 
      !localPlayer?.word &&
      lastInitializedTurnIndex.current === room.currentTurnIndex
    ) {
      const handleTimeoutSubmit = async () => {
        try {
          const updates: any = {};
          updates[`/rooms/${room.code}/players/${playerId}/word`] = "Pasó ⏳";

          const nextIndex = room.currentTurnIndex + 1;
          if (nextIndex >= room.turnOrder.length) {
            updates[`/rooms/${room.code}/status`] = GameStatus.VOTING;
            updates[`/rooms/${room.code}/currentTurnIndex`] = 0;
          } else {
            updates[`/rooms/${room.code}/currentTurnIndex`] = nextIndex;
            updates[`/rooms/${room.code}/turnStartedAt`] = Date.now();
          }

          await update(ref(db), updates);
        } catch (err) {
          console.error("Error auto-submitting word on timeout:", err);
        }
      };
      handleTimeoutSubmit();
    }
  }, [timeLeft, isMyTurn, room.status, localPlayer?.word]);

  // 1. Bot execution & Bot voting (Runs when status, turn index, or players update, NOT on timeLeft ticks)
  useEffect(() => {
    if (!isHost) return;

    // A. WORDS phase - Bot word submission
    if (room.status === GameStatus.WORDS) {
      if (currentTurnPlayer && currentTurnPlayer.isBot && !currentTurnPlayer.word) {
        const delayTimer = setTimeout(async () => {
          try {
            // Fetch fresh state to avoid stale closures
            const alreadyUsed = Object.values(room.players || {})
              .map((p) => p.word)
              .filter((w): w is string => !!w);

            const botWordResult = getBotWord(
              room.secretWord,
              room.category,
              currentTurnPlayerId === room.imposterId,
              alreadyUsed
            );

            const updates: any = {};
            updates[`/rooms/${room.code}/players/${currentTurnPlayerId}/word`] = botWordResult;

            const nextIndex = room.currentTurnIndex + 1;
            if (nextIndex >= room.turnOrder.length) {
              updates[`/rooms/${room.code}/status`] = GameStatus.VOTING;
              updates[`/rooms/${room.code}/currentTurnIndex`] = 0;
            } else {
              updates[`/rooms/${room.code}/currentTurnIndex`] = nextIndex;
              updates[`/rooms/${room.code}/turnStartedAt`] = Date.now();
            }

            await update(ref(db), updates);
          } catch (err) {
            console.error("Error in bot turn submission:", err);
          }
        }, 3000); // 3 seconds delay for typing simulation

        return () => clearTimeout(delayTimer);
      }
    }

    // B. VOTING phase - Bot voting
    if (room.status === GameStatus.VOTING) {
      const botsToVote = Object.values(room.players || {}).filter((p) => p.isBot && !p.vote);
      if (botsToVote.length > 0) {
        const delayTimer = setTimeout(async () => {
          const botToVote = botsToVote[0];
          const botVoteResult = getBotVote(
            botToVote.id,
            Object.values(room.players || {}),
            room.imposterId,
            botToVote.id === room.imposterId
          );

          try {
            const updates: any = {};
            updates[`/rooms/${room.code}/players/${botToVote.id}/vote`] = botVoteResult;

            // Compute hypothetical outcome to see if we transition the room status
            const updatedPlayers = { ...room.players };
            updatedPlayers[botToVote.id] = { ...updatedPlayers[botToVote.id], vote: botVoteResult };

            const activePlayers = Object.values(updatedPlayers);
            const allVoted = activePlayers.every((p) => p.vote && p.vote !== "");

            if (allVoted) {
              const votesCount: Record<string, number> = {};
              activePlayers.forEach((p) => {
                votesCount[p.id] = 0;
              });
              activePlayers.forEach((p) => {
                if (p.vote && votesCount[p.vote] !== undefined) {
                  votesCount[p.vote]++;
                }
              });

              const maxVotes = Math.max(...Object.values(votesCount));
              const candidates = Object.keys(votesCount).filter((pId) => votesCount[pId] === maxVotes);

              if (candidates.length > 1) {
                // EMPATE! Reset the phase to WORDS
                updates[`/rooms/${room.code}/status`] = GameStatus.WORDS;
                updates[`/rooms/${room.code}/currentTurnIndex`] = 0;
                activePlayers.forEach((p) => {
                  updates[`/rooms/${room.code}/players/${p.id}/word`] = "";
                  updates[`/rooms/${room.code}/players/${p.id}/vote`] = "";
                });
                const shuffledIds = [...activePlayers.map((p) => p.id)].sort(() => Math.random() - 0.5);
                updates[`/rooms/${room.code}/turnOrder`] = shuffledIds;
                updates[`/rooms/${room.code}/turnStartedAt`] = Date.now();
              } else {
                const votedOutId = candidates[0];
                const isVotedOutImposter = votedOutId === room.imposterId;
                updates[`/rooms/${room.code}/status`] = GameStatus.RESULTS;
                updates[`/rooms/${room.code}/votedOutId`] = votedOutId;
                updates[`/rooms/${room.code}/winner`] = isVotedOutImposter ? "INVESTIGATORS" : "IMPOSTOR";
              }
            }

            await update(ref(db), updates);
          } catch (err) {
            console.error("Error in bot vote submission:", err);
          }
        }, 3000); // 3 seconds delay for realistic voting pace

        return () => clearTimeout(delayTimer);
      }
    }
  }, [room.status, room.currentTurnIndex, room.players, isHost, currentTurnPlayer, currentTurnPlayerId, room.imposterId, room.code, room.turnOrder]);

  // 2. Host-only fallback for human player offline/stuck (Runs when timeLeft is 0)
  useEffect(() => {
    if (!isHost) return;

    if (room.status === GameStatus.WORDS && timeLeft === 0 && currentTurnPlayerId) {
      const freshTurnPlayer = room.players[currentTurnPlayerId];
      if (freshTurnPlayer && !freshTurnPlayer.word) {
        const fallbackTimer = setTimeout(async () => {
          console.log("Host triggered fallback submit for stalled player:", freshTurnPlayer.name);
          try {
            const updates: any = {};
            updates[`/rooms/${room.code}/players/${freshTurnPlayer.id}/word`] = "Pasó ⏳";

            const nextIndex = room.currentTurnIndex + 1;
            if (nextIndex >= room.turnOrder.length) {
              updates[`/rooms/${room.code}/status`] = GameStatus.VOTING;
              updates[`/rooms/${room.code}/currentTurnIndex`] = 0;
            } else {
              updates[`/rooms/${room.code}/currentTurnIndex`] = nextIndex;
              updates[`/rooms/${room.code}/turnStartedAt`] = Date.now();
            }

            await update(ref(db), updates);
          } catch (err) {
            console.error("Error in Host offline fallback submit:", err);
          }
        }, 2000); // extra 2 seconds before Host intervenes

        return () => clearTimeout(fallbackTimer);
      }
    }
  }, [room.status, room.currentTurnIndex, room.players, isHost, timeLeft, currentTurnPlayerId, room.code, room.turnOrder]);

  // Submit word logic
  const handleWordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordInput.trim() || !isMyTurn || isSubmittingWord) return;

    setIsSubmittingWord(true);
    const cleanedWord = wordInput.trim();

    try {
      const updates: any = {};
      updates[`/rooms/${room.code}/players/${playerId}/word`] = cleanedWord;

      const nextIndex = room.currentTurnIndex + 1;
      // If everyone wrote their word, change status to VOTING
      if (nextIndex >= room.turnOrder.length) {
        updates[`/rooms/${room.code}/status`] = GameStatus.VOTING;
        updates[`/rooms/${room.code}/currentTurnIndex`] = 0;
      } else {
        updates[`/rooms/${room.code}/currentTurnIndex`] = nextIndex;
      }

      await update(ref(db), updates);
      setWordInput("");
    } catch (err) {
      console.error("Error submitting word:", err);
    } finally {
      setIsSubmittingWord(false);
    }
  };

  // Submit vote logic
  const handleVoteSubmit = async (votedId: string) => {
    if (isSubmittingVote || localPlayer.vote) return;
    setIsSubmittingVote(true);

    try {
      const updates: any = {};
      updates[`/rooms/${room.code}/players/${playerId}/vote`] = votedId;

      // Check if all players (excluding those who left, but we assume active ones here) have voted
      const updatedPlayers = { ...room.players };
      updatedPlayers[playerId] = { ...updatedPlayers[playerId], vote: votedId };

      const activePlayers = Object.values(updatedPlayers);
      const allVoted = activePlayers.every((p) => p.vote && p.vote !== "");

      if (allVoted) {
        // Evaluate votes
        const votesCount: Record<string, number> = {};
        
        // Initialize vote counts to 0
        activePlayers.forEach((p) => {
          votesCount[p.id] = 0;
        });

        // Count votes
        activePlayers.forEach((p) => {
          if (p.vote && votesCount[p.vote] !== undefined) {
            votesCount[p.vote]++;
          }
        });

        // Find max votes
        const maxVotes = Math.max(...Object.values(votesCount));
        
        // Find candidates with max votes
        const candidates = Object.keys(votesCount).filter(
          (pId) => votesCount[pId] === maxVotes
        );

        if (candidates.length > 1) {
          // EMPATE! Reset the phase to WORDS
          updates[`/rooms/${room.code}/status`] = GameStatus.WORDS;
          updates[`/rooms/${room.code}/currentTurnIndex`] = 0;
          
          // Clear players words and votes
          activePlayers.forEach((p) => {
            updates[`/rooms/${room.code}/players/${p.id}/word`] = "";
            updates[`/rooms/${room.code}/players/${p.id}/vote`] = "";
          });
          
          // Shuffle turn order to make it dynamic again
          const shuffledIds = [...activePlayers.map(p => p.id)].sort(() => Math.random() - 0.5);
          updates[`/rooms/${room.code}/turnOrder`] = shuffledIds;
        } else {
          // There is a single most voted player
          const votedOutId = candidates[0];
          const isVotedOutImposter = votedOutId === room.imposterId;

          updates[`/rooms/${room.code}/status`] = GameStatus.RESULTS;
          updates[`/rooms/${room.code}/votedOutId`] = votedOutId;
          updates[`/rooms/${room.code}/winner`] = isVotedOutImposter ? "INVESTIGATORS" : "IMPOSTOR";
        }
      }

      await update(ref(db), updates);
    } catch (err) {
      console.error("Error submitting vote:", err);
    } finally {
      setIsSubmittingVote(false);
    }
  };

  // Reset lobby/game (Host only)
  const handleRestartToLobby = async () => {
    if (!isHost) return;

    try {
      const updates: any = {};
      updates[`/rooms/${room.code}/status`] = GameStatus.LOBBY;
      updates[`/rooms/${room.code}/category`] = "";
      updates[`/rooms/${room.code}/secretWord`] = "";
      updates[`/rooms/${room.code}/imposterId`] = "";
      updates[`/rooms/${room.code}/turnOrder`] = [];
      updates[`/rooms/${room.code}/currentTurnIndex`] = 0;
      updates[`/rooms/${room.code}/winner`] = null;
      updates[`/rooms/${room.code}/votedOutId`] = null;

      playersList.forEach((p) => {
        updates[`/rooms/${room.code}/players/${p.id}/word`] = "";
        updates[`/rooms/${room.code}/players/${p.id}/vote`] = "";
      });

      await update(ref(db), updates);
    } catch (err) {
      console.error("Error resetting game:", err);
    }
  };

  // UI rendering based on GameStatus
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 space-y-4">
      {/* 1. Header Banner of Role */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full p-4 rounded-2xl border flex items-center justify-between shadow-lg relative overflow-hidden ${
          isImposter
            ? "bg-red-950/30 border-red-900/40 text-red-100"
            : "bg-emerald-950/30 border-emerald-900/40 text-emerald-100"
        }`}
        id="role-banner"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isImposter ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">TU ROL</span>
            <h2 className="text-lg font-bold tracking-wide">
              {isImposter ? "¡Eres el Impostor!" : "Eres Investigador"}
            </h2>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">CATEGORÍA</span>
          <div className="text-sm font-bold text-white bg-zinc-900/60 px-3 py-1.5 rounded-lg border border-zinc-800/80">
            📁 {room.category}
          </div>
        </div>
      </motion.div>

      {/* 2. Main Game Screen */}
      <AnimatePresence mode="wait">
        {/* === A. WORDS PHASE === */}
        {room.status === GameStatus.WORDS && (
          <motion.div
            key="words-phase"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-4"
          >
            {/* Show Tie Alert toast if applicable */}
            <AnimatePresence>
              {tieNotification && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -15 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -15 }}
                  className="bg-amber-950/40 border border-amber-900/50 text-amber-200 p-3.5 rounded-xl text-center text-xs flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span><strong>¡Empate detectado!</strong> Se han borrado las palabras y se reinicia la ronda como desempate.</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Secret Word Box */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
              {!isImposter ? (
                <>
                  <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                    PALABRA SECRETA DEL INVESTIGADOR
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-extrabold text-emerald-400 tracking-wide select-none">
                      {showSecretWord ? room.secretWord : "••••••••"}
                    </span>
                    <button
                      onClick={() => setShowSecretWord(!showSecretWord)}
                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all border border-zinc-700 cursor-pointer"
                    >
                      {showSecretWord ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2">
                    {showSecretWord ? "Haz clic en el ojo para ocultar la palabra." : "Haz clic en el ojo para revelar la palabra."}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-mono text-red-400 uppercase tracking-widest mb-1.5">
                    🚫 PALABRA SECRETA OCULTA
                  </p>
                  <p className="text-sm text-zinc-300 font-medium max-w-sm">
                    No conoces la palabra. Debes leer con atención las pistas de los demás jugadores para no levantar sospechas cuando sea tu turno.
                  </p>
                </>
              )}
            </div>

            {/* Turn status indicator with countdown timer */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${timeLeft <= 8 ? "text-red-500 animate-pulse" : "text-amber-500 animate-spin"}`} style={{ animationDuration: timeLeft <= 8 ? "0.8s" : "4s" }} />
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">TURNO ACTUAL</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded ${
                    timeLeft <= 8 ? "bg-red-950/60 text-red-400 border border-red-900/30 animate-pulse" : "bg-zinc-950 text-amber-400 border border-zinc-800"
                  }`}>
                    {timeLeft}s restante{timeLeft !== 1 && "s"}
                  </span>
                  <span className={`text-sm font-bold px-3.5 py-1.5 rounded-full ${
                    isMyTurn 
                      ? "bg-red-500 text-white animate-pulse" 
                      : "bg-zinc-950 border border-zinc-850 text-zinc-300"
                  }`}>
                    {isMyTurn ? "¡Tu Turno!" : currentTurnPlayer?.name}
                  </span>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                <motion.div
                  className={`h-full rounded-full ${
                    timeLeft <= 8 
                      ? "bg-gradient-to-r from-red-600 to-rose-500" 
                      : "bg-gradient-to-r from-amber-500 to-red-500"
                  }`}
                  initial={{ width: "100%" }}
                  animate={{ width: `${(timeLeft / 25) * 100}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </div>

              {isMyTurn && timeLeft <= 8 && (
                <p className="text-[10px] text-red-400 font-mono animate-pulse text-center">
                  ⚠️ ¡El tiempo se agota! Si no respondes, se registrará "Pasó" automáticamente.
                </p>
              )}
            </div>

            {/* Interactive Turn Input Section */}
            {isMyTurn && !localPlayer.word && (
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleWordSubmit}
                className="bg-zinc-900 border border-red-500/20 rounded-2xl p-5 shadow-xl space-y-3"
              >
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Escribe tu palabra relacionada
                  </label>
                  <p className="text-[11px] text-zinc-500 mb-2">
                    Envía solo una palabra. Los demás verán tu aporte de inmediato.
                  </p>
                  <input
                    type="text"
                    maxLength={20}
                    required
                    value={wordInput}
                    onChange={(e) => setWordInput(e.target.value)}
                    placeholder="Escribe tu palabra aquí..."
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-zinc-700 transition-all"
                    disabled={isSubmittingWord}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!wordInput.trim() || isSubmittingWord}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Send className="w-4 h-4" />
                  Enviar Palabra
                </button>
              </motion.form>
            )}

            {/* Waiting message if not my turn */}
            {!isMyTurn && (
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 text-center">
                <p className="text-xs text-zinc-400">
                  Esperando que <span className="text-white font-semibold">{currentTurnPlayer?.name}</span> envíe su palabra...
                </p>
              </div>
            )}

            {/* Words list of players */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white border-b border-zinc-850 pb-2">
                Pistas Aportadas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {orderedPlayers.map((p) => {
                  const isCurrentTurn = p.id === currentTurnPlayerId;
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        p.word
                          ? "bg-zinc-950 border-zinc-850"
                          : isCurrentTurn
                          ? "bg-red-500/5 border-red-500/20"
                          : "bg-zinc-900/30 border-zinc-900"
                      }`}
                    >
                      <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 flex-wrap">
                        <User className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{p.name} {p.id === playerId && "(Tú)"}</span>
                        {p.isBot && (
                          <span className="inline-flex items-center gap-0.5 text-[8px] font-mono font-extrabold bg-blue-950/40 text-blue-400 px-1 py-0.2 rounded border border-blue-900/30">
                            <Bot className="w-2 h-2" />
                            BOT
                          </span>
                        )}
                      </span>
                      {p.word ? (
                        <span className="text-xs font-bold text-white bg-zinc-850 px-3 py-1 rounded-lg border border-zinc-800 uppercase tracking-wide">
                          {p.word}
                        </span>
                      ) : isCurrentTurn ? (
                        <span className="text-[10px] font-mono text-red-400 animate-pulse bg-red-950/20 px-2 py-0.5 rounded-full border border-red-900/20">
                          Escribiendo...
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-600 bg-zinc-950/20 px-2 py-0.5 rounded-full border border-zinc-900">
                          Esperando
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* === B. VOTING PHASE === */}
        {room.status === GameStatus.VOTING && (
          <motion.div
            key="voting-phase"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-4"
          >
            {/* Header info */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl text-center space-y-2">
              <Vote className="w-10 h-10 text-red-500 mx-auto animate-bounce" />
              <h3 className="text-xl font-bold text-white">Fase de Votación</h3>
              <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                Analiza las palabras de cada jugador y vota secretamente por quien consideras que es el <strong>Impostor</strong>.
              </p>
            </div>

            {/* List of players and their clues with voting buttons */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h4 className="text-xs font-mono uppercase text-zinc-400 border-b border-zinc-850 pb-2">
                Pistas enviadas y voto
              </h4>

              <div className="space-y-2.5">
                {orderedPlayers.map((p) => {
                  const hasMyVote = localPlayer.vote === p.id;
                  const isMyself = p.id === playerId;
                  const canVoteThis = !localPlayer.vote && !isMyself;

                  return (
                    <div
                      key={p.id}
                      className={`flex flex-col md:flex-row md:items-center justify-between p-3.5 rounded-xl border gap-3 transition-all ${
                        hasMyVote
                          ? "bg-red-500/5 border-red-500/40"
                          : isMyself
                          ? "bg-zinc-950/50 border-zinc-900 text-zinc-400"
                          : "bg-zinc-950 border-zinc-850/60 text-white"
                      }`}
                    >
                      {/* Left: Player name and Clue word */}
                      <div className="flex items-center justify-between md:justify-start gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs text-zinc-400">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-semibold flex items-center gap-1.5 text-zinc-300">
                              <span>{p.name} {isMyself && "(Tú)"}</span>
                              {p.isBot && (
                                <span className="inline-flex items-center gap-0.5 text-[8px] font-mono font-extrabold bg-blue-950/40 text-blue-400 px-1.5 py-0.2 rounded border border-blue-900/30">
                                  <Bot className="w-2.5 h-2.5" />
                                  BOT
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">
                              Pista: <strong className="text-zinc-300 uppercase">{p.word || "Ninguna"}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Secret Vote Indicator */}
                        <div className="flex items-center gap-1.5 ml-auto md:ml-4">
                          {p.vote ? (
                            <span className="flex items-center gap-1 text-[9px] font-mono text-green-400 bg-green-950/30 px-2.5 py-0.5 rounded-full border border-green-900/30">
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                              VOTÓ
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[9px] font-mono text-zinc-500 bg-zinc-950/30 px-2.5 py-0.5 rounded-full border border-zinc-800">
                              VOTANDO
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Vote Button */}
                      {!isMyself && (
                        <button
                          onClick={() => handleVoteSubmit(p.id)}
                          disabled={!canVoteThis || isSubmittingVote}
                          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            hasMyVote
                              ? "bg-red-500 text-white border border-red-400/40 cursor-default"
                              : localPlayer.vote
                              ? "bg-zinc-900 text-zinc-600 border border-zinc-950 cursor-default opacity-50"
                              : "bg-red-600/10 hover:bg-red-600 hover:text-white border border-red-500/25 text-red-400 cursor-pointer active:scale-95"
                          }`}
                        >
                          <Vote className="w-3.5 h-3.5" />
                          {hasMyVote ? "Votado" : "Votar"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Voting feedback */}
            {localPlayer.vote && (
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-center">
                <p className="text-xs text-zinc-400">
                  Has emitido tu voto secreto. Esperando a que el resto de jugadores terminen de votar...
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* === C. RESULTS PHASE === */}
        {room.status === GameStatus.RESULTS && (
          <motion.div
            key="results-phase"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-4"
          >
            {/* Winner Spotlight Banner */}
            <div className={`w-full text-center p-6 rounded-2xl border relative overflow-hidden shadow-2xl ${
              room.winner === "INVESTIGATORS"
                ? "bg-emerald-950/30 border-emerald-900/40 text-emerald-100"
                : "bg-red-950/30 border-red-900/40 text-red-100"
            }`} id="winner-spotlight">
              <Award className={`w-14 h-14 mx-auto mb-3 animate-bounce ${
                room.winner === "INVESTIGATORS" ? "text-emerald-400" : "text-red-400"
              }`} />
              
              <h3 className="text-2xl font-extrabold tracking-wide mb-1">
                {room.winner === "INVESTIGATORS" ? "¡Ganan los Investigadores!" : "¡Gana el Impostor!"}
              </h3>
              
              <p className="text-xs opacity-80 max-w-sm mx-auto">
                {room.winner === "INVESTIGATORS"
                  ? "Se descubrió con éxito al impostor infiltrado en la ronda de votación."
                  : "El impostor logró burlar la investigación sin ser descubierto en la votación."}
              </p>
            </div>

            {/* Game Revelations Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4 text-center">
              <div>
                <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-1">
                  PALABRA SECRETA
                </p>
                <span className="text-3xl font-extrabold text-white tracking-wider uppercase">
                  🔑 {room.secretWord}
                </span>
                <p className="text-[10px] font-mono text-zinc-500 mt-1">
                  Categoría: {room.category}
                </p>
              </div>

              {/* Reveal Impostor to everyone */}
              <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl max-w-sm mx-auto">
                <span className="text-xs text-zinc-400 block mb-1">EL IMPOSTOR REAL ERA</span>
                <span className="text-sm font-bold text-red-400">
                  👤 {room.players[room.imposterId]?.name || "Desconocido"}
                </span>
              </div>
            </div>

            {/* Detailed Player Breakdown */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h4 className="text-sm font-bold text-white border-b border-zinc-850 pb-2">
                Roles y Votos Reales
              </h4>

              <div className="space-y-2">
                {playersList.map((p) => {
                  const isPlayerImposter = p.id === room.imposterId;
                  const wasVotedOut = p.id === room.votedOutId;
                  
                  // Compute received votes
                  const votesReceived = playersList.filter((voter) => voter.vote === p.id).length;

                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                        isPlayerImposter
                          ? "bg-red-500/5 border-red-500/25"
                          : "bg-zinc-950 border-zinc-850/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-white flex items-center gap-1.5 flex-wrap">
                            <span>{p.name} {p.id === playerId && "(Tú)"}</span>
                            {p.isBot && (
                              <span className="inline-flex items-center gap-0.5 text-[8px] font-mono font-extrabold bg-blue-950/40 text-blue-400 px-1 py-0.2 rounded border border-blue-900/30">
                                <Bot className="w-2 h-2" />
                                BOT
                              </span>
                            )}
                            {wasVotedOut && (
                              <span className="text-[9px] font-mono font-bold bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded border border-amber-900/30">
                                EXPULSADO 🗳️
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            Pista dada: <strong className="text-zinc-400 uppercase">{p.word || "Ninguna"}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Vote breakdown */}
                        <span className="text-xs font-mono text-zinc-400 bg-zinc-900/80 px-2 py-1 rounded-md border border-zinc-800/80">
                          {votesReceived} {votesReceived === 1 ? "voto" : "votos"}
                        </span>

                        {isPlayerImposter ? (
                          <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/40 px-2 py-1 rounded-lg border border-red-900/30">
                            🕵️‍♂️ IMPOSTOR
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-900/30">
                            🛡️ INOCENTE
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Host Reset Actions */}
            {isHost ? (
              <button
                onClick={handleRestartToLobby}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-xl py-3.5 text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] shadow-lg shadow-red-900/15"
                id="btn-restart-game"
              >
                <RefreshCw className="w-4 h-4" />
                Volver al Lobby (Nueva Partida)
              </button>
            ) : (
              <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl text-center">
                <p className="text-xs text-zinc-500 animate-pulse">
                  Esperando que el anfitrión ({room.players[room.hostId]?.name}) reinicie la sala para otra ronda...
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
