export enum GameStatus {
  LOBBY = "LOBBY",
  WORDS = "WORDS",
  VOTING = "VOTING",
  RESULTS = "RESULTS"
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isBot?: boolean; // True if this player is an AI bot
  word?: string; // Player's submitted word
  vote?: string; // ID of player this player voted for
}

export interface Room {
  code: string;
  hostId: string;
  status: GameStatus;
  category: string;
  secretWord: string;
  imposterId: string;
  players: Record<string, Player>;
  turnOrder: string[];
  currentTurnIndex: number;
  winner?: "INVESTIGATORS" | "IMPOSTOR" | null;
  votedOutId?: string | null;
  turnStartedAt?: number; // Timestamp of when the current turn started
}

export interface LocalPlayer {
  id: string;
  name: string;
}
