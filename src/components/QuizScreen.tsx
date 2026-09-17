"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, CheckCircle, AlertCircle, ArrowRight, Award } from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { progressService } from "@/services/progressService";
import { loggingService } from "@/services/loggingService";
import BottomActionButton from "@/components/BottomActionButton";

interface Option {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  test_type: "pretest" | "posttest";
  question_text: string;
  media_url?: string;
  explanation?: string;
  options: Option[];
}

interface QuizScreenProps {
  testType: "pretest" | "posttest";
  title: string;
  onComplete: (score: number) => void;
}

export default function QuizScreen({ testType, title, onComplete }: QuizScreenProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  
  // Track answers: { question_id, selected_option_id, is_correct }
  const [answers, setAnswers] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // SpeechSynthesis states
  const [speaking, setSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }

    // Fetch quiz questions
    apiClient.getQuizQuestions(testType)
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load quiz questions:", err);
        setLoading(false);
      });

    return () => {
      // Cancel TTS when unmounting
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [testType]);

  const handleSpeak = (text: string) => {
    if (!synthRef.current) return;

    if (speaking) {
      synthRef.current.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "th-TH";
    utterance.rate = 0.95; // Slightly slower for elderly comprehension
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    
    setSpeaking(true);
    synthRef.current.speak(utterance);
  };

  const handleNext = () => {
    if (!selectedOptionId) return;

    // TTS Cancel
    if (synthRef.current) {
      synthRef.current.cancel();
      setSpeaking(false);
    }

    const currentQuestion = questions[currentIdx];
    const selectedOption = currentQuestion.options.find(o => o.id === selectedOptionId);
    const isCorrect = selectedOption ? selectedOption.is_correct : false;

    // Record answer
    const newAnswer = {
      question_id: currentQuestion.id,
      selected_option_id: selectedOptionId,
      is_correct: isCorrect,
    };
    
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);

    loggingService.logEvent("submit_quiz_answer", {
      test_type: testType,
      question_id: currentQuestion.id,
      selected_option_id: selectedOptionId,
      is_correct: isCorrect,
    });

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOptionId(null);
    } else {
      // Completed last question
      setIsFinished(true);
      submitQuizResults(newScore, updatedAnswers);
    }
  };

  const submitQuizResults = async (finalScore: number, finalAnswers: any[]) => {
    setSubmitting(true);
    const session = progressService.getOrCreateSession();
    const sessionId = session?.sessionId || "";

    try {
      // 1. Save Quiz Attempt
      const attemptRes = await apiClient.saveQuizAttempt(sessionId, testType, finalScore);
      const attemptId = attemptRes?.attempt?.id;

      if (attemptId) {
        // 2. Save Quiz Answers (Batch)
        const formattedAnswers = finalAnswers.map(ans => ({
          attempt_id: attemptId,
          question_id: ans.question_id,
          selected_option_id: ans.selected_option_id,
          is_correct: ans.is_correct
        }));
        await apiClient.saveQuizAnswersBatch(formattedAnswers);
        console.log(`[QuizScreen] Successfully submitted quiz ${testType} results.`);
      }
    } catch (err) {
      console.error("[QuizScreen] Network error submitting results, offline sync handler will retry.", err);
      // Wait, in offline mode, loggingService/apiClient logs events to queue.
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--primary)] rounded-full animate-spin"></div>
        <span className="text-lg">กำลังโหลดคำถามแบบทดสอบ...</span>
      </div>
    );
  }

  // Pretest/Posttest Empty fallback
  if (questions.length === 0) {
    return (
      <div className="screen-container p-0 gap-0">
        <div className="content-area flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto text-amber-500 mb-3" />
            <h2 className="text-xl font-bold mb-2">ไม่พบรายการแบบทดสอบในระบบ</h2>
            <p className="text-[var(--text-secondary)]">โปรดติดต่อผู้ควบคุมกิจกรรมหรือเจ้าหน้าที่โครงการ</p>
          </div>
        </div>
        <BottomActionButton onClick={() => onComplete(0)}>ดำเนินการต่อ</BottomActionButton>
      </div>
    );
  }

  // Welcome Screen
  if (!started) {
    return (
      <div className="screen-container p-0 gap-0">
        <div className="content-area my-auto p-6 flex flex-col gap-6 text-center">
          <div className="w-20 h-20 bg-[var(--primary-light)] rounded-full flex items-center justify-center mx-auto text-4xl text-[var(--primary)]">
            📝
          </div>
          <div>
            <h1 className="text-3xl font-extrabold mb-2">{title}</h1>
            <p className="text-lead text-lg mt-2 leading-relaxed">
              แบบทดสอบนี้จัดทำขึ้นเพื่อทดสอบทักษะและความเข้าใจในการรู้เท่าทันสื่อดิจิทัลของท่าน
              โดยมีโจทย์คำถามทั้งหมด <strong>{questions.length} ข้อ</strong> ใช้เวลาสั้นๆ ในการทำ
            </p>
          </div>
          <div className="bg-[var(--bg-app)] border border-[var(--border)] rounded-2xl p-4 text-left text-sm text-[var(--text-secondary)] flex flex-col gap-2">
            <span className="font-bold text-[var(--text-primary)]">💡 คำแนะนำสำหรับผู้สูงอายุ:</span>
            <span>• สัมผัสเลือกคำตอบที่ท่านคิดว่าถูกต้องที่สุด</span>
            <span>• กดปุ่ม 🔊 เพื่อฟังเสียงอ่านโจทย์ช่วยประกอบการทำข้อสอบได้</span>
            <span>• ค่อยๆ ทำ ไม่ต้องรีบร้อนนะ ไม่มีเวลาจำกัด</span>
          </div>
        </div>
        <BottomActionButton
          onClick={() => {
            setStarted(true);
            loggingService.logEvent("start_quiz", { test_type: testType });
          }}
        >
          เริ่มทำแบบทดสอบ
        </BottomActionButton>
      </div>
    );
  }

  // Results Screen
  if (isFinished) {
    const scorePercentage = (score / questions.length) * 100;
    
    return (
      <div className="screen-container p-0 gap-0">
        <div className="content-area overflow-y-auto p-6">
          <div className="flex flex-col gap-4 text-center py-4">
            <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Award size={56} />
            </div>
            
            <div>
              <h1 className="text-3xl font-extrabold text-[var(--primary)]">ทำแบบทดสอบเสร็จแล้ว!</h1>
              <p className="text-lead text-lg mt-1">ขอบคุณสำหรับความตั้งใจในการตอบคำถาม</p>
            </div>

            {/* Score display */}
            <div className="premium-card p-6 flex flex-col items-center gap-1 max-w-[280px] mx-auto w-full">
              <span className="text-sm font-semibold text-[var(--text-secondary)]">คะแนนที่ท่านทำได้</span>
              <span className="text-5xl font-black text-[var(--primary-dark)]">
                {score} <span className="text-2xl font-bold text-[var(--text-secondary)]">/ {questions.length}</span>
              </span>
              <span className="text-xs text-[var(--text-secondary)] mt-1">
                (คิดเป็น {Math.round(scorePercentage)}% ของข้อสอบ)
              </span>
            </div>

            {/* Explanation / Answers Recap */}
            <div className="text-left mt-4 flex flex-col gap-3">
              <h2 className="text-lg font-bold text-[var(--text-primary)] border-b pb-2">ทบทวนเฉลยข้อสอบ:</h2>
              {questions.map((q, idx) => {
                const userAns = answers.find(a => a.question_id === q.id);
                const isCorrect = userAns ? userAns.is_correct : false;
                const correctOption = q.options.find(o => o.is_correct);
                
                return (
                  <div key={q.id} className="p-4 rounded-xl border bg-white flex flex-col gap-2 shadow-sm">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-[var(--primary)] text-[16px] shrink-0 mt-0.5">ข้อ {idx + 1}:</span>
                      <p className="font-bold text-[var(--text-primary)] text-[16px] leading-normal">{q.question_text}</p>
                    </div>

                    <div className="flex items-center gap-2 text-[14px]">
                      {isCorrect ? (
                        <span className="text-green-600 font-semibold flex items-center gap-1">
                          <CheckCircle size={16} /> ตอบถูก
                        </span>
                      ) : (
                        <span className="text-red-500 font-semibold flex items-center gap-1">
                          <AlertCircle size={16} /> ตอบผิด
                        </span>
                      )}
                    </div>

                    <p className="text-[14px] text-[var(--text-secondary)] bg-[var(--bg-app)] p-2 rounded-lg leading-relaxed">
                      <strong>คำตอบที่ถูก:</strong> {correctOption?.option_text || "ไม่ระบุ"}
                      {q.explanation && (
                        <>
                          <br />
                          <strong>คำอธิบาย:</strong> {q.explanation}
                        </>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <BottomActionButton onClick={() => onComplete(score)} disabled={submitting}>
          <span>{submitting ? "กำลังส่งผลลัพธ์..." : "ดำเนินการต่อ"}</span>
          <ArrowRight size={22} />
        </BottomActionButton>
      </div>
    );
  }

  // Active Question Screen
  const currentQuestion = questions[currentIdx];

  return (
    <div className="screen-container p-0 gap-0">
      <div className="content-area p-6">
        {/* Progress header */}
        <div className="flex justify-between items-center text-sm font-bold text-[var(--text-secondary)] mb-1">
          <span>{title}</span>
          <span className="bg-[var(--primary-light)] text-[var(--primary-dark)] px-3 py-1 rounded-full text-xs">
            ข้อ {currentIdx + 1} จาก {questions.length}
          </span>
        </div>

        {/* Question text box */}
        <div className="relative p-5 rounded-2xl bg-[var(--primary-light)] border border-[var(--primary-hover)] text-left flex flex-col gap-3">
          {/* TTS trigger */}
          <button
            type="button"
            onClick={() => handleSpeak(currentQuestion.question_text)}
            className="absolute top-4 right-4 bg-white text-[var(--primary-dark)] hover:bg-[var(--primary-light)] border border-[var(--primary)] rounded-full p-2.5 shadow-sm cursor-pointer z-10 shrink-0"
            title="อ่านออกเสียงโจทย์"
          >
            {speaking ? <VolumeX size={20} className="text-red-500" /> : <Volume2 size={20} />}
          </button>

          <p className="font-extrabold text-[var(--text-primary)] text-xl pr-12 leading-relaxed">
            {currentQuestion.question_text}
          </p>
        </div>

        {/* Media if present */}
        {currentQuestion.media_url && (
          <div className="rounded-xl overflow-hidden max-h-[160px] flex items-center justify-center border border-[var(--border)] bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={currentQuestion.media_url} 
              alt="Question illustration" 
              className="object-contain max-h-[160px] w-full"
            />
          </div>
        )}

        {/* Option choices list */}
        <div className="options-list flex flex-col gap-2 mt-2">
          {currentQuestion.options.map((opt) => (
            <div
              key={opt.id}
              className={`option-item flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-150 ${
                selectedOptionId === opt.id ? "border-[var(--primary)] bg-[var(--primary-light)]" : "border-[var(--border)] hover:bg-slate-50"
              }`}
              onClick={() => setSelectedOptionId(opt.id)}
              style={{ minHeight: "56px" }}
            >
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={opt.id}
                checked={selectedOptionId === opt.id}
                onChange={() => {}} // parent click sets value
                className="w-6 h-6 mr-3.5 accent-[var(--primary)]"
              />
              <span className="text-[18px] font-bold leading-normal text-[var(--text-primary)]">
                {opt.option_text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <BottomActionButton onClick={handleNext} disabled={!selectedOptionId}>
        <span>{currentIdx + 1 === questions.length ? "ตรวจคำตอบและส่งผล" : "ข้อถัดไป"}</span>
        <ArrowRight size={22} />
      </BottomActionButton>
    </div>
  );
}
