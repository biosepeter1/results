// ══════════════════════════════════════════════════════════════════════════════
// TEACHER PORTAL JAVASCRIPT
// ══════════════════════════════════════════════════════════════════════════════

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

// ── Teacher Score Conversion & Sync ─────────────────────────
const SCORE_CONVERSION_KEY = "SCORE_CONVERSION_SETTING_v1";

function getTeacherScoreConversion() {
  try { return JSON.parse(localStorage.getItem(SCORE_CONVERSION_KEY)) || null; } catch(e) { return null; }
}
function setTeacherScoreConversion(obj) {
  if (obj && obj.originalMax && obj.targetMax) localStorage.setItem(SCORE_CONVERSION_KEY, JSON.stringify(obj));
  else localStorage.removeItem(SCORE_CONVERSION_KEY);
}
function applyTeacherScoreConversion(rawScore) {
  const c = getTeacherScoreConversion();
  if (!c || !c.originalMax || !c.targetMax || c.originalMax === c.targetMax) return rawScore;
  const factor = c.targetMax / c.originalMax;
  return Math.round(rawScore * factor * 100) / 100;
}
function applyTeacherPctConversion(rawScore) {
  const c = getTeacherScoreConversion();
  if (!c || !c.originalMax || !c.targetMax) return null;
  const converted = applyTeacherScoreConversion(rawScore);
  return Math.round((converted / c.targetMax) * 100 * 10) / 10;
}
function getRowEffectivePct(r) {
  const rawScore = parseFloat(r.score) || 0;
  const conv = applyTeacherPctConversion(rawScore);
  return conv !== null ? conv : (r.pct || 0);
}
function updateTeacherConvNotice() {
  const c = getTeacherScoreConversion();
  const notice = $("teacherConvNotice");
  if (!notice) return;
  if (c && c.originalMax && c.targetMax && c.originalMax !== c.targetMax) {
    const f = (c.targetMax / c.originalMax).toFixed(3).replace(/\.?0+$/, "");
    notice.style.display = "flex";
    notice.innerHTML = `<span>⚖️</span> <span><strong>Score Scaling Active:</strong> Admin has scaled scores from <strong>/${c.originalMax}</strong> to <strong>/${c.targetMax}</strong> (multiplier ×${f}). All scores and percentages below reflect this scaling.</span>`;
  } else {
    notice.style.display = "none";
  }
}
async function syncTeacherScoreConversion(triggerRender = false) {
  const prevSetting = JSON.stringify(getTeacherScoreConversion());
  if (window.dbClient && window.dbClient.getScoreConversionCloud) {
    try {
      const cloudConv = await window.dbClient.getScoreConversionCloud();
      if (cloudConv && cloudConv.originalMax && cloudConv.targetMax && !cloudConv.disabled) {
        setTeacherScoreConversion(cloudConv);
      } else {
        setTeacherScoreConversion(null);
      }
    } catch(e) {
      console.warn("Teacher score conversion sync error:", e);
    }
  }
  updateTeacherConvNotice();
  const nextSetting = JSON.stringify(getTeacherScoreConversion());
  if ((triggerRender || prevSetting !== nextSetting) && typeof render === "function" && typeof allRows !== "undefined" && allRows.length > 0) {
    render();
  }
}

// Auto-sync scaling from admin in background and on window focus
window.addEventListener("focus", () => {
  if (typeof $app !== "undefined" && $app && $app.style.display !== "none") {
    syncTeacherScoreConversion(true);
  }
});
setInterval(() => {
  if (typeof $app !== "undefined" && $app && $app.style.display !== "none") {
    syncTeacherScoreConversion(true);
  }
}, 10000);

if ($("teacherRefreshScoresBtn")) {
  $("teacherRefreshScoresBtn").addEventListener("click", async () => {
    const btn = $("teacherRefreshScoresBtn");
    btn.textContent = "↻ Refreshing...";
    btn.disabled = true;
    try {
      if (typeof teacher !== "undefined" && teacher && teacher.username) {
        clearTeacherCache(teacher.username);
      }
      await loadData();
      render();
    } catch (e) {
      alert("Refresh error: " + e.message);
    } finally {
      btn.textContent = "↻ Refresh";
      btn.disabled = false;
    }
  });
}
let teacherParsedQuestions = [];
let teacherSubmissions = [];

const $ = id => document.getElementById(id);
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
  } catch(e) {
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

  try {
    await loadData();
    showApp();
  } catch(e) {
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
  } catch (e) {}
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
  const hasClassRestriction   = teacher.classes && teacher.classes.length > 0;

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
    allRows = cached.rows;
    showTeacherFreshness(cached.lastUpdatedText || new Date(cached.timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }), false);
    return;
  }

  // 3. Fallback: If offline, but this teacher loaded before:
  if (!isCloudAvailable && cached && Array.isArray(cached.rows) && cached.rows.length > 0) {
    allRows = cached.rows;
    showTeacherFreshness(cached.lastUpdatedText || "Earlier session", true);
    return;
  }

  // 4. Fetch latest scores from Supabase
  try {
    const rawScores = await window.dbClient.getScores();

    // If Supabase returned empty results but device has saved scores, keep device copy!
    if ((!rawScores || rawScores.length === 0) && cached && Array.isArray(cached.rows) && cached.rows.length > 0) {
      allRows = cached.rows;
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

    allRows = authorizedRows;
    const now = new Date();
    const timeStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

    // Store ONLY this teacher's authorized rows in their private cache
    if (authorizedRows.length > 0) {
      setTeacherCache(clean, {
        version: cloudVersion || now.toISOString(),
        timestamp: Date.now(),
        lastUpdatedText: timeStr,
        rows: authorizedRows
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
  const isCbt = (target === "cbt");
  const $btnScores = $("btnTeacherNavScores");
  const $btnCbt = $("btnTeacherNavCbt");
  const $paneScores = $("paneTeacherScores");
  const $paneCbt = $("paneTeacherCbt");

  if ($btnScores) $btnScores.classList.toggle("active", !isCbt);
  if ($btnCbt) $btnCbt.classList.toggle("active", isCbt);
  if ($paneScores) $paneScores.style.display = isCbt ? "none" : "block";
  if ($paneCbt) $paneCbt.style.display = isCbt ? "block" : "none";

  if (isCbt) {
    loadActiveCbtTerm();
    initTeacherCbtForm();
    loadTeacherSubmissions();
  }
}

if ($("btnTeacherNavScores")) $("btnTeacherNavScores").addEventListener("click", () => switchTeacherPortalTab("scores"));
if ($("btnTeacherNavCbt")) $("btnTeacherNavCbt").addEventListener("click", () => switchTeacherPortalTab("cbt"));

// ── Show App ──
function showApp() {
  $login.style.display = "none";
  $app.style.display = "block";
  $("who").textContent = teacher.name;
  const sl = (teacher.subjects && teacher.subjects.length) ? teacher.subjects.join(", ") : "All subjects";
  const cl = (teacher.classes && teacher.classes.length) ? teacher.classes.join(", ") : "All classes";
  const al = (teacher.arms && teacher.arms.length) ? ` (${teacher.arms.join(", ")})` : "";
  $("subinfo").textContent = `${sl} · ${cl}${al}`;
  switchTeacherPortalTab("scores");
  buildTermTabs();
}

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
document.querySelectorAll("thead th.sortable").forEach(th => {
  th.addEventListener("click", () => {
    const col = th.dataset.sort;
    if (sortCol === col) {
      sortAsc = !sortAsc;
    } else {
      sortCol = col;
      sortAsc = true;
    }
    updateSortIndicators();
    renderTableOnly();
  });
});

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
      va = applyTeacherScoreConversion(parseFloat(a.score) || 0);
      vb = applyTeacherScoreConversion(parseFloat(b.score) || 0);
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

  $("st-total").textContent = total.toLocaleString();
  $("st-students").textContent = uniq.toLocaleString();
  $("st-avg").textContent = avg + "%";
  $("st-highest").textContent = highest + "%";
  $("st-lowest").textContent = lowest + "%";
  $("rowcount").textContent = ` · ${total.toLocaleString()} record${total !== 1 ? "s" : ""}`;

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
  const p50  = rows.filter(r => getRowEffectivePct(r) >= 50 && getRowEffectivePct(r) < 60).length;
  const p60  = rows.filter(r => getRowEffectivePct(r) >= 60 && getRowEffectivePct(r) < 70).length;
  const p70  = rows.filter(r => getRowEffectivePct(r) >= 70 && getRowEffectivePct(r) < 80).length;
  const p80  = rows.filter(r => getRowEffectivePct(r) >= 80).length;

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
  const sorted = getSortedRows();
  const total = sorted.length;

  if (!total) {
    $tb.innerHTML = "";
    $empty.style.display = "block";
    $("paginationBar").style.display = "none";
    return;
  }
  $empty.style.display = "none";
  $("paginationBar").style.display = "flex";

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
    const dispScore = applyTeacherScoreConversion(rawScore);
    const convPct = applyTeacherPctConversion(rawScore);
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
    alert("No records to export."); return;
  }
  const headers = ["Subject", "Class", "Arm", "Student", "Score"];
  const csvContent = [
    headers.join(","),
    ...activeFilteredRows.map(r => {
      const rawScore = parseFloat(r.score) || 0;
      const dispScore = applyTeacherScoreConversion(rawScore);
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
  a.download = `results_${currentTerm || "export"}_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

// ── Teacher CBT Exam Upload Functions ──
function populateCbtClassArms(className) {
  const classInfo = resolveCbtClass(className);
  const armsList = classInfo.armsDetail || [];
  const armsSelect = $("tCbtArmsSelect");
  if (!armsSelect) return;

  if (!armsList.length) {
    const rawArms = classInfo.arms || [];
    armsSelect.innerHTML = rawArms.map((id, idx) => `<option value="${id}" selected>Arm ${idx + 1}</option>`).join("");
    return;
  }

  // Teacher-specific arms pre-selection if teacher has assigned cohort arms
  const teacherArms = (teacher && Array.isArray(teacher.arms) && teacher.arms.length) 
    ? teacher.arms.map(a => a.trim().toLowerCase()) 
    : [];

  armsSelect.innerHTML = armsList.map(a => {
    const isSelected = (teacherArms.length === 0) || teacherArms.includes(a.name.trim().toLowerCase());
    return `<option value="${a.id}" ${isSelected ? 'selected' : ''}>${esc(a.name)}</option>`;
  }).join("");
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
  } catch(e) {
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
  
  // Prioritize teacher's assigned subjects, with full catalog accessible
  const assigned = (teacher && Array.isArray(teacher.subjects) && teacher.subjects.length > 0)
    ? teacher.subjects.filter(s => s && s.trim())
    : [];

  const allCatalogSubjects = Object.keys(CBT_CONFIG.subjects || {}).sort((a,b) => a.localeCompare(b));
  let subjectHtml = "";
  if (assigned.length > 0) {
    subjectHtml += `<optgroup label="My Assigned Subjects">` + assigned.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join("") + `</optgroup>`;
    const otherSubs = allCatalogSubjects.filter(s => !assigned.includes(s));
    if (otherSubs.length > 0) {
      subjectHtml += `<optgroup label="Other School Subjects">` + otherSubs.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join("") + `</optgroup>`;
    }
  } else {
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
    let opt = Array.from($("tCbtSubject").options).find(o => o.value.toLowerCase() === "biology");
    if (!opt) {
      opt = document.createElement("option");
      opt.value = opt.textContent = "Biology";
      $("tCbtSubject").appendChild(opt);
    }
    $("tCbtSubject").value = opt.value;
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
$("tCbtDropZone").onclick = () => $("tCbtFileInput").click();
["dragenter","dragover"].forEach(evt => $("tCbtDropZone").addEventListener(evt, e => { e.preventDefault(); $("tCbtDropZone").classList.add("dragover"); }));
["dragleave","drop"].forEach(evt => $("tCbtDropZone").addEventListener(evt, e => { e.preventDefault(); $("tCbtDropZone").classList.remove("dragover"); }));
$("tCbtDropZone").addEventListener("drop", e => {
  const f = e.dataTransfer.files[0];
  if (f) handleTeacherFile(f);
});
if ($("tCbtBrowseFileBtn")) {
  $("tCbtBrowseFileBtn").onclick = () => $("tCbtFileInput").click();
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
    } catch(e) {
      return s;
    }
  }
  if (s.startsWith("<svg")) {
    try {
      return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(s)));
    } catch(e) {
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

  // Auto-detect subject from filename if present
  if (file && file.name) {
    const fNameLow = file.name.toLowerCase();
    if (typeof CBT_CONFIG !== "undefined" && CBT_CONFIG.subjects) {
      for (const sName of Object.keys(CBT_CONFIG.subjects)) {
        if (fNameLow.includes(sName.toLowerCase())) {
          if ($("tCbtSubject")) {
            let opt = Array.from($("tCbtSubject").options).find(o => o.value.toLowerCase() === sName.toLowerCase());
            if (!opt) {
              opt = document.createElement("option");
              opt.value = opt.textContent = sName;
              $("tCbtSubject").appendChild(opt);
            }
            $("tCbtSubject").value = opt.value;
          }
          break;
        }
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
    return;
  }

  $("tCbtQuestionCount").textContent = teacherParsedQuestions.length;
  $("tCbtReviewCard").style.display = "block";
  $("tCbtSubmitSuccess").style.display = "none";
  renderTeacherReviewQuestions();
}

$("tCbtParseBtn").onclick = parseTeacherCbtText;

let activeTargetQuestionImageIdx = null;
let teacherEditingReviewQIdx = null;
let teacherReviewTempImage = undefined;
let currentTeacherReviewCorrectLetter = "A";

function renderTeacherReviewQuestions() {
  if ($("tCbtQuestionCount")) {
    $("tCbtQuestionCount").textContent = teacherParsedQuestions.length;
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
        <div class="cbt-q-card">
          <div class="cbt-q-header">
            <span class="cbt-q-num">Question ${idx + 1}</span>
            <div style="display:flex;align-items:center;gap:12px">
              <span style="font-size:12px;color:var(--text-muted)">Pts: ${q.points || 1.5}</span>
              <button type="button" class="btn-text" data-teacher-edit-review-q="${idx}" style="font-size:12px;color:var(--accent);font-weight:600;cursor:pointer">✏️ Edit</button>
              <button type="button" class="btn-text" data-teacher-del-review-q="${idx}" style="font-size:12px;color:var(--status-fail);font-weight:600;cursor:pointer">🗑️ Delete</button>
            </div>
          </div>
          <div class="cbt-q-text" style="font-weight:600;font-size:14px;color:var(--text);margin-bottom:8px;white-space:pre-wrap">${esc(q.text)}</div>
          ${imgHtml}
          <div class="cbt-options-grid">
            ${opts.map((opt, oIdx) => {
              const letter = String.fromCharCode(65 + oIdx);
              const isCorrect = (q.correctAnswer && opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) || (q.correctLetter === letter);
              return `
                <button type="button" class="cbt-opt-btn ${isCorrect ? 'correct' : ''}" data-q-idx="${idx}" data-opt-letter="${letter}" data-opt-text="${esc(opt)}">
                  <strong>${letter}.</strong>
                  <span>${esc(opt)}</span>
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
          alert("Question text cannot be empty.");
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

// Submit Exam to Firestore for Admin
$("tCbtSubmitBtn").onclick = async () => {
  if (!teacherParsedQuestions.length) {
    if ($("tCbtRawText") && $("tCbtRawText").value.trim()) {
      parseTeacherCbtText();
    }
    if (!teacherParsedQuestions.length) {
      alert("Please upload or paste questions and click 'Parse & Review Questions' first.");
      return;
    }
  }
  const subject = $("tCbtSubject") ? $("tCbtSubject").value.trim() : "";
  if (!subject) {
    alert("Please select a subject from your assigned subjects before submitting.");
    $("tCbtSubmitBtn").disabled = false;
    $("tCbtSubmitBtn").textContent = "🚀 Submit Exam to School Admin";
    return;
  }
  const sClass = $("tCbtClass") ? $("tCbtClass").value.trim() : "Year 7";
  const title = ($("tCbtTitle")?.value.trim() || `${subject} ${activeCbtExamTerm}`).toUpperCase();
  const duration = parseInt($("tCbtDuration").value, 10) || 30;
  const pts = parseFloat($("tCbtPoints").value) || 1.5;

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

    // Get selected arms
    const armsSelect = $("tCbtArmsSelect");
    let selectedArms = [];
    if (armsSelect) {
      selectedArms = Array.from(armsSelect.selectedOptions).map(o => o.value);
    }
    if (selectedArms.length === 0 && classInfo.arms) {
      selectedArms = classInfo.arms;
    }

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
    teacherParsedQuestions = [];

    // Show clean success notification banner and scroll into view
    $("tCbtSuccessTitle").textContent = `🎉 "${title}" Successfully Submitted!`;
    $("tCbtSuccessMsg").textContent = `Scheduled for Launch: ${launchDate} (${gateOpen} – ${gateClose}) · ${formattedQuestions.length} Questions. The school admin can now export this exam.`;
    $("tCbtSubmitSuccess").style.display = "block";
    $("tCbtSubmitSuccess").scrollIntoView({ behavior: "smooth", block: "center" });

    loadTeacherSubmissions();
  } catch (err) {
    alert("Submission error: " + err.message);
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
    const qCount = Array.isArray(sub.questions) ? sub.questions.length : (sub.numberOfQuestions || 0);
    const rawDate = sub.launchDate || sub.examDate || sub.startDate;
    let launchDisplay = "27 Oct 2026";
    if (rawDate) {
      const dStr = (typeof rawDate === "object" && rawDate.$date) ? rawDate.$date : rawDate;
      const d = new Date(dStr.includes("T") ? dStr : dStr + "T00:00:00");
      if (!isNaN(d.getTime())) launchDisplay = d.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
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
      } catch (e) {
        alert("Error deleting: " + e.message);
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
    alert("Failed to save changes to cloud: " + err.message);
  }
}

function openTeacherExamPreview(docId) {
  const sub = teacherSubmissions.find(s => s.docId === docId);
  if (!sub) return;
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
          alert("Question text cannot be empty.");
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
