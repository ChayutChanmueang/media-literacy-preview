import React, { useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
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

const getGameTitle = (lessonId) => {
  switch (lessonId) {
    case 'topic-1': return 'เกมจริงหรือมั่ว? (G1)';
    case 'topic-2': return 'เกมจับสัญญาณมิจ (G2)';
    case 'topic-3': return 'เกม AI หรือ คน? (G3)';
    case 'topic-5': return 'เกมกางโล่กู้ชีพ (G5)';
    case 'topic-6': return 'เกมจำลองแชท LINE (G6)';
    default: return 'เกมรู้ทันสื่อ';
  }
};

const getGameInstructions = (lessonId) => {
  switch (lessonId) {
    case 'topic-1': return 'แยกแยะข้อมูลและโพสต์ข่าวลือในช่องแชท/ออนไลน์';
    case 'topic-2': return 'หาจุดสัญญาณเตือนอันตรายจากแชทหรือโฆษณาในข้อความ';
    case 'topic-3': return 'สังเกตและจับผิดภาพถ่ายเปรียบเทียบกับภาพสังเคราะห์จาก AI';
    case 'topic-5': return 'แตะทำลายฟองภัยออนไลน์เพื่อกางเกราะและหยุดคิดถามทำ';
    case 'topic-6': return 'แตะจุดผิดปกติในแชท LINE จำลองเพื่อจับสัญญาณมิจฉาชีพ';
    default: return 'ฝึกฝนตนเองเพื่อความปลอดภัยจากสแกมเมอร์';
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
      {/* Game Header Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <HelpCircle size={20} color="var(--primary)" />
          <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{getGameTitle(lessonId)}</span>
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px' }}>แบบฝึกหัดพัฒนาสมรรถนะ</h2>
        <p className="text-small" style={{ margin: '0' }}>{getGameInstructions(lessonId)}</p>
      </div>

      {/* Render the selected game screen */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {renderGameContent()}
      </div>
    </div>
  );
}
