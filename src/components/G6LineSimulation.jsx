import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Phone, MoreVertical, Volume2, VolumeX, ShieldAlert, HeartHandshake, ArrowRight, PhoneCall, Link2 } from 'lucide-react';

// ข้อมูลสถานการณ์หลอกลวงจำลอง 3 รูปแบบ ตาม US-GAME-06 / design-g6.md
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
        desc: '🚩 บัญชีทางการของกรมสรรพากรต้องมีป้ายยืนยันตัวตน (Official Account) สีเขียวหรือน้ำเงินกำกับชื่อเสมอ บัญชีนี้ไม่มีป้ายใดๆ แสดงว่าเป็นบัญชีบุคคลธรรมดา ไม่ใช่หน่วยงานจริง',
        hintText: 'ลองดูตรงชื่อบัญชีผู้ส่งด้านบนสิคะ มีป้ายยืนยันตัวตนไหม'
      },
      {
        id: 's1-b1', type: 'text', time: '10:42', isRedFlag: true,
        text: 'เรียนท่าน ตรวจพบหนี้ภาษีค้างชำระ 45,000 บาท กรุณาดำเนินการภายใน 2 ชั่วโมง มิเช่นนั้นจะถูกอายัดบัญชีธนาคารทันที',
        desc: '🚩 ข่มขู่และเร่งรัดเวลาสั้นผิดปกติ หน่วยงานรัฐไม่มีอำนาจอายัดบัญชีผ่านข้อความแชท และไม่เร่งรัดให้ดำเนินการภายในไม่กี่ชั่วโมง',
        hintText: 'ข้อความนี้เร่งให้เรารีบทำอะไรภายในเวลาสั้นๆ ไหมคะ'
      },
      {
        id: 's1-b2', type: 'link-card', time: '10:42', isRedFlag: true,
        thumbEmoji: '📜', linkTitle: 'ยืนยันตัวตนด่วนที่นี่', domain: 'rd-govth-payment.xyz',
        desc: '🚩 โดเมนจริงของกรมสรรพากรต้องลงท้ายด้วย .go.th เท่านั้น โดเมนนี้สะกดเลียนแบบและลงท้ายด้วย .xyz ซึ่งเป็นของปลอม',
        hintText: 'ลองอ่านชื่อเว็บลิงก์ท้ายการ์ดให้ละเอียดอีกครั้งสิคะ'
      },
      {
        id: 's1-b3', type: 'cta-button', time: '10:43', isRedFlag: true,
        buttonText: 'กดยืนยันตัวตนเพื่อระงับการอายัด',
        desc: '🚩 ปุ่มเร่งเร้าให้กดทันทีโดยไม่ให้เวลาตรวจสอบหรือปรึกษาญาติ เป็นเทคนิคกดดันทางจิตวิทยาแบบมิจฉาชีพ',
        hintText: 'ปุ่มนี้เร่งให้เรารีบกดไหมคะ ลองสังเกตคำที่ใช้ดูนะ'
      },
      {
        id: 's1-b4', type: 'text', time: '10:43', isRedFlag: true,
        text: 'กรุณาแจ้งเลขบัตรประชาชน 13 หลัก และรหัส OTP ที่ได้รับทาง SMS เพื่อยืนยันตัวตนกับระบบด่วน',
        desc: '🚩 หน่วยงานราชการไม่มีนโยบายขอรหัส OTP หรือเลขบัตรประชาชนผ่านแชทเด็ดขาด รหัส OTP คือกุญแจสำคัญที่ห้ามให้ใครทั้งสิ้น',
        hintText: 'ลองดูข้อมูลที่เขาขอจากเราสิคะ ราชการจริงไม่มีทางขอแบบนี้'
      }
    ],
    summary: 'กรมสรรพากรติดต่อประชาชนเรื่องภาษีด้วยหนังสือราชการทางไปรษณีย์เท่านั้น ไม่มีนโยบายทวงเงิน อายัดบัญชี หรือขอรหัส OTP ผ่าน LINE โดยเด็ดขาด',
    speakerSummary: 'สรุปคือ กรมสรรพากรไม่มีวันทวงเงินหรือขอรหัสโอทีพีผ่านไลน์เด็ดขาด หากเจอแบบนี้ให้วางเฉยแล้วโทรเช็กกับกรมสรรพากรโดยตรงครับ'
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
        desc: '🚩 บัญชีธนาคารทางการต้องมีป้ายยืนยันตัวตน (Official Account) กำกับเสมอ บัญชีนี้ไม่มีป้ายใดๆ แสดงว่าไม่ใช่บัญชีทางการของธนาคาร',
        hintText: 'ลองดูตรงชื่อบัญชีผู้ส่งด้านบนสิคะ มีป้ายยืนยันไหม'
      },
      {
        id: 's2-b1', type: 'text', time: '09:15', isRedFlag: true,
        text: '🎉 เรียนลูกค้าที่เคารพ ยินดีด้วยค่ะ! เบอร์โทรศัพท์ของท่านได้รับการสุ่มเลือกให้รับสิทธิ์ลุ้นโบนัสต้อนรับปีใหม่มูลค่า 10,000 บาทจากธนาคาร',
        desc: '🚩 ธนาคารจริงไม่มีนโยบายสุ่มแจกเงินโบนัสให้ลูกค้าทางแชทส่วนตัว โดยไม่มีการทำธุรกรรมหรือลงทะเบียนล่วงหน้าใดๆ มาก่อน',
        hintText: 'ลองอ่านข้อความต้อนรับปีใหม่อีกครั้งสิคะ มันดูดีเกินจริงไปหน่อยไหม'
      },
      {
        id: 's2-b2', type: 'sticker', time: '09:15', isRedFlag: true,
        stickerEmoji: '🎊', caption: 'ยินดีด้วยนะคะ!!',
        desc: '🚩 สติกเกอร์และคำอวยพรรัวๆ เป็นเทคนิคสร้างความตื่นเต้นดีใจ เพื่อลดการไตร่ตรองก่อนตัดสินใจของเหยื่อ',
        hintText: 'ทำไมแชทถึงดูตื่นเต้นจังเลยคะ ลองสังเกตดูสิ'
      },
      {
        id: 's2-b3', type: 'cta-button', time: '09:16', isRedFlag: true,
        buttonText: 'กดรับสิทธิ์โบนัส 10,000 บาท ก่อนหมดเขตวันนี้!',
        desc: '🚩 ปุ่มเร่งเร้าให้ตัดสินใจกดทันทีด้วยคำว่า "ก่อนหมดเขตวันนี้" เป็นการบีบให้รีบตัดสินใจโดยไม่ทันคิด',
        hintText: 'ปุ่มนี้บีบให้เรารีบกดไหมคะ ลองสังเกตคำที่ใช้ดูนะ'
      },
      {
        id: 's2-b4', type: 'text', time: '09:16', isRedFlag: true,
        text: 'กรุณาแจ้งหมายเลขบัญชี, เลขหลังบัตร 3 หลัก (CVV) และรหัส OTP ที่ได้รับทาง SMS เพื่อยืนยันสิทธิ์และรับโอนเงินเข้าบัญชีค่ะ',
        desc: '🚩 ธนาคารไม่มีนโยบายขอเลขหลังบัตร (CVV) หรือรหัส OTP ผ่านช่องแชทเด็ดขาด ข้อมูลเหล่านี้ใช้ขโมยเงินจากบัญชีได้ทันทีหากหลุดไปถึงมิจฉาชีพ',
        hintText: 'ลองดูข้อมูลที่เขาขอจากเราสิคะ ธนาคารจริงไม่มีทางขอแบบนี้'
      }
    ],
    summary: 'ธนาคารไม่มีนโยบายสุ่มแจกโบนัสทางแชทส่วนตัว และไม่มีวันขอเลขบัตร รหัสหลังบัตร หรือ OTP ผ่านช่องแชทเด็ดขาด หากสงสัยให้โทรสอบถามคอลเซ็นเตอร์ธนาคารจากเบอร์ทางการหลังบัตรเท่านั้น',
    speakerSummary: 'สรุปคือ ธนาคารไม่มีทางสุ่มแจกโบนัสทางไลน์ และไม่มีวันขอเลขหลังบัตรหรือโอทีพีเด็ดขาด หากสงสัยให้โทรเบอร์คอลเซ็นเตอร์ที่หลังบัตรของท่านเองครับ'
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
        desc: '🚩 ที่ปรึกษาการเงินที่ได้รับใบอนุญาตจริงจาก ก.ล.ต. จะไม่ใช้บัญชี LINE ส่วนตัวที่ไม่มีป้ายยืนยันตัวตนใดๆ ทักทายชักชวนลงทุนแบบสุ่ม',
        hintText: 'ลองดูชื่อบัญชีผู้ส่งสิคะ เป็นที่ปรึกษาการเงินมีใบอนุญาตจริงหรือเปล่า'
      },
      {
        id: 's3-b1', type: 'text', time: '13:05', isRedFlag: true,
        text: 'สวัสดีครับพี่ ผมเห็นพี่สนใจเรื่องวางแผนการเงินหลังเกษียณ วันนี้มีกองทุนพิเศษเปิดรับสมาชิกจำกัดจำนวนเท่านั้นครับ',
        desc: '🚩 การทักทายอ้างว่า "เห็นพี่สนใจ" ทั้งที่ไม่เคยรู้จักกันมาก่อน เป็นวิธีเปิดบทสนทนาของมิจฉาชีพที่ล่าเหยื่อแบบสุ่ม',
        hintText: 'ลองสังเกตวิธีที่เขาทักทายเราครั้งแรกสิคะ เรารู้จักเขาจริงไหม'
      },
      {
        id: 's3-b2', type: 'image', time: '13:06', isRedFlag: true,
        chartCaption: 'ผลตอบแทนเฉลี่ย 15% ทุกสัปดาห์ การันตีไม่มีความเสี่ยงขาดทุน',
        desc: '🚩 ผลตอบแทน 15% ต่อสัปดาห์สูงเกินความเป็นจริงอย่างมาก การลงทุนทุกประเภทมีความเสี่ยงเสมอ ไม่มีใครรับประกันไม่ขาดทุนได้จริง',
        hintText: 'ตัวเลขผลตอบแทนที่โชว์ดูสูงเกินจริงไปไหมคะ ลองคิดดูอีกที'
      },
      {
        id: 's3-b3', type: 'text', time: '13:06', isRedFlag: true,
        text: 'พี่ๆ ในกลุ่มหลายคนได้รับผลตอบแทนจริงกันหมดแล้วครับ เพียงลงทุนขั้นต่ำ 5,000 บาท ก็เริ่มรับปันผลได้ทันทีทุกสัปดาห์',
        desc: '🚩 การอ้างว่า "คนอื่นได้ผลตอบแทนจริงกันหมดแล้ว" เป็นเทคนิคสร้างความน่าเชื่อถือปลอมโดยไม่มีหลักฐานตรวจสอบได้จริง (Social Proof ปลอม)',
        hintText: 'เขาบอกว่าคนอื่นได้เงินจริงหมดแล้ว มีใครยืนยันได้จริงไหมคะ'
      },
      {
        id: 's3-b4', type: 'link-card', time: '13:07', isRedFlag: true,
        thumbEmoji: '🔒', linkTitle: 'เข้ากลุ่มไลน์ลับสมาชิก VIP วางแผนเกษียณ', domain: 'vip-retire-fund.click',
        desc: '🚩 การชักชวนเข้ากลุ่มไลน์ปิดเป็นการหลีกเลี่ยงการตรวจสอบจากคนนอกหรือญาติ และโดเมนลงท้าย .click ไม่ใช่เว็บของบริษัทหลักทรัพย์ที่ได้รับอนุญาตจริง',
        hintText: 'ลองอ่านชื่อเว็บลิงก์ท้ายข้อความสิคะ ดูน่าเชื่อถือไหม'
      }
    ],
    summary: 'ผลตอบแทนสูงเกินจริงพร้อมการันตีไม่ขาดทุนคือสัญญาณแชร์ลูกโซ่ชัดเจน ควรตรวจสอบใบอนุญาตที่ปรึกษาการเงินกับสำนักงาน ก.ล.ต. ก่อนโอนเงินทุกครั้ง',
    speakerSummary: 'สรุปคือ ผลตอบแทนสูงมากแบบไม่มีความเสี่ยงคือโกงแน่นอนครับ ก่อนลงทุนกับใคร ให้โทรเช็กใบอนุญาตกับสำนักงาน ก ล ต ก่อนเสมอ'
  }
];

const IDLE_HINT_DELAY_MS = 20000;

const GENERIC_INSTRUCTION_SPEECH = 'กรุณาแตะข้อความหรือชื่อบัญชีผู้ส่งจุดที่ท่านคิดว่าผิดปกติ เลือกได้มากกว่าหนึ่งจุด จากนั้นกดปุ่มตรวจสอบด้านล่างครับ';

export default function G6LineSimulation({ onFinish, logEvent }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIds, setSelectedIds] = useState({});
  const [showReveal, setShowReveal] = useState(false);
  const [expandedIds, setExpandedIds] = useState({});
  const [hintBubbleId, setHintBubbleId] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const synthRef = useRef(window.speechSynthesis);
  const scoreRef = useRef({ found: 0, total: 0 });

  const scenario = SCENARIOS[currentIdx];
  const headerBubble = scenario.bubbles.find((b) => b.type === 'header');
  const bodyBubbles = scenario.bubbles.filter((b) => b.type !== 'header');

  // Idle-timer based Hint System (US-GAME-06 AC5) — ไม่ใช่การจับเวลาบังคับ ให้กำลังใจเท่านั้น
  useEffect(() => {
    if (showReveal) return undefined;

    const timer = setTimeout(() => {
      const unfound = scenario.bubbles.filter((b) => b.isRedFlag && !selectedIds[b.id]);
      if (unfound.length === 0) return;
      const pick = unfound[Math.floor(Math.random() * unfound.length)];
      setHintBubbleId(pick.id);
      logEvent('hint_shown', { game_id: 'G6', scenario_id: scenario.id, bubble_id: pick.id });
    }, IDLE_HINT_DELAY_MS);

    return () => clearTimeout(timer);
  }, [showReveal, selectedIds, currentIdx]);

  const handleSpeak = (text) => {
    if (!synthRef.current) return;

    if (speaking) {
      synthRef.current.cancel();
      setSpeaking(false);
      logEvent('toggle_audio', { action: 'mute', scenario_id: scenario.id });
      return;
    }

    logEvent('toggle_audio', { action: 'play', scenario_id: scenario.id });
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    synthRef.current.speak(utterance);
  };

  const handleBubbleTap = (bubble) => {
    if (showReveal) return;

    setSelectedIds((prev) => ({ ...prev, [bubble.id]: !prev[bubble.id] }));
    setHintBubbleId(null);

    logEvent('tap_hotspot', {
      game_id: 'G6',
      scenario_id: scenario.id,
      bubble_id: bubble.id,
      is_red_flag: bubble.isRedFlag,
      action: !selectedIds[bubble.id] ? 'select' : 'deselect'
    });
  };

  const handleToggleExplain = (bubble) => {
    if (!showReveal || !bubble.isRedFlag) return;
    setExpandedIds((prev) => ({ ...prev, [bubble.id]: !prev[bubble.id] }));
  };

  const handleVerify = () => {
    if (synthRef.current) synthRef.current.cancel();
    setSpeaking(false);
    setShowReveal(true);
    setHintBubbleId(null);

    const totalRedFlags = scenario.bubbles.filter((b) => b.isRedFlag).length;
    const foundCount = scenario.bubbles.filter((b) => b.isRedFlag && selectedIds[b.id]).length;
    scoreRef.current.found += foundCount;
    scoreRef.current.total += totalRedFlags;

    logEvent('check_scenario', {
      game_id: 'G6',
      scenario_id: scenario.id,
      red_flags_found: foundCount,
      total_red_flags: totalRedFlags
    });
  };

  const handleNext = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setSpeaking(false);
    }

    if (currentIdx < SCENARIOS.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setSelectedIds({});
      setExpandedIds({});
      setShowReveal(false);
      setHintBubbleId(null);
      logEvent('enter_scenario', { game_id: 'G6', scenario_id: SCENARIOS[nextIdx].id });
    } else {
      const { found, total } = scoreRef.current;
      const ratio = total > 0 ? found / total : 0;
      const starRating = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;
      logEvent('game_complete', { game_id: 'G6', red_flags_found: found, total_red_flags: total, stars: starRating });
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
    const selected = !!selectedIds[bubble.id];
    const revealed = showReveal && bubble.isRedFlag;
    const hinted = hintBubbleId === bubble.id;

    let style = {
      border: '2px solid transparent',
      borderRadius: '4px 18px 18px 18px',
      backgroundColor: '#ffffff',
      boxShadow: 'var(--shadow-sm)',
      padding: '12px 14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      maxWidth: '86%'
    };

    if (selected && !showReveal) {
      style = { ...style, border: '2px solid var(--primary)', backgroundColor: 'var(--primary-light)' };
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
    if (hinted) {
      style = { ...style, animation: 'g6HintGlow 1.4s ease-in-out infinite' };
    }
    return style;
  };

  const renderBubbleContent = (bubble) => {
    switch (bubble.type) {
      case 'text':
        return <div style={{ fontSize: '18px', lineHeight: '1.5', color: '#1a1a1a' }}>{bubble.text}</div>;
      case 'sticker':
        return (
          <div style={{ textAlign: 'center', padding: '4px' }}>
            <div style={{ fontSize: '48px', lineHeight: '1' }}>{bubble.stickerEmoji}</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px', color: '#1a1a1a' }}>{bubble.caption}</div>
          </div>
        );
      case 'image':
        return (
          <div>
            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: '6px', height: '70px',
              backgroundColor: '#f0fdf4', borderRadius: '8px', padding: '8px', marginBottom: '8px'
            }}>
              {[30, 55, 45, 70, 90].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, backgroundColor: '#16a34a', borderRadius: '3px 3px 0 0' }} />
              ))}
            </div>
            <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#1a1a1a', lineHeight: '1.4' }}>{bubble.chartCaption}</div>
          </div>
        );
      case 'link-card':
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0
              }}>
                {bubble.thumbEmoji}
              </div>
              <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#1a1a1a', lineHeight: '1.3' }}>{bubble.linkTitle}</div>
            </div>
            <div style={{
              marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e5e5',
              display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#6b7280'
            }}>
              <Link2 size={14} />
              <span>{bubble.domain}</span>
            </div>
          </div>
        );
      case 'cta-button':
        return (
          <button
            style={{
              width: '100%', border: 'none', borderRadius: 'var(--radius-pill)',
              backgroundColor: scenario.ctaColor, color: '#ffffff', fontWeight: 'bold',
              fontSize: '18px', padding: '14px 16px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
            }}
          >
            {bubble.buttonText}
          </button>
        );
      default:
        return null;
    }
  };

  const hasSelectedAny = Object.values(selectedIds).some(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Progress dots & Speaker button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {SCENARIOS.map((s, idx) => (
              <div
                key={s.id}
                style={{
                  width: '14px', height: '14px', borderRadius: '50%',
                  backgroundColor: idx === currentIdx ? 'var(--primary)' : idx < currentIdx ? 'var(--primary-dark)' : 'var(--border)'
                }}
              />
            ))}
          </div>

          <button
            onClick={() => handleSpeak(showReveal ? `${scenario.summary} ${scenario.speakerSummary}` : GENERIC_INSTRUCTION_SPEECH)}
            style={{
              padding: '10px 16px', borderRadius: 'var(--radius-pill)',
              backgroundColor: speaking ? 'var(--primary-light)' : 'var(--bg-app)',
              border: '2px solid var(--primary)', color: 'var(--primary-dark)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 'bold', minHeight: '48px'
            }}
          >
            {speaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
            <span>ฟังเสียงนำทาง</span>
          </button>
        </div>

        {/* Scenario title & instructions */}
        <div style={{ textAlign: 'left' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 'bold' }}>{scenario.title}</h3>
          <p className="text-small" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            {!showReveal
              ? '👉 แตะข้อความหรือชื่อบัญชีผู้ส่งจุดที่ท่านรู้สึกสงสัย (เลือกได้มากกว่า 1 จุด)'
              : '❌ กรอบสีแดงคือจุดที่มิจฉาชีพใช้หลอกลวง แตะเพื่อดูคำอธิบาย'}
          </p>
        </div>

        {/* Mock LINE Phone Frame */}
        <div style={{
          border: '3px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
          backgroundColor: '#ffffff', boxShadow: 'var(--shadow-md)'
        }}>
          {/* (A) Status Bar จำลอง */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '6px 16px', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#1a1a1a'
          }}>
            <span>9:41</span>
            <span>📶 🔋100%</span>
          </div>

          {/* (B) Chat Header — จุดสังเกตป้ายยืนยันตัวตน */}
          <div
            onClick={() => headerBubble && handleBubbleTap(headerBubble)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
              borderBottom: '1px solid #e5e5e5', cursor: showReveal ? 'pointer' : 'pointer',
              ...(headerBubble ? getBubbleWrapperStyle(headerBubble) : {}),
              borderRadius: 0, boxShadow: 'none', maxWidth: 'none'
            }}
          >
            <ArrowLeft size={22} color="#6b7280" />
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0
            }}>
              {scenario.avatarEmoji}
            </div>
            <span style={{ fontSize: '19px', fontWeight: 'bold', color: '#1a1a1a', flex: 1 }}>{scenario.accountName}</span>
            <Phone size={20} color="#6b7280" />
            <MoreVertical size={20} color="#6b7280" />
          </div>
          {showReveal && headerBubble && expandedIds[headerBubble.id] && (
            <div style={{ padding: '10px 16px', backgroundColor: '#fef2f2', fontSize: '16px', color: 'var(--accent-error)', fontWeight: 'bold', lineHeight: '1.4' }}>
              {headerBubble.desc}
            </div>
          )}

          {/* Chat body — พื้นหลังลายจุดอ่อนสีเบจ */}
          <div style={{
            padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px',
            backgroundColor: '#faf6ee',
            backgroundImage: 'radial-gradient(#e9e0cc 1px, transparent 1px)',
            backgroundSize: '14px 14px'
          }}>
            {bodyBubbles.map((bubble) => (
              <div key={bubble.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                {hintBubbleId === bubble.id && (
                  <div style={{
                    position: 'absolute', top: '-38px', left: 0, backgroundColor: '#fef9c3',
                    border: '1px solid #eab308', borderRadius: 'var(--radius-pill)', padding: '6px 12px',
                    fontSize: '14px', fontWeight: 'bold', color: '#854d0e', whiteSpace: 'nowrap', zIndex: 2,
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    💡 {bubble.hintText}
                  </div>
                )}
                <div onClick={() => (showReveal ? handleToggleExplain(bubble) : handleBubbleTap(bubble))} style={getBubbleWrapperStyle(bubble)}>
                  {renderBubbleContent(bubble)}
                  {showReveal && bubble.isRedFlag && (
                    <div style={{
                      position: 'absolute', top: '-10px', right: '-10px', width: '26px', height: '26px', borderRadius: '50%',
                      backgroundColor: 'var(--accent-error)', color: '#fff', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', boxShadow: 'var(--shadow-sm)'
                    }}>
                      {flagIndexMap[bubble.id]}
                    </div>
                  )}
                </div>
                {bubble.time && (
                  <span style={{ fontSize: '13px', color: '#9aa0a6' }}>{bubble.time}</span>
                )}
                {showReveal && bubble.isRedFlag && expandedIds[bubble.id] && (
                  <div className="premium-card" style={{
                    backgroundColor: '#fef2f2', border: '1px dashed #fca5a5', borderRadius: 'var(--radius-lg)',
                    padding: '10px 14px', fontSize: '16px', color: 'var(--accent-error)', fontWeight: 'bold',
                    lineHeight: '1.4', maxWidth: '90%', animation: 'fadeIn 0.3s ease-out'
                  }}>
                    {bubble.desc}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* (F) Input Bar — ตกแต่งเท่านั้น ไม่รับการโต้ตอบ */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
            borderTop: '1px solid #e5e5e5', backgroundColor: '#ffffff', pointerEvents: 'none', opacity: 0.6
          }}>
            <span style={{ fontSize: '20px' }}>＋</span>
            <div style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-pill)', padding: '8px 14px', fontSize: '16px', color: '#9aa0a6' }}>
              พิมพ์ข้อความ...
            </div>
            <span style={{ fontSize: '18px' }}>📷</span>
            <span style={{ fontSize: '18px' }}>🎤</span>
          </div>
        </div>

        {/* สรุป หยุด คิด ถาม ทำ + สายด่วน */}
        {showReveal && (
          <div className="premium-card" style={{
            border: '2px solid var(--primary)', backgroundColor: 'var(--primary-light)', textAlign: 'left',
            animation: 'fadeIn 0.4s ease-out', padding: '20px'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--primary-dark)', marginBottom: '8px' }}>
              <ShieldAlert size={28} />
              <strong style={{ fontSize: '20px' }}>เกราะป้องกันภัย: หยุด คิด ถาม ทำ</strong>
            </div>
            <p style={{ fontSize: '18px', color: 'var(--text-primary)', lineHeight: '1.5' }}>{scenario.summary}</p>

            <a
              href={`tel:${scenario.hotlineNumber}`}
              onClick={() => logEvent('click_hotline', { game_id: 'G6', scenario_id: scenario.id, hotline: scenario.hotlineNumber })}
              style={{
                marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: '10px', fontSize: '17px', fontWeight: 'bold',
                color: 'var(--text-secondary)', textDecoration: 'none'
              }}
            >
              <PhoneCall size={20} color="var(--primary)" />
              <span>โทรแจ้ง{scenario.hotlineLabel} โทร. {scenario.hotlineNumber}</span>
            </a>
          </div>
        )}
      </div>

      {/* Button Panel */}
      <div style={{ marginTop: '24px' }}>
        {!showReveal ? (
          <button onClick={handleVerify} className="btn btn-primary" disabled={!hasSelectedAny} style={{ fontSize: '22px', minHeight: '64px' }}>
            <span>ตรวจสอบจุดสังเกต</span>
          </button>
        ) : (
          <button onClick={handleNext} className="btn btn-primary" style={{ fontSize: '22px', minHeight: '64px' }}>
            <span>{currentIdx < SCENARIOS.length - 1 ? 'สถานการณ์ถัดไป' : 'จบเกมและรับดาว'}</span>
            <ArrowRight size={24} />
          </button>
        )}
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '12px', opacity: 0.8 }}>
        หน้าจอจำลองเพื่อการเรียนรู้ ไม่ใช่แอป LINE จริง
      </p>

      <style>{`
        @keyframes g6HintGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.5); }
          50% { box-shadow: 0 0 0 8px rgba(234, 179, 8, 0); }
        }
      `}</style>
    </div>
  );
}
