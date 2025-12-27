import type { Card, NumberCard } from '../types';
import { COLORS, NUMBERS, POWER_CARD_CONFIG } from '../constants';

export const createDeck = (): Card[] => {
  const deck: Card[] = [];

  // Create number cards
  for (const color of COLORS) {
    for (const number of NUMBERS) {
      // Add two of each number card per color
      deck.push({ id: crypto.randomUUID(), type: 'number', color, number });
      deck.push({ id: crypto.randomUUID(), type: 'number', color, number });
    }
  }

  // Create power cards
  // FIX: Using Object.keys provides better type inference for the config object than Object.entries, resolving the "Property 'count' does not exist on type 'unknown'" error.
  for (const power of Object.keys(POWER_CARD_CONFIG) as (keyof typeof POWER_CARD_CONFIG)[]) {
    const config = POWER_CARD_CONFIG[power];
    for (let i = 0; i < config.count; i++) {
      deck.push({ id: crypto.randomUUID(), type: 'power', power });
    }
  }
  
  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffledDeck = [...deck];
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }
  return shuffledDeck;
};

export const isValidMove = (cardToPlay: NumberCard, topOfDiscard: Card): boolean => {
  if (!topOfDiscard) return true; // Can play anything if discard is empty (should not happen after start)

  if (topOfDiscard.type === 'power') {
    // Any number card can be played on a power card
    return true;
  }
  
  if (topOfDiscard.type === 'number') {
    return cardToPlay.color === topOfDiscard.color || cardToPlay.number === topOfDiscard.number;
  }

  return false;
};