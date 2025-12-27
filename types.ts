
export type CardColor = 'red' | 'green' | 'blue' | 'yellow';
export type PowerCardType = 'switch' | 'addUp' | 'colorShuffle' | 'numberShuffle';

export interface BaseCard {
  id: string;
}

export interface NumberCard extends BaseCard {
  type: 'number';
  color: CardColor;
  number: number;
}

export interface PowerCard extends BaseCard {
  type: 'power';
  power: PowerCardType;
  // Power cards don't have a color to match against
}

export type Card = NumberCard | PowerCard;
