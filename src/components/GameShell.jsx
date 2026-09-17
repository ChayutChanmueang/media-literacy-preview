import React, { useEffect } from 'react';
import G1FactCheck from './G1FactCheck';
import G2ScamSpotter from './G2ScamSpotter';
import G3AIOrNot from './G3AIOrNot';
import G5DigitalShield from './G5DigitalShield';
import G6LineSimulation from './G6LineSimulation';
import { loggingService } from '../services/loggingService';

const getGameId = (lessonId) => {
  switch (lessonId) {
    case 'topic-1': return 'G1';
    case 'topic-2': return 'G2';
    case 'topic-3': return 'G3';
    case 'topic-5': return 'G5';
    case 'topic-6': return 'G6';
    default: return 'G1';
  }
};

export default function GameShell({ lessonId, onNext }) {
  
  useEffect(() => {
    loggingService.logEvent('game_start', { game_id: getGameId(lessonId), lesson_id: lessonId });
  }, [lessonId]);


  const handleFinishGame = (starsEarned) => {
    // Save progress score and proceed
    onNext(starsEarned);
  };

  const renderGameContent = () => {
    switch (lessonId) {
      case 'topic-1':
        return <G1FactCheck onFinish={handleFinishGame} logEvent={loggingService.logEvent.bind(loggingService)} />;
      case 'topic-2':
        return <G2ScamSpotter onFinish={handleFinishGame} logEvent={loggingService.logEvent.bind(loggingService)} />;
      case 'topic-3':
        return <G3AIOrNot onFinish={handleFinishGame} logEvent={loggingService.logEvent.bind(loggingService)} />;
      case 'topic-5':
        return <G5DigitalShield onFinish={handleFinishGame} logEvent={loggingService.logEvent.bind(loggingService)} />;
      case 'topic-6':
        return <G6LineSimulation onFinish={handleFinishGame} logEvent={loggingService.logEvent.bind(loggingService)} />;
      default:
        return <G1FactCheck onFinish={handleFinishGame} logEvent={loggingService.logEvent.bind(loggingService)} />;
    }
  };

  return (
    <div className="screen-container">
      {/* Render the selected game screen */}
      <div className="flex flex-col flex-1 min-h-0">
        {renderGameContent()}
      </div>
    </div>
  );
}
