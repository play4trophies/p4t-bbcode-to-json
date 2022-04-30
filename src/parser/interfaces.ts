export interface GameGuide {
  game: string,
  author: string,
  trophySummary: TrophySummary,
  info: GuideInfo,
  intro: string[],
  plan: GamePlanStep[],
  trophies: TrophyGuide[],
}

export interface GamePlanStep {
  step: string,
  description: string[],
  substeps: GamePlanStep[],
}

export interface GuideInfo {
  difficulty: string;
  difficultyVoteLink: string;
  duration: string;
  trophiesOffline: number,
  trophiesOnline: number,
  trophiesMissable: number,
  trophiesGlitched: number,
  gameRuns: string,
  peripherals: string[],
  onlinePeopleRequired: number,
  difficultyTiedTrophies: string,
  cheatsAvailable: string,
  onlineRequired: string,
  dlcRequired: string,
  dlcRequiredList: string[],
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
  Platinum = "platinum",
}

export interface TrophyGuide {
  id: string,
  image: string,
  name: string,
  kind: TrophyKind,
  difficulty: number,
  hidden: boolean,
  unobtainable: boolean,
  labels: string[],
  description: string[],
  guide: string[],
}