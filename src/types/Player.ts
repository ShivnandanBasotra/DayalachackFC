export interface Player {
  id: string;
  name: string;
  rating: number; // 1-10 scale
  position?: string;
  avatar?: string;
  gamesPlayed: number;
  totalRating: number; // Sum of all ratings for average calculation
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  color: string;
  icon: string;
}

export interface GameRecord {
  id: string;
  date: string;
  team1: Player[];
  team2: Player[];
  winner?: 'team1' | 'team2' | 'draw';
  score?: string;
}