
import type { CardColor, PowerCardType } from './types';

export const COLORS: CardColor[] = ['red', 'green', 'blue', 'yellow'];
export const NUMBERS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const POWER_CARD_CONFIG: Record<PowerCardType, { chance: number, count: number }> = {
  switch: { chance: 0.25, count: 4 },
  addUp: { chance: 0.10, count: 4 },
  colorShuffle: { chance: 0.05, count: 4 },
  numberShuffle: { chance: 0.05, count: 4 },
};
