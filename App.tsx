
import React, { useState, useEffect, useCallback } from 'react';
import type { Card, NumberCard, PowerCard } from './types';
import { createDeck, shuffleDeck, isValidMove } from './utils/gameLogic';
import { POWER_CARD_CONFIG } from './constants';
import CardComponent from './components/CardComponent';

const App: React.FC = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [opponentHand, setOpponentHand] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [gameMessage, setGameMessage] = useState<string>('Welcome to Chaos Cards!');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [opponentDialogue, setOpponentDialogue] = useState<string>('');

  const topCard = discardPile[discardPile.length - 1];

  const startGame = useCallback(() => {
    const fullDeck = createDeck();
    const numberCards = shuffleDeck(fullDeck.filter(card => card.type === 'number'));
    const powerCards = shuffleDeck(fullDeck.filter(card => card.type === 'power'));

    // Player gets 5 number cards
    const playerInitialHand = numberCards.splice(0, 5);
    
    // The rest of the deck for the opponent and the draw pile
    const remainingDeck = shuffleDeck([...numberCards, ...powerCards]);
    
    // Opponent gets 5 cards from the mixed deck
    const opponentInitialHand = remainingDeck.splice(0, 5);
    
    let firstCard = remainingDeck.pop();
    // Ensure the first card on the discard pile is a number card
    while(firstCard && firstCard.type === 'power') {
        remainingDeck.unshift(firstCard);
        firstCard = remainingDeck.pop();
    }
    
    if (!firstCard) {
        // Fallback if deck is all power cards somehow
        console.error("Could not start game, no number cards in deck.");
        return;
    }

    setPlayerHand(playerInitialHand);
    setOpponentHand(opponentInitialHand);
    setDeck(remainingDeck);
    setDiscardPile([firstCard]);
    setIsPlayerTurn(true);
    setGameOver(false);
    setWinner(null);
    setGameMessage('Game started. Your turn.');
    setOpponentDialogue("Let the Game begins, shall we?");
    setTimeout(() => setOpponentDialogue(''), 4000);
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame]);

  useEffect(() => {
    if (gameOver) return;
    if (playerHand.length === 0 && deck.length > 0) {
      setGameOver(true);
      setWinner('Player');
    } else if (opponentHand.length === 0 && deck.length > 0) {
      setGameOver(true);
      setWinner('Opponent');
    }
  }, [playerHand, opponentHand, deck, gameOver]);

  useEffect(() => {
    if(winner === 'Player') {
        setGameMessage('You won! Congratulations!');
        setOpponentDialogue("Aww man.. I guess, you have won this time.");
        setTimeout(() => {
            setOpponentDialogue("Since you have may won a game, so you may can visit my secret page, & find out~");
            setTimeout(() => {
                window.location.href = 'https://incredibox-sprunki-pyramixed-fanon.fandom.com/wiki/%EA%8D%8F%EA%88%A4%EA%81%85_%EA%80%98%EA%8D%8F%EA%93%84%EA%82%A6%EA%93%84%EA%82%A6%EA%83%85%EA%8D%8F%EA%88%A4%EA%8D%8F%EA%88%A4_%EA%8C%97%EA%8D%8F_%EA%92%92%EA%80%A4%EA%80%98%EA%82%A6%EA%80%B8_%EA%88%A4%EA%81%85_%EA%8E%AD%EA%8D%8F%EA%8C%97%EA%80%98%EA%8D%8F%EA%8B%AA%EA%8D%8F';
            }, 3000);
        }, 2000);
    } else if (winner === 'Opponent') {
        setGameMessage('Opponent won. Better luck next time!');
        setOpponentDialogue("Better get next tactic, Silly Darling.");
    }
  }, [winner]);
  
  const handlePlayerDrawCard = () => {
    if (!isPlayerTurn || gameOver) return;

    const newDeck = [...deck];
    // Player can only draw number cards
    const numberCardIndex = newDeck.findIndex(card => card.type === 'number');

    if (numberCardIndex !== -1) {
      const drawnCard = newDeck.splice(numberCardIndex, 1)[0];
      setPlayerHand(prev => [...prev, drawnCard]);
      setDeck(newDeck);
      setGameMessage('You drew a card. Opponent\'s turn.');
      setIsPlayerTurn(false);
    } else {
      setGameMessage("No more number cards to draw! Opponent's turn.");
      // End player's turn even if they couldn't draw
      setIsPlayerTurn(false);
    }
  };

  const handlePlayCard = (card: Card, hand: Card[], setHand: React.Dispatch<React.SetStateAction<Card[]>>) => {
    setDiscardPile(prev => [...prev, card]);
    setHand(hand.filter(c => c.id !== card.id));
  };
  
  const handlePlayerPlayCard = (card: NumberCard) => {
    if (!isPlayerTurn || gameOver) return;

    if (isValidMove(card, topCard)) {
      handlePlayCard(card, playerHand, setPlayerHand);
      setGameMessage('You played a card. Opponent\'s turn.');
      setIsPlayerTurn(false);
    } else {
      setGameMessage('Invalid move. Try another card or draw.');
    }
  };

  const executeOpponentTurn = useCallback(() => {
    if (gameOver) return;

    setGameMessage("Opponent is thinking...");

    setTimeout(() => {
      const playableCards = opponentHand.filter(card => card.type === 'number' && isValidMove(card, topCard)) as NumberCard[];
      
      if (playableCards.length > 0) {
        const cardToPlay = playableCards[0];
        handlePlayCard(cardToPlay, opponentHand, setOpponentHand);
        setGameMessage(`Opponent played a ${cardToPlay.color} ${cardToPlay.number}. Your turn.`);
        setOpponentDialogue("Your move");
        setIsPlayerTurn(true);
        return;
      }
      
      const opponentPowerCards = opponentHand.filter(c => c.type === 'power') as PowerCard[];
      let powerCardPlayed = false;

      if(opponentPowerCards.length > 0) {
          for(const powerCard of opponentPowerCards) {
              const config = POWER_CARD_CONFIG[powerCard.power];
              if (Math.random() < config.chance) {
                  powerCardPlayed = true;
                  handlePlayCard(powerCard, opponentHand, setOpponentHand);
                  
                  let newPlayerHand = [...playerHand];
                  let newOpponentHand = opponentHand.filter(c => c.id !== powerCard.id);
                  let newDeck = [...deck];
                  
                  switch(powerCard.power) {
                      case 'switch':
                          {
                            const playerNumberCards = newPlayerHand.filter(c => c.type === 'number');
                            const opponentNumberCards = newOpponentHand.filter(c => c.type === 'number');
                            const opponentKeptPowerCards = newOpponentHand.filter(c => c.type === 'power');

                            newPlayerHand = opponentNumberCards;
                            newOpponentHand = [...playerNumberCards, ...opponentKeptPowerCards];
                            
                            setGameMessage("Opponent used Switch! Your number cards were swapped. Your turn.");
                            setOpponentDialogue("Hmph~");
                            break;
                          }
                      case 'addUp':
                          if(newDeck.length >= 2){
                              newPlayerHand.push(newDeck.pop()!, newDeck.pop()!);
                              setGameMessage("Opponent used Add Up! You draw 2 cards. Your turn.");
                              setOpponentDialogue("Tallaloop~");
                          }
                          break;
                      case 'colorShuffle':
                          newPlayerHand = newPlayerHand.map(c => {
                              if (c.type === 'number') {
                                  return {...c, color: ['red', 'green', 'blue', 'yellow'][Math.floor(Math.random() * 4)] as 'red' | 'green' | 'blue' | 'yellow'};
                              }
                              return c;
                          });
                          setGameMessage("Opponent used Color Shuffle! Your card colors are randomized. Your turn.");
                          setOpponentDialogue("Taste the rainbow just yet?");
                          break;
                      case 'numberShuffle':
                          newPlayerHand = newPlayerHand.map(c => {
                              if (c.type === 'number') {
                                  return {...c, number: Math.floor(Math.random() * 9) + 1};
                              }
                              return c;
                          });
                          setGameMessage("Opponent used Number Shuffle! Your card numbers are randomized. Your turn.");
                          setOpponentDialogue("Counting is exhausting...");
                          break;
                  }
                  
                  setPlayerHand(newPlayerHand);
                  setOpponentHand(newOpponentHand);
                  setDeck(newDeck);
                  setIsPlayerTurn(true);
                  return;
              }
          }
      }

      if (!powerCardPlayed) {
          if (deck.length > 0) {
              const newDeck = [...deck];
              const drawnCard = newDeck.pop()!;
              setOpponentHand(prev => [...prev, drawnCard]);
              setDeck(newDeck);
              setGameMessage("Opponent couldn't play and drew a card. Your turn.");
          } else {
              setGameMessage("Opponent couldn't play and deck is empty. Your turn.");
          }
          setIsPlayerTurn(true);
      }

    }, 1500);
  }, [gameOver, opponentHand, playerHand, topCard, deck]);

  useEffect(() => {
    if (!isPlayerTurn && !gameOver) {
      executeOpponentTurn();
    }
  }, [isPlayerTurn, gameOver, executeOpponentTurn]);

  return (
    <div className="flex flex-col items-center justify-between min-h-screen text-white p-4 font-sans bg-gradient-to-br from-slate-900 to-gray-800">
      {gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center z-50">
          <h2 className="text-5xl font-bold mb-4">{winner} Wins!</h2>
          <p className="text-xl mb-8">{gameMessage}</p>
          <button onClick={startGame} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xl font-semibold transition-transform transform hover:scale-105">
            Play Again
          </button>
        </div>
      )}

      {/* Opponent's Hand & Dialogue */}
      <div className="w-full flex flex-col items-center relative min-h-[16rem]">
        {opponentDialogue && (
            <div className="absolute top-0 bg-white text-gray-800 p-3 rounded-lg shadow-lg max-w-xs text-center z-20 transition-opacity duration-300">
                <p>{opponentDialogue}</p>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-[-10px] w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-white border-r-[10px] border-r-transparent"></div>
            </div>
        )}
        <div className="absolute top-24">
            <h2 className="text-2xl mb-2 text-center">Opponent ({opponentHand.length} cards)</h2>
            <div className="flex justify-center h-40 items-center">
            {opponentHand.map((card, i) => (
                <div key={card.id} className="relative" style={{ left: `${-i * 50}px` }}>
                <CardComponent card={card} isFaceDown={true} />
                </div>
            ))}
            </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex items-center justify-center space-x-8 my-4 w-full">
        <div className="flex flex-col items-center">
            <h3 className="text-lg mb-2">Deck ({deck.length})</h3>
            <div className="w-28 h-40 bg-gray-700 border-2 border-gray-500 rounded-lg flex items-center justify-center text-3xl font-bold shadow-lg">
                C
            </div>
        </div>
        <div className="flex flex-col items-center">
            <h3 className="text-lg mb-2">Discard Pile</h3>
            {topCard ? <CardComponent card={topCard} /> : <div className="w-28 h-40 bg-gray-500 rounded-lg shadow-inner"></div>}
        </div>
      </div>
      
      {/* Game Message */}
      <div className="my-4 p-3 bg-black bg-opacity-30 rounded-lg min-h-[5rem] flex items-center justify-center text-center w-full max-w-lg">
          <p className="text-xl font-medium">{gameMessage}</p>
      </div>

      {/* Player's Hand */}
      <div className="w-full flex flex-col items-center">
        <div className="flex justify-center items-end min-h-[11rem]">
            {playerHand.length > 0 ? playerHand.map(card => (
              <div
                key={card.id}
                className="mx-[-20px] transition-all duration-300 ease-in-out hover:-translate-y-6 hover:z-10"
                onClick={() => card.type === 'number' && handlePlayerPlayCard(card)}
              >
                <CardComponent card={card} />
              </div>
            )) : <p className="text-gray-400">You have no cards.</p>}
        </div>
        <h2 className="text-2xl mt-4 mb-2">Player ({playerHand.length} cards)</h2>
        <div className="flex space-x-4 mt-2">
            <button
              onClick={handlePlayerDrawCard}
              disabled={!isPlayerTurn || gameOver}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              Draw Card
            </button>
            <button
              onClick={startGame}
              className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-semibold transition-colors"
            >
              Restart Game
            </button>
        </div>
      </div>
    </div>
  );
};

export default App;
