// UNUSED — หน้า Consent จริงอยู่ที่ src/app/consent/page.tsx
// ถอด GPS ตาม FB-2026-08-18 แล้ว อย่า copy flow ดึงพิกัดจากไฟล์นี้กลับไปใช้
import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, ArrowRight } from 'lucide-react';
import { loggingService } from '../services/loggingService';
import locationData from '../data/thailand-location.json';

// Helper to clean prefixes from location names
function cleanLocationName(name, type) {
  if (!name) return '';
  let cleaned = name.trim();
  if (type === 'province') {
    cleaned = cleaned.replace(/^จังหวัด/, '');
  } else if (type === 'district') {
    cleaned = cleaned.replace(/^อำเภอ/, '');
  } else if (type === 'subdistrict') {
    cleaned = cleaned.replace(/^ตำบล/, '');
  }
  return cleaned;
}

// Match GPS coordinates to our curated local dataset
function matchGPSLocation(prov, dist, sub) {
  const cleanProv = cleanLocationName(prov, 'province');
  const cleanDist = cleanLocationName(dist, 'district');
  const cleanSub = cleanLocationName(sub, 'subdistrict');

  // Search for target provinces (Chiang Mai, Phrae, Nan)
  const matchedProvince = locationData.provinces.find(p => p.name.includes(cleanProv) || cleanProv.includes(p.name));
  if (!matchedProvince) return null;

  const matchedDistrict = matchedProvince.districts.find(d => d.name.includes(cleanDist) || cleanDist.includes(d.name));
  if (!matchedDistrict) {
    return {
      province: matchedProvince.name,
      district: matchedProvince.districts[0].name,
      subdistrict: matchedProvince.districts[0].subdistricts[0],
      source: 'gps_lookup'
    };
  }

  const matchedSubdistrict = matchedDistrict.subdistricts.find(s => s.includes(cleanSub) || cleanSub.includes(s));
  return {
    province: matchedProvince.name,
    district: matchedDistrict.name,
    subdistrict: matchedSubdistrict || matchedDistrict.subdistricts[0],
    source: 'gps_lookup'
  };
}

export default function ConsentScreen({ session, onSave }) {
  // State for age selection
  const [ageGroup, setAgeGroup] = useState(session.ageGroup || '');
  const [showPDPAPopup, setShowPDPAPopup] = useState(false);
  
  // Geolocation states (manually editable, GPS fallback)
  const [detectedProvince, setDetectedProvince] = useState(session.location?.province || '');
  const [detectedDistrict, setDetectedDistrict] = useState(session.location?.district || '');
  const [detectedSubdistrict, setDetectedSubdistrict] = useState(session.location?.subdistrict || '');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [locationSource, setLocationSource] = useState(session.location?.source || 'default');
  const [rawGeoData, setRawGeoData] = useState(null);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);

  const handleSubmit = () => {
    if (!ageGroup) return;

    loggingService.logEvent('consent_given', { 
      age_group: ageGroup, 
      province: detectedProvince,
      district: detectedDistrict,
      subdistrict: detectedSubdistrict,
      source: locationSource
    });

    onSave({
      ageGroup,
      consentGiven: true,
      location: {
        province: detectedProvince,
        district: detectedDistrict,
        subdistrict: detectedSubdistrict,
        source: locationSource
      }
    });
  };

  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('อุปกรณ์ของท่านไม่รองรับการระบุพิกัด GPS');
      return;
    }

    setIsDetectingGPS(true);
    loggingService.logEvent('gps_location_requested');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`GPS Coordinates: lat=${latitude}, lon=${longitude}`);

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
            headers: {
              'Accept-Language': 'th,en;q=0.9'
            }
          });

          if (res.ok) {
            const data = await res.json();
            console.log('GPS Address Data:', data);
            
            if (data.address) {
              const addr = data.address;
              const rawProv = addr.province || addr.state || '';
              const rawDist = addr.district || addr.amphoe || addr.city || addr.county || addr.town || '';
              const rawSub = addr.subdistrict || addr.tambon || addr.suburb || addr.village || addr.quarter || '';

              const cleanProv = rawProv.replace(/^จังหวัด/, '').trim();
              const cleanDist = rawDist.replace(/^อำเภอ/, '').trim();
              const cleanSub = rawSub.replace(/^ตำบล/, '').trim();

              const matched = matchGPSLocation(cleanProv, cleanDist, cleanSub);
              if (matched) {
                setDetectedProvince(matched.province);
                setDetectedDistrict(matched.district);
                setDetectedSubdistrict(matched.subdistrict);
                setLocationSource('gps_lookup');
                
                setRawGeoData({
                  source: 'Browser GPS (Reverse Geocoded)',
                  coordinates: { latitude, longitude },
                  raw_address: { province: rawProv, district: rawDist, subdistrict: rawSub },
                  matched_local: matched
                });

                loggingService.logEvent('gps_location_success', {
                  latitude,
                  longitude,
                  province: matched.province,
                  district: matched.district,
                  subdistrict: matched.subdistrict
                });
              } else {
                alert(`พิกัดของท่านอยู่นอกพื้นที่เป้าหมายโครงการ (ตรวจพบ: จ.${cleanProv || 'ไม่ระบุ'}) กรุณาเลือกพื้นที่จัดกิจกรรมของท่านจากรายการแบบแมนนวล`);
                loggingService.logEvent('gps_location_out_of_bounds', { province: cleanProv, district: cleanDist });
              }
            }
          } else {
            alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์แผนที่ได้ กรุณาคลิกปุ่มแก้ไขเพื่อระบุพิกัดด้วยตัวเอง');
          }
        } catch (err) {
          console.error('Error reverse geocoding GPS coordinates:', err);
          alert('เกิดข้อผิดพลาดในการดึงข้อมูลที่อยู่จากพิกัด GPS');
        } finally {
          setIsDetectingGPS(false);
        }
      },
      (error) => {
        console.warn('GPS location notice (manual selection enabled):', error.code, error.message);
        setIsDetectingGPS(false);
        setIsEditing(true);
        loggingService.logEvent('gps_location_failed', { error_code: error.code, message: error.message });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const selectedProvinceData = locationData.provinces.find(p => p.name === detectedProvince) || null;
  const districts = selectedProvinceData ? selectedProvinceData.districts : [];
  const selectedDistrictData = districts.find(d => d.name === detectedDistrict) || null;
  const subdistricts = selectedDistrictData ? selectedDistrictData.subdistricts : [];
  const ageOptions = [
    { label: '50 - 59 ปี', value: '50-59' },
    { label: '60 - 69 ปี (วัยเก๋าตอนต้น)', value: '60-69' },
    { label: '70 - 79 ปี (วัยเก๋าตอนกลาง)', value: '70-79' },
    { label: '80 ปีขึ้นไป (วัยเก๋าตอนปลาย)', value: '80+' }
  ];

  return (
    <div className="screen-container">
      <div className="content-area flex flex-col gap-2">
        <h2 className="text-2xl font-extrabold text-[var(--text-primary)] text-center mb-1">
          ยินดีต้อนรับสู่วิชาเรียนรู้เท่าทันสื่อ
        </h2>
        <p className="text-lead text-center mb-2 text-[18px]">
          กรุณากรอกข้อมูลสั้นๆ ด้านล่างเพื่อเริ่มกิจกรรม
        </p>

        {/* 1. Age Range Selection */}
        <div className="text-left mb-2">
          <strong className="text-[18px] text-[var(--primary-dark)] block mb-1">
            1. เลือกช่วงอายุของท่าน:
          </strong>
          <div className="options-list flex flex-col gap-1.5">
            {ageOptions.map((opt) => (
              <div
                key={opt.value}
                className={`option-item cursor-pointer p-[10px_16px] min-h-[48px] ${ageGroup === opt.value ? 'selected' : ''}`}
                onClick={() => setAgeGroup(opt.value)}
              >
                <input
                  type="radio"
                  name="ageGroup"
                  value={opt.value}
                  checked={ageGroup === opt.value}
                  onChange={() => {}} // handled by parent onClick
                  className="w-5 h-5 mr-2.5"
                />
                <span className="text-[18px] font-bold">{opt.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. PDPA Link instead of full card to save vertical space */}
        <div className="text-center mb-2">
          <button
            type="button"
            onClick={() => setShowPDPAPopup(true)}
            className="bg-transparent border-none text-[var(--primary-dark)] text-[16px] font-bold underline cursor-pointer inline-flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-lg)]"
          >
            <ShieldCheck size={18} />
            <span>อ่านนโยบายความเป็นส่วนตัว (PDPA)</span>
          </button>
        </div>


        {/* 3. Dynamic Location Panel (Auto-detected & Editable) */}
        <div className="flex flex-col gap-2 bg-[var(--bg-app)] p-3 rounded-[var(--radius-lg)] border border-[var(--border)] text-[var(--text-secondary)] text-left">
          <div className="flex items-start justify-between w-full gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <MapPin size={22} color="var(--primary)" className="shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 w-full">
                <span className="text-[16px] font-bold text-[var(--text-primary)] leading-snug break-words">
                  {isDetecting ? (
                    'กำลังค้นหาพื้นที่ใช้งานอัตโนมัติ...'
                  ) : detectedProvince ? (
                    `พื้นที่: จ.${detectedProvince}${detectedDistrict ? ` > อ.${detectedDistrict}` : ''}${detectedSubdistrict ? ` > ต.${detectedSubdistrict}` : ''}`
                  ) : (
                    'พื้นที่: ไม่ทราบพื้นที่'
                  )}
                </span>
                {!isDetecting && (
                  <button
                    type="button"
                    onClick={handleGPSLocation}
                    disabled={isDetectingGPS}
                    className={`bg-[var(--primary-light)] border border-[var(--primary)] text-[var(--primary-dark)] text-[14px] font-bold cursor-pointer rounded-[var(--radius-pill)] px-2 py-0.5 self-start inline-flex items-center gap-1 mt-0.5 ${isDetectingGPS ? 'opacity-60' : 'opacity-100'}`}
                  >
                    <span>{isDetectingGPS ? 'กำลังดึง GPS...' : '📍 ดึงพิกัดจาก GPS (แม่นยำขึ้น)'}</span>
                  </button>
                )}
              </div>
            </div>

            {!isDetecting && (
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="bg-transparent border-none text-[var(--primary)] text-[16px] font-bold cursor-pointer underline px-1.5 py-0.5 shrink-0 mt-0.5"
              >
                {isEditing ? 'เสร็จสิ้น' : 'แก้ไข'}
              </button>
            )}
          </div>

          {isEditing && (
            <div className="flex flex-col gap-3 mt-2 [animation:fadeIn_0.2s_ease-out]">
              <div>
                <label className="text-[16px] font-bold block mb-1.5 text-[var(--text-secondary)]">
                  จังหวัด:
                </label>
                <select
                  value={detectedProvince}
                  onChange={(e) => {
                    const provName = e.target.value;
                    setDetectedProvince(provName);
                    setDetectedDistrict('');
                    setDetectedSubdistrict('');
                    setLocationSource('manual');
                  }}
                  className="select-input"
                >
                  {detectedProvince === '' && (
                    <option value="" disabled>-- เลือกจังหวัด --</option>
                  )}
                  {locationData.provinces.map(p => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[16px] font-bold block mb-1.5 text-[var(--text-secondary)]">
                  อำเภอ:
                </label>
                <select
                  value={detectedDistrict}
                  onChange={(e) => {
                    const distName = e.target.value;
                    const distData = districts.find(d => d.name === distName);
                    const firstSub = distData ? distData.subdistricts[0] : '';
                    setDetectedDistrict(distName);
                    setDetectedSubdistrict(firstSub);
                    setLocationSource('manual');
                  }}
                  className="select-input"
                >
                  {detectedDistrict === '' && (
                    <option value="" disabled>-- เลือกอำเภอ --</option>
                  )}
                  {districts.map(d => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[16px] font-bold block mb-1.5 text-[var(--text-secondary)]">
                  ตำบล:
                </label>
                <select
                  value={detectedSubdistrict}
                  disabled={detectedDistrict === ''}
                  onChange={(e) => {
                    setDetectedSubdistrict(e.target.value);
                    setLocationSource('manual');
                  }}
                  className="select-input"
                >
                  {detectedDistrict === '' ? (
                    <option value="" disabled>-- กรุณาเลือกอำเภอ --</option>
                  ) : (
                    <>
                      {detectedSubdistrict === '' && (
                        <option value="" disabled>-- เลือกตำบล --</option>
                      )}
                      {subdistricts.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleSubmit}
        className="btn btn-primary text-[20px] min-h-[52px] mt-3 w-full"
        disabled={!ageGroup}
      >
        <span>ยินยอมข้อมูลและเริ่มเรียนรู้</span>
        <ArrowRight size={22} />
      </button>

      {/* PDPA Modal Popup */}
      {showPDPAPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-6">
          <div className="bg-[var(--bg-card)] rounded-[var(--radius-xl)] p-6 max-w-[420px] w-full shadow-[var(--shadow-lg)] border-2 border-[var(--border)] text-left [animation:fadeIn_0.2s_ease-out]">
            <div className="flex gap-2.5 items-center text-[var(--primary-dark)] mb-3.5">
              <ShieldCheck size={32} />
              <strong className="text-[22px]">การคุ้มครองข้อมูล (PDPA)</strong>
            </div>

            <p className="text-[18px] text-[var(--text-primary)] leading-relaxed mb-5">
              แอปพลิเคชันนี้จะบันทึกช่วงอายุ และระบุจังหวัด/อำเภอ/ตำบลโดยประมาณผ่าน <strong>IP ของอุปกรณ์ท่านโดยอัตโนมัติ</strong> เพื่อวิเคราะห์สถิติโครงการเท่านั้น <strong>โดยไม่มีการเก็บชื่อ เบอร์โทรศัพท์ หรือที่อยู่ IP ดิบของท่าน</strong> ปลอดภัย 100%
            </p>

            <button
              onClick={() => setShowPDPAPopup(false)}
              className="btn btn-primary text-[20px] min-h-[56px] w-full"
            >
              เข้าใจและปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
