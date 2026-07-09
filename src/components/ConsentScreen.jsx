import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, ArrowRight } from 'lucide-react';
import { loggingService } from '../services/loggingService';

export default function ConsentScreen({ session, onSave }) {
  // State for age selection
  const [ageGroup, setAgeGroup] = useState(session.ageGroup || '');
  
  // Geolocation states (tracked automatically via IP simulation)
  const [detectedProvince, setDetectedProvince] = useState('เชียงใหม่');
  const [detectedDistrict, setDetectedDistrict] = useState('เมืองเชียงใหม่');
  const [detectedSubdistrict, setDetectedSubdistrict] = useState('สุเทพ');
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    // Simulate high-speed IP location tracking on mount
    const timer = setTimeout(() => {
      setDetectedProvince('เชียงใหม่');
      setDetectedDistrict('เมืองเชียงใหม่');
      setDetectedSubdistrict('สุเทพ');
      setIsDetecting(false);
      loggingService.logEvent('ip_location_tracked', { province: 'เชียงใหม่', district: 'เมืองเชียงใหม่', subdistrict: 'สุเทพ' });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    if (!ageGroup) return;

    loggingService.logEvent('consent_given', { 
      age_group: ageGroup, 
      province: detectedProvince,
      district: detectedDistrict,
      subdistrict: detectedSubdistrict,
      source: 'ip_lookup'
    });

    onSave({
      ageGroup,
      consentGiven: true,
      location: {
        province: detectedProvince,
        district: detectedDistrict,
        subdistrict: detectedSubdistrict,
        source: 'ip_lookup'
      }
    });
  };

  const ageOptions = [
    { label: '50 - 59 ปี', value: '50-59' },
    { label: '60 - 69 ปี (วัยเก๋าตอนต้น)', value: '60-69' },
    { label: '70 - 79 ปี (วัยเก๋าตอนกลาง)', value: '70-79' },
    { label: '80 ปีขึ้นไป (วัยเก๋าตอนปลาย)', value: '80+' }
  ];

  return (
    <div className="screen-container">
      <div className="content-area">
        <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', textAlign: 'center' }}>
          ยินดีต้อนรับสู่วิชาเรียนรู้เท่าทันสื่อ
        </h2>
        <p className="text-lead" style={{ textAlign: 'center', marginBottom: '20px' }}>
          กรุณากรอกข้อมูลสั้นๆ ด้านล่างเพื่อเริ่มกิจกรรม
        </p>

        {/* 1. Age Range Selection */}
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <strong style={{ fontSize: '20px', color: 'var(--primary-dark)', display: 'block', marginBottom: '10px' }}>
            1. เลือกช่วงอายุของท่าน:
          </strong>
          <div className="options-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ageOptions.map((opt) => (
              <div 
                key={opt.value}
                className={`option-item ${ageGroup === opt.value ? 'selected' : ''}`}
                onClick={() => setAgeGroup(opt.value)}
                style={{ padding: '16px 20px', minHeight: '56px', cursor: 'pointer' }}
              >
                <input 
                  type="radio" 
                  name="ageGroup" 
                  value={opt.value} 
                  checked={ageGroup === opt.value}
                  onChange={() => {}} // handled by parent onClick
                  style={{ width: '22px', height: '22px', marginRight: '12px' }}
                />
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{opt.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. PDPA & IP Tracking info */}
        <div className="premium-card" style={{ padding: '16px', textAlign: 'left', marginBottom: '16px', borderLeft: '6px solid var(--primary)' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: 'var(--primary-dark)' }}>
            <ShieldCheck size={28} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '18px', display: 'block' }}>การคุ้มครองข้อมูลส่วนบุคคล (PDPA)</strong>
              <span style={{ fontSize: '16px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block', lineHeight: '1.4' }}>
                แอปพลิเคชันนี้จะบันทึกช่วงอายุ และระบุจังหวัด/อำเภอ/ตำบลโดยประมาณผ่าน **IP ของอุปกรณ์ท่านโดยอัตโนมัติ** เพื่อวิเคราะห์สถิติโครงการเท่านั้น <strong>โดยไม่มีการเก็บชื่อ เบอร์โทรศัพท์ หรือที่อยู่ IP ดิบของท่าน</strong> ปลอดภัย 100%
              </span>
            </div>
          </div>
        </div>

        {/* 3. Auto-detected Location Status */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          backgroundColor: 'var(--bg-app)', 
          padding: '12px 16px', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
          textAlign: 'left'
        }}>
          <MapPin size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
            {isDetecting ? (
              'กำลังค้นหาพื้นที่ใช้งานอัตโนมัติจาก IP...'
            ) : (
              `พื้นที่ใช้งานตรวจจับจาก IP: ต.${detectedSubdistrict} อ.${detectedDistrict} จ.${detectedProvince}`
            )}
          </span>
        </div>
      </div>

      {/* Start Button */}
      <button 
        onClick={handleSubmit} 
        className="btn btn-primary"
        disabled={!ageGroup}
        style={{ fontSize: '22px', minHeight: '64px', marginTop: '24px', width: '100%' }}
      >
        <span>ยินยอมข้อมูลและเริ่มเรียนรู้</span>
        <ArrowRight size={24} />
      </button>
    </div>
  );
}
