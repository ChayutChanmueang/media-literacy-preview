import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, HeartHandshake, Volume2, VolumeX } from 'lucide-react';

const SCENARIOS = [
  {
    id: 'g2-s1',
    title: 'สถานการณ์ที่ 1: ข้อความ SMS น่าสงสัย',
    type: 'SMS',
    sender: 'DLT-Alert',
    avatarLetter: '✉️',
    headerBg: '#475569',
    blocks: [
      {
        id: 's1-b1',
        text: 'ผู้ส่ง: DLT-Alert',
        isRedFlag: true,
        desc: '🚩 จุดสังเกต: หน่วยงานรัฐส่วนใหญ่ เช่น กรมการขนส่งทางบก จะส่ง SMS ในนามที่เป็นทางการ หรือจะไม่ส่งเลยหากไม่มีธุรกรรมตรง และจะไม่ตั้งชื่อชวนสับสนเพื่อแนบลิงก์',
        speakerText: 'จุดผิดสังเกตแรกคือชื่อผู้ส่ง ดี แอล ที อะเลิร์ต หน่วยงานรัฐไม่มีนโยบายส่งข้อความแบบนี้หาคนทั่วไปโดยตรงครับ'
      },
      {
        id: 's1-b2',
        text: 'ข้อความด่วน: "บัญชีใบอนุญาตขับขี่ตลอดชีพของท่านถูกยกเลิกแล้ว เนื่องจากไม่เข้ามายืนยันตัวตน"',
        isRedFlag: true,
        desc: '🚩 จุดสังเกต: มิจฉาชีพนิยมใช้ข้อความขู่ให้ตกใจ (ใบขับขี่ถูกยกเลิก) เพื่อให้รีบดำเนินการโดยขาดความยั้งคิด',
        speakerText: 'จุดสังเกตที่สองคือข้อความขู่ให้ตกใจว่าใบขับขี่ตลอดชีพถูกยกเลิก ซึ่งใบขับขี่ตลอดชีพไม่มีการยกเลิกกลางคันเช่นนี้ครับ'
      },
      {
        id: 's1-b3',
        text: 'ลิงก์เว็บ: "แตะยืนยันสิทธิ์ด่วนที่ http://dlt-portal-th.xyz"',
        isRedFlag: true,
        desc: '🚩 จุดสังเกต: ลิงก์ปลอมสะกดเลียนแบบของจริง และลงท้ายด้วยชื่อโดเมนแปลกๆ เช่น .xyz หรือ .net ของจริงต้องเป็นเว็บลงท้ายด้วย .go.th เสมอ',
        speakerText: 'จุดสังเกตที่สามคือลิงก์แปลกปลอม ลงท้ายด้วย ดอท เอ็กซ์ วาย แซด ของจริงต้องเป็น ดอท โก ดอท ทีเอช เท่านั้น ห้ามแตะลิงก์เด็ดขาดครับ'
      }
    ],
    redFlagsCount: 3,
    summary: 'สรุปบทเรียน: กรมการขนส่งทางบก ไม่มีนโยบายส่ง SMS ชวนกดยืนยันใบขับขี่ และไม่มีการยกเลิกใบขับขี่ตลอดชีพเด็ดขาด',
    speakerSummary: 'สรุปคือกรมการขนส่งไม่มีทางส่งลิงก์แบบนี้หาคุณเด็ดขาด หากเจอให้ลบทิ้งทันที ห้ามกดเข้าเว็บเด็ดขาด'
  },
  {
    id: 'g2-s2',
    title: 'สถานการณ์ที่ 2: แชทไลน์ชวนตกใจ',
    type: 'LINE',
    sender: 'สรรพากร (ฝ่ายตรวจสอบ)',
    avatarLetter: '👤',
    headerBg: '#06c755',
    blocks: [
      {
        id: 's2-b1',
        text: 'ชื่อผู้ส่ง: สรรพากร (ฝ่ายตรวจสอบ) - ใช้บัญชีบุคคลทั่วไป',
        isRedFlag: true,
        desc: '🚩 จุดสังเกต: เจ้าหน้าที่สรรพากรจริงจะไม่ใช้แชท LINE บัญชีส่วนบุคคลติดต่อหาประชาชน บัญชีทางการต้องมีตราโล่สีเขียวหรือสีน้ำเงินเท่านั้น',
        speakerText: 'แชทไลน์คนทั่วไปแอบอ้างเป็นกรมสรรพากร ถือเป็นสัญญาณอันตรายแรก เจ้าหน้าที่ตัวจริงจะไม่แอดไลน์มาทวงเงินคุณแบบส่วนตัวครับ'
      },
      {
        id: 's2-b2',
        text: 'เนื้อความ: "ตรวจพบภาษีค้างจ่าย 45,000 บาท หากไม่โอนมาชำระเพื่อตรวจสอบภายใน 2 ชั่วโมงนี้ จะถูกระงับบัญชีธนาคารทั้งหมด"',
        isRedFlag: true,
        desc: '🚩 จุดสังเกต: เป็นการขู่บังคับให้โอนเงินเร็วที่สุด (ภายใน 2 ชั่วโมง) เพื่อปิดโอกาสในการไตร่ตรองหรือสอบถามครอบครัว',
        speakerText: 'การข่มขู่ว่าจะระงับบัญชีธนาคารภายในสองชั่วโมง สรรพากรไม่มีอำนาจระงับบัญชีด่วนผ่านไลน์แบบนี้ เป็นวิธีบีบบังคับของมิจฉาชีพครับ'
      },
      {
        id: 's2-b3',
        text: 'ข้อเสนอ: "ให้แอดไลน์คุยกับรองอธิบดีกรมฯ เพื่อเจรจาลดหย่อนค่าปรับได้"',
        isRedFlag: true,
        desc: '🚩 จุดสังเกต: หน่วยงานรัฐมีขั้นตอนทางกฎหมายที่เป็นเอกสารทางราชการส่งไปที่บ้าน ไม่ใช่การให้คุยลับหลังผ่านโปรแกรมไลน์',
        speakerText: 'การเสนอให้เจรจาหลังไมค์ลดหย่อนผ่านไลน์ไม่มีจริงในระบบราชการครับ เอกสารต้องเป็นหนังสือตราครุฑส่งถึงบ้านเท่านั้น'
      }
    ],
    redFlagsCount: 3,
    summary: 'สรุปบทเรียน: กรมสรรพากรไม่มีนโยบายติดต่อประชาชนผ่าน LINE เพื่อแจ้งภาษีค้างจ่ายหรือทวงถามเงินโอนเด็ดขาด',
    speakerSummary: 'สรุปก็คือ สรรพากรไม่มีวันทวงเงินหรืออายัดบัญชีคุณผ่านทางไลน์เด็ดขาดครับ อย่าโอนอย่าเชื่อเด็ดขาด'
  },
  {
    id: 'g2-s3',
    title: 'สถานการณ์ที่ 3: โฆษณาลงทุนสุดคุ้มในเฟซบุ๊ก',
    type: 'FACEBOOK',
    sender: 'โครงการลงทุนวัยเกษียณสุขใจ',
    avatarLetter: '📈',
    headerBg: '#1877f2',
    blocks: [
      {
        id: 's3-b1',
        text: 'ชื่อเพจ: "โครงการลงทุนวัยเกษียณสุขใจ" (สปอนเซอร์โฆษณา)',
        isRedFlag: true,
        desc: '🚩 จุดสังเกต: เพจสร้างขึ้นใหม่ไม่มีเครื่องหมายยืนยันตัวตน (ติ๊กถูกสีฟ้า) มักใช้การจ่ายเงินค่าโฆษณาเพื่อยิงเข้าหาผู้สูงอายุโดยเฉพาะ',
        speakerText: 'โฆษณาเพจลงทุนวัยเกษียณสุขใจ เป็นเพจแอบอ้างที่เพิ่งสร้างใหม่เพื่อหลอกคุณลุงคุณป้าโดยเฉพาะ สังเกตว่ามักจะแฝงโฆษณาชวนเชื่อครับ'
      },
      {
        id: 's3-b2',
        text: 'ข้อเสนอสุดคุ้ม: "เริ่มต้นลงทุนเพียง 1,000 บาท ได้รับเงินปันผล 15% ทุกสัปดาห์ รับประกันไม่มีความเสี่ยง"',
        isRedFlag: true,
        desc: '🚩 จุดสังเกต: อัตราเงินปันผล 15% ต่อสัปดาห์สูงเกินความเป็นจริงอย่างมาก และการลงทุนทุกชนิดต้องมีความเสี่ยง ไม่มีทางที่ใครจะรับประกันไม่ขาดทุนได้',
        speakerText: 'ข้อเสนอให้เงินปันผลสิบห้าเปอร์เซ็นต์ทุกสัปดาห์และไม่มีความเสี่ยง เรื่องนี้มั่วครับ ผลตอบแทนสูงเกินจริงแถมไม่มีความเสี่ยงคือแชร์ลูกโซ่แน่นอนครับ'
      },
      {
        id: 's3-b3',
        text: 'วิธีดำเนินการ: "คลิกลิงก์ไลน์กลุ่มลับเพื่อรับคำปรึกษาจากโค้ชการเงินชั้นนำฟรี"',
        isRedFlag: true,
        desc: '🚩 จุดสังเกต: การลากเข้ากลุ่มไลน์ปิดเพื่อหลีกเลี่ยงการตรวจสอบของเจ้าหน้าที่รัฐ และใช้หน้าม้าในห้องกลุ่มเพื่อหว่านล้อมให้ลงทุนเพิ่มขึ้น',
        speakerText: 'การชวนเข้าห้องไลน์กลุ่มลับเพื่อปรึกษาโค้ช เป็นการปิดกั้นไม่ให้ญาติรู้เพื่อโดนหลอกล่อได้ง่าย อย่าแตะลิงก์เพื่อเข้ากลุ่มเหล่านั้นครับ'
      }
    ],
    redFlagsCount: 3,
    summary: 'สรุปบทเรียน: ผลตอบแทนที่สูงเกินจริงและอ้างว่า "ไม่มีความเสี่ยง" คือสัญญาณกลโกงแชร์ลูกโซ่และการหลอกล่อให้สูญเงิน',
    speakerSummary: 'สรุปง่ายๆ การลงทุนปันผลสูงมากแบบไม่มีเสี่ยงคือโกงแน่นอนครับ อย่ากดเข้ากลุ่มชวนลงทุนพวกนี้'
  },
  {
    id: 'g2-s4',
    title: 'สถานการณ์ที่ 4: ไลน์จากเพื่อนสนิทขอยืมเงิน',
    type: 'LINE',
    sender: 'ยายปิ่น เพื่อนสนิท',
    avatarLetter: '👵',
    headerBg: '#06c755',
    blocks: [
      {
        id: 's4-b1',
        text: 'ข้อความด่วน: "เธอๆ ยุ่งอยู่ไหม พอดีเรามีเรื่องด่วนขอยืมเงิน 6,000 บาทหน่อยสิ เดี๋ยวค่ำนี้โอนคืนให้ด่วนเลยนะ"',
        isRedFlag: true,
        desc: '🚩 จุดสังเกต: การทักขอยืมเงินทางไลน์ทันทีโดยไม่โทรศัพท์มาแจ้งก่อน มักเป็นสัญญานเตือนว่าบัญชีไลน์ของเพื่อนถูกมิจฉาชีพแฮกเข้าสวมสิทธิ์',
        speakerText: 'แชทจากย้ายปิ่นทักขอยืมเงินด่วนหกพันบาท เมื่อมีการทักยืมเงินกระทันหันในแชท อย่าเพิ่งเชื่อครับ อาจเป็นมิจฉาชีพแอบแฮกไลน์เพื่อนมาหลอกลวง'
      },
      {
        id: 's4-b2',
        text: 'บัญชีธนาคารปลายทาง: "โอนเข้าบัญชี นายสมชาย แซ่ลี้ ธนาคารออมสิน เลขบัญชี 0201..."',
        isRedFlag: true,
        desc: '🚩 จุดสังเกต: เลขบัญชีธนาคารปลายทางเป็นชื่อคนอื่น (บัญชีม้า) ไม่ใช่ชื่อจริงของยายปิ่นเพื่อนเราเอง',
        speakerText: 'จุดสังเกตสำคัญคือชื่อบัญชีปลายทางเป็นนายสมชาย ไม่ใช่ชื่อของยายปิ่นเพื่อนเรา นี่คือบัญชีม้าของคนร้ายอย่างชัดเจนครับ'
      },
      {
        id: 's4-b3',
        text: 'เมื่อเราพิมพ์ถามกลับ ยายปิ่นในแชทตอบว่า: "พอดีตอนนี้ไม่สะดวกคุยสาย เสียงไม่มี เจ็บคอมาก พิมพ์บอกดีกว่า"',
        isRedFlag: true,
        desc: '🚩 จุดสังเกต: บ่ายเบี่ยงไม่ยอมโทรสายสนทนาเพื่อหลีกเลี่ยงไม่ให้ได้ยินเสียงจริง หรือกลัวเราสอบถามข้อมูลส่วนตัวเพื่อพิสูจน์ตัวตน',
        speakerText: 'การบ่ายเบี่ยงไม่ยอมโทรคุย อ้างว่าเจ็บคอ เป็นข้ออ้างหลักของคนร้ายที่แฝงตัวมา ถ้าพบเหตุการณ์แบบนี้ให้โทรติดต่อเบอร์มือถือจริงของเพื่อนทันทีครับ'
      }
    ],
    redFlagsCount: 3,
    summary: 'สรุปบทเรียน: เมื่อมีเพื่อนหรือญาติทักแชทยืมเงิน ห้ามโอนเด็ดขาดจนกว่าจะได้โทรคุยยินยอมหรือได้ยินเสียงจริงของเจ้าตัว',
    speakerSummary: 'สรุปสั้นๆ เมื่อเพื่อนยืมเงินในแชท ให้โทรศัพท์หาตัวจริงก่อนเสมอ อย่าพึ่งโอนเด็ดขาดครับ'
  }
];

export default function G2ScamSpotter({ onFinish, logEvent }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedBlocks, setSelectedBlocks] = useState({}); // { blockId: true }
  const [showSummary, setShowSummary] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const synthRef = React.useRef(window.speechSynthesis);

  const scenario = SCENARIOS[currentIdx];

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

  const handleBlockTap = (block) => {
    if (showSummary) return;

    const newSelected = { ...selectedBlocks, [block.id]: !selectedBlocks[block.id] };
    setSelectedBlocks(newSelected);

    logEvent('tap_hotspot', {
      game_id: 'G2',
      scenario_id: scenario.id,
      block_id: block.id,
      is_red_flag: block.isRedFlag,
      action: !selectedBlocks[block.id] ? 'select' : 'deselect'
    });
  };

  const handleCheck = () => {
    if (synthRef.current) synthRef.current.cancel();
    setSpeaking(false);
    setShowSummary(true);
    
    // Count how many red flags user spotted
    const foundCount = scenario.blocks.filter(b => b.isRedFlag && selectedBlocks[b.id]).length;
    logEvent('check_scenario', {
      game_id: 'G2',
      scenario_id: scenario.id,
      red_flags_found: foundCount,
      total_red_flags: scenario.redFlagsCount
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
      setSelectedBlocks({});
      setShowSummary(false);
      logEvent('enter_question', { game_id: 'G2', scenario_id: SCENARIOS[nextIdx].id });
    } else {
      // Calculate overall score (stars out of 3)
      logEvent('game_complete', { game_id: 'G2', stars: 3 });
      onFinish(3); // All complete awards 3 stars
    }
  };

  // Helper to determine block color status
  const getBlockStyle = (block) => {
    const isSelected = selectedBlocks[block.id];
    if (showSummary) {
      if (block.isRedFlag) {
        return {
          borderColor: 'var(--accent-error)',
          backgroundColor: '#fef2f2',
          borderLeftWidth: '8px',
          boxShadow: '0 0 10px rgba(220, 38, 38, 0.15)'
        };
      }
    }
    if (isSelected) {
      return {
        borderColor: 'var(--primary)',
        backgroundColor: 'var(--primary-light)',
        borderLeftWidth: '6px'
      };
    }
    return {
      borderColor: 'var(--border)',
      backgroundColor: '#f8fafc'
    };
  };

  const allRedFlagsSelected = scenario.blocks.every(b => !b.isRedFlag || selectedBlocks[b.id]);
  const hasSelectedAny = Object.values(selectedBlocks).some(v => v);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Progress & Speaker Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {SCENARIOS.map((s, idx) => (
              <div 
                key={s.id} 
                style={{ 
                  width: '14px', 
                  height: '14px', 
                  borderRadius: '50%', 
                  backgroundColor: idx === currentIdx 
                    ? 'var(--primary)' 
                    : idx < currentIdx 
                      ? 'var(--primary-dark)' 
                      : 'var(--border)'
                }}
              />
            ))}
          </div>

          <button
            onClick={() => handleSpeak(showSummary ? scenario.summary + ' ' + scenario.speakerSummary : 'กรุณาแตะจุดสีฟ้าหรือข้อความที่ท่านคิดว่าแปลกๆ น่าสงสัยเพื่อเลือก จากนั้นกดปุ่มดูเฉลยด้านล่างครับ')}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: speaking ? 'var(--primary-light)' : 'var(--bg-app)',
              border: '2px solid var(--primary)',
              color: 'var(--primary-dark)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              minHeight: '48px'
            }}
          >
            {speaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
            <span>ฟังเสียงนำทาง</span>
          </button>
        </div>

        {/* Info label */}
        <div style={{ textAlign: 'left' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 'bold' }}>{scenario.title}</h3>
          <p className="text-small" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            {!showSummary ? '👉 แตะกล่องข้อความหรือชื่อผู้ส่งจุดที่ท่านรู้สึกสงสัย (เลือกได้มากกว่า 1 จุด)' : '❌ แถบสีแดงคือจุดที่มิจฉาชีพใช้หลอกลวง'}
          </p>
        </div>

        {/* Mock Screen Interface */}
        <div style={{
          border: '3px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-md)'
        }}>
          {/* Simulated App Header */}
          <div style={{
            backgroundColor: scenario.headerBg,
            color: '#ffffff',
            padding: '16px',
            fontSize: '20px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              {scenario.avatarLetter}
            </div>
            <span>{scenario.sender}</span>
          </div>

          {/* Interactive blocks */}
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {scenario.blocks.map((block) => (
              <div
                key={block.id}
                onClick={() => handleBlockTap(block)}
                style={{
                  padding: '16px',
                  border: '2px solid',
                  borderRadius: 'var(--radius-lg)',
                  cursor: showSummary ? 'default' : 'pointer',
                  textAlign: 'left',
                  fontSize: '18px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  ...getBlockStyle(block)
                }}
              >
                <div>{block.text}</div>
                
                {/* Individual Explanations on ShowSummary */}
                {showSummary && (
                  <div style={{ 
                    marginTop: '8px', 
                    paddingTop: '8px', 
                    borderTop: '1px dashed #fca5a5', 
                    fontSize: '17px', 
                    color: 'var(--accent-error)',
                    fontWeight: 'bold',
                    lineHeight: '1.4'
                  }}>
                    {block.desc}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Big Stop Think Ask Act summary box */}
        {showSummary && (
          <div className="premium-card" style={{ 
            border: '2px solid var(--primary)', 
            backgroundColor: 'var(--primary-light)', 
            textAlign: 'left',
            animation: 'fadeIn 0.4s ease-out',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--primary-dark)', marginBottom: '8px' }}>
              <ShieldAlert size={28} />
              <strong style={{ fontSize: '20px' }}>เกราะป้องกันภัย: หยุด คิด ถาม ทำ</strong>
            </div>
            <p style={{ fontSize: '18px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
              {scenario.summary}
            </p>
            
            <div style={{ 
              marginTop: '12px', 
              paddingTop: '12px', 
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '17px',
              fontWeight: 'bold',
              color: 'var(--text-secondary)'
            }}>
              <HeartHandshake size={20} color="var(--primary)" />
              <span>แจ้งสายด่วนตำรวจไซเบอร์ โทร. 1441 ทันทีเมื่อสงสัย</span>
            </div>
          </div>
        )}
      </div>

      {/* Button Panel */}
      <div style={{ marginTop: '24px' }}>
        {!showSummary ? (
          <button
            onClick={handleCheck}
            className="btn btn-primary"
            disabled={!hasSelectedAny}
            style={{ fontSize: '22px', minHeight: '64px' }}
          >
            <span>ตรวจหาจุดสัญญาณมิจ</span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="btn btn-primary"
            style={{ fontSize: '22px', minHeight: '64px' }}
          >
            <span>{currentIdx < SCENARIOS.length - 1 ? 'สถานการณ์ถัดไป' : 'จบบทเรียนและรับดาว'}</span>
            <ArrowRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
