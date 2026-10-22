import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import json
import os
import sys

# Ensure UTF-8 output on Windows
sys.stdout.reconfigure(encoding='utf-8')

# Style configuration
plt.style.use('seaborn-v0_8-whitegrid')
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Tahoma', 'Arial', 'Leelawadee UI', 'Segoe UI']
plt.rcParams['axes.unicode_minus'] = False

OUTPUT_DIR = 'docs/analytics/aug19'
os.makedirs(OUTPUT_DIR, exist_ok=True)
CSV_PATH = 'docs/analytics/aug19/action_logs.csv'

print(f"Loading {CSV_PATH}...")
df_all = pd.read_csv(CSV_PATH)
print(f"Loaded total {len(df_all)} records from raw logs.")

# Convert to Bangkok Time (UTC+7)
df_all['created_at'] = pd.to_datetime(df_all['created_at'])
if df_all['created_at'].dt.tz is None:
    df_all['created_at_bkk'] = df_all['created_at'].dt.tz_localize('UTC').dt.tz_convert('Asia/Bangkok')
else:
    df_all['created_at_bkk'] = df_all['created_at'].dt.tz_convert('Asia/Bangkok')

# Filter for August 19, 2026 between 12:00:00 and 16:00:00
mask_date = (df_all['created_at_bkk'].dt.year == 2026) & (df_all['created_at_bkk'].dt.month == 8) & (df_all['created_at_bkk'].dt.day == 19)
t_start = pd.to_datetime('12:00:00').time()
t_end = pd.to_datetime('16:00:00').time()
mask_time = (df_all['created_at_bkk'].dt.time >= t_start) & (df_all['created_at_bkk'].dt.time <= t_end)

df = df_all[mask_date & mask_time].copy()
print(f"Filtered for Aug 19 (12:00 - 16:00): {len(df)} records across {df['session_id'].nunique()} unique sessions.")

# Safe payload parsing
def parse_payload(val):
    if pd.isna(val) or not isinstance(val, str):
        return {}
    try:
        return json.loads(val)
    except:
        return {}

df['p'] = df['payload'].apply(parse_payload)

# Extract device / OS / screen / demographic info
def get_os(p):
    ua = p.get('userAgent', '')
    if 'Android' in ua:
        return 'Android'
    elif 'iPhone' in ua or 'iPad' in ua or ('Macintosh' in ua and 'Mobile' in ua):
        return 'iOS'
    elif 'Windows' in ua or 'Macintosh' in ua or 'Linux' in ua:
        return 'Desktop / PC'
    return 'Other/Unknown'

def get_screen_size(p):
    return p.get('screenSize', p.get('screen_size', 'Unknown'))

df['os'] = df['p'].apply(get_os)
df['screen_size'] = df['p'].apply(get_screen_size)

# Extract Session-level OS (most frequent OS for that session)
session_os = df.groupby('session_id')['os'].agg(lambda x: x.mode().iloc[0] if not x.empty else 'Unknown').to_dict()
df['session_os'] = df['session_id'].map(session_os)

# Extract Session-level Screen Size
session_screen = df.groupby('session_id')['screen_size'].agg(lambda x: [s for s in x if s != 'Unknown'][0] if any(s != 'Unknown' for s in x) else 'Unknown').to_dict()
df['session_screen'] = df['session_id'].map(session_screen)

print("\n--- Key Metrics (12:00 - 16:00) ---")
print(f"Total Action Logs: {len(df)}")
print(f"Unique Sessions (Participants): {df['session_id'].nunique()}")
print(f"Min Timestamp: {df['created_at_bkk'].min()}")
print(f"Max Timestamp: {df['created_at_bkk'].max()}")

# -------------------------------------------------------------
# 1. Generate Visualizations
# -------------------------------------------------------------

# Chart 1: Funnel & Player Summary
fig, ax = plt.subplots(figsize=(11, 6.5))
funnel_steps = [
    ('/', '1. Landing Page (/)', '#3B82F6'),
    ('/consent', '2. Consent Form (/consent)', '#2563EB'),
    ('/lessons', '3. Lessons Dashboard (/lessons)', '#1D4ED8'),
    ('/lessons/topic-1/video', '4. Topic 1 Video (Fact Check)', '#10B981'),
    ('/lessons/topic-1/game', '5. Topic 1 Game G1 (Fact Check)', '#059669'),
    ('/lessons/topic-6/video', '6. Topic 6 Video (LINE Scam)', '#F59E0B'),
    ('/lessons/topic-6/game', '7. Topic 6 Game G6 (LINE Phishing)', '#D97706'),
    ('/lessons/topic-3/video', '8. Topic 3 Video (Deepfake AI)', '#8B5CF6'),
    ('/lessons/topic-3/game', '9. Topic 3 Game G3 (Deepfake QA)', '#7C3AED'),
    ('/lessons/flow-g13/game', '10. Ice Cream Game G13 (QA Catch)', '#EC4899'),
    ('/lessons/flow-g13/leaderboard', '11. G13 Leaderboard', '#DB2777'),
    ('/lessons/complete', '12. Course Completion / Certificate', '#065F46')
]

funnel_data = []
for path_key, label, color in funnel_steps:
    cnt = df[df['page_url'] == path_key]['session_id'].nunique()
    actions = len(df[df['page_url'] == path_key])
    funnel_data.append({'step': label, 'users': cnt, 'actions': actions, 'color': color})

funnel_df = pd.DataFrame(funnel_data)
bars = ax.barh(funnel_df['step'][::-1], funnel_df['users'][::-1], color=funnel_df['color'][::-1], edgecolor='black', alpha=0.9)
ax.set_title('Participant Journey & Learning Funnel (19 Aug 2026, 12:00-16:00)', fontsize=14, fontweight='bold', pad=15)
ax.set_xlabel('Unique Learners / Participants', fontsize=12)
ax.set_xlim(0, max(funnel_df['users']) + 10)

for bar in bars:
    w = bar.get_width()
    ax.text(w + 1, bar.get_y() + bar.get_height()/2, f'{int(w)} users', ha='left', va='center', fontweight='bold', fontsize=10)

plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, 'aug19_player_summary.png'), dpi=200)
plt.close()

# Chart 2: Timeline of Workshop Activity (15-min Intervals)
fig, ax = plt.subplots(figsize=(12, 5.5))
df['time_15m'] = df['created_at_bkk'].dt.floor('15min')
time_grouped = df.groupby('time_15m').agg(
    total_actions=('id', 'count'),
    active_users=('session_id', 'nunique')
).reset_index()

time_labels = [t.strftime('%H:%M') for t in time_grouped['time_15m']]
line1 = ax.plot(time_labels, time_grouped['total_actions'], marker='o', linewidth=2.8, color='#8B5CF6', label='Total Event Actions')
ax.set_ylabel('Total Actions Triggered', fontsize=12, color='#8B5CF6', fontweight='bold')
ax.set_xlabel('Workshop Time (BKK Time / ICT)', fontsize=12)
ax.tick_params(axis='x', rotation=30)
ax.set_ylim(0, max(time_grouped['total_actions']) * 1.15)

ax2 = ax.twinx()
bars = ax2.bar(time_labels, time_grouped['active_users'], alpha=0.35, color='#10B981', width=0.45, label='Active Participants')
ax2.set_ylabel('Active Concurrent Learners', fontsize=12, color='#10B981', fontweight='bold')
ax2.set_ylim(0, max(time_grouped['active_users']) * 1.25)
ax2.grid(False)

plt.title('Workshop Activity Timeline & Participant Cadence (19 Aug 2026, 12:00 - 16:00)', fontsize=14, fontweight='bold', pad=15)

# Annotate peak
peak_idx = time_grouped['total_actions'].idxmax()
peak_time = time_labels[peak_idx]
peak_act = time_grouped.loc[peak_idx, 'total_actions']
peak_usr = time_grouped.loc[peak_idx, 'active_users']
ax.annotate(f'Peak Workshop Session\n{peak_time} ({peak_act:,} actions, {peak_usr} users)',
            xy=(peak_idx, peak_act), xytext=(peak_idx - 2, peak_act * 0.85),
            arrowprops=dict(facecolor='black', shrink=0.05, width=1, headwidth=6),
            fontsize=10, fontweight='bold', bbox=dict(boxstyle='round,pad=0.3', facecolor='#FEF08A', edgecolor='#EAB308'))

plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, 'aug19_timeline.png'), dpi=200)
plt.close()

# Chart 3: Top Triggered Events
fig, ax = plt.subplots(figsize=(11, 6))
top_ev = df.groupby('event_name').agg(
    total_count=('id', 'count'),
    unique_users=('session_id', 'nunique')
).reset_index().sort_values('total_count', ascending=True).tail(12)

bars = ax.barh(top_ev['event_name'], top_ev['total_count'], color='#F59E0B', edgecolor='black', alpha=0.9)
ax.set_title('Top 12 User Events Triggered (19 Aug 2026, 12:00-16:00)', fontsize=14, fontweight='bold', pad=15)
ax.set_xlabel('Total Trigger Count', fontsize=12)
for bar, (_, row) in zip(bars, top_ev.iterrows()):
    w = bar.get_width()
    ax.text(w + 30, bar.get_y() + bar.get_height()/2, f'{int(w):,} ({row["unique_users"]} users)', ha='left', va='center', fontweight='bold', fontsize=9.5)

plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, 'aug19_top_events.png'), dpi=200)
plt.close()

# Chart 4: OS Breakdown (Unique Users vs Actions)
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
unique_sessions_df = df.drop_duplicates(subset=['session_id'])
os_user_counts = unique_sessions_df['session_os'].value_counts()
os_action_counts = df['os'].value_counts()

colors = ['#10B981', '#3B82F6', '#64748B', '#F59E0B']
ax1.pie(os_user_counts, labels=[f'{k}\n({v} users, {v/len(unique_sessions_df)*100:.1f}%)' for k, v in os_user_counts.items()],
        autopct='', colors=colors[:len(os_user_counts)], startangle=140, explode=[0.05]*len(os_user_counts))
ax1.set_title('Unique Participants by OS (N=63)', fontsize=13, fontweight='bold')

ax2.pie(os_action_counts, labels=[f'{k}\n({v:,} actions, {v/len(df)*100:.1f}%)' for k, v in os_action_counts.items()],
        autopct='', colors=colors[:len(os_action_counts)], startangle=140, explode=[0.05]*len(os_action_counts))
ax2.set_title('Total Action Volume by OS (N=9,131)', fontsize=13, fontweight='bold')

plt.suptitle('Operating System Distribution — Field Workshop 19 Aug 2026', fontsize=14, fontweight='bold', y=0.98)
plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, 'aug19_device_os.png'), dpi=200)
plt.close()

# Chart 5: Mobile Screen Sizes by Unique Users
fig, ax = plt.subplots(figsize=(10, 6))
mobile_sessions = unique_sessions_df[unique_sessions_df['session_os'].isin(['Android', 'iOS'])]
screen_counts = mobile_sessions['session_screen'].value_counts().reset_index()
screen_counts.columns = ['screen_size', 'users']
screen_counts = screen_counts[screen_counts['screen_size'] != 'Unknown'].head(10).sort_values('users', ascending=True)

bars = ax.barh(screen_counts['screen_size'], screen_counts['users'], color='#EC4899', edgecolor='black', alpha=0.9)
ax.set_title('Top 10 Mobile Screen Resolutions of Elderly Learners (Unique Devices)', fontsize=14, fontweight='bold', pad=15)
ax.set_xlabel('Unique Devices / Users', fontsize=12)
ax.set_ylabel('Screen Resolution (Width x Height px)', fontsize=12)
for bar in bars:
    w = bar.get_width()
    ax.text(w + 0.15, bar.get_y() + bar.get_height()/2, f'{int(w)} users', ha='left', va='center', fontweight='bold')

plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, 'aug19_screen_sizes.png'), dpi=200)
plt.close()

# Chart 6: Minigame Accuracy & Performance
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5.5))

# Minigame Questions Accuracy
q_df = df[df['event_name'] == 'answer_question'].copy()
q_df['is_correct'] = q_df['p'].apply(lambda x: x.get('is_correct'))
q_df['game_id'] = q_df['p'].apply(lambda x: x.get('game_id', 'Unknown'))

game_acc = q_df.groupby('game_id').agg(
    total=('is_correct', 'count'),
    correct=('is_correct', lambda x: (x == True).sum()),
    incorrect=('is_correct', lambda x: (x == False).sum())
).reset_index()

game_acc['acc_rate'] = (game_acc['correct'] / game_acc['total']) * 100
game_labels = {'g1': 'G1: Fact Check', 'g3': 'G3: Deepfake AI', 'g6': 'G6: LINE Scam', 'flow-g13': 'G13: Ice Cream QA'}
game_acc['game_label'] = game_acc['game_id'].map(lambda x: game_labels.get(x, x))

bar_c = ax1.bar(game_acc['game_label'], game_acc['correct'], label='Correct', color='#10B981', alpha=0.9, edgecolor='black')
bar_i = ax1.bar(game_acc['game_label'], game_acc['incorrect'], bottom=game_acc['correct'], label='Incorrect', color='#EF4444', alpha=0.9, edgecolor='black')
ax1.set_title('Answer Accuracy by Minigame (QA Questions)', fontsize=13, fontweight='bold')
ax1.set_ylabel('Total Answers Submitted', fontsize=11)
ax1.legend(loc='upper right')

for idx, row in game_acc.iterrows():
    tot = row['total']
    acc = row['acc_rate']
    ax1.text(idx, tot + 5, f'{acc:.1f}% Correct\n({row["correct"]}/{tot})', ha='center', va='bottom', fontweight='bold', fontsize=9.5)

# Ice Cream Game Mechanics Stats
g13_events = df[df['event_name'].isin(['scoop_catch', 'bomb_dodge', 'double_catch', 'bomb_hit', 'scoop_miss'])]
g13_summary = g13_events.groupby('event_name').agg(count=('id', 'count'), users=('session_id', 'nunique')).reset_index()
event_color_map = {
    'scoop_catch': '#10B981',
    'bomb_dodge': '#3B82F6',
    'double_catch': '#8B5CF6',
    'bomb_hit': '#EF4444',
    'scoop_miss': '#F59E0B'
}
g13_summary['color'] = g13_summary['event_name'].map(lambda x: event_color_map.get(x, '#64748B'))
g13_summary = g13_summary.sort_values('count', ascending=False)

bars2 = ax2.bar(g13_summary['event_name'], g13_summary['count'], color=g13_summary['color'], alpha=0.9, edgecolor='black')
ax2.set_title('Ice Cream Game (G13) Mechanics Interaction', fontsize=13, fontweight='bold')
ax2.set_ylabel('Event Count', fontsize=11)
ax2.tick_params(axis='x', rotation=25)

for bar in bars2:
    h = bar.get_height()
    ax2.text(bar.get_x() + bar.get_width()/2, h + 30, f'{int(h):,}', ha='center', va='bottom', fontweight='bold', fontsize=9.5)

plt.suptitle('Educational Effectiveness & Gameplay Performance', fontsize=15, fontweight='bold', y=0.98)
plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, 'aug19_game_accuracy.png'), dpi=200)
plt.close()

# Chart 7: Video Engagement & Network Handling
fig, ax = plt.subplots(figsize=(9, 5))
video_ev = df[df['event_name'].isin(['enter_video', 'play_video', 'video_complete', 'video_slow_load_shown', 'video_skip_slow_load', 'video_auto_advance'])]
v_summary = video_ev.groupby('event_name').agg(total=('id', 'count'), users=('session_id', 'nunique')).reset_index().sort_values('total', ascending=False)

v_colors = ['#3B82F6', '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
bars = ax.bar(v_summary['event_name'], v_summary['total'], color=v_colors[:len(v_summary)], edgecolor='black', alpha=0.9)
ax.set_title('Video Engagement & Slow Network Fallback Actions (19 Aug)', fontsize=14, fontweight='bold', pad=15)
ax.set_ylabel('Total Event Count', fontsize=12)
ax.tick_params(axis='x', rotation=25)

for bar, (_, row) in zip(bars, v_summary.iterrows()):
    h = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2, h + 3, f'{int(h)} ({row["users"]} users)', ha='center', va='bottom', fontweight='bold', fontsize=9.5)

plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, 'aug19_video_engagement.png'), dpi=200)
plt.close()

# Chart 8: Action Distribution per Session
fig, ax = plt.subplots(figsize=(8.5, 5))
session_actions = df.groupby('session_id')['id'].count()
ax.hist(session_actions, bins=25, color='#14B8A6', edgecolor='black', alpha=0.85)
ax.set_title('Distribution of Actions per Participant Session (12:00 - 16:00)', fontsize=14, fontweight='bold', pad=15)
ax.set_xlabel('Number of Actions Triggered in Session', fontsize=12)
ax.set_ylabel('Number of Participants (Sessions)', fontsize=12)

median_val = session_actions.median()
mean_val = session_actions.mean()
ax.axvline(median_val, color='#EF4444', linestyle='--', linewidth=2, label=f'Median: {median_val:.0f} actions')
ax.axvline(mean_val, color='#3B82F6', linestyle=':', linewidth=2, label=f'Mean: {mean_val:.1f} actions')
ax.legend(fontsize=11)

plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, 'aug19_session_distribution.png'), dpi=200)
plt.close()

print(f"All 8 visualization charts saved successfully to {OUTPUT_DIR}!")
