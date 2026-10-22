import pandas as pd
import json
import sys

# Ensure UTF-8
sys.stdout.reconfigure(encoding='utf-8')

CSV_PATH = 'docs/analytics/aug19/action_logs.csv'
df_all = pd.read_csv(CSV_PATH)
df_all['created_at'] = pd.to_datetime(df_all['created_at'])
if df_all['created_at'].dt.tz is None:
    df_all['created_at_bkk'] = df_all['created_at'].dt.tz_localize('UTC').dt.tz_convert('Asia/Bangkok')
else:
    df_all['created_at_bkk'] = df_all['created_at'].dt.tz_convert('Asia/Bangkok')

mask_date = (df_all['created_at_bkk'].dt.year == 2026) & (df_all['created_at_bkk'].dt.month == 8) & (df_all['created_at_bkk'].dt.day == 19)
t_start = pd.to_datetime('12:00:00').time()
t_end = pd.to_datetime('16:00:00').time()
mask_time = (df_all['created_at_bkk'].dt.time >= t_start) & (df_all['created_at_bkk'].dt.time <= t_end)

df = df_all[mask_date & mask_time].copy()

def parse_payload(val):
    if pd.isna(val) or not isinstance(val, str): return {}
    try: return json.loads(val)
    except: return {}

df['p'] = df['payload'].apply(parse_payload)

def get_os(p):
    ua = p.get('userAgent', '')
    if 'Android' in ua: return 'Android'
    elif 'iPhone' in ua or 'iPad' in ua: return 'iOS'
    elif 'Windows' in ua or 'Macintosh' in ua or 'Linux' in ua: return 'Desktop / PC'
    return 'Other'

df['os'] = df['p'].apply(get_os)
df['screen_size'] = df['p'].apply(lambda p: p.get('screenSize', p.get('screen_size', 'Unknown')))

session_os = df.groupby('session_id')['os'].agg(lambda x: x.mode().iloc[0] if not x.empty else 'Unknown').to_dict()
df['session_os'] = df['session_id'].map(session_os)

stats = {}
stats['total_actions'] = int(len(df))
stats['unique_sessions'] = int(df['session_id'].nunique())
stats['time_range'] = [str(df['created_at_bkk'].min()), str(df['created_at_bkk'].max())]

# OS Breakdown
stats['os_sessions'] = df.groupby('session_os')['session_id'].nunique().to_dict()
stats['os_actions'] = df['os'].value_counts().to_dict()

# Demographics
c_df = df[df['event_name'] == 'consent_submitted']
stats['demographics'] = {
    'age_range': c_df['p'].apply(lambda x: x.get('age_range', 'Unknown')).value_counts().to_dict(),
    'province': c_df['p'].apply(lambda x: x.get('province', 'Unknown')).value_counts().to_dict(),
    'district': c_df['p'].apply(lambda x: x.get('district', 'Unknown')).value_counts().to_dict(),
    'sub_district': c_df['p'].apply(lambda x: x.get('sub_district', 'Unknown')).value_counts().to_dict(),
}

# Funnel Pages
page_stats = df.groupby('page_url').agg(
    users=('session_id', 'nunique'),
    actions=('id', 'count')
).reset_index().sort_values('users', ascending=False)
stats['pages'] = page_stats.to_dict(orient='records')

# Events
event_stats = df.groupby('event_name').agg(
    users=('session_id', 'nunique'),
    actions=('id', 'count')
).reset_index().sort_values('actions', ascending=False)
stats['events'] = event_stats.to_dict(orient='records')

# Question accuracy
q_df = df[df['event_name'] == 'answer_question'].copy()
q_df['gid'] = q_df['p'].apply(lambda x: x.get('game_id', 'Unknown'))
q_df['qid'] = q_df['p'].apply(lambda x: x.get('question_id', 'Unknown'))
q_df['is_correct'] = q_df['p'].apply(lambda x: x.get('is_correct'))
q_acc = q_df.groupby(['gid', 'qid']).agg(
    total=('is_correct', 'count'),
    correct=('is_correct', lambda x: bool((x == True).sum())),
    correct_count=('is_correct', lambda x: int((x == True).sum())),
    incorrect_count=('is_correct', lambda x: int((x == False).sum()))
).reset_index()
stats['questions'] = q_acc.to_dict(orient='records')

# G6 Scenario responses
resp_df = df[df['event_name'] == 'select_response'].copy()
resp_df['sid'] = resp_df['p'].apply(lambda x: x.get('scenario_id', 'Unknown'))
resp_df['safe'] = resp_df['p'].apply(lambda x: x.get('is_safe'))
resp_acc = resp_df.groupby('sid').agg(
    total=('safe', 'count'),
    safe_count=('safe', lambda x: int((x == True).sum())),
    unsafe_count=('safe', lambda x: int((x == False).sum()))
).reset_index()
stats['scenarios'] = resp_acc.to_dict(orient='records')

# Screen sizes
mobile_sessions = df.drop_duplicates('session_id')
mobile_sessions = mobile_sessions[mobile_sessions['session_os'].isin(['Android', 'iOS'])]
stats['screen_sizes'] = mobile_sessions['screen_size'].value_counts().head(15).to_dict()

# Session Duration
s_agg = df.groupby('session_id').agg(
    start=('created_at_bkk', 'min'),
    end=('created_at_bkk', 'max'),
    actions=('id', 'count')
)
s_agg['duration_min'] = (s_agg['end'] - s_agg['start']).dt.total_seconds() / 60.0
stats['session_duration'] = {
    'mean_min': round(float(s_agg['duration_min'].mean()), 2),
    'median_min': round(float(s_agg['duration_min'].median()), 2),
    'max_min': round(float(s_agg['duration_min'].max()), 2),
    'p75_min': round(float(s_agg['duration_min'].quantile(0.75)), 2),
    'actions_mean': round(float(s_agg['actions'].mean()), 2),
    'actions_median': round(float(s_agg['actions'].median()), 2),
}

with open('docs/analytics/aug19/summary_stats.json', 'w', encoding='utf-8') as f:
    json.dump(stats, f, ensure_ascii=False, indent=2)

print("Saved docs/analytics/aug19/summary_stats.json successfully!")
