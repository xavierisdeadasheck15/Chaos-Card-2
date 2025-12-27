
import React from 'react';
import type { Card } from '../types';

interface CardProps {
  card: Card;
  isFaceDown?: boolean;
}

const PowerCardIcon: React.FC<{ power: string }> = ({ power }) => {
    const iconMap: Record<string, string> = {
        switch: '🔄',
        addUp: '+2',
        colorShuffle: '🎨',
        numberShuffle: '🔢'
    };
    return <span className="text-5xl">{iconMap[power] || '?'}</span>;
}

const PowerCardText: React.FC<{ power: string }> = ({ power }) => {
    const textMap: Record<string, string> = {
        switch: 'Switch',
        addUp: 'Add Two',
        colorShuffle: 'Color Shuffle',
        numberShuffle: 'Number Shuffle'
    };
    return <span className="font-bold text-sm absolute bottom-2">{textMap[power] || ''}</span>
}

const CardComponent: React.FC<CardProps> = ({ card, isFaceDown = false }) => {
  if (isFaceDown) {
    return (
      <div className="w-28 h-40 bg-gray-700 border-2 border-gray-500 rounded-lg flex items-center justify-center text-5xl font-bold shadow-lg cursor-default">
        C
      </div>
    );
  }

  const cardBaseClasses = "w-28 h-40 rounded-lg flex flex-col items-center justify-center relative shadow-lg text-white font-bold transition-all duration-200";
  
  if (card.type === 'number') {
    const colorMap = {
      red: 'bg-red-600',
      green: 'bg-green-600',
      blue: 'bg-blue-600',
      yellow: 'bg-yellow-500',
    };
    return (
      <div className={`${cardBaseClasses} ${colorMap[card.color]} cursor-pointer`}>
        <span className="absolute top-1 left-2 text-2xl">{card.number}</span>
        <span className="text-6xl">{card.number}</span>
        <span className="absolute bottom-1 right-2 text-2xl">{card.number}</span>
      </div>
    );
  }
  
  if (card.type === 'power') {
    return (
      <div className={`${cardBaseClasses} bg-gray-800 border-2 border-gray-400 cursor-default`}>
        <PowerCardIcon power={card.power} />
        <PowerCardText power={card.power} />
      </div>
    );
  }

  return null;
};

export default CardComponent;
