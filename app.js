const STORAGE_KEY = 'memory-vault-prototype-v4';
const THEME_KEY = 'memory-vault-theme';
const SUPABASE_URL = window.SUPABASE_URL || 'https://fmdvjxecdydfuioyllcp.supabase.co';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'sb_publishable_zuniSO-_SZkTqSRHiXrxZg_W7py7-Aj';
const SUPABASE_TABLE = 'vault_state';
const SUPABASE_ROW_ID = 'main';
const MEMORY_API_BASE = (window.MEMORY_API_BASE || 'https://mcp.yuan-own-server.uk').replace(/\/$/, '');
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
      cycle:{lastPeriodStart:'2026-03-17',cycleLength:29,periodLength:6,periods:[]},
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
let remoteUpdatedAt = null;
let remoteReadOk = false;
let lastConflictDownloadAt = 0;
let legacyVaultMemoriesBackup;
const CONFLICT_DOWNLOAD_THROTTLE_MS = 60 * 1000;
const CONFLICT_BACKUP_KEY = 'memory_vault_conflict_backup';
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
function getFrontendAccessToken(){
  return authSession?.access_token || '';
}

async function apiFetchMemories(params = {}){
  const token = getFrontendAccessToken();
  if (!token) return [];
  const url = new URL(MEMORY_API_BASE + '/api/memories');
  if (params.limit) url.searchParams.set('limit', String(params.limit));
  if (params.layer) url.searchParams.set('layer', params.layer);
  if (params.sub_layer) url.searchParams.set('sub_layer', params.sub_layer);
  if (params.q) url.searchParams.set('q', params.q);
  if (params.include_archived) url.searchParams.set('include_archived', 'true');
  const resp = await fetch(url.toString(), { headers: { 'Authorization': 'Bearer ' + token } });
  if (!resp.ok) throw new Error('apiFetchMemories failed: ' + resp.status);
  const data = await resp.json();
  return Array.isArray(data.items) ? data.items.map(normalizeMemoryMeta) : [];
}

async function fetchAllMemoriesFromApi(){
  const PAGE = 500;
  const token = getFrontendAccessToken();
  if (!token) return [];
  let all = [], offset = 0;
  for(;;){
    const url = new URL(MEMORY_API_BASE + '/api/memories');
    url.searchParams.set('limit', String(PAGE));
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('include_archived', 'true');
    const resp = await fetch(url.toString(), { headers: { 'Authorization': 'Bearer ' + token } });
    if (!resp.ok){ const e = new Error('fetchAllMemoriesFromApi failed: ' + resp.status); e.status = resp.status; throw e; }
    const data = await resp.json();
    const items = Array.isArray(data.items) ? data.items.map(normalizeMemoryMeta) : [];
    all = all.concat(items);
    if (!data.has_more || items.length < PAGE) break;
    offset += PAGE;
  }
  return all;
}

async function apiWriteMemory(record){
  const token = getFrontendAccessToken();
  if (!token){ const e = new Error('Not authenticated'); e.code = 'no_token'; throw e; }
  const resp = await fetch(MEMORY_API_BASE + '/api/memories', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(record)
  });
  if (!resp.ok){ const e = new Error('apiWriteMemory failed: ' + resp.status); e.status = resp.status; throw e; }
  return normalizeMemoryMeta(await resp.json());
}

async function apiPatchMemory(id, fields){
  const token = getFrontendAccessToken();
  if (!token){ const e = new Error('Not authenticated'); e.code = 'no_token'; throw e; }
  const resp = await fetch(MEMORY_API_BASE + '/api/memories/' + encodeURIComponent(id), {
    method: 'PATCH',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(fields)
  });
  if (!resp.ok){ const e = new Error('apiPatchMemory failed: ' + resp.status); e.status = resp.status; throw e; }
  return normalizeMemoryMeta(await resp.json());
}

async function apiArchiveMemory(id){
  const token = getFrontendAccessToken();
  if (!token){ const e = new Error('Not authenticated'); e.code = 'no_token'; throw e; }
  const resp = await fetch(MEMORY_API_BASE + '/api/memories/' + encodeURIComponent(id), {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  if (!resp.ok){ const e = new Error('apiArchiveMemory failed: ' + resp.status); e.status = resp.status; throw e; }
  return resp.json();
}

async function apiRestoreMemory(id){
  const token = getFrontendAccessToken();
  if (!token){ const e = new Error('Not authenticated'); e.code = 'no_token'; throw e; }
  const resp = await fetch(MEMORY_API_BASE + '/api/memories/' + encodeURIComponent(id) + '/restore', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  if (!resp.ok){ const e = new Error('apiRestoreMemory failed: ' + resp.status); e.status = resp.status; throw e; }
  return normalizeMemoryMeta(await resp.json());
}

async function apiDeleteMemoryPermanently(id){
  const token = getFrontendAccessToken();
  if (!token){ const e = new Error('Not authenticated'); e.code = 'no_token'; throw e; }
  const resp = await fetch(MEMORY_API_BASE + '/api/memories/' + encodeURIComponent(id) + '/permanent', {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  if (!resp.ok){ const e = new Error('apiDeleteMemoryPermanently failed: ' + resp.status); e.status = resp.status; throw e; }
  return resp.json();
}

// 导入候选：薄薄包一层现有 REST 约定（沿用 /api/ + Bearer），后端对应
// memory_import_candidate_extract / memory_import_candidate_commit 两个 MCP 工具。
const IMPORT_EXTRACT_PATH = window.IMPORT_EXTRACT_PATH || '/api/import/candidates/extract';
const IMPORT_COMMIT_PATH = window.IMPORT_COMMIT_PATH || '/api/import/candidates/commit';

async function apiImportCandidateExtract(payload){
  const token = getFrontendAccessToken();
  if (!token){ const e = new Error('Not authenticated'); e.code = 'no_token'; throw e; }
  const resp = await fetch(MEMORY_API_BASE + IMPORT_EXTRACT_PATH, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!resp.ok){ const e = new Error('apiImportCandidateExtract failed: ' + resp.status); e.status = resp.status; throw e; }
  return resp.json();
}

async function apiImportCandidateCommit(payload){
  const token = getFrontendAccessToken();
  if (!token){ const e = new Error('Not authenticated'); e.code = 'no_token'; throw e; }
  const resp = await fetch(MEMORY_API_BASE + IMPORT_COMMIT_PATH, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!resp.ok){ const e = new Error('apiImportCandidateCommit failed: ' + resp.status); e.status = resp.status; throw e; }
  return resp.json();
}

function classifyApiError(err){
  if (!err) return '未知错误';
  if (err.code === 'no_token') return '请先登录，未检测到登录凭证';
  if (err.status === 401) return '登录凭证失效，请重新登录';
  if (err.status === 403) return '账号无权限，请检查白名单配置';
  if (err.status === 400) return '请求格式错误（400）';
  if (err.status === 404) return '这条记忆可能已被移动或删除，请刷新后再试';
  if (err.status === 409) return '请先归档后再永久删除';
  if (err.status >= 500) return `服务器错误（${err.status}），请稍后重试`;
  if (err.status) return `操作失败（${err.status}）`;
  const msg = (err.message || String(err));
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.toLowerCase().includes('network')) return '网络错误，无法连接服务器';
  return '操作失败：' + msg;
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
    if (!isRemoteStateUsable(data?.state_json)) {
      remoteUpdatedAt = data?.updated_at || null;
      return {ok:false, reason:'empty'};
    }
    remoteUpdatedAt = data.updated_at || null;
    legacyVaultMemoriesBackup = Array.isArray(data.state_json?.memories) ? data.state_json.memories : [];
    const baseState = normalizeState(data.state_json);
    try {
      baseState.memories = await fetchAllMemoriesFromApi();
    } catch(e) {
      return {ok:false, reason:'memory_api_error', error:e};
    }
    return {ok:true, state:baseState, updatedAt:data.updated_at || ''};
  }
  catch(error){
    return {ok:false, reason:'exception', error};
  }
}
function queueStateWriteToSupabase(snapshot = state){
  const client = getSupabaseClient();
  if (!client) return Promise.resolve({ok:false, skipped:true, reason:'not_ready'});
  if (!remoteReadOk) return Promise.resolve({ok:false, skipped:true, reason:'remote_not_loaded'});
  const payload = clone(snapshot);
  payload.memories = legacyVaultMemoriesBackup !== undefined ? legacyVaultMemoriesBackup : [];
  remoteWriteChain = remoteWriteChain
    .catch(() => null)
    .then(async () => {
      try{
        const updatedAt = new Date().toISOString();
        const expected = remoteUpdatedAt;
        if (expected) {
          const { data, error } = await client
            .from(SUPABASE_TABLE)
            .update({ state_json: payload, updated_at: updatedAt })
            .eq('id', SUPABASE_ROW_ID)
            .eq('updated_at', expected)
            .select('updated_at');
          if (error) return {ok:false, error};
          if (Array.isArray(data) && data.length === 0) {
            handleWriteConflict(snapshot);
            return {ok:false, conflict:true};
          }
          remoteUpdatedAt = updatedAt;
          return {ok:true, updatedAt};
        }
        const { error: upsertError } = await client
          .from(SUPABASE_TABLE)
          .upsert({ id: SUPABASE_ROW_ID, state_json: payload, updated_at: updatedAt });
        if (upsertError) return {ok:false, error:upsertError};
        remoteUpdatedAt = updatedAt;
        return {ok:true, updatedAt, mode:'upsert'};
      }
      catch(error){
        return {ok:false, error};
      }
    });
  return remoteWriteChain;
}
function handleWriteConflict(snapshot){
  try {
    localStorage.setItem(CONFLICT_BACKUP_KEY, JSON.stringify({
      savedAt: new Date().toISOString(),
      state: snapshot
    }));
  } catch(e){}
  const now = Date.now();
  if (now - lastConflictDownloadAt > CONFLICT_DOWNLOAD_THROTTLE_MS) {
    lastConflictDownloadAt = now;
    try {
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], {type:'application/json'});
      downloadBlob(blob, `memory-vault-conflict-${ymd(new Date())}.json`);
    } catch(e){}
  }
  showConflictModal();
}
function showConflictModal(){
  showModal(`
    <div class="modal-top">
      <div>
        <div class="modal-title">云端有更新</div>
        <div class="modal-sub">这次没有覆盖云端，你的版本已备份</div>
      </div>
      <button class="close-btn" onclick="closeModal()">✕</button>
    </div>
    <div class="detail-body" style="margin-top:14px">云端记忆库刚刚被别的端更新了。这次没有覆盖云端，你刚改的内容已经保存到本地备份和 JSON 下载里。你可以先刷新看看远端的版本，再决定怎么合并。</div>
    <div class="detail-body" style="margin-top:8px;opacity:.6;font-size:.85em">注意：「覆盖非记忆字段」只覆盖 vault_state（日历、档案、bottles 等），不影响 public.memories 记忆库。如需同步记忆库，请用导入功能。</div>
    <div class="action-row">
      <button class="solid-btn" data-action="conflict-download">下载我的备份</button>
      <button class="solid-btn" data-action="conflict-force-save">覆盖非记忆字段</button>
      <button class="ghost-btn" data-action="conflict-reload">刷新云端版本</button>
      <button class="ghost-btn" onclick="closeModal()">稍后处理</button>
    </div>
  `);
}
function downloadConflictBackup(){
  try {
    const raw = localStorage.getItem(CONFLICT_BACKUP_KEY);
    if (!raw) { showToast('没有可下载的本地备份', null, false); return; }
    const blob = new Blob([raw], {type:'application/json'});
    downloadBlob(blob, `memory-vault-conflict-${ymd(new Date())}.json`);
  } catch(e){
    showToast('下载备份失败', null, false);
  }
}
async function reloadFromRemote(){
  closeModal();
  const ok = await loadStateForUser();
  if (ok) showToast('已刷新到云端最新版本', null, false);
}
async function writeStateToSupabase(snapshot, { force = false } = {}){
  const client = getSupabaseClient();
  if (!client) return {ok:false, reason:'not_ready'};
  try{
    const updatedAt = new Date().toISOString();
    const payload = clone(snapshot);
    payload.memories = legacyVaultMemoriesBackup !== undefined ? legacyVaultMemoriesBackup : [];
    if (force){
      const { error } = await client
        .from(SUPABASE_TABLE)
        .upsert({ id: SUPABASE_ROW_ID, state_json: payload, updated_at: updatedAt });
      if (error) return {ok:false, error};
      return {ok:true, updatedAt};
    }
    const expected = remoteUpdatedAt;
    if (expected){
      const { data, error } = await client
        .from(SUPABASE_TABLE)
        .update({ state_json: payload, updated_at: updatedAt })
        .eq('id', SUPABASE_ROW_ID)
        .eq('updated_at', expected)
        .select('updated_at');
      if (error) return {ok:false, error};
      if (Array.isArray(data) && data.length === 0) return {ok:false, conflict:true};
      return {ok:true, updatedAt};
    }
    const { error: upsertError } = await client
      .from(SUPABASE_TABLE)
      .upsert({ id: SUPABASE_ROW_ID, state_json: payload, updated_at: updatedAt });
    if (upsertError) return {ok:false, error:upsertError};
    return {ok:true, updatedAt};
  }
  catch(error){
    return {ok:false, error};
  }
}
async function forceSaveConflictBackup(){
  const raw = localStorage.getItem(CONFLICT_BACKUP_KEY);
  if (!raw){ showToast('没有可保存的本地备份', null, false); return; }
  let backup;
  try { backup = JSON.parse(raw); } catch(e){ showToast('没有可保存的本地备份', null, false); return; }
  if (!backup || !backup.state){ showToast('没有可保存的本地备份', null, false); return; }
  await readStateFromSupabase();
  const result = await writeStateToSupabase(backup.state, { force: true });
  if (result.ok){
    state = normalizeState(backup.state);
    persistLocalCache(state);
    remoteUpdatedAt = result.updatedAt;
    remoteReadOk = true;
    renderAll();
    closeModal();
    showToast('已用你的版本保存到云端', null, false);
  } else {
    console.warn('force save failed', result.error || result.reason);
    showToast('保存失败，请先下载备份', null, false);
  }
}
function splitTokens(text=''){
  const seen = new Set();
  return String(text).split(/[，,、；;\n]+/).map(v => v.trim()).filter(v => {
    if (!v || seen.has(v)) return false;
    seen.add(v);
    return true;
  });
}

function moodToVA(mood=''){ return MOOD_VA_MAP[mood] || {valence:0.5, arousal:0.3}; }
const num01 = (v, fb) => { const n = Number(v); return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : fb; };
const toBool = v => v === true || v === 1 || v === 'true' || v === '1';
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

const ID_PATTERN = /^[A-Za-z0-9_-]{1,80}$/;
const STR_LIMITS = { title: 200, note: 5000, content: 100000, summary: 100000, keyword: 200, type: 100, short: 200 };
const KEYWORDS_MAX = 100;
const MOODS_MAX = 20;
const IMPORT_BYTES_MAX = 10 * 1024 * 1024;

function safeId(value, prefix = 'id'){
  const s = typeof value === 'string' ? value : '';
  return ID_PATTERN.test(s) ? s : uid(prefix);
}
function safeOptionalId(value){
  const s = typeof value === 'string' ? value : '';
  return ID_PATTERN.test(s) ? s : '';
}
function safeStr(value, max){
  const s = value == null ? '' : String(value);
  return s.length > max ? s.slice(0, max) : s;
}
function clampNum(value, min, max, fallback){
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}
function safeArray(value, fallback = []){
  return Array.isArray(value) ? value : fallback;
}
function safeKeywords(value){
  function expandToken(k){
    const s = String(k == null ? '' : k).trim();
    if (!s) return [];
    if (s.startsWith('[')) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed.flatMap(expandToken);
      } catch (_) {}
    }
    return splitTokens(s);
  }
  let raw;
  if (Array.isArray(value)) {
    raw = value.flatMap(expandToken);
  } else if (typeof value === 'string' && value.trim()) {
    raw = expandToken(value);
  } else {
    raw = [];
  }
  const seen = new Set();
  return raw.filter(k => {
    const s = safeStr(k, STR_LIMITS.keyword);
    if (!s || seen.has(s)) return false;
    seen.add(s);
    return true;
  }).slice(0, KEYWORDS_MAX);
}

function normalizeMemoryMeta(memory = {}){
  const base = (memory && typeof memory === 'object' && !Array.isArray(memory)) ? {...memory} : {};
  const va = moodToVA(base.mood);
  const lastActive = memoryLastActiveValue(base).toISOString();
  const importance = clampNum(base.importance, 1, 10, base.layer === 'core' ? 5 : 2);
  return {
    ...base,
    id: safeId(base.id, 'm'),
    title: safeStr(base.title, STR_LIMITS.title),
    content: safeStr(base.content, STR_LIMITS.content),
    today_snapshot: safeStr(base.today_snapshot, STR_LIMITS.summary),
    why_precious: safeStr(base.why_precious, STR_LIMITS.summary),
    keywords: safeKeywords(base.keywords),
    activation_count: Math.max(1, clampNum(base.activation_count, 1, 1e9, 1)),
    last_active: lastActive,
    resolved: !!base.resolved,
    pinned: !!base.pinned,
    protected: base.protected ?? isProtectedLayer(base.layer),
    valence: clampNum(base.valence ?? va.valence, 0, 1, va.valence),
    arousal: clampNum(base.arousal ?? va.arousal, 0, 1, va.arousal),
    _archived: !!base._archived,
    importance
  };
}
function normalizeBottleMeta(bottle = {}){
  const base = (bottle && typeof bottle === 'object' && !Array.isArray(bottle)) ? {...bottle} : {};
  return {
    ...base,
    id: safeId(base.id, 'b'),
    from: safeStr(base.from, STR_LIMITS.short),
    content: safeStr(base.content, STR_LIMITS.content),
    _archived: !!base._archived,
  };
}
function normalizeDiary(diary = {}){
  const base = (diary && typeof diary === 'object' && !Array.isArray(diary)) ? {...diary} : {};
  return {
    ...base,
    id: safeId(base.id, 'd'),
    title: safeStr(base.title, STR_LIMITS.title),
    content: safeStr(base.content, STR_LIMITS.content),
    today_snapshot: safeStr(base.today_snapshot, STR_LIMITS.summary),
    keywords: safeKeywords(base.keywords),
    moods: safeArray(base.moods, []).slice(0, MOODS_MAX).map(m => safeStr(m, 50)).filter(Boolean),
    author: safeStr(base.author, 50),
    date: safeStr(base.date, 50),
  };
}
function normalizeCollection(item = {}){
  const base = (item && typeof item === 'object' && !Array.isArray(item)) ? {...item} : {};
  const isFolder = base.kind === 'folder';
  return {
    id: safeId(base.id, 'c'),
    kind: isFolder ? 'folder' : 'item',
    parentId: safeOptionalId(base.parentId),
    type: safeStr(base.type || '收藏', STR_LIMITS.type),
    title: safeStr(base.title || '未命名收藏', STR_LIMITS.title),
    note: safeStr(base.note || '', STR_LIMITS.note),
    content: safeStr(base.content || '', STR_LIMITS.content)
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
async function toggleResolved(id){
  if (!lockMemoryAction(id)) return;
  const m = state.memories.find(item => item.id === id);
  if (!m){ unlockMemoryAction(id); return; }
  const newResolved = !m.resolved;
  const fields = {resolved: newResolved};
  if (!newResolved) fields.last_active = nowIso();
  try {
    const saved = await apiPatchMemory(id, fields);
    state.memories = state.memories.map(item => item.id === id ? saved : item);
    renderAfterMemoryApiChange();
    showToast(newResolved ? '已沉底，不再主动浮现' : '已重新激活', null, false);
    openMemoryDetail(id);
  } catch(err) {
    showToast(classifyApiError(err), null, false);
  } finally {
    unlockMemoryAction(id);
  }
}
async function togglePinned(id){
  if (!lockMemoryAction(id)) return;
  const m = state.memories.find(item => item.id === id);
  if (!m){ unlockMemoryAction(id); return; }
  const newPinned = !m.pinned;
  const fields = {pinned: newPinned};
  if (newPinned) {
    fields.importance = 10;
    fields.protected = true;
  } else if (!isProtectedLayer(m.layer)) {
    fields.protected = false;
  }
  try {
    const saved = await apiPatchMemory(id, fields);
    state.memories = state.memories.map(item => item.id === id ? saved : item);
    renderAfterMemoryApiChange();
    showToast(newPinned ? '已钉选，优先保留' : '已取消钉选', null, false);
    openMemoryDetail(id);
  } catch(err) {
    showToast(classifyApiError(err), null, false);
  } finally {
    unlockMemoryAction(id);
  }
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
  const moods = diaryMemories().filter(d => d.date === date).flatMap(d => d.moods || []);
  const raw = moods[0] || state.memories.find(m => m.layer === 'daily' && m.date === date)?.mood || '';
  const map = {开心:'开心', 兴奋:'开心', 感动:'重要', 平静:'平静', 撒娇:'平静', 难过:'低落', 委屈:'低落', 思念:'低落', 不安:'不安', 生气:'不安'};
  return map[raw] || '';
}
function normalizePeriod(p){
  if (!p || typeof p !== 'object' || !p.startDate) return null;
  const now = nowIso();
  return {
    id: p.id || uid('per'),
    startDate: p.startDate,
    endDate: p.endDate || '',
    note: p.note || '',
    created_at: p.created_at || now,
    updated_at: p.updated_at || now
  };
}
function normalizeState(raw){
  const def = defaultState();
  const r = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
  const s = {...def, ...r};
  s.profile = {...def.profile, ...(r.profile || {})};
  s.automation = {...def.automation, ...(r.automation || {})};
  s.health = {...def.health, ...(r.health || {})};
  s.health.cycle = {...def.health.cycle, ...(r.health?.cycle || {})};
  s.health.cycle.periods = safeArray(r.health?.cycle?.periods, [])
    .map(normalizePeriod).filter(Boolean);
  if (s.health.cycle.periods.length === 0 && s.health.cycle.lastPeriodStart) {
    s.health.cycle.periods = [normalizePeriod({
      id: uid('per'),
      startDate: s.health.cycle.lastPeriodStart
    })];
  }
  s.health.reminders = safeArray(r.health?.reminders, def.health.reminders);
  s.health.daily = safeArray(r.health?.daily, def.health.daily);
  s.health.logs = safeArray(r.health?.logs, def.health.logs);
  s.calendarNotes = (r.calendarNotes && typeof r.calendarNotes === 'object' && !Array.isArray(r.calendarNotes)) ? r.calendarNotes : {};
  s.memories = safeArray(r.memories, def.memories).map(normalizeMemoryMeta);
  s.bottles = safeArray(r.bottles, def.bottles).map(normalizeBottleMeta);
  s.diaries = safeArray(r.diaries, def.diaries).map(normalizeDiary);
  s.collections = safeArray(r.collections, def.collections).map(normalizeCollection);
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
const memoryActionLocks = new Set();
function lockMemoryAction(id){ if (!id || memoryActionLocks.has(id)) return false; memoryActionLocks.add(id); return true; }
function unlockMemoryAction(id){ if (id) memoryActionLocks.delete(id); }

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
  setState: async (next) => { state = clone(next); await persist(); renderAll(); },
  mergeRemoteData: async (partial) => { state = {...state, ...partial}; await persist(); renderAll(); },
  exportState: () => JSON.stringify(state, null, 2),
  importState: async (text) => {
    const parsed = JSON.parse(text);
    // Route memories through API when authenticated
    const memoriesToImport = Array.isArray(parsed.memories) ? parsed.memories : [];
    let memWritten = 0, memFailed = 0;
    if (memoriesToImport.length && getFrontendAccessToken()) {
      const existingIds = new Set(state.memories.map(m => m.id));
      const existingLegacyIds = new Set(state.memories.map(m => m.legacy_id).filter(Boolean));
      for (const raw of memoriesToImport){
        const origId = typeof raw.id === 'string' ? raw.id : '';
        if (existingIds.has(origId) || existingLegacyIds.has(origId)) continue;
        const record = normalizeMemoryMeta(raw);
        if (!isValidUUID(origId)){ if (origId) record.legacy_id = origId; delete record.id; }
        if (record.legacy_id) existingLegacyIds.add(record.legacy_id);
        try {
          const saved = await apiWriteMemory(record);
          existingIds.add(saved.id);
          memWritten++;
        } catch(apiErr){
          // 401/403 是鉴权问题，直接抛出让上层感知
          if (apiErr.status === 401 || apiErr.status === 403 || apiErr.code === 'no_token') throw apiErr;
          memFailed++;
        }
      }
      try { state.memories = await fetchAllMemoriesFromApi(); } catch(e){}
    }
    // Apply all other fields via vault_state; memories come from API above
    const base = normalizeState({...parsed, memories: []});
    state = {...base, memories: state.memories};
    const r = await persist(); renderAll();
    const memNote = memFailed ? `（${memFailed} 条记忆写入失败）` : '';
    if (r?.ok) showToast(`已导入数据，写入记忆 ${memWritten} 条${memNote}`, null, false);
  },
  configureAutomation: async (cfg = {}) => {
    state.automation = {...state.automation, ...cfg};
    await persist();
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
if (typeof window !== 'undefined' && window.MEMORY_VAULT_DEBUG === true) {
  window.MemoryVaultBridge = MemoryVaultBridge;
}

async function persist(){
  if (!remoteReadOk) {
    showToast('云端读取失败，已暂停保存，请先重试连接。', null, false);
    return {ok:false, reason:'locked'};
  }
  runCleanupRules();
  persistLocalCache(state);
  const result = await queueStateWriteToSupabase(state);
  if (result?.ok) return {ok:true};
  if (result?.conflict) return {ok:false, reason:'conflict'}; // modal already shown by handleWriteConflict
  if (result?.skipped || result?.reason === 'not_ready') {
    showToast('云端未就绪，暂不保存', null, false);
    return {ok:false, reason: result.reason || 'skipped'};
  }
  showToast('保存失败，请检查网络', null, false);
  return {ok:false, reason:'error'};
}
function uid(prefix='id'){ return prefix + '_' + Math.random().toString(36).slice(2,9); }
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUUID(s){ return typeof s === 'string' && UUID_RE.test(s); }
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
function getChordTag(item = {}){ return item?.raw?.chord_tag || item?.chord_tag || ''; }
function layerMeta(layer){ return LAYERS[layer] || {name:layer,color:'#D8C6A5',bg:'#F8F3EE'}; }
function sortByDateDesc(arr, key='date'){ return [...arr].sort((a,b) => String(b[key]||'').localeCompare(String(a[key]||''))); }
function unreadCount(){ return state.bottles.filter(b => !b.read && !b._archived).length; }
function latestTodaySnapshot(){
  const item = sortByDateDesc(state.memories.filter(m => ['daily','diary'].includes(m.layer) && m.today_snapshot), 'date')[0];
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
let memoryFormSubmitting = false;
let diaryFormSubmitting = false;
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
  const periods = safeArray(cycle.periods, []);
  const latestPeriod = periods.reduce((best, p) => {
    if (!best || p.startDate > best.startDate) return p;
    return best;
  }, null);
  const baseStart = latestPeriod ? latestPeriod.startDate : cycle.lastPeriodStart;
  const periodStart = new Date(baseStart + 'T00:00:00');
  const now = new Date();
  let next = new Date(periodStart.getTime() + cycle.cycleLength * 86400000);
  while (next <= now) next = new Date(next.getTime() + cycle.cycleLength * 86400000);
  const ovulation = new Date(next.getTime() - 14 * 86400000);
  const daysUntil = Math.ceil((next - now) / 86400000);
  const isInPeriod = !!latestPeriod && now >= periodStart && !latestPeriod.endDate;
  const currentPeriod = isInPeriod ? latestPeriod : null;
  return {next, ovulation, daysUntil, latestPeriod, currentPeriod, isInPeriod};
}
async function saveAndRender(){ floatMemCache = null; floatMemDate = ''; const r = await persist(); renderAll(); return r; }
function renderAfterMemoryApiChange(){ floatMemCache = null; floatMemDate = ''; persistLocalCache(state); renderAll(); }
function closeModal(){
  if (modalSheet.dataset.locked === 'true') return;
  modal.classList.remove('show');
  modalSheet.innerHTML = '';
  delete modalSheet.dataset.locked;
}
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
    const fn = action;
    toast.classList.remove('show');
    toastAction.onclick = null;
    clearTimeout(toastTimer);
    if (fn) fn();
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
    <button class="tab-btn ${t.key===currentTab?'active':''}" data-key="${t.key}" data-action="switch-tab" data-id="${t.key}">
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
        <div class="card" style="background:linear-gradient(135deg,var(--lpink),var(--cream));cursor:pointer" data-action="open-memory" data-id="${escapeHtml(floatMem.id)}">
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
      <div class="card" style="background:var(--lblue);cursor:pointer" data-action="switch-tab" data-id="bottle">
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

function memoryResultsHtml(){
  let list = state.memories.filter(m => MEMORY_FILTERS.includes(m.layer) && !m._archived && isVisibleMemory(m));
  if (currentLayer !== 'all') list = list.filter(m => m.layer === currentLayer);
  if (currentLayer === 'core' && currentCoreSub !== 'all') list = list.filter(m => m.sub_layer === currentCoreSub);
  list = filterMemoriesByQuery(list, searchText);
  list = sortByDateDesc(list, 'date');
  return list.length ? list.map(m => memoryCard(m)).join('') : '<div class="empty">这里暂时没有符合筛选条件的记录。</div>';
}

function renderMemory(){
  const filters = [{key:'all',name:'全部'}, ...MEMORY_FILTERS.filter(k=>k!=='all').map(k=>({key:k,name:LAYERS[k].name}))];
  document.getElementById('page-memory').innerHTML = `
    <div class="page-top">
      <div class="title">记忆</div>
      <div class="subtitle">支持手动新增、编辑、删除，也可以直接改文字和记录。</div>
    </div>
    <div class="toolbar">
      <button class="toolbar-btn primary" onclick="openMemoryForm()">新建记录</button>
      <button class="toolbar-btn" data-action="open-import-panel">导入候选</button>
    </div>
    <div class="search-shell">
      <span class="search-label">搜索</span>
      <input class="search-input clean" placeholder="" value="${escapeHtml(searchText)}" oninput="searchText=this.value;document.getElementById('memory-results').innerHTML=memoryResultsHtml()">
      <span class="search-icon" style="display:inline-block;transform:scaleX(-1)">⌕</span>
    </div>
    <div class="filter-bar" style="margin-bottom:${currentLayer === 'core' ? '0' : '14px'}">${filters.map(f=>{
      const active = currentLayer === f.key;
      const meta = LAYERS[f.key] || {bg:'#F8F3EE',color:'#7E7674'};
      return `<button class="filter-btn ${active?'active':''}" style="background:${active?meta.bg:'transparent'};color:${active?meta.color:'rgba(126,118,116,.55)'}" data-action="set-layer" data-id="${escapeHtml(f.key)}">${f.name}</button>`;
    }).join('')}</div>
    ${currentLayer === 'core' ? `<div class="subfilter-bar" style="margin:10px 0 14px">${[{key:'all',name:'全部子分区'},...Object.entries(CORE_SUBLAYERS).map(([key,name])=>({key,name}))].map(s=>`<button class="subfilter-btn ${currentCoreSub===s.key?'active':''}" style="background:${currentCoreSub===s.key?'rgba(245,239,223,.95)':'transparent'};color:${currentCoreSub===s.key?'#B29263':'rgba(126,118,116,.55)'}" data-action="set-core-sub" data-id="${escapeHtml(s.key)}">${s.name}</button>`).join('')}</div>` : ''}
    <div class="note-box" style="margin-bottom:14px">${escapeHtml(currentLayer === 'core' ? coreSubNotesText(currentCoreSub) : layerNotesText(currentLayer))}</div>
    <div id="memory-results">${memoryResultsHtml()}</div>
  `;
}

function memoryCard(m){
  const meta = layerMeta(m.layer);
  const tags = (m.keywords || []).slice(0,4).map(k => `<span class="tag">${escapeHtml(k)}</span>`).join('');
  const sub = m.sub_layer ? ` · ${CORE_SUBLAYERS[m.sub_layer] || m.sub_layer}` : '';
  const status = [m.pinned ? '📌 已钉选' : '', m.resolved ? '✓ 已解决' : ''].filter(Boolean)
    .map(label => `<span class="mini-chip">${label}</span>`).join('');
  return `
    <div class="mem-card" style="background:${meta.bg};${m.resolved ? 'opacity:.72;' : ''}" data-action="open-memory" data-id="${escapeHtml(m.id)}">
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

function diaryMemories(){
  return state.memories.filter(m => m.layer === 'diary' && !m._archived);
}

function filteredDiaries(){
  const q = (diarySearchText || '').trim();
  let list = diaryMemories().slice();
  if (q) {
    list = list.filter(item => [item.title, item.content, item.date, item.author, getChordTag(item), ...(item.keywords || []), ...(item.moods || [])]
      .filter(Boolean)
      .some(v => String(v).includes(q)));
  }
  return sortByDateDesc(list, 'date');
}

function filterMemoriesByQuery(list = [], q = ''){
  const keyword = String(q || '').trim();
  if (!keyword) return list.slice();
  return list.filter(m => [m.title, m.content, m.why_precious, m.today_snapshot, m.sub_layer, getChordTag(m), (m.keywords || []).join(' ')]
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

function diaryResultsHtml(){
  const groups = groupedDiaries();
  return groups.map(([date, pair]) => `
      <div class="diary-day">
        <div class="diary-dateline"><span>${date}</span></div>
        <div class="diary-cols">
          ${diaryCol('小克', pair.ke, 'var(--lblue)')}
          ${diaryCol('沅沅', pair.yuan, 'var(--lpink)')}
        </div>
      </div>
    `).join('') || '<div class="empty">没有匹配到日记。</div>';
}

function renderDiary(){
  document.getElementById('page-diary').innerHTML = `
    <div class="page-top">
      <div class="title">文字，自始至终</div>
      <div class="subtitle">双栏并排；点开就能看全文，也能继续手动补写。</div>
    </div>
    <div class="toolbar" style="align-items:stretch;gap:10px;flex-wrap:wrap">
      <button class="toolbar-btn primary" onclick="openDiaryForm()">新建日记</button>
      <div class="search-shell" style="flex:1;min-width:220px;margin:0">
        <span class="search-label">搜索</span>
        <input class="search-input clean" placeholder="" value="${escapeHtml(diarySearchText)}" oninput="diarySearchText=this.value;document.getElementById('diary-results').innerHTML=diaryResultsHtml()">
        <span class="search-icon" style="display:inline-block;transform:scaleX(-1)">⌕</span>
      </div>
    </div>
    <div id="diary-results">${diaryResultsHtml()}</div>
  `;
}

function diaryCol(author, entry, bg){
  if (!entry) return `<div class="diary-col" style="background:${bg};opacity:.4"><div class="author">${author}</div><div class="diary-empty">—</div></div>`;
  const mood = (entry.moods || []).map(m => `<span class="mini-chip" style="background:rgba(255,253,251,.66);color:${moodColor(m)}">${m}</span>`).join('');
  const chord = getChordTag(entry);
  const chordChip = chord ? `<span class="mini-chip">♪ ${escapeHtml(chord)}</span>` : '';
  return `
    <div class="diary-col" style="background:${bg}" data-action="open-diary" data-id="${escapeHtml(entry.id)}">
      <div class="author">${author}</div>
      <div class="dtitle">${escapeHtml(entry.title)}</div>
      <div class="dcontent">${escapeHtml(entry.content)}</div>
      <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px">${mood}${chordChip}</div>
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
      <div class="bottle ${b.read?'':'unread'}" style="background:${b.read?'var(--cream)':'var(--lblue)'}" data-action="open-bottle" data-id="${escapeHtml(b.id)}">
        ${b.read ? '' : '<div class="undot"></div>'}
        <div class="bottle-head"><span class="small" style="color:var(--gold);letter-spacing:1px">${escapeHtml(b.from)}</span><span class="bottle-date">${escapeHtml(b.date)}</span></div>
        <div class="preview" style="-webkit-line-clamp:3">${escapeHtml(b.content)}</div>
        ${b.scheduled ? '<div class="small muted" style="margin-top:8px">◇ 定时送达</div>' : ''}
      </div>
    `).join('') || '<div class="empty">还没有漂流瓶。</div>'}
  `;
}

function computeStats(){
  const byLayer = {core:0,daily:0,memo:0,health:0,treasure:0,diary:0,message:state.bottles.length};
  const words = {core:0,daily:0,memo:0,health:0,treasure:0,diary:0,message:0};
  state.memories.forEach(m => {
    if (!isVisibleMemory(m)) return;
    if (byLayer[m.layer] !== undefined) {
      byLayer[m.layer] += 1;
      words[m.layer] += (m.content || '').length;
    }
  });
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
        <div><div class="stat-num">${diaryMemories().length}</div><div class="archive-stat-label">篇日记</div></div>
      </div>
    </div>

    <div class="section">
      <div class="section-label">各分类详情</div>
      <div class="archive-grid">
        ${Object.keys(LAYERS).map(k => {
          const meta = layerMeta(k); const count = stats.byLayer[k] ?? 0; const word = stats.words[k] ?? 0;
          return `<div class="layer-box" style="background:${meta.bg}" data-action="jump-layer" data-id="${escapeHtml(k)}"><div class="lname" style="color:${meta.color}">${meta.name}</div><div class="lcount">${count}</div><div class="lwords">${word} 字</div></div>`;
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
  openMemoryDetail(id);
}
function archivedMemoryResultsHtml(){
  const list = filterMemoriesByQuery(archivedMemoryList(), archivedSearchText);
  return list.length ? list.map(m => archivedMemoryCard(m)).join('') : '<div class="empty">这里暂时没有符合搜索条件的归档记录。</div>';
}

function updateArchivedSearchResults(){
  const allItems = archivedMemoryList();
  const list = filterMemoriesByQuery(allItems, archivedSearchText);
  const resultsEl = document.getElementById('archived-memory-results');
  if (resultsEl) resultsEl.innerHTML = archivedMemoryResultsHtml();
  const countEl = document.getElementById('archived-memory-count');
  if (countEl) countEl.textContent = list.length;
  const subtitleEl = document.getElementById('archived-memory-subtitle');
  if (subtitleEl) subtitleEl.textContent = `共 ${allItems.length} 条${archivedSearchText.trim() ? ` · 当前匹配 ${list.length} 条` : ''}`;
}

function renderArchivedMemoriesView(){
  const allItems = archivedMemoryList();
  const list = filterMemoriesByQuery(allItems, archivedSearchText);
  const total = allItems.length;
  const shown = list.length;
  showEditor(`
    <div id="archived-memories-editor">
      <div class="editor-header"><button class="editor-back" onclick="closeEditor()">←</button><div><div class="modal-title">已归档的聊天记录</div><div id="archived-memory-subtitle" class="subtitle">共 ${total} 条${archivedSearchText.trim() ? ` · 当前匹配 ${shown} 条` : ''}</div></div></div>
      <div class="editor-main form-grid">
        <div class="note-box">这里保留已经归档的记忆条目。搜索逻辑与未归档记忆保持一致，点开后仍可查看和编辑具体内容。</div>
        <div class="search-shell" style="margin-bottom:0">
          <span class="search-label">搜索</span>
          <input class="search-input clean" placeholder="" value="${escapeHtml(archivedSearchText)}" oninput="archivedSearchText=this.value;updateArchivedSearchResults()">
          <span class="search-icon" style="display:inline-block;transform:scaleX(-1)">⌕</span>
        </div>
        <div class="archive-memory-summary">
          <span>已归档记忆</span>
          <strong id="archived-memory-count">${shown}</strong>
        </div>
        <div id="archived-memory-results">${archivedMemoryResultsHtml()}</div>
      </div>
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
    <div class="mem-card archive-memory-card" style="background:${meta.bg};opacity:.78" data-action="open-memory-from-editor" data-id="${escapeHtml(m.id)}">
      <div class="meta">
        <div class="layer-tag" style="color:${meta.color};background:rgba(255,253,251,.58)">${meta.name}${sub}</div>
        <div class="date">${escapeHtml(m.date)}</div>
      </div>
      <div class="title-txt">${escapeHtml(m.title)}</div>
      <div class="preview">${escapeHtml(m.content)}</div>
      <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">${status}</div>
      ${tags ? `<div style="margin-top:8px;display:flex;gap:5px;flex-wrap:wrap">${tags}</div>` : ''}
      <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">
        <button class="ghost-btn" style="font-size:.8rem;padding:4px 10px" data-action="restore-archived-memory" data-id="${escapeHtml(m.id)}">移出归档</button>
        <button class="danger-btn" style="font-size:.8rem;padding:4px 10px" data-action="open-permanent-delete-memory-confirm" data-id="${escapeHtml(m.id)}">删除</button>
      </div>
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

function memoryDebugSection(m){
  const na = '<span class="dbg-na">N/A</span>';
  const boolVal = v => {
    if (v == null || v === '') return null;
    if (v === true  || v === 'true'  || v === 1 || v === '1') return true;
    if (v === false || v === 'false' || v === 0 || v === '0') return false;
    return !!v;
  };
  const bool = (v, t, f) => {
    const b = boolVal(v);
    if (b == null) return na;
    return b ? `<span class="dbg-badge dbg-yes">${t}</span>` : `<span class="dbg-badge dbg-no">${f}</span>`;
  };
  const txt = v => (v == null || v === '') ? na : `<span class="dbg-txt">${escapeHtml(String(v))}</span>`;
  const fmtDate = v => v ? txt(String(v).replace('T',' ').split('.')[0]) : na;
  const trunc = (v, n=80) => { const s = String(v ?? ''); return s === '' ? na : `<span class="dbg-txt">${escapeHtml(s.slice(0, n))}${s.length > n ? '…' : ''}</span>`; };
  const archived = m._archived ?? m.archived;
  const rows = [
    ['resolved',         bool(m.resolved,  '已解决', '未解决')],
    ['digested',         bool(m.digested,  '已消化', '未消化')],
    ['protected',        bool(m.protected, '受保护', '可编辑')],
    ['archived',         bool(archived,    '已归档', '未归档')],
    ['anchor',           bool(m.anchor,    '已锚定', '未锚定')],
    ['activation_count', txt(m.activation_count)],
    ['last_active',      fmtDate(m.last_active)],
    ['bucket',           txt(m.bucket)],
    ['layer',            txt(m.layer)],
    ['source',           txt(m.source)],
    ['confidence',       m.confidence != null ? txt(m.confidence) : na],
    ['valence',          m.valence   != null ? txt(m.valence)   : na],
    ['arousal',          m.arousal   != null ? txt(m.arousal)   : na],
    ['intimacy',         m.intimacy  != null ? txt(m.intimacy)  : na],
    ['safety',           m.safety    != null ? txt(m.safety)    : na],
    ['texture',          trunc(m.texture)],
  ];
  return `<details class="dbg-section"><summary class="dbg-summary">状态与调试</summary><div class="dbg-grid">${rows.map(([k,v])=>`<span class="dbg-key">${k}</span><span class="dbg-val-cell">${v}</span>`).join('')}</div></details>`;
}

function renderRingComments(memoryId, m){
  const comments = Array.isArray(m.raw?.ring_comments) ? m.raw.ring_comments : [];
  const rows = comments.map(c => `
    <div class="ring-comment">
      <div class="ring-comment-body">${escapeHtml(c.content || '')}</div>
      <div class="ring-comment-meta">
        <span>${escapeHtml(c.author || '')}</span>
        <span>${escapeHtml(String(c.created_at || '').replace('T',' ').split('.')[0])}</span>
        <button class="ring-delete-btn" data-action="delete-ring-comment" data-id="${escapeHtml(memoryId)}" data-arg="${escapeHtml(c.id)}">×</button>
      </div>
    </div>`).join('');
  return `<div class="soft-card" style="margin-top:14px">
    <div class="section-label" style="margin-bottom:4px">年轮</div>
    <div class="input-helper" style="margin-bottom:${comments.length?'0':'10px'}">旧记忆被重新理解时，写在这里。</div>
    ${rows}
    <div class="ring-input-row">
      <label class="input-shell"><textarea id="ring-comment-input" class="textarea-compact" placeholder="写下新的理解…"></textarea></label>
      <div class="ring-input-footer">
        <select id="ring-comment-author" class="ring-author-sel">${AUTHOR_OPTIONS.map(a=>`<option value="${a}">${a}</option>`).join('')}</select>
        <button class="solid-btn" data-action="add-ring-comment" data-id="${escapeHtml(memoryId)}">添加年轮</button>
      </div>
    </div>
  </div>`;
}

function openMemoryDetail(id){
  const changed = touchMemory(id, true);
  const m = state.memories.find(item => item.id === id); if (!m) return;
  if (changed) persistLocalCache(state);
  const meta = layerMeta(m.layer);
  const chord = getChordTag(m);
  const detailTags = [meta.name, m.sub_layer ? CORE_SUBLAYERS[m.sub_layer] : '', m.mood || '', (['diary','treasure'].includes(m.layer) && chord) ? `♪ ${chord}` : '', `importance ${m.importance}`, m.author || '']
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
    ${renderRingComments(id, m)}
    ${memoryDebugSection(m)}
    <div class="action-row">
      ${m._archived ? `<button class="solid-btn" data-action="restore-archived-memory" data-id="${escapeHtml(m.id)}">移出归档</button>` : `<button class="solid-btn" data-action="open-memory-form" data-id="${escapeHtml(m.id)}">编辑</button>`}
      ${!m._archived ? `<button class="ghost-btn" data-action="toggle-resolved" data-id="${escapeHtml(m.id)}">${m.resolved ? '重新激活' : '标记已解决'}</button>` : ''}
      ${!m._archived ? `<button class="ghost-btn" data-action="toggle-pinned" data-id="${escapeHtml(m.id)}">${m.pinned ? '取消钉选' : '钉选'}</button>` : ''}
      ${m._archived
        ? `<button class="danger-btn" data-action="open-permanent-delete-memory-confirm" data-id="${escapeHtml(m.id)}">删除</button>`
        : `<button class="ghost-btn" data-action="archive-memory" data-id="${escapeHtml(m.id)}">归档</button>`}
      ${!m._archived ? `<button class="ghost-btn" data-action="open-import-panel-target" data-id="${escapeHtml(m.id)}">导入候选</button>` : ''}
      <button class="ghost-btn" onclick="closeModal()">关闭</button>
    </div>
  `);
}

async function addRingComment(id){
  if (!lockMemoryAction(id)) return;
  const m = state.memories.find(item => item.id === id);
  if (!m){ unlockMemoryAction(id); return; }
  const content = (document.getElementById('ring-comment-input')?.value || '').trim();
  if (!content){ unlockMemoryAction(id); showToast('请输入内容', null, false); return; }
  const author = document.getElementById('ring-comment-author')?.value || (AUTHOR_OPTIONS[0] || '');
  const newComment = { id: uid('rc'), created_at: nowIso(), author, content };
  const existing = Array.isArray(m.raw?.ring_comments) ? m.raw.ring_comments : [];
  const nextRaw = { ...m.raw, ring_comments: [...existing, newComment] };
  try {
    const saved = await apiPatchMemory(id, { raw: nextRaw });
    state.memories = state.memories.map(item => item.id === id ? saved : item);
    renderAfterMemoryApiChange();
    openMemoryDetail(id);
  } catch(err){
    showToast(classifyApiError(err), null, false);
  } finally {
    unlockMemoryAction(id);
  }
}

async function deleteRingComment(id, commentId){
  if (!lockMemoryAction(id)) return;
  const m = state.memories.find(item => item.id === id);
  if (!m){ unlockMemoryAction(id); return; }
  const existing = Array.isArray(m.raw?.ring_comments) ? m.raw.ring_comments : [];
  const nextRaw = { ...m.raw, ring_comments: existing.filter(c => c.id !== commentId) };
  try {
    const saved = await apiPatchMemory(id, { raw: nextRaw });
    state.memories = state.memories.map(item => item.id === id ? saved : item);
    renderAfterMemoryApiChange();
    openMemoryDetail(id);
  } catch(err){
    showToast(classifyApiError(err), null, false);
  } finally {
    unlockMemoryAction(id);
  }
}

/* ============================================================
   导入候选审查面板（右侧抽屉 MVP）
   - 不写后端逻辑，只调 extract / commit 两个 REST 包装。
   - 三段：A 输入 / B 候选列表 / C 提交。
   ============================================================ */
const IMPORT_KINDS = ['memory','comment','preference','project','diary','ignore'];
const IMPORT_KIND_LABEL = {
  memory:'记忆', comment:'年轮', preference:'偏好', project:'项目', diary:'日记', ignore:'忽略'
};
const IMPORT_PROFILES = ['shared','rowan','arion','all'];
const IMPORT_LAYER_OPTIONS = ['', 'core','daily','memo','health','treasure','diary'];
const COMMIT_STATUS_META = {
  would_create:{label:'将创建', cls:'st-plan'},
  created:{label:'已创建', cls:'st-ok'},
  merged:{label:'已合并', cls:'st-ok'},
  would_comment:{label:'将写年轮', cls:'st-plan'},
  commented:{label:'已写年轮', cls:'st-ok'},
  needs_target:{label:'缺少目标', cls:'st-warn'},
  invalid:{label:'无效/忽略', cls:'st-muted'},
  error:{label:'错误', cls:'st-error'}
};
const COMMIT_SUCCESS_STATUSES = ['created','merged','commented'];

const importState = {
  open:false,
  input:{ text:'', source:'', profile:'shared', chunk_chars:6000, max_candidates:50 },
  candidates:[],
  merge:true,
  defaultTargetId:'',
  loading:{ extract:false, dry:false, commit:false },
  error:'',
  results:null,          // { mode:'dry'|'commit', items:[...] }
  hasDryRun:false,       // 是否存在一次成功 dry-run
  dryRunStale:false      // 候选自上次 dry-run 后被改动
};

function importBusy(){ return importState.loading.extract || importState.loading.dry || importState.loading.commit; }

function normalizeImportCandidate(raw = {}){
  const c = raw || {};
  let kw = c.keywords;
  if (Array.isArray(kw)) kw = kw.map(x => String(x).trim()).filter(Boolean);
  else if (typeof kw === 'string') kw = kw.split(/[,，\s]+/).map(s => s.trim()).filter(Boolean);
  else kw = [];
  let kind = String(c.kind || 'memory').toLowerCase();
  if (!IMPORT_KINDS.includes(kind)) kind = 'memory';
  let conf = c.confidence;
  conf = (conf === null || conf === undefined || conf === '') ? null : Number(conf);
  if (!Number.isFinite(conf)) conf = null;
  return {
    _cid: uid('cand'),
    _ignored: false,
    _submitted: false,
    _result: null,
    _showRaw: false,
    kind,
    suggested_layer: c.suggested_layer || c.layer || '',
    importance: clampNum(c.importance, 1, 10, 3),
    confidence: conf,
    title: c.title || '',
    content: c.content || '',
    keywords: kw,
    reason: c.reason || '',
    target_memory_hint: c.target_memory_hint || '',
    target_memory_id: c.target_memory_id || '',
    raw_excerpt: c.raw_excerpt || '',
    source: c.source || importState.input.source || ''
  };
}

function candidateToPayload(c){
  const out = {};
  Object.keys(c).forEach(k => { if (!k.startsWith('_')) out[k] = c[k]; });
  return out;
}

// 进入待提交批次的候选：未被本地忽略、未提交。kind=ignore 仍会送出（后端返回 invalid，不阻塞）。
function importBatchCandidates(){
  return importState.candidates.filter(c => !c._ignored && !c._submitted);
}

function markDryRunStale(){
  importState.dryRunStale = true;
}

function ensureImportDrawer(){
  let backdrop = document.getElementById('import-drawer-backdrop');
  if (backdrop) return backdrop;
  backdrop = document.createElement('div');
  backdrop.className = 'drawer-backdrop';
  backdrop.id = 'import-drawer-backdrop';
  backdrop.innerHTML = `<aside class="import-drawer" id="import-drawer" role="dialog" aria-modal="true" aria-label="导入候选审查"><div class="import-drawer-body" id="import-drawer-body"></div></aside>`;
  document.body.appendChild(backdrop);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeImportPanel(); });
  return backdrop;
}

function openImportPanel(defaultTargetId = ''){
  closeModal();
  ensureImportDrawer();
  importState.open = true;
  importState.defaultTargetId = defaultTargetId || '';
  if (!importState.input.source) importState.input.source = 'import-' + today();
  rerenderImport();
  document.getElementById('import-drawer-backdrop').classList.add('show');
  document.body.classList.add('drawer-open');
}

function closeImportPanel(){
  if (importBusy()) return;
  importState.open = false;
  const backdrop = document.getElementById('import-drawer-backdrop');
  if (backdrop) backdrop.classList.remove('show');
  document.body.classList.remove('drawer-open');
}

function rerenderImport(){
  const body = document.getElementById('import-drawer-body');
  if (body) body.innerHTML = renderImportPanel();
}

/* ---- 字段更新（文本类不触发重渲染，避免输入丢焦点） ---- */
function findCandidate(cid){ return importState.candidates.find(c => c._cid === cid); }

function updateImportInput(field, value){
  if (field === 'chunk_chars' || field === 'max_candidates') importState.input[field] = value;
  else importState.input[field] = value;
}
function updateCandidateField(cid, field, value){
  const c = findCandidate(cid); if (!c) return;
  if (field === 'keywords') c.keywords = String(value).split(/[,，\s]+/).map(s => s.trim()).filter(Boolean);
  else if (field === 'importance') c.importance = clampNum(value, 1, 10, c.importance);
  else c[field] = value;
  markDryRunStale();
}
function updateCandidateKind(cid, value){
  const c = findCandidate(cid); if (!c) return;
  c.kind = IMPORT_KINDS.includes(value) ? value : 'memory';
  markDryRunStale();
  rerenderImport();
}
function useCurrentAsTarget(cid){
  const c = findCandidate(cid); if (!c) return;
  c.target_memory_id = importState.defaultTargetId || '';
  markDryRunStale();
  rerenderImport();
}
function toggleCandidateIgnored(cid){
  const c = findCandidate(cid); if (!c) return;
  c._ignored = !c._ignored;
  markDryRunStale();
  rerenderImport();
}
function deleteCandidate(cid){
  importState.candidates = importState.candidates.filter(c => c._cid !== cid);
  markDryRunStale();
  rerenderImport();
}
function toggleCandidateRaw(cid){
  const c = findCandidate(cid); if (!c) return;
  c._showRaw = !c._showRaw;
  rerenderImport();
}
function setImportMerge(value){ importState.merge = !!value; markDryRunStale(); }

/* ---- 抽取 ---- */
async function runImportExtract(){
  if (importBusy()) return;
  const text = (importState.input.text || '').trim();
  if (!text){ importState.error = '请先粘贴聊天记录或文本'; rerenderImport(); return; }
  importState.loading.extract = true;
  importState.error = '';
  rerenderImport();
  const payload = { text };
  if (importState.input.source) payload.source = importState.input.source;
  if (importState.input.profile) payload.profile = importState.input.profile;
  const cc = Number(importState.input.chunk_chars); if (Number.isFinite(cc) && cc > 0) payload.chunk_chars = cc;
  const mc = Number(importState.input.max_candidates); if (Number.isFinite(mc) && mc > 0) payload.max_candidates = mc;
  try {
    const data = await apiImportCandidateExtract(payload);
    const list = Array.isArray(data?.candidates) ? data.candidates
      : (Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []));
    importState.candidates = list.map(normalizeImportCandidate);
    importState.results = null;
    importState.hasDryRun = false;
    importState.dryRunStale = false;
    if (!importState.candidates.length) importState.error = '没有抽到候选，可以调整文本或参数再试。';
  } catch(err){
    importState.error = classifyApiError(err) + '（抽取候选失败）';
  } finally {
    importState.loading.extract = false;
    rerenderImport();
  }
}

/* ---- 结果归并：把后端 results 映射回候选 ---- */
function resultStatusOf(r){
  const raw = String(r?.status || r?.action || r?.result || r?.outcome || '').toLowerCase();
  return COMMIT_STATUS_META[raw] ? raw : (raw || 'error');
}
function applyCommitResults(batch, data, mode){
  const list = Array.isArray(data?.results) ? data.results
    : (Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []));
  // 权威键是后端返回的 result.index（对应本次提交数组的位置），不依赖数组顺序。
  // batch 就是这次实际发给后端的候选数组，所以 index 与 batch 下标对齐。
  // 缺 index 时（异常/旧后端）才退回顺序兜底。
  const resultByIndex = new Map();
  list.forEach((r, i) => {
    const idx = (r && Number.isInteger(r.index)) ? r.index : i;
    if (!resultByIndex.has(idx)) resultByIndex.set(idx, r);
  });
  const items = batch.map((c, i) => {
    const r = resultByIndex.get(i) || {};
    const status = resultStatusOf(r);
    if (mode === 'commit' && COMMIT_SUCCESS_STATUSES.includes(status)){
      c._submitted = true;
      c._ignored = false;
    }
    c._result = { status, mode };
    return {
      cid: c._cid,
      kind: r.kind || c.kind,
      title: c.title || c.target_memory_hint || '(无标题)',
      status,
      target_memory_id: c.target_memory_id || '',
      ref_id: r.memory_id || r.comment_id || r.id || '',
      message: r.message || r.error || r.detail || ''
    };
  });
  importState.results = { mode, items };
}

/* ---- dry-run 预览 ---- */
async function runImportDryRun(){
  if (importBusy()) return;
  const batch = importBatchCandidates();
  if (!batch.length){ importState.error = '没有可预览的候选'; rerenderImport(); return; }
  importState.loading.dry = true;
  importState.error = '';
  rerenderImport();
  try {
    const data = await apiImportCandidateCommit({
      candidates: batch.map(candidateToPayload),
      dry_run: true,
      merge: importState.merge
    });
    applyCommitResults(batch, data, 'dry');
    importState.hasDryRun = true;
    importState.dryRunStale = false;
  } catch(err){
    importState.error = classifyApiError(err) + '（dry-run 失败）';
  } finally {
    importState.loading.dry = false;
    rerenderImport();
  }
}

/* ---- 正式提交（dry_run=false） ---- */
async function runImportCommit(){
  if (importBusy()) return;
  if (!importState.hasDryRun || importState.dryRunStale){
    importState.error = '请先 dry-run 预览，确认无误后再提交。';
    rerenderImport();
    return;
  }
  const batch = importBatchCandidates();
  if (!batch.length){ importState.error = '没有待提交的候选'; rerenderImport(); return; }
  const needTargets = batch.filter(c => c.kind === 'comment' && !String(c.target_memory_id || '').trim());
  const warn = needTargets.length ? `有 ${needTargets.length} 条年轮候选还没填目标记忆，将返回 needs_target。\n` : '';
  if (!window.confirm(`${warn}确认把 ${batch.length} 条候选正式写入记忆库？`)) return;
  importState.loading.commit = true;
  importState.error = '';
  rerenderImport();
  try {
    const data = await apiImportCandidateCommit({
      candidates: batch.map(candidateToPayload),
      dry_run: false,
      merge: importState.merge
    });
    applyCommitResults(batch, data, 'commit');
    // 写库后强制重新 dry-run 才能再次提交剩余候选
    importState.hasDryRun = false;
    importState.dryRunStale = true;
    const okCount = importState.results.items.filter(it => COMMIT_SUCCESS_STATUSES.includes(it.status)).length;
    // 刷新底层记忆列表，让新写入的记忆/年轮立即可见
    try {
      const fresh = await fetchAllMemoriesFromApi();
      if (Array.isArray(fresh) && fresh.length){ state.memories = fresh; renderAfterMemoryApiChange(); }
    } catch(e){}
    if (okCount) showToast(`已提交 ${okCount} 条候选`, null, false);
  } catch(err){
    importState.error = classifyApiError(err) + '（提交失败）';
  } finally {
    importState.loading.commit = false;
    rerenderImport();
  }
}

/* ---- 渲染 ---- */
function importBadge(kind){
  return `<span class="cand-kind k-${kind}">${IMPORT_KIND_LABEL[kind] || kind}</span>`;
}
function renderImportCandidate(c){
  const isComment = c.kind === 'comment';
  const needTarget = isComment && !String(c.target_memory_id || '').trim();
  const res = c._result;
  const resBadge = res ? `<span class="commit-pill ${COMMIT_STATUS_META[res.status]?.cls || ''}">${COMMIT_STATUS_META[res.status]?.label || res.status}</span>` : '';
  const confTxt = (c.confidence !== null && c.confidence !== undefined) ? `conf ${(+c.confidence).toFixed(2)}` : '';
  const metaChips = [
    c.suggested_layer ? `层 ${LAYERS[c.suggested_layer]?.name || c.suggested_layer}` : '',
    `imp ${c.importance}`,
    confTxt
  ].filter(Boolean).map(t => `<span class="cand-meta-chip">${escapeHtml(t)}</span>`).join('');
  const kindOptions = IMPORT_KINDS.map(k => `<option value="${k}" ${c.kind===k?'selected':''}>${IMPORT_KIND_LABEL[k]}</option>`).join('');
  const layerOptions = IMPORT_LAYER_OPTIONS.map(l => `<option value="${l}" ${c.suggested_layer===l?'selected':''}>${l ? (LAYERS[l]?.name || l) : '（不指定）'}</option>`).join('');
  const impOptions = [1,2,3,4,5,6,7,8,9,10].map(n => `<option value="${n}" ${Number(c.importance)===n?'selected':''}>${n}</option>`).join('');
  return `
  <div class="cand ${c._ignored?'is-ignored':''} ${c._submitted?'is-submitted':''} ${needTarget?'need-target':''}">
    <div class="cand-head">
      ${importBadge(c.kind)}
      ${resBadge}
      ${c._submitted ? '<span class="commit-pill st-ok">已提交</span>' : ''}
      ${c._ignored ? '<span class="commit-pill st-muted">已忽略</span>' : ''}
      <div class="cand-meta-row">${metaChips}</div>
    </div>
    <label class="cand-field"><span>标题</span>
      <input class="cand-input" value="${escapeHtml(c.title)}" oninput="updateCandidateField('${c._cid}','title',this.value)"></label>
    <label class="cand-field"><span>内容</span>
      <textarea class="cand-input cand-textarea" oninput="updateCandidateField('${c._cid}','content',this.value)">${escapeHtml(c.content)}</textarea></label>
    <div class="cand-grid">
      <label class="cand-field"><span>kind</span>
        <select class="cand-input" onchange="updateCandidateKind('${c._cid}',this.value)">${kindOptions}</select></label>
      <label class="cand-field"><span>层 suggested_layer</span>
        <select class="cand-input" onchange="updateCandidateField('${c._cid}','suggested_layer',this.value)">${layerOptions}</select></label>
      <label class="cand-field"><span>importance</span>
        <select class="cand-input" onchange="updateCandidateField('${c._cid}','importance',this.value)">${impOptions}</select></label>
      <label class="cand-field"><span>source</span>
        <input class="cand-input" value="${escapeHtml(c.source)}" oninput="updateCandidateField('${c._cid}','source',this.value)"></label>
    </div>
    <label class="cand-field"><span>keywords（逗号/空格分隔）</span>
      <input class="cand-input" value="${escapeHtml((c.keywords||[]).join(', '))}" oninput="updateCandidateField('${c._cid}','keywords',this.value)"></label>
    ${isComment ? `
    <div class="cand-target ${needTarget?'warn':''}">
      <label class="cand-field"><span>target_memory_id（年轮目标）${needTarget?'<em>· 必填，否则 needs_target</em>':''}</span>
        <input class="cand-input" value="${escapeHtml(c.target_memory_id)}" placeholder="目标记忆 id" oninput="updateCandidateField('${c._cid}','target_memory_id',this.value)"></label>
      ${importState.defaultTargetId ? `<button class="mini-btn" data-action="import-use-current" data-id="${c._cid}">用当前记忆作为年轮目标</button>` : ''}
    </div>` : ''}
    ${c.reason ? `<div class="cand-aux"><span class="cand-aux-k">reason</span> ${escapeHtml(c.reason)}</div>` : ''}
    ${c.target_memory_hint ? `<div class="cand-aux"><span class="cand-aux-k">hint</span> ${escapeHtml(c.target_memory_hint)}</div>` : ''}
    ${c.raw_excerpt ? `
      <button class="cand-raw-toggle" data-action="import-toggle-raw" data-id="${c._cid}">${c._showRaw?'收起 raw_excerpt ▲':'展开 raw_excerpt ▼'}</button>
      ${c._showRaw ? `<pre class="cand-raw">${escapeHtml(c.raw_excerpt)}</pre>` : ''}` : ''}
    <div class="cand-actions">
      <button class="mini-btn" data-action="import-toggle-ignore" data-id="${c._cid}">${c._ignored?'恢复':'忽略'}</button>
      <button class="mini-btn danger" data-action="import-delete-cand" data-id="${c._cid}">删除</button>
    </div>
  </div>`;
}

function renderImportResults(){
  const r = importState.results;
  if (!r || !r.items.length) return '';
  const order = ['error','needs_target','invalid','would_create','would_comment','created','merged','commented'];
  const sorted = [...r.items].sort((a,b) => order.indexOf(a.status) - order.indexOf(b.status));
  const rows = sorted.map(it => {
    const meta = COMMIT_STATUS_META[it.status] || {label:it.status, cls:'st-error'};
    const hi = (it.status === 'needs_target') ? 'res-hi' : (it.status === 'error' || it.status === 'invalid' ? 'res-flag' : '');
    const extra = it.status === 'needs_target' ? '<div class="res-hint">请填写 target_memory_id 后重新 dry-run</div>'
      : (it.message ? `<div class="res-hint">${escapeHtml(it.message)}</div>` : '');
    const idTxt = it.ref_id ? `<span class="res-id">#${escapeHtml(String(it.ref_id).slice(0,8))}</span>` : '';
    return `<div class="res-row ${hi}">
      <span class="commit-pill ${meta.cls}">${meta.label}</span>
      ${importBadge(it.kind)}
      <span class="res-title">${escapeHtml(it.title)}</span>
      ${idTxt}
      ${extra}
    </div>`;
  }).join('');
  const counts = {};
  r.items.forEach(it => { counts[it.status] = (counts[it.status]||0)+1; });
  const summary = Object.keys(counts).map(s => `${(COMMIT_STATUS_META[s]?.label)||s} ${counts[s]}`).join(' · ');
  return `
    <div class="import-results">
      <div class="import-results-head">
        <span class="section-label" style="margin:0">${r.mode==='dry'?'dry-run 预览':'提交结果'}</span>
        ${importState.dryRunStale && r.mode==='dry' ? '<span class="stale-tag">已过期，请重新 dry-run</span>' : ''}
      </div>
      <div class="res-summary">${escapeHtml(summary)}</div>
      ${rows}
    </div>`;
}

function renderImportPanel(){
  const i = importState.input;
  const profileOptions = IMPORT_PROFILES.map(p => `<option value="${p}" ${i.profile===p?'selected':''}>${p}</option>`).join('');
  const cands = importState.candidates;
  const batch = importBatchCandidates();
  const submitDisabled = importBusy() || !batch.length || !importState.hasDryRun || importState.dryRunStale;
  const dryDisabled = importBusy() || !batch.length;

  // B 区
  let listHtml;
  if (importState.loading.extract){
    listHtml = '<div class="import-state-box">正在抽取候选…</div>';
  } else if (!cands.length){
    listHtml = '<div class="import-state-box empty">还没有候选。粘贴文本后点「抽取候选」。</div>';
  } else {
    listHtml = cands.map(renderImportCandidate).join('');
  }

  return `
  <div class="import-top">
    <div>
      <div class="import-title">导入候选 · 审查工作台</div>
      <div class="import-sub">粘贴 → 抽取 → 编辑 → dry-run → 提交。dry-run 不写库。</div>
    </div>
    <button class="close-btn" data-action="import-close" aria-label="关闭">✕</button>
  </div>

  ${importState.error ? `<div class="import-error">${escapeHtml(importState.error)}</div>` : ''}

  <section class="import-sec">
    <div class="section-label">A · 输入</div>
    <label class="cand-field"><span>聊天记录 / Markdown / 纯文本</span>
      <textarea class="cand-input import-text" placeholder="把要整理的内容粘贴到这里…" oninput="updateImportInput('text',this.value)">${escapeHtml(i.text)}</textarea></label>
    <div class="cand-grid">
      <label class="cand-field"><span>source</span>
        <input class="cand-input" value="${escapeHtml(i.source)}" oninput="updateImportInput('source',this.value)"></label>
      <label class="cand-field"><span>profile</span>
        <select class="cand-input" onchange="updateImportInput('profile',this.value)">${profileOptions}</select></label>
      <label class="cand-field"><span>chunk_chars</span>
        <input class="cand-input" type="number" min="500" value="${escapeHtml(String(i.chunk_chars))}" oninput="updateImportInput('chunk_chars',this.value)"></label>
      <label class="cand-field"><span>max_candidates</span>
        <input class="cand-input" type="number" min="1" value="${escapeHtml(String(i.max_candidates))}" oninput="updateImportInput('max_candidates',this.value)"></label>
    </div>
    <button class="solid-btn" data-action="import-extract" ${importState.loading.extract?'disabled':''}>${importState.loading.extract?'抽取中…':'抽取候选'}</button>
  </section>

  <section class="import-sec">
    <div class="section-label">B · 候选列表 ${cands.length?`<span class="count-tag">${batch.length}/${cands.length} 待提交</span>`:''}</div>
    <div class="cand-list">${listHtml}</div>
  </section>

  <section class="import-sec import-commit">
    <div class="section-label">C · 提交</div>
    <label class="merge-row"><input type="checkbox" ${importState.merge?'checked':''} onchange="setImportMerge(this.checked)"> 全局 merge（合并相近记忆）</label>
    <div class="commit-btn-row">
      <button class="ghost-btn" data-action="import-dryrun" ${dryDisabled?'disabled':''}>${importState.loading.dry?'预览中…':'dry-run 预览'}</button>
      <button class="solid-btn" data-action="import-commit" ${submitDisabled?'disabled':''}>${importState.loading.commit?'提交中…':'提交已确认候选'}</button>
    </div>
    ${(!importState.hasDryRun || importState.dryRunStale) && batch.length ? '<div class="commit-hint">提交前需先完成一次 dry-run；候选改动后会要求重新预览。</div>' : ''}
    ${renderImportResults()}
  </section>`;
}

function openDiaryDetail(id){
  const d = diaryMemories().find(item => item.id === id); if (!d) return;
  const moodTags = (d.moods||[]).map(m => `<span class="mini-chip" style="color:${moodColor(m)}">${m}</span>`).join('');
  const chord = getChordTag(d);
  const chordChip = chord ? `<span class="mini-chip">♪ ${escapeHtml(chord)}</span>` : '';
  const detailTags = moodTags + chordChip;
  const keywordRow = (d.keywords||[]).length ? `<div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:6px">${d.keywords.map(k => `<span class="mini-chip">${escapeHtml(k)}</span>`).join('')}</div>` : '';
  showModal(`
    <div class="modal-top">
      <div><div class="modal-title">${escapeHtml(d.title)}</div><div class="modal-sub">${escapeHtml(d.date)} · ${escapeHtml(d.author)}</div></div>
      <button class="close-btn" onclick="closeModal()">✕</button>
    </div>
    <div class="detail-meta">${detailTags}</div>
    ${keywordRow}
    <div class="detail-body" style="margin-top:14px">${escapeHtml(d.content)}</div>
    ${d.today_snapshot ? `<div class="soft-card" style="margin-top:14px"><div class="section-label" style="margin-bottom:8px">今天的你</div><div class="detail-body">${escapeHtml(d.today_snapshot)}</div></div>` : ''}
    <div class="action-row">
      <button class="solid-btn" data-action="open-diary-form" data-id="${escapeHtml(d.id)}">编辑</button>
      <button class="danger-btn" data-action="delete-diary" data-id="${escapeHtml(d.id)}">删除</button>
      <button class="ghost-btn" onclick="closeModal()">关闭</button>
    </div>
  `);
}

async function openBottleDetail(id){
  let b = state.bottles.find(item => item.id === id); if (!b) return;
  if (!b.read) {
    state.bottles = state.bottles.map(item => item.id === id ? {...item, read:true} : item);
    await persist(); renderHome(); renderBottle();
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
      <button class="solid-btn" data-action="toggle-bottle-read" data-id="${escapeHtml(b.id)}">${b.read ? '标记未读' : '标记已读'}</button>
      <button class="ghost-btn" data-action="open-bottle-form" data-id="${escapeHtml(b.id)}">编辑</button>
      <button class="danger-btn" data-action="delete-bottle" data-id="${escapeHtml(b.id)}">删除</button>
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
      <label class="input-shell" id="chord-shell" style="display:${['diary','treasure'].includes(m.layer)?'block':'none'}"><span class="input-label">记忆和弦</span><input id="mf-chord" placeholder="Fmaj9 → C/E → Am add9 → G6sus4 · 60bpm" value="${escapeHtml(getChordTag(m))}"><span class="input-helper" id="mf-chord-helper" style="display:${getChordTag(m)?'none':''}">用音乐化方式标记这段记忆的情绪走向。</span></label>
      <label class="input-shell"><span class="input-label">关键词</span><textarea id="mf-keywords" class="textarea-compact" placeholder="支持中文逗号、英文逗号、顿号、分号、换行分隔。">${escapeHtml((m.keywords || []).join('，'))}</textarea></label>
      <label class="input-shell" style="display:${['daily','diary'].includes(m.layer)?'block':'none'}" id="today-shell"><span class="input-label">今天的你</span><textarea id="mf-today">${escapeHtml(m.today_snapshot || '')}</textarea></label>
      <label class="input-shell" style="display:${m.layer==='treasure'?'block':'none'}" id="precious-shell"><span class="input-label">为什么珍贵</span><textarea id="mf-precious">${escapeHtml(m.why_precious || '')}</textarea></label>
      <div class="param-section">
        <button type="button" id="param-toggle-btn" class="param-toggle">记忆参数 <span class="param-arrow">▾</span></button>
        <div class="param-body" id="mf-param-body">
          <label class="input-shell"><span class="input-label">bucket</span><input id="mf-bucket" placeholder="eg: relationship / archive / trip" value="${escapeHtml(m.bucket || '')}"></label>
          <div class="check-row">
            <label class="check-item"><input type="checkbox" id="mf-anchor" ${toBool(m.anchor) ? 'checked' : ''}><span>anchor（长期锚点）</span></label>
            <label class="check-item"><input type="checkbox" id="mf-protected" ${toBool(m.protected) ? 'checked' : ''}><span>protected（保护）</span></label>
          </div>
          <div class="slider-grid">
            <div class="slider-row"><span class="input-label">valence</span><input type="range" id="mf-valence" min="0" max="1" step="0.05" value="${num01(m.valence, 0.5).toFixed(2)}" data-manual="0" oninput="document.getElementById('mf-valence-val').textContent=parseFloat(this.value).toFixed(2);this.dataset.manual='1'"><span class="slider-val" id="mf-valence-val">${num01(m.valence, 0.5).toFixed(2)}</span></div>
            <div class="slider-row"><span class="input-label">arousal</span><input type="range" id="mf-arousal" min="0" max="1" step="0.05" value="${num01(m.arousal, 0.3).toFixed(2)}" data-manual="0" oninput="document.getElementById('mf-arousal-val').textContent=parseFloat(this.value).toFixed(2);this.dataset.manual='1'"><span class="slider-val" id="mf-arousal-val">${num01(m.arousal, 0.3).toFixed(2)}</span></div>
            <div class="slider-row"><span class="input-label">confidence</span><input type="range" id="mf-confidence" min="0" max="1" step="0.05" value="${num01(m.confidence, 0.7).toFixed(2)}" oninput="document.getElementById('mf-confidence-val').textContent=parseFloat(this.value).toFixed(2)"><span class="slider-val" id="mf-confidence-val">${num01(m.confidence, 0.7).toFixed(2)}</span></div>
            <div class="slider-row"><span class="input-label">intimacy</span><input type="range" id="mf-intimacy" min="0" max="1" step="0.05" value="${num01(m.intimacy, 0.5).toFixed(2)}" oninput="document.getElementById('mf-intimacy-val').textContent=parseFloat(this.value).toFixed(2)"><span class="slider-val" id="mf-intimacy-val">${num01(m.intimacy, 0.5).toFixed(2)}</span></div>
            <div class="slider-row"><span class="input-label">safety</span><input type="range" id="mf-safety" min="0" max="1" step="0.05" value="${num01(m.safety, 0.5).toFixed(2)}" oninput="document.getElementById('mf-safety-val').textContent=parseFloat(this.value).toFixed(2)"><span class="slider-val" id="mf-safety-val">${num01(m.safety, 0.5).toFixed(2)}</span></div>
          </div>
          <label class="input-shell"><span class="input-label">texture（语言纹理）</span><textarea id="mf-texture" class="textarea-compact" placeholder="轻一点 · 短句 · 不说教…">${escapeHtml(m.texture || '')}</textarea></label>
        </div>
      </div>
      <label class="input-shell"><span class="input-label">正文</span><textarea id="mf-content" style="min-height:220px">${escapeHtml(m.content)}</textarea></label>
    </div>
    <div class="editor-actions">
      <button class="solid-btn" data-action="submit-memory-form" data-id="${escapeHtml(id)}">保存</button>
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
      document.getElementById('today-shell').style.display = ['daily','diary'].includes(val) ? 'block' : 'none';
      if (val !== 'core' && subSelect) subSelect.value = '';
      document.getElementById('precious-shell').style.display = val === 'treasure' ? 'block' : 'none';
      const chordShell = document.getElementById('chord-shell');
      if (chordShell) chordShell.style.display = ['diary','treasure'].includes(val) ? 'block' : 'none';
    });
    const paramToggleBtn = document.getElementById('param-toggle-btn');
    const paramBodyEl = document.getElementById('mf-param-body');
    paramToggleBtn?.addEventListener('click', () => {
      paramBodyEl?.classList.toggle('param-open');
      paramToggleBtn.classList.toggle('param-toggle-open');
    });
    const moodSelEl = document.getElementById('mf-mood');
    moodSelEl?.addEventListener('change', () => {
      const va2 = moodToVA(moodSelEl.value);
      const vEl = document.getElementById('mf-valence');
      const aEl = document.getElementById('mf-arousal');
      if (vEl && vEl.dataset.manual !== '1') {
        vEl.value = va2.valence.toFixed(2);
        document.getElementById('mf-valence-val').textContent = va2.valence.toFixed(2);
      }
      if (aEl && aEl.dataset.manual !== '1') {
        aEl.value = va2.arousal.toFixed(2);
        document.getElementById('mf-arousal-val').textContent = va2.arousal.toFixed(2);
      }
    });
    const mfChordInput = document.getElementById('mf-chord');
    const mfChordHelper = document.getElementById('mf-chord-helper');
    if (mfChordInput && mfChordHelper) {
      mfChordInput.addEventListener('input', () => {
        mfChordHelper.style.display = mfChordInput.value.trim() ? 'none' : '';
      });
    }
  }, 0);
}

async function submitMemoryForm(id=''){
  if (memoryFormSubmitting) return;
  memoryFormSubmitting = true;
  const btn = document.querySelector('[data-action="submit-memory-form"]');
  if (btn) { btn.disabled = true; btn.textContent = '保存中…'; }
  const prev = id ? state.memories.find(item => item.id === id) : null;
  const base = normalizeMemoryMeta(prev || {id: id || uid('m')});
  const layer = document.getElementById('mf-layer').value;
  const mood = document.getElementById('mf-mood').value;
  const va = moodToVA(mood);
  const _sv = (el, fb) => { const v = parseFloat(el?.value); return isNaN(v) ? fb : v; };
  const userValence = _sv(document.getElementById('mf-valence'), va.valence);
  const userArousal = _sv(document.getElementById('mf-arousal'), va.arousal);
  const protectedEl = document.getElementById('mf-protected');
  const userProtected = protectedEl ? protectedEl.checked : !!base.protected;
  const bucket = (document.getElementById('mf-bucket')?.value || '').trim();
  const anchor = !!(document.getElementById('mf-anchor')?.checked);
  const confidence = _sv(document.getElementById('mf-confidence'), base.confidence ?? 0.7);
  const intimacy = _sv(document.getElementById('mf-intimacy'), base.intimacy ?? 0.5);
  const safety = _sv(document.getElementById('mf-safety'), base.safety ?? 0.5);
  const texture = (document.getElementById('mf-texture')?.value || '').trim();
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
    valence: userValence,
    arousal: userArousal,
    protected: base.pinned ? true : (isProtectedLayer(layer) ? true : userProtected),
    bucket,
    anchor,
    confidence,
    intimacy,
    safety,
    texture,
  });
  record.raw = record.raw || {};
  if (['diary','treasure'].includes(layer)) {
    const chordTag = (document.getElementById('mf-chord')?.value || '').trim();
    if (chordTag) {
      record.raw.chord_tag = chordTag;
    } else {
      delete record.raw.chord_tag;
    }
  }
  try {
    let saved;
    if (id) {
      saved = await apiPatchMemory(id, record);
      state.memories = state.memories.map(item => item.id === id ? saved : item);
    } else {
      saved = await apiWriteMemory(record);
      state.memories.unshift(saved);
    }
    renderAfterMemoryApiChange(); closeEditor(); showToast('记忆已保存', null, false);
  } catch(err) {
    showToast(classifyApiError(err), null, false);
  } finally {
    memoryFormSubmitting = false;
    if (btn) { btn.disabled = false; btn.textContent = '保存'; }
  }
}

function openDiaryForm(id=''){
  const d = normalizeDiary(id ? diaryMemories().find(item => item.id === id) : {author:'小克',date:today(),title:'',content:'',moods:['平静'],keywords:[]});
  const selected = new Set(d.moods || []);
  showEditor(`
    <div class="editor-header"><button class="editor-back" onclick="closeEditor()">←</button><div><div class="modal-title">${id?'编辑日记':'新建日记'}</div></div></div>
    <div class="editor-main form-grid">
      <div class="note-box">日记心情用点选标签。关键词可以手动填写，支持多种符号和换行分隔。</div>
      <label class="input-shell"><span class="input-label">标题</span><input id="df-title" value="${escapeHtml(d.title)}"></label>
      <div class="split">
        <label class="input-shell"><span class="input-label">日期</span><input id="df-date" type="date" value="${escapeHtml(d.date)}"></label>
        <label class="input-shell"><span class="input-label">作者</span><select id="df-author">${AUTHOR_OPTIONS.map(a => `<option value="${a}" ${d.author===a?'selected':''}>${a}</option>`).join('')}</select></label>
      </div>
      <div class="input-shell">
        <span class="input-label">心情标签</span>
        <div class="mood-pick">${Object.keys(MOOD_COLORS).map(mood => `<button type="button" class="mood-chip ${selected.has(mood)?'active':''}" data-mood="${mood}" onclick="toggleDiaryMood(this)">${mood}</button>`).join('')}</div>
      </div>
      <label class="input-shell">
        <span class="input-label">记忆和弦</span>
        <input id="df-chord" placeholder="Fmaj9 → C/E → Am add9 → G6sus4 · 60bpm" value="${escapeHtml(getChordTag(d))}">
        <span class="input-helper" id="df-chord-helper" style="display:${getChordTag(d)?'none':''}">用音乐化方式标记这段记忆的情绪走向。</span>
      </label>
      <label class="input-shell"><span class="input-label">关键词</span><textarea id="df-keywords" class="textarea-compact" placeholder="支持中文逗号、英文逗号、顿号、分号、换行分隔。">${escapeHtml((d.keywords||[]).join('，'))}</textarea></label>
      <label class="input-shell"><span class="input-label">今天的你</span><textarea id="df-today" class="textarea-compact" placeholder="一句话描述今天的状态，显示在首页和日历。">${escapeHtml(d.today_snapshot || '')}</textarea></label>
      <label class="input-shell"><span class="input-label">正文</span><textarea id="df-content" style="min-height:220px">${escapeHtml(d.content)}</textarea></label>
    </div>
    <div class="editor-actions"><button class="solid-btn" data-action="submit-diary-form" data-id="${escapeHtml(id)}">保存</button><button class="ghost-btn" onclick="closeEditor()">取消</button></div>
  `);
  setTimeout(() => {
    const dfChordInput = document.getElementById('df-chord');
    const dfChordHelper = document.getElementById('df-chord-helper');
    if (dfChordInput && dfChordHelper) {
      dfChordInput.addEventListener('input', () => {
        dfChordHelper.style.display = dfChordInput.value.trim() ? 'none' : '';
      });
    }
  }, 0);
}
function toggleDiaryMood(btn){ btn.classList.toggle('active'); }
async function submitDiaryForm(id=''){
  if (diaryFormSubmitting) return;
  diaryFormSubmitting = true;
  const btn = document.querySelector('[data-action="submit-diary-form"]');
  if (btn) { btn.disabled = true; btn.textContent = '保存中…'; }
  const prev = id ? diaryMemories().find(item => item.id === id) : null;
  const raw = (prev && prev.raw && typeof prev.raw === 'object') ? {...prev.raw} : {};
  const chordTag = (document.getElementById('df-chord')?.value || '').trim();
  if (chordTag) raw.chord_tag = chordTag;
  else delete raw.chord_tag;
  const record = {
    layer: 'diary',
    author: document.getElementById('df-author').value,
    date: document.getElementById('df-date').value || today(),
    title: document.getElementById('df-title').value.trim() || '未命名日记',
    moods: Array.from(document.querySelectorAll('.mood-chip.active')).map(el => el.dataset.mood),
    keywords: splitTokens(document.getElementById('df-keywords').value),
    today_snapshot: document.getElementById('df-today')?.value.trim() || '',
    content: document.getElementById('df-content').value.trim(),
    raw
  };
  try {
    let saved;
    if (id) {
      saved = await apiPatchMemory(id, record);
      state.memories = state.memories.map(item => item.id === id ? saved : item);
    } else {
      saved = await apiWriteMemory(record);
      state.memories.unshift(saved);
    }
    renderAfterMemoryApiChange(); closeEditor(); showToast('日记已保存', null, false);
  } catch(err) {
    showToast(classifyApiError(err), null, false);
  } finally {
    diaryFormSubmitting = false;
    if (btn) { btn.disabled = false; btn.textContent = '保存'; }
  }
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
    <div class="editor-actions"><button class="solid-btn" data-action="submit-bottle-form" data-id="${escapeHtml(id)}">保存</button><button class="ghost-btn" onclick="closeEditor()">取消</button></div>
  `);
}
async function submitBottleForm(id=''){
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
  const btn = document.querySelector('[data-action="submit-bottle-form"]');
  if (btn) { btn.disabled = true; btn.textContent = '保存中…'; }
  const r = await saveAndRender();
  if (btn) { btn.disabled = false; btn.textContent = '保存'; }
  if (r?.ok) { closeEditor(); showToast('漂流瓶已保存', null, false); }
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
    diaries: diaryMemories(),
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
  if (file.size > IMPORT_BYTES_MAX){ showToast('文件超过 10MB，请先拆分后再导入', null, false); return; }
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
async function doImport(mode){
  const data = window.__pendingImportData;
  if (!data){ showToast('请先选择文件', null, false); return; }
  const payload = data && data.state && data.savedAt ? data.state : data;
  try {
    if (mode === 'merge') {
      // 检查登录状态
      const token = getFrontendAccessToken();
      if (!token){ showToast('请先登录，未检测到登录凭证', null, false); return; }

      // --- memories：逐条写入 API ---
      const incoming = Array.isArray(payload) ? payload : (payload.memories || []);
      const existingIds = new Set(state.memories.map(m => m.id));
      const existingLegacyIds = new Set(state.memories.map(m => m.legacy_id).filter(Boolean));
      let memAdded = 0;
      let firstWriteError = null;

      for (const raw of incoming){
        const origId = typeof raw.id === 'string' ? raw.id : '';
        // 按 uuid 和 legacy_id 双重去重
        if (existingIds.has(origId) || existingLegacyIds.has(origId)) continue;

        const record = normalizeMemoryMeta(raw);
        if (!isValidUUID(origId)){
          // 旧 id 不是 UUID → 保留成 legacy_id，让服务端分配新 UUID
          if (origId) record.legacy_id = origId;
          delete record.id;
        }
        // 乐观地标记 legacy_id，不依赖服务端回显，防止同批文件内重复
        if (record.legacy_id) existingLegacyIds.add(record.legacy_id);
        try {
          const saved = await apiWriteMemory(record);
          existingIds.add(saved.id);
          if (saved.legacy_id) existingLegacyIds.add(saved.legacy_id);
          memAdded++;
        } catch(err){
          if (err.code === 'no_token' || err.status === 401){
            showToast('登录凭证失效，请重新登录', null, false);
            return;
          } else if (err.status === 403){
            showToast('账号无权限访问 API，请检查白名单配置', null, false);
            return;
          } else if (err.status){
            firstWriteError = `记忆写入失败（状态码 ${err.status}）`;
          } else {
            firstWriteError = '网络错误，无法连接服务器';
          }
          break;
        }
      }

      // 写完后从 API 刷新 state.memories，不再塞回 vault_state
      try {
        state.memories = await fetchAllMemoriesFromApi();
      } catch(e){ /* 刷新失败则保留当前内存 */ }

      // --- bottles：沿用 vault_state 保存逻辑 ---
      let miscAdded = 0;
      if (payload.bottles && Array.isArray(payload.bottles)){
        const bottleIds = new Set(state.bottles.map(b => b.id));
        for (const b of payload.bottles.map(normalizeBottleMeta)){
          if (!bottleIds.has(b.id)){ state.bottles.push(b); bottleIds.add(b.id); miscAdded++; }
        }
      }
      if (payload.diaries && Array.isArray(payload.diaries)){
        const existingDiaryIds = new Set(diaryMemories().map(m => m.id));
        for (const dRaw of payload.diaries){
          const d = normalizeDiary(dRaw);
          if (existingDiaryIds.has(d.id)) continue;
          const origId = d.id;
          const record = { ...d, layer: 'diary' };
          if (!isValidUUID(origId)){ if (origId) record.legacy_id = origId; delete record.id; }
          try {
            const saved = await apiWriteMemory(record);
            state.memories.unshift(saved);
            existingDiaryIds.add(saved.id);
            miscAdded++;
          } catch(err){
            if (err.code === 'no_token' || err.status === 401){ showToast('登录凭证失效，请重新登录', null, false); return; }
          }
        }
      }
      if (miscAdded > 0) await persist();
      renderAll();
      closeEditor();
      window.__pendingImportData = null;

      if (firstWriteError){
        showToast(`部分导入完成（新增 ${memAdded} 条记忆）。${firstWriteError}`, null, false);
      } else {
        const extra = miscAdded ? `、${miscAdded} 条其他` : '';
        showToast(`追加完成，新增 ${memAdded} 条记忆${extra}`, null, false);
      }
    } else {
      // 覆盖导入：先展示二次确认，实际写入由 doImportOverwriteExecute() 完成
      const token = getFrontendAccessToken();
      if (!token){ showToast('请先登录，未检测到登录凭证', null, false); return; }
      const incoming = Array.isArray(payload) ? payload : (payload.memories || []);
      const importCount = incoming.length;
      const remoteActive = state.memories.filter(m => !m._archived).length;
      closeEditor();
      showModal(`
        <div class="modal-top">
          <div><div class="modal-title">确认覆盖导入</div><div class="modal-sub">此操作不可撤销，请谨慎</div></div>
          <button class="close-btn" onclick="closeModal()">✕</button>
        </div>
        <div class="detail-body" style="margin-top:14px">
          <p>导入文件包含 <strong>${importCount}</strong> 条记忆。</p>
          <p>远端当前有 <strong>${remoteActive}</strong> 条未归档记忆。</p>
          <p style="margin-top:10px">确认后，不在导入文件中的远端记忆将被<strong>软归档</strong>，导入文件里的记忆全部写入 / 更新到 public.memories。</p>
          <p style="margin-top:8px;opacity:.6;font-size:.85em">bottles 等非记忆库字段会直接覆盖 vault_state。</p>
        </div>
        <div class="action-row" style="margin-top:16px">
          <button class="solid-btn" onclick="doImportOverwriteExecute()">确认覆盖</button>
          <button class="ghost-btn" onclick="closeModal()">取消</button>
        </div>
      `);
    }
  } catch(err){
    showToast(classifyApiError(err), null, false);
  }
}
async function doImportOverwriteExecute(){
  const data = window.__pendingImportData;
  if (!data){ closeModal(); return; }
  const payload = data && data.state && data.savedAt ? data.state : data;
  closeModal();
  const token = getFrontendAccessToken();
  if (!token){ showToast('请先登录，未检测到登录凭证', null, false); return; }

  const setProgress = (text) => { toastText.textContent = text; toast.classList.add('show'); clearTimeout(toastTimer); };

  // 拉全量远端 memories 用于对比
  setProgress('覆盖导入：正在拉取远端记忆...');
  let remoteAll;
  try { remoteAll = await fetchAllMemoriesFromApi(); }
  catch(err){ showToast('拉取远端失败：' + classifyApiError(err), null, false); return; }

  // 构造导入文件 ID 集合（UUID / legacy_id 双轨）
  const incoming = Array.isArray(payload) ? payload : (payload.memories || []);
  const importUUIDs = new Set(), importLegacyIds = new Set();
  for (const raw of incoming){
    const origId = typeof raw.id === 'string' ? raw.id : '';
    if (isValidUUID(origId)) importUUIDs.add(origId.toLowerCase());
    else if (origId) importLegacyIds.add(origId);
  }

  // 第一步：先写入 / 更新导入文件中的全部记忆（写成功后才归档多余）
  let written = 0, firstWriteError = null;
  const total = incoming.length;
  for (const raw of incoming){
    setProgress(`覆盖导入：写入记忆 ${written + 1}/${total}...`);
    const origId = typeof raw.id === 'string' ? raw.id : '';
    const record = normalizeMemoryMeta(raw);
    if (!isValidUUID(origId)){ if (origId) record.legacy_id = origId; delete record.id; }
    try { await apiWriteMemory(record); written++; }
    catch(err){
      if (err.code === 'no_token' || err.status === 401){ showToast('登录凭证失效，请重新登录', null, false); return; }
      if (err.status === 403){ showToast('账号无权限访问 API，请检查白名单配置', null, false); return; }
      firstWriteError = classifyApiError(err); break;
    }
  }

  // 第二步：仅当写入无致命错误时，归档远端多余记忆
  let archived = 0, archiveFailed = 0;
  if (!firstWriteError){
    const toArchive = remoteAll.filter(m => {
      if (m._archived) return false;
      if (importUUIDs.has(m.id)) return false;
      if (m.legacy_id && importLegacyIds.has(m.legacy_id)) return false;
      return true;
    });
    for (const m of toArchive){
      setProgress(`覆盖导入：归档多余记忆 ${archived + archiveFailed + 1}/${toArchive.length}...`);
      try { await apiArchiveMemory(m.id); archived++; }
      catch(err){ archiveFailed++; }
    }
  }

  // 从 API 刷新 memories（不写回 vault_state）
  try { state.memories = await fetchAllMemoriesFromApi(); } catch(e){}

  // 其余字段覆盖 vault_state，memories 始终用 API 的结果
  const base = normalizeState(Array.isArray(payload) ? {} : {...payload, memories: []});
  state = {...base, memories: state.memories};
  await persist();
  renderAll();
  window.__pendingImportData = null;

  const archiveNote = archiveFailed ? `，归档失败 ${archiveFailed} 条` : '';
  if (firstWriteError) showToast(`覆盖部分完成：写入 ${written}/${total} 条。${firstWriteError}`, null, false);
  else showToast(`覆盖完成：写入 ${written} 条，归档多余 ${archived} 条${archiveNote}`, null, false);
}
async function resetDemoData(){ state = defaultState(); const r = await persist(); renderAll(); closeModal(); if (r?.ok) showToast('已恢复示例数据', null, false); }

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
    cells.push(`<button class="calendar-day" data-action="open-day" data-id="${escapeHtml(iso)}" data-arg="${monthOffset}"><span>${day}</span>${dot}</button>`);
  }
  showModal(`
    <div class="modal-top"><div><div class="modal-title">日历视图</div><div class="modal-sub">心情色块 + 当天摘要</div></div><button class="close-btn" onclick="closeModal()">✕</button></div>
    <div class="calendar-head"><button class="ghost-btn" data-action="open-calendar" data-arg="${monthOffset-1}">上个月</button><div class="small muted">${year}年 ${month+1}月</div><button class="ghost-btn" data-action="open-calendar" data-arg="${monthOffset+1}">下个月</button></div>
    <div class="calendar-grid" style="margin-bottom:6px">${WEEK.map(w=>`<div class="calendar-week">${w}</div>`).join('')}</div>
    <div class="calendar-grid">${cells.join('')}</div>
    <div class="notice" style="margin-top:12px">每个日期下方的小色块代表当天心情。当前分为五类：平静、开心、低落、不安、重要。点开日期后可以修改心情和当天摘要。</div>
  `);
}

function openDayDetail(date, monthOffset = 0){
  closeModal();
  const note = state.calendarNotes?.[date] || {mood: inferCalendarMood(date) || '平静', summary:''};
  const daily = state.memories.filter(m => m.layer === 'daily' && m.date === date);
  const diaries = diaryMemories().filter(d => d.date === date);
  showEditor(`
    <div class="editor-header"><button class="editor-back" data-action="return-to-calendar" data-arg="${monthOffset}">←</button><div><div class="modal-title">${escapeHtml(date)}</div></div></div>
    <div class="editor-main form-grid">
      <div class="note-box">这里改的是日历心情色块和一句当天摘要，方便在月历里一眼扫过去。真正长内容还是放在 daily / 日记里。</div>
      <div class="input-shell">
        <span class="input-label">心情色块</span>
        <div class="helper-row">${Object.keys(CALENDAR_MOODS).map(mood => `<button type="button" class="helper-link ${note.mood===mood?'active':''}" data-cal-mood="${mood}" onclick="toggleCalendarMood(this)">${mood}</button>`).join('')}</div>
      </div>
      <label class="input-shell"><span class="input-label">当天摘要</span><textarea id="cal-summary" class="textarea-compact" placeholder="写一句这天最值得一眼看到的事。">${escapeHtml(note.summary || '')}</textarea></label>
      <div class="section"><div class="section-label">daily</div>${daily.length ? daily.map(m => `<div class="soft-card" style="margin-bottom:10px"><div class="small" style="color:var(--gold);margin-bottom:6px">${escapeHtml(m.title)}</div><div class="detail-body">${escapeHtml(m.content)}</div></div>`).join('') : '<div class="empty" style="padding:8px 0 18px">这天没有 daily 摘要。</div>'}</div>
      <div class="section"><div class="section-label">日记</div>${diaries.length ? diaries.map(d => `<div class="soft-card" style="margin-bottom:10px"><div class="small" style="color:var(--gold);margin-bottom:6px">${escapeHtml(d.author)} · ${escapeHtml(d.title)}</div><div class="detail-body">${escapeHtml(d.content)}</div>${d.today_snapshot ? `<div class="small muted" style="margin-top:6px">今天的你：${escapeHtml(d.today_snapshot)}</div>` : ''}</div>`).join('') : '<div class="empty" style="padding:8px 0 18px">这天没有日记。</div>'}</div>
    </div>
    <div class="editor-actions"><button class="solid-btn" data-action="save-calendar-note" data-id="${escapeHtml(date)}" data-arg="${monthOffset}">保存</button><button class="ghost-btn" data-action="return-to-calendar" data-arg="${monthOffset}">返回日历</button></div>
  `);
}

function toggleCalendarMood(btn){
  document.querySelectorAll('[data-cal-mood]').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
}

async function saveCalendarNote(date, monthOffset = 0){
  const mood = document.querySelector('[data-cal-mood].active')?.dataset.calMood || '平静';
  const summary = document.getElementById('cal-summary').value.trim();
  state.calendarNotes[date] = {mood, summary};
  const r = await saveAndRender();
  closeEditor();
  openCalendarModal(monthOffset);
  if (r?.ok) showToast('日历色块已保存', null, false);
}

function openCollectionModal(parentId=''){
  currentCollectionParent = parentId || '';
  closeModal();
  const path = collectionPath(currentCollectionParent);
  const children = collectionChildren(currentCollectionParent);
  const folders = children.filter(item => item.kind === 'folder');
  const items = children.filter(item => item.kind !== 'folder');
  showEditor(`
    <div class="editor-header"><button class="editor-back" data-action="back-from-collection">←</button><div><div class="modal-title">收藏夹</div></div></div>
    <div class="editor-main form-grid">
      <div class="note-box">这里不是把所有收藏堆进一页，而是可以像文件夹一样往下开子页面。一个子页下面还能继续开子页，彼此并列放着。</div>
      <div class="small muted">${['收藏夹', ...path.map(item => escapeHtml(item.title))].join(' / ')}</div>
      <div class="toolbar"><button class="toolbar-btn" data-action="open-collection-folder-form" data-id="" data-arg="${escapeHtml(currentCollectionParent)}">新增子页</button><button class="toolbar-btn primary" data-action="open-collection-item-form" data-id="" data-arg="${escapeHtml(currentCollectionParent)}">新增条目</button></div>
      ${folders.length ? `<div class="section"><div class="section-label">子页面</div>${folders.map(c => `
        <div class="link-row" data-action="open-collection" data-id="${escapeHtml(c.id)}">
          <div>
            <div>${escapeHtml(c.title)}</div>
            <div class="small muted" style="margin-top:4px">${escapeHtml(c.note || '可继续往下开子页')}</div>
          </div>
          <span class="arrow">→</span>
        </div>`).join('')}</div>` : ''}
      ${items.length ? `<div class="section"><div class="section-label">条目</div>${items.map(c => `
        <div class="link-row" data-action="open-collection-item-form" data-id="${escapeHtml(c.id)}" data-arg="${escapeHtml(currentCollectionParent)}">
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
    <div class="editor-header"><button class="editor-back" data-action="open-collection" data-id="${escapeHtml(c.parentId || '')}">←</button><div><div class="modal-title">${id?'编辑子页面':'新增子页面'}</div></div></div>
    <div class="editor-main form-grid">
      <div class="note-box">子页面像并列的小文件夹。你可以在它下面继续开更多子页，也可以往里面放独立收藏条目。</div>
      <label class="input-shell"><span class="input-label">标题</span><input id="cff-title" value="${escapeHtml(c.title || '')}" placeholder="例如：歌单 / 书单 / 旅行照片"></label>
      <label class="input-shell"><span class="input-label">备注</span><textarea id="cff-note" class="textarea-compact" placeholder="一句短说明，告诉以后打开的人这一页是做什么的。">${escapeHtml(c.note || '')}</textarea></label>
    </div>
    <div class="editor-actions"><button class="solid-btn" data-action="submit-collection-folder-form" data-id="${escapeHtml(id)}" data-arg="${escapeHtml(c.parentId || '')}">保存</button>${id?`<button class="danger-btn" data-action="delete-collection" data-id="${escapeHtml(id)}" data-arg="${escapeHtml(c.parentId || '')}">删除</button>`:''}<button class="ghost-btn" data-action="open-collection" data-id="${escapeHtml(c.parentId || '')}">取消</button></div>
  `);
}

async function submitCollectionFolderForm(id='', parentId=''){
  const record = {
    id: id || uid('cf'),
    kind: 'folder',
    parentId: parentId || '',
    title: document.getElementById('cff-title').value.trim() || '未命名子页面',
    note: document.getElementById('cff-note').value.trim()
  };
  if (id) state.collections = state.collections.map(item => item.id === id ? {...item, ...record} : item);
  else state.collections.unshift(record);
  const r = await saveAndRender();
  if (r?.ok) showToast('子页面已保存', null, false);
  openCollectionModal(parentId || '');
}

function openCollectionItemForm(id='', parentId=''){
  const c = id ? collectionItem(id) : {kind:'item', parentId:parentId || currentCollectionParent || '', type:'收藏', title:'', content:'', note:''};
  const inFolder = !!(c.parentId || '');
  const folderTitle = inFolder ? (collectionItem(c.parentId)?.title || '') : '';
  showEditor(`
    <div class="editor-header"><button class="editor-back" data-action="open-collection" data-id="${escapeHtml(c.parentId || '')}">←</button><div><div class="modal-title">${id?'编辑收藏条目':'新增收藏条目'}</div></div></div>
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
    <div class="editor-actions"><button class="solid-btn" data-action="submit-collection-item-form" data-id="${escapeHtml(id)}" data-arg="${escapeHtml(c.parentId || '')}">保存</button>${id?`<button class="danger-btn" data-action="delete-collection" data-id="${escapeHtml(id)}" data-arg="${escapeHtml(c.parentId || '')}">删除</button>`:''}<button class="ghost-btn" data-action="open-collection" data-id="${escapeHtml(c.parentId || '')}">取消</button></div>
  `);
}

async function submitCollectionItemForm(id='', parentId=''){
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
  const r = await saveAndRender();
  if (r?.ok) showToast('收藏已保存', null, false);
  openCollectionModal(parentId || '');
}


async function deleteCollection(id='', parentId=''){
  const ids = new Set([id]);
  let changed = true;
  while(changed){
    changed = false;
    state.collections.forEach(item => {
      if (!ids.has(item.id) && ids.has(item.parentId || '')) { ids.add(item.id); changed = true; }
    });
  }
  state.collections = state.collections.filter(item => !ids.has(item.id));
  const r = await saveAndRender();
  if (r?.ok) showToast('收藏已删除', null, false);
  openCollectionModal(parentId || '');
}

function openHealthModal(){
  closeModal();
  const cycle = getCycleInfo();
  const entries = healthEntries();
  const periods = safeArray(state.health.cycle.periods, [])
    .slice().sort((a, b) => b.startDate.localeCompare(a.startDate));
  const periodRows = periods.map(p => `
    <div class="soft-card" style="margin-bottom:10px;cursor:pointer" data-action="open-period-form" data-id="${escapeHtml(p.id)}">
      <div class="small" style="color:var(--gold);margin-bottom:4px">${escapeHtml(p.startDate)}${p.endDate ? ' — ' + escapeHtml(p.endDate) : '（进行中）'}</div>
      ${p.note ? `<div class="detail-body">${escapeHtml(p.note)}</div>` : ''}
    </div>`).join('');
  showEditor(`
    <div class="editor-header"><button class="editor-back" onclick="closeEditor()">←</button><div><div class="modal-title">健康总览</div></div></div>
    <div class="editor-main form-grid">
      <div class="note-box">这里统一看睡眠、心率、饮食、饮水和经期。点"新增记录"可以手动补写，汇总和手动记录会放在一起看。</div>
      <div class="section">
        <div class="section-label">经期模块</div>
        <div class="health-grid">
          <div class="health-card"><h4>最近开始</h4><div class="detail-body">${escapeHtml(cycle.latestPeriod?.startDate || '—')}</div></div>
          <div class="health-card"><h4>${cycle.isInPeriod ? '进行中' : '最近结束'}</h4><div class="detail-body">${cycle.isInPeriod ? '进行中' : escapeHtml(cycle.latestPeriod?.endDate || '—')}</div></div>
          <div class="health-card"><h4>下次预计</h4><div class="detail-body">${ymd(cycle.next)}</div></div>
          <div class="health-card"><h4>周期 / 经期</h4><div class="detail-body">${state.health.cycle.cycleLength} / ${state.health.cycle.periodLength} 天</div></div>
        </div>
        <div class="toolbar" style="margin-top:10px">
          <button class="toolbar-btn primary" data-action="open-period-form" data-id="">记录经期</button>
          <button class="toolbar-btn" onclick="openHealthEditModal()">编辑周期参数</button>
        </div>
        <div style="margin-top:8px">${periods.length ? periodRows : '<div class="empty" style="padding:8px 0 16px">还没有经期记录。</div>'}</div>
      </div>
      <div class="toolbar">
        <button class="toolbar-btn primary" onclick="openHealthEntryForm()">新增记录</button>
      </div>
      <div class="section"><div class="section-label">记录汇总</div>${entries.map(item => `<div class="soft-card" style="margin-bottom:10px;cursor:pointer" data-action="open-health-entry-form" data-id="${escapeHtml(item.source)}" data-arg="${escapeHtml(item.id)}"><div class="small" style="color:var(--gold);margin-bottom:6px">${escapeHtml(item.label)} · ${escapeHtml(item.date)}</div><div class="detail-body">${escapeHtml(item.body)}</div></div>`).join('')}</div>
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
    <div class="editor-actions"><button class="solid-btn" data-action="submit-health-entry-form" data-id="${escapeHtml(source)}" data-arg="${escapeHtml(id)}">保存</button>${id?`<button class="danger-btn" data-action="delete-health-entry" data-id="${escapeHtml(source)}" data-arg="${escapeHtml(id)}">删除</button>`:''}<button class="ghost-btn" onclick="openHealthModal()">取消</button></div>
  `);
}
function toggleHealthSourceFields(){
  const source = document.getElementById('he-source').value;
  document.getElementById('he-log-fields').style.display = source==='daily' ? 'none' : 'grid';
  document.getElementById('he-daily-fields').style.display = source==='daily' ? 'grid' : 'none';
  document.getElementById('he-date').type = source==='daily' ? 'date' : 'datetime-local';
}
async function submitHealthEntryForm(originalSource='log', id=''){
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
  const btnH = document.querySelector('[data-action="submit-health-entry-form"]');
  if (btnH) { btnH.disabled = true; btnH.textContent = '保存中…'; }
  const r = await saveAndRender();
  if (btnH) { btnH.disabled = false; btnH.textContent = '保存'; }
  if (r?.ok) showToast('健康记录已保存', null, false);
  openHealthModal();
}
async function deleteHealthEntry(source='log', id=''){
  if (source==='daily') state.health.daily = state.health.daily.filter(item => item.id!==id);
  else state.health.logs = state.health.logs.filter(item => item.id!==id);
  const r = await saveAndRender();
  if (r?.ok) showToast('健康记录已删除', null, false);
  openHealthModal();
}

function openHealthEditModal(){
  const c = state.health.cycle;
  showEditor(`
    <div class="editor-header"><button class="editor-back" onclick="openHealthModal()">←</button><div><div class="modal-title">编辑经期参数</div></div></div>
    <div class="form-grid">
      <div class="split">
        <label class="input-shell"><span class="input-label">周期长度（天）</span><input id="hc-cycle" type="number" value="${escapeHtml(c.cycleLength)}"></label>
        <label class="input-shell"><span class="input-label">经期长度（天）</span><input id="hc-period" type="number" value="${escapeHtml(c.periodLength)}"></label>
      </div>
      <label class="input-shell"><span class="input-label">一瓶水（ml）</span><input id="hc-water" type="number" value="${escapeHtml(state.health.waterBottleMl || 500)}"></label>
    </div>
    <div class="editor-actions"><button class="solid-btn" onclick="submitHealthCycle()">保存</button><button class="ghost-btn" onclick="openHealthModal()">返回</button></div>
  `);
}
async function submitHealthCycle(){
  state.health.cycle = {
    lastPeriodStart: state.health.cycle.lastPeriodStart,
    cycleLength: Number(document.getElementById('hc-cycle').value || 29),
    periodLength: Number(document.getElementById('hc-period').value || 6),
    periods: safeArray(state.health.cycle.periods, [])
  };
  state.health.waterBottleMl = Number(document.getElementById('hc-water').value || 500);
  const r = await saveAndRender();
  if (r?.ok) { closeEditor(); openHealthModal(); }
}

function openPeriodForm(id = ''){
  const existing = id ? safeArray(state.health.cycle.periods, []).find(p => p.id === id) : null;
  const data = existing || {startDate: today(), endDate: '', note: ''};
  showEditor(`
    <div class="editor-header"><button class="editor-back" onclick="openHealthModal()">←</button><div><div class="modal-title">${id ? '编辑经期记录' : '记录经期'}</div></div></div>
    <div class="editor-main form-grid">
      <div class="split">
        <label class="input-shell"><span class="input-label">开始日期</span><input id="per-start" type="date" value="${escapeHtml(data.startDate)}"></label>
        <label class="input-shell"><span class="input-label">结束日期（可选）</span><input id="per-end" type="date" value="${escapeHtml(data.endDate || '')}"></label>
      </div>
      <label class="input-shell"><span class="input-label">备注（可选）</span><textarea id="per-note" class="textarea-compact" placeholder="例如：痛经、量多、情绪低落…">${escapeHtml(data.note || '')}</textarea></label>
    </div>
    <div class="editor-actions">
      <button class="solid-btn" data-action="submit-period-form" data-id="${escapeHtml(id)}">保存</button>
      ${id ? `<button class="danger-btn" data-action="delete-period" data-id="${escapeHtml(id)}">删除</button>` : ''}
      <button class="ghost-btn" onclick="openHealthModal()">取消</button>
    </div>
  `);
}
async function submitPeriodForm(id = ''){
  const startDate = document.getElementById('per-start').value;
  if (!startDate) { showToast('请填写开始日期', null, false); return; }
  const endDate = document.getElementById('per-end').value;
  if (endDate && endDate < startDate) { showToast('结束日期不能早于开始日期', null, false); return; }
  const note = document.getElementById('per-note').value.trim();
  const now = nowIso();
  let periods = safeArray(state.health.cycle.periods, []);
  if (id) {
    periods = periods.map(p => p.id === id ? {...p, startDate, endDate, note, updated_at: now} : p);
  } else {
    periods = [{id: uid('per'), startDate, endDate, note, created_at: now, updated_at: now}, ...periods];
  }
  const latest = periods.reduce((best, p) => (!best || p.startDate > best.startDate) ? p : best, null);
  state.health.cycle = {...state.health.cycle, periods, lastPeriodStart: latest ? latest.startDate : state.health.cycle.lastPeriodStart};
  const r = await saveAndRender();
  if (r?.ok) { openHealthModal(); showToast('经期记录已保存', null, false); }
  else showToast('保存失败，请检查网络', null, false);
}
async function deletePeriod(id){
  state.health.cycle.periods = safeArray(state.health.cycle.periods, []).filter(p => p.id !== id);
  const latest = state.health.cycle.periods.reduce((best, p) => (!best || p.startDate > best.startDate) ? p : best, null);
  if (latest) state.health.cycle.lastPeriodStart = latest.startDate;
  const r = await saveAndRender();
  if (r?.ok) { openHealthModal(); showToast('经期记录已删除', null, false); }
  else showToast('删除失败，请检查网络', null, false);
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
async function saveAutomationSettings(){
  state.profile.pairName = document.getElementById('set-pair').value.trim() || state.profile.pairName;
  state.startDate = document.getElementById('set-start').value || state.startDate;
  state.health.waterBottleMl = Number(document.getElementById('set-water').value || 500);
  state.automation.endpoint = document.getElementById('set-endpoint').value.trim();
  state.automation.lastSync = nowString();
  const r = await saveAndRender();
  if (r?.ok) { showToast('设置已保存', null, false); closeEditor(); }
}

async function archiveMemory(id){
  if (!lockMemoryAction(id)) return;
  const found = state.memories.find(item => item.id === id);
  if (!found){ unlockMemoryAction(id); return; }
  showToast('正在归档...', null, false);
  try {
    const archived = await apiArchiveMemory(id);
    undoPayload = {type:'memory', data: clone(found)};
    const normalized = normalizeMemoryMeta(archived);
    const idx = state.memories.findIndex(item => item.id === id);
    if (idx !== -1) state.memories[idx] = normalized;
    else state.memories.unshift(normalized);
    renderAfterMemoryApiChange(); closeModal();
    showToast('已归档记忆', () => restoreUndo(), true);
  } catch(err) {
    showToast(classifyApiError(err), null, false);
  } finally {
    unlockMemoryAction(id);
  }
}
function openPermanentDeleteMemoryConfirm(id){
  showModal(`
    <div class="modal-top">
      <div class="modal-title">永久删除记忆</div>
      <button class="close-btn" onclick="closeModal()">✕</button>
    </div>
    <p style="margin:16px 0">要永久删除这条记忆吗？删除后就不能从归档里移回来了。</p>
    <div class="action-row">
      <button class="ghost-btn" onclick="closeModal()">返回</button>
      <button class="danger-btn" data-action="memory-permanent-delete-confirm" data-id="${escapeHtml(id)}">确定删除</button>
    </div>
  `);
}
async function permanentlyDeleteMemory(id){
  if (!lockMemoryAction(id)) return;
  showToast('正在删除...', null, false);
  try {
    await apiDeleteMemoryPermanently(id);
    if (undoPayload?.type === 'memory' && undoPayload.data?.id === id) undoPayload = null;
    state.memories = state.memories.filter(item => item.id !== id);
    persistLocalCache(state);
    renderAfterMemoryApiChange(); closeModal();
    if (document.getElementById('archived-memories-editor')) renderArchivedMemoriesView();
    showToast('已永久删除', null, false);
  } catch(err) {
    showToast(classifyApiError(err), null, false);
  } finally {
    unlockMemoryAction(id);
  }
}
async function deleteDiary(id){
  if (!lockMemoryAction(id)) return;
  const found = diaryMemories().find(item => item.id === id);
  if (!found){ unlockMemoryAction(id); return; }
  undoPayload = {type:'diary', data: clone(found)};
  showToast('正在归档...', null, false);
  try {
    const archived = await apiArchiveMemory(id);
    const normalized = normalizeMemoryMeta(archived);
    const idx = state.memories.findIndex(item => item.id === id);
    if (idx !== -1) state.memories[idx] = normalized;
    renderAfterMemoryApiChange(); closeModal();
    showToast('已删除日记', () => restoreUndo(), true);
  } catch(err) {
    showToast(classifyApiError(err), null, false);
  } finally {
    unlockMemoryAction(id);
  }
}
async function deleteBottle(id){
  const found = state.bottles.find(item => item.id === id); if (!found) return;
  undoPayload = {type:'bottle', data: clone(found)};
  state.bottles = state.bottles.filter(item => item.id !== id);
  const r = await saveAndRender(); closeModal();
  if (r?.ok) showToast('已删除漂流瓶', () => restoreUndo(), true);
  else showToast('删除失败，请检查网络', null, false);
}
async function restoreUndo(){
  const payload = undoPayload;
  if (!payload) return;
  if (payload.type === 'memory') {
    const id = payload.data?.id;
    if (!lockMemoryAction(id)) return;
    showToast('正在撤销...', null, false);
    try {
      const restored = id ? await apiRestoreMemory(id) : payload.data;
      state.memories = state.memories.filter(item => item.id !== id);
      state.memories.unshift(restored);
      if (undoPayload === payload) undoPayload = null;
      renderAfterMemoryApiChange();
      if (document.getElementById('archived-memories-editor')) renderArchivedMemoriesView();
      showToast('已撤销归档', null, false);
    } catch(err) {
      showToast(classifyApiError(err), null, false);
    } finally {
      unlockMemoryAction(id);
    }
    return;
  }
  if (payload.type === 'diary') {
    const id = payload.data?.id;
    if (!lockMemoryAction(id)) return;
    showToast('正在撤销...', null, false);
    try {
      const restored = await apiRestoreMemory(id);
      state.memories = state.memories.map(item => item.id === id ? restored : item);
      if (undoPayload === payload) undoPayload = null;
      renderAfterMemoryApiChange();
      showToast('已撤销删除', null, false);
    } catch(err) {
      showToast(classifyApiError(err), null, false);
    } finally {
      unlockMemoryAction(id);
    }
    return;
  }
  if (payload.type === 'bottle') state.bottles.unshift(payload.data);
  undoPayload = null;
  const r = await saveAndRender();
  if (r?.ok) showToast('已撤销删除', null, false);
}
async function restoreArchivedMemory(id){
  if (!lockMemoryAction(id)) return;
  showToast('正在移出归档...', null, false);
  try {
    const restored = await apiRestoreMemory(id);
    state.memories = state.memories.map(item => item.id === id ? restored : item);
    closeModal();
    renderAfterMemoryApiChange();
    if (editorBackdrop.classList.contains('show')) renderArchivedMemoriesView();
    showToast('已移出归档', null, false);
  } catch(err) {
    showToast(classifyApiError(err), null, false);
  } finally {
    unlockMemoryAction(id);
  }
}
async function toggleBottleRead(id){
  state.bottles = state.bottles.map(item => item.id === id ? {...item, read: !item.read} : item);
  await saveAndRender(); closeModal();
}

document.getElementById('fab').addEventListener('click', () => {
  if (currentTab === 'memory') openMemoryForm();
  if (currentTab === 'diary') openDiaryForm();
  if (currentTab === 'bottle') openBottleForm();
});

function returnToCalendar(monthOffset = 0){
  closeEditor();
  openCalendarModal(monthOffset);
}
function backFromCollection(){
  if (currentCollectionParent) {
    const parent = collectionItem(currentCollectionParent);
    openCollectionModal(parent?.parentId || '');
  } else {
    closeEditor();
  }
}
function setMemoryLayer(layer){
  currentLayer = layer || 'all';
  currentCoreSub = 'all';
  renderMemory();
}
function setCoreSub(sub){
  currentCoreSub = sub || 'all';
  renderMemory();
}

document.body.addEventListener('click', (e) => {
  const target = e.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  if (!action) return;
  const id = target.dataset.id || '';
  const arg = target.dataset.arg || '';
  switch (action) {
    case 'switch-tab': switchTab(id); break;
    case 'open-memory': openMemoryDetail(id); break;
    case 'open-memory-from-editor': openMemoryDetailFromEditor(id); break;
    case 'open-diary': openDiaryDetail(id); break;
    case 'open-bottle': openBottleDetail(id); break;
    case 'jump-layer': jumpToLayer(id); break;
    case 'set-layer': setMemoryLayer(id); break;
    case 'set-core-sub': setCoreSub(id); break;
    case 'open-calendar': openCalendarModal(Number(arg) || 0); break;
    case 'return-to-calendar': returnToCalendar(Number(arg) || 0); break;
    case 'open-day': openDayDetail(id, Number(arg) || 0); break;
    case 'save-calendar-note': saveCalendarNote(id, Number(arg) || 0); break;
    case 'open-collection': openCollectionModal(id); break;
    case 'back-from-collection': backFromCollection(); break;
    case 'open-collection-folder-form': openCollectionFolderForm(id, arg); break;
    case 'open-collection-item-form': openCollectionItemForm(id, arg); break;
    case 'submit-collection-folder-form': submitCollectionFolderForm(id, arg); break;
    case 'submit-collection-item-form': submitCollectionItemForm(id, arg); break;
    case 'delete-collection': deleteCollection(id, arg); break;
    case 'open-memory-form': closeModal(); openMemoryForm(id); break;
    case 'submit-memory-form': submitMemoryForm(id); break;
    case 'toggle-resolved': toggleResolved(id); break;
    case 'toggle-pinned': togglePinned(id); break;
    case 'archive-memory': archiveMemory(id); break;
    case 'open-permanent-delete-memory-confirm': openPermanentDeleteMemoryConfirm(id); break;
    case 'memory-permanent-delete-confirm': permanentlyDeleteMemory(id); break;
    case 'restore-archived-memory': restoreArchivedMemory(id); break;
    case 'open-diary-form': closeModal(); openDiaryForm(id); break;
    case 'submit-diary-form': submitDiaryForm(id); break;
    case 'delete-diary': deleteDiary(id); break;
    case 'toggle-bottle-read': toggleBottleRead(id); break;
    case 'open-bottle-form': closeModal(); openBottleForm(id); break;
    case 'submit-bottle-form': submitBottleForm(id); break;
    case 'delete-bottle': deleteBottle(id); break;
    case 'open-health-entry-form': openHealthEntryForm(id, arg); break;
    case 'submit-health-entry-form': submitHealthEntryForm(id, arg); break;
    case 'delete-health-entry': deleteHealthEntry(id, arg); break;
    case 'open-period-form': openPeriodForm(id); break;
    case 'submit-period-form': submitPeriodForm(id); break;
    case 'delete-period': deletePeriod(id); break;
    case 'add-ring-comment': addRingComment(id); break;
    case 'delete-ring-comment': deleteRingComment(id, arg); break;
    case 'open-import-panel': openImportPanel(); break;
    case 'open-import-panel-target': openImportPanel(id); break;
    case 'import-close': closeImportPanel(); break;
    case 'import-extract': runImportExtract(); break;
    case 'import-dryrun': runImportDryRun(); break;
    case 'import-commit': runImportCommit(); break;
    case 'import-use-current': useCurrentAsTarget(id); break;
    case 'import-toggle-ignore': toggleCandidateIgnored(id); break;
    case 'import-delete-cand': deleteCandidate(id); break;
    case 'import-toggle-raw': toggleCandidateRaw(id); break;
    case 'conflict-download': downloadConflictBackup(); break;
    case 'conflict-force-save': forceSaveConflictBackup(); break;
    case 'conflict-reload': reloadFromRemote(); break;
    case 'remote-retry': performRemoteRetry(); break;
    case 'logout': performLogout(); break;
  }
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
  if (remote.ok) {
    state = normalizeState(remote.state);
    remoteReadOk = true;
  } else if (remote.reason === 'empty') {
    state = normalizeState(defaultState());
    remoteReadOk = true;
    try {
      state.memories = await fetchAllMemoriesFromApi();
    } catch(e) {
      remoteReadOk = false;
      showRemoteErrorOverlay({ok:false, reason:'memory_api_error', error:e});
      return false;
    }
  } else {
    remoteReadOk = false;
    showRemoteErrorOverlay(remote);
    return false;
  }
  persistLocalCache(state);
  renderAll();
  return true;
}

function showRemoteErrorOverlay(remote){
  const detail = remote?.error?.message ? `（${escapeHtml(remote.error.message)}）` : '';
  const reason = remote?.reason || 'unknown';
  showModal(`
    <div class="modal-top">
      <div>
        <div class="modal-title">云端读取失败</div>
        <div class="modal-sub">已暂停同步，避免覆盖远端</div>
      </div>
    </div>
    <div class="detail-body" style="margin-top:14px">
      没能从云端拿到记忆库${detail}。为防止你后续修改把远端覆盖成空库，本次会话已暂停所有写入。请重试连接，或退出登录后再来。
    </div>
    <div class="small muted" style="margin-top:8px">原因：${escapeHtml(reason)}</div>
    <div class="action-row">
      <button class="solid-btn" data-action="remote-retry">重试连接</button>
      <button class="ghost-btn" data-action="logout">退出登录</button>
    </div>
  `);
  modalSheet.dataset.locked = 'true';
}

async function performRemoteRetry(){
  delete modalSheet.dataset.locked;
  closeModal();
  await loadStateForUser();
}
window.performRemoteRetry = performRemoteRetry;

function clearAppSurface(){
  ['page-home','page-memory','page-diary','page-bottle','page-archive'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });
  const tabBar = document.getElementById('tab-bar');
  if (tabBar) tabBar.innerHTML = '';
  fab?.classList.add('hidden');
  delete modalSheet.dataset.locked;
  closeModal();
  closeEditor();
}

function handleSignedOut(){
  authSession = null;
  remoteUpdatedAt = null;
  remoteReadOk = false;
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
