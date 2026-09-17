import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Link2, AlertTriangle } from 'lucide-react';
import { notoLoopedThai } from '@/lib/fonts';
import AutoAdvanceButton from './AutoAdvanceButton';
import Button3D from './Button3D';
import GameAnswerButton from './GameAnswerButton';
import GameChoiceButton from './GameChoiceButton';
import GameIntro from './GameIntro';
import GameSolutionCard from './GameSolutionCard';

// ข้อมูลสถานการณ์หลอกลวงจำลอง 3 รูปแบบ ตาม US-GAME-06 / design-g6.md (v2.0 — กลไกเลือกตอบกลับ)
// US-CF-26 (feedback #9): ปิดหน้า "สถานการณ์" คั่นก่อนเข้าแชทชั่วคราว — ไม่ลบโค้ด เผื่อเปิดใช้ภายหลัง
const SHOW_SCENARIO_INTRO = false;

const SCENARIOS = [
  {
    id: 'g6-s1',
    title: 'สถานการณ์ที่ 1: เจ้าหน้าที่สรรพากรทวงภาษีค้างจ่าย',
    accountName: 'สรรพากร ฝ่ายเร่งรัดหนี้สิน',
    avatarEmoji: '🏛️',
    isVerifiedBadge: false,
    ctaColor: '#06C755',
    hotlineNumber: '1441',
    hotlineLabel: 'ตำรวจไซเบอร์',
    bubbles: [
      {
        id: 's1-header', type: 'header', isRedFlag: true,
        flag: 'บัญชีไม่มีป้ายยืนยันตัวตน (Official) — ไม่ใช่หน่วยงานจริง',
        desc: '🚩 บัญชีทางการของกรมสรรพากรต้องมีป้ายยืนยันตัวตน (Official Account) สีเขียวหรือน้ำเงินกำกับชื่อเสมอ บัญชีนี้ไม่มีป้ายใดๆ แสดงว่าเป็นบัญชีบุคคลธรรมดา ไม่ใช่หน่วยงานจริง'
      },
      {
        id: 's1-b1', type: 'text', time: '10:42', isRedFlag: true,
        text: 'เรียนท่าน ตรวจพบหนี้ภาษีค้างชำระ 45,000 บาท กรุณาดำเนินการภายใน 2 ชั่วโมง มิเช่นนั้นจะถูกอายัดบัญชีธนาคารทันที',
        flag: 'ข่มขู่ เร่งรัดให้ทำใน 2 ชม. — รัฐไม่อายัดบัญชีผ่านแชท',
        desc: '🚩 ข่มขู่และเร่งรัดเวลาสั้นผิดปกติ หน่วยงานรัฐไม่มีอำนาจอายัดบัญชีผ่านข้อความแชท และไม่เร่งรัดให้ดำเนินการภายในไม่กี่ชั่วโมง'
      },
      {
        id: 's1-b2', type: 'link-card', time: '10:42', isRedFlag: true,
        thumbEmoji: '📜', linkTitle: 'ยืนยันตัวตนด่วนที่นี่', domain: 'rd-govth-payment.xyz',
        flag: 'ลิงก์ลงท้าย .xyz — ของจริงต้องเป็น .go.th เท่านั้น',
        desc: '🚩 โดเมนจริงของกรมสรรพากรต้องลงท้ายด้วย .go.th เท่านั้น โดเมนนี้สะกดเลียนแบบและลงท้ายด้วย .xyz ซึ่งเป็นของปลอม'
      },
      {
        id: 's1-b3', type: 'cta-button', time: '10:43', isRedFlag: true,
        buttonText: 'กดยืนยันตัวตนเพื่อระงับการอายัด',
        flag: 'ปุ่มเร่งให้กดทันที ไม่ให้เวลาคิดหรือปรึกษาญาติ',
        desc: '🚩 ปุ่มเร่งเร้าให้กดทันทีโดยไม่ให้เวลาตรวจสอบหรือปรึกษาญาติ เป็นเทคนิคกดดันทางจิตวิทยาแบบมิจฉาชีพ'
      },
      {
        id: 's1-b4', type: 'text', time: '10:43', isRedFlag: true,
        text: 'กรุณาแจ้งเลขบัตรประชาชน 13 หลัก และรหัส OTP ที่ได้รับทาง SMS เพื่อยืนยันตัวตนกับระบบด่วน',
        flag: 'ขอเลขบัตรประชาชน + OTP — ห้ามให้ใครเด็ดขาด',
        desc: '🚩 หน่วยงานราชการไม่มีนโยบายขอรหัส OTP หรือเลขบัตรประชาชนผ่านแชทเด็ดขาด รหัส OTP คือกุญแจสำคัญที่ห้ามให้ใครทั้งสิ้น'
      }
    ],
    responses: {
      reply_now: {
        label: 'กดตอบทันที (ทำตามที่ขอ)',
        feedback: 'อันตราย! หากให้เลขบัตรประชาชนและรหัส OTP ไป มิจฉาชีพจะสามารถนำไปสวมรอยทำธุรกรรมหรือถอนเงินจากบัญชีของท่านได้ทันที กรมสรรพากรจริงไม่มีวันขอข้อมูลนี้ผ่านแชท',
        isSafe: false
      },
      stop_and_think: {
        label: 'หยุดคิด (ไม่ตอบโต้)',
        feedback: 'ดี! การหยุดคิดและไม่ตอบโต้ปลอดภัยมาก เพราะไม่มีข้อมูลใดหลุดไปถึงมิจฉาชีพ อย่าลืมบล็อกบัญชีนี้และแจ้งเบาะแสกับตำรวจไซเบอร์ด้วยนะ',
        isSafe: true
      }
    },
    summary: 'กรมสรรพากรติดต่อประชาชนเรื่องภาษีด้วยหนังสือราชการทางไปรษณีย์เท่านั้น ไม่มีนโยบายทวงเงิน อายัดบัญชี หรือขอรหัส OTP ผ่านไลน์โดยเด็ดขาด',
    speakerSummary: 'สรุปคือ กรมสรรพากรไม่มีวันทวงเงินหรือขอรหัสโอทีพีผ่านไลน์เด็ดขาด หากเจอแบบนี้ให้ปฏิเสธหรือวางเฉยแล้วโทรเช็กกับกรมสรรพากรโดยตรง'
  },
  {
    id: 'g6-s2',
    title: 'สถานการณ์ที่ 2: เสนอสิทธิ์ลุ้นโบนัสปีใหม่จากธนาคาร',
    accountName: 'ธนาคารออมสุข Contact Center',
    avatarEmoji: '🏦',
    isVerifiedBadge: false,
    ctaColor: '#f97316',
    hotlineNumber: '1441',
    hotlineLabel: 'ตำรวจไซเบอร์',
    bubbles: [
      {
        id: 's2-header', type: 'header', isRedFlag: true,
        flag: 'บัญชีไม่มีป้ายยืนยันตัวตน — ไม่ใช่ธนาคารจริง',
        desc: '🚩 บัญชีธนาคารทางการต้องมีป้ายยืนยันตัวตน (Official Account) กำกับเสมอ บัญชีนี้ไม่มีป้ายใดๆ แสดงว่าไม่ใช่บัญชีทางการของธนาคาร'
      },
      {
        id: 's2-b1', type: 'text', time: '09:15', isRedFlag: true,
        text: '🎉 เรียนลูกค้าที่เคารพ ยินดีด้วย! เบอร์โทรศัพท์ของท่านได้รับการสุ่มเลือกให้รับสิทธิ์ลุ้นโบนัสต้อนรับปีใหม่มูลค่า 10,000 บาทจากธนาคาร',
        flag: 'อ้างสุ่มแจกโบนัส 10,000 — ธนาคารไม่แจกเงินทางแชท',
        desc: '🚩 ธนาคารจริงไม่มีนโยบายสุ่มแจกเงินโบนัสให้ลูกค้าทางแชทส่วนตัว โดยไม่มีการทำธุรกรรมหรือลงทะเบียนล่วงหน้าใดๆ มาก่อน'
      },
      {
        id: 's2-b2', type: 'sticker', time: '09:15', isRedFlag: true,
        stickerEmoji: '🎊', caption: 'ยินดีด้วยนะ!!',
        flag: 'สติกเกอร์/คำอวยพรรัวๆ ลวงให้ดีใจจนไม่ทันคิด',
        desc: '🚩 สติกเกอร์และคำอวยพรรัวๆ เป็นเทคนิคสร้างความตื่นเต้นดีใจ เพื่อลดการไตร่ตรองก่อนตัดสินใจของเหยื่อ'
      },
      {
        id: 's2-b3', type: 'cta-button', time: '09:16', isRedFlag: true,
        buttonText: 'กดรับสิทธิ์โบนัส 10,000 บาท ก่อนหมดเขตวันนี้!',
        flag: "ปุ่ม 'ก่อนหมดเขตวันนี้' บีบให้รีบกดโดยไม่ทันคิด",
        desc: '🚩 ปุ่มเร่งเร้าให้ตัดสินใจกดทันทีด้วยคำว่า "ก่อนหมดเขตวันนี้" เป็นการบีบให้รีบตัดสินใจโดยไม่ทันคิด'
      },
      {
        id: 's2-b4', type: 'text', time: '09:16', isRedFlag: true,
        text: 'กรุณาแจ้งหมายเลขบัญชี, เลขหลังบัตร 3 หลัก (CVV) และรหัส OTP ที่ได้รับทาง SMS เพื่อยืนยันสิทธิ์และรับโอนเงินเข้าบัญชี',
        flag: 'ขอเลขหลังบัตร (CVV) + OTP — ใช้ดูดเงินได้ทันที',
        desc: '🚩 ธนาคารไม่มีนโยบายขอเลขหลังบัตร (CVV) หรือรหัส OTP ผ่านช่องแชทเด็ดขาด ข้อมูลเหล่านี้ใช้ขโมยเงินจากบัญชีได้ทันทีหากหลุดไปถึงมิจฉาชีพ'
      }
    ],
    responses: {
      reply_now: {
        label: 'กดตอบทันที (ทำตามที่ขอ)',
        feedback: 'อันตราย! เลขหลังบัตร (CVV) และรหัส OTP คือกุญแจสำคัญที่ใช้โอนเงินออกจากบัญชีได้ทันที หากให้ไปมิจฉาชีพจะสามารถดูดเงินในบัญชีของท่านได้ภายในไม่กี่นาที ธนาคารจริงไม่มีวันขอข้อมูลนี้ผ่านแชท',
        isSafe: false
      },
      stop_and_think: {
        label: 'หยุดคิด (ไม่ตอบโต้)',
        feedback: 'ดี! การหยุดคิดและไม่ตอบโต้ปลอดภัยมาก หากสงสัยเรื่องโบนัสให้โทรสอบถามคอลเซ็นเตอร์ธนาคารจากเบอร์ทางการหลังบัตรของท่านเองแทนนะ',
        isSafe: true
      }
    },
    summary: 'ธนาคารไม่มีนโยบายสุ่มแจกโบนัสทางแชทส่วนตัว และไม่มีวันขอเลขบัตร รหัสหลังบัตร หรือ OTP ผ่านช่องแชทเด็ดขาด หากสงสัยให้โทรสอบถามคอลเซ็นเตอร์ธนาคารจากเบอร์ทางการหลังบัตรเท่านั้น',
    speakerSummary: 'สรุปคือ ธนาคารไม่มีทางสุ่มแจกโบนัสทางไลน์ และไม่มีวันขอเลขหลังบัตรหรือโอทีพีเด็ดขาด หากสงสัยให้โทรเบอร์คอลเซ็นเตอร์ที่หลังบัตรของท่านเอง'
  },
  {
    id: 'g6-s3',
    title: 'สถานการณ์ที่ 3: ชักชวนลงทุนกองทุนเกษียณผลตอบแทนสูง',
    accountName: 'โค้ชการเงิน อ.มานะ (ที่ปรึกษาวัยเกษียณ)',
    avatarEmoji: '📈',
    isVerifiedBadge: false,
    ctaColor: '#dc2626',
    hotlineNumber: '1207',
    hotlineLabel: 'สำนักงาน ก.ล.ต.',
    bubbles: [
      {
        id: 's3-header', type: 'header', isRedFlag: true,
        flag: 'บัญชีส่วนตัวไม่มีป้ายยืนยัน — ที่ปรึกษาจริงไม่ทักสุ่ม',
        desc: '🚩 ที่ปรึกษาการเงินที่ได้รับใบอนุญาตจริงจาก ก.ล.ต. จะไม่ใช้บัญชีไลน์ส่วนตัวที่ไม่มีป้ายยืนยันตัวตนใดๆ ทักทายชักชวนลงทุนแบบสุ่ม'
      },
      {
        id: 's3-b1', type: 'text', time: '13:05', isRedFlag: true,
        text: 'สวัสดีพี่ ผมเห็นพี่สนใจเรื่องวางแผนการเงินหลังเกษียณ วันนี้มีกองทุนพิเศษเปิดรับสมาชิกจำกัดจำนวนเท่านั้น',
        flag: "อ้าง 'เห็นพี่สนใจ' ทั้งที่ไม่รู้จักกัน — ล่าเหยื่อแบบสุ่ม",
        desc: '🚩 การทักทายอ้างว่า "เห็นพี่สนใจ" ทั้งที่ไม่เคยรู้จักกันมาก่อน เป็นวิธีเปิดบทสนทนาของมิจฉาชีพที่ล่าเหยื่อแบบสุ่ม'
      },
      {
        id: 's3-b2', type: 'image', time: '13:06', isRedFlag: true,
        chartCaption: 'ผลตอบแทนเฉลี่ย 15% ทุกสัปดาห์ การันตีไม่มีความเสี่ยงขาดทุน',
        flag: 'ผลตอบแทน 15%/สัปดาห์ การันตีไม่ขาดทุน — สูงเกินจริง',
        desc: '🚩 ผลตอบแทน 15% ต่อสัปดาห์สูงเกินความเป็นจริงอย่างมาก การลงทุนทุกประเภทมีความเสี่ยงเสมอ ไม่มีใครรับประกันไม่ขาดทุนได้จริง'
      },
      {
        id: 's3-b3', type: 'text', time: '13:06', isRedFlag: true,
        text: 'พี่ๆ ในกลุ่มหลายคนได้รับผลตอบแทนจริงกันหมดแล้ว เพียงลงทุนขั้นต่ำ 5,000 บาท ก็เริ่มรับปันผลได้ทันทีทุกสัปดาห์',
        flag: 'อ้างคนอื่นได้เงินจริงกันหมดแล้ว — Social Proof ปลอม',
        desc: '🚩 การอ้างว่า "คนอื่นได้ผลตอบแทนจริงกันหมดแล้ว" เป็นเทคนิคสร้างความน่าเชื่อถือปลอมโดยไม่มีหลักฐานตรวจสอบได้จริง (Social Proof ปลอม)'
      },
      {
        id: 's3-b4', type: 'link-card', time: '13:07', isRedFlag: true,
        thumbEmoji: '🔒', linkTitle: 'เข้ากลุ่มไลน์ลับสมาชิก VIP วางแผนเกษียณ', domain: 'vip-retire-fund.click',
        flag: 'ชวนเข้ากลุ่มลับ + ลิงก์ .click — เลี่ยงการตรวจสอบ',
        desc: '🚩 การชักชวนเข้ากลุ่มไลน์ปิดเป็นการหลีกเลี่ยงการตรวจสอบจากคนนอกหรือญาติ และโดเมนลงท้าย .click ไม่ใช่เว็บของบริษัทหลักทรัพย์ที่ได้รับอนุญาตจริง'
      }
    ],
    responses: {
      reply_now: {
        label: 'กดตอบทันที (โอนเงินลงทุน)',
        feedback: 'อันตราย! การโอนเงินลงทุนกับบัญชีที่ไม่มีใบอนุญาตจากสำนักงาน ก.ล.ต. มีความเสี่ยงสูงมากที่จะถูกโกงจนไม่ได้เงินคืนเลย ผลตอบแทนสูงเกินจริงแบบนี้คือสัญญาณแชร์ลูกโซ่',
        isSafe: false
      },
      stop_and_think: {
        label: 'หยุดคิด (ไม่ตอบโต้)',
        feedback: 'ดี! การหยุดคิดและไม่ตอบโต้ปลอดภัยมาก คนที่ทักมาชวนลงทุนแบบไม่เคยรู้จักกันมาก่อนมักเป็นมิจฉาชีพ ควรบล็อกไว้ก่อนนะ',
        isSafe: true
      }
    },
    summary: 'ผลตอบแทนสูงเกินจริงพร้อมการันตีไม่ขาดทุนคือสัญญาณแชร์ลูกโซ่ชัดเจน ควรตรวจสอบใบอนุญาตที่ปรึกษาการเงินกับสำนักงาน ก.ล.ต. ก่อนโอนเงินทุกครั้ง',
    speakerSummary: 'สรุปคือ ผลตอบแทนสูงมากแบบไม่มีความเสี่ยงคือโกงแน่นอน ก่อนลงทุนกับใคร ให้โทรเช็กใบอนุญาตกับสำนักงาน ก ล ต ก่อนเสมอ'
  }
];

const BUBBLE_REVEAL_DELAY_MS = 2000; // US-CF-10: หน่วง 2 วิ/ฟอง เพื่อให้จังหวะการอ่านกำลังดี

export default function G6LineSimulation({ onFinish, logEvent }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [responseChosen, setResponseChosen] = useState(null); // null | 'reply_now' | 'stop_and_think'
  const [expandedIds, setExpandedIds] = useState({});
  const [introDone, setIntroDone] = useState(!SHOW_SCENARIO_INTRO); // เฟส intro (แสดงสถานการณ์) → chat
  const [showHowTo, setShowHowTo] = useState(true); // US-CF-03: หน้าแนะนำวิธีเล่นระดับเกม (แสดงครั้งเดียวก่อนเริ่ม)
  const [scamWarning, setScamWarning] = useState(null); // US-CF-11: คำเตือนเมื่อกด scam element
  const [autoPaused, setAutoPaused] = useState(false); // US-UX-07: หยุดตัวนับ auto-advance ระหว่างผู้ใช้อ่าน/เลื่อนเฉลย (เหมือน G1/G3)
  const scoreRef = useRef({ safe: 0, total: 0 });
  const chatBodyRef = useRef(null);

  // Auto-dismiss scam warning after 5 seconds if not closed manually
  useEffect(() => {
    if (!scamWarning) return undefined;
    const timer = setTimeout(() => setScamWarning(null), 5000);
    return () => clearTimeout(timer);
  }, [scamWarning]);

  const scenario = SCENARIOS[currentIdx];
  // US-CF-09B: แยกหัวข้อสถานการณ์ "สถานการณ์ที่ N: <ชื่อเรื่อง>" เป็น 2 บรรทัด (ป้ายลำดับ / ชื่อเรื่อง)
  const [scenarioLabel, ...scenarioTitleRest] = scenario.title.split(': ');
  const scenarioTitleText = scenarioTitleRest.join(': ');
  const headerBubble = scenario.bubbles.find((b) => b.type === 'header');
  const bodyBubbles = scenario.bubbles.filter((b) => b.type !== 'header');
  const conversationDone = revealedCount >= bodyBubbles.length;
  const showTyping = !responseChosen && !conversationDone;

  // US-FLOW-02: รายงานความคืบหน้าต่อสถานการณ์ให้ progress bar (AppLayout ฟัง event นี้)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('flowStepProgress', { detail: currentIdx / SCENARIOS.length }));
    }
  }, [currentIdx]);

  // Intro → Chat: auto-advance 30 วิ ย้ายไปคุมที่ปุ่ม "อ่านข้อความเลย" (AutoAdvanceButton) — ดูปุ่มด้านล่าง

  // เล่นบทสนทนาอัตโนมัติทีละฟอง (ไม่ใช่การจับเวลากดดันผู้เล่น แค่ Reveal Animation) — เริ่มเมื่อเข้าเฟส chat
  useEffect(() => {
    // หน้า GameIntro ยังบังเกมอยู่: ห้ามเริ่ม timer ล่วงหน้า ไม่เช่นนั้นข้อความจะ reveal
    // ครบทุกฟองอยู่ด้านหลัง หากผู้ใช้อ่านวิธีเล่นนานกว่าระยะเวลารวมของบทสนทนา
    if (showHowTo || !introDone || responseChosen || conversationDone) return undefined;

    // ฟองแรกแสดงทันที (ไม่หน่วง) — ฟองถัดไปหน่วงตามปกติ
    const delay = revealedCount === 0 ? 0 : BUBBLE_REVEAL_DELAY_MS;
    const timer = setTimeout(() => {
      setRevealedCount((c) => c + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [showHowTo, introDone, currentIdx, revealedCount, responseChosen, conversationDone]);

  // Auto-scroll โซนแชทให้เห็นฟองล่าสุดเสมอ เมื่อมีฟองใหม่ทยอยขึ้น/typing indicator เปลี่ยน
  useEffect(() => {
    const el = chatBodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [revealedCount, showTyping, conversationDone, currentIdx]);

  const handleToggleExplain = (bubble) => {
    if (!responseChosen || !bubble.isRedFlag) return;
    setExpandedIds((prev) => ({ ...prev, [bubble.id]: !prev[bubble.id] }));
  };

  // US-CF-11: จัดการเมื่อผู้เล่นเผลอกด Scam Element ก่อนเลือกคำตอบ
  const handleScamClick = (bubble) => {
    const warnings = ['กดไม่ได้นะ!', 'อย่ากดนะ!'];
    const text = warnings[Math.floor(Math.random() * warnings.length)];
    setScamWarning(text);
    logEvent('click_scam_element', { game_id: 'G6', scenario_id: scenario.id, bubble_id: bubble.id, type: bubble.type });
  };

  const handleChooseResponse = (key) => {
    if (responseChosen) return;
    setResponseChosen(key);

    const isSafe = scenario.responses[key].isSafe;
    scoreRef.current.safe += isSafe ? 1 : 0;
    scoreRef.current.total += 1;

    logEvent('select_response', {
      game_id: 'G6',
      scenario_id: scenario.id,
      response: key,
      is_safe: isSafe
    });
  };

  const handleNext = () => {
    if (currentIdx < SCENARIOS.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setRevealedCount(0);
      setResponseChosen(null);
      setExpandedIds({});
      setIntroDone(!SHOW_SCENARIO_INTRO);
      setScamWarning(null);
      logEvent('enter_scenario', { game_id: 'G6', scenario_id: SCENARIOS[nextIdx].id });
    } else {
      const { safe, total } = scoreRef.current;
      const ratio = total > 0 ? safe / total : 0;
      const starRating = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;
      logEvent('game_complete', { game_id: 'G6', safe_responses: safe, total_responses: total, stars: starRating });
      onFinish(starRating);
    }
  };

  // สร้างเลขลำดับกำกับ Red Flag สำหรับหน้าเฉลย (①②③...)
  const flagIndexMap = {};
  let flagCounter = 0;
  scenario.bubbles.forEach((b) => {
    if (b.isRedFlag) {
      flagCounter += 1;
      flagIndexMap[b.id] = flagCounter;
    }
  });

  const getBubbleWrapperStyle = (bubble) => {
    const revealed = !!responseChosen && bubble.isRedFlag;

    // Figma node 2065:7122 — ฟองขาวมุมมน 24, ตัวอักษร 20px, กว้างเต็มคอลัมน์
    let style = {
      border: '2px solid transparent',
      borderRadius: '24px',
      backgroundColor: '#ffffff',
      padding: '14px',
      transition: 'all 0.2s ease',
      width: '100%'
    };

    if (!responseChosen && (bubble.type === 'link-card' || bubble.type === 'cta-button')) {
      style.cursor = 'pointer';
    }

    if (revealed) {
      style = {
        ...style,
        border: '3px solid var(--accent-error)',
        backgroundColor: '#fef2f2',
        boxShadow: '0 0 10px rgba(220, 38, 38, 0.2)',
        cursor: 'pointer'
      };
    }
    return style;
  };

  const renderBubbleContent = (bubble) => {
    switch (bubble.type) {
      case 'text':
        return <div className="text-[20px] font-normal leading-[30px] text-[#4B4B4B]">{bubble.text}</div>;
      case 'sticker':
        return (
          <div className="text-center p-1">
            <div className="text-[clamp(34px,10.43vw,48px)] leading-none">{bubble.stickerEmoji}</div>
            <div className="text-[clamp(11px,3.48vw,16px)] font-bold mt-1 text-[#1a1a1a]">{bubble.caption}</div>
          </div>
        );
      case 'image':
        return (
          <div>
            <div className="flex items-end gap-1.5 h-[70px] bg-[#f0fdf4] rounded-lg p-2 mb-2">
              {/* Bar heights are a fixed decorative dataset, kept inline for the per-bar percentage */}
              {[30, 55, 45, 70, 90].map((h, i) => (
                <div key={i} className="flex-1 bg-[#16a34a] rounded-t-[3px]" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="text-[clamp(12px,3.7vw,17px)] font-bold text-[#1a1a1a] leading-snug">{bubble.chartCaption}</div>
          </div>
        );
      case 'link-card':
        return (
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[clamp(17px,5.22vw,24px)] shrink-0">
                {bubble.thumbEmoji}
              </div>
              <div className="text-[clamp(12px,3.7vw,17px)] font-bold text-[#1a1a1a] leading-snug">{bubble.linkTitle}</div>
            </div>
            <div className="mt-2 pt-2 border-t border-[#e5e5e5] flex items-center gap-1 text-[clamp(10px,3.04vw,14px)] text-[#6b7280]">
              <Link2 size={14} />
              <span>{bubble.domain}</span>
            </div>
          </div>
        );
      case 'cta-button':
        return (
          /* ctaColor comes from the scenario data, so background-color stays inline */
          <button
            className="w-full border-none rounded-[var(--radius-pill)] text-white font-bold text-[clamp(13px,3.91vw,18px)] py-3.5 px-4 shadow-[0_4px_10px_rgba(0,0,0,0.15)] pointer-events-none"
            style={{ backgroundColor: scenario.ctaColor }}
          >
            {bubble.buttonText}
          </button>
        );
      default:
        return null;
    }
  };

  const visibleBodyBubbles = bodyBubbles.slice(0, revealedCount);

  // กรอบจอ LINE จำลอง — ตัด status bar (เวลา/wifi/แบต) + input bar (พิมพ์ข้อความ) ออก
  // เหลือแค่ header (ใครกำลังคุย) + ฟองข้อความ + คำกำกับเล็ก; ความสูง/scroll คุมด้วย flex (ตามพื้นที่จริง)
  const renderPhoneFrame = (frameClass, chatBodyClass) => (
    <div className={`${notoLoopedThai.className} flex flex-col overflow-hidden rounded-t-[24px] border-2 border-solid border-[#D9D9D9] bg-[#8DABD9] ${frameClass}`}>
      {/* Chat Header — ใครกำลังส่งข้อความมา */}
      <div
        onClick={() => headerBubble && handleToggleExplain(headerBubble)}
        className="flex h-[54px] shrink-0 items-center justify-center border-b-2 border-solid border-[#D9D9D9] bg-white"
        style={{
          ...(headerBubble ? getBubbleWrapperStyle(headerBubble) : {}),
          borderRadius: 0, boxShadow: 'none', maxWidth: 'none', padding: 0,
          cursor: responseChosen ? 'pointer' : 'default'
        }}
      >
        {/* ไม่มีลูกศรกลับ/ปุ่มโทร/เมนู — กันผู้สูงอายุเข้าใจผิดว่ากดออกจากเกมหรือโทรออกได้ */}
        <span className="truncate text-[20px] font-semibold leading-[30px] text-[#4B4B4B]">{scenario.accountName}</span>
      </div>
      {responseChosen && headerBubble && expandedIds[headerBubble.id] && (
        <div className="shrink-0 bg-[#fef2f2] px-[24px] py-[10px] text-[18px] font-bold leading-[26px] text-[var(--accent-error)]">
          {headerBubble.desc}
        </div>
      )}

      {/* Chat body — ฟองข้อความทยอยขึ้น; สูง/scroll ตามพื้นที่จริง + auto-scroll ฟองล่าสุด */}
      <div
        ref={chatBodyRef}
        className={`flex flex-col gap-[12px] overflow-y-auto pb-[24px] pl-[24px] pr-[44px] pt-[12px] ${chatBodyClass}`}
      >
        {visibleBodyBubbles.map((bubble) => (
          <div key={bubble.id} className="relative flex w-full flex-col items-start gap-[12px] [animation:fadeIn_0.25s_ease-out]">
            <div
              onClick={() => {
                if (!responseChosen && (bubble.type === 'link-card' || bubble.type === 'cta-button')) {
                  handleScamClick(bubble);
                } else {
                  handleToggleExplain(bubble);
                }
              }}
              style={getBubbleWrapperStyle(bubble)}
            >
              {renderBubbleContent(bubble)}
              {responseChosen && bubble.isRedFlag && (
                <div className="absolute -top-2.5 -right-2.5 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[var(--accent-error)] text-[14px] font-bold text-white shadow-[var(--shadow-sm)]">
                  {flagIndexMap[bubble.id]}
                </div>
              )}
            </div>
            {bubble.time && (
              <span className="text-[12px] font-normal leading-[16px] text-black">{bubble.time}</span>
            )}
            {responseChosen && bubble.isRedFlag && expandedIds[bubble.id] && (
              <div className="w-full rounded-[24px] border-2 border-dashed border-[#fca5a5] bg-[#fef2f2] px-[14px] py-[10px] text-[18px] font-bold leading-[26px] text-[var(--accent-error)] [animation:fadeIn_0.3s_ease-out]">
                {bubble.desc}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {showTyping && (
          <div className="flex w-fit items-center gap-1.5 rounded-[24px] bg-white px-[14px] py-[14px]">
            <span className="w-2 h-2 rounded-full bg-[#9aa0a6] [animation:g6TypingDot_1s_ease-in-out_infinite]" />
            <span className="w-2 h-2 rounded-full bg-[#9aa0a6] [animation:g6TypingDot_1s_ease-in-out_0.15s_infinite]" />
            <span className="w-2 h-2 rounded-full bg-[#9aa0a6] [animation:g6TypingDot_1s_ease-in-out_0.3s_infinite]" />
          </div>
        )}

        {/* ข้อความระบบในแชท — บอกให้ผู้เล่นเลือกตอบกลับหรือไม่ตอบกลับ */}
        {conversationDone && !responseChosen && (
          <div className="mt-1 w-full rounded-[24px] border-2 border-solid border-[var(--primary)] bg-[var(--primary-light)] px-[14px] py-[12px] text-center [animation:fadeIn_0.3s_ease-out]">
            <p className="text-[20px] font-bold leading-[30px] text-[var(--primary-dark)]">
              👉 อ่านข้อความในไลน์นี้แล้ว ท่านจะทำอย่างไร
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // US-CF-03: หน้าแนะนำวัตถุประสงค์ + วิธีเล่น (ระดับเกม) ก่อนเข้าสถานการณ์แรก
  if (showHowTo) {
    return (
      <GameIntro
        title="เกมจำลองแชทไลน์"
        objective="ลองอยู่ในสถานการณ์แชทไลน์ที่มีคนทักเข้ามา ฝึกจับสัญญาณเตือนภัยมิจฉาชีพให้ทัน"
        choices="กดตอบทันที · หยุดคิด"
        imageSrc="/assets/icon-game/line-icon.png"
        imageAlt="ไลน์"
        onStart={() => {
          // เริ่ม timeline ของแชทจากฟองแรกเสมอ แม้ component เคย render หน้า Intro ค้างไว้
          setRevealedCount(0);
          setShowHowTo(false);
          logEvent('game_intro_start', { game_id: 'G6' });
        }}
      />
    );
  }

  return (
    <div className={`flex flex-col flex-1 min-h-0 ${responseChosen ? 'bg-white' : 'bg-[#E8EAF3]'}`}>



      {!introDone ? (
        /* INTRO เฟสแรก: แสดงสถานการณ์เต็มจอ (auto ไปแชทใน 15 วิ หรือกดข้าม) — US-CF-09 ขยายตัวอักษร */
        <div className="flex-1 min-h-0 flex flex-col justify-center gap-5 text-center px-2 [animation:fadeIn_0.3s_ease-out]">
          <div className="text-[clamp(45px,13.91vw,64px)] leading-none">📱💬</div>
          <h3 className="flex flex-col gap-1.5 leading-snug">
            {scenario.title.includes(': ') ? (
              <>
                <span className="text-[clamp(16px,4.5vw,22px)] text-[var(--text-secondary)] font-normal">
                  {scenario.title.split(': ')[0]}
                </span>
                <span className="text-[clamp(22px,7vw,32px)] font-bold">
                  {scenario.title.split(': ')[1]}
                </span>
              </>
            ) : (
              <span className="text-[clamp(20px,6.5vw,30px)] font-bold">{scenario.title}</span>
            )}
          </h3>
          <p className="text-[clamp(18px,5.2vw,24px)] text-[var(--text-secondary)] leading-relaxed">
            เดี๋ยวจะมีข้อความเข้ามาในไลน์ ลองอ่านให้จบแล้วคิดดูว่าจะทำอย่างไร
          </p>
          <p className="text-[clamp(14px,3.5vw,16px)] text-[var(--text-secondary)] opacity-80">ระบบจะพาไปหน้าแชทเองเมื่อครบเวลา (ดูแถบที่ปุ่มด้านล่าง)</p>
        </div>
      ) : !responseChosen ? (
        /* READING เฟสสอง: จอจำลองเต็มพื้นที่ที่เหลือ, แชท scroll ตามความสูงจริง (flex);
           คำสั่ง "ตอบกลับยังไง" แสดงเป็นข้อความระบบในแชทแทน (ดู renderPhoneFrame) */
        <div className="flex-1 min-h-0 flex flex-col pt-[24px]">
          {renderPhoneFrame('flex-1 min-h-0', 'flex-1 min-h-0')}
        </div>
      ) : (
        /* REVEAL — Figma nodes 2065:7021 / 2065:7033 (การ์ดเฉลยกลาง ใช้ร่วมทุกเกม) */
        <GameSolutionCard
          tone={scenario.responses[responseChosen].isSafe ? 'correct' : 'wrong'}
          banner={scenario.responses[responseChosen].isSafe ? 'ปลอดภัย' : 'ไม่ปลอดภัย'}
          heading="ทำไมแชทนี้ถึงอันตราย"
          onReadingChange={setAutoPaused}
        >
          <p className="mb-[16px] font-semibold">ท่านเลือก: {scenario.responses[responseChosen].label}</p>

          <ul className="flex flex-col gap-[12px]">
            {scenario.bubbles.filter((b) => b.isRedFlag && (b.flag || b.desc)).map((b, i) => (
              <li key={i} className="flex gap-[8px]">
                <span className="shrink-0 font-bold">•</span>
                <span>{b.flag || b.desc}</span>
              </li>
            ))}
          </ul>

          <p className="mt-[26px] text-[24px] font-semibold leading-[32px]">เกราะป้องกันภัย: หยุด คิด ถาม ทำ</p>
          <p className="mt-[8px]">{scenario.summary}</p>

          <a
            href={`tel:${scenario.hotlineNumber}`}
            onClick={() => logEvent('click_hotline', { game_id: 'G6', scenario_id: scenario.id, hotline: scenario.hotlineNumber })}
            className="mt-[16px] inline-block font-semibold text-[#0078A8] underline"
          >
            โทรแจ้ง{scenario.hotlineLabel} โทร. {scenario.hotlineNumber}
          </a>
        </GameSolutionCard>
      )}

      {/* Button Panel — เฟส intro: ปุ่มข้าม / เฟส chat: ปุ่มตอบ / ตอบแล้ว: ปุ่มถัดไป — ชิดจอจำลอง ไม่มีช่องว่าง */}
      <div className="shrink-0">
        {!introDone ? (
          <AutoAdvanceButton
            key={`g6-intro-${currentIdx}`}
            onClick={() => {
              setIntroDone(true);
              logEvent('intro_skip', { game_id: 'G6', scenario_id: scenario.id });
            }}
            onAutoAdvance={() => setIntroDone(true)}
            delayMs={15000}
            className="btn btn-primary text-[clamp(18px,5.65vw,26px)] min-h-[100px] w-full relative rounded-t-[25px] rounded-b-none"
          >
            <span>อ่านข้อความเลย</span>
            <ArrowRight size={28} />
          </AutoAdvanceButton>
        ) : !responseChosen ? (
          /* US-CF-12: 2 ตัวเลือก ตอบกลับ(เขียว) / ไม่ตอบกลับ(เหลือง) — ขยายกว้างเต็มจอ */
          <div className="flex gap-[8px] px-[24px] pb-[64px] pt-[36px]">
            <GameAnswerButton
              tone="green"
              iconSrc="/images/games/answer-true.svg"
              label="กดตอบทันที"
              onClick={() => handleChooseResponse('reply_now')}
              disabled={!conversationDone}
            />
            <GameAnswerButton
              tone="yellow"
              iconSrc="/images/games/answer-unsure.svg"
              label="หยุดคิด"
              onClick={() => handleChooseResponse('stop_and_think')}
              disabled={!conversationDone}
            />
          </div>
        ) : (
          <div className="px-[24px] pb-[64px] pt-[22px]">
            <Button3D
              key={`g6-next-${currentIdx}`}
              onClick={handleNext}
              onAutoAdvance={handleNext}
              autoAdvanceMs={30000}
              autoAdvancePaused={autoPaused}
            >
              กดเพื่อไปต่อ
            </Button3D>
          </div>
        )}
      </div>

      {/* US-CF-11: Scam Element Warning Modal */}
      {scamWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 [animation:fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-[var(--radius-xl)] p-6 max-w-sm w-full shadow-[var(--shadow-premium)] flex flex-col items-center text-center border-2 border-[var(--border)] relative">
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-[var(--accent-error)] mb-3 shadow-sm">
              <AlertTriangle size={42} />
            </div>
            <h4 className="text-[clamp(22px,6vw,30px)] font-bold text-[var(--accent-error)] mb-2">
              {scamWarning}
            </h4>
            <p className="text-[clamp(14px,4vw,18px)] text-[var(--text-secondary)] mb-6 leading-relaxed">
              ในชีวิตจริง ไม่ควรกดลิงก์หรือปุ่มลักษณะนี้จากคนที่ไม่น่าเชื่อถือเด็ดขาดนะ!
            </p>
            <div className="w-[200px] flex">
              <GameChoiceButton
                variant="green"
                label="เข้าใจแล้ว"
                onClick={() => setScamWarning(null)}
                className="min-h-[56px] py-2"
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes g6TypingDot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}
