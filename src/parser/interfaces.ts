export interface GameGuide {
  game: string,
  author: string,
  trophySummary: TrophySummary,
  info: GuideInfo,
  intro: string,
  plan: string,
  trophies: TrophyGuide[],
}

export interface GuideInfo {
  difficulty: string;
  difficultyVoteLink: string;
  duration: string;
  trophiesOffline: number,
  trophiesOnline: number,
  trophiesMissable: number,
  trophiesGlitched: number,
  gameRuns: number,
  peripherals: string[],
  onlinePeopleRequired: number,
  difficultyTiedTrophies: string,
  cheatsAvailable: string,
  onlineRequired: string,
  dlcRequired: string,
  dlcPrice: string,
  storePrice: string,
}

export interface TrophySummary {
  total: number,
  gold: number,
  silver: number,
  bronze: number,
  platinum: number,
}

export enum TrophyKind {
  Gold = "gold",
  Silver = "silver",
  Bronze = "bronze",
}

export interface TrophyGuide {
  id: number,
  name: string,
  kind: TrophyKind,
  difficulty: number,
  labels: string[],
  description: string,
  guide: string
}