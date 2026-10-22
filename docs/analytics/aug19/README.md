# 🧪 Field Test Analytics & Action Logs (19 Aug 2026, 12:00 – 16:00)

โฟลเดอร์สำหรับจัดเก็บและวิเคราะห์ข้อมูล Action Logs จากการลงพื้นที่อบรมเชิงปฏิบัติการจริง (Field Workshop) ณ จังหวัดแพร่ วันที่ 19 สิงหาคม 2026

> 🎯 **เงื่อนไขการตัดและกรองข้อมูล (Filter Criteria)**:
> - **วันที่**: 19 สิงหาคม 2026
> - **ช่วงเวลา**: 12:00:00 – 16:00:00 น. (เวลาประเทศไทย ICT / Asia/Bangkok)
> - **วัตถุประสงค์**: เพื่อตัดข้อมูล Dev/Testing ในช่วงเช้าและช่วงค่ำออก ให้เหลือเฉพาะผู้เรียนกลุ่มผู้สูงอายุและวิทยากรที่เข้าร่วมกิจกรรมจริงในห้องอบรม

---

## 📂 โครงสร้างไฟล์ในโฟลเดอร์นี้

- `action_logs.csv` — ข้อมูล Raw Action Logs ที่ Export มาจาก Supabase PostgreSQL (48,555 records รวมทุกช่วงเวลา)
- `summary_stats.json` — ผลสรุปตัวเลขสถิติเชิงลึกหลังการกรองเฉพาะช่วง 12:00 – 16:00 น.
- `aug19_usage_report.md` — 📊 **รายงานผลการวิเคราะห์ฉบับสมบูรณ์ (Executive Report)**
- `aug19_player_summary.png` — กราฟ Funnel / เส้นทางผู้เรียนตามบทเรียนและมินิเกม
- `aug19_timeline.png` — ไทม์ไลน์กิจกรรมของผู้ใช้งานราย 15 นาที
- `aug19_top_events.png` — 12 เหตุการณ์ที่มีการ Trigger สูงสุด
- `aug19_device_os.png` — สัดส่วนระบบปฏิบัติการ (Android / iOS / PC)
- `aug19_screen_sizes.png` — สัดส่วนความละเอียดหน้าจอมือถือของผู้สูงอายุ
- `aug19_game_accuracy.png` — ความแม่นยำและการมีส่วนร่วมในมินิเกม G1, G6, G3, G13
- `aug19_video_engagement.png` — พฤติกรรมการดูวิดีโอและระบบรับมือเน็ตช้า (Slow Network Fallback)
- `aug19_session_distribution.png` — การกระจายตัวของปริมาณ Action ต่อหนึ่ง Session

---

## 🛠️ วิธีการรันวิเคราะห์ซ้ำ (Reproduce)

### 1. ดึงข้อมูลล่าสุดจาก Supabase
```bash
node scripts/export_logs.js aug19
```

### 2. รันสคริปต์ประมวลผล กรองช่วง 12:00-16:00 และสร้างชาร์ต
```bash
python scripts/generate_aug19_analytics.py
```

### 3. รันสคริปต์สกัดสถิติ JSON
```bash
python scripts/compute_aug19_stats.py
```
