import { Dispatch, SetStateAction, useMemo, useRef, useState } from 'react';
import { GameDifficulty } from '../enums/GameDifficulty';
import { GridTileCoords } from '../models/Grid';


const levels : Record<GameDifficulty, GridTileCoords> = Object.freeze({
  // { col: 2, row: 2 },
  [GameDifficulty.VaryEasy]: {col: 3, row: 3},
  [GameDifficulty.Easy]: {col: 4, row: 3},
  [GameDifficulty.Normal]: {col: 5, row: 4},
  [GameDifficulty.Medium]: {col: 6, row: 5},
  [GameDifficulty.Hard]: {col: 7, row: 6},
});

type GameDifficultyState = {
  difficulty: GameDifficulty;
  coords: GridTileCoords;
  canGoHigh: boolean;
  canGoLow: boolean;
}
export function useGameDifficulty(initialDifficulty: GameDifficulty = GameDifficulty.VaryEasy): [GameDifficultyState, Dispatch<SetStateAction<GameDifficulty>>] {
  const [difficulties, setDifficulties] = useState(initialDifficulty);
  const canGoLow = difficulties !== GameDifficulty.VaryEasy;
  const canGoHigh = difficulties !== GameDifficulty.Hard;

  return [
    {
      canGoHigh,
      canGoLow,
      coords: useMemo(()=> levels[difficulties], [difficulties]),
      difficulty: difficulties,
    },
    setDifficulties,
  ]
}
