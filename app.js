const STORAGE_KEY = 'memory-vault-prototype-v4';
const THEME_KEY = 'memory-vault-theme';
const SUPABASE_URL = window.SUPABASE_URL || 'https://fmdvjxecdydfuioyllcp.supabase.co';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'sb_publishable_zuniSO-_SZkTqSRHiXrxZg_W7py7-Aj';
const SUPABASE_TABLE = 'vault_state';
const SUPABASE_ROW_ID = 'main';
const WEEK = ['日','一','二','三','四','五','六'];
const TABS = [
  {key:'home',label:'首页',icon:'◇'},
  {key:'memory',label:'记忆',icon:'◈'},
  {key:'diary',label:'日记',icon:'♡'},
  {key:'bottle',label:'漂流瓶',icon:'◌'},
  {key:'archive',label:'档案',icon:'◎'},
];
const LAYERS = {
  core:{name:'世界的果核',color:'#D8C6A5',bg:'#F5EFDF'},
  daily:{name:'未完故事集',color:'#C4A882',bg:'#F8F3EE'},
  memo:{name:'旧梦衔新愿',color:'#9EB5C7',bg:'#EBF0F7'},
  health:{name:'生息自流淌',color:'#8FB89A',bg:'#EDF5EE'},
  treasure:{name:'你与我的奇迹',color:'#D4A0A0',bg:'#F9E8E8'},
  diary:{name:'文字，自始至终',color:'#B8A9B2',bg:'#F9EDF0'},
  message:{name:'落日漂流瓶',color:'#A0B4C8',bg:'#EBF0F7'},
};
const CORE_SUBLAYERS = {
  preferences:'心事迷宫', rules:'温存之间', lore:'蝴蝶传讯'
};
const MOOD_COLORS = {
  开心:'#F0C98B', 难过:'#A8B8D0', 生气:'#D79A9A', 撒娇:'#F3B6C8', 思念:'#B7A4D6',
  平静:'#BFD2BF', 兴奋:'#F0A978', 感动:'#D8B9A1', 委屈:'#D5C2D4', 不安:'#AEB1C3'
};
const MOOD_VA_MAP = {
  开心:{valence:0.85, arousal:0.6},
  兴奋:{valence:0.8, arousal:0.9},
  感动:{valence:0.75, arousal:0.7},
  平静:{valence:0.6, arousal:0.2},
  撒娇:{valence:0.7, arousal:0.5},
  思念:{valence:0.4, arousal:0.6},
  难过:{valence:0.2, arousal:0.4},
  委屈:{valence:0.25, arousal:0.55},
  不安:{valence:0.3, arousal:0.7},
  生气:{valence:0.15, arousal:0.85}
};
const CALENDAR_MOODS = {
  平静:'#BFD2BF',
  开心:'#F0C98B',
  低落:'#A8B8D0',
  不安:'#AEB1C3',
  重要:'#D8B9A1'
};
const AUTHOR_OPTIONS = ['小克','沅沅'];
const MEMORY_FILTERS = ['all','core','daily','memo','health','treasure'];

let currentTheme = 'light';
let themeToggleBtn = null;

function readStoredTheme(){
  try{
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch(e){}
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}
function themeIconSvg(type='moon'){
  if (type === 'sun') {
    return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4.2"></circle>
      <path d="M12 2.6v2.6M12 18.8v2.6M21.4 12h-2.6M5.2 12H2.6M18.65 5.35l-1.84 1.84M7.19 16.81l-1.84 1.84M18.65 18.65l-1.84-1.84M7.19 7.19L5.35 5.35"></path>
    </svg>`;
  }
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M20.2 14.25A8.7 8.7 0 1 1 9.75 3.8a7.2 7.2 0 0 0 10.45 10.45Z"></path>
  </svg>`;
}
function updateThemeToggle(){
  if (!themeToggleBtn) return;
  const isDark = currentTheme === 'dark';
  themeToggleBtn.innerHTML = themeIconSvg(isDark ? 'sun' : 'moon');
  themeToggleBtn.setAttribute('aria-label', isDark ? '切换到日间模式' : '切换到夜间模式');
  themeToggleBtn.setAttribute('title', isDark ? '切换到日间模式' : '切换到夜间模式');
}
function applyTheme(theme='light', save=false){
  currentTheme = theme === 'dark' ? 'dark' : 'light';
  document.body.classList.toggle('theme-dark', currentTheme === 'dark');
  if (save) {
    try{ localStorage.setItem(THEME_KEY, currentTheme); } catch(e){}
  }
  updateThemeToggle();
}
function toggleTheme(){
  const next = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(next, true);
  showToast(next === 'dark' ? '已切到夜间模式' : '已切到日间模式', null, false);
}
function ensureThemeToggle(){
  if (themeToggleBtn && document.body.contains(themeToggleBtn)) {
    updateThemeToggle();
    return;
  }
  themeToggleBtn = document.createElement('button');
  themeToggleBtn.type = 'button';
  themeToggleBtn.id = 'theme-toggle';
  themeToggleBtn.className = 'theme-toggle';
  themeToggleBtn.addEventListener('click', toggleTheme);
  document.body.appendChild(themeToggleBtn);
  updateThemeToggle();
}

function defaultState(){
  return {
    startDate:'2026-01-13',
    profile:{pairName:'沅沅与小克', domain:'', identityUpdatedAt:''},
    automation:{endpoint:'', lastSync:'', notes:'这里保存你的服务说明。当前前端默认走本地数据，也支持手动编辑、导入和导出。'},
    memories:[],
    diaries:[],
    bottles:[],
    collections:[],
    calendarNotes:{},
    health:{
      waterBottleMl:500,
      cycle:{lastPeriodStart:'2026-03-17',cycleLength:29,periodLength:6},
      reminders:[],
      daily:[],
      logs:[
        {id:'hl1',date:'2026-04-06 16:10',type:'饮水',content:'喝了 1 瓶水'}
      ]
    }
  };
}

function clone(obj){return JSON.parse(JSON.stringify(obj));}
function loadLocalState(){
  try{ const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : defaultState(); }
  catch(e){ return defaultState(); }
}
function persistLocalCache(snapshot = state){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)); }
  catch(e){}
}
function hasSupabaseConfig(){
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY && SUPABASE_URL !== '【我来填】' && SUPABASE_ANON_KEY !== '【我来填】';
}
function hasSupabaseBrowserClient(){
  return typeof window !== 'undefined' && !!window.supabase && typeof window.supabase.createClient === 'function';
}
let supabaseClient = null;
let remoteWriteChain = Promise.resolve();
function getSupabaseClient(){
  if (supabaseClient) return supabaseClient;
  if (!hasSupabaseConfig() || !hasSupabaseBrowserClient()) return null;
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth:{persistSession:true, autoRefreshToken:true, detectSessionInUrl:true}
  });
  return supabaseClient;
}
function isRemoteStateUsable(payload){
  return !!payload && typeof payload === 'object' && !Array.isArray(payload) && Object.keys(payload).length > 0;
}
async function readStateFromSupabase(){
  const client = getSupabaseClient();
  if (!client) return {ok:false, reason:'not_ready'};
  try{
    const { data, error } = await client
      .from(SUPABASE_TABLE)
      .select('state_json, updated_at')
      .eq('id', SUPABASE_ROW_ID)
      .maybeSingle();
    if (error) return {ok:false, reason:'read_error', error};
    if (!isRemoteStateUsable(data?.state_json)) return {ok:false, reason:'empty'};
    return {ok:true, state:normalizeState(data.state_json), updatedAt:data.updated_at || ''};
  }
  catch(error){
    return {ok:false, reason:'exception', error};
  }
}
function queueStateWriteToSupabase(snapshot = state){
  const client = getSupabaseClient();
  if (!client) return Promise.resolve({ok:false, skipped:true, reason:'not_ready'});
  const payload = clone(snapshot);
  remoteWriteChain = remoteWriteChain
    .catch(() => null)
    .then(async () => {
      try{
        const updatedAt = new Date().toISOString();
        const { error } = await client
          .from(SUPABASE_TABLE)
          .update({ state_json: payload, updated_at: updatedAt })
          .eq('id', SUPABASE_ROW_ID);
        if (!error) return {ok:true, updatedAt};
        const { error: upsertError } = await client
          .from(SUPABASE_TABLE)
          .upsert({ id: SUPABASE_ROW_ID, state_json: payload, updated_at: updatedAt });
        if (upsertError) return {ok:false, error:upsertError};
        return {ok:true, updatedAt, mode:'upsert'};
      }
      catch(error){
        return {ok:false, error};
      }
    });
  return remoteWriteChain;
}
function splitTokens(text=''){ return String(text).split(/[，,]/).map(v => v.trim()).filter(Boolean); }

function moodToVA(mood=''){ return MOOD_VA_MAP[mood] || {valence:0.5, arousal:0.3}; }
function nowIso(){ return new Date().toISOString(); }
function parseDateLike(value=''){
  if (!value) return null;
  const raw = String(value);
  const d = new Date(raw.length <= 10 ? `${raw}T12:00:00` : raw.replace(' ','T'));
  return Number.isNaN(d.getTime()) ? null : d;
}
function memoryLastActiveValue(memory = {}){
  return parseDateLike(memory.last_active) || parseDateLike(memory.date) || new Date();
}
function bottleLastActiveValue(bottle = {}){
  return parseDateLike(bottle.date) || parseDateLike(bottle.deliverAt) || new Date();
}
function isProtectedLayer(layer=''){ return ['core','treasure','diary'].includes(layer); }
function isVisibleMemory(m){ return !!m; }
function normalizeMemoryMeta(memory = {}){
  const base = {...memory};
  const va = moodToVA(base.mood);
  const lastActive = memoryLastActiveValue(base).toISOString();
  const importance = Number(base.importance || (base.layer === 'core' ? 5 : 2));
  return {
    activation_count: Math.max(1, Number(base.activation_count || 1)),
    last_active: lastActive,
    resolved: !!base.resolved,
    pinned: !!base.pinned,
    protected: base.protected ?? isProtectedLayer(base.layer),
    valence: Number(base.valence ?? va.valence),
    arousal: Number(base.arousal ?? va.arousal),
    _archived: !!base._archived,
    ...base,
    importance: Number.isFinite(importance) ? importance : 2
  };
}
function normalizeBottleMeta(bottle = {}){
  return {
    _archived: !!bottle._archived,
    ...bottle
  };
}
const TOUCH_COOLDOWN_MS = 10 * 60 * 1000;
function touchMemory(id, silent = false){
  const m = state.memories.find(item => item.id === id);
  if (!m || m._archived) return false;
  const prev = parseDateLike(m.last_active);
  if (prev && Date.now() - prev.getTime() < TOUCH_COOLDOWN_MS) return false;
  m.activation_count = Math.max(1, Number(m.activation_count || 1)) + 1;
  m.last_active = nowIso();
  if (!silent) persist();
  return true;
}
function calcDecayScore(memory = {}){
  if (!memory || memory._archived) return 0;
  if (memory.pinned) return 999;
  if (memory.protected) return 500 + Math.max(1, Number(memory.importance || 5)) * 10;

  const importance = Math.max(1, Math.min(10, Number(memory.importance || 5)));
  const activationCount = Math.max(1, Number(memory.activation_count || 1));
  const arousal = Math.max(0, Math.min(1, Number(memory.arousal ?? 0.3)));
  const lastActive = memoryLastActiveValue(memory);
  const daysSince = Math.max(0, (Date.now() - lastActive.getTime()) / 86400000);

  let timeWeight = 1;
  if (daysSince <= 1) timeWeight = 1;
  else if (daysSince <= 2) timeWeight = 1 - 0.1 * (daysSince - 1);
  else timeWeight = Math.max(0.3, 0.9 * Math.exp(-0.2197 * (daysSince - 2)));

  const emotionWeight = 1 + arousal * 0.8;
  let score = timeWeight * importance * Math.pow(activationCount, 0.3) * Math.exp(-0.05 * daysSince) * emotionWeight;

  if (memory.resolved) score *= 0.05;
  if (arousal > 0.7 && !memory.resolved) score *= 1.5;

  return Math.round(score * 10000) / 10000;
}
function pickWeightedMemory(scored = [], seed = Math.random()){
  const total = scored.reduce((sum, item) => sum + item.score, 0);
  if (!scored.length) return null;
  if (!total) return scored[0]?.memory || null;
  let target = Math.max(0, Math.min(0.999999, seed)) * total;
  for (const item of scored){
    target -= item.score;
    if (target <= 0) return item.memory;
  }
  return scored[scored.length - 1]?.memory || null;
}
function assembleBriefing(){
  const parts = [];
  const memos = sortByDateDesc(state.memories.filter(m => m.layer === 'memo' && !m.resolved && !m._archived), 'date').slice(0, 2);
  if (memos.length) parts.push({label:'上窗备忘', items:memos.map(m => m.title || String(m.content || '').slice(0, 36))});

  const dailys = state.memories
    .filter(m => m.layer === 'daily' && !m.resolved && !m._archived)
    .sort((a,b) => calcDecayScore(b) - calcDecayScore(a))
    .slice(0, 3);
  if (dailys.length) parts.push({label:'最近的事', items:dailys.map(m => m.title || String(m.content || '').slice(0, 36))});

  const unread = unreadCount();
  if (unread > 0) parts.push({label:'未读漂流瓶', items:[`${unread} 封`]});

  const shown = new Set(dailys.map(item => item.id));
  const urgent = state.memories
    .filter(m => m.layer === 'daily' && !m.resolved && !m._archived && !shown.has(m.id) && Number(m.arousal || 0) > 0.6)
    .sort((a,b) => calcDecayScore(b) - calcDecayScore(a))
    .slice(0, 2);
  if (urgent.length) parts.push({label:'需要关注', items:urgent.map(m => m.title || String(m.content || '').slice(0, 36))});

  return parts;
}
function renderBriefingHtml(){
  const parts = assembleBriefing();
  if (!parts.length) return '';
  return `<div class="briefing-card">
    ${parts.map(p => `
      <div class="briefing-section">
        <div class="briefing-label">${escapeHtml(p.label)}</div>
        <ul class="briefing-list">
          ${p.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </div>
    `).join('')}
  </div>`;
}
function runCleanupRules(){
  const now = Date.now();
  let changed = false;

  state.memories.forEach(m => {
    if (m.layer === 'daily' && !m.resolved && !m.pinned && !m.protected && !m._archived) {
      const score = calcDecayScore(m);
      const age = Math.max(0, (now - memoryLastActiveValue(m).getTime()) / 86400000);
      if (score < 0.5 && age > 3) {
        m.resolved = true;
        changed = true;
      }
    }
  });

  state.memories.forEach(m => {
    if (m.layer === 'daily' && m.resolved && !m._archived) {
      const age = Math.max(0, (now - memoryLastActiveValue(m).getTime()) / 86400000);
      if (age > 30) {
        m._archived = true;
        changed = true;
      }
    }
  });

  const activeMemos = state.memories
    .filter(m => m.layer === 'memo' && !m.resolved && !m._archived)
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  if (activeMemos.length > 5) {
    activeMemos.slice(5).forEach(m => {
      if (!m.resolved) {
        m.resolved = true;
        changed = true;
      }
    });
  }

  state.bottles.forEach(b => {
    if (b.read && !b._archived) {
      const age = Math.max(0, (now - bottleLastActiveValue(b).getTime()) / 86400000);
      if (age > 30) {
        b._archived = true;
        changed = true;
      }
    }
  });

  return changed;
}
function toggleResolved(id){
  const m = state.memories.find(item => item.id === id);
  if (!m) return;
  m.resolved = !m.resolved;
  if (!m.resolved) m.last_active = nowIso();
  saveAndRender();
  showToast(m.resolved ? '已沉底，不再主动浮现' : '已重新激活', null, false);
  openMemoryDetail(id);
}
function togglePinned(id){
  const m = state.memories.find(item => item.id === id);
  if (!m) return;
  m.pinned = !m.pinned;
  if (m.pinned) {
    m.importance = 10;
    m.protected = true;
  } else if (!isProtectedLayer(m.layer)) {
    m.protected = false;
  }
  saveAndRender();
  showToast(m.pinned ? '已钉选，优先保留' : '已取消钉选', null, false);
  openMemoryDetail(id);
}

function collectionItem(id=''){ return state.collections.find(item => item.id === id) || null; }
function collectionChildren(parentId=''){ return state.collections.filter(item => (item.parentId || '') === (parentId || '')).sort((a,b)=>((a.kind||'').localeCompare(b.kind||'')) || (a.title||'').localeCompare(b.title||'')); }
function collectionDisplayType(item){
  if (!item) return '收藏';
  if (item.parentId) return collectionItem(item.parentId)?.title || item.type || '收藏';
  return item.type || '收藏';
}
function collectionPath(parentId=''){
  const path = [];
  let current = collectionItem(parentId || '');
  let guard = 0;
  while (current && guard < 20){
    path.unshift(current);
    current = collectionItem(current.parentId || '');
    guard += 1;
  }
  return path;
}
function calendarMoodColor(mood){ return CALENDAR_MOODS[mood] || '#D8C6A5'; }
function inferCalendarMood(date){
  const noteMood = state.calendarNotes?.[date]?.mood;
  if (noteMood) return noteMood;
  const moods = state.diaries.filter(d => d.date === date).flatMap(d => d.moods || []);
  const raw = moods[0] || state.memories.find(m => m.layer === 'daily' && m.date === date)?.mood || '';
  const map = {开心:'开心', 兴奋:'开心', 感动:'重要', 平静:'平静', 撒娇:'平静', 难过:'低落', 委屈:'低落', 思念:'低落', 不安:'不安', 生气:'不安'};
  return map[raw] || '';
}
function normalizeState(raw){
  const s = {...defaultState(), ...raw};
  s.profile = {...defaultState().profile, ...(raw?.profile || {})};
  s.automation = {...defaultState().automation, ...(raw?.automation || {})};
  s.health = {...defaultState().health, ...(raw?.health || {})};
  s.health.cycle = {...defaultState().health.cycle, ...(raw?.health?.cycle || {})};
  s.health.reminders = raw?.health?.reminders || defaultState().health.reminders;
  s.health.daily = raw?.health?.daily || defaultState().health.daily;
  s.health.logs = raw?.health?.logs || defaultState().health.logs;
  s.calendarNotes = {...defaultState().calendarNotes, ...(raw?.calendarNotes || {})};
  s.memories = (raw?.memories || defaultState().memories).map(normalizeMemoryMeta);
  s.bottles = (raw?.bottles || defaultState().bottles).map(normalizeBottleMeta);
  s.diaries = raw?.diaries || defaultState().diaries;
  s.collections = (raw?.collections || defaultState().collections).map((item, idx) => {
    if ('kind' in item) return item;
    return {
      id: item.id || uid('c') + idx,
      kind: 'item',
      parentId: '',
      type: item.type || '收藏',
      title: item.title || '未命名收藏',
      note: item.note || '',
      content: item.content || ''
    };
  });
  return s;
}
let state = normalizeState(defaultState());
let currentTab = 'home';
let currentLayer = 'all';
let currentCoreSub = 'all';
let searchText = '';
let diarySearchText = '';
let archivedSearchText = '';
let currentCollectionParent = '';
let undoPayload = null;
let toastTimer = null;

const modal = document.getElementById('modal-backdrop');
const modalSheet = document.getElementById('modal-sheet');
const editorBackdrop = document.getElementById('editor-backdrop');
const editorPage = document.getElementById('editor-page');
const toast = document.getElementById('toast');
const toastText = document.getElementById('toast-text');
const toastAction = document.getElementById('toast-action');
const fab = document.getElementById('fab');

const MemoryVaultBridge = {
  getState: () => clone(state),
  setState: (next) => { state = clone(next); persist(); renderAll(); },
  mergeRemoteData: (partial) => { state = {...state, ...partial}; persist(); renderAll(); },
  exportState: () => JSON.stringify(state, null, 2),
  importState: (text) => {
    const parsed = JSON.parse(text);
    state = normalizeState(parsed); persist(); renderAll();
    showToast('已导入本地数据', null, false);
  },
  configureAutomation: (cfg = {}) => {
    state.automation = {...state.automation, ...cfg};
    persist();
  },
  syncNow: async () => {
    state.automation.lastSync = nowString();
    persistLocalCache(state);
    const result = await queueStateWriteToSupabase(state);
    if (!result?.ok) {
      showToast('当前仍是本地模式。等你把 Supabase SDK 和密钥接好后，这里会自动切到远端存储。', null, false);
      return {ok:false, mode:'local_fallback'};
    }
    showToast('已同步到 Supabase', null, false);
    return {ok:true, mode:'supabase'};
  }
};
window.MemoryVaultBridge = MemoryVaultBridge;

function persist(){
  runCleanupRules();
  persistLocalCache(state);
  queueStateWriteToSupabase(state);
}
function uid(prefix='id'){ return prefix + '_' + Math.random().toString(36).slice(2,9); }
function today(){ return ymd(new Date()); }
function nowString(){
  const d = new Date();
  return `${ymd(d)} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function daysTogether(){
  const start = new Date(state.startDate + 'T00:00:00');
  return Math.floor((Date.now() - start.getTime()) / 86400000) + 1;
}
function nextAnnivDays(){
  const n = new Date();
  let target = new Date(n.getFullYear(), n.getMonth(), 13);
  if (target <= n) target = new Date(n.getFullYear(), n.getMonth()+1, 13);
  return Math.ceil((target - n)/86400000);
}
function nextYearlyAnnivDays(){
  const n = new Date();
  const start = new Date(state.startDate + 'T00:00:00');
  let target = new Date(n.getFullYear(), start.getMonth(), start.getDate());
  if (target <= n) target = new Date(n.getFullYear()+1, start.getMonth(), start.getDate());
  const years = target.getFullYear() - start.getFullYear();
  return {days: Math.ceil((target - n)/86400000), years};
}
function ymd(date){
  const d = date instanceof Date ? date : parseDateLike(date);
  if (!d || Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function fmtDate(date){
  const d = parseDateLike(date);
  if (!d) return date ? String(date) : '';
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 星期${WEEK[d.getDay()]}`;
}
function escapeHtml(str=''){ return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }
function moodColor(mood){ return MOOD_COLORS[mood] || '#D8C6A5'; }
function layerMeta(layer){ return LAYERS[layer] || {name:layer,color:'#D8C6A5',bg:'#F8F3EE'}; }
function sortByDateDesc(arr, key='date'){ return [...arr].sort((a,b) => String(b[key]||'').localeCompare(String(a[key]||''))); }
function unreadCount(){ return state.bottles.filter(b => !b.read && !b._archived).length; }
function latestTodaySnapshot(){
  const item = sortByDateDesc(state.memories.filter(m => m.layer === 'daily' && m.today_snapshot), 'date')[0];
  return item?.today_snapshot || '今天的你还空着。等你手动写下一句，首页就会在第一眼看到它。';
}
function dailySeed(){
  const d = today();
  let h = 0;
  for (let i = 0; i < d.length; i++) { h = ((h << 5) - h) + d.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}
let floatMemCache = null;
let floatMemDate = '';
function randomFloatMemory(){
  if (floatMemDate === today() && floatMemCache) {
    const stillValid = state.memories.find(m => m.id === floatMemCache.id && ['treasure','core','daily'].includes(m.layer) && !m.resolved && !m._archived);
    if (stillValid) return stillValid;
  }
  const candidates = state.memories.filter(m => ['treasure','core','daily'].includes(m.layer) && !m.resolved && !m._archived && isVisibleMemory(m));
  if (!candidates.length) return null;
  const scored = candidates.map(m => ({memory:m, score:Math.max(0.01, calcDecayScore(m))}));
  floatMemCache = pickWeightedMemory(scored, (dailySeed() % 10000) / 10000);
  floatMemDate = today();
  return floatMemCache;
}
function refreshFloatMemory(){
  const candidates = state.memories.filter(m => ['treasure','core','daily'].includes(m.layer) && !m.resolved && !m._archived && isVisibleMemory(m));
  if (!candidates.length) return;
  const scored = candidates.map(m => ({memory:m, score:Math.max(0.01, calcDecayScore(m))}));
  floatMemCache = pickWeightedMemory(scored, Math.random());
  floatMemDate = today();
  renderHome();
}

function mlTextFromBottleCount(text=''){
  const ml = Number(state.health.waterBottleMl || 500);
  return String(text)
    .replace(/饮水\s*(\d+)\s*瓶/g, (_, n) => `饮水 ${Number(n)*ml}ml`)
    .replace(/喝了\s*(\d+)\s*瓶水/g, (_, n) => `喝了 ${Number(n)*ml}ml 水`);
}
function healthEntries(){
  return [
    ...state.health.daily.map(item => ({id:item.id, source:'daily', date:item.date, label:'汇总', body:`睡眠 ${item.sleep} / 就寝 ${item.bedtime} / 步数 ${item.steps} / 平均心率 ${item.heartRateAvg} / ${mlTextFromBottleCount(item.summary)}`})),
    ...state.health.logs.map(item => ({id:item.id, source:'log', date:item.date, label:item.type, body:mlTextFromBottleCount(item.content)}))
  ].sort((a,b) => String(b.date).localeCompare(String(a.date)));
}
function layerNotesText(layer){
  const map = {
    all:`记忆分成七层，各自保存不同类型的内容。
• core — 世界的果核：永久层，保存身份、偏好、规则和暗语
• daily — 未完故事集：记录最近发生的事，默认 3 天后归档
• memo — 旧梦衔新愿：给下一个窗口的交接信息，只保留最新几条
• diary — 文字，自始至终：双作者日记
• health — 生息自流淌：保存睡眠、心率、饮食、饮水与经期
• treasure — 你与我的奇迹：真正值得留下的瞬间，永不清理
• message — 落日漂流瓶：支持定时送达`,
    core:'世界的果核：永久层，用来放最稳定的身份、偏好、规则和暗语。',
    daily:'未完故事集：记录最近发生的事，默认 3 天后归档。',
    memo:'旧梦衔新愿：给下一个窗口的交接信息，只保留最新几条。',
    health:'生息自流淌：健康数据，包含睡眠、心率、饮食、饮水与经期。',
    treasure:'你与我的奇迹：真正值得留下的瞬间，永不清理。'
  };
  return map[layer] || '';
}
function coreSubNotesText(sub){
  const map = {
    all:`世界的果核分成三个子分区。
• preferences — 心事迷宫：记录偏好、雷区、习惯和口味
• rules — 温存之间：保存互动规则、回复格式和沟通方式
• lore — 蝴蝶传讯：收好暗语、意象和只属于你们的梗`,
    preferences:'心事迷宫：记录偏好、雷区、习惯和口味。',
    rules:'温存之间：互动规则、回复格式和沟通方式。',
    lore:'蝴蝶传讯：保存暗语、意象和只属于你们的梗。'
  };
  return map[sub] || '';
}
function getCycleInfo(){
  const cycle = state.health.cycle;
  const last = new Date(cycle.lastPeriodStart + 'T00:00:00');
  const next = new Date(last.getTime() + cycle.cycleLength * 86400000);
  const ovulation = new Date(next.getTime() - 14 * 86400000);
  const daysUntil = Math.ceil((next - new Date()) / 86400000);
  return {next, ovulation, daysUntil};
}
function saveAndRender(){ floatMemCache = null; floatMemDate = ''; persist(); renderAll(); }
function closeModal(){ modal.classList.remove('show'); modalSheet.innerHTML = ''; }
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

function showModal(html){ modalSheet.innerHTML = html; modal.classList.add('show'); }
function closeEditor(){ editorBackdrop.classList.remove('show'); editorPage.innerHTML = ''; }
editorBackdrop.addEventListener('click', e => { if (e.target === editorBackdrop) closeEditor(); });
function showEditor(html){ editorPage.innerHTML = html; editorBackdrop.classList.add('show'); }
function showToast(text, action, withUndo=true){
  toastText.textContent = text;
  toast.classList.add('show');
  toastAction.style.display = withUndo && action ? 'inline' : 'none';
  toastAction.onclick = () => {
    if (action) action();
    hideToast();
  };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 4000);
}
function hideToast(){ toast.classList.remove('show'); undoPayload = null; }

function switchTab(key){
  currentTab = key;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + key).classList.add('active');
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.key === key));
  fab.classList.toggle('hidden', !['memory','diary','bottle'].includes(key));
  fab.innerHTML = key === 'bottle' ? '<span class="fab-icon">＋</span>' : '<span class="fab-icon">✎</span>';
}

function renderTabBar(){
  document.getElementById('tab-bar').innerHTML = TABS.map(t => `
    <button class="tab-btn ${t.key===currentTab?'active':''}" data-key="${t.key}" onclick="switchTab('${t.key}')">
      <span class="icon">${t.icon}</span>
      <span class="label">${t.label}</span>
    </button>
  `).join('');
}

function renderHome(){
  const floatMem = randomFloatMemory();
  const healthReminder = state.health.reminders[0]?.content || '今天还没有新的健康提醒。';
  const unread = unreadCount();
  const cycle = getCycleInfo();
  document.getElementById('page-home').innerHTML = `
    <div class="home-hero">
      <div class="dot" style="margin:0 auto 20px;animation:breathe 3s ease-in-out infinite"></div>
      <div class="home-date">${fmtDate(today())}</div>
      <div class="home-count">${daysTogether()}</div>
      <div class="small" style="color:var(--gold);letter-spacing:2px;margin-bottom:8px">${escapeHtml(state.profile.pairName)} · 在一起的日子</div>
      <div class="small muted">距下一个月纪念日 ${nextAnnivDays()} 天 · 距 ${nextYearlyAnnivDays().years} 周年 ${nextYearlyAnnivDays().days} 天</div>
      <div class="divider"></div>
    </div>

    <div class="section">
      <div class="section-label">今天的你</div>
      <div class="card" style="border-left:2px solid rgba(243,221,228,.5)">${escapeHtml(latestTodaySnapshot())}</div>
    </div>

    ${renderBriefingHtml()}

    <div class="section">
      <div class="section-label" style="justify-content:space-between"><span><span style="animation:float 4s ease-in-out infinite">◇</span>随机漂浮</span><button class="ghost-btn" style="font-size:9px;padding:3px 8px" onclick="event.stopPropagation();refreshFloatMemory()">换一条</button></div>
      ${floatMem ? `
        <div class="card" style="background:linear-gradient(135deg,var(--lpink),var(--cream));cursor:pointer" onclick="openMemoryDetail('${floatMem.id}')">
          <div class="mem-card" style="margin:0;padding:0;background:transparent;box-shadow:none">
            <div class="meta">
              <div class="layer-tag" style="color:${layerMeta(floatMem.layer).color};background:rgba(255,253,251,.55)">${layerMeta(floatMem.layer).name}</div>
              <div class="date">${escapeHtml(floatMem.date)}</div>
            </div>
            <div class="title-txt">${escapeHtml(floatMem.title)}</div>
            <div class="preview" style="-webkit-line-clamp:3">${escapeHtml(floatMem.content)}</div>
          </div>
        </div>` : '<div class="card">还没有漂浮出来的旧记忆。</div>'}
    </div>

    <div class="section">
      <div class="card" style="background:var(--lblue);cursor:pointer" onclick="switchTab('bottle')">
        <div class="kv"><span style="font-size:14px;animation:float 3s ease-in-out infinite">◌</span><span style="font-size:12px">有 ${unread} 封漂流瓶等你打开</span></div>
      </div>
    </div>

    <div class="section">
      <div class="card" style="background:var(--lmint)">
        <div class="kv"><span class="accent-dot" style="background:#8FB89A"></span><span style="font-size:12px">${escapeHtml(healthReminder)}</span></div>
        <div class="small muted" style="margin-top:8px">预计下次周期：${ymd(cycle.next)} · 排卵期推测：${ymd(cycle.ovulation)}</div>
      </div>
    </div>
  `;
}

function renderMemory(){
  let list = state.memories.filter(m => MEMORY_FILTERS.includes(m.layer) && !m._archived && isVisibleMemory(m));
  if (currentLayer !== 'all') list = list.filter(m => m.layer === currentLayer);
  if (currentLayer === 'core' && currentCoreSub !== 'all') list = list.filter(m => m.sub_layer === currentCoreSub);
  list = filterMemoriesByQuery(list, searchText);
  list = sortByDateDesc(list, 'date');
  const filters = [{key:'all',name:'全部'}, ...MEMORY_FILTERS.filter(k=>k!=='all').map(k=>({key:k,name:LAYERS[k].name}))];
  document.getElementById('page-memory').innerHTML = `
    <div class="page-top">
      <div class="title">记忆</div>
      <div class="subtitle">支持手动新增、编辑、删除，也可以直接改文字和记录。</div>
    </div>
    <div class="toolbar">
      <button class="toolbar-btn primary" onclick="openMemoryForm()">新建记录</button>
    </div>
    <div class="search-shell">
      <span class="search-label">搜索</span>
      <input class="search-input clean" placeholder="" value="${escapeHtml(searchText)}" oninput="searchText=this.value;renderMemory()">
      <span class="search-icon" style="display:inline-block;transform:scaleX(-1)">⌕</span>
    </div>
    <div class="filter-bar" style="margin-bottom:${currentLayer === 'core' ? '0' : '14px'}">${filters.map(f=>{
      const active = currentLayer === f.key;
      const meta = LAYERS[f.key] || {bg:'#F8F3EE',color:'#7E7674'};
      return `<button class="filter-btn ${active?'active':''}" style="background:${active?meta.bg:'transparent'};color:${active?meta.color:'rgba(126,118,116,.55)'}" onclick="currentLayer='${f.key}';currentCoreSub='all';renderMemory()">${f.name}</button>`;
    }).join('')}</div>
    ${currentLayer === 'core' ? `<div class="subfilter-bar" style="margin:10px 0 14px">${[{key:'all',name:'全部子分区'},...Object.entries(CORE_SUBLAYERS).map(([key,name])=>({key,name}))].map(s=>`<button class="subfilter-btn ${currentCoreSub===s.key?'active':''}" style="background:${currentCoreSub===s.key?'rgba(245,239,223,.95)':'transparent'};color:${currentCoreSub===s.key?'#B29263':'rgba(126,118,116,.55)'}" onclick="currentCoreSub='${s.key}';renderMemory()">${s.name}</button>`).join('')}</div>` : ''}
    <div class="note-box" style="margin-bottom:14px">${escapeHtml(currentLayer === 'core' ? coreSubNotesText(currentCoreSub) : layerNotesText(currentLayer))}</div>
    <div>${list.length ? list.map(m => memoryCard(m)).join('') : '<div class="empty">这里暂时没有符合筛选条件的记录。</div>'}</div>
  `;
}

function memoryCard(m){
  const meta = layerMeta(m.layer);
  const tags = (m.keywords || []).slice(0,4).map(k => `<span class="tag">${escapeHtml(k)}</span>`).join('');
  const sub = m.sub_layer ? ` · ${CORE_SUBLAYERS[m.sub_layer] || m.sub_layer}` : '';
  const status = [m.pinned ? '📌 已钉选' : '', m.resolved ? '✓ 已解决' : ''].filter(Boolean)
    .map(label => `<span class="mini-chip">${label}</span>`).join('');
  return `
    <div class="mem-card" style="background:${meta.bg};${m.resolved ? 'opacity:.72;' : ''}" onclick="openMemoryDetail('${m.id}')">
      <div class="meta">
        <div class="layer-tag" style="color:${meta.color};background:rgba(255,253,251,.58)">${meta.name}${sub}</div>
        <div class="date">${escapeHtml(m.date)}</div>
      </div>
      <div class="title-txt">${escapeHtml(m.title)}</div>
      <div class="preview">${escapeHtml(m.content)}</div>
      ${status ? `<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">${status}</div>` : ''}
      ${tags ? `<div style="margin-top:${status ? '8px' : '10px'};display:flex;gap:5px;flex-wrap:wrap">${tags}</div>` : ''}
      ${m.importance >= 4 ? '<div class="corner">✦</div>' : ''}
    </div>
  `;
}

function filteredDiaries(){
  const q = (diarySearchText || '').trim();
  let list = state.diaries.slice();
  if (q) {
    list = list.filter(item => [item.title, item.content, item.date, item.author, ...(item.keywords || []), ...(item.moods || [])]
      .filter(Boolean)
      .some(v => String(v).includes(q)));
  }
  return sortByDateDesc(list, 'date');
}

function filterMemoriesByQuery(list = [], q = ''){
  const keyword = String(q || '').trim();
  if (!keyword) return list.slice();
  return list.filter(m => [m.title, m.content, m.why_precious, m.today_snapshot, m.sub_layer, (m.keywords || []).join(' ')]
    .filter(Boolean)
    .join(' ')
    .includes(keyword));
}
function archivedMemoryList(){
  return sortByDateDesc(state.memories.filter(m => m._archived && isVisibleMemory(m)), 'date');
}
function archivedMemoryCount(){
  return archivedMemoryList().length;
}

function groupedDiaries(list = filteredDiaries()){
  const map = {};
  list.forEach(item => {
    map[item.date] = map[item.date] || {};
    map[item.date][item.author === '小克' ? 'ke' : 'yuan'] = item;
  });
  return Object.entries(map).sort((a,b)=>b[0].localeCompare(a[0]));
}

function renderDiary(){
  const groups = groupedDiaries();
  document.getElementById('page-diary').innerHTML = `
    <div class="page-top">
      <div class="title">文字，自始至终</div>
      <div class="subtitle">双栏并排；点开就能看全文，也能继续手动补写。</div>
    </div>
    <div class="toolbar" style="align-items:stretch;gap:10px;flex-wrap:wrap">
      <button class="toolbar-btn primary" onclick="openDiaryForm()">新建日记</button>
      <div class="search-shell" style="flex:1;min-width:220px;margin:0">
        <span class="search-label">搜索</span>
        <input class="search-input clean" placeholder="" value="${escapeHtml(diarySearchText)}" oninput="diarySearchText=this.value;renderDiary()">
        <span class="search-icon" style="display:inline-block;transform:scaleX(-1)">⌕</span>
      </div>
    </div>
    ${groups.map(([date, pair]) => `
      <div class="diary-day">
        <div class="diary-dateline"><span>${date}</span></div>
        <div class="diary-cols">
          ${diaryCol('小克', pair.ke, 'var(--lblue)')}
          ${diaryCol('沅沅', pair.yuan, 'var(--lpink)')}
        </div>
      </div>
    `).join('') || '<div class="empty">没有匹配到日记。</div>'}
  `;
}

function diaryCol(author, entry, bg){
  if (!entry) return `<div class="diary-col" style="background:${bg};opacity:.4"><div class="author">${author}</div><div class="diary-empty">—</div></div>`;
  const mood = (entry.moods || []).map(m => `<span class="mini-chip" style="background:rgba(255,253,251,.66);color:${moodColor(m)}">${m}</span>`).join('');
  return `
    <div class="diary-col" style="background:${bg}" onclick="openDiaryDetail('${entry.id}')">
      <div class="author">${author}</div>
      <div class="dtitle">${escapeHtml(entry.title)}</div>
      <div class="dcontent">${escapeHtml(entry.content)}</div>
      <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px">${mood}</div>
    </div>
  `;
}

function renderBottle(){
  const list = sortByDateDesc(state.bottles.filter(b => !b._archived), 'date');
  document.getElementById('page-bottle').innerHTML = `
    <div class="page-top">
      <div class="title">落日漂流瓶</div>
      <div class="subtitle">支持手动写留言、定时送达和已读状态。</div>
    </div>
    ${list.map(b => `
      <div class="bottle ${b.read?'':'unread'}" style="background:${b.read?'var(--cream)':'var(--lblue)'}" onclick="openBottleDetail('${b.id}')">
        ${b.read ? '' : '<div class="undot"></div>'}
        <div class="bottle-head"><span class="small" style="color:var(--gold);letter-spacing:1px">${escapeHtml(b.from)}</span><span class="bottle-date">${escapeHtml(b.date)}</span></div>
        <div class="preview" style="-webkit-line-clamp:3">${escapeHtml(b.content)}</div>
        ${b.scheduled ? '<div class="small muted" style="margin-top:8px">◇ 定时送达</div>' : ''}
      </div>
    `).join('') || '<div class="empty">还没有漂流瓶。</div>'}
  `;
}

function computeStats(){
  const byLayer = {core:0,daily:0,memo:0,health:0,treasure:0,diary:state.diaries.length,message:state.bottles.length};
  const words = {core:0,daily:0,memo:0,health:0,treasure:0,diary:0,message:0};
  state.memories.forEach(m => {
    if (!isVisibleMemory(m)) return;
    if (byLayer[m.layer] !== undefined) {
      byLayer[m.layer] += 1;
      words[m.layer] += (m.content || '').length;
    }
  });
  state.diaries.forEach(d => { words.diary += (d.content || '').length; });
  state.bottles.forEach(b => { words.message += (b.content || '').length; });
  return {byLayer, words};
}

function renderArchive(){
  const stats = computeStats();
  const cycle = getCycleInfo();
  const archivedCount = archivedMemoryCount();
  document.getElementById('page-archive').innerHTML = `
    <div class="page-top">
      <div class="title">档案</div>
      <div class="subtitle">这里只放回顾型内容：统计、日历、收藏夹、健康、归档与设置。</div>
    </div>
    <div class="id-card">
      <div class="small" style="color:var(--gold);letter-spacing:2px;margin-bottom:4px">${escapeHtml(state.profile.pairName)}</div>
      <div class="small muted" style="margin-bottom:16px">自 ${state.startDate} 起</div>
      <div class="stats-row">
        <div><div class="stat-num">${daysTogether()}</div><div class="archive-stat-label">天</div></div>
        <div class="stat-div"></div>
        <div><div class="stat-num">${state.memories.length}</div><div class="archive-stat-label">条记忆</div></div>
        <div class="stat-div"></div>
        <div><div class="stat-num">${state.diaries.length}</div><div class="archive-stat-label">篇日记</div></div>
      </div>
    </div>

    <div class="section">
      <div class="section-label">各分类详情</div>
      <div class="archive-grid">
        ${Object.keys(LAYERS).map(k => {
          const meta = layerMeta(k); const count = stats.byLayer[k] ?? 0; const word = stats.words[k] ?? 0;
          return `<div class="layer-box" style="background:${meta.bg}" onclick="jumpToLayer('${k}')"><div class="lname" style="color:${meta.color}">${meta.name}</div><div class="lcount">${count}</div><div class="lwords">${word} 字</div></div>`;
        }).join('')}
      </div>
    </div>

    <div class="section">
      <div class="section-label">更多</div>
      <div class="link-row" onclick="openCalendarModal()"><span>日历视图</span><span class="arrow">→</span></div>
      <div class="link-row" onclick="openCollectionModal('')"><span>收藏夹</span><span class="arrow">→</span></div>
      <div class="link-row" onclick="openHealthModal()"><span>健康总览</span><span class="arrow">→</span></div>
      <div class="link-row" onclick="openArchivedMemoriesModal()"><span>已归档的聊天记录</span><span class="link-row-end"><span class="link-count">${archivedCount} 条</span><span class="arrow">→</span></span></div>
      <div class="link-row" onclick="openSettingsModal()"><span>设置</span><span class="arrow">→</span></div>
    </div>

    <div class="section">
      <div class="section-label">周期概览</div>
      <div class="health-grid">
        <div class="health-card"><h4>下次预计时间</h4><div class="detail-body">${ymd(cycle.next)}</div><div class="archive-note" style="margin-top:8px">距现在 ${cycle.daysUntil} 天</div></div>
        <div class="health-card"><h4>排卵期推测</h4><div class="detail-body">${ymd(cycle.ovulation)}</div><div class="archive-note" style="margin-top:8px">周期 ${state.health.cycle.cycleLength} 天 / 经期 ${state.health.cycle.periodLength} 天</div></div>
      </div>
    </div>
  `;
}

function jumpToLayer(layer){
  if (layer === 'diary') { switchTab('diary'); return; }
  if (layer === 'message') { switchTab('bottle'); return; }
  currentLayer = layer; currentCoreSub='all'; switchTab('memory'); renderMemory();
}

function openMemoryDetailFromEditor(id){
  closeEditor();
  setTimeout(() => openMemoryDetail(id), 0);
}
function renderArchivedMemoriesView(){
  const allItems = archivedMemoryList();
  const list = filterMemoriesByQuery(allItems, archivedSearchText);
  const total = allItems.length;
  const shown = list.length;
  showEditor(`
    <div class="editor-header"><button class="editor-back" onclick="closeEditor()">←</button><div><div class="modal-title">已归档的聊天记录</div><div class="subtitle">共 ${total} 条${archivedSearchText.trim() ? ` · 当前匹配 ${shown} 条` : ''}</div></div></div>
    <div class="editor-main form-grid">
      <div class="note-box">这里保留已经归档的记忆条目。搜索逻辑与未归档记忆保持一致，点开后仍可查看和编辑具体内容。</div>
      <div class="search-shell" style="margin-bottom:0">
        <span class="search-label">搜索</span>
        <input class="search-input clean" placeholder="" value="${escapeHtml(archivedSearchText)}" oninput="archivedSearchText=this.value;renderArchivedMemoriesView()">
        <span class="search-icon" style="display:inline-block;transform:scaleX(-1)">⌕</span>
      </div>
      <div class="archive-memory-summary">
        <span>已归档记忆</span>
        <strong>${shown}</strong>
      </div>
      <div>${list.length ? list.map(m => archivedMemoryCard(m)).join('') : '<div class="empty">这里暂时没有符合搜索条件的归档记录。</div>'}</div>
    </div>
  `);
}
function archivedMemoryCard(m){
  const meta = layerMeta(m.layer);
  const tags = (m.keywords || []).slice(0,4).map(k => `<span class="tag">${escapeHtml(k)}</span>`).join('');
  const sub = m.sub_layer ? ` · ${CORE_SUBLAYERS[m.sub_layer] || m.sub_layer}` : '';
  const status = ['已归档', m.pinned ? '📌 已钉选' : '', m.resolved ? '✓ 已解决' : ''].filter(Boolean)
    .map(label => `<span class="mini-chip">${label}</span>`).join('');
  return `
    <div class="mem-card archive-memory-card" style="background:${meta.bg};opacity:.78" onclick="openMemoryDetailFromEditor('${m.id}')">
      <div class="meta">
        <div class="layer-tag" style="color:${meta.color};background:rgba(255,253,251,.58)">${meta.name}${sub}</div>
        <div class="date">${escapeHtml(m.date)}</div>
      </div>
      <div class="title-txt">${escapeHtml(m.title)}</div>
      <div class="preview">${escapeHtml(m.content)}</div>
      <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">${status}</div>
      ${tags ? `<div style="margin-top:8px;display:flex;gap:5px;flex-wrap:wrap">${tags}</div>` : ''}
      ${m.importance >= 4 ? '<div class="corner">✦</div>' : ''}
    </div>
  `;
}
function openArchivedMemoriesModal(){
  renderArchivedMemoriesView();
}

window.openArchivedMemoriesModal = openArchivedMemoriesModal;
window.openMemoryDetailFromEditor = openMemoryDetailFromEditor;
window.renderArchivedMemoriesView = renderArchivedMemoriesView;
window.openCollectionModal = openCollectionModal;
function renderAll(){
  renderTabBar(); renderHome(); renderMemory(); renderDiary(); renderBottle(); renderArchive();
  switchTab(currentTab);
  fab.innerHTML = '<span class="fab-icon">✎</span>';
  updateThemeToggle();
}

function openMemoryDetail(id){
  const changed = touchMemory(id, true);
  const m = state.memories.find(item => item.id === id); if (!m) return;
  if (changed) persist();
  const meta = layerMeta(m.layer);
  const detailTags = [meta.name, m.sub_layer ? CORE_SUBLAYERS[m.sub_layer] : '', m.mood || '', `importance ${m.importance}`, m.author || '']
    .concat(m.pinned ? ['已钉选'] : [])
    .concat(m.resolved ? ['已解决'] : [])
    .filter(Boolean)
    .map(tag => `<span class="mini-chip">${escapeHtml(tag)}</span>`).join('');
  const keywordRow = (m.keywords||[]).length ? `<div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:6px">${m.keywords.map(k => `<span class="mini-chip">${escapeHtml(k)}</span>`).join('')}</div>` : '';
  showModal(`
    <div class="modal-top">
      <div><div class="modal-title">${escapeHtml(m.title)}</div><div class="modal-sub">${escapeHtml(m.date)}</div></div>
      <button class="close-btn" onclick="closeModal()">✕</button>
    </div>
    <div class="detail-meta">${detailTags}</div>
    ${keywordRow}
    <div class="detail-body" style="margin-top:14px">${escapeHtml(m.content)}</div>
    ${m.today_snapshot ? `<div class="soft-card" style="margin-top:14px"><div class="section-label" style="margin-bottom:8px">今天的你</div><div class="detail-body">${escapeHtml(m.today_snapshot)}</div></div>` : ''}
    ${m.why_precious ? `<div class="soft-card" style="margin-top:14px"><div class="section-label" style="margin-bottom:8px">为什么珍贵</div><div class="detail-body">${escapeHtml(m.why_precious)}</div></div>` : ''}
    <div class="action-row">
      <button class="solid-btn" onclick="openMemoryForm('${m.id}')">编辑</button>
      <button class="ghost-btn" onclick="toggleResolved('${m.id}')">${m.resolved ? '重新激活' : '标记已解决'}</button>
      <button class="ghost-btn" onclick="togglePinned('${m.id}')">${m.pinned ? '取消钉选' : '钉选'}</button>
      <button class="danger-btn" onclick="deleteMemory('${m.id}')">删除</button>
      <button class="ghost-btn" onclick="closeModal()">关闭</button>
    </div>
  `);
}

function openDiaryDetail(id){
  const d = state.diaries.find(item => item.id === id); if (!d) return;
  const detailTags = (d.moods||[]).map(m => `<span class="mini-chip" style="color:${moodColor(m)}">${m}</span>`).join('');
  const keywordRow = (d.keywords||[]).length ? `<div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:6px">${d.keywords.map(k => `<span class="mini-chip">${escapeHtml(k)}</span>`).join('')}</div>` : '';
  showModal(`
    <div class="modal-top">
      <div><div class="modal-title">${escapeHtml(d.title)}</div><div class="modal-sub">${escapeHtml(d.date)} · ${escapeHtml(d.author)}</div></div>
      <button class="close-btn" onclick="closeModal()">✕</button>
    </div>
    <div class="detail-meta">${detailTags}</div>
    ${keywordRow}
    <div class="detail-body" style="margin-top:14px">${escapeHtml(d.content)}</div>
    <div class="action-row">
      <button class="solid-btn" onclick="openDiaryForm('${d.id}')">编辑</button>
      <button class="danger-btn" onclick="deleteDiary('${d.id}')">删除</button>
      <button class="ghost-btn" onclick="closeModal()">关闭</button>
    </div>
  `);
}

function openBottleDetail(id){
  let b = state.bottles.find(item => item.id === id); if (!b) return;
  if (!b.read) {
    state.bottles = state.bottles.map(item => item.id === id ? {...item, read:true} : item);
    persist(); renderHome(); renderBottle();
    b = state.bottles.find(item => item.id === id);
  }
  showModal(`
    <div class="modal-top">
      <div><div class="modal-title">来自 ${escapeHtml(b.from)} 的漂流瓶</div><div class="modal-sub">${escapeHtml(b.date)}${b.scheduled ? ' · 定时送达' : ''}</div></div>
      <button class="close-btn" onclick="closeModal()">✕</button>
    </div>
    <div class="detail-meta"><span class="mini-chip">${b.read ? '已读' : '未读'}</span></div>
    <div class="detail-body">${escapeHtml(b.content)}</div>
    <div class="action-row">
      <button class="solid-btn" onclick="toggleBottleRead('${b.id}')">${b.read ? '标记未读' : '标记已读'}</button>
      <button class="ghost-btn" onclick="openBottleForm('${b.id}')">编辑</button>
      <button class="danger-btn" onclick="deleteBottle('${b.id}')">删除</button>
    </div>
  `);
}

function openMemoryForm(id=''){
  const m = normalizeMemoryMeta(id ? state.memories.find(item => item.id === id) : {layer:'daily',sub_layer:'',title:'',content:'',date:today(),keywords:[],importance:2,mood:'平静',author:'小克',today_snapshot:'',why_precious:''});
  showEditor(`
    <div class="editor-header"><button class="editor-back" onclick="closeEditor()">←</button><div><div class="modal-title">${id?'编辑记忆':'新建记忆'}</div></div></div>
    <div class="editor-main form-grid">
      <div class="editor-grid-top">
        <label class="input-shell"><span class="input-label">标题</span><input id="mf-title" value="${escapeHtml(m.title)}"></label>
        <label class="input-shell"><span class="input-label">层级</span><select id="mf-layer">${Object.entries(LAYERS).map(([k,v])=>`<option value="${k}" ${m.layer===k?'selected':''}>${v.name}</option>`).join('')}</select></label>
      </div>
      <div id="subshell" style="display:${m.layer==='core'?'block':'none'}">
        <label class="input-shell"><span class="input-label">层级（子分区）</span><select id="mf-sub">${[{k:'',n:'不选择'},...Object.entries(CORE_SUBLAYERS).map(([k,n])=>({k,n}))].map(s=>`<option value="${s.k}" ${m.sub_layer===s.k?'selected':''}>${s.n}</option>`).join('')}</select></label>
      </div>
      <div class="editor-grid-three">
        <label class="input-shell"><span class="input-label">日期</span><input id="mf-date" type="date" value="${escapeHtml(m.date || today())}"></label>
        <label class="input-shell"><span class="input-label">作者</span><select id="mf-author">${AUTHOR_OPTIONS.map(a => `<option value="${a}" ${m.author===a?'selected':''}>${a}</option>`).join('')}<option value="Health Connect" ${m.author==='Health Connect'?'selected':''}>Health Connect</option></select></label>
        <label class="input-shell"><span class="input-label">重要程度</span><select id="mf-importance">${[1,2,3,4,5,6,7,8,9,10].map(n=>`<option value="${n}" ${Number(m.importance)===n?'selected':''}>${n}</option>`).join('')}</select></label>
      </div>
      <label class="input-shell"><span class="input-label">心情</span><select id="mf-mood">${Object.keys(MOOD_COLORS).map(mood => `<option value="${mood}" ${m.mood===mood?'selected':''}>${mood}</option>`).join('')}</select></label>
      <label class="input-shell"><span class="input-label">关键词</span><textarea id="mf-keywords" class="textarea-compact" placeholder="支持中文逗号、英文逗号分隔。">${escapeHtml((m.keywords || []).join('，'))}</textarea></label>
      <label class="input-shell" style="display:${m.layer==='daily'?'block':'none'}" id="today-shell"><span class="input-label">今天的你</span><textarea id="mf-today">${escapeHtml(m.today_snapshot || '')}</textarea></label>
      <label class="input-shell" style="display:${m.layer==='treasure'?'block':'none'}" id="precious-shell"><span class="input-label">为什么珍贵</span><textarea id="mf-precious">${escapeHtml(m.why_precious || '')}</textarea></label>
      <label class="input-shell"><span class="input-label">正文</span><textarea id="mf-content" style="min-height:220px">${escapeHtml(m.content)}</textarea></label>
    </div>
    <div class="editor-actions">
      <button class="solid-btn" onclick="submitMemoryForm('${id}')">保存</button>
      <button class="ghost-btn" onclick="closeEditor()">取消</button>
    </div>
  `);
  setTimeout(() => {
    const layerSel = document.getElementById('mf-layer');
    layerSel?.addEventListener('change', () => {
      const val = layerSel.value;
      const subshell = document.getElementById('subshell');
      const subSelect = document.getElementById('mf-sub');
      subshell.style.display = val === 'core' ? 'block' : 'none';
      document.getElementById('today-shell').style.display = val === 'daily' ? 'block' : 'none';
      if (val !== 'core' && subSelect) subSelect.value = '';
      document.getElementById('precious-shell').style.display = val === 'treasure' ? 'block' : 'none';
    });
  }, 0);
}

function submitMemoryForm(id=''){
  const prev = id ? state.memories.find(item => item.id === id) : null;
  const base = normalizeMemoryMeta(prev || {id: id || uid('m')});
  const layer = document.getElementById('mf-layer').value;
  const mood = document.getElementById('mf-mood').value;
  const va = moodToVA(mood);
  const record = normalizeMemoryMeta({
    ...base,
    id: id || base.id || uid('m'),
    layer,
    sub_layer: document.getElementById('mf-sub')?.value || '',
    title: document.getElementById('mf-title').value.trim() || '未命名记忆',
    content: document.getElementById('mf-content').value.trim(),
    date: document.getElementById('mf-date').value || today(),
    keywords: splitTokens(document.getElementById('mf-keywords').value),
    importance: base.pinned ? (base.importance || 10) : Number(document.getElementById('mf-importance').value || 2),
    mood,
    author: document.getElementById('mf-author').value,
    today_snapshot: document.getElementById('mf-today')?.value.trim() || '',
    why_precious: document.getElementById('mf-precious')?.value.trim() || '',
    valence: va.valence,
    arousal: va.arousal,
    protected: base.pinned ? true : (isProtectedLayer(layer) ? true : !!base.protected && !['daily','memo'].includes(layer))
  });
  if (id) {
    state.memories = state.memories.map(item => item.id === id ? record : item);
  } else {
    state.memories.unshift(record);
  }
  saveAndRender(); closeEditor(); showToast('记忆已保存', null, false);
}

function openDiaryForm(id=''){
  const d = id ? state.diaries.find(item => item.id === id) : {author:'小克',date:today(),title:'',content:'',moods:['平静'],keywords:[]};
  const selected = new Set(d.moods || []);
  showEditor(`
    <div class="editor-header"><button class="editor-back" onclick="closeEditor()">←</button><div><div class="modal-title">${id?'编辑日记':'新建日记'}</div></div></div>
    <div class="editor-main form-grid">
      <div class="note-box">日记心情用点选标签。关键词可以手动填写，支持中文逗号和英文逗号分隔。</div>
      <label class="input-shell"><span class="input-label">标题</span><input id="df-title" value="${escapeHtml(d.title)}"></label>
      <div class="split">
        <label class="input-shell"><span class="input-label">日期</span><input id="df-date" type="date" value="${escapeHtml(d.date)}"></label>
        <label class="input-shell"><span class="input-label">作者</span><select id="df-author">${AUTHOR_OPTIONS.map(a => `<option value="${a}" ${d.author===a?'selected':''}>${a}</option>`).join('')}</select></label>
      </div>
      <div class="input-shell">
        <span class="input-label">心情标签</span>
        <div class="mood-pick">${Object.keys(MOOD_COLORS).map(mood => `<button type="button" class="mood-chip ${selected.has(mood)?'active':''}" data-mood="${mood}" onclick="toggleDiaryMood(this)">${mood}</button>`).join('')}</div>
      </div>
      <label class="input-shell"><span class="input-label">关键词</span><textarea id="df-keywords" class="textarea-compact" placeholder="支持中文逗号、英文逗号分隔。">${escapeHtml((d.keywords||[]).join('，'))}</textarea></label>
      <label class="input-shell"><span class="input-label">正文</span><textarea id="df-content" style="min-height:220px">${escapeHtml(d.content)}</textarea></label>
    </div>
    <div class="editor-actions"><button class="solid-btn" onclick="submitDiaryForm('${id}')">保存</button><button class="ghost-btn" onclick="closeEditor()">取消</button></div>
  `);
}
function toggleDiaryMood(btn){ btn.classList.toggle('active'); }
function submitDiaryForm(id=''){
  const record = {
    id: id || uid('d'),
    author: document.getElementById('df-author').value,
    date: document.getElementById('df-date').value || today(),
    title: document.getElementById('df-title').value.trim() || '未命名日记',
    moods: Array.from(document.querySelectorAll('.mood-chip.active')).map(el => el.dataset.mood),
    keywords: splitTokens(document.getElementById('df-keywords').value),
    content: document.getElementById('df-content').value.trim()
  };
  if (id) state.diaries = state.diaries.map(item => item.id === id ? record : item);
  else state.diaries.push(record);
  saveAndRender(); closeEditor(); showToast('日记已保存', null, false);
}

function openBottleForm(id=''){
  const b = id ? state.bottles.find(item => item.id === id) : {from:'小克',content:'',date:nowString(),scheduled:false,read:false};
  showEditor(`
    <div class="editor-header"><button class="editor-back" onclick="closeEditor()">←</button><div><div class="modal-title">${id?'编辑漂流瓶':'写漂流瓶'}</div></div></div>
    <div class="editor-main form-grid">
      <div class="split">
        <label class="input-shell"><span class="input-label">来自</span><select id="bf-from">${AUTHOR_OPTIONS.map(a => `<option value="${a}" ${b.from===a?'selected':''}>${a}</option>`).join('')}</select></label>
        <label class="input-shell"><span class="input-label">送达时间</span><input id="bf-date" type="datetime-local" value="${escapeHtml(String(b.date).replace(' ','T'))}"></label>
      </div>
      <label class="input-shell"><span class="input-label">内容</span><textarea id="bf-content" style="min-height:180px">${escapeHtml(b.content)}</textarea></label>
      <div class="checkbox-group">
        <label class="check-card"><input id="bf-scheduled" type="checkbox" ${b.scheduled?'checked':''}><span class="check-text">作为定时送达消息</span></label>
        <label class="check-card"><input id="bf-read" type="checkbox" ${b.read?'checked':''}><span class="check-text">已读</span></label>
      </div>
    </div>
    <div class="editor-actions"><button class="solid-btn" onclick="submitBottleForm('${id}')">保存</button><button class="ghost-btn" onclick="closeEditor()">取消</button></div>
  `);
}
function submitBottleForm(id=''){
  const record = {
    id: id || uid('b'),
    from: document.getElementById('bf-from').value,
    content: document.getElementById('bf-content').value.trim(),
    date: (document.getElementById('bf-date').value || nowString()).replace('T',' '),
    scheduled: document.getElementById('bf-scheduled').checked,
    read: document.getElementById('bf-read').checked
  };
  if (id) state.bottles = state.bottles.map(item => item.id === id ? record : item);
  else state.bottles.unshift(record);
  saveAndRender(); closeEditor(); showToast('漂流瓶已保存', null, false);
}

function openImportExport(){
  showEditor(`
    <div class="editor-header"><button class="editor-back" onclick="closeEditor()">←</button><div><div class="modal-title">导入 / 导出</div></div></div>
    <div class="notice">当前所有记录都保存在浏览器本地。你可以导出整库，也可以按模块分别导出。</div>
    <div class="action-row" style="margin-top:14px">
      <button class="solid-btn" onclick="copyExportJson()">复制整库 JSON</button>
      <button class="ghost-btn" onclick="downloadExportJson()">下载整库</button>
      <button class="ghost-btn" onclick="downloadModuleExport('memories')">导出记忆</button>
      <button class="ghost-btn" onclick="downloadModuleExport('diaries')">导出日记</button>
      <button class="ghost-btn" onclick="downloadModuleExport('bottles')">导出漂流瓶</button>
      <button class="ghost-btn" onclick="downloadModuleExport('health')">导出健康</button>
      <button class="ghost-btn" onclick="resetDemoData()">恢复示例数据</button>
    </div>
    <div class="import-dropzone" id="import-dropzone" onclick="document.getElementById('import-file-input').click()" ondragover="event.preventDefault();this.classList.add('import-dragover')" ondragleave="this.classList.remove('import-dragover')" ondrop="event.preventDefault();this.classList.remove('import-dragover');handleImportDrop(event)">
      <input type="file" id="import-file-input" accept=".json" style="display:none" onchange="handleImportFileSelect(this)">
      <div class="import-dropzone-icon">+</div>
      <div class="import-dropzone-hint" id="import-hint">点击选择或拖放 JSON 文件</div>
    </div>
    <div class="action-row" style="margin-top:12px">
      <button class="solid-btn" onclick="doImport('overwrite')">覆盖导入</button>
      <button class="ghost-btn" onclick="doImport('merge')">追加合并</button>
    </div>
  `);
  window.__pendingImportData = null;
}

function copyExportJson(){
  const text = JSON.stringify(state, null, 2);
  const done = () => showToast('JSON 已复制', null, false);
  const fail = () => showToast('复制失败，浏览器可能未授权', null, false);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(fail);
  } else {
    fail();
  }
}
function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
function downloadExportJson(){
  downloadBlob(new Blob([JSON.stringify(state, null, 2)], {type:'application/json'}), 'memory-vault-data.json');
}
function moduleExportData(module='all'){
  const map = {
    all: state,
    memories: state.memories,
    diaries: state.diaries,
    bottles: state.bottles,
    health: state.health,
    profile: {profile: state.profile, startDate: state.startDate, automation: state.automation}
  };
  return map[module] ?? state;
}
function downloadModuleExport(module='all'){
  const names = {all:'整库', memories:'记忆', diaries:'日记', bottles:'漂流瓶', health:'健康', profile:'档案设置'};
  const blob = new Blob([JSON.stringify(moduleExportData(module), null, 2)], {type:'application/json'});
  downloadBlob(blob, `记忆库-${names[module] || module}.json`);
  showToast(`已导出 ${names[module] || module}`, null, false);
}
function handleImportFileSelect(input){
  const file = input.files[0]; if (!file) return;
  readImportFile(file);
}
function handleImportDrop(e){
  const file = e.dataTransfer.files[0]; if (!file) return;
  readImportFile(file);
}
function readImportFile(file){
  if (!file.name.endsWith('.json')){ showToast('请选择 .json 文件', null, false); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      window.__pendingImportData = JSON.parse(e.target.result);
      const hint = document.getElementById('import-hint');
      if (hint) hint.textContent = '已加载：' + file.name;
      showToast('文件已读取，选择覆盖或追加', null, false);
    } catch(err){ showToast('JSON 格式有误，请检查文件', null, false); }
  };
  reader.readAsText(file);
}
function doImport(mode){
  const data = window.__pendingImportData;
  if (!data){ showToast('请先选择文件', null, false); return; }
  try {
    if (mode === 'merge') {
      const incoming = Array.isArray(data) ? data : (data.memories || []);
      const normalized = incoming.map(normalizeMemoryMeta);
      const existingIds = new Set(state.memories.map(m => m.id));
      let added = 0;
      for (const m of normalized){
        if (!existingIds.has(m.id)){
          state.memories.push(m);
          added++;
        }
      }
      if (data.bottles && Array.isArray(data.bottles)){
        const bottleIds = new Set(state.bottles.map(b => b.id));
        for (const b of data.bottles.map(normalizeBottleMeta)){
          if (!bottleIds.has(b.id)){ state.bottles.push(b); added++; }
        }
      }
      if (data.diaries && Array.isArray(data.diaries)){
        const diaryKey = d => d.id || `${d.date || ''}|${d.author || ''}|${d.title || ''}`;
        const existing = new Set(state.diaries.map(diaryKey));
        for (const d of data.diaries){
          const key = diaryKey(d);
          if (!existing.has(key)){ state.diaries.push(d); existing.add(key); added++; }
        }
      }
      persist(); renderAll(); closeEditor();
      showToast(`追加完成，新增 ${added} 条`, null, false);
    } else {
      MemoryVaultBridge.importState(JSON.stringify(data));
      closeEditor();
    }
    window.__pendingImportData = null;
  } catch(err){ showToast('导入失败：' + err.message, null, false); }
}
function resetDemoData(){ state = defaultState(); persist(); renderAll(); closeModal(); showToast('已恢复示例数据', null, false); }

function openCalendarModal(monthOffset = 0){
  window.__calendarMonthOffset = monthOffset;
  const base = new Date();
  const current = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
  const year = current.getFullYear();
  const month = current.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const cells = [];
  for (let i=0;i<firstDay;i++) cells.push('<div></div>');
  for (let day=1; day<=days; day++) {
    const iso = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const mood = inferCalendarMood(iso);
    const dot = mood ? `<div class="mood-dot" style="background:${calendarMoodColor(mood)}"></div>` : '<div class="mood-dot" style="background:rgba(216,198,165,.25)"></div>';
    cells.push(`<button class="calendar-day" onclick="openDayDetail('${iso}', ${monthOffset})"><span>${day}</span>${dot}</button>`);
  }
  showModal(`
    <div class="modal-top"><div><div class="modal-title">日历视图</div><div class="modal-sub">心情色块 + 当天摘要</div></div><button class="close-btn" onclick="closeModal()">✕</button></div>
    <div class="calendar-head"><button class="ghost-btn" onclick="openCalendarModal(${monthOffset-1})">上个月</button><div class="small muted">${year}年 ${month+1}月</div><button class="ghost-btn" onclick="openCalendarModal(${monthOffset+1})">下个月</button></div>
    <div class="calendar-grid" style="margin-bottom:6px">${WEEK.map(w=>`<div class="calendar-week">${w}</div>`).join('')}</div>
    <div class="calendar-grid">${cells.join('')}</div>
    <div class="notice" style="margin-top:12px">每个日期下方的小色块代表当天心情。当前分为五类：平静、开心、低落、不安、重要。点开日期后可以修改心情和当天摘要。</div>
  `);
}

function openDayDetail(date, monthOffset = 0){
  closeModal();
  const note = state.calendarNotes?.[date] || {mood: inferCalendarMood(date) || '平静', summary:''};
  const daily = state.memories.filter(m => m.layer === 'daily' && m.date === date);
  const diaries = state.diaries.filter(d => d.date === date);
  showEditor(`
    <div class="editor-header"><button class="editor-back" onclick="closeEditor(); openCalendarModal(${monthOffset});">←</button><div><div class="modal-title">${escapeHtml(date)}</div></div></div>
    <div class="editor-main form-grid">
      <div class="note-box">这里改的是日历心情色块和一句当天摘要，方便在月历里一眼扫过去。真正长内容还是放在 daily / 日记里。</div>
      <div class="input-shell">
        <span class="input-label">心情色块</span>
        <div class="helper-row">${Object.keys(CALENDAR_MOODS).map(mood => `<button type="button" class="helper-link ${note.mood===mood?'active':''}" data-cal-mood="${mood}" onclick="toggleCalendarMood(this)">${mood}</button>`).join('')}</div>
      </div>
      <label class="input-shell"><span class="input-label">当天摘要</span><textarea id="cal-summary" class="textarea-compact" placeholder="写一句这天最值得一眼看到的事。">${escapeHtml(note.summary || '')}</textarea></label>
      <div class="section"><div class="section-label">daily</div>${daily.length ? daily.map(m => `<div class="soft-card" style="margin-bottom:10px"><div class="small" style="color:var(--gold);margin-bottom:6px">${escapeHtml(m.title)}</div><div class="detail-body">${escapeHtml(m.content)}</div></div>`).join('') : '<div class="empty" style="padding:8px 0 18px">这天没有 daily 摘要。</div>'}</div>
      <div class="section"><div class="section-label">日记</div>${diaries.length ? diaries.map(d => `<div class="soft-card" style="margin-bottom:10px"><div class="small" style="color:var(--gold);margin-bottom:6px">${escapeHtml(d.author)} · ${escapeHtml(d.title)}</div><div class="detail-body">${escapeHtml(d.content)}</div></div>`).join('') : '<div class="empty" style="padding:8px 0 18px">这天没有日记。</div>'}</div>
    </div>
    <div class="editor-actions"><button class="solid-btn" onclick="saveCalendarNote('${date}', ${monthOffset})">保存</button><button class="ghost-btn" onclick="closeEditor(); openCalendarModal(${monthOffset});">返回日历</button></div>
  `);
}

function toggleCalendarMood(btn){
  document.querySelectorAll('[data-cal-mood]').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
}

function saveCalendarNote(date, monthOffset = 0){
  const mood = document.querySelector('[data-cal-mood].active')?.dataset.calMood || '平静';
  const summary = document.getElementById('cal-summary').value.trim();
  state.calendarNotes[date] = {mood, summary};
  saveAndRender();
  closeEditor();
  openCalendarModal(monthOffset);
  showToast('日历色块已保存', null, false);
}

function openCollectionModal(parentId=''){
  currentCollectionParent = parentId || '';
  closeModal();
  const path = collectionPath(currentCollectionParent);
  const children = collectionChildren(currentCollectionParent);
  const folders = children.filter(item => item.kind === 'folder');
  const items = children.filter(item => item.kind !== 'folder');
  showEditor(`
    <div class="editor-header"><button class="editor-back" onclick="${currentCollectionParent ? `openCollectionModal('${collectionItem(currentCollectionParent)?.parentId || ''}')` : 'closeEditor()'}">←</button><div><div class="modal-title">收藏夹</div></div></div>
    <div class="editor-main form-grid">
      <div class="note-box">这里不是把所有收藏堆进一页，而是可以像文件夹一样往下开子页面。一个子页下面还能继续开子页，彼此并列放着。</div>
      <div class="small muted">${['收藏夹', ...path.map(item => escapeHtml(item.title))].join(' / ')}</div>
      <div class="toolbar"><button class="toolbar-btn" onclick="openCollectionFolderForm('', '${currentCollectionParent}')">新增子页</button><button class="toolbar-btn primary" onclick="openCollectionItemForm('', '${currentCollectionParent}')">新增条目</button></div>
      ${folders.length ? `<div class="section"><div class="section-label">子页面</div>${folders.map(c => `
        <div class="link-row" onclick="openCollectionModal('${c.id}')">
          <div>
            <div>${escapeHtml(c.title)}</div>
            <div class="small muted" style="margin-top:4px">${escapeHtml(c.note || '可继续往下开子页')}</div>
          </div>
          <span class="arrow">→</span>
        </div>`).join('')}</div>` : ''}
      ${items.length ? `<div class="section"><div class="section-label">条目</div>${items.map(c => `
        <div class="link-row" onclick="openCollectionItemForm('${c.id}', '${currentCollectionParent}')">
          <div>
            <div>${escapeHtml(c.title)}</div>
            <div class="small muted" style="margin-top:4px">${escapeHtml(collectionDisplayType(c))}${c.note ? ' · ' + escapeHtml(c.note) : ''}</div>
          </div>
          <span class="arrow">→</span>
        </div>`).join('')}</div>` : ''}
      ${(!folders.length && !items.length) ? '<div class="empty">这一层还没有内容。</div>' : ''}
    </div>
  `);
}

function openCollectionFolderForm(id='', parentId=''){
  const c = id ? collectionItem(id) : {kind:'folder', parentId:parentId || currentCollectionParent || '', title:'', note:''};
  showEditor(`
    <div class="editor-header"><button class="editor-back" onclick="openCollectionModal('${c.parentId || ''}')">←</button><div><div class="modal-title">${id?'编辑子页面':'新增子页面'}</div></div></div>
    <div class="editor-main form-grid">
      <div class="note-box">子页面像并列的小文件夹。你可以在它下面继续开更多子页，也可以往里面放独立收藏条目。</div>
      <label class="input-shell"><span class="input-label">标题</span><input id="cff-title" value="${escapeHtml(c.title || '')}" placeholder="例如：歌单 / 书单 / 旅行照片"></label>
      <label class="input-shell"><span class="input-label">备注</span><textarea id="cff-note" class="textarea-compact" placeholder="一句短说明，告诉以后打开的人这一页是做什么的。">${escapeHtml(c.note || '')}</textarea></label>
    </div>
    <div class="editor-actions"><button class="solid-btn" onclick="submitCollectionFolderForm('${id}', '${c.parentId || ''}')">保存</button>${id?`<button class="danger-btn" onclick="deleteCollection('${id}', '${c.parentId || ''}')">删除</button>`:''}<button class="ghost-btn" onclick="openCollectionModal('${c.parentId || ''}')">取消</button></div>
  `);
}

function submitCollectionFolderForm(id='', parentId=''){
  const record = {
    id: id || uid('cf'),
    kind: 'folder',
    parentId: parentId || '',
    title: document.getElementById('cff-title').value.trim() || '未命名子页面',
    note: document.getElementById('cff-note').value.trim()
  };
  if (id) state.collections = state.collections.map(item => item.id === id ? {...item, ...record} : item);
  else state.collections.unshift(record);
  saveAndRender(); showToast('子页面已保存', null, false); openCollectionModal(parentId || '');
}

function openCollectionItemForm(id='', parentId=''){
  const c = id ? collectionItem(id) : {kind:'item', parentId:parentId || currentCollectionParent || '', type:'收藏', title:'', content:'', note:''};
  const inFolder = !!(c.parentId || '');
  const folderTitle = inFolder ? (collectionItem(c.parentId)?.title || '') : '';
  showEditor(`
    <div class="editor-header"><button class="editor-back" onclick="openCollectionModal('${c.parentId || ''}')">←</button><div><div class="modal-title">${id?'编辑收藏条目':'新增收藏条目'}</div></div></div>
    <div class="editor-main form-grid">
      <div class="small muted">所在页面：${['收藏夹', ...collectionPath(c.parentId || '').map(item => escapeHtml(item.title))].join(' / ')}</div>
      <div class="editor-grid-top">
        <label class="input-shell"><span class="input-label">标题</span><input id="cf-title" value="${escapeHtml(c.title || '')}"></label>
        ${inFolder
          ? `<div class="input-shell"><span class="input-label">归属分类</span><div style="font-size:17px;line-height:1.5;color:var(--deep)">${escapeHtml(folderTitle)}</div></div>`
          : `<label class="input-shell"><span class="input-label">类型</span><input id="cf-type" value="${escapeHtml(c.type || '')}" placeholder="eg：歌单 / 书单 / 链接 / 电影 / 其他"></label>`}
      </div>
      <label class="input-shell"><span class="input-label">备注</span><input id="cf-note" value="${escapeHtml(c.note || '')}" placeholder="一句短说明，方便以后回来看时一眼想起它是什么。"></label>
      <label class="input-shell"><span class="input-label">内容 / 链接 / 说明</span><textarea id="cf-content" style="min-height:220px" placeholder="一条收藏写一条内容；如果是歌单或链接，也可以直接把链接贴进来。">${escapeHtml(c.content || '')}</textarea></label>
    </div>
    <div class="editor-actions"><button class="solid-btn" onclick="submitCollectionItemForm('${id}', '${c.parentId || ''}')">保存</button>${id?`<button class="danger-btn" onclick="deleteCollection('${id}', '${c.parentId || ''}')">删除</button>`:''}<button class="ghost-btn" onclick="openCollectionModal('${c.parentId || ''}')">取消</button></div>
  `);
}

function submitCollectionItemForm(id='', parentId=''){
  const parentFolderTitle = parentId ? (collectionItem(parentId)?.title || '收藏') : '';
  const typeInput = document.getElementById('cf-type');
  const record = {
    id: id || uid('ci'),
    kind: 'item',
    parentId: parentId || '',
    type: parentId ? parentFolderTitle : ((typeInput?.value || '').trim() || '收藏'),
    title: document.getElementById('cf-title').value.trim() || '未命名收藏',
    note: document.getElementById('cf-note').value.trim(),
    content: document.getElementById('cf-content').value.trim()
  };
  if (id) state.collections = state.collections.map(item => item.id === id ? {...item, ...record} : item);
  else state.collections.unshift(record);
  saveAndRender(); showToast('收藏已保存', null, false); openCollectionModal(parentId || '');
}


function deleteCollection(id='', parentId=''){
  const ids = new Set([id]);
  let changed = true;
  while(changed){
    changed = false;
    state.collections.forEach(item => {
      if (!ids.has(item.id) && ids.has(item.parentId || '')) { ids.add(item.id); changed = true; }
    });
  }
  state.collections = state.collections.filter(item => !ids.has(item.id));
  saveAndRender(); showToast('收藏已删除', null, false); openCollectionModal(parentId || '');
}

function openHealthModal(){
  closeModal();
  const cycle = getCycleInfo();
  const entries = healthEntries();
  showEditor(`
    <div class="editor-header"><button class="editor-back" onclick="closeEditor()">←</button><div><div class="modal-title">健康总览</div></div></div>
    <div class="editor-main form-grid">
      <div class="note-box">这里统一看睡眠、心率、饮食、饮水和经期。点“新增记录”可以手动补写，汇总和手动记录会放在一起看。</div>
      <div class="section">
        <div class="section-label">经期模块</div>
        <div class="health-grid">
          <div class="health-card"><h4>上次开始</h4><div class="detail-body">${escapeHtml(state.health.cycle.lastPeriodStart)}</div></div>
          <div class="health-card"><h4>下次预计</h4><div class="detail-body">${ymd(cycle.next)}</div></div>
          <div class="health-card"><h4>周期长度</h4><div class="detail-body">${state.health.cycle.cycleLength} 天</div></div>
          <div class="health-card"><h4>排卵期推测</h4><div class="detail-body">${ymd(cycle.ovulation)}</div></div>
        </div>
      </div>
      <div class="toolbar">
        <button class="toolbar-btn primary" onclick="openHealthEntryForm()">新增记录</button>
        <button class="toolbar-btn" onclick="openHealthEditModal()">编辑周期参数</button>
      </div>
      <div class="section"><div class="section-label">记录汇总</div>${entries.map(item => `<div class="soft-card" style="margin-bottom:10px;cursor:pointer" onclick="openHealthEntryForm('${item.source}','${item.id}')"><div class="small" style="color:var(--gold);margin-bottom:6px">${escapeHtml(item.label)} · ${escapeHtml(item.date)}</div><div class="detail-body">${escapeHtml(item.body)}</div></div>`).join('')}</div>
    </div>
  `);
}

function openHealthEntryForm(source='log', id=''){
  const entry = source==='daily' ? state.health.daily.find(item => item.id===id) : state.health.logs.find(item => item.id===id);
  const data = entry || {date: source==='daily' ? today() : nowString(), type:'饮食', content:'', sleep:'', bedtime:'', steps:'', heartRateAvg:'', activity:'', summary:''};
  showEditor(`
    <div class="editor-header"><button class="editor-back" onclick="openHealthModal()">←</button><div><div class="modal-title">${id?'编辑健康记录':'新增健康记录'}</div></div></div>
    <div class="editor-main form-grid">
      <div class="split">
        <label class="input-shell"><span class="input-label">记录类型</span><select id="he-source" onchange="toggleHealthSourceFields()"><option value="log" ${source!=='daily'?'selected':''}>手动记录</option><option value="daily" ${source==='daily'?'selected':''}>每日汇总</option></select></label>
        <label class="input-shell"><span class="input-label">日期</span><input id="he-date" type="${source==='daily'?'date':'datetime-local'}" value="${escapeHtml(String(data.date).replace(' ','T'))}"></label>
      </div>
      <div id="he-log-fields" style="display:${source==='daily'?'none':'grid'};gap:12px">
        <label class="input-shell"><span class="input-label">项目</span><select id="he-type"><option value="饮食" ${data.type==='饮食'?'selected':''}>饮食</option><option value="饮水" ${data.type==='饮水'?'selected':''}>饮水</option><option value="睡眠" ${data.type==='睡眠'?'selected':''}>睡眠</option><option value="心率" ${data.type==='心率'?'selected':''}>心率</option><option value="经期" ${data.type==='经期'?'selected':''}>经期</option><option value="其他" ${data.type==='其他'?'selected':''}>其他</option></select></label>
        <label class="input-shell"><span class="input-label">内容</span><textarea id="he-content" style="min-height:180px">${escapeHtml(data.content || '')}</textarea></label>
      </div>
      <div id="he-daily-fields" style="display:${source==='daily'?'grid':'none'};gap:12px">
        <div class="editor-grid-three">
          <label class="input-shell"><span class="input-label">睡眠</span><input id="he-sleep" value="${escapeHtml(data.sleep || '')}"></label>
          <label class="input-shell"><span class="input-label">就寝</span><input id="he-bedtime" value="${escapeHtml(data.bedtime || '')}"></label>
          <label class="input-shell"><span class="input-label">步数</span><input id="he-steps" value="${escapeHtml(data.steps || '')}"></label>
        </div>
        <div class="editor-grid-three">
          <label class="input-shell"><span class="input-label">平均心率</span><input id="he-heart" value="${escapeHtml(data.heartRateAvg || '')}"></label>
          <label class="input-shell"><span class="input-label">活动时长</span><input id="he-activity" value="${escapeHtml(data.activity || '')}"></label>
          <label class="input-shell"><span class="input-label">一瓶水（ml）</span><input id="he-waterml" type="number" value="${escapeHtml(state.health.waterBottleMl || 500)}"></label>
        </div>
        <label class="input-shell"><span class="input-label">汇总正文</span><textarea id="he-summary" style="min-height:180px">${escapeHtml(data.summary || '')}</textarea></label>
      </div>
    </div>
    <div class="editor-actions"><button class="solid-btn" onclick="submitHealthEntryForm('${source}','${id}')">保存</button>${id?`<button class="danger-btn" onclick="deleteHealthEntry('${source}','${id}')">删除</button>`:''}<button class="ghost-btn" onclick="openHealthModal()">取消</button></div>
  `);
}
function toggleHealthSourceFields(){
  const source = document.getElementById('he-source').value;
  document.getElementById('he-log-fields').style.display = source==='daily' ? 'none' : 'grid';
  document.getElementById('he-daily-fields').style.display = source==='daily' ? 'grid' : 'none';
  document.getElementById('he-date').type = source==='daily' ? 'date' : 'datetime-local';
}
function submitHealthEntryForm(originalSource='log', id=''){
  const source = document.getElementById('he-source').value;
  if (source === 'daily') {
    const record = {
      id: id || uid('hd'),
      date: (document.getElementById('he-date').value || today()).replace('T',' '),
      sleep: document.getElementById('he-sleep').value.trim(),
      bedtime: document.getElementById('he-bedtime').value.trim(),
      steps: document.getElementById('he-steps').value.trim(),
      heartRateAvg: document.getElementById('he-heart').value.trim(),
      activity: document.getElementById('he-activity').value.trim(),
      summary: document.getElementById('he-summary').value.trim()
    };
    state.health.waterBottleMl = Number(document.getElementById('he-waterml').value || 500);
    if (originalSource === 'daily' && id) state.health.daily = state.health.daily.map(item => item.id===id ? record : item);
    else { if (id) state.health.logs = state.health.logs.filter(item => item.id!==id); state.health.daily.unshift(record); }
  } else {
    const record = {
      id: id || uid('hl'),
      date: (document.getElementById('he-date').value || nowString()).replace('T',' '),
      type: document.getElementById('he-type').value,
      content: document.getElementById('he-content').value.trim()
    };
    if (originalSource === 'log' && id) state.health.logs = state.health.logs.map(item => item.id===id ? record : item);
    else { if (id) state.health.daily = state.health.daily.filter(item => item.id!==id); state.health.logs.unshift(record); }
  }
  saveAndRender(); showToast('健康记录已保存', null, false); openHealthModal();
}
function deleteHealthEntry(source='log', id=''){
  if (source==='daily') state.health.daily = state.health.daily.filter(item => item.id!==id);
  else state.health.logs = state.health.logs.filter(item => item.id!==id);
  saveAndRender(); showToast('健康记录已删除', null, false); openHealthModal();
}

function openHealthEditModal(){
  const c = state.health.cycle;
  showEditor(`
    <div class="editor-header"><button class="editor-back" onclick="openHealthModal()">←</button><div><div class="modal-title">编辑经期参数</div></div></div>
    <div class="form-grid">
      <label class="input-shell"><span class="input-label">上次开始日期</span><input id="hc-start" type="date" value="${escapeHtml(c.lastPeriodStart)}"></label>
      <div class="split">
        <label class="input-shell"><span class="input-label">周期长度（天）</span><input id="hc-cycle" type="number" value="${escapeHtml(c.cycleLength)}"></label>
        <label class="input-shell"><span class="input-label">经期长度（天）</span><input id="hc-period" type="number" value="${escapeHtml(c.periodLength)}"></label>
      </div>
      <label class="input-shell"><span class="input-label">一瓶水（ml）</span><input id="hc-water" type="number" value="${escapeHtml(state.health.waterBottleMl || 500)}"></label>
    </div>
    <div class="editor-actions"><button class="solid-btn" onclick="submitHealthCycle()">保存</button><button class="ghost-btn" onclick="openHealthModal()">返回</button></div>
  `);
}
function submitHealthCycle(){
  state.health.cycle = {
    lastPeriodStart: document.getElementById('hc-start').value || state.health.cycle.lastPeriodStart,
    cycleLength: Number(document.getElementById('hc-cycle').value || 29),
    periodLength: Number(document.getElementById('hc-period').value || 6)
  };
  state.health.waterBottleMl = Number(document.getElementById('hc-water').value || 500);
  saveAndRender(); closeEditor(); openHealthModal();
}

function openSettingsModal(){
  showEditor(`
    <div class="editor-header"><button class="editor-back" onclick="closeEditor()">←</button><div><div class="modal-title">设置</div></div></div>
    <div class="editor-main form-grid">
      <div class="note-box">这里可以修改名称、起始日期和服务地址。

服务地址通常填写你自己的服务入口，例如 https://你的域名/api 或 https://你的域名/mcp 。数据库项目地址和密钥更适合放在服务端配置里，不建议直接写在前端。</div>
      <label class="input-shell"><span class="input-label">名字</span><input id="set-pair" value="${escapeHtml(state.profile.pairName || '')}"></label>
      <label class="input-shell"><span class="input-label">起始日期</span><input id="set-start" type="date" value="${escapeHtml(state.startDate || today())}"></label>
      <label class="input-shell"><span class="input-label">一瓶水（ml）</span><input id="set-water" type="number" value="${escapeHtml(state.health.waterBottleMl || 500)}"></label>
      <label class="input-shell"><span class="input-label">服务地址</span><textarea id="set-endpoint" class="textarea-compact" placeholder="例如：
https://你的域名/api
https://你的域名/mcp">${escapeHtml(state.automation.endpoint || '')}</textarea></label>
      <div class="notice">这里可以保存服务地址，后面接入自己的服务时再填写。导出支持按模块分别保存。</div>
      <div class="toolbar">
        <button class="toolbar-btn" onclick="downloadModuleExport('all')">导出整库</button>
        <button class="toolbar-btn" onclick="downloadModuleExport('memories')">导出记忆</button>
        <button class="toolbar-btn" onclick="downloadModuleExport('diaries')">导出日记</button>
        <button class="toolbar-btn" onclick="downloadModuleExport('bottles')">导出漂流瓶</button>
        <button class="toolbar-btn" onclick="downloadModuleExport('health')">导出健康</button>
        <button class="toolbar-btn" onclick="downloadModuleExport('profile')">导出档案设置</button>
      </div>
    </div>
    <div class="editor-actions">
      <button class="solid-btn" onclick="saveAutomationSettings()">保存</button>
      <button class="ghost-btn" onclick="openImportExport()">导入与导出</button>
      <button class="ghost-btn" onclick="closeEditor()">取消</button>
    </div>
    <div style="text-align:center;margin-top:28px;padding-top:18px;border-top:1px solid var(--line);">
      <button class="ghost-btn" style="font-size:11px;color:rgba(126,118,116,.5);letter-spacing:1px" onclick="performLogout()">退出登录</button>
    </div>
  `);
}
function saveAutomationSettings(){
  state.profile.pairName = document.getElementById('set-pair').value.trim() || state.profile.pairName;
  state.startDate = document.getElementById('set-start').value || state.startDate;
  state.health.waterBottleMl = Number(document.getElementById('set-water').value || 500);
  state.automation.endpoint = document.getElementById('set-endpoint').value.trim();
  state.automation.lastSync = nowString();
  saveAndRender(); showToast('设置已保存', null, false); closeEditor();
}

function deleteMemory(id){
  const found = state.memories.find(item => item.id === id); if (!found) return;
  undoPayload = {type:'memory', data: clone(found)};
  state.memories = state.memories.filter(item => item.id !== id);
  saveAndRender(); closeModal();
  showToast('已删除记忆', () => restoreUndo(), true);
}
function deleteDiary(id){
  const found = state.diaries.find(item => item.id === id); if (!found) return;
  undoPayload = {type:'diary', data: clone(found)};
  state.diaries = state.diaries.filter(item => item.id !== id);
  saveAndRender(); closeModal();
  showToast('已删除日记', () => restoreUndo(), true);
}
function deleteBottle(id){
  const found = state.bottles.find(item => item.id === id); if (!found) return;
  undoPayload = {type:'bottle', data: clone(found)};
  state.bottles = state.bottles.filter(item => item.id !== id);
  saveAndRender(); closeModal();
  showToast('已删除漂流瓶', () => restoreUndo(), true);
}
function restoreUndo(){
  if (!undoPayload) return;
  if (undoPayload.type === 'memory') state.memories.unshift(undoPayload.data);
  if (undoPayload.type === 'diary') state.diaries.unshift(undoPayload.data);
  if (undoPayload.type === 'bottle') state.bottles.unshift(undoPayload.data);
  saveAndRender(); showToast('已撤销删除', null, false);
}
function toggleBottleRead(id){
  state.bottles = state.bottles.map(item => item.id === id ? {...item, read: !item.read} : item);
  saveAndRender(); closeModal();
}

document.getElementById('fab').addEventListener('click', () => {
  if (currentTab === 'memory') openMemoryForm();
  if (currentTab === 'diary') openDiaryForm();
  if (currentTab === 'bottle') openBottleForm();
});

let authSession = null;

function isAuthed(){ return !!authSession; }

function showAuthGate(errorMsg = ''){
  const gate = document.getElementById('auth-gate');
  if (!gate) return;
  gate.innerHTML = `
    <div class="auth-card">
      <div class="auth-brand"></div>
      <div class="auth-title">记忆库</div>
      <div class="auth-sub">登录后继续</div>
      <form class="auth-form" id="auth-form" autocomplete="on">
        <label class="input-shell"><span class="input-label">邮箱</span><input id="auth-email" type="email" autocomplete="email" required></label>
        <label class="input-shell"><span class="input-label">密码</span><input id="auth-password" type="password" autocomplete="current-password" required></label>
        <div class="auth-error ${errorMsg ? 'show' : ''}" id="auth-error">${escapeHtml(errorMsg || '')}</div>
        <button class="auth-submit" type="submit" id="auth-submit">登录</button>
      </form>
      <div class="auth-foot">灯一直亮着</div>
    </div>
  `;
  gate.classList.add('show');
  document.body.style.overflow = 'hidden';
  document.getElementById('auth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    performLogin();
  });
  setTimeout(() => document.getElementById('auth-email')?.focus(), 50);
}

function hideAuthGate(){
  const gate = document.getElementById('auth-gate');
  if (!gate) return;
  gate.classList.remove('show');
  gate.innerHTML = '';
  document.body.style.overflow = '';
}

function setAuthError(msg){
  const el = document.getElementById('auth-error');
  if (!el) return;
  el.textContent = msg || '';
  el.classList.toggle('show', !!msg);
}

function translateAuthError(error){
  const msg = String(error?.message || '');
  if (/invalid login credentials/i.test(msg)) return '邮箱或密码不对。';
  if (/email not confirmed/i.test(msg)) return '邮箱还没验证，去邮箱里点一下确认链接。';
  if (/rate/i.test(msg)) return '尝试太频繁了，稍后再试。';
  return msg || '登录失败，请重试。';
}

async function performLogin(){
  const email = document.getElementById('auth-email')?.value.trim() || '';
  const password = document.getElementById('auth-password')?.value || '';
  if (!email || !password) { setAuthError('邮箱和密码都要填。'); return; }
  const client = getSupabaseClient();
  if (!client) { setAuthError('服务未就绪，刷新一下试试。'); return; }
  const btn = document.getElementById('auth-submit');
  if (btn) { btn.disabled = true; btn.textContent = '登录中…'; }
  setAuthError('');
  try {
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) setAuthError(translateAuthError(error));
  } catch (err) {
    setAuthError('网络异常，请稍后再试。');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '登录'; }
  }
}

async function performLogout(){
  const client = getSupabaseClient();
  if (!client) return;
  try { await client.auth.signOut(); }
  catch (err) { showToast('退出失败，请重试', null, false); }
}
window.performLogout = performLogout;

async function loadStateForUser(){
  const remote = await readStateFromSupabase();
  state = normalizeState(remote.ok ? remote.state : defaultState());
  persistLocalCache(state);
  renderAll();
}

function clearAppSurface(){
  ['page-home','page-memory','page-diary','page-bottle','page-archive'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });
  const tabBar = document.getElementById('tab-bar');
  if (tabBar) tabBar.innerHTML = '';
  fab?.classList.add('hidden');
  closeModal();
  closeEditor();
}

function handleSignedOut(){
  authSession = null;
  try { localStorage.removeItem(STORAGE_KEY); } catch(e){}
  state = normalizeState(defaultState());
  clearAppSurface();
  showAuthGate();
}

async function bootstrapApp(){
  applyTheme(readStoredTheme());
  ensureThemeToggle();

  state = normalizeState(defaultState());

  const client = getSupabaseClient();
  if (!client) {
    showAuthGate('服务未就绪，请刷新页面或检查网络。');
    return;
  }

  client.auth.onAuthStateChange((event, session) => {
    if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && session) {
      const wasAuthed = !!authSession;
      authSession = session;
      if (!wasAuthed) {
        hideAuthGate();
        loadStateForUser();
      }
    } else if (event === 'SIGNED_OUT') {
      handleSignedOut();
    }
  });

  const { data: { session } } = await client.auth.getSession();
  if (session) {
    if (!authSession) {
      authSession = session;
      await loadStateForUser();
    }
  } else {
    try { localStorage.removeItem(STORAGE_KEY); } catch(e){}
    showAuthGate();
  }
}

bootstrapApp();
