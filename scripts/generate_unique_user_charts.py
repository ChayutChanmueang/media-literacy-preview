import json
import os
import sys
import matplotlib.pyplot as plt
import numpy as np

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

# Style configuration
plt.style.use('seaborn-v0_8-whitegrid')
plt.rcParams['font.sans-serif'] = ['Leelawadee UI', 'Tahoma', 'DejaVu Sans', 'Arial']
plt.rcParams['axes.unicode_minus'] = False

OUTPUT_DIR = 'docs/analytics/sep19'
os.makedirs(OUTPUT_DIR, exist_ok=True)

DATA_PATH = 'docs/analytics/sep19/unique_users_data.json'
with open(DATA_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

# ==============================================================================
# CHART 1: Demographics (Age & Province Breakdown)
# ==============================================================================
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

# Subplot 1: Age Distribution
ages = data['demographics']['by_age']
age_order = ['50-59', '60-69', '70-79', '80+', 'other']
age_labels = ['50–59 ปี', '60–69 ปี', '70–79 ปี', '80 ปีขึ้นไป', 'กลุ่มอื่น ๆ / <50']
age_vals = [ages.get(k, 0) for k in age_order]
colors_age = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

wedges, texts, autotexts = ax1.pie(
    age_vals, 
    labels=age_labels, 
    autopct='%1.1f%%', 
    startangle=140, 
    colors=colors_age,
    wedgeprops=dict(width=0.45, edgecolor='white', linewidth=2),
    pctdistance=0.75
)
for t in texts:
    t.set_fontsize(11)
for at in autotexts:
    at.set_fontsize(10)
    at.set_weight('bold')
ax1.set_title("สัดส่วนกลุ่มอายุของผู้ใช้ที่ระบุตัวตน (Unique Users: 291 คน)", fontsize=13, weight='bold', pad=15)

# Subplot 2: Province Distribution
provs = data['demographics']['by_province']
prov_names = ['เชียงใหม่', 'แพร่', 'น่าน', 'อื่น ๆ']
prov_vals = [provs.get(p, 0) for p in prov_names]
colors_prov = ['#2563eb', '#059669', '#d97706', '#6b7280']

bars = ax2.bar(prov_names, prov_vals, color=colors_prov, width=0.55, edgecolor='black', linewidth=0.5)
ax2.set_title("จำนวนผู้ใช้งานแบ่งตามพื้นที่จังหวัด (Unique Users)", fontsize=13, weight='bold', pad=15)
ax2.set_ylabel("จำนวนผู้ใช้งาน (คน)", fontsize=11)
ax2.set_ylim(0, max(prov_vals) * 1.18)

for bar in bars:
    y = bar.get_height()
    pct = (y / sum(prov_vals)) * 100
    ax2.text(bar.get_x() + bar.get_width()/2, y + 2, f"{y} คน\n({pct:.1f}%)", 
             ha='center', va='bottom', fontsize=10, weight='bold')

plt.tight_layout()
chart1_path = os.path.join(OUTPUT_DIR, 'sep19_unique_user_demographics.png')
plt.savefig(chart1_path, dpi=200)
plt.close()
print(f"Saved: {chart1_path}")

# ==============================================================================
# CHART 2: Usage Volume & Activity Timeline
# ==============================================================================
daily = data['daily_usage']
dates = [d['date'] for d in daily]
users = [int(d['active_users']) for d in daily]
actions = [int(d['actions']) for d in daily]

fig, ax1 = plt.subplots(figsize=(15, 6))

color_user = '#2563eb'
color_action = '#f59e0b'

ax1.plot(dates, users, color=color_user, marker='o', linewidth=2.5, markersize=5, label='ผู้ใช้งานต่อวัน (Active Unique Users)')
ax1.set_ylabel('ผู้ใช้งานต่อวัน (คน)', color=color_user, fontsize=12, weight='bold')
ax1.tick_params(axis='y', labelcolor=color_user)
ax1.set_title("ปริมาณการเข้าใช้งานของผู้ใช้ตั้งแต่วันแรกจนถึงปัจจุบัน (Daily Usage Timeline)", fontsize=14, weight='bold', pad=15)

# Formatting X-axis
n_ticks = 15
step = max(1, len(dates) // n_ticks)
tick_indices = list(range(0, len(dates), step))
if (len(dates) - 1) not in tick_indices:
    tick_indices.append(len(dates) - 1)

ax1.set_xticks(tick_indices)
ax1.set_xticklabels([dates[i] for i in tick_indices], rotation=45, ha='right', fontsize=9)

# Secondary Axis for Actions
ax2 = ax1.twinx()
ax2.bar(dates, actions, color=color_action, alpha=0.35, width=0.6, label='ปริมาณ Action ทั้งหมด (Total Actions)')
ax2.set_ylabel('จำนวน Action (ครั้ง)', color='#b45309', fontsize=12, weight='bold')
ax2.tick_params(axis='y', labelcolor='#b45309')
ax2.grid(False)

# Annotate peaks
peak_indices = [i for i, u in enumerate(users) if u >= 40]
for idx in peak_indices:
    ax1.annotate(f"{dates[idx]}\n{users[idx]} users\n({actions[idx]:,} acts)",
                 (dates[idx], users[idx]),
                 textcoords="offset points", xytext=(0, 14), ha='center',
                 fontsize=8, weight='bold',
                 bbox=dict(boxstyle="round,pad=0.3", fc="#eff6ff", ec=color_user, lw=1))

# Legends
lines1, labels1 = ax1.get_legend_handles_labels()
lines2, labels2 = ax2.get_legend_handles_labels()
ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper left', frameon=True, facecolor='white', framealpha=0.9)

plt.tight_layout()
chart2_path = os.path.join(OUTPUT_DIR, 'sep19_unique_user_timeline.png')
plt.savefig(chart2_path, dpi=200)
plt.close()
print(f"Saved: {chart2_path}")

# ==============================================================================
# CHART 3: End-to-End Completion Funnel
# ==============================================================================
funnel = data['funnel']

steps = [
    ("เข้าหน้าแรก (Landing)", int(funnel['landing_page_views'])),
    ("หน้าขอความยินยอม (Consent)", int(funnel['consent_page_views'])),
    ("ยืนยันยินยอม (Consent Submit)", int(funnel['consent_submitted'])),
    ("เข้าหน้าบทเรียน (Dashboard)", int(funnel['lessons_dashboard_views'])),
    ("เริ่มเรียน/ทำกิจกรรม (Started)", int(funnel['started_any_content'])),
    ("จบหมวด 1 (วิดีโอ+เกม)", int(funnel['topic1_both_completed'])),
    ("จบหมวด 6 (วิดีโอ+เกม)", int(funnel['topic6_both_completed'])),
    ("จบหมวด 3 (วิดีโอ+เกม)", int(funnel['topic3_both_completed'])),
    ("เรียนจบครบทุก 3 หมวด", int(funnel['completed_all_3_topics'])),
    ("หน้าจบหลักสูตร (Complete Screen)", int(funnel['course_completion_views'])),
]

step_labels = [s[0] for s in steps]
step_values = [s[1] for s in steps]
baseline = step_values[0]

fig, ax = plt.subplots(figsize=(13, 7))
y_positions = np.arange(len(steps))[::-1]

# Gradient-like coloring
colors = plt.cm.viridis(np.linspace(0.85, 0.25, len(steps)))

bars = ax.barh(y_positions, step_values, color=colors, height=0.6, edgecolor='black', linewidth=0.5)

ax.set_yticks(y_positions)
ax.set_yticklabels(step_labels, fontsize=11, weight='bold')
ax.set_xlabel("จำนวนผู้ใช้งานแบบไม่ซ้ำ (Unique Users)", fontsize=11, weight='bold')
ax.set_title("เส้นทางการใช้งานของผู้ใช้ตั้งแต่หน้าแรกจนจบทุกขั้นตอน (End-to-End Completion Funnel)", fontsize=13, weight='bold', pad=15)
ax.set_xlim(0, max(step_values) * 1.25)

for bar in bars:
    w = bar.get_width()
    pct_base = (w / baseline) * 100
    pct_consent = (w / int(funnel['consent_submitted'])) * 100 if int(funnel['consent_submitted']) > 0 else 0
    y = bar.get_y() + bar.get_height()/2
    label_txt = f" {w:,} คน  ({pct_base:.1f}% ของหน้าแรก | {pct_consent:.1f}% ของผู้ยินยอม)"
    ax.text(w + 3, y, label_txt, va='center', fontsize=9.5, weight='bold', color='#1f2937')

plt.tight_layout()
chart3_path = os.path.join(OUTPUT_DIR, 'sep19_unique_user_funnel.png')
plt.savefig(chart3_path, dpi=200)
plt.close()
print(f"Saved: {chart3_path}")

print("All charts generated successfully!")
