import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Link2, AlertTriangle } from 'lucide-react';
import { notoLoopedThai } from '@/lib/fonts';
import AutoAdvanceButton from './AutoAdvanceButton';
import Button3D from './Button3D';
import GameAnswerButton from './GameAnswerButton';
import GameChoiceButton from './GameChoiceButton';
import GameIntro from './GameIntro';
import GameSolutionCard from './GameSolutionCard';

// ข้อมูลสถานการณ์หลอกลวงจำลอง 10 สถานการณ์ ตาม US-GAME-06 / design-g6.md (v2.0 — กลไกเลือกตอบกลับ)
// US-CF-26 (feedback #9): ปิดหน้า "สถานการณ์" คั่นก่อนเข้าแชทชั่วคราว — ไม่ลบโค้ด เผื่อเปิดใช้ภายหลัง
const SHOW_SCENARIO_INTRO = false;

// ตัวเลือกตอบกลับใช้ร่วมกันทุกสถานการณ์ (ทุกสถานการณ์เป็นแชทหลอกลวง — "หยุดคิด" คือคำตอบที่ปลอดภัยเสมอ)
const RESPONSES = {
  reply_now: {
    label: 'กดตอบทันที (ทำตามที่ขอ)',
    feedback: 'อันตราย! การทำตามข้อความทันทีอาจทำให้ข้อมูลส่วนตัวหรือเงินหลุดไปถึงมิจฉาชีพได้',
    isSafe: false
  },
  stop_and_think: {
    label: 'หยุดคิด (ไม่ตอบโต้)',
    feedback: 'ดี! การหยุดคิดและไม่ตอบโต้ปลอดภัยมาก อย่าลืมตรวจสอบกับช่องทางทางการก่อนเสมอ',
    isSafe: true
  }
};

const CYBER_POLICE = { hotlineNumber: '1441', hotlineLabel: 'ตำรวจไซเบอร์' };
const FDA_HOTLINE = { hotlineNumber: '1556', hotlineLabel: 'สายด่วน อย.' };

// ชุดเนื้อหาใหม่ 10 สถานการณ์ — reasons = "ทำไมแชทนี้ถึงอันตราย", summary = "เกราะป้องกันภัย"
const SCENARIOS = [
  {
    id: 'g6-v2-s1',
    title: 'สถานการณ์ที่ 1: แจ้งเตือนค้างชำระใบสั่งจราจร',
    accountName: 'Line',
    ...CYBER_POLICE,
    bubbles: [
      { id: 'v2s1-b1', type: 'text', time: '10:42', text: 'แจ้งเตือน: ท่านค้างค่าชำระใบสั่งจราจร' },
      { id: 'v2s1-b2', type: 'link-card', time: '10:42', thumbEmoji: '🚓', linkTitle: 'กดเพื่อชำระใบสั่งจราจร', domain: 'https://mflwec.cc' }
    ],
    reasons: [
      'ส่งมาจากเบอร์มือถือทั่วไป หรือชื่อผู้ส่งที่ไม่คุ้นเคย',
      'มีลิงก์แนบท้าย (เช่น bit.ly หรือลิงก์แปลก ๆ) เพื่อให้กดไปตรวจสอบ',
      'ใช้ข้อความข่มขู่ให้ตกใจ เช่น “ระวังถูกระงับใบขับขี่” หรือ “ค้างชำระเกินกำหนด”'
    ],
    responses: RESPONSES,
    summary: 'กรมการขนส่งทางบกไม่มีนโยบายส่ง SMS และ Line แจ้งค่าปรับจราจรค้างชำระ หรือส่งลิงก์ให้ประชาชนชำระเงิน รวมถึงไม่มีนโยบายโทรศัพท์ขอข้อมูลส่วนบุคคลขอให้โอนเงิน'
  },
  {
    id: 'g6-v2-s2',
    title: 'สถานการณ์ที่ 2: คะแนนสะสมใกล้หมดอายุ',
    accountName: 'Assemble',
    ...CYBER_POLICE,
    bubbles: [
      { id: 'v2s2-b1', type: 'text', time: '09:15', text: 'คะแนน AIS ของคุณ (9,081) หมดอายุวันนี้' },
      { id: 'v2s2-b2', type: 'link-card', time: '09:15', thumbEmoji: '🎁', linkTitle: 'กดเพื่อใช้งานคะแนน', domain: 'cutt.ly/beWJ6fpe' }
    ],
    reasons: [
      'ชื่อผู้ส่งที่ไม่คุ้นเคย, มีลิงก์แปลก สะกดเพี้ยน หรือเป็นลิงก์ย่อ'
    ],
    responses: RESPONSES,
    summary: 'AIS ไม่มีนโยบายในการใช้ช่องทาง SMS เพื่อขอข้อมูลส่วนตัวของลูกค้า เช่น เลขบัตรประชาชน เลขบัตรเครดิต และ วันเดือนปีเกิด รวมถึงรหัส OTP ในการทำธุรกรรมใด ๆ'
  },
  {
    id: 'g6-v2-s3',
    title: 'สถานการณ์ที่ 3: ประกันสังคมให้อัปเดตข้อมูลด่วน',
    accountName: '+66-80-130-5835',
    ...CYBER_POLICE,
    bubbles: [
      { id: 'v2s3-b1', type: 'text', time: '13:05', text: 'สำนักงานประกันสังคมแจ้งนายจ้างและผู้เอาประกันภัย ติดต่อเจ้าหน้าที่เพื่ออัปเดทข้อมูลอย่างเร่งด่วน http://sso.fk-line.cc' },
      { id: 'v2s3-b2', type: 'link-card', time: '13:05', thumbEmoji: '📋', linkTitle: 'กดเพื่ออัปเดทข้อมูล', domain: 'http://sso.fk-line.cc' }
    ],
    reasons: [
      'เบอร์ผู้ส่งทั่วไป, สะกดคำผิด, มีลิงก์ที่น่าสงสัย'
    ],
    responses: RESPONSES,
    summary: 'สำนักงานประกันสังคมไม่มีนโยบายส่งข้อความ SMS หรืออีเมลแนบลิงก์ให้ผู้ประกันตนกดโดยเด็ดขาด ห้ามกดลิงก์นั้นเด็ดขาด ให้ติดต่อสำนักงานประกันสังคมใกล้บ้านเท่านั้น'
  },
  {
    id: 'g6-v2-s4',
    title: 'สถานการณ์ที่ 4: พัสดุจัดส่งไม่ได้',
    accountName: '[แจ้งเตือนพัสดุ]',
    ...CYBER_POLICE,
    bubbles: [
      { id: 'v2s4-b1', type: 'text', time: '11:20', text: 'พัสดุของคุณไม่สามารถจัดส่งได้ เนื่องจากข้อมูลที่อยู่ไม่ครบถ้วน' },
      { id: 'v2s4-b2', type: 'text', time: '11:20', text: 'กรุณายืนยันข้อมูลภายในวันนี้ มิฉะนั้นพัสดุจะถูกส่งคืน' },
      { id: 'v2s4-b3', type: 'link-card', time: '11:20', thumbEmoji: '📦', linkTitle: 'ตรวจสอบสถานะ', domain: 'https://parcel-check.example.invalid' }
    ],
    reasons: [
      'สร้างความเร่งด่วน เช่น “ภายในวันนี้” หรือ “มิฉะนั้นพัสดุจะถูกส่งคืน” เพื่อให้ตกใจและรีบทำตาม',
      'ให้กดลิงก์จาก SMS แทนที่จะให้ตรวจสอบผ่านแอปหรือเว็บไซต์ทางการของบริษัทขนส่ง',
      'ไม่ระบุข้อมูลพัสดุที่ตรวจสอบได้ชัดเจน เช่น ชื่อผู้รับ เลขพัสดุ หรือบริษัทขนส่ง',
      'ลิงก์อาจพาไปยังเว็บไซต์ปลอมที่หน้าตาเหมือนบริษัทขนส่ง เพื่อขโมยชื่อ เบอร์โทร ที่อยู่ รหัสผ่าน หรือข้อมูลบัตร'
    ],
    responses: RESPONSES,
    summary: 'หากพัสดุตกค้าง บริษัทขนส่งจะไม่ส่งลิงก์มาให้ลูกค้าติดตามพัสดุ ห้ามคลิกลิงก์หรือให้ข้อมูลโดยเด็ดขาด หากพบปัญหาลูกค้าสามารถติดต่อศูนย์บริการลูกค้า และช่องทางทางการของบริษัทขนส่งเท่านั้น'
  },
  {
    id: 'g6-v2-s5',
    title: 'สถานการณ์ที่ 5: หลานเปลี่ยนเบอร์ใหม่ขอยืมเงิน',
    accountName: 'หลาน',
    ...CYBER_POLICE,
    bubbles: [
      { id: 'v2s5-b1', type: 'text', time: '18:02', text: 'ยาย นี่เบอร์ใหม่หนูนะ มือถือเครื่องเก่าพัง หนูมีเรื่องด่วนมาก' },
      { id: 'v2s5-b2', type: 'text', time: '18:02', text: 'หนูต้องจ่ายค่าหอ แต่แอปธนาคารหนูเข้าไม่ได้ ยายช่วยโอนให้หนูก่อน 8,500 ได้ไหม เดี๋ยวเย็นนี้หนูคืนให้' },
      { id: 'v2s5-b3', type: 'text', time: '18:03', text: 'โอนเข้าบัญชีเพื่อนหนูได้เลยนะ เพราะบัญชีหนูใช้ไม่ได้' }
    ],
    reasons: [
      'เปลี่ยนเบอร์ใหม่ เรื่องเร่งด่วน ขอเงิน และบัญชีรับเงินไม่ใช่ชื่อคนที่เรารู้จัก'
    ],
    responses: RESPONSES,
    summary: 'หยุดคุยชั่วคราวแล้วโทรหาเจ้าตัวผ่านเบอร์เดิมหรือถามข้อมูลที่มีเพียงคนในครอบครัวรู้ ธนาคารแห่งประเทศไทยเตือนว่ามิจฉาชีพสามารถสวมรอยบัญชีของคนรู้จักแล้วหลอกให้เพื่อนหรือญาติโอนเงินได้'
  },
  {
    id: 'g6-v2-s6',
    title: 'สถานการณ์ที่ 6: ค่าไฟฟ้าค้างชำระ',
    accountName: 'PEA-INFO',
    ...CYBER_POLICE,
    bubbles: [
      { id: 'v2s6-b1', type: 'text', time: '08:30', text: 'แจ้งเตือนค่าไฟฟ้าค้างชำระ 1,247.50 บาท หากไม่ชำระภายในวันนี้ ระบบจะระงับการใช้ไฟ' },
      { id: 'v2s6-b2', type: 'link-card', time: '08:30', thumbEmoji: '💡', linkTitle: 'กรุณาตรวจสอบและชำระที่ลิ้งค์นี้', domain: 'https://electric-bill.example.invalid' }
    ],
    reasons: [
      'ใช้ความกลัวว่าจะ “ระงับการใช้ไฟ” เพื่อบังคับให้ตัดสินใจเร็ว และแนบลิงก์ให้ชำระเงิน เว็บไซต์หรือ QR Code ที่ปลายทางอาจเป็นของมิจฉาชีพ แม้ชื่อผู้ส่งจะดูเหมือนหน่วยงานจริงก็ไม่ควรเชื่อทันที'
    ],
    responses: RESPONSES,
    summary: 'ตรวจสอบยอดค่าไฟจากใบแจ้งค่าไฟ แอป หรือเว็บไซต์ทางการของการไฟฟ้าด้วยตนเอง อย่าโอนเงินหรือกรอกข้อมูลผ่านลิงก์ที่มากับข้อความโดยยังไม่ได้ตรวจสอบ'
  },
  {
    id: 'g6-v2-s7',
    title: 'สถานการณ์ที่ 7: สินเชื่ออนุมัติไว',
    accountName: 'FAST-LOAN',
    ...CYBER_POLICE,
    bubbles: [
      { id: 'v2s7-b1', type: 'text', time: '14:10', text: 'คุณได้รับสิทธิ์สินเชื่อสูงสุด 100,000 บาท อนุมัติไว ไม่เช็กเครดิต ไม่ต้องมีคนค้ำ ดอกเบี้ยต่ำ รับเงินภายใน 10 นาที' },
      { id: 'v2s7-b2', type: 'link-card', time: '14:10', thumbEmoji: '💰', linkTitle: 'สมัครเลย', domain: 'https://fastloan.example.invalid' }
    ],
    reasons: [
      'ใช้คำว่า “อนุมัติไว” “ไม่เช็กเครดิต” และ “รับเงินภายใน 10 นาที” เพื่อดึงดูดผู้ที่ต้องการเงินด่วน เมื่อกดลิงก์อาจถูกขอข้อมูลบัตรประชาชนและบัญชีธนาคาร หรือถูกเรียกเก็บค่าธรรมเนียม ค่าประกัน หรือค่ามัดจำก่อนปล่อยเงินกู้'
    ],
    responses: RESPONSES,
    summary: 'อย่าโอนเงินก่อนเพื่อแลกกับการได้รับสินเชื่อ และอย่าส่งเอกสารส่วนตัวให้ผู้ให้กู้ที่ยังไม่ได้ตรวจสอบ ควรตรวจสอบผู้ให้บริการสินเชื่อกับหน่วยงานกำกับดูแลก่อนทุกครั้ง'
  },
  {
    id: 'g6-v2-s8',
    title: 'สถานการณ์ที่ 8: อาหารเสริมบำรุงสมอง',
    accountName: 'BRAIN-GOLD',
    ...FDA_HOTLINE,
    bubbles: [
      { id: 'v2s8-b1', type: 'text', time: '10:05', text: 'อายุ 50+ เริ่มหลงลืม อย่าปล่อยไว้!' },
      { id: 'v2s8-b2', type: 'text', time: '10:05', text: 'ผู้เชี่ยวชาญแนะนำ BRAIN GOLD ช่วยฟื้นฟูสมอง เพิ่มความจำ ป้องกันสมองเสื่อม ทานวันละ 1 เม็ด เห็นผลใน 30 วัน มี อย. รับรอง' },
      { id: 'v2s8-b3', type: 'text', time: '10:06', text: 'โทร. 08X-XXX-XXXX' }
    ],
    reasons: [
      'ข้อความสร้างความกลัวด้วยคำว่า “อย่าปล่อยไว้” และกล่าวอ้างถึงการ “ป้องกันสมองเสื่อม” พร้อมใช้คำว่า “ผู้เชี่ยวชาญแนะนำ” และ “มี อย.” เพื่อเพิ่มความน่าเชื่อถือ แต่การมีเลข อย. ไม่ได้หมายความว่าสรรพคุณที่โฆษณาทั้งหมดได้รับการรับรอง'
    ],
    responses: RESPONSES,
    summary: 'หากมีอาการหลงลืมผิดปกติควรปรึกษาแพทย์ ไม่ควรซื้ออาหารเสริมเพียงเพราะมีคำว่า “มี อย.” หรือมีบุคคลที่อ้างว่าเป็นผู้เชี่ยวชาญมาแนะนำ'
  },
  {
    id: 'g6-v2-s9',
    title: 'สถานการณ์ที่ 9: ผู้ว่าฯ ส่งเอกสารให้สแกน QR Code',
    accountName: 'ผู้ว่าราชการจังหวัดเชียงใหม่',
    ...CYBER_POLICE,
    bubbles: [
      { id: 'v2s9-b1', type: 'text', time: '16:40', text: 'สวัสดี ตอนนี้คุณยุ่งอยู่หรือเปล่า' },
      { id: 'v2s9-b2', type: 'text', time: '16:41', text: 'มีเอกสารสำคัญให้คุณดู ให้คุณสแกนคิวอาร์โค้ดเข้าไปดู' },
      { id: 'v2s9-b3', type: 'text', time: '16:41', text: 'ดูเสร็จแล้วรายงานผม' }
    ],
    reasons: [
      'มีการแอบอ้างว่าเป็นผู้ว่าราชการจังหวัดเชียงใหม่เพื่อสร้างความน่าเชื่อถือและทำให้ผู้รับข้อความรู้สึกว่าต้องปฏิบัติตามคำสั่ง และสร้างความรู้สึกกดดันและเร่งรัดให้สแกนคิวอาร์โค้ดปลอมโดยใช้คำว่า “ดูเสร็จแล้วรายงานผม”'
    ],
    responses: RESPONSES,
    summary: 'อย่าสแกน QR Code หรือกดลิงก์จากข้อความที่ไม่สามารถยืนยันแหล่งที่มาได้ ควรตรวจสอบตัวตนของผู้ส่งผ่านช่องทางทางการก่อน และไม่ควรเปิดเผยข้อมูลส่วนตัว รหัสผ่าน หรือข้อมูลสำคัญใด ๆ บุคคลสำคัญหรือหน่วยงานรัฐจะไม่ติดต่อผ่านช่องทางส่วนตัวเด็ดขาด'
  },
  {
    id: 'g6-v2-s10',
    title: 'สถานการณ์ที่ 10: สูตรโบราณรักษาโรคที่ส่งต่อกันในไลน์',
    accountName: 'ป้าสมพร',
    ...FDA_HOTLINE,
    bubbles: [
      { id: 'v2s10-b1', type: 'text', time: '07:15', text: 'ฝากแชร์ต่อให้คนที่เรารักนะคะ สูตรโบราณจากผู้เฒ่าผู้แก่ ต้มใบยอ ใบเตย รางจืด ดื่มเช้า–เย็น ช่วยรักษาเกาต์ รูมาตอยด์ ปวดข้อ และขับสารพิษได้ คนเป็นมาหลายปีกินแล้วดีขึ้น ไม่ต้องเสียเงินซื้อยาแพง ๆ ของดีแบบนี้อย่าเก็บไว้คนเดียว' }
    ],
    reasons: [
      'ใช้คำว่า “สูตรโบราณ” และประสบการณ์ของผู้ใช้เพื่อสร้างความน่าเชื่อถือ แต่ไม่มีหลักฐานว่ารักษาโรคดังกล่าวให้หายได้ หากผู้ป่วยเชื่อและหยุดการรักษาหรือหยุดยาที่แพทย์สั่ง อาจทำให้อาการรุนแรงขึ้น'
    ],
    responses: RESPONSES,
    summary: 'ข้อมูลสุขภาพที่อ้างว่าสามารถ “รักษาหาย” หรือใช้แทนยาได้ ควรตรวจสอบกับแพทย์ เภสัชกร หรือหน่วยงานสาธารณสุขก่อนเสมอ และไม่ควรหยุดยาเองเพราะข้อความที่ส่งต่อกันในโซเชียล'
  }
];

const BUBBLE_REVEAL_DELAY_MS = 2000; // US-CF-10: หน่วง 2 วิ/ฟอง เพื่อให้จังหวะการอ่านกำลังดี

// สุ่มสถานการณ์จากคลัง SCENARIOS มาเล่นรอบละ 3 สถานการณ์ (ไม่ต้องเล่นครบทั้งคลัง)
const SCENARIOS_PER_ROUND = 3;

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pickRoundScenarios = () => shuffle(SCENARIOS).slice(0, SCENARIOS_PER_ROUND);

export default function G6LineSimulation({ onFinish, logEvent }) {
  // สุ่มชุดสถานการณ์ครั้งเดียวตอนเริ่มเกม (mount) — เล่นซ้ำ = ชุด/ลำดับใหม่
  const [scenarios] = useState(pickRoundScenarios);
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

  const scenario = scenarios[currentIdx];
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
      window.dispatchEvent(new CustomEvent('flowStepProgress', { detail: currentIdx / scenarios.length }));
    }
  }, [currentIdx, scenarios.length]);

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
    if (currentIdx < scenarios.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setRevealedCount(0);
      setResponseChosen(null);
      setExpandedIds({});
      setIntroDone(!SHOW_SCENARIO_INTRO);
      setScamWarning(null);
      logEvent('enter_scenario', { game_id: 'G6', scenario_id: scenarios[nextIdx].id });
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
        imageSrc="/assets/icons/g6-line-sim.jpg"
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
            {/* ชุดเนื้อหา v2: เหตุผลระดับสถานการณ์ (reasons) — fallback เป็น flag รายฟองแบบเดิม */}
            {(scenario.reasons || scenario.bubbles.filter((b) => b.isRedFlag && (b.flag || b.desc)).map((b) => b.flag || b.desc)).map((reason, i) => (
              <li key={i} className="flex gap-[8px]">
                <span className="shrink-0 font-bold">•</span>
                <span>{reason}</span>
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
          <div className="flex gap-[8px] px-[24px] pb-action-bar pt-[36px]">
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
          <div className="px-[24px] pb-action-bar pt-[22px]">
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
