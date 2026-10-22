# 🧪 Action Logs & Analytics Testing (18-19 Aug 2026)

โฟลเดอร์สำหรับจัดเก็บและวิเคราะห์ข้อมูล Action Logs สำหรับการทดสอบระบบเวอร์ชันล่าสุด (Pre-Testing 18 ส.ค. ก่อนลงสนามจริง 19 ส.ค. 2026)

---

## 📂 โครงสร้างไฟล์ในโฟลเดอร์นี้

- `action_logs.csv` — ข้อมูล Raw logs ที่ Export มาจาก Supabase PostgreSQL
- `aug18_player_summary.png` — กราฟ Funnel / เส้นทางผู้เรียนตามหน้าและมินิเกม
- `aug18_timeline.png` — ไทม์ไลน์กิจกรรมของผู้ใช้งาน
- `aug18_top_events.png` — 10 เหตุการณ์ที่มีการ Trigger สูงสุด
- `aug18_screen_sizes.png` — สัดส่วนความละเอียดหน้าจอมือถือ
- `aug18_video_engagement.png` — พฤติกรรมการดูวิดีโอ (เข้า/เล่น/ข้าม/ดูจบ)
- `aug18_page_engagement.png` — จำนวน Action ในแต่ละหน้า/มินิเกม
- `aug18_session_distribution.png` — การกระจายตัวของ Action ต่อหนึ่ง Session
- `aug18_usage_report.md` — รายงานสรุปผลการทดสอบ (เมื่อรันการวิเคราะห์)

---

## 🛠️ วิธีการดึงข้อมูลและสร้างรายงาน

### 1. ดึงข้อมูลล่าสุดจาก Supabase
รันคำสั่ง Node.js เพื่อ Export ข้อมูลลงโฟลเดอร์นี้ (`aug18` เป็นค่าเริ่มต้น):
```bash
node scripts/export_logs.js aug18
```

### 2. รันสคริปต์ประมวลผลและสร้างชาร์ตวิเคราะห์
```bash
python scripts/generate_analytics_report.py aug18
```
*(ระบบจะสร้างไฟล์ชาร์ตภาพ `aug18_*.png` บันทึกลงในโฟลเดอร์นี้โดยอัตโนมัติ)*
