import React, { useState, useEffect } from 'react';
import { progressService } from './services/progressService';
import { loggingService } from './services/loggingService';
import LandingScreen from './components/LandingScreen';
import ConsentScreen from './components/ConsentScreen';
import LessonSelector from './components/LessonSelector';
import VideoScreen from './components/VideoScreen';
import GameShell from './components/GameShell';
import RewardScreen from './components/RewardScreen';
import CertificateScreen from './components/CertificateScreen';

export default function App() {
  const [session, setSession] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingRedirectLesson, setPendingRedirectLesson] = useState(null);

  // Load and reconcile state on mount
  useEffect(() => {
    const initializedSession = progressService.getOrCreateSession();
    const initializedProgress = progressService.getProgress();

    setSession(initializedSession);
    setProgress(initializedProgress);

    // Deep linking simulation (US-LEAD-01 & US-CORE-04)
    const params = new URLSearchParams(window.location.search);
    const targetLesson = params.get('lesson');
    
    if (targetLesson) {
      console.log(`Deep Link detected for lesson: ${targetLesson}`);
      
      // If they haven't completed onboarding/consent yet, save as pending
      if (!initializedSession.consentGiven || !initializedSession.ageGroup) {
        setPendingRedirectLesson(targetLesson);
      } else {
        // If they have completed onboarding, skip directly to the video step of target lesson
        const updatedProgress = {
          ...initializedProgress,
          currentStep: 'video',
          currentLessonId: targetLesson
        };
        progressService.saveProgress(updatedProgress);
        setProgress(updatedProgress);
        loggingService.logEvent('deep_link_direct_access', { lesson_id: targetLesson });
      }
    }

    setLoading(false);
  }, []);

  // Update session data from Consent Screen
  const handleSaveConsent = (consentData) => {
    const updatedSession = {
      ...session,
      ageGroup: consentData.ageGroup,
      consentGiven: consentData.consentGiven,
      location: consentData.location
    };
    
    progressService.saveSession(updatedSession);
    setSession(updatedSession);
    
    loggingService.logEvent('consent_submitted', {
      age_range: consentData.ageGroup,
      location_consent: consentData.consentGiven,
      province: consentData.location?.province,
      district: consentData.location?.district,
      sub_district: consentData.location?.subdistrict,
      source: consentData.location?.source
    });

    // Sequence transition: Go to video screen if deep link is pending, otherwise go to lessons map
    if (pendingRedirectLesson) {
      const updatedProgress = {
        ...progress,
        currentStep: 'video',
        currentLessonId: pendingRedirectLesson
      };
      progressService.saveProgress(updatedProgress);
      setProgress(updatedProgress);
      loggingService.logEvent('deep_link_post_consent_redirect', { lesson_id: pendingRedirectLesson });
      setPendingRedirectLesson(null); // Clear redirect
    } else {
      handleTransition('lessons');
    }
  };

  // General transition handler (Sequence Engine - US-CORE-04)
  const handleTransition = (nextStep) => {
    const updatedProgress = {
      ...progress,
      currentStep: nextStep
    };
    progressService.saveProgress(updatedProgress);
    setProgress(updatedProgress);
    loggingService.logEvent('screen_navigation', { from_step: progress.currentStep, to_step: nextStep });
  };

  // Handles completion of the game and score submission
  const handleGameComplete = (starsEarned) => {
    const updatedProgress = {
      ...progress,
      currentStep: 'reward',
      stars: {
        ...progress.stars,
        [progress.currentLessonId]: starsEarned
      }
    };
    progressService.saveProgress(updatedProgress);
    setProgress(updatedProgress);
  };

  const handleRestart = () => {
    // Reset to video of current lesson to allow replay
    handleTransition('video');
  };

  const handleSelectLesson = (lessonId, mode = 'manual') => {
    const updatedProgress = {
      ...progress,
      currentStep: 'video',
      currentLessonId: lessonId,
      learningMode: mode
    };
    progressService.saveProgress(updatedProgress);
    setProgress(updatedProgress);
  };

  const handleStartFlowMode = () => {
    // Find first incomplete lesson
    const lessons = ['topic-1', 'topic-2', 'topic-3', 'topic-5', 'topic-6'];
    let targetLesson = 'topic-1';
    for (const l of lessons) {
      if (progress.stars[l] === undefined) {
        targetLesson = l;
        break;
      }
    }
    handleSelectLesson(targetLesson, 'flow');
  };

  const handleStartManualMode = () => {
    const updatedProgress = {
      ...progress,
      learningMode: 'manual'
    };
    progressService.saveProgress(updatedProgress);
    setProgress(updatedProgress);
  };

  const handleNextLessonFlow = () => {
    let nextLessonId = null;
    if (progress.currentLessonId === 'topic-1') {
      nextLessonId = 'topic-2';
    } else if (progress.currentLessonId === 'topic-2') {
      nextLessonId = 'topic-3';
    } else if (progress.currentLessonId === 'topic-3') {
      nextLessonId = 'topic-5';
    } else if (progress.currentLessonId === 'topic-5') {
      nextLessonId = 'topic-6';
    }

    if (nextLessonId) {
      handleSelectLesson(nextLessonId, 'flow');
    } else {
      // Completed topic-6, go to certificate screen!
      handleTransition('certificate');
    }
  };

  const handleHeaderClick = () => {
    if (session && session.consentGiven && session.ageGroup) {
      handleTransition('lessons');
    } else {
      handleTransition('landing');
    }
  };

  const handleResetAll = () => {
    if (window.confirm('คุณต้องการรีเซ็ตข้อมูลและความคืบหน้าทั้งหมดใช่หรือไม่?')) {
      progressService.resetAll();
      loggingService.logEvent('reset_application_state');
      window.location.href = window.location.origin + window.location.pathname;
    }
  };

  if (loading || !session || !progress) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <span>กำลังเตรียมความพร้อมของแอปพลิเคชัน...</span>
      </div>
    );
  }

  // Sequence routing based on step
  const renderCurrentScreen = () => {
    switch (progress.currentStep) {
      case 'landing':
        return (
          <LandingScreen 
            onNext={() => {
              if (session.ageGroup && session.consentGiven) {
                handleTransition('lessons');
              } else {
                handleTransition('consent');
              }
            }} 
          />
        );
      case 'consent':
        return (
          <ConsentScreen 
            session={session} 
            onSave={handleSaveConsent} 
          />
        );
      case 'lessons':
        return (
          <LessonSelector 
            progress={progress}
            onSelectLesson={handleSelectLesson}
            onGoToCertificate={() => handleTransition('certificate')}
            onStartFlowMode={handleStartFlowMode}
            onStartManualMode={handleStartManualMode}
          />
        );
      case 'video':
        return (
          <VideoScreen 
            lessonId={progress.currentLessonId}
            onNext={() => handleTransition('game')} 
          />
        );
      case 'game':
        return (
          <GameShell 
            lessonId={progress.currentLessonId}
            onNext={handleGameComplete} 
          />
        );
      case 'reward':
        return (
          <RewardScreen 
            lessonId={progress.currentLessonId}
            stars={progress.stars[progress.currentLessonId] || 3} 
            learningMode={progress.learningMode}
            onRestart={handleRestart} 
            onGoToDashboard={() => handleTransition('lessons')}
            onNextLessonFlow={handleNextLessonFlow}
          />
        );
      case 'certificate':
        return (
          <CertificateScreen 
            onBackToDashboard={() => handleTransition('lessons')}
          />
        );
      default:
        return <LandingScreen onNext={() => handleTransition('consent')} />;
    }
  };

  // Determine progress bar percentage
  const getStepPercentage = () => {
    const steps = ['landing', 'consent', 'lessons', 'video', 'game', 'reward', 'certificate'];
    const idx = steps.indexOf(progress.currentStep);
    return idx === -1 ? 0 : ((idx + 1) / steps.length) * 100;
  };

  return (
    <>
      {/* Header bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '16px 20px', 
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg-card)',
        zIndex: 10
      }}>
        <div 
          onClick={handleHeaderClick}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <div style={{ backgroundColor: 'var(--primary)', width: '12px', height: '12px', borderRadius: '50%' }}></div>
          <span style={{ fontWeight: '700', fontSize: '18px', color: 'var(--primary)' }}>รู้ทันสื่อวัยเก๋า</span>
        </div>
        
        {/* Reset button for testing */}
        <button 
          onClick={handleResetAll}
          style={{ 
            fontSize: '14px', 
            padding: '6px 12px', 
            borderRadius: 'var(--radius-pill)', 
            border: '1px solid var(--border)',
            background: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          รีเซ็ตแอป
        </button>
      </div>

      {/* Progress indicators */}
      <div style={{ width: '100%', backgroundColor: 'var(--bg-card)' }}>
        <div className="progress-bar-container" style={{ borderRadius: 0, height: '6px' }}>
          <div className="progress-bar-fill" style={{ width: `${getStepPercentage()}%` }}></div>
        </div>
      </div>

      {/* Main active screen */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {renderCurrentScreen()}
      </div>

      {/* Footer bar */}
      <div style={{ 
        padding: '16px', 
        textAlign: 'center', 
        borderTop: '1px solid var(--border)', 
        backgroundColor: 'var(--bg-card)',
        fontSize: '14px',
        color: 'var(--text-secondary)'
      }}>
        <span>© 2026 NAPLAB Media Literacy Project</span>
      </div>
    </>
  );
}
