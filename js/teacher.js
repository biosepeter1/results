// ══════════════════════════════════════════════════════════════════════════════
// TEACHER PORTAL JAVASCRIPT
// ══════════════════════════════════════════════════════════════════════════════

function $(id) { return document.getElementById(id); }

// ══════════════════════════════════════════════════════════
// MODERN NOTIFICATION & TOAST SYSTEM
// ══════════════════════════════════════════════════════════
function showToast(options) {
  let opts = typeof options === "string" ? { message: options } : (options || {});
  const type = opts.type || "info"; // "error" | "warning" | "success" | "info"
  const title = opts.title || (type === "error" ? "Action Required" : type === "warning" ? "Attention" : type === "success" ? "Success" : "Notification");
  const message = opts.message || "";
  const list = Array.isArray(opts.list) ? opts.list : [];
  const duration = typeof opts.duration === "number" ? opts.duration : (type === "error" ? 7500 : 4500);

  let container = $("appToastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "appToastContainer";
    container.className = "app-toast-container";
    document.body.appendChild(container);
  }

  const icons = {
    error: "❌",
    warning: "⚠️",
    success: "✅",
    info: "ℹ️"
  };

  const toast = document.createElement("div");
  toast.className = `app-toast toast-${type}`;

  const iconEl = document.createElement("div");
  iconEl.className = "app-toast-icon";
  iconEl.textContent = icons[type] || "ℹ️";
  toast.appendChild(iconEl);

  const contentEl = document.createElement("div");
  contentEl.className = "app-toast-content";

  const titleEl = document.createElement("div");
  titleEl.className = "app-toast-title";
  titleEl.textContent = title;
  contentEl.appendChild(titleEl);

  if (message) {
    const msgEl = document.createElement("div");
    msgEl.className = "app-toast-body";
    msgEl.textContent = message;
    contentEl.appendChild(msgEl);
  }

  if (list.length > 0) {
    const ul = document.createElement("ul");
    ul.className = "app-toast-list";
    list.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    });
    contentEl.appendChild(ul);
  }

  toast.appendChild(contentEl);

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "app-toast-close";
  closeBtn.innerHTML = "&times;";
  closeBtn.setAttribute("aria-label", "Close notification");
  closeBtn.onclick = () => dismissToast(toast);
  toast.appendChild(closeBtn);

  container.appendChild(toast);

  let timer = null;
  if (duration > 0) {
    timer = setTimeout(() => dismissToast(toast), duration);
  }

  function dismissToast(el) {
    if (timer) clearTimeout(timer);
    el.style.animation = "appToastFadeOut 200ms ease forwards";
    setTimeout(() => {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 200);
  }

  return toast;
}
window.showToast = showToast;

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Independent Supabase Engine Active (Zero Firebase Dependency)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// ════════════════════════════════════════
// TEACHERS & PERMISSIONS (Fallback)
// ════════════════════════════════════════
const TEACHERS = {
  "admin": { "password": "admin", "name": "Administrator", "subjects": [], "classes": [] },
  "mrsitema": { "password": "MrSitema", "name": "Mr Sitema", "subjects": ["French Language"], "classes": ["Year 7", "Year 8", "Year 9"] },
  "ayomideadeyemi": { "password": "AyomideAdeyemi", "name": "Ayomide Adeyemi", "subjects": ["Civic Education", "Social and Citizenship Studies"], "classes": ["Year 8", "Year 9"] },
  "balogunmr": { "password": "BalogunMr", "name": "Balogun Mr", "subjects": ["Yoruba Language"], "classes": ["Year 7", "Year 9"] },
  "godwinawomoye": { "password": "GodwinAwomoye", "name": "Godwin Awomoye", "subjects": ["Cultural and Creative Art"], "classes": ["Year 7", "Year 8", "Year 9"] },
  "janetkura": { "password": "JanetKura", "name": "Janet Kura", "subjects": ["Christian Religious Studies"], "classes": ["Year 8"] },
  "missakinwale": { "password": "MissAkinwale", "name": "Miss Akinwale", "subjects": ["Home Economics"], "classes": ["Year 9"] },
  "misschristian": { "password": "MissChristian", "name": "Miss Christian", "subjects": ["Christian Religious Studies"], "classes": ["Year 8"] },
  "missodili": { "password": "Miss Odili", "name": "Miss Odili", "subjects": ["French Language"], "classes": ["Year 7", "Year 8"] },
  "mradegbite": { "password": "MrAdegbite", "name": "Mr Adegbite", "subjects": ["Biology (Checkpoint)"], "classes": ["Year 9"] },
  "mrandero": { "password": "MrAndero", "name": "Mr Andero", "subjects": ["Basic Science"], "classes": ["Year 7"] },
  "mrbada": { "password": "MrBada", "name": "Mr Bada", "subjects": ["Physical Health Education"], "classes": ["Year 7", "Year 8", "Year 9"] },
  "mremmanuel": { "password": "MrEmmanuel", "name": "Mr Emmanuel", "subjects": ["History"], "classes": ["Year 7", "Year 8", "Year 9"] },
  "mrhassan": { "password": "MrHassan", "name": "Mr Hassan", "subjects": ["English Language"], "classes": ["Year 8"] },
  "mrsaluko": { "password": "MrsAluko", "name": "Mrs Aluko", "subjects": ["Social Studies"], "classes": ["Year 7"] },
  "mrsanaba": { "password": "MrsAnaba", "name": "Mrs Anaba", "subjects": ["English Language"], "classes": ["Year 9"] },
  "mrsbakare": { "password": "MrsBakare", "name": "Mrs Bakare", "subjects": ["Christian Religious Studies"], "classes": ["Year 7", "Year 9"] },
  "mrseka": { "password": "MrsEka", "name": "Mrs Eka", "subjects": ["Civic Education"], "classes": ["Year 7"] },
  "mrsfalohun": { "password": "MrsFalohun", "name": "Mrs Falohun", "subjects": ["Horticulture and Crop Production"], "classes": ["Year 9"] },
  "mrsibitoye": { "password": "MrsIbitoye", "name": "Mrs Ibitoye", "subjects": ["Yoruba Language"], "classes": ["Year 8"] },
  "mrsmatohor": { "password": "MrsMatohor", "name": "Mrs Matohor", "subjects": ["Home Economics"], "classes": ["Year 7", "Year 8"] },
  "mrsnkem": { "password": "MrsNkem", "name": "Mrs Nkem", "subjects": ["Agricultural Science"], "classes": ["Year 7", "Year 8"] },
  "mrsodeyemi": { "password": "MrsOdeyemi", "name": "Mrs Odeyemi", "subjects": ["Islamic Religious Studies"], "classes": ["Year 7", "Year 8", "Year 9"] },
  "mrsolapoju": { "password": "MrsOlapoju", "name": "Mrs Olapoju", "subjects": ["Christian Religious Studies"], "classes": ["Year 7"] },
  "mrsolateju": { "password": "MrsOlateju", "name": "Mrs Olateju", "subjects": ["Basic Technology"], "classes": ["Year 9"] },
  "mrsonibiyo": { "password": "MrsOnibiyo", "name": "Mrs Onibiyo", "subjects": ["Basic Technology"], "classes": ["Year 7", "Year 8"] },
  "mrsoyerogba": { "password": "MrsOyerogba", "name": "Mrs Oyerogba", "subjects": ["Social Studies"], "classes": ["Year 8"] },
  "mrssekoni": { "password": "MrsSekoni", "name": "Mrs Sekoni", "subjects": ["Basic Science"], "classes": ["Year 8"] },
  "mrssunday": { "password": "MrsSunday", "name": "Mrs Sunday", "subjects": ["Christian Religious Studies"], "classes": ["Year 8"] },
  "olamideoribamise": { "password": "OlamideOribamise", "name": "Olamide Oribamise", "subjects": ["Mathematics"], "classes": ["Year 7"] },
  "olasojiolaposi": { "password": "OlasojiOlaposi", "name": "Olasoji Olaposi", "subjects": ["Basic Technology"], "classes": ["Year 9"] },
  "taiwoaguomba": { "password": "TaiwoAguomba", "name": "Taiwo Aguomba", "subjects": ["History"], "classes": ["Year 9"] }
};

const PASS_MARK = 50;
const PAGE_SIZE = 50;

let allRows = [], teacher = null, currentTerm = null;
let activeFilteredRows = [];
let currentPage = 1;
let sortCol = "student", sortAsc = true;
let teacherActiveViewTab = "all"; // "all" or "rewrite"
let teacherRewriteCutoffPct = 25; // Default: <= 25%
let teacherRewriteStudents = [];
let teacherStudentByIdMap = new Map();

// ── Teacher Score Conversion & Sync ─────────────────────────
const SCORE_CONVERSION_KEY = "SCORE_CONVERSION_SETTING_v1";

function getTeacherConversionConfig() {
  try {
    const raw = localStorage.getItem(SCORE_CONVERSION_KEY);
    if (!raw) return { terms: {} };
    const parsed = JSON.parse(raw);
    if (!parsed) return { terms: {} };
    if (parsed.terms) return parsed;
    // Normalize legacy single-term setting
    if (parsed.originalMax && parsed.targetMax) {
      const tKey = parsed.targetTerm || "__ALL__";
      return {
        terms: {
          [tKey]: { originalMax: parsed.originalMax, targetMax: parsed.targetMax }
        }
      };
    }
    return { terms: {} };
  } catch (e) {
    return { terms: {} };
  }
}

function normalizeTeacherTermKey(str) {
  return String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getCanonicalTeacherTermCategory(str) {
  const s = normalizeTeacherTermKey(str);
  if (!s) return "";
  const isSecond = s.includes("second") || s.includes("2nd");
  const isThird = s.includes("third") || s.includes("3rd");
  const prefix = isThird ? "t3_" : (isSecond ? "t2_" : "t1_");

  if (s.includes("midterm") || (s.includes("mid") && s.includes("term"))) return prefix + "midterm";
  if (s.includes("firsttest") || s.includes("1sttest") || s.includes("ca1") || s.includes("test1")) return prefix + "firsttest";
  if (s.includes("secondtest") || s.includes("2ndtest") || s.includes("ca2") || s.includes("test2")) return prefix + "secondtest";
  if (s.includes("exam") || s.includes("terminal") || s.includes("final")) return prefix + "exam";
  return prefix + s;
}

function getTeacherConversionForTerm(term) {
  const config = getTeacherConversionConfig();
  if (!config || !config.terms) return null;

  // 1. Direct exact match
  if (term && config.terms[term]) {
    const c = config.terms[term];
    if (c.originalMax && c.targetMax && c.originalMax !== c.targetMax) return c;
  }

  // 2. Normalized case-insensitive and punctuation-insensitive match
  const tNorm = normalizeTeacherTermKey(term || (typeof currentTerm !== "undefined" ? currentTerm : ""));
  if (tNorm) {
    for (const [k, c] of Object.entries(config.terms)) {
      if (k === "__ALL__" || !c) continue;
      const kNorm = normalizeTeacherTermKey(k);
      if (kNorm && (kNorm === tNorm || kNorm.includes(tNorm) || tNorm.includes(kNorm))) {
        if (c.originalMax && c.targetMax && c.originalMax !== c.targetMax) return c;
      }
    }
  }

  // 3. Semantic / canonical assessment matching (e.g. "Mid Term Test" matches "Mid Term Examination", "Mid Term", "midterm")
  const tCat = getCanonicalTeacherTermCategory(term || (typeof currentTerm !== "undefined" ? currentTerm : ""));
  if (tCat) {
    for (const [k, c] of Object.entries(config.terms)) {
      if (k === "__ALL__" || !c) continue;
      const kCat = getCanonicalTeacherTermCategory(k);
      if (kCat && (kCat === tCat || (kCat.endsWith("midterm") && tCat.endsWith("midterm")) || (kCat.endsWith("firsttest") && tCat.endsWith("firsttest")) || (kCat.endsWith("exam") && tCat.endsWith("exam")))) {
        if (c.originalMax && c.targetMax && c.originalMax !== c.targetMax) return c;
      }
    }
  }

  // 4. Fallback to active system term if row term differed
  const curNorm = normalizeTeacherTermKey(typeof currentTerm !== "undefined" ? currentTerm : "");
  if (curNorm && curNorm !== tNorm) {
    for (const [k, c] of Object.entries(config.terms)) {
      if (k === "__ALL__" || !c) continue;
      const kNorm = normalizeTeacherTermKey(k);
      if (kNorm && (kNorm === curNorm || kNorm.includes(curNorm) || curNorm.includes(kNorm))) {
        if (c.originalMax && c.targetMax && c.originalMax !== c.targetMax) return c;
      }
    }
  }

  // 5. Fallback: If only ONE term conversion is configured, apply it
  const termKeys = Object.keys(config.terms).filter(k => k !== "__ALL__");
  if (termKeys.length === 1) {
    const single = config.terms[termKeys[0]];
    if (single && single.originalMax && single.targetMax && single.originalMax !== single.targetMax) {
      return single;
    }
  }

  // 6. Global "__ALL__" rule
  if (config.terms["__ALL__"]) {
    const c = config.terms["__ALL__"];
    if (c.originalMax && c.targetMax && c.originalMax !== c.targetMax) return c;
  }
  return null;
}

function setTeacherScoreConversion(obj) {
  if (obj && !obj.disabled && (obj.terms || (obj.originalMax && obj.targetMax))) {
    // Also register aliases if a term is provided
    if (obj.terms) {
      for (const [k, val] of Object.entries(obj.terms)) {
        const norm = normalizeTeacherTermKey(k);
        if (norm.includes("midterm") || (norm.includes("mid") && norm.includes("term"))) {
          obj.terms["Mid Term Test"] = val;
          obj.terms["Mid Term Examination"] = val;
          obj.terms["Mid Term"] = val;
          obj.terms["MID TERM EXAMINATION"] = val;
        }
      }
    }
    localStorage.setItem(SCORE_CONVERSION_KEY, JSON.stringify(obj));
  } else {
    localStorage.removeItem(SCORE_CONVERSION_KEY);
  }
}

function parseTeacherRawScoreNum(val) {
  if (val === undefined || val === null || val === "") return NaN;
  if (typeof val === "number") return val;
  const str = String(val).trim();
  const m = str.match(/^([\d.]+)\s*(?:of|\/)/i);
  return m ? parseFloat(m[1]) : parseFloat(str);
}

function applyTeacherScoreConversion(rawScore, term) {
  const num = parseTeacherRawScoreNum(rawScore);
  if (isNaN(num)) return rawScore;
  const c = getTeacherConversionForTerm(term);
  if (!c || !c.originalMax || !c.targetMax || c.originalMax === c.targetMax) return num;
  const factor = c.targetMax / c.originalMax;
  return Math.round(num * factor * 100) / 100;
}

function applyTeacherPctConversion(rawScore, term) {
  const num = parseTeacherRawScoreNum(rawScore);
  if (isNaN(num)) return null;
  const c = getTeacherConversionForTerm(term);
  if (!c || !c.originalMax || !c.targetMax) return null;
  const converted = applyTeacherScoreConversion(num, term);
  return Math.round((converted / c.targetMax) * 100 * 10) / 10;
}

function getRowEffectivePct(r) {
  const rawScore = parseFloat(r.score) || 0;
  const conv = applyTeacherPctConversion(rawScore, r ? r.term : null);
  return conv !== null ? conv : (r.pct || 0);
}

function getTeacherSubjectMaxMark(subObj, termName) {
  const t = termName || currentTerm;
  const c = getTeacherConversionForTerm(t);
  if (c && c.targetMax) return Number(c.targetMax);

  if (subObj) {
    if (subObj.max) return Number(subObj.max);
    if (subObj.maxScore) return Number(subObj.maxScore);

    const s = parseFloat(subObj.score !== undefined ? subObj.score : subObj.rawScore);
    const p = parseFloat(subObj.pct);
    if (s > 0 && p > 0) {
      const derived = Math.round(s / (p / 100));
      if (derived > 0 && Number.isFinite(derived)) return derived;
    }
  }

  if (Array.isArray(allRows) && allRows.length > 0) {
    for (let i = 0; i < Math.min(allRows.length, 200); i++) {
      const r = allRows[i];
      if (!t || r.term === t) {
        const s = parseFloat(r.score);
        const p = parseFloat(r.pct);
        if (s > 0 && p > 0) {
          const derived = Math.round(s / (p / 100));
          if (derived > 0 && Number.isFinite(derived)) return derived;
        }
      }
    }
  }

  return null;
}

function updateTeacherConvNotice() {
  const notice = $("teacherConvNotice");
  if (notice) notice.style.display = "none";
}

async function syncTeacherScoreConversion(triggerRender = false) {
  const prevSetting = JSON.stringify(getTeacherConversionConfig());
  if (window.dbClient && window.dbClient.getScoreConversionCloud) {
    try {
      const cloudConv = await window.dbClient.getScoreConversionCloud();
      if (cloudConv && !cloudConv.disabled && ((cloudConv.terms && Object.keys(cloudConv.terms).length > 0) || (cloudConv.originalMax && cloudConv.targetMax))) {
        setTeacherScoreConversion(cloudConv);
      } else {
        setTeacherScoreConversion(null);
      }
    } catch (e) {
      console.warn("Teacher score conversion sync error:", e);
    }
  }
  updateTeacherConvNotice();
  const nextSetting = JSON.stringify(getTeacherConversionConfig());
  if ((triggerRender || prevSetting !== nextSetting) && typeof render === "function" && typeof allRows !== "undefined" && allRows.length > 0) {
    render();
  }
}

// Auto-sync scaling from admin in background and on window focus
window.addEventListener("focus", () => {
  const appEl = $("app");
  if (appEl && appEl.style.display !== "none") {
    syncTeacherScoreConversion(true);
  }
});
setInterval(() => {
  const appEl = $("app");
  if (appEl && appEl.style.display !== "none") {
    syncTeacherScoreConversion(true);
  }
}, 10000);

let teacherParsedQuestions = [];
let teacherSubmissions = [];

const $login = $("login"), $app = $("app"), $u = $("u"), $p = $("p"), $go = $("go"), $msg = $("msg");
const $tb = $("tb"), $loader = $("loader"), $empty = $("empty"), $fs = $("fs"), $fc = $("fc"), $fa = $("fa"), $q = $("q");
const $activeFilterTags = $("activeFilterTags");
const $prevPageBtn = $("prevPageBtn"), $nextPageBtn = $("nextPageBtn");

// ── Password Visibility Toggle ──
$("togglePw").addEventListener("click", () => {
  const isPw = $p.type === "password";
  $p.type = isPw ? "text" : "password";
  $("togglePw").textContent = isPw ? "Hide" : "Show";
});

// ── Login ──
async function doLogin() {
  const user = $u.value.trim(), pass = $p.value;
  $msg.textContent = "";
  if (!user || !pass) {
    $msg.textContent = "Please enter username and password.";
    return;
  }
  const clean = user.toLowerCase().replace(/[^a-z0-9]/g, '');
  $go.disabled = true;
  $go.textContent = "Signing in...";

  let found = null;
  // 1. Supabase teacher account check
  try {
    if (window.dbClient && window.dbClient.getTeacher) {
      found = await window.dbClient.getTeacher(clean);
    }
  } catch (e) {
    console.warn("Supabase teacher fetch error, checking backup:", e);
  }

  // 2. Fallback to embedded dictionary
  if (!found) {
    found = TEACHERS[clean] || TEACHERS[user];
  }

  // Guard: password field may be undefined if admin didn't set one
  const storedPw = found ? (found.password || "") : "";
  const passMatch = found && (storedPw === pass || storedPw.toLowerCase() === pass.toLowerCase());
  if (!found || !passMatch) {
    $msg.textContent = "Invalid username or password.";
    $go.disabled = false;
    $go.textContent = "Sign in";
    return;
  }

  teacher = { ...found, username: user };

  // Persist session for seamless page reloads
  try {
    localStorage.setItem("teacher_session_v1", JSON.stringify({
      username: user,
      pass: pass,
      teacher: teacher
    }));
  } catch (err) {
    console.warn("Unable to save session to localStorage:", err);
  }

  try {
    await loadData();
    showApp();
  } catch (e) {
    $msg.textContent = e.message || "Unable to connect. Check your internet connection.";
    console.error(e);
  }
  $go.disabled = false;
  $go.textContent = "Sign in";
}

$go.addEventListener("click", doLogin);
[$u, $p].forEach(el => el.addEventListener("keydown", e => e.key === "Enter" && doLogin()));

// ── Data Loader & Local Storage Cache ──
const TEACHER_CACHE_PREFIX = "teacher_cache_v3_";

function deduplicateScoreRows(rows) {
  if (!Array.isArray(rows) || !rows.length) return [];
  const map = new Map();
  rows.forEach(r => {
    const reg = (r.reg || "").trim().toUpperCase();
    const st = (r.student || r.name || "").trim().toUpperCase();
    const sub = (r.subject || "").trim().toUpperCase();
    const cls = (r.class || r.className || "").trim().toUpperCase();
    const arm = (r.arm || "").trim().toUpperCase();
    const term = (r.term || "").trim().toUpperCase();
    const key = `${term}|${reg || st}|${sub}|${cls}|${arm}`;

    const rawScore = r.score !== undefined ? parseFloat(r.score) : NaN;
    const rawPct = r.pct !== undefined ? parseFloat(r.pct) : NaN;
    const scoreVal = !isNaN(rawScore) ? rawScore : (!isNaN(rawPct) ? rawPct : -1);

    if (!map.has(key)) {
      map.set(key, { row: r, score: scoreVal });
    } else {
      const existing = map.get(key);
      // If new row has a higher score (e.g. resit or updated mark), keep the higher one!
      if (scoreVal > existing.score) {
        map.set(key, { row: r, score: scoreVal });
      }
    }
  });
  return Array.from(map.values()).map(v => v.row);
}

function getTeacherCache(username) {
  try {
    const clean = (username || "").toLowerCase().replace(/[^a-z0-9]/g, '');
    const raw = localStorage.getItem(TEACHER_CACHE_PREFIX + clean);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { return null; }
}

function setTeacherCache(username, data) {
  try {
    const clean = (username || "").toLowerCase().replace(/[^a-z0-9]/g, '');
    localStorage.setItem(TEACHER_CACHE_PREFIX + clean, JSON.stringify(data));
  } catch (err) {
    console.warn("localStorage quota exceeded (handled safely):", err);
  }
}

function clearTeacherCache(username) {
  try {
    const clean = (username || "").toLowerCase().replace(/[^a-z0-9]/g, '');
    localStorage.removeItem(TEACHER_CACHE_PREFIX + clean);
    // On shared school computers: clean up any other teacher traces
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(TEACHER_CACHE_PREFIX)) {
        localStorage.removeItem(k);
      }
    });
  } catch (e) { }
}

function showTeacherFreshness(timeStr, isOffline = false) {
  const badge = $("teacherFreshnessBadge");
  if (!badge) return;
  if (isOffline) {
    badge.innerHTML = ` · <span style="color:var(--text-muted)">Saved device copy (${esc(timeStr)})</span>`;
  } else {
    badge.innerHTML = ` · <span>Last updated: ${esc(timeStr)}</span>`;
  }
}

async function loadData() {
  await syncTeacherScoreConversion();
  allRows = [];
  const clean = (teacher.username || "").toLowerCase().replace(/[^a-z0-9]/g, '');
  const cached = getTeacherCache(clean);
  const hasSubjectRestriction = teacher.subjects && teacher.subjects.length > 0;
  const hasClassRestriction = teacher.classes && teacher.classes.length > 0;

  // 1. Read the tiny version document from Supabase
  let cloudVersion = null;
  let isCloudAvailable = false;
  try {
    if (window.dbClient && window.dbClient.getVersion) {
      cloudVersion = await window.dbClient.getVersion();
      isCloudAvailable = true;
    }
  } catch (e) {
    console.warn("Version check failed:", e);
    isCloudAvailable = false;
  }

  // 2. If cached data matches cloud version, USE IT DIRECTLY!
  if (isCloudAvailable && cloudVersion && cached && cached.version && cached.version === cloudVersion && Array.isArray(cached.rows) && cached.rows.length > 0) {
    allRows = deduplicateScoreRows(cached.rows);
    showTeacherFreshness(cached.lastUpdatedText || new Date(cached.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), false);
    return;
  }

  // 3. Fallback: If offline, but this teacher loaded before:
  if (!isCloudAvailable && cached && Array.isArray(cached.rows) && cached.rows.length > 0) {
    allRows = deduplicateScoreRows(cached.rows);
    showTeacherFreshness(cached.lastUpdatedText || "Earlier session", true);
    return;
  }

  // 4. Fetch latest scores from Supabase
  try {
    const rawScores = await window.dbClient.getScores(
      null,
      hasSubjectRestriction ? teacher.subjects : null,
      hasClassRestriction ? teacher.classes : null
    );

    // If Supabase returned empty results but device has saved scores, keep device copy!
    if ((!rawScores || rawScores.length === 0) && cached && Array.isArray(cached.rows) && cached.rows.length > 0) {
      allRows = deduplicateScoreRows(cached.rows);
      showTeacherFreshness(cached.lastUpdatedText || "Earlier session", true);
      return;
    }

    const authorizedRows = [];
    (rawScores || []).forEach(r => {
      // Subject restriction filter
      if (hasSubjectRestriction && !teacher.subjects.includes(r.subject)) return;
      // Class restriction filter
      if (hasClassRestriction && teacher.classes.length > 0 && !teacher.classes.includes((r.class || "").trim())) return;

      const studentName = (r.student || r.name || "").toUpperCase();
      const regNum = r.reg || r.regNo || r.admNo || r.admissionNumber || "";
      const className = r.class || r.className || "";
      const armName = r.arm || "";
      const subjectName = r.subject || "";
      const scoreDisplay = r.score !== undefined ? String(r.score) : "";
      const pctVal = r.pct !== undefined ? Number(r.pct) : (parseFloat(scoreDisplay) || 0);
      const dateStr = r.date || r.dateTime || "-";

      authorizedRows.push({
        ...r,
        student: studentName,
        reg: regNum,
        class: className,
        arm: armName,
        subject: subjectName,
        score: scoreDisplay,
        pct: pctVal,
        date: dateStr,
        term: r.term || ""
      });
    });

    allRows = deduplicateScoreRows(authorizedRows);
    const now = new Date();
    const timeStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

    // Store ONLY this teacher's authorized rows in their private cache
    if (allRows.length > 0) {
      setTeacherCache(clean, {
        version: cloudVersion || now.toISOString(),
        timestamp: Date.now(),
        lastUpdatedText: timeStr,
        rows: allRows
      });
    }

    showTeacherFreshness(timeStr, false);
  } catch (e) {
    console.warn("loadData fetch error:", e);
    if (cached && Array.isArray(cached.rows) && cached.rows.length > 0) {
      allRows = cached.rows;
      showTeacherFreshness(cached.lastUpdatedText || "Earlier session", true);
    } else {
      throw new Error("Unable to load examination scores from Supabase. Check your connection.");
    }
  }
}

// ── Tab Navigation ──
function switchTeacherPortalTab(target) {
  try {
    localStorage.setItem("teacher_active_tab_v1", target);
  } catch (e) { }
  const isCbt = (target === "cbt");
  const $paneScores = $("paneTeacherScores");
  const $paneCbt = $("paneTeacherCbt");

  if ($paneScores) $paneScores.style.display = isCbt ? "none" : "block";
  if ($paneCbt) $paneCbt.style.display = isCbt ? "block" : "none";

  // Sync desktop tabs
  document.querySelectorAll(".header-nav-bar .portal-nav-btn[data-tab]").forEach(el => {
    el.classList.toggle("active", el.dataset.tab === target);
  });
  if ($("btnTeacherNavScores")) $("btnTeacherNavScores").classList.toggle("active", !isCbt);
  if ($("btnTeacherNavCbt")) $("btnTeacherNavCbt").classList.toggle("active", isCbt);

  // Sync mobile drawer items
  document.querySelectorAll(".mobile-nav-item[data-tab]").forEach(el => {
    el.classList.toggle("active", el.dataset.tab === target);
  });
  document.querySelectorAll(".mobile-nav-item[data-teacher-tab]").forEach(el => {
    el.classList.toggle("active", el.dataset.teacherTab === target);
  });

  // Sync mobile bottom app bar tabs
  document.querySelectorAll(".mobile-bottom-tab[data-tab]").forEach(el => {
    el.classList.toggle("active", el.dataset.tab === target);
  });

  if (isCbt) {
    loadActiveCbtTerm();
    loadTeacherCbtDefaults();
    initTeacherCbtForm();
    loadTeacherSubmissions();
  }
}

// Mobile Drawer & Bottom Navigation Wiring
function closeTeacherMobileDrawer() {
  $("teacherMobileDrawer")?.classList.remove("open");
  $("teacherDrawerOverlay")?.classList.remove("open");
}
function openTeacherMobileDrawer() {
  $("teacherMobileDrawer")?.classList.add("open");
  $("teacherDrawerOverlay")?.classList.add("open");
}

if ($("teacherMobileToggleBtn")) {
  $("teacherMobileToggleBtn").onclick = (e) => {
    e.stopPropagation();
    openTeacherMobileDrawer();
  };
}
if ($("teacherDrawerCloseBtn")) {
  $("teacherDrawerCloseBtn").onclick = (e) => {
    e.stopPropagation();
    closeTeacherMobileDrawer();
  };
}
if ($("teacherDrawerOverlay")) {
  $("teacherDrawerOverlay").onclick = closeTeacherMobileDrawer;
}
if ($("teacherDrawerSignOutBtn")) {
  $("teacherDrawerSignOutBtn").onclick = () => {
    closeTeacherMobileDrawer();
    doSignOut();
  };
}

// Mobile drawer navigation buttons
document.querySelectorAll(".mobile-nav-item[data-tab]").forEach(btn => {
  btn.onclick = () => {
    switchTeacherPortalTab(btn.dataset.tab);
    closeTeacherMobileDrawer();
  };
});
document.querySelectorAll(".mobile-nav-item[data-teacher-tab]").forEach(btn => {
  btn.onclick = () => {
    switchTeacherPortalTab(btn.dataset.teacherTab);
    closeTeacherMobileDrawer();
  };
});

// Mobile bottom bar tabs
document.querySelectorAll(".mobile-bottom-tab[data-tab]").forEach(btn => {
  btn.onclick = () => {
    switchTeacherPortalTab(btn.dataset.tab);
  };
});

if ($("btnTeacherNavScores")) $("btnTeacherNavScores").addEventListener("click", () => switchTeacherPortalTab("scores"));
if ($("btnTeacherNavCbt")) $("btnTeacherNavCbt").addEventListener("click", () => switchTeacherPortalTab("cbt"));

function updateTeacherViewTabs() {
  const isAll = (teacherActiveViewTab === "all");
  const tabAll = $("tabTeacherViewAll");
  const tabRewrite = $("tabTeacherViewRewrite");
  const toolbar = $("teacherRewriteToolbar");
  const standardToolbar = $("teacherTableStandardActions");
  const headingText = $("tableHeadingText");

  if (tabAll) tabAll.classList.toggle("active", isAll);
  if (tabRewrite) tabRewrite.classList.toggle("active", !isAll);
  if (toolbar) toolbar.style.display = isAll ? "none" : "flex";
  if (standardToolbar) standardToolbar.style.display = isAll ? "flex" : "none";
  if (headingText) {
    headingText.textContent = isAll
      ? "Student Examination Scores"
      : `Students That Need to Rewrite Examination (≤${teacherRewriteCutoffPct}%)`;
  }
}

if ($("tabTeacherViewAll")) {
  $("tabTeacherViewAll").addEventListener("click", () => {
    teacherActiveViewTab = "all";
    updateTeacherViewTabs();
    renderTableOnly();
  });
}

if ($("tabTeacherViewRewrite")) {
  $("tabTeacherViewRewrite").addEventListener("click", () => {
    teacherActiveViewTab = "rewrite";
    updateTeacherViewTabs();
    renderTableOnly();
  });
}

if ($("cardTeacherRewrite")) {
  $("cardTeacherRewrite").addEventListener("click", () => {
    switchTeacherPortalTab("scores");
    teacherActiveViewTab = "rewrite";
    updateTeacherViewTabs();
    renderTableOnly();
    const tbl = $("tabTeacherViewRewrite");
    if (tbl) tbl.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

if ($("tRewriteCutoffSelect")) {
  $("tRewriteCutoffSelect").addEventListener("change", (e) => {
    teacherRewriteCutoffPct = Number(e.target.value) || 25;
    render();
  });
}

if ($("btnTeacherExportRewrite")) {
  $("btnTeacherExportRewrite").addEventListener("click", () => exportTeacherRewriteCSV());
}

// ── Show App ──
function showApp() {
  document.documentElement.classList.add("restoring-teacher-session");
  $login.style.display = "none";
  $app.style.display = "block";
  if ($("who")) $("who").textContent = teacher.name;
  if ($("teacherDrawerWho")) $("teacherDrawerWho").textContent = teacher.name;
  const initials = (teacher.name || "TC")
    .split(" ")
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "TC";
  if ($("teacherAvatar")) $("teacherAvatar").textContent = initials;
  if ($("teacherDrawerAvatar")) $("teacherDrawerAvatar").textContent = initials;
  const sl = (teacher.subjects && teacher.subjects.length) ? teacher.subjects.join(", ") : "All subjects";
  const cl = (teacher.classes && teacher.classes.length) ? teacher.classes.join(", ") : "All classes";
  const al = (teacher.arms && teacher.arms.length) ? ` (${teacher.arms.join(", ")})` : "";
  const subText = `${sl} · ${cl}${al}`;
  if ($("subinfo")) $("subinfo").textContent = subText;
  if ($("teacherDrawerSubinfo")) $("teacherDrawerSubinfo").textContent = subText;
  const activeTab = localStorage.getItem("teacher_active_tab_v1") || "scores";
  switchTeacherPortalTab(activeTab);
  buildTermTabs();
}

// ── Sign Out ──
function doSignOut() {
  // Clear teacher data from memory
  teacher = null;
  allRows = [];
  activeFilteredRows = [];
  currentTerm = null;
  currentPage = 1;

  // Clear teacher session and active tab from localStorage
  try {
    localStorage.removeItem("teacher_session_v1");
    localStorage.removeItem("teacher_active_tab_v1");
  } catch (e) { }

  document.documentElement.classList.remove("restoring-teacher-session");

  // Clear teacher caches from localStorage
  Object.keys(localStorage).forEach(function (k) {
    if (k.startsWith(TEACHER_CACHE_PREFIX)) localStorage.removeItem(k);
  });

  // Reset login form fields
  if ($u) $u.value = '';
  if ($p) $p.value = '';
  if ($msg) $msg.textContent = '';


  // Switch back to login screen
  $app.style.display = 'none';
  $login.style.display = 'flex';
  if ($u) setTimeout(function () { $u.focus(); }, 50);
}

// Wire Sign Out button at startup
(function wireSignOut() {
  var btn = document.getElementById('out');
  if (btn) btn.addEventListener('click', doSignOut);
})();

// ── Term Tabs ──
function buildTermTabs() {
  const scoped = scopedRows();
  const terms = [...new Set(scoped.map(r => r.term).filter(Boolean))].sort();
  const $tabs = $("termTabs");
  $tabs.innerHTML = "";

  if (!terms.length) {
    $tabs.innerHTML = `<span style="color:var(--text-muted);font-size:13px">No examination records uploaded yet. Use admin portal to upload.</span>`;
    render();
    return;
  }

  // All Terms Tab (Text only, no emojis)
  const allTab = document.createElement("button");
  allTab.type = "button";
  allTab.className = "term-tab" + (currentTerm === null ? " active" : "");
  allTab.textContent = "All terms";
  allTab.onclick = () => { currentTerm = null; currentPage = 1; updateTabs(); buildFilters(); render(); };
  $tabs.appendChild(allTab);

  terms.forEach(term => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "term-tab" + (currentTerm === term ? " active" : "");
    btn.textContent = term;
    btn.onclick = () => { currentTerm = term; currentPage = 1; updateTabs(); buildFilters(); render(); };
    $tabs.appendChild(btn);
  });

  if (!currentTerm && terms.length) currentTerm = terms[terms.length - 1];
  updateTabs();
  buildFilters();
  render();
}

function updateTabs() {
  document.querySelectorAll(".term-tab").forEach(btn => {
    const isAll = btn.textContent === "All terms";
    btn.classList.toggle("active", isAll ? currentTerm === null : btn.textContent === currentTerm);
  });
  $("tableHeadingText").textContent = (currentTerm || "All terms") + " — Examination Scores";
}

function scopedRows() {
  return allRows.filter(r => {
    const sOk = !teacher.subjects || !teacher.subjects.length || teacher.subjects.includes(r.subject);
    const cOk = !teacher.classes || !teacher.classes.length || teacher.classes.includes(r.class);
    const aOk = !teacher.arms || !teacher.arms.length || teacher.arms.includes(r.arm);
    return sOk && cOk && aOk;
  });
}

function termRows() {
  const s = scopedRows();
  if (!currentTerm) return s;
  return s.filter(r => r.term === currentTerm);
}

function buildFilters() {
  const s = termRows();
  populate($fs, [...new Set(s.map(r => r.subject))].sort());
  populate($fc, [...new Set(s.map(r => r.class))].sort());
  populate($fa, [...new Set(s.map(r => r.arm))].sort());
}

function populate(sel, vals) {
  const currentVal = sel.value;
  const first = sel.options[0];
  sel.innerHTML = "";
  sel.appendChild(first);
  vals.forEach(v => {
    const o = document.createElement("option");
    o.value = o.textContent = v;
    sel.appendChild(o);
  });
  if (vals.includes(currentVal)) sel.value = currentVal;
}

// ── Sorting ──
if ($("teacherTableHead")) {
  $("teacherTableHead").addEventListener("click", (e) => {
    const th = e.target.closest("th.sortable");
    if (!th) return;
    const col = th.dataset.sort;
    if (!col) return;
    if (sortCol === col) {
      sortAsc = !sortAsc;
    } else {
      sortCol = col;
      sortAsc = true;
    }
    updateSortIndicators();
    renderTableOnly();
  });
}

function updateSortIndicators() {
  document.querySelectorAll(".sort-indicator").forEach(el => el.textContent = "");
  const activeIndicator = $("si-" + sortCol);
  if (activeIndicator) {
    activeIndicator.textContent = sortAsc ? " ↑" : " ↓";
  }
}

function getSortedRows() {
  return [...activeFilteredRows].sort((a, b) => {
    let va = a[sortCol];
    let vb = b[sortCol];
    if (sortCol === "pct") {
      va = getRowEffectivePct(a);
      vb = getRowEffectivePct(b);
    } else if (sortCol === "score") {
      va = applyTeacherScoreConversion(parseFloat(a.score) || 0, a.term);
      vb = applyTeacherScoreConversion(parseFloat(b.score) || 0, b.term);
    } else if (sortCol === "index") {
      return sortAsc ? 0 : 0;
    } else {
      va = String(va || "").toLowerCase();
      vb = String(vb || "").toLowerCase();
    }
    if (va < vb) return sortAsc ? -1 : 1;
    if (va > vb) return sortAsc ? 1 : -1;
    return 0;
  });
}

// ── Active Filter Tags ──
function updateActiveFilterTags() {
  const tags = [];
  if ($fs.value) tags.push({ label: `Subject: ${$fs.value}`, clear: () => { $fs.value = ""; onFilterChange(); } });
  if ($fc.value) tags.push({ label: `Class: ${$fc.value}`, clear: () => { $fc.value = ""; onFilterChange(); } });
  if ($fa.value) tags.push({ label: `Arm: ${$fa.value}`, clear: () => { $fa.value = ""; onFilterChange(); } });
  if ($q.value.trim()) tags.push({ label: `Search: "${$q.value.trim()}"`, clear: () => { $q.value = ""; onFilterChange(); } });

  if (!tags.length) {
    $activeFilterTags.style.display = "none";
    $activeFilterTags.innerHTML = "";
    return;
  }

  $activeFilterTags.style.display = "flex";
  $activeFilterTags.innerHTML = `<span class="active-filters-label">Active filters:</span>`;

  tags.forEach(t => {
    const span = document.createElement("span");
    span.className = "filter-tag";
    span.innerHTML = `${esc(t.label)} <button type="button" class="filter-tag-remove" aria-label="Remove filter">×</button>`;
    span.querySelector("button").onclick = t.clear;
    $activeFilterTags.appendChild(span);
  });

  const clearAll = document.createElement("button");
  clearAll.type = "button";
  clearAll.className = "btn-link";
  clearAll.style.marginLeft = "8px";
  clearAll.textContent = "Clear filters";
  clearAll.onclick = () => {
    $fs.value = ""; $fc.value = ""; $fa.value = ""; $q.value = "";
    onFilterChange();
  };
  $activeFilterTags.appendChild(clearAll);
}

function onFilterChange() {
  currentPage = 1;
  render();
}

// ── Main Render ──
function render() {
  $loader.style.display = "none";
  const sub = $fs.value, cls = $fc.value, arm = $fa.value, q = $q.value.toLowerCase().trim();

  activeFilteredRows = termRows().filter(r => {
    if (sub && r.subject !== sub) return false;
    if (cls && r.class !== cls) return false;
    if (arm && r.arm !== arm) return false;
    if (q && !r.student.toLowerCase().includes(q) && !r.reg.toLowerCase().includes(q)) return false;
    return true;
  });

  updateActiveFilterTags();

  updateTeacherConvNotice();

  // Metrics
  const total = activeFilteredRows.length;
  const uniq = new Set(activeFilteredRows.map(r => r.reg)).size;
  const avg = total ? Math.round(activeFilteredRows.reduce((s, r) => s + getRowEffectivePct(r), 0) / total) : 0;
  const highest = total ? Math.max(...activeFilteredRows.map(r => getRowEffectivePct(r))) : 0;
  const lowest = total ? Math.min(...activeFilteredRows.map(r => getRowEffectivePct(r))) : 0;

  // ── Compute Student Rewrite & Analysis for Authorized Teacher Scope ──
  const studentMap = new Map();
  activeFilteredRows.forEach(r => {
    const rawScore = parseFloat(r.score) || 0;
    const dispScore = applyTeacherScoreConversion(rawScore, r.term);
    const convPct = applyTeacherPctConversion(rawScore, r.term);
    const pctVal = convPct !== null ? convPct : (r.pct || 0);

    const sKey = (r.reg && r.reg.trim()) ? r.reg.trim().toLowerCase() : (r.student || "").trim().toLowerCase();
    if (!studentMap.has(sKey)) {
      studentMap.set(sKey, {
        id: "tstud_" + Math.abs(sKey.split("").reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)).toString(36),
        name: (r.student || "").toUpperCase(),
        reg: r.reg || "",
        class: r.class || "",
        arm: r.arm || "",
        term: r.term || currentTerm || "",
        scores: []
      });
    }
    studentMap.get(sKey).scores.push({
      subject: r.subject,
      score: dispScore,
      rawScore: rawScore,
      pct: pctVal,
      date: r.date
    });
  });

  teacherRewriteStudents = [];
  teacherStudentByIdMap = new Map();

  studentMap.forEach(s => {
    const sum = s.scores.reduce((acc, sc) => acc + sc.pct, 0);
    s.avgScore = s.scores.length ? Math.round(sum / s.scores.length) : 0;
    s.failedSubjects = s.scores.filter(sc => sc.pct < 50);
    s.rewriteSubjects = s.scores.filter(sc => sc.pct <= teacherRewriteCutoffPct);

    if (s.rewriteSubjects.length > 0) {
      teacherRewriteStudents.push(s);
    }
    teacherStudentByIdMap.set(s.id, s);
  });

  // Sort rewrite students by count of rewrite subjects descending, then lowest average
  teacherRewriteStudents.sort((a, b) => {
    if (b.rewriteSubjects.length !== a.rewriteSubjects.length) {
      return b.rewriteSubjects.length - a.rewriteSubjects.length;
    }
    return a.avgScore - b.avgScore;
  });

  $("st-total").textContent = total.toLocaleString();
  $("st-students").textContent = uniq.toLocaleString();
  $("st-avg").textContent = avg + "%";
  $("st-highest").textContent = highest + "%";
  $("st-lowest").textContent = lowest + "%";
  if ($("st-rewrite-count")) $("st-rewrite-count").textContent = teacherRewriteStudents.length.toLocaleString();
  if ($("badgeTeacherAllCount")) $("badgeTeacherAllCount").textContent = total.toLocaleString();
  if ($("badgeTeacherRewriteCount")) $("badgeTeacherRewriteCount").textContent = teacherRewriteStudents.length.toLocaleString();
  if ($("tBadgeRewriteNav")) $("tBadgeRewriteNav").textContent = teacherRewriteStudents.length.toLocaleString();

  updateTeacherViewTabs();

  // Update Score Distribution Chart
  updateChart(activeFilteredRows);

  updateSortIndicators();
  renderTableOnly();
}

// ── Chart Update (Minimal, Flat, Single-Colour) ──
function updateChart(rows) {
  const total = rows.length;
  $("chartTotalLabel").textContent = total ? `${total.toLocaleString()} records analyzed` : "No records";

  if (!total) {
    ["fail", "50", "60", "70", "80"].forEach(k => {
      $("bar-" + k).style.width = "0%";
      $("lbl-" + k).textContent = "0 (0%)";
    });
    return;
  }

  const fail = rows.filter(r => getRowEffectivePct(r) < 50).length;
  const p50 = rows.filter(r => getRowEffectivePct(r) >= 50 && getRowEffectivePct(r) < 60).length;
  const p60 = rows.filter(r => getRowEffectivePct(r) >= 60 && getRowEffectivePct(r) < 70).length;
  const p70 = rows.filter(r => getRowEffectivePct(r) >= 70 && getRowEffectivePct(r) < 80).length;
  const p80 = rows.filter(r => getRowEffectivePct(r) >= 80).length;

  const setB = (k, count) => {
    const pct = Math.round((count / total) * 100);
    $("bar-" + k).style.width = pct + "%";
    $("lbl-" + k).textContent = `${count.toLocaleString()} (${pct}%)`;
  };

  setB("fail", fail);
  setB("50", p50);
  setB("60", p60);
  setB("70", p70);
  setB("80", p80);
}

// ── Render Table & Pagination ──
function renderTableOnly() {
  const isRewrite = (teacherActiveViewTab === "rewrite");
  const thead = $("teacherTableHead");
  const q = $q.value.toLowerCase().trim();

  if (isRewrite) {
    if ($("paginationBar")) $("paginationBar").style.display = "none";

    if (thead) {
      thead.innerHTML = `
        <tr>
          <th style="width:36px;">#</th>
          <th>STUDENT NAME</th>
          <th>REG NUMBER</th>
          <th>CLASS &amp; ARM</th>
          <th>MANDATORY REWRITE SUBJECTS (WITH EXACT MARKS)</th>
          <th style="text-align:center;">AVG SCORE</th>
        </tr>
      `;
    }

    const filteredRewrite = teacherRewriteStudents.filter(s => {
      if (!q) return true;
      return s.name.toLowerCase().includes(q) ||
        s.reg.toLowerCase().includes(q) ||
        s.class.toLowerCase().includes(q) ||
        s.arm.toLowerCase().includes(q) ||
        s.rewriteSubjects.some(sub => sub.subject.toLowerCase().includes(q));
    });

    $("rowcount").textContent = ` · ${filteredRewrite.length.toLocaleString()} student${filteredRewrite.length !== 1 ? "s" : ""} needing rewrite`;

    if (!filteredRewrite.length) {
      $tb.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--text-muted);font-size:13px;">No students currently require rewrite under the selected cutoff (&le;${teacherRewriteCutoffPct}%).</td></tr>`;
      $empty.style.display = "none";
      return;
    }

    $empty.style.display = "none";
    const frag = document.createDocumentFragment();

    filteredRewrite.forEach((s, idx) => {
      const rewriteBadges = s.rewriteSubjects.map(rSub => {
        const maxMark = getTeacherSubjectMaxMark(rSub, s.term || currentTerm);
        const scoreDisplay = (rSub.score !== undefined && rSub.score !== null)
          ? (maxMark ? `${rSub.score}/${maxMark}` : `${rSub.score}`)
          : (maxMark ? `${rSub.pct}/${maxMark}` : `${rSub.pct}`);
        return `
          <span onclick="event.stopPropagation(); window.toggleTeacherStudentDrawer('${s.id}', '${esc(rSub.subject)}');"
            title="Click to reveal exact marks for ${esc(rSub.subject)}"
            style="cursor:pointer; display:inline-flex; align-items:center; gap:5px; margin:2px 4px 2px 0; padding:4px 9px; border-radius:4px; background:rgba(245,158,11,0.18); color:#d97706; font-size:11px; font-weight:700; border:1px solid rgba(245,158,11,0.45); transition:transform 0.15s, background 0.15s;">
            <span>${esc(rSub.subject)}</span>
            <strong style="background:rgba(245,158,11,0.3); padding:1px 6px; border-radius:3px; color:#b45309;">${scoreDisplay}</strong>
          </span>
        `;
      }).join("");

      const tr = document.createElement("tr");
      tr.className = "dash-student-row";
      tr.style.cursor = "pointer";
      tr.style.borderBottom = "1px solid var(--border-subtle)";
      tr.title = "Click to reveal all assessment scores";
      tr.onclick = () => window.toggleTeacherStudentDrawer(s.id);
      tr.innerHTML = `
        <td data-label="#" style="padding:10px 8px;font-weight:700;color:var(--text-subtle);">${idx + 1}</td>
        <td data-label="Student Name" style="padding:10px 8px;font-weight:600;color:var(--text);">
          <div>${esc(s.name)}</div>
          <div style="font-size:11px;color:#f59e0b;margin-top:2px;display:flex;align-items:center;gap:5px;">
            <svg id="t-chevron-${s.id}" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition:transform 0.2s;"><polyline points="6 9 12 15 18 9"/></svg>
            <span>Click to reveal scores</span>
          </div>
        </td>
        <td data-label="Reg Number" style="padding:10px 8px;font-family:monospace;font-size:12px;color:var(--text-muted);">${esc(s.reg || "-")}</td>
        <td data-label="Class &amp; Arm" style="padding:10px 8px;">${esc(s.class)} · ${esc(s.arm)}</td>
        <td data-label="Mandatory Rewrite Subjects" style="padding:10px 8px;">${rewriteBadges}</td>
        <td data-label="Avg Score" style="padding:10px 8px;text-align:center;font-weight:700;color:#ef4444;">${s.avgScore}%</td>
      `;
      frag.appendChild(tr);

      const drawerTr = document.createElement("tr");
      drawerTr.id = `t-drawer-${s.id}`;
      drawerTr.className = "dash-student-drawer";
      drawerTr.style.display = "none";
      drawerTr.style.background = "var(--surface-alt)";
      drawerTr.innerHTML = `
        <td colspan="6" style="padding:14px 18px; border-bottom:2px solid var(--border);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid var(--border);">
            <div>
              <span style="font-weight:700; font-size:13px; color:var(--text); display:inline-flex; align-items:center; gap:6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                Examination Rewrite Breakdown: ${esc(s.name)}
              </span>
              <span style="font-size:12px; color:var(--text-muted); margin-left:6px;">(${esc(s.class)} · ${esc(s.arm)} · Reg: ${esc(s.reg || "N/A")})</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:11px; padding:3px 8px; border-radius:4px; background:rgba(245,158,11,0.15); color:#d97706; font-weight:700;">${s.rewriteSubjects.length} Paper(s) Scheduled for Rewrite (&le;${teacherRewriteCutoffPct}%)</span>
              <button type="button" class="btn-text" onclick="event.stopPropagation(); window.openTeacherResitSlip('${s.id}')" style="font-size:11px; padding:3px 8px; font-weight:600; color:#d97706; display:inline-flex; align-items:center; gap:5px; border:1px solid rgba(245,158,11,0.4); border-radius:4px; background:var(--surface);">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Print Resit Slip
              </button>
            </div>
          </div>

          <div class="dash-drawer-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:8px;">
            ${s.scores.map(sc => {
        const isPass = sc.pct >= 50;
        const isRw = sc.pct <= teacherRewriteCutoffPct;
        const cardId = `t-card-${s.id}-${(sc.subject || '').replace(/[^a-zA-Z0-9]/g, '_')}`;
        const borderColor = isRw ? '#f59e0b' : (isPass ? 'var(--border)' : 'rgba(239,68,68,0.4)');
        const borderLeftColor = isRw ? '#f59e0b' : (isPass ? '#10b981' : '#ef4444');
        const badgeText = isRw ? 'REWRITE REQUIRED' : (isPass ? 'PASS' : 'FAIL');
        const badgeBg = isRw ? 'rgba(245,158,11,0.2)' : (isPass ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.15)');
        const badgeColor = isRw ? '#d97706' : (isPass ? '#10b981' : '#ef4444');

        const maxMark = getTeacherSubjectMaxMark(sc, s.term || currentTerm);
        const exactScoreDisplay = sc.score !== undefined ? (maxMark ? `${sc.score}/${maxMark}` : sc.score) : (maxMark ? `${sc.pct}/${maxMark}` : sc.pct);

        return `
                <div id="${cardId}" style="padding:10px 12px; background:var(--surface); border:1px solid ${borderColor}; border-left:4px solid ${borderLeftColor}; border-radius:var(--radius); transition:all 0.25s ease;">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px;">
                    <span style="font-weight:600; font-size:12px; color:var(--text); line-height:1.3;">${esc(sc.subject)}</span>
                    <span style="font-size:10px; font-weight:700; padding:1px 5px; border-radius:3px; background:${badgeBg}; color:${badgeColor}; white-space:nowrap;">
                      ${badgeText}
                    </span>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:6px;">
                    <span style="font-size:11px; color:var(--text-muted);">Exact Score: <strong style="color:var(--text); font-size:13px;">${esc(exactScoreDisplay)}</strong></span>
                    <span style="font-size:13px; font-weight:700; color:${badgeColor};">${sc.pct}%</span>
                  </div>
                  <div style="height:4px; width:100%; background:var(--surface-alt); border-radius:2px; overflow:hidden; margin-top:5px;">
                    <div style="width:${Math.min(100, Math.max(0, sc.pct))}%; height:100%; background:${borderLeftColor};"></div>
                  </div>
                </div>
              `;
      }).join('')}
          </div>
        </td>
      `;
      frag.appendChild(drawerTr);
    });

    $tb.innerHTML = "";
    $tb.appendChild(frag);
    return;
  }

  // ── "All" View Mode (Original Standard Table) ──
  if (thead) {
    thead.innerHTML = `
      <tr>
        <th class="sortable" data-sort="index">#<span class="sort-indicator" id="si-index"></span></th>
        <th class="sortable" data-sort="student">STUDENT NAME<span class="sort-indicator" id="si-student"></span></th>
        <th class="sortable" data-sort="reg">REG NUMBER<span class="sort-indicator" id="si-reg"></span></th>
        <th class="sortable" data-sort="subject">SUBJECT<span class="sort-indicator" id="si-subject"></span></th>
        <th class="sortable" data-sort="class">CLASS<span class="sort-indicator" id="si-class"></span></th>
        <th class="sortable" data-sort="arm">ARM<span class="sort-indicator" id="si-arm"></span></th>
        <th class="sortable numeric" data-sort="score">SCORE<span class="sort-indicator" id="si-score"></span></th>
        <th class="sortable numeric" data-sort="pct">PERCENTAGE<span class="sort-indicator" id="si-pct"></span></th>
        <th class="sortable" data-sort="status">STATUS<span class="sort-indicator" id="si-status"></span></th>
        <th class="sortable" data-sort="date">DATE &amp; TIME<span class="sort-indicator" id="si-date"></span></th>
      </tr>
    `;
    updateSortIndicators();
  }

  const sorted = getSortedRows();
  const total = sorted.length;
  $("rowcount").textContent = ` · ${total.toLocaleString()} record${total !== 1 ? "s" : ""}`;

  if (!total) {
    $tb.innerHTML = "";
    $empty.style.display = "block";
    if ($("paginationBar")) $("paginationBar").style.display = "none";
    return;
  }
  $empty.style.display = "none";
  if ($("paginationBar")) $("paginationBar").style.display = "flex";

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, total);
  const pageRows = sorted.slice(startIdx, endIdx);

  $("paginationInfo").textContent = `Showing ${(startIdx + 1).toLocaleString()}–${endIdx.toLocaleString()} of ${total.toLocaleString()} records`;
  $("pageIndicator").textContent = `Page ${currentPage} of ${totalPages}`;
  $prevPageBtn.disabled = currentPage <= 1;
  $nextPageBtn.disabled = currentPage >= totalPages;

  const frag = document.createDocumentFragment();

  pageRows.forEach((r, idx) => {
    const globalIdx = startIdx + idx + 1;
    const rawScore = parseFloat(r.score) || 0;
    const dispScore = applyTeacherScoreConversion(rawScore, r.term);
    const convPct = applyTeacherPctConversion(rawScore, r.term);
    const pctVal = convPct !== null ? convPct : (r.pct || 0);

    // Status: Good >= 70%, Average 50-69%, Fail < 50%
    let statusClass = "status-good";
    let statusLabel = "Pass";
    if (pctVal < 50) {
      statusClass = "status-fail";
      statusLabel = "Fail";
    } else if (pctVal < 70) {
      statusClass = "status-avg";
      statusLabel = "Pass";
    }

    const scoreDisplay = (dispScore !== rawScore)
      ? `${dispScore} <span style="font-size:10px;color:var(--text-muted,#8892b0)">(raw:${rawScore})</span>`
      : esc(r.score);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td data-label="#" class="muted-cell">${globalIdx}</td>
      <td data-label="Student Name" class="student-cell">${esc((r.student || "").toUpperCase())}</td>
      <td data-label="Reg Number" class="muted-cell">${esc(r.reg)}</td>
      <td data-label="Subject">${esc(r.subject)}</td>
      <td data-label="Class">${esc(r.class)}</td>
      <td data-label="Arm">${esc(r.arm)}</td>
      <td data-label="Score" class="numeric">${scoreDisplay}</td>
      <td data-label="Percentage" class="numeric">${pctVal}%</td>
      <td data-label="Status"><span class="status-text ${statusClass}">${statusLabel}</span></td>
      <td data-label="Date &amp; Time" class="muted-cell">${esc(r.date)}</td>
    `;
    frag.appendChild(tr);
  });

  $tb.innerHTML = "";
  $tb.appendChild(frag);
}

// ── Teacher Student Drawer & Resit Slip Modal Handlers ──
window.toggleTeacherStudentDrawer = function (studentId, highlightSubject) {
  const drawer = $(`t-drawer-${studentId}`);
  const chevron = $(`t-chevron-${studentId}`);
  if (!drawer) return;

  const isClosed = (drawer.style.display === "none");
  if (isClosed) {
    drawer.style.display = "table-row";
    if (chevron) chevron.style.transform = "rotate(180deg)";
  } else if (!highlightSubject) {
    drawer.style.display = "none";
    if (chevron) chevron.style.transform = "rotate(0deg)";
    return;
  }

  if (highlightSubject) {
    const slug = highlightSubject.replace(/[^a-zA-Z0-9]/g, '_');
    const card = document.getElementById(`t-card-${studentId}-${slug}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      card.style.outline = "2px solid #ef4444";
      card.style.boxShadow = "0 0 12px rgba(239,68,68,0.6)";
      card.style.transform = "scale(1.02)";
      setTimeout(() => {
        card.style.outline = "";
        card.style.boxShadow = "";
        card.style.transform = "";
      }, 2500);
    }
  }
};

window.openTeacherStudentScoreModal = function (studentId, isResit = false) {
  const s = teacherStudentByIdMap.get(studentId);
  if (!s) return;

  const schoolHdr = $("teacherModalSchoolHeader");
  const docTitle = $("teacherModalDocTitle");
  const resitNotice = $("teacherModalResitNotice");
  const sigBlock = $("teacherModalPrintSignatures");
  const issueDate = $("teacherModalIssueDate");
  const modalPrintBtn = $("teacherStudentModalPrintBtn");

  if (issueDate) issueDate.textContent = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  if (isResit) {
    if ($("teacherStudentModalName")) $("teacherStudentModalName").textContent = `Examination Resit Authorization: ${s.name}`;
    if (docTitle) docTitle.textContent = "OFFICIAL EXAMINATION RESIT & REWRITE AUTHORIZATION SLIP";
    if (resitNotice) resitNotice.style.display = "block";
    if (sigBlock) sigBlock.style.display = "block";
    if (schoolHdr) schoolHdr.style.display = "block";
    if (modalPrintBtn) modalPrintBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:5px;"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>Print Resit Authorization Slip`;
  } else {
    if ($("teacherStudentModalName")) $("teacherStudentModalName").textContent = `Student Academic Scorecard: ${s.name}`;
    if (docTitle) docTitle.textContent = "OFFICIAL STUDENT ACADEMIC RECORD";
    if (resitNotice) resitNotice.style.display = "none";
    if (sigBlock) sigBlock.style.display = "none";
    if (schoolHdr) schoolHdr.style.display = "block";
    if (modalPrintBtn) modalPrintBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:5px;"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>Print Student Result Slip`;
  }

  if ($("teacherStudentModalMeta")) $("teacherStudentModalMeta").textContent = `${s.class} · ${s.arm} | Reg: ${s.reg || "N/A"} | Term: ${s.term || currentTerm || "All Terms"}`;
  if ($("teacherStudentModalAvg")) {
    $("teacherStudentModalAvg").textContent = `${s.avgScore}%`;
    $("teacherStudentModalAvg").style.color = s.avgScore >= 50 ? "#10b981" : "#ef4444";
  }

  if ($("teacherStudentModalTotalSubjects")) $("teacherStudentModalTotalSubjects").textContent = s.scores.length;
  if ($("teacherStudentModalPassed")) $("teacherStudentModalPassed").textContent = s.scores.length - s.failedSubjects.length;
  if ($("teacherStudentModalFailed")) $("teacherStudentModalFailed").textContent = s.failedSubjects.length;

  const tbody = $("teacherStudentModalTbody");
  if (tbody) {
    tbody.innerHTML = s.scores.map((sc, i) => {
      const isP = sc.pct >= 50;
      const isRewrite = sc.pct <= teacherRewriteCutoffPct;
      let grade = "F";
      let remark = "Fail";
      if (sc.pct >= 75) { grade = "A"; remark = "Distinction"; }
      else if (sc.pct >= 60) { grade = "B"; remark = "Credit"; }
      else if (sc.pct >= 50) { grade = "C"; remark = "Pass"; }
      else if (isRewrite) { grade = "F"; remark = "Mandatory Rewrite"; }

      const rowBg = (isResit && isRewrite) ? "background:rgba(245,158,11,0.08);" : "";

      const maxMark = getTeacherSubjectMaxMark(sc, s.term || currentTerm);
      const modalScoreDisplay = sc.score !== undefined ? (maxMark ? `${esc(sc.score)}/${maxMark}` : esc(sc.score)) : "-";

      return `
        <tr style="border-bottom:1px solid var(--border-subtle); ${rowBg}">
          <td style="padding:10px 8px;font-weight:600;color:var(--text-subtle);">${i + 1}</td>
          <td style="padding:10px 8px;font-weight:600;color:var(--text);">
            ${esc(sc.subject)}
            ${isRewrite ? `<span style="font-size:10px;padding:2px 6px;margin-left:6px;border-radius:3px;background:#f59e0b;color:#fff;font-weight:700;letter-spacing:0.02em;">REWRITE</span>` : ""}
          </td>
          <td style="padding:10px 8px;text-align:center;font-weight:600;">${modalScoreDisplay}</td>
          <td style="padding:10px 8px;text-align:center;font-weight:700;color:${isP ? '#10b981' : (isRewrite ? '#f59e0b' : '#ef4444')};">${sc.pct}%</td>
          <td style="padding:10px 8px;text-align:center;font-weight:700;">${grade}</td>
          <td style="padding:10px 8px;text-align:center;">
            <span style="padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;background:${isP ? 'rgba(16,185,129,0.12)' : (isRewrite ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.12)')};color:${isP ? '#10b981' : (isRewrite ? '#f59e0b' : '#ef4444')};">
              ${remark}
            </span>
          </td>
        </tr>
      `;
    }).join("");
  }

  if ($("teacherStudentScoreModal")) $("teacherStudentScoreModal").classList.add("open");
};

window.openTeacherResitSlip = function (studentId) {
  window.openTeacherStudentScoreModal(studentId, true);
};

// Modal close handlers
function closeTeacherScoreModal() {
  if ($("teacherStudentScoreModal")) $("teacherStudentScoreModal").classList.remove("open");
}
if ($("teacherStudentModalCloseBtn")) $("teacherStudentModalCloseBtn").addEventListener("click", closeTeacherScoreModal);
if ($("teacherStudentModalCloseBottomBtn")) $("teacherStudentModalCloseBottomBtn").addEventListener("click", closeTeacherScoreModal);
if ($("teacherStudentScoreModal")) {
  $("teacherStudentScoreModal").addEventListener("click", (e) => {
    if (e.target === $("teacherStudentScoreModal")) closeTeacherScoreModal();
  });
}
if ($("teacherStudentModalPrintBtn")) {
  $("teacherStudentModalPrintBtn").addEventListener("click", () => {
    document.body.classList.add("printing-modal");
    window.print();
    setTimeout(() => {
      document.body.classList.remove("printing-modal");
    }, 1000);
  });
}

function exportTeacherRewriteCSV() {
  if (!teacherRewriteStudents || !teacherRewriteStudents.length) {
    showToast({
      type: "info",
      title: "No Rewrite Records",
      message: "No students currently require rewrite under the selected cutoff (≤" + teacherRewriteCutoffPct + "%)."
    });
    return;
  }

  const activeTerm = currentTerm || (teacherRewriteStudents[0] && teacherRewriteStudents[0].term) || "Current Academic Term";
  const conv = getTeacherConversionForTerm(activeTerm);
  const scalingDesc = conv ? `Scaled /${conv.targetMax} from /${conv.originalMax} (Multiplier: ×${(conv.targetMax / conv.originalMax).toFixed(2).replace(/\.00$/, "")})` : "Raw Scores (No scaling configured)";
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const dateFile = now.toISOString().slice(0, 10);
  const termSlug = activeTerm.replace(/[^a-zA-Z0-9]/g, "_");

  let totalPapers = 0;
  teacherRewriteStudents.forEach(s => {
    totalPapers += (s.rewriteSubjects || []).length;
  });

  const rowsPdf = [];
  const rowsExcel = [];

  teacherRewriteStudents.forEach((s, idx) => {
    const sn = idx + 1;
    const rewriteList = s.rewriteSubjects || [];
    const paperCount = rewriteList.length;
    const paperCountLabel = `${paperCount} Paper${paperCount === 1 ? '' : 's'}`;

    // PDF Grouped Subject List (Clean responsive items)
    const pdfSubjectListHtml = rewriteList.map(rSub => {
      const maxMark = getTeacherSubjectMaxMark(rSub, s.term || activeTerm) || 20;
      const rawNum = parseTeacherRawScoreNum(rSub.score !== undefined ? rSub.score : rSub.pct);
      const scaledVal = conv ? applyTeacherScoreConversion(rawNum, activeTerm) : rawNum;
      const rawVal = !isNaN(rawNum) ? rawNum : scaledVal;
      const rawMax = conv ? conv.originalMax : maxMark;
      const hasConv = (rawMax !== maxMark || rawVal !== scaledVal);

      return `
        <div class="sub-item-row">
          <span class="sub-item-name">${esc(rSub.subject || "General")}</span>
          <span class="sub-item-metrics">
            <span class="mark-badge">${scaledVal} of ${maxMark}</span>
            ${hasConv ? `<span class="raw-label">(raw: ${rawVal} of ${rawMax})</span>` : ""}
          </span>
        </div>
      `;
    }).join("");

    // Excel Grouped Subject List: newline in same cell with mso-data-placement
    const excelSubjectList = rewriteList.map(rSub => {
      const maxMark = getTeacherSubjectMaxMark(rSub, s.term || activeTerm) || 20;
      const rawNum = parseTeacherRawScoreNum(rSub.score !== undefined ? rSub.score : rSub.pct);
      const scaledVal = conv ? applyTeacherScoreConversion(rawNum, activeTerm) : rawNum;
      const rawVal = !isNaN(rawNum) ? rawNum : scaledVal;
      const rawMax = conv ? conv.originalMax : maxMark;
      const convNote = (rawMax !== maxMark || rawVal !== scaledVal) ? ` (raw: ${rawVal} of ${rawMax})` : "";
      return `• ${esc(rSub.subject || "")}: ${scaledVal} of ${maxMark}${convNote}`;
    }).join('<br style="mso-data-placement:same-cell;"/>');

    const altClass = (sn % 2 === 0) ? "row-alt" : "";

    rowsPdf.push(`
      <tr class="${altClass}">
        <td class="cell-center" style="font-weight:700;color:#64748b;">${sn}</td>
        <td class="cell-left cell-bold" style="font-size:11.5px;color:#0f172a;">${esc(s.name || "")}</td>
        <td class="cell-center" style="font-family:Consolas,monospace;color:#475569;font-size:10.5px;">${esc(s.reg || "N/A")}</td>
        <td class="cell-center" style="font-weight:600;">${esc(formatClassAbbr(s.class) || s.class || "-")}</td>
        <td class="cell-center" style="font-weight:600;">${esc(formatArmAbbr(s.arm) || s.arm || "-")}</td>
        <td class="cell-center"><span class="paper-badge">${paperCountLabel}</span></td>
        <td class="cell-left" style="padding:6px 10px;">
          <div class="sub-group-container">
            ${pdfSubjectListHtml}
          </div>
        </td>
        <td class="cell-center"><span class="status-badge">MANDATORY REWRITE</span></td>
      </tr>
    `);

    rowsExcel.push(`
      <tr class="${altClass}">
        <td style="text-align:center;border:1px solid #cbd5e1;padding:6px;mso-number-format:'\\@';">${sn}</td>
        <td style="text-align:left;font-weight:bold;border:1px solid #cbd5e1;padding:6px;mso-number-format:'\\@';">${esc(s.name || "")}</td>
        <td style="text-align:center;font-family:monospace;border:1px solid #cbd5e1;padding:6px;mso-number-format:'\\@';">${esc(s.reg || "N/A")}</td>
        <td style="text-align:center;border:1px solid #cbd5e1;padding:6px;mso-number-format:'\\@';">${esc(formatClassAbbr(s.class) || s.class || "-")}</td>
        <td style="text-align:center;border:1px solid #cbd5e1;padding:6px;mso-number-format:'\\@';">${esc(formatArmAbbr(s.arm) || s.arm || "-")}</td>
        <td style="text-align:center;font-weight:bold;color:#b45309;background:#fef3c7;border:1px solid #cbd5e1;padding:6px;mso-number-format:'\\@';">${paperCountLabel}</td>
        <td style="text-align:left;border:1px solid #cbd5e1;padding:6px;mso-number-format:'\\@';">${excelSubjectList}</td>
        <td style="text-align:center;font-weight:bold;color:#dc2626;background:#fee2e2;border:1px solid #cbd5e1;padding:6px;mso-number-format:'\\@';">MANDATORY REWRITE</td>
      </tr>
    `);
  });

  const docTitle = `Teacher_Resit_Report_${termSlug}_cutoff${teacherRewriteCutoffPct}pct_${dateFile}`;

  const pdfHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${docTitle}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm 12mm 12mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      margin: 0;
      padding: 24px;
      font-size: 11px;
      line-height: 1.4;
    }
    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .no-print {
        display: none !important;
      }
      .report-page-container {
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
      }
      thead {
        display: table-header-group !important;
      }
      tr {
        page-break-inside: avoid !important;
        page-break-after: auto !important;
      }
      .signature-section {
        page-break-inside: avoid !important;
      }
    }
    .no-print-toolbar {
      position: sticky;
      top: 0;
      z-index: 9999;
      background: #1e293b;
      color: #ffffff;
      padding: 12px 24px;
      margin: -24px -24px 24px -24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 14px rgba(0,0,0,0.2);
    }
    .btn-action {
      background: #2563eb;
      color: #ffffff;
      border: none;
      padding: 9px 18px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      transition: background 0.15s, transform 0.1s;
    }
    .btn-action:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: #334155;
      color: #f1f5f9;
      border: 1px solid #475569;
    }
    .btn-secondary:hover {
      background: #475569;
    }
    .report-page-container {
      max-width: 1180px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 30px 36px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    }
    .header-banner {
      text-align: center;
      border-bottom: 2.5px solid #0f172a;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .school-name {
      font-size: 19px;
      font-weight: 800;
      letter-spacing: 0.8px;
      color: #0f172a;
      text-transform: uppercase;
      margin: 0 0 4px 0;
    }
    .report-heading {
      font-size: 14px;
      font-weight: 700;
      color: #b45309;
      margin: 0 0 4px 0;
      letter-spacing: 0.4px;
    }
    .report-sub {
      font-size: 11px;
      color: #64748b;
      margin: 0;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 20px;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-k {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 2px;
    }
    .meta-v {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }
    .roster-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
      margin-bottom: 20px;
    }
    .roster-table th {
      background: #0f172a;
      color: #ffffff;
      font-weight: 700;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      padding: 9px 6px;
      border: 1px solid #334155;
      text-align: center;
    }
    .roster-table td {
      padding: 7px 6px;
      border: 1px solid #cbd5e1;
      vertical-align: middle;
    }
    .roster-table tbody tr.row-alt {
      background: #f8fafc;
    }
    .cell-center { text-align: center; }
    .cell-left { text-align: left; }
    .cell-bold { font-weight: 700; }
    .cell-fail { color: #dc2626; }
    .mark-badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-weight: 700;
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
      white-space: nowrap;
    }
    .paper-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 10px;
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
      white-space: nowrap;
    }
    .sub-group-container {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .sub-item-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 4px 8px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
    }
    .sub-item-name {
      font-weight: 700;
      color: #1e293b;
      font-size: 11px;
    }
    .sub-item-metrics {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    .raw-label {
      font-size: 9.5px;
      color: #64748b;
      white-space: nowrap;
    }
    .pct-badge {
      display: inline-block;
      padding: 1px 5px;
      border-radius: 3px;
      font-weight: 800;
      font-size: 10px;
      background: #fee2e2;
      color: #dc2626;
      white-space: nowrap;
    }
    .status-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fecaca;
      font-size: 9.5px;
      white-space: nowrap;
    }
    .compliance-box {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-left: 4px solid #f59e0b;
      border-radius: 4px;
      padding: 9px 14px;
      font-size: 10.5px;
      color: #92400e;
      margin-bottom: 26px;
    }
    .signature-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 36px;
      margin-top: 36px;
      text-align: center;
    }
    .sig-line {
      border-top: 1.5px solid #0f172a;
      padding-top: 6px;
      font-size: 11px;
      font-weight: 700;
      color: #0f172a;
    }
    .sig-role {
      font-size: 9.5px;
      color: #64748b;
      margin-top: 2px;
    }
  </style>
</head>
<body>
  <div class="no-print no-print-toolbar">
    <div style="display:flex;align-items:center;gap:12px;">
      <span style="font-weight:800;font-size:15px;letter-spacing:0.3px;">📄 Honeyland Official PDF Generator</span>
      <span style="background:rgba(255,255,255,0.15);padding:4px 10px;border-radius:4px;font-size:11.5px;">
        💡 In Destination, choose <b>"Save as PDF"</b> to download your formatted document
      </span>
    </div>
    <div style="display:flex;align-items:center;gap:10px;">
      <button class="btn-action" onclick="window.print();">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Save as PDF / Print
      </button>
      <button class="btn-action btn-secondary" id="btnDownloadExcel">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download Excel (.xls)
      </button>
      <button class="btn-action btn-secondary" onclick="window.close();" style="padding:9px 14px;">✕ Close</button>
    </div>
  </div>

  <div class="report-page-container">
    <div class="header-banner">
      <div class="school-name">HONEYLAND ACADEMIC PORTAL — EXECUTIVE EXAMINATION SYSTEM</div>
      <div class="report-heading">OFFICIAL STUDENT EXAMINATION RESIT &amp; ACADEMIC INTERVENTION ROSTER</div>
      <div class="report-sub">Teacher Classroom Record for Remedial Instruction &amp; Re-examination</div>
    </div>

    <div class="meta-grid">
      <div class="meta-item">
        <span class="meta-k">Academic Term</span>
        <span class="meta-v">${esc(activeTerm)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-k">Date Generated</span>
        <span class="meta-v">${esc(dateStr)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-k">Resit Benchmark</span>
        <span class="meta-v">Score ≤ ${teacherRewriteCutoffPct}% (Mandatory Retake)</span>
      </div>
      <div class="meta-item">
        <span class="meta-k">Score Conversion</span>
        <span class="meta-v">${esc(scalingDesc)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-k">Identified Students</span>
        <span class="meta-v">${teacherRewriteStudents.length} Students Flagged</span>
      </div>
      <div class="meta-item">
        <span class="meta-k">Total Resit Papers</span>
        <span class="meta-v">${totalPapers} Papers Scheduled</span>
      </div>
    </div>

    <table class="roster-table">
      <thead>
        <tr>
          <th style="width:38px;">S/N</th>
          <th style="width:240px;">Student Full Name</th>
          <th style="width:130px;">Registration No</th>
          <th style="width:80px;">Class</th>
          <th style="width:80px;">Arm</th>
          <th style="width:90px;">Papers</th>
          <th style="width:420px;">Subjects Scheduled for Resit (Exact Mark)</th>
          <th style="width:130px;">Academic Status</th>
        </tr>
      </thead>
      <tbody>
        ${rowsPdf.join("")}
      </tbody>
    </table>

    <div class="compliance-box">
      <b>Institutional Policy Directive:</b> Students recorded in this roster scored at or below the institutional resit threshold of <b>${teacherRewriteCutoffPct}%</b>. Teachers and subject coordinators are instructed to administer targeted remedial instruction prior to conducting the formal re-examination.
    </div>

    <div class="signature-section">
      <div class="signature-grid">
        <div>
          <div style="height:45px;"></div>
          <div class="sig-line">Class / Subject Teacher</div>
          <div class="sig-role">Date: ________________________</div>
        </div>
        <div>
          <div style="height:45px;"></div>
          <div class="sig-line">Vice Principal (Academics)</div>
          <div class="sig-role">Date: ________________________</div>
        </div>
        <div>
          <div style="height:45px;"></div>
          <div class="sig-line">Principal / Head of School</div>
          <div class="sig-role">Date: ________________________</div>
        </div>
      </div>
    </div>
  </div>

  <script>
    document.getElementById('btnDownloadExcel').onclick = function() {
      var excelHeader = '<tr style="height:32px;"><th colspan="8" style="background:#0f172a;color:#ffffff;font-size:15px;text-align:center;font-weight:bold;padding:10px;">HONEYLAND ACADEMIC PORTAL — OFFICIAL STUDENT EXAMINATION RESIT ROSTER</th></tr>' +
        '<tr><td colspan="8" style="text-align:center;font-size:11px;color:#64748b;padding:4px;">Teacher Classroom Record for Remedial Instruction & Examination Board</td></tr>' +
        '<tr><td colspan="8"></td></tr>' +
        '<tr><td colspan="2" style="font-weight:bold;background:#f1f5f9;">Academic Term:</td><td colspan="2">${esc(activeTerm)}</td><td colspan="2" style="font-weight:bold;background:#f1f5f9;">Date Generated:</td><td colspan="2">${esc(dateStr)}</td></tr>' +
        '<tr><td colspan="2" style="font-weight:bold;background:#f1f5f9;">Resit Benchmark:</td><td colspan="2">Score ≤ ${teacherRewriteCutoffPct}% (Mandatory Retake)</td><td colspan="2" style="font-weight:bold;background:#f1f5f9;">Score Conversion:</td><td colspan="2">${esc(scalingDesc)}</td></tr>' +
        '<tr><td colspan="2" style="font-weight:bold;background:#f1f5f9;">Identified Students:</td><td colspan="2">${teacherRewriteStudents.length} Students Flagged</td><td colspan="2" style="font-weight:bold;background:#f1f5f9;">Total Resit Papers:</td><td colspan="2">${totalPapers} Papers Scheduled</td></tr>' +
        '<tr><td colspan="8"></td></tr>' +
        '<tr style="background:#0f172a;color:#ffffff;font-weight:bold;text-align:center;">' +
        '<th style="background:#0f172a;color:#ffffff;padding:8px;">S/N</th>' +
        '<th style="background:#0f172a;color:#ffffff;padding:8px;">Student Full Name</th>' +
        '<th style="background:#0f172a;color:#ffffff;padding:8px;">Registration Number</th>' +
        '<th style="background:#0f172a;color:#ffffff;padding:8px;">Class</th>' +
        '<th style="background:#0f172a;color:#ffffff;padding:8px;">Arm</th>' +
        '<th style="background:#0f172a;color:#ffffff;padding:8px;">Resit Papers</th>' +
        '<th style="background:#0f172a;color:#ffffff;padding:8px;text-align:left;">Subjects Scheduled for Resit (Exact Mark)</th>' +
        '<th style="background:#0f172a;color:#ffffff;padding:8px;">Academic Status</th>' +
        '</tr>';

      var excelHtml = '\\uFEFF<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' +
        '<head><meta charset="utf-8" /><style>td { mso-number-format:"\\@"; vertical-align:middle; } th { mso-number-format:"\\@"; }</style></head>' +
        '<body><table border="1" cellpadding="6" cellspacing="0">' + excelHeader + '${rowsExcel.join("").replace(/"/g, '\\"')}<\\/table><\\/body><\\/html>';
      var blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = '${docTitle}.xls';
      document.body.appendChild(a);
      a.click();
      setTimeout(function() { document.body.removeChild(a); URL.revokeObjectURL(url); }, 300);
    };

    window.addEventListener('load', function() {
      setTimeout(function() {
        try { window.print(); } catch(e) {}
      }, 450);
    });
  <\\/script>
</body>
</html>`;

  const printWin = window.open("", "_blank");
  if (!printWin) {
    showToast({
      type: "warning",
      title: "Popup Blocked",
      message: "Please allow popups for this site to view and download the PDF report."
    });
    return;
  }

  printWin.document.open();
  printWin.document.write(pdfHtml);
  printWin.document.close();
  printWin.document.title = docTitle;
  printWin.focus();

  showToast({
    type: "success",
    title: "PDF Report Opened",
    message: `Generated official PDF report with ${teacherRewriteStudents.length} students. Choose 'Save as PDF' to save.`
  });
}

// ── Pagination Handlers ──
$prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderTableOnly();
  }
});

$nextPageBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(activeFilteredRows.length / PAGE_SIZE) || 1;
  if (currentPage < totalPages) {
    currentPage++;
    renderTableOnly();
  }
});

[$fs, $fc, $fa].forEach(el => el.addEventListener("change", onFilterChange));
$q.addEventListener("input", onFilterChange);

// Helpers for Teacher CSV Abbreviation
function formatClassAbbr(className) {
  if (!className) return "";
  const c = String(className).trim();
  const m = c.match(/(?:Year|Yr|Grade)\s*(\d+)/i);
  if (m) return "Y" + m[1];
  if (/^Y\d+$/i.test(c)) return c.toUpperCase();
  return c;
}

function formatArmAbbr(armName) {
  if (!armName) return "";
  let a = String(armName).trim();
  if (/^Arm\s+/i.test(a)) a = a.replace(/^Arm\s+/i, "").trim();
  return a.charAt(0).toUpperCase();
}

// ── Export to CSV (Customized for Teachers) ──
// Excludes: Reg Number, Status, Percentage, Date, Term
// Abbreviates: Year 7 -> Y7, Holmes -> H
$("exportBtn").addEventListener("click", async () => {
  await syncTeacherScoreConversion(false);
  if (!activeFilteredRows.length) {
    showToast({
      type: "info",
      title: "No Records to Export",
      message: "No student records found under the current filter selection."
    });
    return;
  }
  const headers = ["Subject", "Class", "Arm", "Student", "Score"];
  const csvContent = [
    headers.join(","),
    ...activeFilteredRows.map(r => {
      const rawScore = parseFloat(r.score) || 0;
      const dispScore = applyTeacherScoreConversion(rawScore, r.term);
      const classAbbr = formatClassAbbr(r.class);
      const armAbbr = formatArmAbbr(r.arm);
      return [
        `"${(r.subject || "").replace(/"/g, '""')}"`,
        `"${classAbbr.replace(/"/g, '""')}"`,
        `"${armAbbr.replace(/"/g, '""')}"`,
        `"${(r.student || "").replace(/"/g, '""')}"`,
        `"${dispScore}"`
      ].join(",");
    })
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `results_${currentTerm || "export"}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

// ── Teacher CBT Exam Upload Functions ──
function populateCbtClassArms(className) {
  // Arms are automatically all-inclusive for teacher exams; arms configuration is managed exclusively by Admin.
}

// ── School-Wide CBT Exam Defaults (Duration & Marks synchronized from Admin) ──
let teacherCbtDefaults = { duration: 30, marksPerQuestion: 1.5 };

async function loadTeacherCbtDefaults() {
  try {
    const cached = localStorage.getItem("cbt_exam_defaults");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed) {
        if (parsed.duration) teacherCbtDefaults.duration = Number(parsed.duration);
        if (parsed.marksPerQuestion) teacherCbtDefaults.marksPerQuestion = Number(parsed.marksPerQuestion);
        updateTeacherCbtDefaultsUI();
      }
    }
    if (window.dbClient && window.dbClient.getCbtExamDefaults) {
      const cloud = await window.dbClient.getCbtExamDefaults();
      if (cloud) {
        if (cloud.duration) teacherCbtDefaults.duration = Number(cloud.duration);
        if (cloud.marksPerQuestion) teacherCbtDefaults.marksPerQuestion = Number(cloud.marksPerQuestion);
        localStorage.setItem("cbt_exam_defaults", JSON.stringify(teacherCbtDefaults));
        updateTeacherCbtDefaultsUI();
      }
    }
  } catch (e) {
    // Offline / fallback
  }
}

function updateTeacherCbtDefaultsUI() {
  if (tCbtDurationDisplay) tCbtDurationDisplay.textContent = teacherCbtDefaults.duration;
  if (tCbtMarksDisplay) tCbtMarksDisplay.textContent = teacherCbtDefaults.marksPerQuestion;
  if (tCbtDuration) tCbtDuration.value = teacherCbtDefaults.duration;
  if (tCbtPoints) tCbtPoints.value = teacherCbtDefaults.marksPerQuestion;
}

// ── School-Wide Active Examination Term (Synchronized from Administration) ──
let activeCbtExamTerm = "MID TERM EXAMINATION";

async function loadActiveCbtTerm() {
  try {
    const cached = localStorage.getItem("cbt_active_term");
    if (cached) {
      activeCbtExamTerm = cached.toUpperCase();
      updateTeacherActiveTermUI();
    }
    if (window.dbClient && window.dbClient.getActiveCbtTerm) {
      const cloudTerm = await window.dbClient.getActiveCbtTerm();
      if (cloudTerm) {
        activeCbtExamTerm = cloudTerm.toUpperCase();
        localStorage.setItem("cbt_active_term", activeCbtExamTerm);
        updateTeacherActiveTermUI();
      }
    }
  } catch (e) {
    // Offline / fallback
  }
}

function updateTeacherActiveTermUI() {
  if ($("tCbtActiveTermBadge")) {
    $("tCbtActiveTermBadge").textContent = activeCbtExamTerm;
  }
  updateTeacherExamTitle();
}

function updateTeacherExamTitle() {
  const sSub = ($("tCbtSubject")?.value || "").trim().toUpperCase();
  const term = (activeCbtExamTerm || "MID TERM EXAMINATION").trim().toUpperCase();

  if (sSub && $("tCbtTitle")) {
    $("tCbtTitle").value = `${sSub} ${term}`.replace(/\s+/g, " ").trim();
  }
}

function initTeacherCbtForm() {
  if (!teacher) return;
  refreshTeacherCbtSubjects();

  // Only allow assigned subjects for teachers
  const assigned = (teacher && Array.isArray(teacher.subjects) && teacher.subjects.length > 0)
    ? teacher.subjects.filter(s => s && s.trim()).sort((a, b) => a.localeCompare(b))
    : [];

  let subjectHtml = "";
  if (assigned.length > 0) {
    subjectHtml = assigned.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join("");
  } else {
    // Fallback for Administrator or accounts without restricted subjects
    const allCatalogSubjects = Object.keys(CBT_CONFIG.subjects || {}).sort((a, b) => a.localeCompare(b));
    subjectHtml = allCatalogSubjects.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join("");
  }

  $("tCbtSubject").innerHTML = subjectHtml;
  $("tCbtSubject").onchange = () => updateTeacherExamTitle();

  // Populate Classes
  const classes = (teacher.classes && teacher.classes.length) ? teacher.classes : ["Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12"];
  $("tCbtClass").innerHTML = classes.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
  $("tCbtClass").onchange = () => {
    populateCbtClassArms($("tCbtClass").value);
    updateTeacherExamTitle();
  };

  // Populate Cohort Arms for selected class
  populateCbtClassArms($("tCbtClass").value);

  // Auto-format Exam Title: [SUBJECT] [ADMIN_TERM] in ALL CAPS
  updateTeacherExamTitle();

  // Keep title in ALL CAPS if teacher manually types into the title box
  if ($("tCbtTitle")) {
    $("tCbtTitle").oninput = (e) => {
      e.target.value = e.target.value.toUpperCase();
    };
  }

  // Default Launch Date to current local date
  const todayStr = new Date().toISOString().slice(0, 10);
  if ($("tCbtLaunchDate") && !$("tCbtLaunchDate").value) {
    $("tCbtLaunchDate").value = todayStr;
  }

  // Initialize Planned Target Questions Controls & Validation Status
  if (typeof initTargetQuestionsControls === "function") {
    initTargetQuestionsControls();
    updateTargetStatusBadge();
  }
}

if ($("tCbtSelectAllArmsBtn")) {
  $("tCbtSelectAllArmsBtn").onclick = () => {
    const armsSelect = $("tCbtArmsSelect");
    if (!armsSelect) return;
    for (let i = 0; i < armsSelect.options.length; i++) {
      armsSelect.options[i].selected = true;
    }
  };
}
if ($("tCbtClearAllArmsBtn")) {
  $("tCbtClearAllArmsBtn").onclick = () => {
    const armsSelect = $("tCbtArmsSelect");
    if (!armsSelect) return;
    for (let i = 0; i < armsSelect.options.length; i++) {
      armsSelect.options[i].selected = false;
    }
  };
}

// Generate a clean, crisp PNG Base64 diagram of a cell with labeled organelles
function getSampleDiagramPng() {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 620;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 620, 300);

    // Border
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#cbd5e1";
    ctx.strokeRect(6, 6, 608, 288);

    // Header Banner
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(8, 8, 604, 34);
    ctx.fillStyle = "#0369a1";
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("BIOLOGY DIAGRAM: CELLULAR RESPIRATION & ORGANELLES", 310, 30);

    // Cell Outline (Cytoplasm)
    ctx.beginPath();
    ctx.ellipse(310, 165, 250, 105, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#f0f9ff";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#0284c7";
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]); // reset dash

    // Organelle A: Nucleus
    ctx.beginPath();
    ctx.arc(190, 165, 46, 0, Math.PI * 2);
    ctx.fillStyle = "#fef9c3";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ca8a04";
    ctx.stroke();
    ctx.fillStyle = "#854d0e";
    ctx.font = "bold 12px system-ui, sans-serif";
    ctx.fillText("A. Nucleus", 190, 162);
    ctx.font = "10px system-ui, sans-serif";
    ctx.fillText("(Genetic Material)", 190, 178);

    // Organelle B: Mitochondria (Target)
    ctx.beginPath();
    ctx.ellipse(430, 165, 55, 28, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#fee2e2";
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#dc2626";
    ctx.stroke();

    // Mitochondrial cristae inner folds
    ctx.beginPath();
    ctx.moveTo(395, 165);
    ctx.quadraticCurveTo(415, 145, 430, 165);
    ctx.quadraticCurveTo(445, 185, 465, 165);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#b91c1c";
    ctx.stroke();

    // Arrow pointing to Mitochondria
    ctx.beginPath();
    ctx.moveTo(430, 95);
    ctx.lineTo(430, 130);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#dc2626";
    ctx.stroke();
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(424, 126);
    ctx.lineTo(430, 136);
    ctx.lineTo(436, 126);
    ctx.fillStyle = "#dc2626";
    ctx.fill();

    ctx.fillStyle = "#dc2626";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.fillText("Site of Respiration", 430, 88);

    ctx.fillStyle = "#991b1b";
    ctx.font = "bold 12px system-ui, sans-serif";
    ctx.fillText("B. Mitochondria", 430, 162);
    ctx.font = "10px system-ui, sans-serif";
    ctx.fillText("(Powerhouse / ATP)", 430, 178);

    // Organelle C: Ribosome
    ctx.beginPath();
    ctx.arc(310, 120, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#a7f3d0";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#059669";
    ctx.stroke();
    ctx.fillStyle = "#047857";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.fillText("C. Ribosome", 310, 106);

    // Organelle D: Endoplasmic Reticulum
    ctx.beginPath();
    ctx.ellipse(310, 220, 42, 14, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#ede9fe";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#7c3aed";
    ctx.stroke();
    ctx.fillStyle = "#5b21b6";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.fillText("D. Endoplasmic Reticulum", 310, 224);

    return canvas.toDataURL("image/png");
  } catch (e) {
    return "";
  }
}

// Format Guide / Sample Insert (Includes sample diagram on Question 1)
$("tCbtInsertSampleBtn").onclick = () => {
  const sampleImg = getSampleDiagramPng();

  $("tCbtRawText").value = `1. Which organelle labeled in the diagram below is responsible for cellular respiration and energy production?

[🖼️ Diagram Attached]

A. Nucleus
B. Mitochondria
C. Ribosome
D. Endoplasmic reticulum
Answer: B

2. What is the standard SI unit of temperature?
A. Fahrenheit
B. Celsius
C. Kelvin
D. Rankine
Answer: C

3. Which gas do green plants absorb from the atmosphere for photosynthesis?
A. Carbon dioxide
B. Oxygen
C. Nitrogen
D. Hydrogen
Answer: A`;

  updateTeacherExamTitle();
  if ($("tCbtSubject")) {
    const assigned = (teacher && Array.isArray(teacher.subjects) && teacher.subjects.length > 0)
      ? teacher.subjects.filter(s => s && s.trim())
      : [];
    if (assigned.length > 0) {
      $("tCbtSubject").value = assigned[0];
    } else {
      let opt = Array.from($("tCbtSubject").options).find(o => o.value.toLowerCase() === "biology");
      if (!opt) {
        opt = document.createElement("option");
        opt.value = opt.textContent = "Biology";
        $("tCbtSubject").appendChild(opt);
      }
      $("tCbtSubject").value = opt.value;
    }
  }

  // Parse questions with sample diagram attached to Question 1
  const parsed = parseExamText($("tCbtRawText").value);
  teacherParsedQuestions = parsed.questions;
  if (teacherParsedQuestions[0] && sampleImg) {
    teacherParsedQuestions[0].image = sampleImg;
  }

  $("tCbtQuestionCount").textContent = teacherParsedQuestions.length;
  $("tCbtReviewCard").style.display = "block";
  $("tCbtSubmitSuccess").style.display = "none";
  $("tCbtParseMsg").style.color = "var(--status-good)";
  $("tCbtParseMsg").textContent = "✓ Sample questions loaded (includes Question 1 with attached diagram). Review below!";
  renderTeacherReviewQuestions();
};

$("tCbtClearTextBtn").onclick = () => {
  $("tCbtRawText").value = "";
  $("tCbtReviewCard").style.display = "none";
  $("tCbtParseMsg").textContent = "";
  teacherParsedQuestions = [];
};

// File drop/upload
function checkTargetQuestionsNotice() {
  const targetVal = $("tCbtTargetQuestions")?.value.trim();
  if (!targetVal || isNaN(parseInt(targetVal, 10)) || parseInt(targetVal, 10) <= 0) {
    showToast({
      type: "info",
      title: "Planned Question Count Check",
      message: "Tip: Select your planned question count in Step 1 (e.g. 5, 10, 20) before uploading to ensure the system strictly verifies you do not over or under-set questions."
    });
  }
}

$("tCbtDropZone").onclick = () => {
  checkTargetQuestionsNotice();
  $("tCbtFileInput").click();
};
["dragenter", "dragover"].forEach(evt => $("tCbtDropZone").addEventListener(evt, e => { e.preventDefault(); $("tCbtDropZone").classList.add("dragover"); }));
["dragleave", "drop"].forEach(evt => $("tCbtDropZone").addEventListener(evt, e => { e.preventDefault(); $("tCbtDropZone").classList.remove("dragover"); }));
$("tCbtDropZone").addEventListener("drop", e => {
  const f = e.dataTransfer.files[0];
  if (f) {
    checkTargetQuestionsNotice();
    handleTeacherFile(f);
  }
});
if ($("tCbtBrowseFileBtn")) {
  $("tCbtBrowseFileBtn").onclick = () => {
    checkTargetQuestionsNotice();
    $("tCbtFileInput").click();
  };
}

$("tCbtFileInput").onchange = (e) => {
  const f = e.target.files[0];
  if (f) handleTeacherFile(f);
  e.target.value = "";
};

// Ensure diagrams (Base64 PNG/JPEG or SVG) render cleanly without unencoded quote leaks
function getCleanImageSrc(img) {
  if (!img || typeof img !== "string") return "";
  const s = img.trim();
  if (s.startsWith("data:image/svg+xml;utf8,") || s.startsWith("data:image/svg+xml;charset=utf-8,")) {
    try {
      const rawSvg = decodeURIComponent(s.split(",").slice(1).join(","));
      return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(rawSvg)));
    } catch (e) {
      return s;
    }
  }
  if (s.startsWith("<svg")) {
    try {
      return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(s)));
    } catch (e) {
      return s;
    }
  }
  return s;
}

// Image Optimizer (ensures Biology diagrams are crisp and fast without exceeding storage limits)
async function optimizeImageBase64(dataUri, maxDim = 800, quality = 0.82) {
  if (!dataUri || typeof dataUri !== "string" || !dataUri.startsWith("data:image")) return dataUri;
  if (dataUri.length < 90000) return dataUri;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w >= h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      try {
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch (e) {
        resolve(dataUri);
      }
    };
    img.onerror = () => resolve(dataUri);
    img.src = dataUri;
  });
}

// ── Exam Text Normalizer ──
// Takes raw text (from Mammoth docx conversion or manual paste) and ensures:
// 1. Questions start on clean new lines
// 2. Options A, B, C, D, E are each on their own line
// 3. Diagram markers [🖼️ Diagram Attached] are on their own line
// 4. Answer: X lines are properly separated from options
// 5. Answer Key Summary is recognized and formatted cleanly
function normalizeExamText(text) {
  if (!text) return "";

  let t = String(text).replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // A. Separate Answer Key summary header if jammed
  t = t.replace(/([^\n])\s*(✅?\s*(?:ANSWER\s*KEY|ANSWERS|CORRECT\s*ANSWERS))/gi, "$1\n\n$2");
  t = t.replace(/(✅?\s*(?:ANSWER\s*KEY|ANSWERS|CORRECT\s*ANSWERS)[^\n]*)/gi, "$1\n");
  t = t.replace(/([^\n])\s*(—\s*End of Exam[^\n]*—|-+\s*End of Exam[^\n]*-+)/gi, "$1\n\n$2");

  // B. Separate Answer labels jammed directly after option text (e.g. "Endoplasmic reticulumAnswer: B")
  t = t.replace(/([^\n])\s*(Answer|Ans|Correct(?:\s*Answer)?)\s*[\:\-\=]\s*/gi, "$1\nAnswer: ");

  // C. Separate Question numbers jammed after Answer (e.g. "Answer: B2. What is...")
  t = t.replace(/(Answer:\s*[A-Ea-e])\s*(\d+[\.\)\:\-]\s*)/gi, "$1\n\n$2");
  t = t.replace(/(Answer:\s*[^\n]+?)\s*(\d+[\.\)\:\-]\s+[A-Z])/gi, "$1\n\n$2");

  // D. Separate Diagram markers if jammed
  t = t.replace(/([^\n])\s*(\[\s*🖼️\s*Diagram Attached\s*\])/gi, "$1\n\n$2");
  t = t.replace(/(\[\s*🖼️\s*Diagram Attached\s*\])\s*([^\n])/gi, "$1\n\n$2");
  t = t.replace(/([^\n])\s*(\[\[CBT_IMG_TOKEN_\d+\]\])/gi, "$1\n\n$2");
  t = t.replace(/(\[\[CBT_IMG_TOKEN_\d+\]\])\s*([^\n])/gi, "$1\n\n$2");

  // E. Separate Option A jammed directly against question text or punctuation:
  // e.g. "temperature?A. Fahrenheit" or "basic unit of life?A. Tissue"
  t = t.replace(/([\?\.\:\!\]\)])\s*([Aa])[\.\)]\s+/g, "$1\n$2. ");

  // F. Separate Options B, C, D, E jammed against previous text:
  // e.g. "NucleusB. MitochondriaC. RibosomeD. Endoplasmic"
  t = t.replace(/([^\s\n])\s*([B-Eb-e])[\.\)]\s+/g, "$1\n$2. ");
  t = t.replace(/([^\n])\s+([A-Ea-e])[\.\)]\s+/g, (match, prefix, letter) => {
    return prefix + "\n" + letter.toUpperCase() + ". ";
  });

  // G. Clean up questions in the main exam section (avoid touching answer key pairs)
  const parts = t.split(/✅?\s*(?:ANSWER\s*KEY|ANSWERS|CORRECT\s*ANSWERS)/i);
  let mainExam = parts[0];
  const answerKeySection = parts[1] !== undefined ? parts.slice(1).join("\n") : null;

  mainExam = mainExam.replace(/([^\n])\s+(\d+[\.\)\:\-]\s+[A-Z])/g, "$1\n\n$2");

  if (answerKeySection) {
    const formattedKey = answerKeySection
      .replace(/—\s*End[^\n]*—/i, "")
      .replace(/(\d+)[\.\)\:\-]\s*([A-Ea-e])/g, "$1. $2    ")
      .trim();
    t = mainExam.trim() + "\n\n✅ ANSWER KEY SUMMARY\n" + formattedKey + "\n\n— End of Examination —";
  } else {
    t = mainExam;
  }

  return t.replace(/\n{3,}/g, "\n\n").trim();
}

// Convert Mammoth HTML with images into questions and display text
async function parseExamFromMammothHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const rawImages = [];
  const imgNodes = doc.querySelectorAll("img");
  for (let i = 0; i < imgNodes.length; i++) {
    const img = imgNodes[i];
    const src = img.getAttribute("src") || img.src;
    if (src && src.startsWith("data:image")) {
      const optSrc = await optimizeImageBase64(src, 750, 0.82);
      rawImages.push(optSrc);
      const token = doc.createTextNode(`\n\n[[CBT_IMG_TOKEN_${rawImages.length - 1}]]\n\n`);
      if (img.parentNode) {
        img.parentNode.replaceChild(token, img);
      }
    }
  }

  // Preserve all block linebreaks so paragraphs, table rows, and headers don't jam together
  doc.querySelectorAll("p, div, tr, li, h1, h2, h3, h4, h5, h6, blockquote").forEach(el => {
    el.insertAdjacentText("afterend", "\n\n");
  });
  doc.querySelectorAll("br").forEach(el => {
    el.insertAdjacentText("afterend", "\n");
  });
  doc.querySelectorAll("td, th").forEach(el => {
    el.insertAdjacentText("afterend", "\n");
  });

  const rawText = doc.body ? (doc.body.textContent || "") : "";
  const normalizedText = normalizeExamText(rawText);

  return parseExamText(normalizedText, rawImages);
}

function handleTeacherFile(file) {
  $("tCbtParseMsg").textContent = "";

  // Auto-detect subject from filename if present (only among teacher's assigned subjects)
  if (file && file.name) {
    const fNameLow = file.name.toLowerCase();
    const assigned = (teacher && Array.isArray(teacher.subjects) && teacher.subjects.length > 0)
      ? teacher.subjects.filter(s => s && s.trim())
      : (typeof CBT_CONFIG !== "undefined" && CBT_CONFIG.subjects ? Object.keys(CBT_CONFIG.subjects) : []);

    for (const sName of assigned) {
      if (fNameLow.includes(sName.toLowerCase())) {
        if ($("tCbtSubject")) {
          const opt = Array.from($("tCbtSubject").options).find(o => o.value.toLowerCase() === sName.toLowerCase());
          if (opt) {
            $("tCbtSubject").value = opt.value;
          }
        }
        break;
      }
    }
  }

  // Ensure title matches institutional standard in ALL CAPS: [SUBJECT] [ADMIN_TERM]
  updateTeacherExamTitle();

  if (file.name.endsWith(".docx")) {
    const reader = new FileReader();
    reader.onload = async ev => {
      if (window.mammoth) {
        try {
          $("tCbtParseMsg").style.color = "var(--text-muted)";
          $("tCbtParseMsg").textContent = "Reading Word document & extracting questions and diagrams...";
          const res = await window.mammoth.convertToHtml({ arrayBuffer: ev.target.result });
          const parsed = await parseExamFromMammothHtml(res.value);
          $("tCbtRawText").value = parsed.displayText;
          teacherParsedQuestions = parsed.questions;

          if (teacherParsedQuestions.length) {
            $("tCbtQuestionCount").textContent = teacherParsedQuestions.length;
            $("tCbtReviewCard").style.display = "block";
            $("tCbtSubmitSuccess").style.display = "none";
            $("tCbtParseMsg").style.color = "var(--status-good)";
            const diagCount = teacherParsedQuestions.filter(q => q.image).length;
            const diagInfo = diagCount ? ` (${diagCount} diagram${diagCount > 1 ? 's' : ''} extracted)` : "";
            $("tCbtParseMsg").textContent = `✓ Successfully extracted ${teacherParsedQuestions.length} questions${diagInfo}. Review below!`;
            renderTeacherReviewQuestions();

            const val = validateTeacherQuestions();
            if (val.valid) {
              showToast({
                type: "success",
                title: "Exam Questions Successfully Extracted!",
                message: `Extracted exactly ${val.detectedCount} of ${val.targetCount} complete questions. All options & answers ready!`
              });
            } else {
              showToast({
                type: "warning",
                title: "Question Quality & Count Alert",
                message: `Extracted ${val.detectedCount} questions. Found ${val.issues.length} issue${val.issues.length !== 1 ? 's' : ''} to resolve in Step 3 before submitting.`,
                list: val.issues.slice(0, 4).map(i => i.message)
              });
            }
          } else {
            $("tCbtParseMsg").style.color = "var(--status-fail)";
            $("tCbtParseMsg").textContent = "Could not identify question numbering. Please verify questions begin with 1. 2. etc.";
          }
        } catch (err) {
          $("tCbtParseMsg").style.color = "var(--status-fail)";
          $("tCbtParseMsg").textContent = "Could not parse Word document: " + err.message + ". You can copy and paste the text.";
        }
      } else {
        $("tCbtParseMsg").textContent = "Word parser loading... you can copy and paste the text directly into the box.";
      }
    };
    reader.readAsArrayBuffer(file);
  } else {
    const reader = new FileReader();
    reader.onload = ev => {
      $("tCbtRawText").value = ev.target.result;
      parseTeacherCbtText();
    };
    reader.readAsText(file);
  }
}

// Universal Question & Answer Key Parser
function parseExamText(rawText, rawImages = []) {
  const normalized = normalizeExamText(rawText);
  const lines = normalized.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const questions = [];
  let currentQ = null;
  let isAnswerKeySection = false;
  const answerKeyMap = {}; // e.g. { 1: 'B', 2: 'C', ... }

  const qRegex = /^(?:question\s*)?(\d+)[\.\)\:\-]\s*(.*)$/i;
  const optRegex = /^(\*?)\s*(?:\(?([A-Ea-e])[\.\)]|\b([A-Ea-e])[\.\)])\s*(.*)$/;
  const ansRegex = /^(?:answer|ans|correct(?:\s*answer)?)\s*[\:\-\=]\s*([A-Ea-e]|[^\r\n]+)$/i;
  const tokenRegex = /\[\[CBT_IMG_TOKEN_(\d+)\]\]/;
  const ansKeyHeaderRegex = /^(?:✅\s*)?(?:answer\s*key|answers|correct\s*answers)(?:\s*summary)?/i;
  const endExamRegex = /^(?:—|-+)\s*end\s+of\s+(?:exam|examination)/i;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Detect Answer Key Summary at bottom
    if (ansKeyHeaderRegex.test(line)) {
      isAnswerKeySection = true;
      if (currentQ && currentQ.text && currentQ.options.length) {
        finalizeQ(currentQ);
        questions.push(currentQ);
        currentQ = null;
      }
      const pairs = line.match(/(\d+)[\.\)\:\-]\s*([A-Ea-e])/g);
      if (pairs) {
        pairs.forEach(p => {
          const m = p.match(/(\d+)[\.\)\:\-]\s*([A-Ea-e])/);
          if (m) answerKeyMap[parseInt(m[1], 10)] = m[2].toUpperCase();
        });
      }
      continue;
    }

    if (endExamRegex.test(line)) {
      isAnswerKeySection = true;
      continue;
    }

    // Inside Answer Key section: accumulate answer key pairs and avoid question duplication
    if (isAnswerKeySection) {
      const pairs = line.match(/(\d+)[\.\)\:\-]\s*([A-Ea-e])/g);
      if (pairs) {
        pairs.forEach(p => {
          const m = p.match(/(\d+)[\.\)\:\-]\s*([A-Ea-e])/);
          if (m) answerKeyMap[parseInt(m[1], 10)] = m[2].toUpperCase();
        });
      }
      continue;
    }

    // Diagram token
    const tokenMatch = line.match(tokenRegex);
    if (tokenMatch) {
      const imgIdx = parseInt(tokenMatch[1], 10);
      if (currentQ && rawImages[imgIdx]) {
        currentQ.image = rawImages[imgIdx];
      }
      line = line.replace(tokenRegex, "").trim();
      if (!line) continue;
    }

    // Skip diagram attachment label lines
    if (/^\s*\[\s*🖼️?\s*(?:Diagram|Picture|Image)\s*Attached\s*\]\s*$/i.test(line)) {
      continue;
    }

    // Question start
    const qMatch = line.match(qRegex);
    if (qMatch) {
      if (currentQ && currentQ.text && currentQ.options.length) {
        finalizeQ(currentQ);
        questions.push(currentQ);
      }
      const cleanQText = (qMatch[2] || "").replace(/\[\s*🖼️?\s*(?:Diagram|Picture|Image)\s*Attached\s*\]/gi, "").trim();
      currentQ = {
        num: parseInt(qMatch[1], 10),
        text: cleanQText,
        image: null,
        options: [],
        correctAnswer: "",
        correctLetter: ""
      };
      continue;
    }

    if (!currentQ) continue;

    // Answer directly under question
    const ansMatch = line.match(ansRegex);
    if (ansMatch) {
      const val = ansMatch[1].trim();
      if (/^[A-Ea-e]$/.test(val)) {
        currentQ.correctLetter = val.toUpperCase();
      } else {
        currentQ.correctAnswer = val;
      }
      continue;
    }

    // Option
    const optMatch = line.match(optRegex);
    if (optMatch) {
      const isStar = optMatch[1] === "*";
      const letter = (optMatch[2] || optMatch[3]).toUpperCase();
      const text = optMatch[4].trim();
      currentQ.options.push({ letter, text });
      if (isStar) currentQ.correctLetter = letter;
      continue;
    }

    // Inline multi-option fallback
    const inlineMatch = line.match(/[A-Ea-e][\.\)]\s*[^A-Ea-e\.\)]+/g);
    if (inlineMatch && inlineMatch.length >= 2) {
      inlineMatch.forEach(chunk => {
        const m = chunk.trim().match(/^([A-Ea-e])[\.\)]\s*(.*)$/);
        if (m) {
          currentQ.options.push({ letter: m[1].toUpperCase(), text: m[2].trim() });
        }
      });
      continue;
    }

    // Continuation of question text before options
    if (currentQ.options.length === 0) {
      if (!/^\s*\[\s*🖼️?\s*(?:Diagram|Picture|Image)\s*Attached\s*\]\s*$/i.test(line)) {
        currentQ.text += (currentQ.text ? " " : "") + line;
      }
    }
  }

  if (currentQ && currentQ.text && currentQ.options.length) {
    finalizeQ(currentQ);
    questions.push(currentQ);
  }

  // Apply Answer Key Map to questions
  questions.forEach((q, idx) => {
    const qNum = q.num || (idx + 1);
    if ((!q.correctLetter || q.correctLetter === "") && answerKeyMap[qNum]) {
      q.correctLetter = answerKeyMap[qNum];
    }
    finalizeQ(q);
  });

  function finalizeQ(q) {
    q.text = (q.text || "").replace(/\[\s*🖼️?\s*(?:Diagram|Picture|Image)\s*Attached\s*\]/gi, "").trim();
    if (q.correctLetter) {
      const opt = q.options.find(o => o.letter === q.correctLetter);
      if (opt) q.correctAnswer = opt.text;
    }
    q.optionStrings = q.options.map(o => o.text);
    if (!q.correctAnswer && q.options.length) {
      const matched = q.options.find(o => o.text.toLowerCase() === (q.correctAnswer || "").toLowerCase());
      if (matched) q.correctAnswer = matched.text;
      else q.correctAnswer = q.options[0].text;
    }
  }

  const displayText = normalized.replace(/\[\[CBT_IMG_TOKEN_\d+\]\]/g, "\n[🖼️ Diagram Attached]\n").trim();
  return { questions, displayText, imagesCount: rawImages.length };
}

function parseTeacherCbtText() {
  const text = $("tCbtRawText").value.trim();
  $("tCbtParseMsg").textContent = "";
  if (!text) {
    $("tCbtParseMsg").textContent = "Please enter or paste your question text first.";
    return;
  }

  // 1. Normalize the textarea content and write it back so the teacher sees clean formatting
  const normalized = normalizeExamText(text);
  $("tCbtRawText").value = normalized;

  // 2. Preserve any previously extracted images if re-parsing manual text
  const existingImages = (teacherParsedQuestions || []).map(q => q.image);
  const parsed = parseExamText(normalized, existingImages);
  teacherParsedQuestions = parsed.questions;

  teacherParsedQuestions.forEach((q, idx) => {
    if (!q.image && existingImages[idx]) {
      q.image = existingImages[idx];
    }
  });

  if (!teacherParsedQuestions.length) {
    $("tCbtParseMsg").textContent = "No numbered questions recognized. Please ensure questions start with 1. 2. etc.";
    $("tCbtReviewCard").style.display = "none";
    showToast({
      type: "warning",
      title: "No Questions Recognized",
      message: "Could not identify question numbering. Please verify each question begins with 1. 2. 3. etc."
    });
    return;
  }

  $("tCbtQuestionCount").textContent = teacherParsedQuestions.length;
  $("tCbtReviewCard").style.display = "block";
  $("tCbtSubmitSuccess").style.display = "none";
  renderTeacherReviewQuestions();

  const val = validateTeacherQuestions();
  if (val.valid) {
    showToast({
      type: "success",
      title: "Questions Successfully Parsed!",
      message: `Parsed exactly ${val.detectedCount} of ${val.targetCount} complete questions. All options & answers ready!`
    });
  } else {
    showToast({
      type: "warning",
      title: "Question Review Required",
      message: `Parsed ${val.detectedCount} question${val.detectedCount !== 1 ? 's' : ''}. Found ${val.issues.length} issue${val.issues.length !== 1 ? 's' : ''} to resolve in Step 3 before submitting.`,
      list: val.issues.slice(0, 4).map(i => i.message)
    });
  }
}

$("tCbtParseBtn").onclick = parseTeacherCbtText;

let activeTargetQuestionImageIdx = null;
let teacherEditingReviewQIdx = null;
let teacherReviewTempImage = undefined;
let currentTeacherReviewCorrectLetter = "A";

// ══════════════════════════════════════════════════════════
// TEACHER CBT QUESTION VALIDATION & COUNT ENFORCEMENT
// ══════════════════════════════════════════════════════════
function initTargetQuestionsControls() {
  const targetInp = $("tCbtTargetQuestions");
  const pills = document.querySelectorAll(".cbt-pill-btn");
  if (!targetInp) return;

  pills.forEach(p => {
    p.onclick = () => {
      targetInp.value = p.dataset.count;
      pills.forEach(btn => btn.classList.toggle("active", btn === p));
      updateTargetStatusBadge();
      if (teacherParsedQuestions.length > 0) {
        renderTeacherReviewQuestions();
      }
    };
  });

  targetInp.oninput = () => {
    const val = targetInp.value.trim();
    pills.forEach(btn => btn.classList.toggle("active", btn.dataset.count === val));
    updateTargetStatusBadge();
    if (teacherParsedQuestions.length > 0) {
      renderTeacherReviewQuestions();
    }
  };
}

function updateTargetStatusBadge() {
  const badge = $("tCbtTargetStatusBadge");
  if (!badge) return;
  const targetVal = $("tCbtTargetQuestions")?.value.trim();
  const targetCount = targetVal ? parseInt(targetVal, 10) : null;
  const detected = (teacherParsedQuestions || []).length;

  if (targetCount === null || isNaN(targetCount) || targetCount <= 0) {
    badge.textContent = detected > 0 ? "⚠️ Set planned question count" : "";
    badge.style.color = "var(--text-muted)";
    return;
  }

  if (detected === 0) {
    badge.textContent = `Target: ${targetCount} questions`;
    badge.style.color = "var(--text-muted)";
    return;
  }

  if (detected === targetCount) {
    badge.textContent = `✓ Target Matched (${detected}/${targetCount})`;
    badge.style.color = "var(--status-good)";
  } else if (detected < targetCount) {
    const diff = targetCount - detected;
    badge.textContent = `⚠️ ${detected}/${targetCount} (${diff} missing)`;
    badge.style.color = "var(--status-fail)";
  } else {
    const diff = detected - targetCount;
    badge.textContent = `⚠️ ${detected}/${targetCount} (${diff} extra)`;
    badge.style.color = "var(--status-fail)";
  }
}

function validateTeacherQuestions() {
  const targetVal = $("tCbtTargetQuestions")?.value.trim();
  const targetCount = targetVal ? parseInt(targetVal, 10) : null;
  const detectedCount = (teacherParsedQuestions || []).length;

  const issues = [];
  const questionIssuesMap = {}; // idx -> string[]

  // 1. Target Question Count Verification
  if (targetCount === null || isNaN(targetCount) || targetCount <= 0) {
    issues.push({
      type: "target_missing",
      title: "Planned Question Count Required",
      message: "Please choose or enter your planned number of questions in Step 1 (e.g. 5, 10, 20, 30) so the system can verify you have not under-set or over-set."
    });
  } else if (detectedCount !== targetCount) {
    if (detectedCount < targetCount) {
      const diff = targetCount - detectedCount;
      issues.push({
        type: "under_count",
        title: "Question Count Under Target",
        message: `Under-setting detected: You planned to set ${targetCount} questions, but only ${detectedCount} question${detectedCount !== 1 ? 's were' : ' was'} detected (${diff} question${diff !== 1 ? 's' : ''} missing).`
      });
    } else {
      const diff = detectedCount - targetCount;
      issues.push({
        type: "over_count",
        title: "Question Count Over Target",
        message: `Over-setting detected: You planned to set ${targetCount} questions, but ${detectedCount} questions were detected (${diff} extra question${diff !== 1 ? 's' : ''} over target).`
      });
    }
  }

  // 2. Question Completeness & Option Integrity Verification
  (teacherParsedQuestions || []).forEach((q, idx) => {
    const qNum = idx + 1;
    const qErrors = [];

    // Prompt text check
    if (!q.text || !q.text.trim()) {
      qErrors.push("Question prompt text is empty");
    }

    // Options check
    const rawOpts = Array.isArray(q.options) ? q.options : (q.optionStrings || []);
    const opts = rawOpts.map(o => (typeof o === "object" && o !== null && o.text !== undefined) ? o.text : String(o));

    if (opts.length < 2) {
      qErrors.push(`Requires at least 2 options (has ${opts.length})`);
    }

    opts.forEach((optText, oIdx) => {
      const letter = String.fromCharCode(65 + oIdx);
      if (!optText || !optText.trim()) {
        qErrors.push(`Option ${letter} has no text (blank)`);
      }
    });

    // Correct Answer check
    const hasValidAnswer = Boolean(
      (q.correctAnswer && q.correctAnswer.trim() && opts.some(o => o.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase())) ||
      (q.correctLetter && /^[A-E]$/i.test(q.correctLetter) && (q.correctLetter.toUpperCase().charCodeAt(0) - 65 < opts.length))
    );

    if (!hasValidAnswer) {
      qErrors.push("Correct answer not selected (Click an option below to mark it as correct)");
    }

    if (qErrors.length > 0) {
      questionIssuesMap[idx] = qErrors;
      qErrors.forEach(errText => {
        issues.push({
          type: "question_incomplete",
          qIdx: idx,
          qNum: qNum,
          title: `Question ${qNum}`,
          message: `Question ${qNum}: ${errText}`
        });
      });
    }
  });

  return {
    valid: issues.length === 0,
    targetCount,
    detectedCount,
    issues,
    questionIssuesMap
  };
}

function renderTeacherReviewQuestions() {
  const val = validateTeacherQuestions();
  updateTargetStatusBadge();

  if ($("tCbtQuestionCount")) {
    $("tCbtQuestionCount").textContent = val.targetCount
      ? `${val.detectedCount} detected (Target: ${val.targetCount})`
      : `${val.detectedCount} detected`;
  }

  // Update Real-Time Quality & Question Count Banner
  const statusCard = $("tCbtValidationStatusCard");
  if (statusCard) {
    statusCard.style.display = "block";
    if (!val.valid) {
      statusCard.innerHTML = `
        <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:6px;padding:12px 16px;">
          <div style="font-weight:700;color:#ef4444;display:flex;align-items:center;gap:8px;font-size:13px">
            <span>⚠️ Question Quality &amp; Count Alert — ${val.issues.length} Issue${val.issues.length !== 1 ? 's' : ''} Must Be Fixed Before Submitting:</span>
          </div>
          <ul style="margin:8px 0 0 18px;font-size:12px;color:var(--text);line-height:1.6">
            ${val.issues.map(iss => `<li style="margin-bottom:2px"><strong>${esc(iss.title || 'Alert')}:</strong> ${esc(iss.message)}</li>`).join("")}
          </ul>
          <div style="font-size:11px;color:var(--text-muted);margin-top:8px">
            💡 <em>Ensure question count matches your target, no options are left empty, and every question has its correct answer marked.</em>
          </div>
        </div>
      `;
    } else {
      statusCard.innerHTML = `
        <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.3);border-radius:6px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;color:#10b981;font-size:13px;font-weight:600">
          <span>✅ Quality Checks Passed: Exactly ${val.detectedCount} of ${val.targetCount} complete questions. All options &amp; answers verified!</span>
          <span style="font-size:11px;background:rgba(16,185,129,0.15);padding:2px 8px;border-radius:10px">Ready for Admin Submission</span>
        </div>
      `;
    }
  }

  if (teacherParsedQuestions.length === 0) {
    $("tCbtQuestionsList").innerHTML = `
      <div style="text-align:center;padding:28px;color:var(--text-muted);background:var(--surface-alt);border:1px dashed var(--border);border-radius:var(--radius)">
        No questions loaded. Click <strong>➕ Add Question</strong> or paste question text in Step 2.
      </div>
    `;
    return;
  }

  $("tCbtQuestionsList").innerHTML = teacherParsedQuestions.map((q, idx) => {
    const rawOpts = Array.isArray(q.options) ? q.options : (q.optionStrings || []);
    const opts = rawOpts.map(o => (typeof o === "object" && o !== null && o.text !== undefined) ? o.text : String(o));
    const qErrors = val.questionIssuesMap[idx] || [];
    const hasError = qErrors.length > 0;
    const issueBarHtml = hasError ? `
      <div class="cbt-q-issue-bar">
        <span>⚠️ ${qErrors.map(e => esc(e)).join(" · ")}</span>
      </div>
    ` : "";

    // Normal Review Card
    if (teacherEditingReviewQIdx !== idx) {
      const cleanImg = getCleanImageSrc(q.image);
      const hasImg = Boolean(cleanImg);
      const imgHtml = hasImg ? `
        <div style="margin:8px 0;text-align:center">
          <div style="display:inline-block;background:#ffffff;border:1px solid var(--border);border-radius:6px;padding:6px;box-shadow:0 1px 3px rgba(0,0,0,0.06);text-align:center">
            <img src="${cleanImg}" alt="Question ${idx + 1} Diagram" style="max-height:160px;max-width:100%;object-fit:contain;border-radius:4px;display:block;margin:0 auto;cursor:zoom-in" data-zoom-img="${cleanImg}" title="Click diagram to expand">
            <div style="margin-top:6px;display:flex;gap:10px;justify-content:center;align-items:center">
              <span style="font-size:10px;color:var(--text-muted);cursor:pointer" data-zoom-img="${cleanImg}">🔍 Click to expand</span>
              <span style="color:var(--border)">|</span>
              <button type="button" class="btn-text" style="font-size:11px;color:var(--accent);font-weight:600" data-replace-img="${idx}">🔄 Replace</button>
              <button type="button" class="btn-text" style="font-size:11px;color:var(--status-fail);font-weight:600" data-remove-img="${idx}">🗑️ Remove</button>
            </div>
          </div>
        </div>
      ` : `
        <div style="margin:6px 0">
          <button type="button" class="btn-secondary btn-sm" style="font-size:11px;padding:3px 10px;display:inline-flex;align-items:center;gap:6px" data-add-img="${idx}">
            🖼️ Attach Diagram / Image
          </button>
        </div>
      `;

      return `
        <div class="cbt-q-card ${hasError ? 'has-validation-error' : ''}">
          <div class="cbt-q-header">
            <span class="cbt-q-num">Question ${idx + 1}</span>
            <div style="display:flex;align-items:center;gap:12px">
              <span style="font-size:12px;color:var(--text-muted)">Pts: ${q.points || 1.5}</span>
              <button type="button" class="btn-text" data-teacher-edit-review-q="${idx}" style="font-size:12px;color:var(--accent);font-weight:600;cursor:pointer">✏️ Edit</button>
              <button type="button" class="btn-text" data-teacher-del-review-q="${idx}" style="font-size:12px;color:var(--status-fail);font-weight:600;cursor:pointer">🗑️ Delete</button>
            </div>
          </div>
          ${issueBarHtml}
          <div class="cbt-q-text" style="font-weight:600;font-size:14px;color:var(--text);margin-bottom:8px;white-space:pre-wrap">${esc(q.text)}</div>
          ${imgHtml}
          <div class="cbt-options-grid">
            ${opts.map((opt, oIdx) => {
        const letter = String.fromCharCode(65 + oIdx);
        const isEmptyOpt = !opt || !opt.trim();
        const isCorrect = (q.correctAnswer && opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) || (q.correctLetter === letter);
        return `
                <button type="button" class="cbt-opt-btn ${isCorrect ? 'correct' : ''} ${isEmptyOpt ? 'is-empty-opt' : ''}" data-q-idx="${idx}" data-opt-letter="${letter}" data-opt-text="${esc(opt)}">
                  <strong>${letter}.</strong>
                  <span>${isEmptyOpt ? '<em style="color:#ef4444">(Blank Option — Enter Text)</em>' : esc(opt)}</span>
                  ${isCorrect ? `<span style="margin-left:auto;font-size:11px;font-weight:700">✓ CORRECT</span>` : ''}
                </button>
              `;
      }).join("")}
          </div>
        </div>
      `;
    }

    // Inline Edit Card in Step 3
    const currImg = teacherReviewTempImage !== undefined ? teacherReviewTempImage : q.image;
    return `
      <div class="cbt-q-card q-card-edit" style="border:1px solid var(--accent);background:rgba(59,130,246,0.04);padding:16px;border-radius:6px">
        <div class="cbt-q-header" style="margin-bottom:10px">
          <span class="cbt-q-num" style="background:var(--accent);color:#fff">Editing Question ${idx + 1}</span>
          <div style="display:flex;align-items:center;gap:8px">
            <label style="font-size:12px;color:var(--text-muted);font-weight:600">Points:</label>
            <input type="number" step="0.5" id="teacherReviewEditPoints" value="${q.points || 1.5}" class="cbt-form-input" style="width:70px;padding:3px 6px;font-size:12px">
          </div>
        </div>
        <div style="margin-bottom:10px">
          <label style="font-size:12px;font-weight:600;color:var(--text);display:block;margin-bottom:4px">Question Text:</label>
          <textarea class="cbt-form-input" id="teacherReviewEditText" style="width:100%;min-height:75px;font-size:13px;line-height:1.4">${esc(q.text || "")}</textarea>
        </div>
        
        <div style="margin-bottom:12px">
          <label style="font-size:12px;font-weight:600;color:var(--text);display:block;margin-bottom:4px">Diagram / Image:</label>
          ${currImg ? `
            <div style="margin:8px 0;text-align:center">
              <div style="display:inline-block;background:#ffffff;border:1px solid var(--border);border-radius:6px;padding:6px;box-shadow:0 1px 3px rgba(0,0,0,0.06);text-align:center">
                <img src="${getCleanImageSrc(currImg)}" alt="Diagram" style="max-height:160px;max-width:100%;object-fit:contain;border-radius:4px;display:block;margin:0 auto">
                <div style="margin-top:6px;display:flex;gap:12px;justify-content:center">
                  <button type="button" class="btn-text" style="font-size:11px;color:var(--accent);font-weight:600" id="teacherReviewChangeImgBtn">🔄 Change Diagram</button>
                  <button type="button" class="btn-text" style="font-size:11px;color:var(--status-fail);font-weight:600" id="teacherReviewRemoveImgBtn">🗑️ Remove Diagram</button>
                </div>
              </div>
            </div>
          ` : `
            <button type="button" class="btn btn-secondary btn-sm" id="teacherReviewAttachImgBtn" style="font-size:11px;padding:4px 10px;display:inline-flex;align-items:center;gap:6px">
              🖼️ Attach Diagram / Image
            </button>
          `}
        </div>

        <div style="margin-bottom:10px">
          <label style="font-size:12px;font-weight:600;color:var(--text);display:block;margin-bottom:6px">Options &amp; Correct Answer (Click "Mark as Correct" for the right answer):</label>
          <div style="display:flex;flex-direction:column;gap:8px" id="teacherReviewEditOptionsList">
            ${['A', 'B', 'C', 'D'].map((letter, oIdx) => {
      const optVal = opts[oIdx] !== undefined ? opts[oIdx] : "";
      const isCorrect = currentTeacherReviewCorrectLetter === letter;
      return `
                <div style="display:flex;align-items:center;gap:8px">
                  <strong style="width:20px;font-size:13px;color:var(--text)">${letter}.</strong>
                  <input type="text" class="cbt-form-input teacher-review-opt-input" data-letter="${letter}" data-opt-idx="${oIdx}" value="${esc(optVal)}" placeholder="Option ${letter}" style="flex:1;font-size:13px;padding:6px 10px">
                  <button type="button" class="btn btn-sm ${isCorrect ? 'btn-good' : 'btn-secondary'} teacher-review-set-correct-btn" data-letter="${letter}" style="font-size:11px;padding:4px 10px;white-space:nowrap">
                    ${isCorrect ? '✓ Correct Answer' : 'Mark as Correct'}
                  </button>
                </div>
              `;
    }).join("")}
          </div>
        </div>

        <div style="margin-top:14px;display:flex;justify-content:flex-end;gap:8px">
          <button type="button" class="btn btn-secondary btn-sm" id="teacherReviewCancelEditBtn">Cancel</button>
          <button type="button" class="btn-primary btn-sm" id="teacherReviewSaveQBtn" data-save-idx="${idx}">💾 Save Question</button>
        </div>
      </div>
    `;
  }).join("");

  // Allow clicking an option to designate it as the correct answer
  document.querySelectorAll("[data-q-idx]").forEach(btn => {
    btn.onclick = () => {
      const qIdx = parseInt(btn.dataset.qIdx, 10);
      const letter = btn.dataset.optLetter;
      const optText = btn.dataset.optText;
      teacherParsedQuestions[qIdx].correctLetter = letter;
      teacherParsedQuestions[qIdx].correctAnswer = optText;
      renderTeacherReviewQuestions();
    };
  });

  // Edit in Step 3
  document.querySelectorAll("[data-teacher-edit-review-q]").forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.teacherEditReviewQ, 10);
      teacherEditingReviewQIdx = idx;
      const q = teacherParsedQuestions[idx];
      teacherReviewTempImage = q.image || null;
      const rawOpts = Array.isArray(q.options) ? q.options : (q.optionStrings || []);
      const opts = rawOpts.map(o => (typeof o === "object" && o !== null && o.text !== undefined) ? o.text : String(o));
      let cLetter = q.correctLetter;
      if (!cLetter && q.correctAnswer) {
        const foundIdx = opts.findIndex(o => o.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase());
        if (foundIdx >= 0) cLetter = String.fromCharCode(65 + foundIdx);
      }
      currentTeacherReviewCorrectLetter = cLetter || "A";
      renderTeacherReviewQuestions();
    };
  });

  // Delete in Step 3
  document.querySelectorAll("[data-teacher-del-review-q]").forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.teacherDelReviewQ, 10);
      if (!confirm(`Remove Question ${idx + 1} from review list?`)) return;
      teacherParsedQuestions.splice(idx, 1);
      if (teacherEditingReviewQIdx === idx) {
        teacherEditingReviewQIdx = null;
        teacherReviewTempImage = undefined;
      } else if (teacherEditingReviewQIdx > idx) {
        teacherEditingReviewQIdx--;
      }
      renderTeacherReviewQuestions();
    };
  });

  // Remove image in normal review card
  document.querySelectorAll("[data-remove-img]").forEach(btn => {
    btn.onclick = () => {
      const qIdx = parseInt(btn.dataset.removeImg, 10);
      if (teacherParsedQuestions[qIdx]) {
        teacherParsedQuestions[qIdx].image = null;
        renderTeacherReviewQuestions();
      }
    };
  });

  // Add / Replace image file picker trigger in normal review card
  document.querySelectorAll("[data-add-img], [data-replace-img]").forEach(btn => {
    btn.onclick = () => {
      activeTargetQuestionImageIdx = parseInt(btn.dataset.addImg ?? btn.dataset.replaceImg, 10);
      let fileInput = $("tCbtQuestionManualImgInput");
      if (!fileInput) {
        fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.id = "tCbtQuestionManualImgInput";
        fileInput.accept = "image/*";
        fileInput.style.display = "none";
        document.body.appendChild(fileInput);
      }
      fileInput.onchange = (e) => {
        const f = e.target.files[0];
        if (!f || activeTargetQuestionImageIdx === null) return;
        const r = new FileReader();
        r.onload = async (ev) => {
          const opt = await optimizeImageBase64(ev.target.result, 750, 0.82);
          if (teacherParsedQuestions[activeTargetQuestionImageIdx]) {
            teacherParsedQuestions[activeTargetQuestionImageIdx].image = opt;
            renderTeacherReviewQuestions();
          }
        };
        r.readAsDataURL(f);
        e.target.value = "";
      };
      fileInput.click();
    };
  });

  // Edit Mode Handlers for Step 3
  if (teacherEditingReviewQIdx !== null) {
    document.querySelectorAll(".teacher-review-set-correct-btn").forEach(b => {
      b.onclick = () => {
        currentTeacherReviewCorrectLetter = b.dataset.letter;
        document.querySelectorAll(".teacher-review-set-correct-btn").forEach(btn => {
          const isCurr = btn.dataset.letter === currentTeacherReviewCorrectLetter;
          btn.className = `btn btn-sm ${isCurr ? 'btn-good' : 'btn-secondary'} teacher-review-set-correct-btn`;
          btn.textContent = isCurr ? '✓ Correct Answer' : 'Mark as Correct';
        });
      };
    });

    const attachBtn = $("teacherReviewAttachImgBtn") || $("teacherReviewChangeImgBtn");
    if (attachBtn) {
      attachBtn.onclick = () => {
        let fileInput = $("tCbtQuestionManualImgInput");
        if (!fileInput) {
          fileInput = document.createElement("input");
          fileInput.type = "file";
          fileInput.id = "tCbtQuestionManualImgInput";
          fileInput.accept = "image/*";
          fileInput.style.display = "none";
          document.body.appendChild(fileInput);
        }
        fileInput.onchange = (e) => {
          const f = e.target.files[0];
          if (!f) return;
          const r = new FileReader();
          r.onload = async (ev) => {
            teacherReviewTempImage = await optimizeImageBase64(ev.target.result, 750, 0.82);
            renderTeacherReviewQuestions();
          };
          r.readAsDataURL(f);
          e.target.value = "";
        };
        fileInput.click();
      };
    }

    if ($("teacherReviewRemoveImgBtn")) {
      $("teacherReviewRemoveImgBtn").onclick = () => {
        teacherReviewTempImage = null;
        renderTeacherReviewQuestions();
      };
    }

    if ($("teacherReviewCancelEditBtn")) {
      $("teacherReviewCancelEditBtn").onclick = () => {
        teacherEditingReviewQIdx = null;
        teacherReviewTempImage = undefined;
        renderTeacherReviewQuestions();
      };
    }

    if ($("teacherReviewSaveQBtn")) {
      $("teacherReviewSaveQBtn").onclick = () => {
        const qIdx = parseInt($("teacherReviewSaveQBtn").dataset.saveIdx, 10);
        const newText = ($("teacherReviewEditText")?.value || "").trim();
        if (!newText) {
          showToast({
            type: "warning",
            title: "Question Text Required",
            message: "Question prompt text cannot be empty."
          });
          return;
        }
        const optInputs = document.querySelectorAll(".teacher-review-opt-input");
        const newOptions = Array.from(optInputs).map(inp => (inp.value || "").trim());
        const selectedLetter = currentTeacherReviewCorrectLetter || "A";
        const correctIdx = ["A", "B", "C", "D"].indexOf(selectedLetter);
        const newCorrect = (correctIdx >= 0 && newOptions[correctIdx]) ? newOptions[correctIdx] : newOptions[0];
        const newPts = parseFloat($("teacherReviewEditPoints")?.value) || 1.5;

        const targetQ = teacherParsedQuestions[qIdx];
        targetQ.text = newText;
        targetQ.options = newOptions.map((text, oIdx) => ({ letter: String.fromCharCode(65 + oIdx), text }));
        targetQ.optionStrings = newOptions;
        targetQ.correctAnswer = newCorrect;
        targetQ.correctLetter = selectedLetter;
        targetQ.points = newPts;
        if (teacherReviewTempImage !== undefined) {
          targetQ.image = teacherReviewTempImage;
        }

        teacherEditingReviewQIdx = null;
        teacherReviewTempImage = undefined;
        renderTeacherReviewQuestions();
      };
    }
  }

  // Lightbox click for diagrams
  document.querySelectorAll("[data-zoom-img]").forEach(el => {
    el.onclick = (e) => {
      e.stopPropagation();
      const src = el.dataset.zoomImg;
      if ($("cbtLightboxImg") && $("cbtImageLightboxModal")) {
        $("cbtLightboxImg").src = src;
        $("cbtImageLightboxModal").classList.add("open");
      }
    };
  });
}

if ($("tCbtAddReviewQBtn")) {
  $("tCbtAddReviewQBtn").onclick = () => {
    const newQ = {
      num: teacherParsedQuestions.length + 1,
      text: "",
      image: null,
      options: [
        { letter: "A", text: "" },
        { letter: "B", text: "" },
        { letter: "C", text: "" },
        { letter: "D", text: "" }
      ],
      optionStrings: ["", "", "", ""],
      correctLetter: "A",
      correctAnswer: "",
      points: 1.5
    };
    teacherParsedQuestions.push(newQ);
    teacherEditingReviewQIdx = teacherParsedQuestions.length - 1;
    teacherReviewTempImage = null;
    currentTeacherReviewCorrectLetter = "A";
    $("tCbtReviewCard").style.display = "block";
    renderTeacherReviewQuestions();
  };
}

// Submit Exam to Supabase for Admin
$("tCbtSubmitBtn").onclick = async () => {
  if (!teacherParsedQuestions.length) {
    if ($("tCbtRawText") && $("tCbtRawText").value.trim()) {
      parseTeacherCbtText();
    }
    if (!teacherParsedQuestions.length) {
      showToast({
        type: "warning",
        title: "No Questions Provided",
        message: "Please upload or paste questions and click 'Parse & Review Questions' first."
      });
      return;
    }
  }

  // Strict Question Count & Completeness Validation
  const val = validateTeacherQuestions();
  if (!val.valid) {
    showToast({
      type: "error",
      title: "Cannot Submit Exam",
      message: "Please fix the question count and completeness issues before submitting to the administrator:",
      list: val.issues.slice(0, 6).map(i => i.message).concat(val.issues.length > 6 ? [`...and ${val.issues.length - 6} more issue(s)`] : []),
      duration: 8500
    });

    const firstErr = document.querySelector(".cbt-q-card.has-validation-error");
    if (firstErr) {
      firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if ($("tCbtValidationStatusCard")) {
      $("tCbtValidationStatusCard").scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  const subject = $("tCbtSubject") ? $("tCbtSubject").value.trim() : "";
  const assigned = (teacher && Array.isArray(teacher.subjects) && teacher.subjects.length > 0)
    ? teacher.subjects.filter(s => s && s.trim())
    : [];

  if (!subject) {
    showToast({
      type: "warning",
      title: "Subject Required",
      message: "Please select a subject from your assigned subjects before submitting."
    });
    $("tCbtSubmitBtn").disabled = false;
    $("tCbtSubmitBtn").textContent = "🚀 Submit Exam to School Admin";
    return;
  }

  if (assigned.length > 0 && !assigned.includes(subject)) {
    showToast({
      type: "error",
      title: "Unauthorized Subject",
      message: `You are only authorized to upload exams for your assigned subjects: ${assigned.join(", ")}.`
    });
    $("tCbtSubmitBtn").disabled = false;
    $("tCbtSubmitBtn").textContent = "🚀 Submit Exam to School Admin";
    return;
  }
  const sClass = $("tCbtClass") ? $("tCbtClass").value.trim() : "Year 7";
  const title = ($("tCbtTitle")?.value.trim() || `${subject} ${activeCbtExamTerm}`).toUpperCase();
  const duration = parseInt($("tCbtDuration")?.value || teacherCbtDefaults.duration, 10) || 30;
  const pts = parseFloat($("tCbtPoints")?.value || teacherCbtDefaults.marksPerQuestion) || 1.5;

  $("tCbtSubmitBtn").disabled = true;
  $("tCbtSubmitBtn").textContent = "Submitting to admin...";

  try {
    const examId = generateObjectId();
    const classInfo = resolveCbtClass(sClass);
    const subjectInfo = resolveCbtSubject(subject);
    const subjectId = subjectInfo.id;
    const classId = classInfo.id;

    const formattedQuestions = teacherParsedQuestions.map(q => ({
      _id: { $oid: generateObjectId() },
      text: q.text,
      image: q.image || null,
      options: q.optionStrings,
      correctAnswer: q.correctAnswer,
      points: pts,
      test_id: { $oid: examId },
      subject: { $oid: subjectId },
      class: { $oid: classId },
      __v: 0
    }));

    const cleanUser = (teacher.username || teacher.name || "teacher").toLowerCase().replace(/[^a-z0-9]/g, "");

    const launchDate = $("tCbtLaunchDate")?.value || new Date().toISOString().slice(0, 10);
    const gateOpen = $("tCbtGateOpen")?.value || "08:00";
    const gateClose = $("tCbtGateClose")?.value || "20:00";
    const shuffle = $("tCbtShuffleToggle") ? $("tCbtShuffleToggle").checked : true;

    // When teachers set an exam, all class arms are automatically assigned.
    // Admin is the only one who can view and edit assigned arms.
    const selectedArms = (classInfo && Array.isArray(classInfo.arms)) ? [...classInfo.arms] : [];

    const subPayload = {
      examId: examId,
      title: title,
      subjectName: subject,
      subjectId: subjectId,
      className: sClass,
      classId: classId,
      termName: activeCbtExamTerm,
      duration: duration,
      teacherName: teacher.name || teacher.username,
      teacherUser: cleanUser,
      numberOfQuestions: formattedQuestions.length,
      questions: formattedQuestions,
      launchDate: launchDate,
      examDate: launchDate,
      startDate: { $date: new Date(launchDate + "T00:00:00.000Z").toISOString() },
      startTime: gateOpen,
      endTime: gateClose,
      gateOpen: gateOpen,
      gateClose: gateClose,
      shuffle: shuffle,
      selectedArms: selectedArms,
      arm: selectedArms.map(a => ({ "$oid": a })),
      createdAt: new Date().toISOString(),
      status: "Ready for Admin"
    };

    try {
      await window.dbClient.saveSubmission(examId, subPayload);
    } catch (sbErr) {
      console.error("Supabase submit error:", sbErr);
      throw sbErr;
    }

    // Clear and hide Step 3 review section so questions do not linger after submission!
    $("tCbtReviewCard").style.display = "none";
    $("tCbtQuestionsList").innerHTML = "";
    $("tCbtRawText").value = "";
    $("tCbtTitle").value = "";
    if ($("tCbtValidationStatusCard")) $("tCbtValidationStatusCard").style.display = "none";
    teacherParsedQuestions = [];
    updateTargetStatusBadge();

    // Show clean success notification banner and scroll into view
    $("tCbtSuccessTitle").textContent = `🎉 "${title}" Successfully Submitted!`;
    $("tCbtSuccessMsg").textContent = `Scheduled for Launch: ${launchDate} (${gateOpen} – ${gateClose}) · ${formattedQuestions.length} Questions. The school admin can now export this exam.`;
    $("tCbtSubmitSuccess").style.display = "block";
    $("tCbtSubmitSuccess").scrollIntoView({ behavior: "smooth", block: "center" });

    showToast({
      type: "success",
      title: "Exam Submitted Successfully!",
      message: `"${title}" with ${formattedQuestions.length} verified questions has been sent to the administrator.`
    });

    loadTeacherSubmissions();
  } catch (err) {
    showToast({
      type: "error",
      title: "Submission Error",
      message: err.message || "Failed to submit exam. Please try again."
    });
  }

  $("tCbtSubmitBtn").disabled = false;
  $("tCbtSubmitBtn").textContent = "🚀 Submit Exam to School Admin";
};

// Load previous submissions by this teacher
function renderTeacherSubmissions() {
  if (!teacherSubmissions.length) {
    $("tCbtMyExamsTbody").innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-muted)">No exams submitted yet. Parse questions above and click "Submit Exam" to send to the admin.</td></tr>`;
    return;
  }

  $("tCbtMyExamsTbody").innerHTML = teacherSubmissions.map(sub => {
    const qCount = (Array.isArray(sub.questions) && sub.questions.length > 0) ? sub.questions.length : (Number(sub.numberOfQuestions) || Number(sub.totalQuestions) || 0);
    const rawDate = sub.launchDate || sub.examDate || sub.startDate;
    let launchDisplay = "27 Oct 2026";
    if (rawDate) {
      const dStr = (typeof rawDate === "object" && rawDate.$date) ? rawDate.$date : rawDate;
      const d = new Date(dStr.includes("T") ? dStr : dStr + "T00:00:00");
      if (!isNaN(d.getTime())) launchDisplay = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    }
    const timeDisplay = `${sub.startTime || sub.gateOpen || "08:00"} - ${sub.endTime || sub.gateClose || "20:00"}`;
    const shuffleDisplay = sub.shuffle !== false ? "Shuffled" : "Sequential";

    const resolvedSubName = sub.subjectName || (typeof resolveCbtSubject === "function" ? resolveCbtSubject(sub.title || "").name : "") || "-";

    return `
      <tr>
        <td style="font-weight:600">${esc(sub.title)}</td>
        <td>${esc(resolvedSubName)}</td>
        <td>${esc(sub.className || "-")}</td>
        <td>${sub.duration || 30} mins</td>
        <td>${qCount}</td>
        <td style="font-size:12px">
          <strong style="color:var(--accent)">Launch: ${esc(launchDisplay)}</strong>
          <div style="font-size:11px;color:var(--text-muted)">${esc(timeDisplay)} &middot; ${shuffleDisplay}</div>
        </td>
        <td><span style="color:var(--status-good);font-weight:600;font-size:12px">&bull; ${esc(sub.status || "Ready")}</span></td>
        <td style="text-align:right">
          <button type="button" class="btn btn-secondary btn-sm" data-preview-teacher-exam="${esc(sub.docId)}" style="margin-right:6px">Preview &amp; Edit</button>
          <button type="button" class="btn-text" data-del-my-exam="${esc(sub.docId)}" style="color:var(--status-fail)">Delete</button>
        </td>
      </tr>
    `;
  }).join("");

  document.querySelectorAll("[data-preview-teacher-exam]").forEach(b => {
    b.onclick = () => openTeacherExamPreview(b.dataset.previewTeacherExam);
  });

  document.querySelectorAll("[data-del-my-exam]").forEach(b => {
    b.onclick = async () => {
      if (!confirm("Are you sure you want to delete this exam submission?")) return;
      try {
        try {
          await window.dbClient.deleteSubmission(b.dataset.delMyExam);
        } catch (sbErr) {
          console.error("Supabase delete error:", sbErr);
          throw sbErr;
        }
        loadTeacherSubmissions();
        showToast({
          type: "success",
          title: "Exam Deleted",
          message: "The exam submission has been deleted."
        });
      } catch (e) {
        showToast({
          type: "error",
          title: "Delete Failed",
          message: e.message || "Could not delete submission."
        });
      }
    };
  });
}

async function loadTeacherSubmissions() {
  if (!teacher) return;
  const cleanUser = (teacher.username || teacher.name || "teacher").toLowerCase().replace(/[^a-z0-9]/g, "");
  $("tCbtMyExamsTbody").innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-muted)">Loading your submissions from Supabase...</td></tr>`;

  try {
    const sbSubs = await window.dbClient.getSubmissions();
    teacherSubmissions = (sbSubs || []).filter(sub => !sub.teacherUser || sub.teacherUser === cleanUser || (sub.teacherName && sub.teacherName === teacher.name));
    teacherSubmissions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    renderTeacherSubmissions();
  } catch (err) {
    $("tCbtMyExamsTbody").innerHTML = `<tr><td colspan="8" style="text-align:center;padding:20px;color:var(--status-fail)">Failed to load submissions: ${esc(err.message)}</td></tr>`;
  }
}
$("tCbtRefreshMyExamsBtn").onclick = loadTeacherSubmissions;

// ══════════════════════════════════════════════════════════════
// TEACHER SUBMITTED EXAM PREVIEW & EDIT SYSTEM
// ══════════════════════════════════════════════════════════════
let activeTeacherPreviewSub = null;
let teacherSubmittedEditingQIdx = null;
let teacherSubmittedTempImage = undefined;
let currentTeacherSubmittedCorrectLetter = "A";

async function saveTeacherSubmittedQuestionsToCloud(msg) {
  if (!activeTeacherPreviewSub) return;
  try {
    const qCount = activeTeacherPreviewSub.questions.length;
    activeTeacherPreviewSub.numberOfQuestions = qCount;

    try {
      await window.dbClient.saveSubmission(activeTeacherPreviewSub.docId, activeTeacherPreviewSub);
    } catch (sbErr) {
      console.error("Supabase save error:", sbErr);
      throw sbErr;
    }

    activeTeacherPreviewSub.numberOfQuestions = qCount;
    const found = teacherSubmissions.find(s => s.docId === activeTeacherPreviewSub.docId);
    if (found) {
      found.questions = activeTeacherPreviewSub.questions;
      found.numberOfQuestions = qCount;
    }
    loadTeacherSubmissions();

    const notice = $("teacherPreviewNotice");
    if (notice) {
      notice.textContent = `✓ ${msg}`;
      notice.style.display = "block";
      setTimeout(() => { notice.style.display = "none"; }, 3500);
    }
  } catch (err) {
    showToast({
      type: "error",
      title: "Cloud Save Failed",
      message: err.message || "Failed to save changes to cloud."
    });
  }
}

async function openTeacherExamPreview(docId) {
  const sub = teacherSubmissions.find(s => s.docId === docId);
  if (!sub) return;
  if ((!Array.isArray(sub.questions) || !sub.questions.length) && sub.numberOfQuestions > 0) {
    if (window.dbClient && window.dbClient.getSubmission && sub.docId) {
      try {
        const full = await window.dbClient.getSubmission(sub.docId);
        if (full && Array.isArray(full.questions)) sub.questions = full.questions;
      } catch (e) {
        console.warn('Could not load questions for teacher preview:', e);
      }
    }
  }
  activeTeacherPreviewSub = sub;
  teacherSubmittedEditingQIdx = null;
  teacherSubmittedTempImage = undefined;

  $("teacherPreviewModalTitle").textContent = sub.title || "Exam Questions Preview & Edit";
  $("teacherPreviewModalFootnote").textContent = `Offline Exam ID: ${sub.examId || sub.docId}`;

  renderTeacherSubmittedPreviewQuestions();
  $("teacherExamPreviewModal").classList.add("open");
}

function renderTeacherSubmittedPreviewQuestions() {
  if (!activeTeacherPreviewSub) return;
  const questions = activeTeacherPreviewSub.questions || [];

  if ($("teacherPreviewCountDisplay")) {
    $("teacherPreviewCountDisplay").textContent = `Questions (${questions.length})`;
  }
  const resolvedSubName = activeTeacherPreviewSub.subjectName || (typeof resolveCbtSubject === "function" ? resolveCbtSubject(activeTeacherPreviewSub.title || "").name : "") || "—";
  if ($("teacherPreviewModalMeta")) {
    $("teacherPreviewModalMeta").textContent = `Subject: ${resolvedSubName} · Class: ${activeTeacherPreviewSub.className || "All"} · Duration: ${activeTeacherPreviewSub.duration || 30} mins · Total: ${questions.length} questions`;
  }

  if (questions.length === 0) {
    $("teacherPreviewQuestionsList").innerHTML = `
      <div style="text-align:center;padding:32px;color:var(--text-muted);background:var(--surface-alt);border:1px dashed var(--border);border-radius:var(--radius)">
        No questions in this exam yet. Click <strong>➕ Add Question</strong> above to create one.
      </div>
    `;
    return;
  }

  $("teacherPreviewQuestionsList").innerHTML = questions.map((q, idx) => {
    const rawOpts = Array.isArray(q.options) ? q.options : (q.optionStrings || []);
    const opts = rawOpts.map(o => (typeof o === "object" && o !== null && o.text !== undefined) ? o.text : String(o));

    if (teacherSubmittedEditingQIdx !== idx) {
      const cleanImg = getCleanImageSrc(q.image);
      const imgHtml = cleanImg ? `
        <div style="margin:8px 0;text-align:center">
          <div style="display:inline-block;background:#ffffff;border:1px solid var(--border);border-radius:6px;padding:6px;box-shadow:0 1px 3px rgba(0,0,0,0.06);text-align:center">
            <img src="${cleanImg}" alt="Question ${idx + 1} diagram" style="max-height:160px;max-width:100%;object-fit:contain;border-radius:4px;display:block;margin:0 auto;cursor:zoom-in" data-zoom-img="${cleanImg}" title="Click diagram to expand">
            <div style="font-size:10px;color:var(--text-muted);margin-top:4px;cursor:pointer" data-zoom-img="${cleanImg}">🔍 Click diagram to expand</div>
          </div>
        </div>
      ` : '';
      return `
        <div class="q-card">
          <div class="q-card-head">
            <span class="q-badge">Question ${idx + 1}</span>
            <div style="display:flex;align-items:center;gap:12px">
              <span style="font-size:12px;color:var(--text-muted)">Pts: ${q.points || 1.5}</span>
              <button type="button" class="btn-text" data-teacher-edit-q="${idx}" style="font-size:12px;color:var(--accent);font-weight:600;cursor:pointer">✏️ Edit</button>
              <button type="button" class="btn-text" data-teacher-del-q="${idx}" style="font-size:12px;color:var(--status-fail);font-weight:600;cursor:pointer">🗑️ Delete</button>
            </div>
          </div>
          <div style="font-weight:600;font-size:14px;color:var(--text);margin-bottom:8px;white-space:pre-wrap">${esc(q.text || "")}</div>
          ${imgHtml}
          <div class="q-options-grid">
            ${opts.map((opt, oIdx) => {
        const letter = String.fromCharCode(65 + oIdx);
        const isCorrect = (q.correctAnswer && opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) || (q.correctLetter === letter);
        return `
                <div class="q-option-item ${isCorrect ? 'correct' : ''}">
                  <strong style="color:${isCorrect ? 'var(--status-good)' : 'var(--text-muted)'}">${letter}.</strong>
                  <span>${esc(opt)}</span>
                  ${isCorrect ? `<span style="margin-left:auto;font-size:11px;font-weight:700">✓ CORRECT</span>` : ''}
                </div>
              `;
      }).join("")}
          </div>
        </div>
      `;
    }

    // Inline edit mode
    const currImg = teacherSubmittedTempImage !== undefined ? teacherSubmittedTempImage : q.image;
    return `
      <div class="q-card q-card-edit">
        <div class="q-card-head">
          <span class="q-badge" style="background:var(--accent);color:#fff">Editing Question ${idx + 1}</span>
          <div style="display:flex;align-items:center;gap:8px">
            <label style="font-size:12px;color:var(--text-muted);font-weight:600">Points:</label>
            <input type="number" step="0.5" id="teacherSubEditQPoints" value="${q.points || 1.5}" class="cbt-form-input" style="width:70px;padding:3px 6px;font-size:12px">
          </div>
        </div>
        <div style="margin-bottom:10px">
          <label style="font-size:12px;font-weight:600;color:var(--text);display:block;margin-bottom:4px">Question Text:</label>
          <textarea class="cbt-form-input" id="teacherSubEditQText" style="width:100%;min-height:75px;font-size:13px;line-height:1.4">${esc(q.text || "")}</textarea>
        </div>
        
        <div style="margin-bottom:12px">
          <label style="font-size:12px;font-weight:600;color:var(--text);display:block;margin-bottom:4px">Diagram / Image:</label>
          ${currImg ? `
            <div style="margin:8px 0;text-align:center">
              <div style="display:inline-block;background:#ffffff;border:1px solid var(--border);border-radius:6px;padding:6px;box-shadow:0 1px 3px rgba(0,0,0,0.06);text-align:center">
                <img src="${getCleanImageSrc(currImg)}" alt="Diagram" style="max-height:160px;max-width:100%;object-fit:contain;border-radius:4px;display:block;margin:0 auto">
                <div style="margin-top:6px;display:flex;gap:12px;justify-content:center">
                  <button type="button" class="btn-text" style="font-size:11px;color:var(--accent);font-weight:600" id="teacherSubChangeImgBtn">🔄 Change Diagram</button>
                  <button type="button" class="btn-text" style="font-size:11px;color:var(--status-fail);font-weight:600" id="teacherSubRemoveImgBtn">🗑️ Remove Diagram</button>
                </div>
              </div>
            </div>
          ` : `
            <button type="button" class="btn btn-secondary btn-sm" id="teacherSubAttachImgBtn" style="font-size:11px;padding:4px 10px;display:inline-flex;align-items:center;gap:6px">
              🖼️ Attach Diagram / Image
            </button>
          `}
        </div>

        <div style="margin-bottom:10px">
          <label style="font-size:12px;font-weight:600;color:var(--text);display:block;margin-bottom:6px">Options &amp; Correct Answer (Click "Mark as Correct" for the right answer):</label>
          <div style="display:flex;flex-direction:column;gap:8px" id="teacherSubEditOptionsList">
            ${['A', 'B', 'C', 'D'].map((letter, oIdx) => {
      const optVal = opts[oIdx] !== undefined ? opts[oIdx] : "";
      const isCorrect = currentTeacherSubmittedCorrectLetter === letter;
      return `
                <div style="display:flex;align-items:center;gap:8px">
                  <strong style="width:20px;font-size:13px;color:var(--text)">${letter}.</strong>
                  <input type="text" class="cbt-form-input teacher-sub-opt-input" data-letter="${letter}" data-opt-idx="${oIdx}" value="${esc(optVal)}" placeholder="Option ${letter}" style="flex:1;font-size:13px;padding:6px 10px">
                  <button type="button" class="btn btn-sm ${isCorrect ? 'btn-good' : 'btn-secondary'} teacher-sub-set-correct-btn" data-letter="${letter}" style="font-size:11px;padding:4px 10px;white-space:nowrap">
                    ${isCorrect ? '✓ Correct Answer' : 'Mark as Correct'}
                  </button>
                </div>
              `;
    }).join("")}
          </div>
        </div>

        <div style="margin-top:14px;display:flex;justify-content:flex-end;gap:8px">
          <button type="button" class="btn btn-secondary btn-sm" id="teacherSubCancelEditBtn">Cancel</button>
          <button type="button" class="btn btn-sm btn-primary" id="teacherSubSaveQBtn" data-save-idx="${idx}">💾 Save Question</button>
        </div>
      </div>
    `;
  }).join("");

  // Attach button events
  document.querySelectorAll("[data-teacher-edit-q]").forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.teacherEditQ, 10);
      teacherSubmittedEditingQIdx = idx;
      const q = questions[idx];
      teacherSubmittedTempImage = q.image || null;
      const rawOpts = Array.isArray(q.options) ? q.options : (q.optionStrings || []);
      const opts = rawOpts.map(o => (typeof o === "object" && o !== null && o.text !== undefined) ? o.text : String(o));
      let cLetter = q.correctLetter;
      if (!cLetter && q.correctAnswer) {
        const foundIdx = opts.findIndex(o => o.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase());
        if (foundIdx >= 0) cLetter = String.fromCharCode(65 + foundIdx);
      }
      currentTeacherSubmittedCorrectLetter = cLetter || "A";
      renderTeacherSubmittedPreviewQuestions();
    };
  });

  document.querySelectorAll("[data-teacher-del-q]").forEach(btn => {
    btn.onclick = async () => {
      const idx = parseInt(btn.dataset.teacherDelQ, 10);
      if (!confirm(`Are you sure you want to delete Question ${idx + 1}?`)) return;
      activeTeacherPreviewSub.questions.splice(idx, 1);
      if (teacherSubmittedEditingQIdx === idx) {
        teacherSubmittedEditingQIdx = null;
        teacherSubmittedTempImage = undefined;
      } else if (teacherSubmittedEditingQIdx > idx) {
        teacherSubmittedEditingQIdx--;
      }
      await saveTeacherSubmittedQuestionsToCloud(`Question ${idx + 1} deleted.`);
      renderTeacherSubmittedPreviewQuestions();
    };
  });

  if (teacherSubmittedEditingQIdx !== null) {
    document.querySelectorAll(".teacher-sub-set-correct-btn").forEach(b => {
      b.onclick = () => {
        currentTeacherSubmittedCorrectLetter = b.dataset.letter;
        document.querySelectorAll(".teacher-sub-set-correct-btn").forEach(btn => {
          const isCurr = btn.dataset.letter === currentTeacherSubmittedCorrectLetter;
          btn.className = `btn btn-sm ${isCurr ? 'btn-good' : 'btn-secondary'} teacher-sub-set-correct-btn`;
          btn.textContent = isCurr ? '✓ Correct Answer' : 'Mark as Correct';
        });
      };
    });

    const attachBtn = $("teacherSubAttachImgBtn") || $("teacherSubChangeImgBtn");
    if (attachBtn) {
      attachBtn.onclick = () => {
        let fileInput = $("teacherSubPreviewImgInput");
        if (!fileInput) {
          fileInput = document.createElement("input");
          fileInput.type = "file";
          fileInput.id = "teacherSubPreviewImgInput";
          fileInput.accept = "image/*";
          fileInput.style.display = "none";
          document.body.appendChild(fileInput);
        }
        fileInput.onchange = (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async (ev) => {
            teacherSubmittedTempImage = await optimizeImageBase64(ev.target.result, 750, 0.82);
            renderTeacherSubmittedPreviewQuestions();
          };
          reader.readAsDataURL(file);
          e.target.value = "";
        };
        fileInput.click();
      };
    }

    if ($("teacherSubRemoveImgBtn")) {
      $("teacherSubRemoveImgBtn").onclick = () => {
        teacherSubmittedTempImage = null;
        renderTeacherSubmittedPreviewQuestions();
      };
    }

    if ($("teacherSubCancelEditBtn")) {
      $("teacherSubCancelEditBtn").onclick = () => {
        teacherSubmittedEditingQIdx = null;
        teacherSubmittedTempImage = undefined;
        renderTeacherSubmittedPreviewQuestions();
      };
    }

    if ($("teacherSubSaveQBtn")) {
      $("teacherSubSaveQBtn").onclick = async () => {
        const qIdx = parseInt($("teacherSubSaveQBtn").dataset.saveIdx, 10);
        const newText = ($("teacherSubEditQText")?.value || "").trim();
        if (!newText) {
          showToast({
            type: "warning",
            title: "Question Text Required",
            message: "Question prompt text cannot be empty."
          });
          return;
        }
        const optInputs = document.querySelectorAll(".teacher-sub-opt-input");
        const newOptions = Array.from(optInputs).map(inp => (inp.value || "").trim());
        const selectedLetter = currentTeacherSubmittedCorrectLetter || "A";
        const correctIdx = ["A", "B", "C", "D"].indexOf(selectedLetter);
        const newCorrect = (correctIdx >= 0 && newOptions[correctIdx]) ? newOptions[correctIdx] : newOptions[0];
        const newPts = parseFloat($("teacherSubEditQPoints")?.value) || 1.5;

        const targetQ = activeTeacherPreviewSub.questions[qIdx];
        targetQ.text = newText;
        targetQ.options = newOptions;
        targetQ.optionStrings = newOptions;
        targetQ.correctAnswer = newCorrect;
        targetQ.correctLetter = selectedLetter;
        targetQ.points = newPts;
        if (teacherSubmittedTempImage !== undefined) {
          targetQ.image = teacherSubmittedTempImage;
        }

        const saveBtn = $("teacherSubSaveQBtn");
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";

        await saveTeacherSubmittedQuestionsToCloud(`Question ${qIdx + 1} updated and saved to cloud.`);
        teacherSubmittedEditingQIdx = null;
        teacherSubmittedTempImage = undefined;
        renderTeacherSubmittedPreviewQuestions();
      };
    }
  }

  // Lightbox click for diagrams in teacher preview
  document.querySelectorAll("[data-zoom-img]").forEach(el => {
    el.onclick = (e) => {
      e.stopPropagation();
      const src = el.dataset.zoomImg;
      if ($("cbtLightboxImg") && $("cbtImageLightboxModal")) {
        $("cbtLightboxImg").src = src;
        $("cbtImageLightboxModal").classList.add("open");
      }
    };
  });
}

if ($("teacherPreviewAddQuestionBtn")) {
  $("teacherPreviewAddQuestionBtn").onclick = () => {
    if (!activeTeacherPreviewSub) return;
    if (!Array.isArray(activeTeacherPreviewSub.questions)) {
      activeTeacherPreviewSub.questions = [];
    }
    const newQ = {
      _id: { $oid: generateObjectId() },
      text: "",
      image: null,
      options: ["", "", "", ""],
      optionStrings: ["", "", "", ""],
      correctAnswer: "",
      correctLetter: "A",
      points: 1.5,
      test_id: { $oid: activeTeacherPreviewSub.examId || activeTeacherPreviewSub.docId },
      subject: activeTeacherPreviewSub.subjectId ? { $oid: activeTeacherPreviewSub.subjectId } : null,
      class: activeTeacherPreviewSub.classId ? { $oid: activeTeacherPreviewSub.classId } : null,
      __v: 0
    };
    activeTeacherPreviewSub.questions.push(newQ);
    teacherSubmittedEditingQIdx = activeTeacherPreviewSub.questions.length - 1;
    teacherSubmittedTempImage = null;
    currentTeacherSubmittedCorrectLetter = "A";
    renderTeacherSubmittedPreviewQuestions();
  };
}

if ($("teacherPreviewModalCloseBtn")) {
  $("teacherPreviewModalCloseBtn").onclick = () => $("teacherExamPreviewModal").classList.remove("open");
}
if ($("teacherPreviewModalCloseBottomBtn")) {
  $("teacherPreviewModalCloseBottomBtn").onclick = () => $("teacherExamPreviewModal").classList.remove("open");
}
if ($("cbtLightboxCloseBtn")) {
  $("cbtLightboxCloseBtn").onclick = () => {
    if ($("cbtImageLightboxModal")) $("cbtImageLightboxModal").classList.remove("open");
  };
}
if ($("cbtImageLightboxModal")) {
  $("cbtImageLightboxModal").onclick = (e) => {
    if (e.target === $("cbtImageLightboxModal")) {
      $("cbtImageLightboxModal").classList.remove("open");
    }
  };
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Session Persistence: Auto-restore on page reload ──
async function autoRestoreTeacherSession() {
  let saved = null;
  try {
    saved = localStorage.getItem("teacher_session_v1");
  } catch (e) { }
  if (!saved) {
    document.documentElement.classList.remove("restoring-teacher-session");
    return;
  }

  let sess = null;
  try {
    sess = JSON.parse(saved);
  } catch (e) { }
  if (!sess || !sess.username) {
    document.documentElement.classList.remove("restoring-teacher-session");
    return;
  }

  const user = sess.username;
  const clean = user.toLowerCase().replace(/[^a-z0-9]/g, '');

  if ($u) $u.value = user;
  if ($p && sess.pass) $p.value = sess.pass;

  // 1. Initial immediate restore from cached session
  if (sess.teacher) {
    teacher = { ...sess.teacher, username: user };
  } else {
    teacher = TEACHERS[clean] || TEACHERS[user] || { name: user, username: user, subjects: [], classes: [] };
  }

  try {
    await loadData();
    showApp();
  } catch (e) {
    console.warn("Auto-restore loadData failed:", e);
    showApp();
  }

  // 2. Asynchronously verify credentials & permissions against Supabase
  try {
    if (window.dbClient && window.dbClient.getTeacher) {
      const fresh = await window.dbClient.getTeacher(clean);
      if (fresh) {
        const storedPw = fresh.password || "";
        if (sess.pass && storedPw && (storedPw !== sess.pass && storedPw.toLowerCase() !== sess.pass.toLowerCase())) {
          console.warn("Teacher credentials changed remotely. Revoking session.");
          doSignOut();
          return;
        }
        teacher = { ...fresh, username: user };
        sess.teacher = teacher;
        try { localStorage.setItem("teacher_session_v1", JSON.stringify(sess)); } catch (err) { }
        if ($("who")) $("who").textContent = teacher.name;
        if ($("teacherDrawerWho")) $("teacherDrawerWho").textContent = teacher.name;
        const sl = (teacher.subjects && teacher.subjects.length) ? teacher.subjects.join(", ") : "All subjects";
        const cl = (teacher.classes && teacher.classes.length) ? teacher.classes.join(", ") : "All classes";
        const al = (teacher.arms && teacher.arms.length) ? ` (${teacher.arms.join(", ")})` : "";
        const subText = `${sl} · ${cl}${al}`;
        if ($("subinfo")) $("subinfo").textContent = subText;
        if ($("teacherDrawerSubinfo")) $("teacherDrawerSubinfo").textContent = subText;
      }
    } else {
      document.documentElement.classList.remove("restoring-teacher-session");
    }
  } catch (err) {
    console.warn("Background teacher account validation error:", err);
  }
}

// Kick off auto-restore
autoRestoreTeacherSession();
