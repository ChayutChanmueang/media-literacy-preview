import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import json
import os
import sys

# Ensure UTF-8 output on Windows
sys.stdout.reconfigure(encoding='utf-8')

# Set aesthetic styling
plt.style.use('seaborn-v0_8-whitegrid')
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Tahoma', 'Arial']
plt.rcParams['axes.unicode_minus'] = False
TAG = sys.argv[1] if len(sys.argv) > 1 else 'aug18'
CSV_PATH = f'docs/analytics/{TAG}/action_logs.csv'
OUTPUT_DIR = f'docs/analytics/{TAG}'

os.makedirs(OUTPUT_DIR, exist_ok=True)

print(f"Loading {CSV_PATH}...")
df = pd.read_csv(CSV_PATH)
print(f"Loaded {len(df)} records.")

# Parse created_at
df['created_at'] = pd.to_datetime(df['created_at'])
df['date'] = df['created_at'].dt.date
df['hour'] = df['created_at'].dt.hour

# Parse payload safely
def parse_payload(val):
    if pd.isna(val) or not isinstance(val, str):
        return {}
    try:
        return json.loads(val)
    except:
        return {}

df['payload_dict'] = df['payload'].apply(parse_payload)

# Extract device / OS info
def get_os(payload):
    ua = payload.get('userAgent', '')
    if 'Android' in ua:
        return 'Android'
    elif 'iPhone' in ua or 'iPad' in ua or 'Macintosh' in ua and 'Mobile' in ua:
        return 'iOS'
    elif 'Windows' in ua or 'Macintosh' in ua or 'Linux' in ua:
        return 'Desktop'
    else:
        return 'Other/Unknown'

def get_screen_size(payload):
    return payload.get('screenSize', payload.get('screen_size', 'Unknown'))

df['os'] = df['payload_dict'].apply(get_os)
df['screen_size'] = df['payload_dict'].apply(get_screen_size)

# Calculate Key Metrics
total_events = len(df)
total_sessions = df['session_id'].nunique()
min_date = df['created_at'].min()
max_date = df['created_at'].max()

print("\n--- Key Metrics ---")
print(f"Total Action Logs: {total_events}")
print(f"Total Unique Sessions: {total_sessions}")
print(f"Date Range: {min_date} to {max_date}")

# 1. Date Breakdown
date_summary = df.groupby('date').agg(
    total_actions=('id', 'count'),
    unique_players=('session_id', 'nunique')
).reset_index()
print("\n--- Date Breakdown ---")
print(date_summary.to_string(index=False))

# 2. Top Events
top_events = df.groupby('event_name').agg(
    total_count=('id', 'count'),
    unique_users=('session_id', 'nunique')
).reset_index().sort_values(by='total_count', ascending=False)
print("\n--- Top 15 Events ---")
print(top_events.head(15).to_string(index=False))

# 3. User Journey / Page Summary
page_summary = df.groupby('page_url').agg(
    total_actions=('id', 'count'),
    unique_players=('session_id', 'nunique')
).reset_index().sort_values(by='unique_players', ascending=False)
print("\n--- Page / Funnel Summary ---")
print(page_summary.to_string(index=False))

# 4. OS Breakdown
os_summary = df.groupby('os').agg(
    total_actions=('id', 'count'),
    unique_players=('session_id', 'nunique')
).reset_index().sort_values(by='total_actions', ascending=False)
print("\n--- OS Breakdown ---")
print(os_summary.to_string(index=False))

# 5. Screen Size Breakdown (Mobile only)
mobile_df = df[df['os'].isin(['Android', 'iOS'])]
screen_summary = mobile_df.groupby('screen_size').agg(
    unique_players=('session_id', 'nunique'),
    total_actions=('id', 'count')
).reset_index().sort_values(by='unique_players', ascending=False)
print("\n--- Top Mobile Screen Sizes (by Unique Users) ---")
print(screen_summary.head(10).to_string(index=False))

# 6. Video Engagement
video_events = df[df['event_name'].isin(['enter_video', 'play_video', 'skip_video', 'video_completed'])]
video_summary = video_events.groupby('event_name').agg(
    total_count=('id', 'count'),
    unique_users=('session_id', 'nunique')
).reset_index().sort_values(by='total_count', ascending=False)
print("\n--- Video Engagement ---")
print(video_summary.to_string(index=False))


# -------------------------------------------------------------
# Generate Visualizations
# -------------------------------------------------------------

# Chart 1: Player Summary / Funnel (Unique Players by Page & Minigame)
fig, ax = plt.subplots(figsize=(10, 6))
top_pages = page_summary.head(10).sort_values(by='unique_players', ascending=True)
bars = ax.barh(top_pages['page_url'], top_pages['unique_players'], color='#3B82F6')
ax.set_title('Unique Players by Page & Route (Master Dataset)', fontsize=14, fontweight='bold', pad=15)
ax.set_xlabel('Unique Players', fontsize=12)
ax.set_ylabel('Page Route', fontsize=12)
for bar in bars:
    width = bar.get_width()
    ax.text(width + 1, bar.get_y() + bar.get_height()/2, f'{int(width)}', ha='left', va='center', fontweight='bold')
plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, f'{TAG}_player_summary.png'), dpi=200)
plt.close()

# Chart 2: Timeline of Event Activity (Daily Timeline)
fig, ax = plt.subplots(figsize=(12, 5))
dates_str = [d.strftime('%m-%d') for d in date_summary['date']]
ax.plot(dates_str, date_summary['total_actions'], marker='o', linewidth=2.5, color='#8B5CF6', label='Total Actions')
ax2 = ax.twinx()
ax2.bar(dates_str, date_summary['unique_players'], alpha=0.3, color='#10B981', width=0.4, label='Unique Players')
ax.set_title('Timeline of Event Activity & Active Learners', fontsize=14, fontweight='bold', pad=15)
ax.set_xlabel('Date', fontsize=12)
ax.set_ylabel('Total Event Actions', fontsize=12, color='#8B5CF6')
ax2.set_ylabel('Unique Players', fontsize=12, color='#10B981')
ax.tick_params(axis='x', rotation=45)
plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, f'{TAG}_timeline.png'), dpi=200)
plt.close()

# Chart 3: Top 10 Events Triggered
fig, ax = plt.subplots(figsize=(10, 6))
top10 = top_events.head(10).sort_values(by='total_count', ascending=True)
bars = ax.barh(top10['event_name'], top10['total_count'], color='#F59E0B')
ax.set_title('Top 10 Triggered User Events (Action Logs)', fontsize=14, fontweight='bold', pad=15)
ax.set_xlabel('Total Trigger Count', fontsize=12)
for bar in bars:
    width = bar.get_width()
    ax.text(width + 50, bar.get_y() + bar.get_height()/2, f'{int(width):,}', ha='left', va='center', fontweight='bold')
plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, f'{TAG}_top_events.png'), dpi=200)
plt.close()

# Chart 4: Screen Resolutions (by Unique Users / Sessions)
fig, ax = plt.subplots(figsize=(9, 5.5))
top_screens = screen_summary[screen_summary['screen_size'] != 'Unknown'].head(10).sort_values(by='unique_players', ascending=True)
bars = ax.barh(top_screens['screen_size'], top_screens['unique_players'], color='#EC4899')
ax.set_title('Mobile Screen Resolutions by Unique Users (Elderly Learners)', fontsize=14, fontweight='bold', pad=15)
ax.set_xlabel('Unique Users (Sessions)', fontsize=12)
ax.set_ylabel('Screen Resolution (Width x Height)', fontsize=12)
for bar in bars:
    width = bar.get_width()
    ax.text(width + 0.15, bar.get_y() + bar.get_height()/2, f'{int(width)} Users', ha='left', va='center', fontweight='bold')
plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, f'{TAG}_screen_sizes.png'), dpi=200)
plt.close()

# Chart 5: Video Engagement
fig, ax = plt.subplots(figsize=(8, 5))
if not video_summary.empty:
    bars = ax.bar(video_summary['event_name'], video_summary['total_count'], color=['#3B82F6', '#10B981', '#EF4444', '#8B5CF6'][:len(video_summary)])
    ax.set_title('Video Engagement Analytics', fontsize=14, fontweight='bold', pad=15)
    ax.set_ylabel('Total Count', fontsize=12)
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2, height + 5, f'{int(height)}', ha='center', va='bottom', fontweight='bold')
plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, f'{TAG}_video_engagement.png'), dpi=200)
plt.close()

# Chart 6: Page Engagement
fig, ax = plt.subplots(figsize=(10, 5))
page_eng = page_summary.head(8)
ax.bar(page_eng['page_url'], page_eng['total_actions'], color='#6366F1')
ax.set_title('Total Actions per Page / Minigame Route', fontsize=14, fontweight='bold', pad=15)
ax.set_ylabel('Action Count', fontsize=12)
ax.tick_params(axis='x', rotation=30)
plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, f'{TAG}_page_engagement.png'), dpi=200)
plt.close()

# Chart 7: Session Activity Distribution
fig, ax = plt.subplots(figsize=(8, 5))
session_counts = df.groupby('session_id')['id'].count()
ax.hist(session_counts, bins=30, color='#14B8A6', edgecolor='black')
ax.set_title('Distribution of Actions per User Session', fontsize=14, fontweight='bold', pad=15)
ax.set_xlabel('Number of Actions in Session', fontsize=12)
ax.set_ylabel('Number of Sessions', fontsize=12)
plt.tight_layout()
fig.savefig(os.path.join(OUTPUT_DIR, f'{TAG}_session_distribution.png'), dpi=200)
plt.close()

print(f"\nAnalytics completed and chart images saved successfully in {OUTPUT_DIR}!")
