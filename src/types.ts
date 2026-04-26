export type GameView = 'login' | 'ready' | 'puzzle' | 'ranking' | 'topics' | 'question' | 'finalRank' | 'round3';

export type Round3Color = 'blue' | 'red' | 'white' | 'grey' | 'yellow';

export interface Player {
  id: number;
  name: string;
  score: number;
}

export interface Topic {
  id: number;
  name: string;
  isTaken: boolean;
  questions: string[];
}

export interface Round3Cell {
  number: number;
  color: Round3Color;
  isRevealed: boolean;
  question: string;
}

export interface Round3State {
  phase: 'intro' | 'memorize' | 'grid' | 'question';
  cells: Round3Cell[];
  activeCellIndex: number | null;
  inputBuffer: string;
  memorizeTimeLeft: number;
  questionTimeLeft: number;
  isQuestionTimerRunning: boolean;
  currentPlayerIndex: number; // 0, 1, or 2 (top 3 players)
  top3PlayerIds: number[];
  playerTopics?: {
    red: number | null;
    yellow: number | null;
    blue: number | null;
  };
}

export interface GameState {
  view: GameView;
  players: Player[];
  ranking: (number | null)[]; // Array of player IDs for each rank 1-6
  topics: Topic[];
  activePlayerId: number | null;
  activeTopicId: number | null;
  currentQuestionIndex: number;
  timeLeft: number;
  isTimerRunning: boolean;
  isRoundOver: boolean;
  puzzleValues: string[];
  puzzleHint: string;
  isRankingRevealed?: boolean;
  isAuthenticated: boolean;
  round3?: Round3State;
}
