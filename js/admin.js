// ══════════════════════════════════════════════════════════════════════════════
// ADMINISTRATOR PORTAL JAVASCRIPT
// ══════════════════════════════════════════════════════════════════════════════

function $(id) { return document.getElementById(id); }

// ══════════════════════════════════════════════════════════
// MODERN APP TOAST NOTIFICATION SYSTEM
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
// Universal Supabase Database Engine Active
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const ADMIN_PASSWORD = "admin";

function getAdminAllSubjects() {
  if (typeof refreshTeacherCbtSubjects === "function") {
    refreshTeacherCbtSubjects();
  }
  const subSet = new Set();

  if (typeof CBT_CONFIG !== "undefined" && CBT_CONFIG.subjects) {
    Object.keys(CBT_CONFIG.subjects).forEach(s => subSet.add(s));
  }
  if (typeof DEFAULT_CBT_SUBJECTS !== "undefined") {
    Object.keys(DEFAULT_CBT_SUBJECTS).forEach(s => subSet.add(s));
  }

  // Also include any subjects that existing teachers might already have assigned
  if (typeof allTeachers !== "undefined" && Array.isArray(allTeachers)) {
    allTeachers.forEach(t => {
      if (Array.isArray(t.subjects)) {
        t.subjects.forEach(s => { if (s && s.trim()) subSet.add(s.trim()); });
      }
    });
  }

  return [...subSet].sort((a, b) => a.localeCompare(b));
}

function renderTeacherModalSubjects(selectedSubjects = []) {
  const subjects = getAdminAllSubjects();
  const selSet = new Set(selectedSubjects || []);

  const grid = $("subjectsCheckGrid");
  if (!grid) return;
  grid.innerHTML = subjects.map(s => `
    <label class="check-item"><input type="checkbox" class="sub-chk" value="${esc(s)}" ${selSet.has(s) ? 'checked' : ''}> ${esc(s)}</label>
  `).join("");
}

// ── Admin Sign In ──
function performAdminSignIn() {
  document.documentElement.classList.add("restoring-admin-session");
  $("viewLogin").style.display = "none";
  $("viewApp").style.display = "block";
  const activeTab = localStorage.getItem("admin_active_tab_v1") || "dashboard";
  initAdminAnnouncementsEvents();
  switchTab(activeTab);
  // Run teachers, live-terms, and announcements in parallel — don't block the scores tab
  Promise.all([loadTeachers(), loadLiveTerms(), loadAdminAnnouncements()]).catch(() => { });
}

$("loginForm").onsubmit = (e) => {
  e.preventDefault();
  const pw = $("adminPwInput").value.trim();
  if (pw === ADMIN_PASSWORD) {
    try {
      localStorage.setItem("admin_auth_session_v1", "true");
    } catch (err) {
      console.warn("Storage write error:", err);
    }
    performAdminSignIn();
  } else {
    $("loginErrorMsg").textContent = "Invalid administrator password.";
  }
};

$("adminSignOutBtn").onclick = () => {
  try {
    localStorage.removeItem("admin_auth_session_v1");
    localStorage.removeItem("admin_active_tab_v1");
  } catch (err) { }
  document.documentElement.classList.remove("restoring-admin-session");
  $("viewApp").style.display = "none";
  $("viewLogin").style.display = "flex";
  $("adminPwInput").value = "";
  $("loginErrorMsg").textContent = "";
};

// ── Navigation Tabs ──
function switchTab(target) {
  try {
    localStorage.setItem("admin_active_tab_v1", target);
  } catch (err) { }
  const TABS = ["dashboard", "scores", "teachers", "upload", "cbt", "notifs"];
  const BTNS = { dashboard: "tabDashboard", scores: "tabScores", teachers: "tabTeachers", upload: "tabUpload", cbt: "tabCBT", notifs: "tabNotifs" };
  const PANES = { dashboard: "paneDashboard", scores: "paneScores", teachers: "paneTeachers", upload: "paneUpload", cbt: "paneCBT", notifs: "paneNotifs" };
  TABS.forEach(t => {
    if ($(BTNS[t])) $(BTNS[t]).classList.toggle("active", t === target);
    if ($(PANES[t])) $(PANES[t]).style.display = (t === target) ? "block" : "none";
  });

  // Sync mobile drawer items
  document.querySelectorAll(".mobile-nav-item[data-tab]").forEach(el => {
    el.classList.toggle("active", el.dataset.tab === target);
  });

  // Sync mobile bottom app bar tabs
  document.querySelectorAll(".mobile-bottom-tab[data-tab]").forEach(el => {
    el.classList.toggle("active", el.dataset.tab === target);
  });

  if (target === "dashboard") renderExecutiveDashboard();
  if (target === "teachers") loadTeachers(true);
  if (target === "upload") {
    loadSavedUploadTerms();
    renderUploadTermSelector();
    loadLiveTerms();
    syncUploadTermsWithCloud();
    if (typeof loadStudentDirectoryFromCloud === "function") loadStudentDirectoryFromCloud();
    if (typeof populateAuditDropdowns === "function") populateAuditDropdowns();
  }
  if (target === "cbt") {
    loadAdminCbtActiveTerm();
    loadAdminCbtDefaults();
    loadCBTSubmissions();
    refreshCbtSubjectsCatalog();
    initCbtTermsManager();
  }
  if (target === "scores") { initConversionPanel(); loadStudentScores(); }
  if (target === "notifs") {
    populateAdminNotifSubjects();
    loadAdminAnnouncements();
  }
}
if ($("tabDashboard")) $("tabDashboard").onclick = () => switchTab("dashboard");
if ($("tabScores")) $("tabScores").onclick = () => switchTab("scores");
if ($("tabTeachers")) $("tabTeachers").onclick = () => switchTab("teachers");
if ($("tabUpload")) $("tabUpload").onclick = () => switchTab("upload");
if ($("tabCBT")) $("tabCBT").onclick = () => switchTab("cbt");
if ($("tabNotifs")) $("tabNotifs").onclick = () => switchTab("notifs");

// Mobile Drawer & Bottom Navigation Wiring
function closeAdminMobileDrawer() {
  $("adminMobileDrawer")?.classList.remove("open");
  $("adminDrawerOverlay")?.classList.remove("open");
}
function openAdminMobileDrawer() {
  $("adminMobileDrawer")?.classList.add("open");
  $("adminDrawerOverlay")?.classList.add("open");
}

if ($("adminMobileToggleBtn")) {
  $("adminMobileToggleBtn").onclick = (e) => {
    e.stopPropagation();
    openAdminMobileDrawer();
  };
}
if ($("adminDrawerCloseBtn")) {
  $("adminDrawerCloseBtn").onclick = (e) => {
    e.stopPropagation();
    closeAdminMobileDrawer();
  };
}
if ($("adminDrawerOverlay")) {
  $("adminDrawerOverlay").onclick = closeAdminMobileDrawer;
}
if ($("adminDrawerSignOutBtn")) {
  $("adminDrawerSignOutBtn").onclick = () => {
    closeAdminMobileDrawer();
    $("adminSignOutBtn")?.click();
  };
}

// Drawer items
document.querySelectorAll(".mobile-nav-item[data-tab]").forEach(btn => {
  btn.onclick = () => {
    switchTab(btn.dataset.tab);
    closeAdminMobileDrawer();
  };
});

// Mobile bottom bar tabs
document.querySelectorAll(".mobile-bottom-tab[data-tab]").forEach(btn => {
  btn.onclick = () => {
    switchTab(btn.dataset.tab);
  };
});

// ══════════════════════════════════════════════════════════
// EXECUTIVE ANALYTICS DASHBOARD (PRINCIPAL & LEADERSHIP VIEW)
// ══════════════════════════════════════════════════════════
var _dashEventsBound = false;
let dashActiveTabStudentView = "rewrite"; // "rewrite", "honor", or "missing"
let dashSubjectView = "best"; // "best"
let dashAtRiskStudents = [];
let dashHonorRollStudents = [];
let dashRewriteStudents = [];
let dashMissingStudents = [];
let dashRewriteCutoffPct = 25; // Default: <= 25% (captures 0/5 = 0%, 5/30 = 16.7%, 10/50 = 20%)
let dashSubjectStats = [];

function initDashboardEvents() {
  if (_dashEventsBound) return;
  _dashEventsBound = true;

  const tSel = $("dashFilterTerm");
  const cSel = $("dashFilterClass");
  const aSel = $("dashFilterArm");
  const sSel = $("dashFilterSubject");
  const qInput = $("dashStudentSearchInput");

  if (tSel) {
    tSel.addEventListener("change", () => {
      adminCurrentTerm = tSel.value || null;
      if (typeof updateAdminTermTabs === "function") updateAdminTermTabs();
      const convSel = document.getElementById("convTermSelect");
      if (convSel && tSel.value) {
        convSel.value = tSel.value;
        if (typeof refreshConversionUI === "function") refreshConversionUI();
      }
      renderExecutiveDashboard();
    });
  }
  if (cSel) {
    cSel.addEventListener("change", () => {
      populateDashboardArmFilter();
      renderExecutiveDashboard();
    });
  }
  if (aSel) aSel.addEventListener("change", () => renderExecutiveDashboard());
  if (sSel) sSel.addEventListener("change", () => renderExecutiveDashboard());
  if (qInput) qInput.addEventListener("input", () => renderDashboardStudentActionCenter());

  const setSubjectViewTab = (view) => {
    dashSubjectView = view;
    if ($("dashSubjectTabBest")) $("dashSubjectTabBest").classList.toggle("active", view === "best");
    if ($("dashSubjectTabNeedsSupport")) $("dashSubjectTabNeedsSupport").classList.toggle("active", view === "needs_support");
    renderDashboardSubjectRadar();
  };

  if ($("dashSubjectTabBest")) {
    $("dashSubjectTabBest").onclick = () => setSubjectViewTab("best");
  }
  if ($("dashSubjectTabNeedsSupport")) {
    $("dashSubjectTabNeedsSupport").onclick = () => setSubjectViewTab("needs_support");
  }

  // Collapsible Dropdown Accordion for Student Academic Action Center
  function toggleDashActionCenterAccordion(forceOpen) {
    const body = $("dashActionCenterCollapsibleBody");
    const card = $("dashStudentActionCenterCard");
    const btn = $("dashToggleActionCenterBtn");
    const text = $("dashActionCenterToggleText");
    if (!body) return;

    const isCurrentlyOpen = body.classList.contains("open");
    const willOpen = (typeof forceOpen === "boolean") ? forceOpen : !isCurrentlyOpen;

    if (willOpen) {
      body.classList.add("open");
      if (card) card.classList.add("cbt-accordion-open");
      if (btn) btn.classList.add("open");
      if (text) text.textContent = "Collapse Action Center";
    } else {
      body.classList.remove("open");
      if (card) card.classList.remove("cbt-accordion-open");
      if (btn) btn.classList.remove("open");
      if (text) text.textContent = "Expand Action Center";
    }
  }

  window.toggleDashActionCenterAccordion = toggleDashActionCenterAccordion;

  if ($("dashToggleActionCenterBtn")) {
    $("dashToggleActionCenterBtn").onclick = (e) => {
      e.stopPropagation();
      toggleDashActionCenterAccordion();
    };
  }

  if ($("dashActionCenterHeader")) {
    $("dashActionCenterHeader").onclick = (e) => {
      if (e.target.closest("button") || e.target.closest("input") || e.target.closest("select")) return;
      toggleDashActionCenterAccordion();
    };
  }

  const setStudentViewTab = (tab) => {
    dashActiveTabStudentView = tab;
    if ($("dashStudentsTabFail")) $("dashStudentsTabFail").classList.toggle("active", tab === "fail");
    if ($("dashStudentsTabRewrite")) $("dashStudentsTabRewrite").classList.toggle("active", tab === "rewrite");
    if ($("dashStudentsTabHonor")) $("dashStudentsTabHonor").classList.toggle("active", tab === "honor");
    if ($("dashStudentsTabMissing")) $("dashStudentsTabMissing").classList.toggle("active", tab === "missing");
    if ($("dashRewriteToolbar")) $("dashRewriteToolbar").style.display = (tab === "rewrite") ? "flex" : "none";
    if ($("dashMissingToolbar")) $("dashMissingToolbar").style.display = (tab === "missing") ? "flex" : "none";
    toggleDashActionCenterAccordion(true);
    renderDashboardStudentActionCenter();
  };

  if ($("dashStudentsTabFail")) {
    $("dashStudentsTabFail").onclick = () => setStudentViewTab("fail");
  }
  if ($("dashStudentsTabRewrite")) {
    $("dashStudentsTabRewrite").onclick = () => setStudentViewTab("rewrite");
  }
  if ($("dashStudentsTabHonor")) {
    $("dashStudentsTabHonor").onclick = () => setStudentViewTab("honor");
  }
  if ($("dashStudentsTabMissing")) {
    $("dashStudentsTabMissing").onclick = () => setStudentViewTab("missing");
  }

  const openActionCenterTab = (tab) => {
    setStudentViewTab(tab);
    toggleDashActionCenterAccordion(true);
    const card = $("dashStudentActionCenterCard");
    if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if ($("dashCardRewriteKpi")) $("dashCardRewriteKpi").onclick = () => openActionCenterTab("rewrite");
  if ($("dashCardMissingKpi")) $("dashCardMissingKpi").onclick = () => openActionCenterTab("missing");
  if ($("dashSummaryViewMissingBtn")) $("dashSummaryViewMissingBtn").onclick = () => openActionCenterTab("missing");
  if ($("dashSummaryViewRewriteBtn")) $("dashSummaryViewRewriteBtn").onclick = () => openActionCenterTab("rewrite");

  if ($("dashExportMissingBtn")) {
    $("dashExportMissingBtn").onclick = () => exportMissingStudentsCsv();
  }
  if ($("dashSummaryExportMissingBtn")) {
    $("dashSummaryExportMissingBtn").onclick = () => exportMissingStudentsCsv();
  }

  if ($("dashRewriteCutoffSelect")) {
    $("dashRewriteCutoffSelect").onchange = (e) => {
      dashRewriteCutoffPct = Number(e.target.value) || 25;
      renderExecutiveDashboard();
    };
  }

  if ($("dashExportRewriteBtn")) {
    $("dashExportRewriteBtn").onclick = () => exportRewriteRosterCsv();
  }
  if ($("dashSummaryExportRewriteBtn")) {
    $("dashSummaryExportRewriteBtn").onclick = () => exportRewriteRosterCsv();
  }

  if ($("dashRefreshBtn")) {
    $("dashRefreshBtn").onclick = async () => {
      const btn = $("dashRefreshBtn");
      btn.innerHTML = "&#8635; Refreshing...";
      btn.disabled = true;
      try {
        await loadStudentScores(true);
        renderExecutiveDashboard();
      } finally {
        btn.innerHTML = "&#8635; Refresh Data";
        btn.disabled = false;
      }
    };
  }
  if ($("dashPrintBtn")) {
    $("dashPrintBtn").onclick = () => window.print();
  }

  // Student Scorecard Modal Events
  if ($("dashStudentModalCloseBtn")) {
    $("dashStudentModalCloseBtn").onclick = () => $("dashStudentScoreModal").classList.remove("open");
  }
  if ($("dashStudentModalCloseBottomBtn")) {
    $("dashStudentModalCloseBottomBtn").onclick = () => $("dashStudentScoreModal").classList.remove("open");
  }
  if ($("dashStudentScoreModal")) {
    $("dashStudentScoreModal").onclick = (e) => {
      if (e.target === $("dashStudentScoreModal")) $("dashStudentScoreModal").classList.remove("open");
    };
  }
  if ($("dashStudentModalPrintBtn")) {
    $("dashStudentModalPrintBtn").onclick = () => {
      document.body.classList.add("printing-modal");
      window.print();
      setTimeout(() => {
        document.body.classList.remove("printing-modal");
      }, 1000);
    };
  }
}

let _dashFilterLastRowsRef = null;
let _dashFilterTermSig = "";
let _dashFilterClassSubSig = "";
let _dashFilterArmSig = "";

function syncDashboardFilterOptions() {
  if (!allScoreRows || !allScoreRows.length) return;
  const tSel = $("dashFilterTerm");
  if (!tSel) return;

  if (_dashFilterLastRowsRef !== allScoreRows) {
    _dashFilterTermSig = "";
    _dashFilterClassSubSig = "";
    _dashFilterArmSig = "";
    _dashFilterLastRowsRef = allScoreRows;
  }

  const dataSig = `${allScoreRows.length}|${allScoreRows[0]?.term || ""}|${allScoreRows[allScoreRows.length - 1]?.term || ""}`;
  if (_dashFilterTermSig !== dataSig || !tSel.options || tSel.options.length <= 1) {
    const currentTermVal = tSel.value;
    const terms = [...new Set(allScoreRows.map(r => r.term).filter(Boolean))].sort();

    tSel.innerHTML = `<option value="">All Terms (${terms.length} terms)</option>` +
      terms.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join("");

    if (currentTermVal && terms.includes(currentTermVal)) {
      tSel.value = currentTermVal;
    } else if (adminCurrentTerm && terms.includes(adminCurrentTerm)) {
      tSel.value = adminCurrentTerm;
    }
    _dashFilterTermSig = dataSig;
  }

  populateDashboardClassAndArmFilters();
}

function populateDashboardClassAndArmFilters() {
  const tSel = $("dashFilterTerm");
  const cSel = $("dashFilterClass");
  const sSel = $("dashFilterSubject");
  if (!cSel) return;

  const selectedTerm = tSel ? tSel.value : "";
  const classSubSig = `${allScoreRows.length}|${selectedTerm}`;
  if (_dashFilterClassSubSig !== classSubSig) {
    const rows = selectedTerm ? allScoreRows.filter(r => r.term === selectedTerm) : allScoreRows;

    const currentClassVal = cSel.value;
    const classes = [...new Set(rows.map(r => r.class || r.className).filter(Boolean))].sort();
    cSel.innerHTML = `<option value="">All Classes (${classes.length})</option>` +
      classes.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join("");

    if (classes.includes(currentClassVal)) cSel.value = currentClassVal;

    if (sSel) {
      const currentSub = sSel.value;
      const subjects = [...new Set(rows.map(r => r.subject).filter(Boolean))].sort();
      sSel.innerHTML = `<option value="">All Subjects (${subjects.length})</option>` +
        subjects.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join("");
      if (subjects.includes(currentSub)) sSel.value = currentSub;
    }
    _dashFilterClassSubSig = classSubSig;
  }

  populateDashboardArmFilter();
}

function populateDashboardArmFilter() {
  const tSel = $("dashFilterTerm");
  const cSel = $("dashFilterClass");
  const aSel = $("dashFilterArm");
  if (!aSel) return;

  const selectedTerm = tSel ? tSel.value : "";
  const selectedClass = cSel ? cSel.value : "";
  const armSig = `${allScoreRows.length}|${selectedTerm}|${selectedClass}`;
  if (_dashFilterArmSig === armSig) return;
  _dashFilterArmSig = armSig;

  let rows = allScoreRows || [];
  if (selectedTerm && selectedClass) {
    rows = rows.filter(r => r.term === selectedTerm && (r.class || r.className) === selectedClass);
  } else if (selectedTerm) {
    rows = rows.filter(r => r.term === selectedTerm);
  } else if (selectedClass) {
    rows = rows.filter(r => (r.class || r.className) === selectedClass);
  }

  const currentArmVal = aSel.value;
  const arms = [...new Set(rows.map(r => r.arm).filter(Boolean))].sort();
  aSel.innerHTML = `<option value="">All Arms (${arms.length || 0})</option>` +
    arms.map(a => `<option value="${esc(a)}">${esc(a)}</option>`).join("");

  if (arms.includes(currentArmVal)) aSel.value = currentArmVal;
}

function getDashboardFilteredRows() {
  const term = $("dashFilterTerm") ? $("dashFilterTerm").value : "";
  const cls = $("dashFilterClass") ? $("dashFilterClass").value : "";
  const arm = $("dashFilterArm") ? $("dashFilterArm").value : "";
  const sub = $("dashFilterSubject") ? $("dashFilterSubject").value : "";

  if (!term && !cls && !arm && !sub) return allScoreRows || [];

  return (allScoreRows || []).filter(r => {
    if (term && r.term !== term) return false;
    if (cls && (r.class || r.className) !== cls) return false;
    if (arm && (r.arm || "") !== arm) return false;
    if (sub && r.subject !== sub) return false;
    return true;
  });
}

async function renderExecutiveDashboard() {
  initDashboardEvents();

  // If score rows aren't in memory yet, load them
  if (!allScoreRows || !allScoreRows.length) {
    await loadStudentScores();
  }
  if (!_studentDirectoryLoaded && typeof loadStudentDirectoryFromCloud === "function") {
    await loadStudentDirectoryFromCloud();
  }

  syncDashboardFilterOptions();

  const rows = getDashboardFilteredRows();
  const totalAssessments = rows.length;

  const termVal = $("dashFilterTerm") ? $("dashFilterTerm").value : "";
  const classVal = $("dashFilterClass") ? $("dashFilterClass").value : "";
  const scopeSummary = `${termVal ? termVal : "All Terms"} · ${classVal ? classVal : "All Classes"} · ${totalAssessments.toLocaleString()} assessment records`;
  if ($("dashScopeSummary")) $("dashScopeSummary").textContent = scopeSummary;

  // Pass 1: Build canonical student resolver so missing reg numbers, reversed names, or punctuation variations merge cleanly
  const studentResolver = buildCanonicalStudentResolver(rows, _studentDirectory);

  // 1. Group by student to track individuals
  const studentMap = new Map();
  let passedCount = 0;
  let failedCount = 0;
  let scoreSum = 0;
  let highest = -Infinity;
  let lowest = Infinity;

  // Tiers
  let tierDist = 0; // >= 75
  let tierCredit = 0; // 60 - 74.99
  let tierPass = 0; // 50 - 59.99
  let tierFail = 0; // < 50

  // Group by Class
  const classMap = new Map();

  // Group by Subject
  const subjectMap = new Map();

  // Pre-resolve conversion settings & original max marks ONCE per term instead of per row
  const dashSelectedTerm = $("dashFilterTerm") ? $("dashFilterTerm").value : "";
  const convByTermCache = new Map();
  const origMaxByTermCache = new Map();

  rows.forEach(r => {
    // Extract raw score and original max mark
    let parsedRawScore = NaN;
    let parsedOrigMax = null;

    if (r.score !== undefined && r.score !== null && r.score !== "") {
      const str = String(r.score).trim();
      const slashIdx = str.indexOf("/");
      const ofIdx = slashIdx === -1 ? str.toLowerCase().indexOf("of") : -1;
      if (slashIdx !== -1 || ofIdx !== -1) {
        const m = str.match(/^([\d.]+)\s*(?:of|\/)\s*([\d.]+)$/i);
        if (m) {
          parsedRawScore = parseFloat(m[1]);
          parsedOrigMax = parseFloat(m[2]);
        } else {
          parsedRawScore = parseFloat(str);
        }
      } else {
        parsedRawScore = parseFloat(str);
      }
    }

    const rowTerm = r.term || dashSelectedTerm || adminCurrentTerm || "";
    let convSetting = convByTermCache.get(rowTerm);
    if (convSetting === undefined) {
      convSetting = getConversionForTerm(rowTerm) || null;
      convByTermCache.set(rowTerm, convSetting);
    }

    let termOrigMax = null;
    if (!parsedOrigMax && !convSetting) {
      termOrigMax = origMaxByTermCache.get(rowTerm);
      if (termOrigMax === undefined) {
        termOrigMax = detectOriginalMaxForTerm(allScoreRows, rowTerm) || 20;
        origMaxByTermCache.set(rowTerm, termOrigMax);
      }
    }

    const origMax = parsedOrigMax || (convSetting ? convSetting.originalMax : (termOrigMax || 20));
    const targetMax = convSetting ? convSetting.targetMax : origMax;

    // Converted / scaled score (computed inline using cached term conversion)
    let scaledScore = parsedRawScore;
    if (!isNaN(parsedRawScore) && convSetting && convSetting.originalMax && convSetting.targetMax && convSetting.originalMax !== convSetting.targetMax) {
      scaledScore = Math.round(parsedRawScore * (convSetting.targetMax / convSetting.originalMax) * 100) / 100;
    }

    // Percentage
    const rawPct = r.pct !== undefined ? parseFloat(r.pct) : NaN;
    let pctVal;
    if (!isNaN(parsedRawScore) && convSetting && convSetting.originalMax && convSetting.targetMax) {
      pctVal = Math.round((scaledScore / convSetting.targetMax) * 100 * 10) / 10;
    } else if (!isNaN(rawPct)) {
      pctVal = rawPct;
    } else if (!isNaN(parsedRawScore)) {
      pctVal = Math.round((parsedRawScore / origMax) * 100 * 10) / 10;
    } else {
      pctVal = 0;
    }
    const scoreVal = !isNaN(scaledScore) ? scaledScore : (!isNaN(parsedRawScore) ? parsedRawScore : pctVal);

    const isPass = pctVal >= 50;
    if (isPass) passedCount++; else failedCount++;
    scoreSum += pctVal;
    if (pctVal > highest) highest = pctVal;
    if (pctVal < lowest) lowest = pctVal;

    // Tiers
    if (pctVal >= 75) tierDist++;
    else if (pctVal >= 60) tierCredit++;
    else if (pctVal >= 50) tierPass++;
    else tierFail++;

    // Student Key (resolved via 2-pass identity resolver)
    const rawStudentName = (r.student || r.name || "Unknown Student").toUpperCase().trim();
    const rawRegNo = (r.reg || r.regNo || "").trim();
    const rawCls = (r.class || r.className || "-").trim();
    const rawArm = (r.arm || "-").trim();
    const resolvedProfile = studentResolver.resolveRow(rawStudentName, rawRegNo, rawCls, rawArm);
    const studentKey = resolvedProfile ? `CANON:${resolvedProfile.canonId}` : `${rawStudentName}|${rawRegNo}`;

    if (!studentMap.has(studentKey)) {
      studentMap.set(studentKey, {
        id: "stud_" + Math.random().toString(36).substr(2, 9),
        name: (resolvedProfile && resolvedProfile.name) ? resolvedProfile.name : rawStudentName,
        reg: (resolvedProfile && resolvedProfile.reg) ? resolvedProfile.reg : rawRegNo,
        class: (resolvedProfile && resolvedProfile.clsDisplay) ? resolvedProfile.clsDisplay : rawCls,
        arm: (resolvedProfile && resolvedProfile.armKey) ? resolvedProfile.armKey : rawArm,
        term: rowTerm || "-",
        scores: [],
        _scoreBySub: new Map(),
        totalPct: 0,
        failedSubjects: []
      });
    }
    const sObj = studentMap.get(studentKey);
    const subCanonKey = auditCanonicalSubject(r.subject || "General") || String(r.subject || "General").toLowerCase();
    const scoreEntry = {
      subject: r.subject || "General",
      pct: pctVal,
      score: scoreVal,
      scaledScore: scoreVal,
      rawScore: parsedRawScore,
      origScoreText: r.score,
      maxMark: targetMax,
      origMax: origMax,
      term: rowTerm,
      date: r.date || r.dateTime || r.exam_date || "-"
    };
    const existingSubScore = sObj._scoreBySub.get(subCanonKey);
    if (!existingSubScore || pctVal > existingSubScore.pct) {
      sObj._scoreBySub.set(subCanonKey, scoreEntry);
    }

    // Class aggregation
    const clsKey = (r.class || r.className || "Unassigned").trim();
    if (!classMap.has(clsKey)) {
      classMap.set(clsKey, { className: clsKey, students: new Set(), totalScores: 0, passes: 0, fails: 0, scoreSum: 0 });
    }
    const cObj = classMap.get(clsKey);
    cObj.students.add(studentKey);
    cObj.totalScores++;
    cObj.scoreSum += pctVal;
    if (isPass) cObj.passes++; else cObj.fails++;

    // Subject aggregation
    const subKey = (r.subject || "General").trim();
    if (!subjectMap.has(subKey)) {
      subjectMap.set(subKey, { subject: subKey, total: 0, passes: 0, fails: 0, scoreSum: 0 });
    }
    const subObj = subjectMap.get(subKey);
    subObj.total++;
    subObj.scoreSum += pctVal;
    if (isPass) subObj.passes++; else subObj.fails++;
  });

  const uniqueStudents = studentMap.size;
  const passRate = totalAssessments ? ((passedCount / totalAssessments) * 100).toFixed(1) : "0.0";
  const avgScore = totalAssessments ? (scoreSum / totalAssessments).toFixed(1) : "0.0";

  // Calculate student averages & separate At-Risk vs Honor Roll vs Rewrite
  dashAtRiskStudents = [];
  dashHonorRollStudents = [];
  dashRewriteStudents = [];
  let totalRewritePapers = 0;

  studentMap.forEach(s => {
    if (s._scoreBySub) {
      s.scores = Array.from(s._scoreBySub.values());
      delete s._scoreBySub;
      s.totalPct = s.scores.reduce((acc, sc) => acc + sc.pct, 0);
      s.failedSubjects = s.scores.filter(sc => sc.pct < 50);
    }
    s.avgScore = s.scores.length ? (s.totalPct / s.scores.length).toFixed(1) : 0;
    // Rewrite criteria: any subject score <= dashRewriteCutoffPct (e.g. 0/5 = 0%, 5/30 = 16.7%, 10/50 = 20%)
    s.rewriteSubjects = s.scores.filter(sc => sc.pct <= dashRewriteCutoffPct);
    if (s.rewriteSubjects.length > 0) {
      dashRewriteStudents.push(s);
      totalRewritePapers += s.rewriteSubjects.length;
    }

    if (s.failedSubjects.length > 0) {
      dashAtRiskStudents.push(s);
    } else if (s.avgScore >= 70 && s.scores.length >= 2) {
      dashHonorRollStudents.push(s);
    }
  });

  // Sort Rewrite: most rewrite subjects first, then lowest average
  dashRewriteStudents.sort((a, b) => b.rewriteSubjects.length - a.rewriteSubjects.length || a.avgScore - b.avgScore);

  // Sort At-Risk: most failures first, then lowest average
  dashAtRiskStudents.sort((a, b) => b.failedSubjects.length - a.failedSubjects.length || a.avgScore - b.avgScore);

  // Sort Honor Roll: highest average first
  dashHonorRollStudents.sort((a, b) => b.avgScore - a.avgScore);

  dashStudentByIdMap = new Map();
  studentMap.forEach(s => {
    dashStudentByIdMap.set(s.id, s);
  });

  // ── 2. Update KPI Cards ──
  if ($("dashMetricTotalStudents")) $("dashMetricTotalStudents").textContent = uniqueStudents.toLocaleString();
  if ($("dashMetricTotalAssessments")) $("dashMetricTotalAssessments").textContent = `${totalAssessments.toLocaleString()} evaluated exam scores`;

  if ($("dashMetricPassRate")) {
    $("dashMetricPassRate").textContent = `${passRate}%`;
    $("dashMetricPassRate").style.color = Number(passRate) >= 70 ? "#10b981" : (Number(passRate) >= 50 ? "#f59e0b" : "#ef4444");
  }

  if ($("dashMetricPassedCount")) $("dashMetricPassedCount").textContent = passedCount.toLocaleString();
  if ($("dashMetricPassedPct")) $("dashMetricPassedPct").textContent = `${passRate}% pass achievement`;

  if ($("dashMetricFailedCount")) $("dashMetricFailedCount").textContent = failedCount.toLocaleString();
  if ($("dashMetricAtRiskStudents")) $("dashMetricAtRiskStudents").textContent = `${dashAtRiskStudents.length.toLocaleString()} student${dashAtRiskStudents.length !== 1 ? "s" : ""} failed 1+ subject`;

  if ($("dashMetricRewriteCount")) $("dashMetricRewriteCount").textContent = dashRewriteStudents.length.toLocaleString();
  if ($("dashMetricRewriteSub")) $("dashMetricRewriteSub").textContent = `${totalRewritePapers.toLocaleString()} paper${totalRewritePapers !== 1 ? 's' : ''} (≤${dashRewriteCutoffPct}%)`;

  if ($("dashMetricAvgScore")) $("dashMetricAvgScore").textContent = `${avgScore}%`;
  if ($("dashMetricHighestLowest")) {
    const highStr = highest !== -Infinity ? `${highest}%` : "-";
    const lowStr = lowest !== Infinity ? `${lowest}%` : "-";
    $("dashMetricHighestLowest").textContent = `Highest: ${highStr} · Lowest: ${lowStr}`;
  }

  // ── Missing Students Calculation (Official Curriculum + Choice Groups + Master Directory) ──
  try {
    dashMissingStudents = [];
    const selectedDashClass = ($("dashFilterClass") ? $("dashFilterClass").value : "").trim();
    const selectedDashArm = ($("dashFilterArm") ? $("dashFilterArm").value : "").trim();
    const selectedDashSubj = ($("dashFilterSubject") ? $("dashFilterSubject").value : "").trim();
    const dashFilterTermRaw = ($("dashFilterTerm") ? $("dashFilterTerm").value : "").trim();
    const selectedDashTerm = dashFilterTermRaw || (adminCurrentTerm || "");

    const targetTermNorm = normalizeTermKey(selectedDashTerm);
    const canReuseFilteredRows = (!selectedDashClass && !selectedDashArm && !selectedDashSubj && (
      !selectedDashTerm || (dashFilterTermRaw && rows.length > 0)
    ));
    let termRows;
    if (!selectedDashTerm) {
      termRows = allScoreRows || [];
    } else if (dashFilterTermRaw && !selectedDashClass && !selectedDashArm && !selectedDashSubj && !rows.some(r => !r.term)) {
      // Exact term matches rows, just also include any blank-term / variant-term rows quickly if present
      termRows = (allScoreRows || []).filter(r => {
        if (!r.term || r.term === selectedDashTerm) return true;
        return normalizeTermKey(r.term) === targetTermNorm;
      });
    } else {
      termRows = (allScoreRows || []).filter(r => {
        if (!r.term || r.term === selectedDashTerm) return true;
        return normalizeTermKey(r.term) === targetTermNorm;
      });
    }

    // Build lookup of subjects actually administered per class level in this term,
    // plus an auto-detected fallback curriculum for classes not in SCHOOL_CLASS_CURRICULUM.
    const classTotalStudents = new Map();       // clsKey -> Set(studentKey)
    const classSubjectStudents = new Map();     // `${clsKey}|${subCanon}` -> Set(studentKey)
    const administeredCanonByClass = new Map(); // clsKey -> Set(subCanon)
    const classSubjectDisplay = new Map();      // `${clsKey}|${subCanon}` -> displayName
    const studentWrittenMap = new Map();        // identityKey -> Set(subCanon)

    const canReuseResolver = (termRows.length === rows.length && !selectedDashClass && !selectedDashArm && !selectedDashSubj);
    const termResolver = canReuseResolver ? studentResolver : buildCanonicalStudentResolver(termRows, _studentDirectory);
    const activeArmsByClass = new Map(); // clsKey -> Set(armLow)

    termRows.forEach(r => {
      const clsRaw = (r.class || r.className || "").trim();
      const subRaw = (r.subject || "").trim();
      if (!clsRaw || !subRaw) return;
      const clsKey = normalizeAuditClassKey(clsRaw);
      const armLow = String(r.arm || "").trim().toLowerCase();
      if (armLow) {
        if (!activeArmsByClass.has(clsKey)) activeArmsByClass.set(clsKey, new Set());
        activeArmsByClass.get(clsKey).add(armLow);
      }
      const subCanon = auditCanonicalSubject(subRaw);
      if (!subCanon) return;

      if (!administeredCanonByClass.has(clsKey)) administeredCanonByClass.set(clsKey, new Set());
      administeredCanonByClass.get(clsKey).add(subCanon);
      const csKey = `${clsKey}|${subCanon}`;
      if (!classSubjectDisplay.has(csKey)) classSubjectDisplay.set(csKey, subRaw);

      const resolved = termResolver.resolveRow(r.student || r.name, r.reg || r.regNo, clsRaw, r.arm);
      const stId = resolved ? `C:${resolved.canonId}` : (compactAuditRegKey(r.reg) || `${normalizeAuditNameKey(r.student)}|${clsKey}`);
      if (stId) {
        if (!classTotalStudents.has(clsKey)) classTotalStudents.set(clsKey, new Set());
        classTotalStudents.get(clsKey).add(stId);
        if (!classSubjectStudents.has(csKey)) classSubjectStudents.set(csKey, new Set());
        classSubjectStudents.get(csKey).add(stId);
      }

      if (resolved) {
        const cidKey = `CID:${resolved.canonId}`;
        if (!studentWrittenMap.has(cidKey)) studentWrittenMap.set(cidKey, new Set());
        studentWrittenMap.get(cidKey).add(subCanon);
      }
      indexStudentWrittenSubject(studentWrittenMap, r.reg, r.student, clsKey, subCanon);
    });

    // Auto-detected core fallback map (used only for classes without an explicit SCHOOL_CLASS_CURRICULUM entry)
    const fallbackCurriculumMap = new Map();
    administeredCanonByClass.forEach((canonSubs, clsKey) => {
      const totalInClass = classTotalStudents.get(clsKey)?.size || 0;
      const qualifying = [];
      canonSubs.forEach(subCanon => {
        const displayName = classSubjectDisplay.get(`${clsKey}|${subCanon}`) || subCanon;
        if (selectedDashSubj) {
          if (subCanon === auditCanonicalSubject(selectedDashSubj)) {
            qualifying.push(displayName);
          }
        } else {
          const count = classSubjectStudents.get(`${clsKey}|${subCanon}`)?.size || 0;
          // Require >= 70% participation so optional/elective subjects aren't flagged as missing core exams
          if (count >= Math.max(3, Math.floor(totalInClass * 0.70))) {
            qualifying.push(displayName);
          }
        }
      });
      fallbackCurriculumMap.set(clsKey, qualifying);
    });

    // Build student cohort: active Master Directory students + any active test-takers in termRows
    const targetClsKey = selectedDashClass ? normalizeAuditClassKey(selectedDashClass) : "";
    const targetArmLow = selectedDashArm.toLowerCase();
    const cohort = [];
    const seenCohortKeys = new Set();

    const addCohortStudent = (student) => {
      if (auditIsWithdrawnStudent(student.reg, student.name)) return;
      const clsKey = normalizeAuditClassKey(student.class);
      const resolved = termResolver.resolveRow(student.name, student.reg, student.class, student.arm);
      const dedupCanon = resolved ? `CID:${resolved.canonId}` : "";
      const regC = normalizeStudentRegForKey(student.reg);
      const nameT = sortedAuditNameTokens(student.name);
      const dedupReg = regC ? `R:${regC}` : "";
      const dedupName = nameT ? `N:${nameT}|${clsKey}` : "";
      if ((dedupCanon && seenCohortKeys.has(dedupCanon)) || (dedupReg && seenCohortKeys.has(dedupReg)) || (dedupName && seenCohortKeys.has(dedupName))) return;
      if (dedupCanon) seenCohortKeys.add(dedupCanon);
      if (dedupReg) seenCohortKeys.add(dedupReg);
      if (dedupName) seenCohortKeys.add(dedupName);
      cohort.push({
        id: (resolved && resolved.reg) || student.id,
        name: (resolved && resolved.name) || student.name,
        reg: (resolved && resolved.reg) || student.reg || "",
        class: (resolved && resolved.clsDisplay) || student.class,
        arm: (resolved && resolved.armKey) || student.arm || "",
        _clsKey: clsKey,
        _canonId: resolved ? resolved.canonId : null
      });
    };

    if (_studentDirectory && _studentDirectory.length > 0) {
      const dirHasArms = _studentDirectory.some(s => (s.arm || "").trim() !== "");
      _studentDirectory.forEach(s => {
        const statusLow = (s.status || "").trim().toLowerCase();
        if (statusLow === "inactive" || statusLow === "withdrawn") return;
        const sClsKey = normalizeAuditClassKey(s.class);
        if (targetClsKey && sClsKey !== targetClsKey) return;
        const sArmLow = (s.arm || "").trim().toLowerCase();
        if (targetArmLow && dirHasArms && sArmLow !== targetArmLow) return;
        // When viewing All Arms, only audit arms that actually participated in this term
        const clsActiveArms = activeArmsByClass.get(sClsKey);
        if (!targetArmLow && dirHasArms && clsActiveArms && clsActiveArms.size > 0 && sArmLow && !clsActiveArms.has(sArmLow)) {
          return;
        }
        addCohortStudent({
          id: s.reg || s.fullName,
          name: s.fullName,
          reg: s.reg || "",
          class: s.class,
          arm: s.arm || ""
        });
      });
    }

    termRows.forEach(r => {
      const rCls = (r.class || r.className || "").trim();
      const rClsKey = normalizeAuditClassKey(rCls);
      const rArm = (r.arm || "").trim();
      if (targetClsKey && rClsKey !== targetClsKey) return;
      if (targetArmLow && rArm.toLowerCase() !== targetArmLow) return;
      const stName = (r.student || r.name || "").trim();
      const stReg = (r.reg || "").trim();
      if (!stName && !stReg) return;
      addCohortStudent({
        id: stReg || stName,
        name: stName || stReg,
        reg: stReg,
        class: rCls,
        arm: rArm
      });
    });

    const targetSubCanon = selectedDashSubj ? auditCanonicalSubject(selectedDashSubj) : "";
    const curConfigMap = (typeof SCHOOL_CLASS_CURRICULUM !== "undefined") ? SCHOOL_CLASS_CURRICULUM : {};

    cohort.forEach(st => {
      const clsKey = st._clsKey;
      const administered = administeredCanonByClass.get(clsKey);
      if (!administered || !administered.size) return;

      const written = getStudentWrittenSubjects(studentWrittenMap, st.reg, st.name, clsKey);
      if (st._canonId !== null && st._canonId !== undefined) {
        const cidSubs = studentWrittenMap.get(`CID:${st._canonId}`);
        if (cidSubs) cidSubs.forEach(s => written.add(s));
      }
      const missingSubjs = [];
      const explicitCurr = curConfigMap[clsKey];
      const totalInClass = classTotalStudents.get(clsKey)?.size || 0;
      const isExpectedInTerm = (canon) => {
        if (!administered.has(canon)) return false;
        if (totalInClass < 10) return true;
        const cnt = classSubjectStudents.get(`${clsKey}|${canon}`)?.size || 0;
        return cnt >= Math.max(3, Math.floor(totalInClass * 0.20));
      };

      if (explicitCurr) {
        if (targetSubCanon) {
          const isCore = explicitCurr.core.some(c => auditCanonicalSubject(c) === targetSubCanon);
          if (isCore) {
            if (!written.has(targetSubCanon)) missingSubjs.push(selectedDashSubj);
          } else {
            const group = (explicitCurr.choiceGroups || []).find(g =>
              g.options.some(opt => auditCanonicalSubject(opt) === targetSubCanon)
            );
            if (group) {
              const satAnyOption = group.options.some(opt => written.has(auditCanonicalSubject(opt)));
              if (!satAnyOption) missingSubjs.push(selectedDashSubj);
            }
          }
        } else {
          explicitCurr.core.forEach(coreSub => {
            const coreCanon = auditCanonicalSubject(coreSub);
            if (isExpectedInTerm(coreCanon) && !written.has(coreCanon)) {
              missingSubjs.push(coreSub);
            }
          });

          (explicitCurr.choiceGroups || []).forEach(group => {
            const activeOptions = group.options.filter(opt => isExpectedInTerm(auditCanonicalSubject(opt)));
            if (!activeOptions.length) return;
            const satAnyOption = group.options.some(opt => written.has(auditCanonicalSubject(opt)));
            if (!satAnyOption) {
              missingSubjs.push(activeOptions.length === 1 ? activeOptions[0] : group.label);
            }
          });
        }
      } else {
        const expectedFallback = fallbackCurriculumMap.get(clsKey) || [];
        expectedFallback.forEach(sub => {
          if (!written.has(auditCanonicalSubject(sub))) {
            missingSubjs.push(sub);
          }
        });
      }

      if (missingSubjs.length > 0) {
        dashMissingStudents.push({
          ...st,
          missingSubjects: missingSubjs,
          missingCount: missingSubjs.length
        });
      }
    });

    dashMissingStudents.sort((a, b) => b.missingCount - a.missingCount || a.name.localeCompare(b.name));

    if ($("dashMetricMissingCount")) $("dashMetricMissingCount").textContent = dashMissingStudents.length.toLocaleString();
    if ($("dashMetricMissingSub")) $("dashMetricMissingSub").textContent = `${dashMissingStudents.length.toLocaleString()} student${dashMissingStudents.length !== 1 ? 's' : ''} missing exam`;
    if ($("dashBadgeMissingCount")) $("dashBadgeMissingCount").textContent = dashMissingStudents.length.toLocaleString();
  } catch (err) {
    console.warn("Missing students audit error:", err);
  }

  // ── 3. Update Performance Tiers ──
  if ($("dashTierTotalLabel")) $("dashTierTotalLabel").textContent = `${totalAssessments.toLocaleString()} Scores Analyzed`;

  const pDist = totalAssessments ? Math.round((tierDist / totalAssessments) * 100) : 0;
  const pCredit = totalAssessments ? Math.round((tierCredit / totalAssessments) * 100) : 0;
  const pPass = totalAssessments ? Math.round((tierPass / totalAssessments) * 100) : 0;
  const pFail = totalAssessments ? Math.round((tierFail / totalAssessments) * 100) : 0;

  if ($("dashTierBarDist")) $("dashTierBarDist").style.width = `${pDist}%`;
  if ($("dashTierBarCredit")) $("dashTierBarCredit").style.width = `${pCredit}%`;
  if ($("dashTierBarPass")) $("dashTierBarPass").style.width = `${pPass}%`;
  if ($("dashTierBarFail")) $("dashTierBarFail").style.width = `${pFail}%`;

  if ($("dashTierCountDist")) $("dashTierCountDist").textContent = tierDist.toLocaleString();
  if ($("dashTierPctDist")) $("dashTierPctDist").textContent = `${pDist}% of scores`;

  if ($("dashTierCountCredit")) $("dashTierCountCredit").textContent = tierCredit.toLocaleString();
  if ($("dashTierPctCredit")) $("dashTierPctCredit").textContent = `${pCredit}% of scores`;

  if ($("dashTierCountPass")) $("dashTierCountPass").textContent = tierPass.toLocaleString();
  if ($("dashTierPctPass")) $("dashTierPctPass").textContent = `${pPass}% of scores`;

  if ($("dashTierCountFail")) $("dashTierCountFail").textContent = tierFail.toLocaleString();
  if ($("dashTierPctFail")) $("dashTierPctFail").textContent = `${pFail}% of scores`;

  // ── 4 & 5. Render Smart Two-Column Summaries (Missing Results & Mandatory Rewrites) ──
  renderDashboardMissingSummary();
  renderDashboardRewriteSummary();

  // ── 6. Render Student Action Center ──
  if ($("dashBadgeFailCount")) $("dashBadgeFailCount").textContent = dashAtRiskStudents.length.toLocaleString();
  if ($("dashBadgeRewriteCount")) $("dashBadgeRewriteCount").textContent = dashRewriteStudents.length.toLocaleString();
  if ($("dashBadgeHonorCount")) $("dashBadgeHonorCount").textContent = dashHonorRollStudents.length.toLocaleString();

  renderDashboardStudentActionCenter();
}

function buildActionSummaryStats(students, getSubNamesFn) {
  const byClass = new Map();
  const bySubject = new Map();
  let totalPapers = 0;

  (students || []).forEach(st => {
    const subs = getSubNamesFn(st) || [];
    const paperCount = subs.length;
    totalPapers += paperCount;

    const cls = (st.class || "Unassigned").trim();
    if (!byClass.has(cls)) byClass.set(cls, { className: cls, students: 0, papers: 0 });
    const cObj = byClass.get(cls);
    cObj.students++;
    cObj.papers += paperCount;

    subs.forEach(subName => {
      const sub = (subName || "General").trim();
      bySubject.set(sub, (bySubject.get(sub) || 0) + 1);
    });
  });

  const classList = Array.from(byClass.values()).sort((a, b) => a.className.localeCompare(b.className));
  const subjectList = Array.from(bySubject.entries())
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count || a.subject.localeCompare(b.subject));

  return { totalStudents: (students || []).length, totalPapers, classList, subjectList };
}

function renderSummaryEmptyCard(title, message) {
  return `
    <div style="text-align:center;padding:28px 16px;background:var(--surface-alt);border-radius:var(--radius);border:1px solid rgba(16,185,129,0.28);">
      <div style="width:40px;height:40px;border-radius:50%;background:rgba(16,185,129,0.14);color:#10b981;display:inline-flex;align-items:center;justify-content:center;margin-bottom:10px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div style="font-weight:700;font-size:14px;color:#10b981;margin-bottom:4px;">${esc(title)}</div>
      <div style="font-size:12px;color:var(--text-muted);max-width:340px;margin:0 auto;line-height:1.45;">${esc(message)}</div>
    </div>
  `;
}

function renderSummaryInsightAndClasses(insightHtml, classList, accentColor, accentBg, paperLabel) {
  const chipsHtml = classList.map(c => `
    <div class="dash-summary-class-chip" style="border-left:3px solid ${accentColor};">
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">${esc(c.className)}</div>
      <div style="font-size:17px;font-weight:800;color:${accentColor};line-height:1.2;margin-top:2px;">${c.students.toLocaleString()}</div>
      <div style="font-size:11px;color:var(--text-muted);margin-top:1px;">${c.papers.toLocaleString()} ${paperLabel}${c.papers !== 1 ? "s" : ""}</div>
    </div>
  `).join("");

  return `
    <div style="padding:9px 12px;border-radius:var(--radius);background:${accentBg};border:1px solid ${accentColor}40;font-size:12px;color:var(--text);line-height:1.45;">
      ${insightHtml}
    </div>
    <div class="dash-summary-class-chips">${chipsHtml}</div>
  `;
}

function renderSummarySubjectBars(subjectList, sectionTitle, barColor, unitSingular) {
  if (!subjectList.length) return "";
  const topSubjects = subjectList.slice(0, 4);
  const maxVal = topSubjects[0].count || 1;
  const rows = topSubjects.map(item => {
    const pct = Math.max(6, Math.round((item.count / maxVal) * 100));
    return `
      <div style="display:flex;flex-direction:column;gap:3px;min-width:0;">
        <div class="dash-summary-bar-row">
          <span class="dash-summary-bar-label">${esc(item.subject)}</span>
          <span style="color:${barColor};font-weight:700;flex-shrink:0;font-variant-numeric:tabular-nums;">${item.count.toLocaleString()} ${unitSingular}${item.count !== 1 ? "s" : ""}</span>
        </div>
        <div class="dash-summary-bar-track">
          <div style="height:100%;width:${pct}%;background:${barColor};border-radius:4px;"></div>
        </div>
      </div>
    `;
  }).join("");

  return `
    <div style="padding:10px 12px;background:var(--surface-alt);border-radius:var(--radius);border:1px solid var(--border-subtle);display:flex;flex-direction:column;gap:8px;min-width:0;">
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.04em;">${esc(sectionTitle)}</div>
      ${rows}
    </div>
  `;
}

function renderDashboardMissingSummary() {
  const container = $("dashMissingSummaryBody");
  const badge = $("dashSummaryMissingBadge");
  const listBtn = $("dashSummaryViewMissingBtn");
  const list = dashMissingStudents || [];

  if (badge) badge.textContent = `${list.length.toLocaleString()} Student${list.length !== 1 ? "s" : ""}`;
  if (listBtn) listBtn.innerHTML = `<span>View Full Missing List (${list.length.toLocaleString()})</span> &rarr;`;
  if (!container) return;

  if (!list.length) {
    container.innerHTML = renderSummaryEmptyCard(
      "All Expected Exams Completed",
      "Every active student in this analytical scope has a recorded score for every expected subject."
    );
    return;
  }

  const stats = buildActionSummaryStats(list, st => st.missingSubjects || []);
  const topCls = [...stats.classList].sort((a, b) => b.students - a.students)[0];
  const topSub = stats.subjectList[0];
  const insight = `<strong>${stats.totalStudents.toLocaleString()} student${stats.totalStudents !== 1 ? "s" : ""}</strong> have <strong>${stats.totalPapers.toLocaleString()}</strong> unwritten exam${stats.totalPapers !== 1 ? "s" : ""}` +
    (topCls ? ` — highest in <strong>${esc(topCls.className)}</strong> (${topCls.students})` : "") +
    (topSub ? `, mostly <strong>${esc(topSub.subject)}</strong> (${topSub.count}).` : ".");

  const previewHtml = list.slice(0, 4).map(st => {
    const subs = st.missingSubjects || [];
    const chips = subs.slice(0, 2).map(sub =>
      `<span class="dash-summary-chip" style="background:rgba(234,179,8,0.14);color:#eab308;border:1px solid rgba(234,179,8,0.3);">${esc(sub)}</span>`
    ).join("");
    const extraChip = subs.length > 2
      ? `<span class="dash-summary-chip" style="background:var(--border-subtle);color:var(--text-muted);font-weight:700;">+${subs.length - 2} more</span>`
      : "";
    return `
      <div class="dash-summary-preview-row">
        <div class="dash-summary-student-info">
          <div class="dash-summary-student-name">${esc(st.name)}</div>
          <div class="dash-summary-student-meta">${esc(st.class || "-")}${st.arm ? ` · ${esc(st.arm)}` : ""}${st.reg ? ` · ${esc(st.reg)}` : ""}</div>
        </div>
        <div class="dash-summary-chips">${chips}${extraChip}</div>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    ${renderSummaryInsightAndClasses(insight, stats.classList, "#eab308", "rgba(234,179,8,0.09)", "missing exam")}
    ${renderSummarySubjectBars(stats.subjectList, "Most Missed Subjects", "#eab308", "student")}
    <div style="display:flex;flex-direction:column;gap:6px;min-width:0;">
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.04em;">Top Affected Students</div>
      ${previewHtml}
    </div>
  `;
}

function renderDashboardRewriteSummary() {
  const container = $("dashRewriteSummaryBody");
  const badge = $("dashSummaryRewriteBadge");
  const subTitle = $("dashSummaryRewriteSubTitle");
  const listBtn = $("dashSummaryViewRewriteBtn");
  const list = dashRewriteStudents || [];

  const totalPapers = list.reduce((acc, st) => acc + ((st.rewriteSubjects || []).length), 0);
  if (subTitle) subTitle.textContent = `Students scoring ≤${dashRewriteCutoffPct}% requiring mandatory exam resit.`;
  if (badge) badge.textContent = `${list.length.toLocaleString()} Student${list.length !== 1 ? "s" : ""} · ${totalPapers.toLocaleString()} Paper${totalPapers !== 1 ? "s" : ""}`;
  if (listBtn) listBtn.innerHTML = `<span>View Full Rewrite List (${list.length.toLocaleString()})</span> &rarr;`;
  if (!container) return;

  if (!list.length) {
    container.innerHTML = renderSummaryEmptyCard(
      "Zero Mandatory Rewrites",
      `No evaluated scores fall at or below the ≤${dashRewriteCutoffPct}% rewrite cutoff under this filter.`
    );
    return;
  }

  const stats = buildActionSummaryStats(list, st => (st.rewriteSubjects || []).map(r => r.subject));
  const topCls = [...stats.classList].sort((a, b) => b.students - a.students)[0];
  const topSub = stats.subjectList[0];
  const insight = `<strong>${stats.totalStudents.toLocaleString()} student${stats.totalStudents !== 1 ? "s" : ""}</strong> scored &le;${dashRewriteCutoffPct}% across <strong>${stats.totalPapers.toLocaleString()} paper${stats.totalPapers !== 1 ? "s" : ""}</strong>` +
    (topCls ? ` — highest in <strong>${esc(topCls.className)}</strong> (${topCls.students})` : "") +
    (topSub ? `, led by <strong>${esc(topSub.subject)}</strong> (${topSub.count} papers).` : ".");

  const previewHtml = list.slice(0, 4).map(st => {
    const subs = st.rewriteSubjects || [];
    const chips = subs.slice(0, 2).map(rSub => {
      const maxMark = rSub.maxMark || 20;
      const scVal = (rSub.scaledScore !== undefined && !isNaN(rSub.scaledScore)) ? rSub.scaledScore : rSub.pct;
      return `<span class="dash-summary-chip" style="background:rgba(245,158,11,0.15);color:#f59e0b;font-weight:700;border:1px solid rgba(245,158,11,0.35);">${esc(rSub.subject)}: ${scVal}/${maxMark} (${rSub.pct}%)</span>`;
    }).join("");
    const extraChip = subs.length > 2
      ? `<span class="dash-summary-chip" style="background:var(--border-subtle);color:var(--text-muted);font-weight:700;">+${subs.length - 2} more</span>`
      : "";
    return `
      <div class="dash-summary-preview-row" onclick="window.openStudentScoreModal('${st.id}', true);" title="Click to view Resit Slip"
        style="cursor:pointer;transition:background 0.15s;">
        <div class="dash-summary-student-info">
          <div class="dash-summary-student-name">${esc(st.name)}</div>
          <div class="dash-summary-student-meta">${esc(st.class || "-")}${st.arm ? ` · ${esc(st.arm)}` : ""} · Avg: <strong style="color:#ef4444;">${st.avgScore}%</strong></div>
        </div>
        <div class="dash-summary-chips">${chips}${extraChip}</div>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    ${renderSummaryInsightAndClasses(insight, stats.classList, "#f59e0b", "rgba(245,158,11,0.09)", "paper")}
    ${renderSummarySubjectBars(stats.subjectList, "Subjects With Most Rewrites", "#f59e0b", "paper")}
    <div style="display:flex;flex-direction:column;gap:6px;min-width:0;">
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.04em;">Priority Students (Click for Resit Slip)</div>
      ${previewHtml}
    </div>
  `;
}

let dashStudentByIdMap = new Map();

window.toggleDashStudentDrawer = function (studentId) {
  window.openStudentScoreModal(studentId);
};

window.openStudentScoreModal = function (studentId, isResit = false) {
  const s = dashStudentByIdMap.get(studentId);
  if (!s) return;

  const schoolHdr = $("dashModalSchoolHeader");
  const docTitle = $("dashModalDocTitle");
  const resitNotice = $("dashModalResitNotice");
  const sigBlock = $("dashModalPrintSignatures");
  const issueDate = $("dashModalIssueDate");
  const modalPrintBtn = $("dashStudentModalPrintBtn");

  if (issueDate) issueDate.textContent = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  if (isResit) {
    if ($("dashStudentModalName")) $("dashStudentModalName").textContent = `Examination Resit Authorization: ${s.name}`;
    if (docTitle) docTitle.textContent = "OFFICIAL EXAMINATION RESIT & REWRITE AUTHORIZATION SLIP";
    if (resitNotice) resitNotice.style.display = "block";
    if (sigBlock) sigBlock.style.display = "block";
    if (schoolHdr) schoolHdr.style.display = "block";
    if (modalPrintBtn) modalPrintBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:5px;"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>Print Resit Authorization Slip`;
  } else {
    if ($("dashStudentModalName")) $("dashStudentModalName").textContent = `Student Academic Scorecard: ${s.name}`;
    if (docTitle) docTitle.textContent = "OFFICIAL STUDENT ACADEMIC RECORD";
    if (resitNotice) resitNotice.style.display = "none";
    if (sigBlock) sigBlock.style.display = "none";
    if (schoolHdr) schoolHdr.style.display = "block";
    if (modalPrintBtn) modalPrintBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:5px;"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>Print Student Result Slip`;
  }

  const dashScopeTerm = $("dashFilterTerm") ? $("dashFilterTerm").value : "";
  if ($("dashStudentModalMeta")) $("dashStudentModalMeta").textContent = `${s.class} · ${s.arm} | Reg: ${s.reg || "N/A"} | Term: ${s.term || dashScopeTerm || adminCurrentTerm || "All Terms"}`;
  if ($("dashStudentModalAvg")) {
    $("dashStudentModalAvg").textContent = `${s.avgScore}%`;
    $("dashStudentModalAvg").style.color = s.avgScore >= 50 ? "#10b981" : "#ef4444";
  }

  if ($("dashStudentModalTotalSubjects")) $("dashStudentModalTotalSubjects").textContent = s.scores.length;
  if ($("dashStudentModalPassed")) $("dashStudentModalPassed").textContent = s.scores.length - s.failedSubjects.length;
  if ($("dashStudentModalFailed")) $("dashStudentModalFailed").textContent = s.failedSubjects.length;

  const tbody = $("dashStudentModalTbody");
  if (tbody) {
    tbody.innerHTML = s.scores.map((sc, i) => {
      const isP = sc.pct >= 50;
      const isRewrite = sc.pct <= dashRewriteCutoffPct;
      let grade = "F";
      let remark = "Fail";
      if (sc.pct >= 75) { grade = "A"; remark = "Distinction"; }
      else if (sc.pct >= 60) { grade = "B"; remark = "Credit"; }
      else if (sc.pct >= 50) { grade = "C"; remark = "Pass"; }
      else if (isRewrite) { grade = "F"; remark = "Mandatory Rewrite"; }

      const rowBg = (isResit && isRewrite) ? "background:rgba(245,158,11,0.08);" : "";

      return `
        <tr style="border-bottom:1px solid var(--border-subtle); ${rowBg}">
          <td style="padding:10px 8px;font-weight:600;color:var(--text-subtle);">${i + 1}</td>
          <td style="padding:10px 8px;font-weight:600;color:var(--text);">
            ${esc(sc.subject)}
            ${isRewrite ? `<span style="font-size:10px;padding:2px 6px;margin-left:6px;border-radius:3px;background:#f59e0b;color:#fff;font-weight:700;letter-spacing:0.02em;">REWRITE</span>` : ""}
          </td>
          <td style="padding:10px 8px;text-align:center;font-weight:600;">
            ${sc.scaledScore !== undefined && !isNaN(sc.scaledScore) ? `${sc.scaledScore} of ${sc.maxMark || 20}` : esc(sc.score !== undefined ? sc.score : "-")}
            ${(sc.origMax && sc.maxMark && sc.maxMark !== sc.origMax && !isNaN(sc.rawScore)) ? `<div style="font-size:10px;color:var(--text-muted);font-weight:normal;">(raw: ${sc.rawScore} of ${sc.origMax})</div>` : ""}
          </td>
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

  if ($("dashStudentScoreModal")) $("dashStudentScoreModal").classList.add("open");
};

window.openStudentResitSlip = function (studentId) {
  window.openStudentScoreModal(studentId, true);
};

function exportMissingStudentsCsv() {
  if (!dashMissingStudents || !dashMissingStudents.length) {
    showToast({
      type: "info",
      title: "No Missing Candidates",
      message: "There are no students with missing exam results under the current scope."
    });
    return;
  }

  const dashExportTerm = ($("dashFilterTerm") ? $("dashFilterTerm").value : "") || adminCurrentTerm || "Academic Term";
  const headers = ["#", "Student Full Name", "Registration Number", "Class", "Arm", "Missing / Unwritten Subject(s)", "Status"];
  const rows = [headers.map(h => `"${h}"`).join(",")];

  dashMissingStudents.forEach((s, idx) => {
    rows.push([
      idx + 1,
      s.name || "",
      s.reg || "",
      s.class || "",
      s.arm || "",
      (s.missingSubjects || []).join("; "),
      "Not Sat / Missing"
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
  });

  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  const termSlug = dashExportTerm.replace(/[^a-zA-Z0-9]/g, "_");
  a.download = `absentee_missing_students_${termSlug}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

function exportRewriteRosterCsv() {
  if (!dashRewriteStudents || !dashRewriteStudents.length) {
    showToast({
      type: "warning",
      title: "No Rewrite Students",
      message: "No students currently require rewrite under the selected cutoff (≤" + dashRewriteCutoffPct + "%)."
    });
    return;
  }

  const dashExportTerm = $("dashFilterTerm") ? $("dashFilterTerm").value : "";
  const activeTerm = dashExportTerm || (dashRewriteStudents[0] && dashRewriteStudents[0].term) || adminCurrentTerm || "Current Academic Term";
  const conv = getConversionForTerm(activeTerm);
  const scalingDesc = conv ? `Scaled /${conv.targetMax} from /${conv.originalMax} (Multiplier: ×${(conv.targetMax / conv.originalMax).toFixed(2).replace(/\.00$/, "")})` : "Raw Scores (No scaling configured)";
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const dateFile = now.toISOString().slice(0, 10);
  const termSlug = activeTerm.replace(/[^a-zA-Z0-9]/g, "_");

  let totalPapers = 0;
  dashRewriteStudents.forEach(s => {
    totalPapers += (s.rewriteSubjects || []).length;
  });

  const rowsPdf = [];

  dashRewriteStudents.forEach((s, idx) => {
    const sn = idx + 1;
    const rewriteList = s.rewriteSubjects || [];
    const paperCount = rewriteList.length;
    const paperCountLabel = `${paperCount} Paper${paperCount === 1 ? '' : 's'}`;

    // PDF Grouped Subject List (Clean responsive items)
    const pdfSubjectListHtml = rewriteList.map(rSub => {
      const maxMark = rSub.maxMark || getAdminSubjectMaxMark(rSub, s.term || activeTerm) || 20;
      const scaledVal = (rSub.scaledScore !== undefined && !isNaN(rSub.scaledScore))
        ? rSub.scaledScore
        : (rSub.score !== undefined ? rSub.score : rSub.pct);
      const rawVal = (rSub.rawScore !== undefined && !isNaN(rSub.rawScore))
        ? rSub.rawScore
        : scaledVal;
      const rawMax = rSub.origMax || (conv ? conv.originalMax : 20);
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

    const altClass = (sn % 2 === 0) ? "row-alt" : "";

    rowsPdf.push(`
      <tr class="${altClass}">
        <td class="cell-center" style="font-weight:700;color:#64748b;">${sn}</td>
        <td class="cell-left cell-bold" style="font-size:11.5px;color:#0f172a;">${esc(s.name || "")}</td>
        <td class="cell-center" style="font-family:Consolas,monospace;color:#475569;font-size:10.5px;">${esc(s.reg || "N/A")}</td>
        <td class="cell-center" style="font-weight:600;">${esc(s.class || "-")}</td>
        <td class="cell-center" style="font-weight:600;">${esc(s.arm || "-")}</td>
        <td class="cell-center"><span class="paper-badge">${paperCountLabel}</span></td>
        <td class="cell-left" style="padding:6px 10px;">
          <div class="sub-group-container">
            ${pdfSubjectListHtml}
          </div>
        </td>
        <td class="cell-center"><span class="status-badge">MANDATORY REWRITE</span></td>
      </tr>
    `);
  });

  const docTitle = `Official_Resit_Report_${termSlug}_cutoff${dashRewriteCutoffPct}pct_${dateFile}`;

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
      <button class="btn-action btn-secondary" onclick="window.close();" style="padding:9px 14px;">✕ Close</button>
    </div>
  </div>

  <div class="report-page-container">
    <div class="header-banner">
      <div class="school-name">HONEYLAND ACADEMIC PORTAL — EXECUTIVE EXAMINATION SYSTEM</div>
      <div class="report-heading">OFFICIAL STUDENT EXAMINATION RESIT &amp; ACADEMIC INTERVENTION ROSTER</div>
      <div class="report-sub">Confidential Record for Class Teachers, Subject HODs &amp; Examination Board</div>
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
        <span class="meta-v">Score ≤ ${dashRewriteCutoffPct}% (Mandatory Retake)</span>
      </div>
      <div class="meta-item">
        <span class="meta-k">Score Conversion</span>
        <span class="meta-v">${esc(scalingDesc)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-k">Identified Students</span>
        <span class="meta-v">${dashRewriteStudents.length} Students Flagged</span>
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
      <b>Institutional Policy Directive:</b> Students recorded in this roster scored at or below the institutional resit threshold of <b>${dashRewriteCutoffPct}%</b>. Teachers and subject coordinators are instructed to administer targeted remedial instruction prior to conducting the formal re-examination.
    </div>

    <div class="signature-section">
      <div class="signature-grid">
        <div>
          <div style="height:45px;"></div>
          <div class="sig-line">Subject Department / HOD</div>
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
    message: `Generated official PDF report with ${dashRewriteStudents.length} students. Choose 'Save as PDF' to save.`
  });
}

function renderDashboardStudentActionCenter() {
  const tbody = $("dashStudentsTableBody");
  const thead = $("dashStudentsTableHead");
  const query = ($("dashStudentSearchInput") ? $("dashStudentSearchInput").value : "").trim().toLowerCase();
  if (!tbody) return;

  const isFailTab = (dashActiveTabStudentView === "fail");
  const isRewriteTab = (dashActiveTabStudentView === "rewrite");
  const isMissingTab = (dashActiveTabStudentView === "missing");

  // Update Table Header accordingly
  if (thead) {
    if (isMissingTab) {
      thead.innerHTML = `
        <tr>
          <th style="width:36px;text-align:center;">#</th>
          <th>STUDENT NAME</th>
          <th>REG NUMBER</th>
          <th>CLASS &amp; ARM</th>
          <th>UNWRITTEN / MISSING SUBJECT(S)</th>
          <th style="text-align:center;">STATUS</th>
        </tr>
      `;
    } else if (isRewriteTab) {
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
    } else if (isFailTab) {
      thead.innerHTML = `
        <tr>
          <th style="width:36px;">#</th>
          <th>STUDENT NAME</th>
          <th>REG NUMBER</th>
          <th>CLASS &amp; ARM</th>
          <th>FAILED SUBJECTS</th>
          <th style="text-align:center;">AVG SCORE</th>
        </tr>
      `;
    } else {
      thead.innerHTML = `
        <tr>
          <th style="width:36px;">RANK</th>
          <th>STUDENT NAME</th>
          <th>REG NUMBER</th>
          <th>CLASS &amp; ARM</th>
          <th style="text-align:center;">ASSESSMENTS</th>
          <th style="text-align:center;">OVERALL AVERAGE</th>
        </tr>
      `;
    }
  }

  const rawList = isMissingTab ? dashMissingStudents : (isRewriteTab ? dashRewriteStudents : (isFailTab ? dashAtRiskStudents : dashHonorRollStudents));
  const filteredList = rawList.filter(s => {
    if (!query) return true;
    return (s.name || "").toLowerCase().includes(query) ||
      (s.reg || "").toLowerCase().includes(query) ||
      (s.class || "").toLowerCase().includes(query) ||
      (s.arm || "").toLowerCase().includes(query);
  });

  if (!filteredList.length) {
    const emptyMsg = isMissingTab ?
      "✅ All students in the selected class and analytical scope have completed their examinations!" :
      (isRewriteTab ?
        `No students currently require rewrite under the selected cutoff (≤${dashRewriteCutoffPct}%).` :
        (isFailTab ?
          "Zero failing grades recorded in the selected analytical scope." :
          "No honor roll students found matching the selected scope."));
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted);">${emptyMsg}</td></tr>`;
    return;
  }

  const rowsHtml = [];
  filteredList.slice(0, 60).forEach((s, idx) => {
    const dashCenterTerm = $("dashFilterTerm") ? $("dashFilterTerm").value : "";
    const studentEffTerm = s.term || dashCenterTerm || adminCurrentTerm;

    if (isMissingTab) {
      const missingBadges = (s.missingSubjects || []).map(sub => `
        <span style="display:inline-flex; align-items:center; gap:5px; margin:2px 4px 2px 0; padding:4px 9px; border-radius:4px; background:rgba(234,179,8,0.15); color:#d97706; font-size:11px; font-weight:700; border:1px solid rgba(234,179,8,0.35);">
          <span>${esc(sub)}</span>
        </span>
      `).join("");

      rowsHtml.push(`
        <tr class="dash-student-row" style="transition:background 0.15s; border-bottom:1px solid var(--border-subtle);">
          <td style="padding:10px 8px;font-weight:700;color:var(--text-subtle);text-align:center;">${idx + 1}</td>
          <td style="padding:10px 8px;font-weight:600;color:var(--text);">${esc(s.name)}</td>
          <td style="padding:10px 8px;font-family:monospace;font-size:12px;color:var(--text-muted);">${esc(s.reg || "-")}</td>
          <td style="padding:10px 8px;">${esc(s.class || "-")}${s.arm ? ` · ${esc(s.arm)}` : ""}</td>
          <td style="padding:10px 8px;">${missingBadges || '<span style="color:var(--text-muted);font-size:12px;">None</span>'}</td>
          <td style="padding:10px 8px;text-align:center;">
            <span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:12px;background:rgba(234,179,8,0.15);color:#d97706;font-size:11.5px;font-weight:700;">
              <span style="width:6px;height:6px;border-radius:50%;background:#d97706;"></span>
              Not Sat
            </span>
          </td>
        </tr>
      `);
      return;
    }

    if (isRewriteTab) {
      const rewriteBadges = s.rewriteSubjects.map(rSub => {
        const maxMark = rSub.maxMark || getAdminSubjectMaxMark(rSub, studentEffTerm) || 20;
        const curScore = (rSub.scaledScore !== undefined && !isNaN(rSub.scaledScore))
          ? rSub.scaledScore
          : (rSub.score !== undefined ? rSub.score : rSub.pct);
        const scoreDisplay = `${curScore} of ${maxMark} (${rSub.pct}%)`;
        const hasConversion = rSub.origMax && maxMark !== rSub.origMax;
        const titleTip = hasConversion
          ? `Scaled: ${curScore}/${maxMark} (Original raw: ${rSub.rawScore}/${rSub.origMax})`
          : `Score: ${curScore}/${maxMark}`;

        return `
          <span onclick="event.stopPropagation(); window.openStudentScoreModal('${s.id}');" 
            title="${esc(titleTip)} — Click to view official report slip" 
            style="cursor:pointer; display:inline-flex; align-items:center; gap:5px; margin:2px 4px 2px 0; padding:4px 9px; border-radius:4px; background:rgba(245,158,11,0.18); color:#d97706; font-size:11px; font-weight:700; border:1px solid rgba(245,158,11,0.45); transition:transform 0.15s, background 0.15s;">
            <span>${esc(rSub.subject)}</span>
            <strong style="background:rgba(245,158,11,0.3); padding:1px 6px; border-radius:3px; color:#b45309;">${scoreDisplay}</strong>
          </span>
        `;
      }).join("");

      // Main Student Row for Rewrite
      rowsHtml.push(`
        <tr class="dash-student-row" onclick="window.openStudentScoreModal('${s.id}')" style="cursor:pointer; transition:background 0.15s; border-bottom:1px solid var(--border-subtle);" title="Click to view official report slip">
          <td style="padding:10px 8px;font-weight:700;color:var(--text-subtle);">${idx + 1}</td>
          <td style="padding:10px 8px;font-weight:600;color:var(--text);">${esc(s.name)}</td>
          <td style="padding:10px 8px;font-family:monospace;font-size:12px;color:var(--text-muted);">${esc(s.reg || "-")}</td>
          <td style="padding:10px 8px;">${esc(s.class)} · ${esc(s.arm)}</td>
          <td style="padding:10px 8px;">${rewriteBadges}</td>
          <td style="padding:10px 8px;text-align:center;font-weight:700;color:#ef4444;">${s.avgScore}%</td>
        </tr>
      `);
    } else if (isFailTab) {
      const failBadges = s.failedSubjects.map(f => {
        const maxMark = f.maxMark || getAdminSubjectMaxMark(f, studentEffTerm) || 20;
        const curScore = (f.scaledScore !== undefined && !isNaN(f.scaledScore))
          ? f.scaledScore
          : (f.score !== undefined ? f.score : f.pct);
        const scoreDisplay = `${curScore} of ${maxMark} (${f.pct}%)`;
        const isRewrite = f.pct <= dashRewriteCutoffPct;
        const hasConversion = f.origMax && maxMark !== f.origMax;
        const titleTip = hasConversion
          ? `Scaled: ${curScore}/${maxMark} (Original raw: ${f.rawScore}/${f.origMax})`
          : `Score: ${curScore}/${maxMark}`;

        return `
          <span onclick="event.stopPropagation(); window.openStudentScoreModal('${s.id}');" 
            title="${esc(titleTip)} — Click to view official report slip" 
            style="cursor:pointer; display:inline-flex; align-items:center; gap:5px; margin:2px 4px 2px 0; padding:3px 8px; border-radius:4px; background:${isRewrite ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.12)'}; color:${isRewrite ? '#d97706' : '#ef4444'}; font-size:11px; font-weight:600; border:1px solid ${isRewrite ? 'rgba(245,158,11,0.35)' : 'rgba(239,68,68,0.25)'}; transition:transform 0.15s, background 0.15s;">
            <span>${esc(f.subject)}</span>
            <strong style="background:${isRewrite ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.22)'}; padding:1px 5px; border-radius:3px;">${scoreDisplay}</strong>
            ${isRewrite ? `<span style="font-size:9px;background:#f59e0b;color:#fff;padding:1px 4px;border-radius:2px;font-weight:700;">REWRITE</span>` : ''}
          </span>
        `;
      }).join("");

      // Main Student Row
      rowsHtml.push(`
        <tr class="dash-student-row" onclick="window.openStudentScoreModal('${s.id}')" style="cursor:pointer; transition:background 0.15s; border-bottom:1px solid var(--border-subtle);" title="Click to view official report slip">
          <td style="padding:10px 8px;font-weight:700;color:var(--text-subtle);">${idx + 1}</td>
          <td style="padding:10px 8px;font-weight:600;color:var(--text);">${esc(s.name)}</td>
          <td style="padding:10px 8px;font-family:monospace;font-size:12px;color:var(--text-muted);">${esc(s.reg || "-")}</td>
          <td style="padding:10px 8px;">${esc(s.class)} · ${esc(s.arm)}</td>
          <td style="padding:10px 8px;">${failBadges}</td>
          <td style="padding:10px 8px;text-align:center;font-weight:700;color:#ef4444;">${s.avgScore}%</td>
        </tr>
      `);
    } else {
      // Honor Roll
      const rankBadge = idx === 0
        ? `<span style="display:inline-block;padding:2px 7px;border-radius:4px;background:#fef3c7;color:#b45309;font-size:11px;font-weight:800;border:1px solid rgba(245,158,11,0.3);">1ST</span>`
        : (idx === 1
          ? `<span style="display:inline-block;padding:2px 7px;border-radius:4px;background:#f1f5f9;color:#475569;font-size:11px;font-weight:800;border:1px solid #cbd5e1;">2ND</span>`
          : (idx === 2
            ? `<span style="display:inline-block;padding:2px 7px;border-radius:4px;background:#ffedd5;color:#9a3412;font-size:11px;font-weight:800;border:1px solid rgba(249,115,22,0.3);">3RD</span>`
            : `<span style="color:var(--text-muted);font-weight:600;">#${idx + 1}</span>`));
      rowsHtml.push(`
        <tr class="dash-student-row" onclick="window.openStudentScoreModal('${s.id}')" style="cursor:pointer; transition:background 0.15s; border-bottom:1px solid var(--border-subtle);" title="Click to view official report slip">
          <td style="padding:10px 8px;font-weight:700;color:var(--accent);">${rankBadge}</td>
          <td style="padding:10px 8px;font-weight:600;color:var(--text);">${esc(s.name)}</td>
          <td style="padding:10px 8px;font-family:monospace;font-size:12px;color:var(--text-muted);">${esc(s.reg || "-")}</td>
          <td style="padding:10px 8px;">${esc(s.class)} · ${esc(s.arm)}</td>
          <td style="padding:10px 8px;text-align:center;font-variant-numeric:tabular-nums;">${s.scores.length} subjects</td>
          <td style="padding:10px 8px;text-align:center;font-weight:700;color:#10b981;font-size:14px;">${s.avgScore}%</td>
        </tr>
      `);
    }
  });

  tbody.innerHTML = rowsHtml.join("");
}

// ══════════════════════════════════════════════════════════
// TEACHER MANAGEMENT
// ══════════════════════════════════════════════════════════
let allTeachers = [];
let teachersCurrentPage = 1;
let teachersPerPage = 15;
let teachersFiltered = [];

// Populate Subject Checkboxes in Modal
renderTeacherModalSubjects([]);

$("btnSelectAllSubjects").onclick = () => document.querySelectorAll(".sub-chk").forEach(c => c.checked = true);
$("btnClearAllSubjects").onclick = () => document.querySelectorAll(".sub-chk").forEach(c => c.checked = false);

$("chkAllClasses").onchange = (e) => {
  document.querySelectorAll(".cls-chk").forEach(c => c.checked = e.target.checked);
};

const TEACHERS_CACHE_KEY = "school_exam_teachers_cache_v2";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24-Hour Smart Cache

function getCachedTeachers() {
  try {
    const raw = localStorage.getItem(TEACHERS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.teachers) ? parsed.teachers : null);
      if (list && list.length > 0) {
        return {
          timestamp: parsed.timestamp || Date.now(),
          teachers: list
        };
      }
    }
  } catch (e) { }
  return null;
}

function setCachedTeachers(teachers) {
  try {
    localStorage.setItem(TEACHERS_CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      teachers
    }));
    // Clean up legacy caches to ensure deleted accounts cannot resurrect
    localStorage.removeItem("school_exam_teachers_cache");
    localStorage.removeItem("school_exam_teachers_backup");
    localStorage.removeItem("admin_teachers_cache");
  } catch (e) { }
}

async function loadTeachers(force = false) {
  const cached = getCachedTeachers();

  // 1. Immediately display cached teachers so the table has zero loading delay
  if (cached && cached.teachers && cached.teachers.length > 0 && !allTeachers.length) {
    allTeachers = cached.teachers;
    $("teacherCountBadge").textContent = allTeachers.length;
    renderTeachersTable();
  }

  // 2. If not forced and refreshed less than 15 seconds ago, use cache
  const isVeryRecent = cached && (Date.now() - cached.timestamp < 15 * 1000);
  if (!force && isVeryRecent && allTeachers.length > 0) {
    return;
  }

  // 3. Fetch latest live teachers from Supabase
  try {
    let fresh = await window.dbClient.getTeachers();
    if (!fresh || fresh.length === 0) {
      if (window.dbClient.seedDefaultTeachers) {
        fresh = await window.dbClient.seedDefaultTeachers();
      }
    }
    if (!Array.isArray(fresh)) fresh = [];

    fresh.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    allTeachers = fresh;
    if ($("teacherCountBadge")) $("teacherCountBadge").textContent = allTeachers.length;
    if (allTeachers.length > 0) {
      setCachedTeachers(allTeachers);
    }
    renderTeachersTable();
  } catch (e) {
    console.warn("loadTeachers network warning:", e);
    // Quota or network fallback: keep using cached teachers!
    if (cached && cached.teachers.length > 0) {
      allTeachers = cached.teachers;
      $("teacherCountBadge").textContent = allTeachers.length;
      renderTeachersTable();
    } else if (!allTeachers.length) {
      $("teachersTbody").innerHTML = `<tr><td colspan="6" style="color:var(--status-fail);text-align:center;padding:24px">Failed to load teachers: ${esc(e.message)}</td></tr>`;
    }
  }
}

function renderTeachersTable() {
  const q = ($("teacherSearchInput").value || "").trim().toLowerCase();
  teachersFiltered = allTeachers.filter(t => {
    if (!q) return true;
    const n = (t.name || "").toLowerCase();
    const u = (t.username || "").toLowerCase();
    const subs = (t.subjects || []).join(" ").toLowerCase();
    const cls = (t.classes || []).join(" ").toLowerCase();
    const arms = (t.arms || []).join(" ").toLowerCase();
    return n.includes(q) || u.includes(q) || subs.includes(q) || cls.includes(q) || arms.includes(q);
  });

  const total = teachersFiltered.length;
  const totalPages = Math.max(1, Math.ceil(total / teachersPerPage));
  if (teachersCurrentPage > totalPages) teachersCurrentPage = totalPages;
  if (teachersCurrentPage < 1) teachersCurrentPage = 1;

  if (!total) {
    $("teachersTbody").innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted)">No teachers match the current search filter.</td></tr>`;
    $("teachersPaginationInfo").textContent = "Showing 0 to 0 of 0 teachers";
    renderTeachersPaginationControls(1, 1);
    return;
  }

  const startIdx = (teachersCurrentPage - 1) * teachersPerPage;
  const endIdx = Math.min(startIdx + teachersPerPage, total);
  const pageTeachers = teachersFiltered.slice(startIdx, endIdx);

  $("teachersPaginationInfo").textContent = `Showing ${(startIdx + 1).toLocaleString()} to ${endIdx.toLocaleString()} of ${total.toLocaleString()} teachers`;

  $("teachersTbody").innerHTML = pageTeachers.map(t => {
    const subsHtml = (t.subjects && t.subjects.length)
      ? t.subjects.map(s => `<span class="text-tag">${esc(s)}</span>`).join(" ")
      : `<span class="text-tag text-tag-all">All Subjects</span>`;

    const classStr = (t.classes && t.classes.length) ? t.classes.join(", ") : "All Classes";
    const armStr = (t.arms && t.arms.length) ? ` (${t.arms.join(", ")})` : "";
    const classHtml = `<span class="text-tag">${esc(classStr + armStr)}</span>`;

    return `
      <tr>
        <td data-label="Teacher Name" style="font-weight:600">${esc(t.name || "—")}</td>
        <td data-label="Username" style="color:var(--text-muted);font-size:13px">${esc(t.username || t.id)}</td>
        <td data-label="Password"><span class="mono-code">${esc(t.password || "")}</span></td>
        <td data-label="Subjects" style="max-width:300px;white-space:normal">${subsHtml}</td>
        <td data-label="Classes & Arms" style="white-space:normal">${classHtml}</td>
        <td data-label="Actions" style="text-align:right;white-space:nowrap">
          <button type="button" class="btn btn-secondary btn-sm" data-edit="${esc(t.id)}" style="margin-right:6px">Edit</button>
          <button type="button" class="btn btn-danger btn-sm" data-del="${esc(t.id)}">Delete</button>
        </td>
      </tr>
    `;
  }).join("");

  document.querySelectorAll("[data-edit]").forEach(btn => {
    btn.onclick = () => openEditTeacherModal(btn.dataset.edit);
  });
  document.querySelectorAll("[data-del]").forEach(btn => {
    btn.onclick = () => deleteTeacher(btn.dataset.del);
  });

  renderTeachersPaginationControls(teachersCurrentPage, totalPages);
}

function renderTeachersPaginationControls(cur, totalPages) {
  $("teachersFirstPageBtn").disabled = (cur <= 1);
  $("teachersPrevPageBtn").disabled = (cur <= 1);
  $("teachersNextPageBtn").disabled = (cur >= totalPages);
  $("teachersLastPageBtn").disabled = (cur >= totalPages);

  const maxButtons = 5;
  let start = Math.max(1, cur - Math.floor(maxButtons / 2));
  let end = Math.min(totalPages, start + maxButtons - 1);
  if (end - start + 1 < maxButtons) {
    start = Math.max(1, end - maxButtons + 1);
  }

  const btnHtml = [];
  for (let p = start; p <= end; p++) {
    btnHtml.push(`
      <button type="button" class="page-btn ${p === cur ? 'active' : ''}" data-goto-teacher-page="${p}">${p}</button>
    `);
  }
  $("teachersPageButtonsGroup").innerHTML = btnHtml.join("");

  document.querySelectorAll("[data-goto-teacher-page]").forEach(b => {
    b.onclick = () => {
      teachersCurrentPage = parseInt(b.dataset.gotoTeacherPage, 10);
      renderTeachersTable();
    };
  });
}

$("teachersFirstPageBtn").onclick = () => { teachersCurrentPage = 1; renderTeachersTable(); };
$("teachersPrevPageBtn").onclick = () => { teachersCurrentPage--; renderTeachersTable(); };
$("teachersNextPageBtn").onclick = () => { teachersCurrentPage++; renderTeachersTable(); };
$("teachersLastPageBtn").onclick = () => {
  teachersCurrentPage = Math.ceil(teachersFiltered.length / teachersPerPage);
  renderTeachersTable();
};
$("teachersPageSizeSelect").onchange = (e) => {
  teachersPerPage = parseInt(e.target.value, 10) || 15;
  teachersCurrentPage = 1;
  renderTeachersTable();
};
$("teacherSearchInput").oninput = () => {
  teachersCurrentPage = 1;
  renderTeachersTable();
};

// Modal Controls: Open Add
$("openAddTeacherBtn").onclick = () => {
  $("modalTitle").textContent = "Add New Teacher";
  $("editTeacherDocId").value = "";
  $("tNameInput").value = "";
  $("tUserInput").value = "";
  $("tPassInput").value = "";
  $("tArmsInput").value = "";
  $("chkAllClasses").checked = false;
  renderTeacherModalSubjects([]);
  document.querySelectorAll(".cls-chk").forEach(c => c.checked = false);
  $("modalErrorMsg").textContent = "";
  $("teacherModal").classList.add("open");
};

if ($("refreshTeachersBtn")) {
  $("refreshTeachersBtn").onclick = async () => {
    const btn = $("refreshTeachersBtn");
    const orig = btn.textContent;
    btn.textContent = "Refreshing...";
    btn.disabled = true;
    await loadTeachers(true);
    btn.textContent = orig;
    btn.disabled = false;
  };
}

if ($("downloadTeachersExcelBtn")) {
  $("downloadTeachersExcelBtn").onclick = () => {
    const list = (allTeachers && allTeachers.length) ? allTeachers : [];
    if (!list.length) {
      showToast({
        type: "warning",
        title: "No Teachers Found",
        message: "No teacher accounts available to download."
      });
      return;
    }
    const headers = [
      "#",
      "Teacher Name",
      "Username",
      "Password",
      "Assigned Subjects",
      "Assigned Classes",
      "Assigned Arms"
    ];
    const rows = list.map((t, idx) => {
      const subs = (t.subjects && t.subjects.length) ? t.subjects.join("; ") : "All Subjects";
      const cls = (t.classes && t.classes.length) ? t.classes.join(", ") : "All Classes";
      const arms = (t.arms && t.arms.length) ? t.arms.join(", ") : "All Arms";
      return [
        idx + 1,
        `"${(t.name || "").replace(/"/g, '""')}"`,
        `"${(t.username || t.id || "").replace(/"/g, '""')}"`,
        `"${(t.password || "").replace(/"/g, '""')}"`,
        `"${subs.replace(/"/g, '""')}"`,
        `"${cls.replace(/"/g, '""')}"`,
        `"${arms.replace(/"/g, '""')}"`
      ];
    });
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Teachers_Accounts_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 300);
    showToast({
      type: "success",
      title: "Teachers Downloaded",
      message: `Exported ${list.length} teacher accounts in Excel/CSV format.`
    });
  };
}

// Modal Controls: Open Edit
function openEditTeacherModal(docId) {
  const t = allTeachers.find(x => x.id === docId);
  if (!t) return;
  $("modalTitle").textContent = `Edit Teacher: ${t.name || t.id}`;
  $("editTeacherDocId").value = t.id;
  $("tNameInput").value = t.name || "";
  $("tUserInput").value = t.username || t.id;
  $("tPassInput").value = t.password || "";
  $("tArmsInput").value = (t.arms || []).join(", ");

  renderTeacherModalSubjects(t.subjects || []);

  const clsSet = new Set(t.classes || []);
  $("chkAllClasses").checked = !t.classes || t.classes.length === 0;
  document.querySelectorAll(".cls-chk").forEach(c => {
    c.checked = clsSet.has(c.value) || $("chkAllClasses").checked;
  });

  $("modalErrorMsg").textContent = "";
  $("teacherModal").classList.add("open");
}

$("modalCloseBtn").onclick = $("modalCancelBtn").onclick = () => {
  $("teacherModal").classList.remove("open");
};

// Modal Controls: Save Teacher
$("modalSaveBtn").onclick = async () => {
  const name = $("tNameInput").value.trim();
  const rawUser = $("tUserInput").value.trim();
  const pass = $("tPassInput").value.trim();
  const origId = $("editTeacherDocId").value;

  if (!name || !rawUser || !pass) {
    $("modalErrorMsg").textContent = "Please fill in Teacher Name, Username, and Password.";
    return;
  }

  const cleanUser = rawUser.toLowerCase().replace(/[^a-z0-9]/g, "");
  const selectedSubs = [...document.querySelectorAll(".sub-chk:checked")].map(c => c.value);
  let selectedClasses = [];
  if (!$("chkAllClasses").checked) {
    selectedClasses = [...document.querySelectorAll(".cls-chk:checked")].map(c => c.value);
  }

  const armsRaw = $("tArmsInput").value.trim();
  const arms = armsRaw ? armsRaw.split(",").map(a => a.trim().toUpperCase()).filter(Boolean) : [];

  $("modalSaveBtn").disabled = true;
  $("modalSaveBtn").textContent = "Saving…";

  try {
    const docData = {
      name,
      username: cleanUser,
      password: pass,
      subjects: selectedSubs,
      classes: selectedClasses,
      arms,
      updatedAt: new Date().toISOString()
    };

    if (origId && origId !== cleanUser) {
      await window.dbClient.deleteTeacher(origId);
      allTeachers = allTeachers.filter(x => x.id !== origId);
    }

    await window.dbClient.saveTeacher(docData);

    // Optimistically update in-memory teacher list so it renders immediately
    const newTeacherObj = { id: cleanUser, ...docData };
    const existingIdx = allTeachers.findIndex(x => x.id === cleanUser);
    if (existingIdx >= 0) {
      allTeachers[existingIdx] = newTeacherObj;
    } else {
      allTeachers.push(newTeacherObj);
    }
    allTeachers.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    setCachedTeachers(allTeachers);
    $("teacherCountBadge").textContent = allTeachers.length;
    renderTeachersTable();

    $("teacherModal").classList.remove("open");
    showToast({
      type: "success",
      title: origId ? "Teacher Updated" : "Teacher Added",
      message: `Account for "${docData.name}" (${cleanUser}) saved successfully.`
    });
    await loadTeachers(true);
  } catch (e) {
    $("modalErrorMsg").textContent = "Save failed: " + e.message;
    showToast({
      type: "error",
      title: "Save Failed",
      message: e.message
    });
  }
  $("modalSaveBtn").disabled = false;
  $("modalSaveBtn").textContent = "Save teacher";
};

// Delete Teacher
async function deleteTeacher(docId) {
  const t = allTeachers.find(x => x.id === docId);
  const tName = t ? t.name : docId;
  if (!confirm(`Are you sure you want to remove "${tName}"?\n\nThey will no longer be able to log in to the teacher portal.`)) return;
  try {
    allTeachers = allTeachers.filter(x => x.id !== docId);
    setCachedTeachers(allTeachers);
    $("teacherCountBadge").textContent = allTeachers.length;
    renderTeachersTable();

    await window.dbClient.deleteTeacher(docId);
    showToast({
      type: "info",
      title: "Teacher Removed",
      message: `Account for "${tName}" has been deleted.`
    });
    await loadTeachers(true);
  } catch (e) {
    showToast({
      type: "error",
      title: "Delete Failed",
      message: e.message
    });
  }
}

// ══════════════════════════════════════════════════════════
// EXAM SCORES CSV UPLOAD MODULE & DYNAMIC EDITABLE TERMS
// ══════════════════════════════════════════════════════════
const DEFAULT_UPLOAD_TERMS = [
  "First Test",
  "Mid Term Test",
  "First Term Examination",
  "Second Term First Test",
  "Second Term Mid Term Test",
  "Second Term Examination",
  "Third Term First Test",
  "Third Term Mid Term Test",
  "Third Term Examination"
];

let savedUploadTerms = [...DEFAULT_UPLOAD_TERMS];
let selectedTerm = "First Test";
let termScoreCountsMap = {};
let parsedSubjects = {};
let totalParsedRecords = 0;

function loadSavedUploadTerms() {
  try {
    const raw = localStorage.getItem("school_upload_terms_v2");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        savedUploadTerms = parsed;
      }
    }
  } catch (e) { }
}
loadSavedUploadTerms();
syncUploadTermsWithCloud();

async function syncUploadTermsWithCloud() {
  try {
    if (window.dbClient && typeof window.dbClient.getMeta === "function") {
      const meta = await window.dbClient.getMeta("upload_terms_list");
      if (meta && Array.isArray(meta.terms) && meta.terms.length > 0) {
        savedUploadTerms = [...meta.terms];
        localStorage.setItem("school_upload_terms_v2", JSON.stringify(savedUploadTerms));
        renderUploadTermSelector();
      } else if (savedUploadTerms && savedUploadTerms.length > 0) {
        // Cloud has no record yet: persist current terms so other devices immediately receive them
        await saveUploadTermsList();
      }
    }
  } catch (err) {
    console.warn("Could not sync upload terms from cloud:", err);
  }
}

async function saveUploadTermsList() {
  try {
    localStorage.setItem("school_upload_terms_v2", JSON.stringify(savedUploadTerms));
    if (window.dbClient && typeof window.dbClient.setMeta === "function") {
      await window.dbClient.setMeta("upload_terms_list", {
        terms: savedUploadTerms,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (e) {
    console.warn("Could not persist upload terms to cloud:", e);
  }
}

function renderUploadTermSelector() {
  const container = $("termSelector");
  if (!container) return;

  // Merge any live terms from the database so existing terms always appear as options
  Object.keys(termScoreCountsMap).forEach(liveT => {
    if (liveT && !savedUploadTerms.includes(liveT)) {
      savedUploadTerms.push(liveT);
    }
  });

  let html = "";
  savedUploadTerms.forEach(term => {
    const isSelected = (selectedTerm === term);
    const count = termScoreCountsMap[term] || 0;
    const metaText = count > 0 ? `${count.toLocaleString()} scores` : "Not uploaded";

    html += `
      <div class="term-btn ${isSelected ? 'active' : ''}" data-term="${esc(term)}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px">
          <div class="term-btn-title" style="flex:1;word-break:break-word">${esc(term)}</div>
          <div class="term-btn-actions" style="display:flex;gap:4px;flex-shrink:0">
            <button type="button" class="term-action-btn" data-edit-term="${esc(term)}" title="Rename / Edit term" style="background:none;border:none;cursor:pointer;font-size:12px;padding:1px 3px">✏️</button>
            <button type="button" class="term-action-btn" data-del-term-opt="${esc(term)}" title="Remove this term option" style="background:none;border:none;cursor:pointer;font-size:13px;padding:1px 3px;color:var(--status-fail)">&times;</button>
          </div>
        </div>
        <div class="term-btn-meta" style="margin-top:6px">${metaText}</div>
      </div>
    `;
  });

  // Custom Term / Add Option Button
  const isCustomSelected = (selectedTerm === "__custom");
  html += `
    <div class="term-btn ${isCustomSelected ? 'active' : ''}" data-term="__custom" style="border-style:dashed;background:rgba(255,255,255,0.02)">
      <div class="term-btn-title" style="color:var(--accent)">+ Custom Term</div>
      <div class="term-btn-meta">Type &amp; save new option</div>
    </div>
  `;

  container.innerHTML = html;

  // Bind Term selection clicks
  container.querySelectorAll(".term-btn").forEach(card => {
    card.onclick = (e) => {
      if (e.target.closest(".term-action-btn")) return;
      const t = card.dataset.term;
      selectUploadTerm(t);
    };
  });

  // Bind Edit Action
  container.querySelectorAll("[data-edit-term]").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const oldTerm = btn.dataset.editTerm;
      editUploadTermName(oldTerm);
    };
  });

  // Bind Delete Option Action
  container.querySelectorAll("[data-del-term-opt]").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const termToDel = btn.dataset.delTermOpt;
      removeUploadTermOption(termToDel);
    };
  });

  updateTargetLabel();
  checkUploadReady();
}

function selectUploadTerm(t) {
  selectedTerm = t;
  document.querySelectorAll(".term-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.term === t);
  });
  const customGroup = $("customTermGroup");
  if (customGroup) {
    customGroup.style.display = (t === "__custom") ? "block" : "none";
    if (t === "__custom") {
      $("customTermInput")?.focus();
    }
  }
  updateTargetLabel();
  checkUploadReady();
}

function editUploadTermName(oldTerm) {
  const newName = prompt(`Edit term name:\n\n(Tip: Enter the exact name for this term)`, oldTerm);
  if (newName === null) return;
  const trimmed = newName.trim();
  if (!trimmed) {
    showToast({
      type: "warning",
      title: "Name Required",
      message: "Term name cannot be empty."
    });
    return;
  }
  if (trimmed === oldTerm) return;

  const idx = savedUploadTerms.indexOf(oldTerm);
  if (idx !== -1) {
    savedUploadTerms[idx] = trimmed;
  } else {
    savedUploadTerms.push(trimmed);
  }

  // Preserve counts map under new name
  if (termScoreCountsMap[oldTerm] !== undefined) {
    termScoreCountsMap[trimmed] = termScoreCountsMap[oldTerm];
    delete termScoreCountsMap[oldTerm];
  }

  if (selectedTerm === oldTerm) {
    selectedTerm = trimmed;
  }

  saveUploadTermsList();
  renderUploadTermSelector();
}

function removeUploadTermOption(term) {
  if (!confirm(`Remove "${term}" from the options list?\n\n(Existing uploaded student scores for this term will not be deleted).`)) return;
  savedUploadTerms = savedUploadTerms.filter(t => t !== term);
  if (selectedTerm === term) {
    selectedTerm = savedUploadTerms[0] || "First Test";
  }
  saveUploadTermsList();
  renderUploadTermSelector();
}

function addCustomTermAsOption(termName) {
  const trimmed = (termName || "").trim();
  if (!trimmed) return false;

  if (!savedUploadTerms.includes(trimmed)) {
    savedUploadTerms.push(trimmed);
    saveUploadTermsList();
  }

  selectedTerm = trimmed;
  renderUploadTermSelector();

  if ($("customTermInput")) $("customTermInput").value = "";
  if ($("customTermGroup")) $("customTermGroup").style.display = "none";
  updateTargetLabel();
  checkUploadReady();
  return true;
}

function getTermName() {
  if (!selectedTerm) return null;
  if (selectedTerm === "__custom") {
    const val = $("customTermInput")?.value.trim();
    return val || null;
  }
  return selectedTerm;
}

function updateTargetLabel() {
  if ($("targetTermLabel")) {
    $("targetTermLabel").textContent = getTermName() || "(enter custom term name)";
  }
}

// Bind Custom Term and Add buttons
if ($("saveCustomTermOptionBtn")) {
  $("saveCustomTermOptionBtn").onclick = () => {
    const val = $("customTermInput")?.value.trim();
    if (!val) {
      showToast({
        type: "warning",
        title: "Term Name Required",
        message: "Please enter a custom term name to save as an option."
      });
      return;
    }
    addCustomTermAsOption(val);
    showToast({
      type: "success",
      title: "Term Added",
      message: `"${val}" added to upload term options.`
    });
  };
}

if ($("customTermInput")) {
  $("customTermInput").oninput = () => {
    updateTargetLabel();
    checkUploadReady();
  };
  $("customTermInput").onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      $("saveCustomTermOptionBtn")?.click();
    }
  };
}

if ($("addNewUploadTermBtn")) {
  $("addNewUploadTermBtn").onclick = () => {
    selectUploadTerm("__custom");
  };
}

if ($("resetUploadTermsBtn")) {
  $("resetUploadTermsBtn").onclick = () => {
    if (!confirm("Reset term options back to the default list?")) return;
    savedUploadTerms = [...DEFAULT_UPLOAD_TERMS];
    saveUploadTermsList();
    renderUploadTermSelector();
  };
}

renderUploadTermSelector();

const dropZone = $("csvDropZone");
const csvFileInput = $("csvFileInput");
if (dropZone && csvFileInput) {
  dropZone.onclick = () => csvFileInput.click();
  dropZone.ondragover = e => { e.preventDefault(); dropZone.classList.add("drag"); };
  dropZone.ondragleave = () => dropZone.classList.remove("drag");
  dropZone.ondrop = e => {
    e.preventDefault();
    dropZone.classList.remove("drag");
    handleCSVFile(e.dataTransfer.files[0]);
  };
  csvFileInput.onchange = () => handleCSVFile(csvFileInput.files[0]);
}

let lastLoadedCSVFile = null;
let lastLoadedCSVText = null;

function getKnownSubjectsCatalog() {
  const set = new Set([
    "Mathematics", "English Language", "Basic Science", "Basic Technology", "Agricultural Science",
    "Civic Education", "Christian Religious Studies", "Islamic Religious Studies", "Computer Studies",
    "Social Studies", "Social and Citizenship Studies", "Physical Health Education", "Business Studies",
    "French Language", "Yoruba Language", "Home Economics", "Cultural and Creative Art",
    "Cultural and Creative Arts", "History", "Digital Technologies", "Digital Technology",
    "Visual Art", "Visual Arts", "Music", "Security Education", "Fashion Design and Garment making",
    "Horticulture and Crop Production", "Beauty and Cosmetology", "Computer Hardware and GSM Repair",
    "Literature in English", "Physics", "Chemistry", "Biology", "Further Mathematics", "Economics",
    "Government", "Geography", "Commerce", "Financial Accounting", "Marketing", "Data Processing",
    "ICT", "Robotics", "Technical Drawing", "Catering Craft", "Food and Nutrition"
  ]);
  if (typeof DEFAULT_CBT_SUBJECTS !== "undefined") {
    Object.keys(DEFAULT_CBT_SUBJECTS).forEach(s => set.add(s));
  }
  if (typeof CBT_CONFIG !== "undefined" && CBT_CONFIG.subjects) {
    Object.keys(CBT_CONFIG.subjects).forEach(s => set.add(s));
  }
  return [...set];
}

function getKnownArmsCatalog() {
  const set = new Set([
    "CHURCHILL", "DARWIN", "EINSTEIN", "FRANKLIN", "GRAHAM", "HOLMES", "IVY", "JOULES",
    "EMERALD", "BERYL", "SAPPHIRE", "RUBY", "DIAMOND", "ORANGE", "ORANNGE",
    "GOLD", "SILVER", "BLUE", "GREEN", "RED", "YELLOW", "ARM A", "ARM B", "ARM C", "ARM D"
  ]);
  if (typeof CBT_CONFIG !== "undefined" && CBT_CONFIG.classes) {
    Object.values(CBT_CONFIG.classes).forEach(clsObj => {
      if (Array.isArray(clsObj.armsDetail)) {
        clsObj.armsDetail.forEach(a => { if (a.name) set.add(a.name.trim().toUpperCase()); });
      }
    });
  }
  return [...set];
}

function handleCSVFile(file) {
  if (!file || !file.name.toLowerCase().endsWith(".csv")) {
    setUploadError("Please provide a valid .csv file.");
    return;
  }
  lastLoadedCSVFile = file;
  const fr = new FileReader();
  fr.onload = e => {
    lastLoadedCSVText = e.target.result;
    reparseLoadedCSV();
  };
  fr.readAsText(file);
}

function reparseLoadedCSV() {
  if (!lastLoadedCSVText || !lastLoadedCSVFile) return;
  const manualSub = $("uploadSubjectSelect") ? $("uploadSubjectSelect").value : "";
  const res = parseCSV(lastLoadedCSVText, lastLoadedCSVFile.name, manualSub);
  parsedSubjects = res.subjects;
  totalParsedRecords = res.total;
  if (!totalParsedRecords) {
    setUploadError("No valid student score rows found in this CSV.");
    return;
  }
  showCSVPreview(res.sampleRows);
  $("dropTitle").textContent = lastLoadedCSVFile.name;
  $("dropSub").textContent = `${totalParsedRecords.toLocaleString()} records across ${Object.keys(parsedSubjects).length} subjects`;
  setUploadError("");
  checkUploadReady();
}

function splitLine(line, delimiter = ",") {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (!inQuotes && current.trim() === "") {
        current = "";
        inQuotes = true;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function detectCSVDelimiter(firstLine) {
  if (firstLine.includes("\t")) return "\t";
  if (firstLine.includes(";") && !firstLine.includes(",")) return ";";
  return ",";
}

function parseCSV(text, filename = "", manualSubject = "") {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return { subjects: {}, total: 0, sampleRows: [] };

  const delimiter = detectCSVDelimiter(lines[0]);
  const rawHeaders = splitLine(lines[0], delimiter).map(h => h.replace(/^["']|["']$/g, "").trim());
  const normHeaders = rawHeaders.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ""));

  const isHeaderRow = normHeaders.some(h =>
    /^(subject|course|class|arm|student|name|reg|regnumber|admission|score|points|mark|pct|percentage|date|time|status|submission)$/.test(h)
  );

  const startLine = isHeaderRow ? 1 : 0;
  if (startLine >= lines.length) return { subjects: {}, total: 0, sampleRows: [] };
  const headerMap = {};

  if (isHeaderRow) {
    normHeaders.forEach((h, idx) => {
      if (/^(studentname|student|fullname|name|candidatename|candidate|pupil|learner)$/.test(h) && headerMap.student === undefined) headerMap.student = idx;
      else if (/^(regnumber|regno|reg|registrationno|registrationnumber|admissionno|admissionnumber|admno|studentid|id|matricno)$/.test(h) && headerMap.reg === undefined) headerMap.reg = idx;
      else if (/^(subjectname|subject|course|coursename|paper)$/.test(h) && headerMap.subject === undefined) headerMap.subject = idx;
      else if (/^(classname|class|classlevel|level|grade|year)$/.test(h) && headerMap.class === undefined) headerMap.class = idx;
      else if (/^(classarm|arm|section|subclass|armname)$/.test(h) && headerMap.arm === undefined) headerMap.arm = idx;
      else if (/^(score|mark|marks|totalscore|rawscore|examscore|result)$/.test(h) && headerMap.score === undefined) headerMap.score = idx;
      else if (/^(points|point|rawpoints)$/.test(h) && headerMap.points === undefined) headerMap.points = idx;
      else if (/^(percentage|percent|pct|percentmarks)$/.test(h) && headerMap.pct === undefined) headerMap.pct = idx;
      else if (/^(date|datetime|dateandtime|timestamp|time|submittedat|submissiontime|examdate)$/.test(h) && headerMap.date === undefined) headerMap.date = idx;
      else if (/^(status|submission|submissiontype|submissionstatus|mode|type)$/.test(h) && headerMap.status === undefined) headerMap.status = idx;
      else if (/^(questions|questionsanswered|questioncount|scorefraction)$/.test(h) && headerMap.questions === undefined) headerMap.questions = idx;
    });
  }

  const knownSubjects = getKnownSubjectsCatalog();
  const knownSubjectsLow = new Set(knownSubjects.map(s => s.toLowerCase()));
  const knownArmsSet = new Set(getKnownArmsCatalog());
  const assignedHeaderIndices = new Set(Object.values(headerMap));

  // Sample data lines to run content heuristics ONLY for unmapped columns
  const sampleDataLines = lines.slice(startLine, Math.min(lines.length, startLine + 10));
  const colRoles = {};
  const maxCols = Math.max(...sampleDataLines.map(l => splitLine(l, delimiter).length));

  for (let colIdx = 0; colIdx < maxCols; colIdx++) {
    if (assignedHeaderIndices.has(colIdx)) continue;
    const colValues = sampleDataLines.map(l => {
      const parts = splitLine(l, delimiter);
      return (parts[colIdx] || "").replace(/^["']|["']$/g, "").trim();
    }).filter(Boolean);

    if (!colValues.length) continue;

    const isReg = colValues.filter(v => /^STDS\d+-\d+/i.test(v) || /^[A-Z]{3,}\d*-\d+/i.test(v)).length >= (colValues.length * 0.5);
    if (isReg) { colRoles[colIdx] = "reg"; continue; }

    const isSubmission = colValues.filter(v => /^(NORMAL|LATE|AUTO|EXTRA)\s*(SUBMISSION)?$/i.test(v) || /(submission|elapsed)/i.test(v)).length >= (colValues.length * 0.5);
    if (isSubmission) { colRoles[colIdx] = "status"; continue; }

    const isQuestionFraction = colValues.filter(v => /^\d+(?:\.\d+)?\s*(of|\/)\s*\d+(?:\.\d+)?$/i.test(v)).length >= (colValues.length * 0.5);
    if (isQuestionFraction) { colRoles[colIdx] = "questions"; continue; }

    const isArm = colValues.filter(v => knownArmsSet.has(v.toUpperCase()) || /^(Arm\s*[A-Z]|[A-D])$/i.test(v)).length >= (colValues.length * 0.5);
    if (isArm) { colRoles[colIdx] = "arm"; continue; }

    const isClass = colValues.filter(v => /^(Year\s*\d+|Grade\s*\d+|JSS\s*\d|SSS\s*\d|Basic\s*\d|Primary\s*\d)/i.test(v)).length >= (colValues.length * 0.5);
    if (isClass) { colRoles[colIdx] = "class"; continue; }

    const isSubject = colValues.filter(v => knownSubjectsLow.has(v.toLowerCase())).length >= (colValues.length * 0.5);
    if (isSubject) { colRoles[colIdx] = "subject"; continue; }

    const isDate = colValues.filter(v => /\b(AM|PM)\b/i.test(v) || /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(v) || /\d{4}-\d{2}-\d{2}/.test(v) || /[A-Za-z]{3}\s+\d{1,2}(?:,\s*\d{4})?/.test(v)).length >= (colValues.length * 0.5);
    if (isDate) { colRoles[colIdx] = "date"; continue; }

    const isPct = colValues.filter(v => /^\d+(\.\d+)?%$/.test(v)).length >= (colValues.length * 0.5);
    if (isPct) { colRoles[colIdx] = "pct"; continue; }

    const isNumericScore = colValues.filter(v => /^\d+(\.\d+)?$/.test(v) && parseFloat(v) <= 100).length >= (colValues.length * 0.5);
    if (isNumericScore && headerMap.score === undefined) { colRoles[colIdx] = "score"; continue; }

    const isStudentName = colValues.filter(v =>
      /^[A-Za-z\s\.\-']{4,80}$/.test(v) &&
      v.split(/\s+/).filter(Boolean).length >= 2 &&
      !/(submission|elapsed)/i.test(v) &&
      !knownSubjectsLow.has(v.toLowerCase()) &&
      !knownArmsSet.has(v.toUpperCase())
    ).length >= (colValues.length * 0.5);
    if (isStudentName) { colRoles[colIdx] = "student"; continue; }
  }

  // Always prefer explicit CSV headers over heuristic guesses
  const getCol = (role) => {
    if (headerMap[role] !== undefined) return headerMap[role];
    for (const [idx, r] of Object.entries(colRoles)) {
      if (r === role) return parseInt(idx, 10);
    }
    return -1;
  };

  const studentCol = getCol("student") !== -1 ? getCol("student") : 3;
  const regCol = getCol("reg") !== -1 ? getCol("reg") : 4;
  const classCol = getCol("class") !== -1 ? getCol("class") : 1;
  const armCol = getCol("arm") !== -1 ? getCol("arm") : 2;
  const subjectCol = getCol("subject");
  const scoreCol = getCol("score") !== -1 ? getCol("score") : (headerMap.points !== undefined ? headerMap.points : 6);
  const pointsCol = headerMap.points !== undefined ? headerMap.points : -1;
  const pctCol = getCol("pct") !== -1 ? getCol("pct") : 8;
  const dateCol = getCol("date") !== -1 ? getCol("date") : 9;
  const questionsCol = getCol("questions");

  // Determine fallback subject from manual selection, filename, or default
  let fallbackSubject = manualSubject || "";
  if (!fallbackSubject && filename) {
    const fLow = filename.toLowerCase();
    const foundSub = knownSubjects.find(s => fLow.includes(s.toLowerCase()));
    if (foundSub) fallbackSubject = foundSub;
  }
  if (!fallbackSubject) fallbackSubject = "Mathematics";

  const subjects = {};
  const sampleRows = [];
  let total = 0;

  for (let i = startLine; i < lines.length; i++) {
    const c = splitLine(lines[i], delimiter);
    if (c.length < 2) continue;

    // Student name
    let student = (studentCol !== -1 && c[studentCol]) ? c[studentCol].replace(/^["']|["']$/g, "").trim().toUpperCase() : "";
    if (!student || /^(NORMAL|LATE|AUTO|EXTRA)\s*(SUBMISSION)?$/i.test(student) || /(submission|elapsed)/i.test(student) || knownArmsSet.has(student) || (headerMap.student === undefined && knownSubjectsLow.has(student.toLowerCase()))) {
      const nameCand = c.find((val, idx) =>
        idx !== subjectCol && idx !== armCol && idx !== classCol &&
        /^[A-Za-z\s\.\-']{4,80}$/.test(val) &&
        val.split(/\s+/).filter(Boolean).length >= 2 &&
        !/(submission|elapsed)/i.test(val) &&
        !knownArmsSet.has(val.toUpperCase()) &&
        !knownSubjectsLow.has(val.toLowerCase())
      );
      if (nameCand) student = nameCand.trim().toUpperCase();
    }
    if (!student) continue;

    // Reg number
    let reg = (regCol !== -1 && c[regCol]) ? c[regCol].replace(/^["']|["']$/g, "").trim() : "";
    if (!/^STDS\d+/i.test(reg) && headerMap.reg === undefined) {
      const regCand = c.find(val => /^STDS\d+-\d+/i.test(val) || /^[A-Z]{3,}\d*-\d+/i.test(val));
      if (regCand) reg = regCand.trim();
    }

    // Arm
    let arm = (armCol !== -1 && c[armCol]) ? c[armCol].replace(/^["']|["']$/g, "").trim().toUpperCase() : "";
    if ((!arm || !knownArmsSet.has(arm)) && headerMap.arm === undefined) {
      const armCand = c.find(val => knownArmsSet.has(val.toUpperCase()));
      if (armCand) arm = armCand.trim().toUpperCase();
    }

    // Class (auto-derive from reg if empty: STDS7 -> Year 7, STDS8 -> Year 8, STDS9 -> Year 9)
    let className = (classCol !== -1 && c[classCol]) ? c[classCol].replace(/^["']|["']$/g, "").trim() : "";
    if (!className || !/Year\s*\d/i.test(className)) {
      const classCand = c.find(val => /Year\s*\d/i.test(val));
      if (classCand) {
        className = classCand.trim();
      } else if (/^STDS(\d+)/i.test(reg)) {
        const yr = reg.match(/^STDS(\d+)/i)[1];
        className = `Year ${yr}`;
      }
    }
    if (!className) className = "Year 7";

    // Subject
    let subject = (subjectCol !== -1 && c[subjectCol]) ? c[subjectCol].replace(/^["']|["']$/g, "").trim() : "";
    if (!subject || (headerMap.subject === undefined && knownArmsSet.has(subject.toUpperCase()))) {
      subject = fallbackSubject;
    }

    // Score & Percentage
    let score = (scoreCol !== -1 && c[scoreCol]) ? c[scoreCol].replace(/^["']|["']$/g, "").trim() : "";
    if (!score && pointsCol !== -1 && c[pointsCol]) {
      score = c[pointsCol].replace(/^["']|["']$/g, "").trim();
    }
    let pct = 0;
    if (pctCol !== -1 && c[pctCol]) {
      const pctMatch = c[pctCol].replace(/[^0-9.]/g, "");
      pct = Math.round(parseFloat(pctMatch) || 0);
      if (pct > 100) pct = 0; // guard against year 2026 parsed as pct
    }

    // If score has "X of Y" (or questionsCol has it)
    const qFraction = (questionsCol !== -1 && c[questionsCol]) ? c[questionsCol] : score;
    const qMatch = (qFraction || "").match(/(\d+(?:\.\d+)?)\s*(?:of|\/)\s*(\d+(?:\.\d+)?)/i);
    if (qMatch) {
      const correct = parseFloat(qMatch[1]);
      const totalQ = parseFloat(qMatch[2]);
      if (!pct && totalQ > 0) pct = Math.round((correct / totalQ) * 100);
      if (!score || score === qFraction) score = String(correct);
    } else {
      const numScore = parseFloat((score || "").replace(/[^0-9.]/g, ""));
      if (!isNaN(numScore)) {
        if (!pct && numScore <= 100) pct = Math.round(numScore);
        score = String(numScore);
      }
    }

    // Date (handles unquoted comma dates like "Nov 12, 2026, 03:44 PM")
    let date = "";
    if (dateCol !== -1 && c[dateCol]) {
      if (isHeaderRow && headerMap.date !== undefined && dateCol === rawHeaders.length - 1 && c.length > rawHeaders.length) {
        date = c.slice(dateCol).map(v => v.replace(/^["']|["']$/g, "").trim()).filter(Boolean).join(", ");
      } else {
        date = c[dateCol].replace(/^["']|["']$/g, "").trim();
        if (/^[A-Za-z]{3,9}\s+\d{1,2}$/.test(date) && c[dateCol + 1] && /^\d{4}$/.test(c[dateCol + 1])) {
          date += ", " + c[dateCol + 1].trim();
          if (c[dateCol + 2] && /\d{1,2}:\d{2}/.test(c[dateCol + 2])) {
            date += ", " + c[dateCol + 2].trim();
          }
        }
      }
    }
    if (!date) date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    if (!subjects[subject]) subjects[subject] = [];
    const record = {
      class: className,
      arm,
      student,
      reg,
      score,
      pct,
      date
    };
    subjects[subject].push(record);
    total++;
    if (sampleRows.length < 6) sampleRows.push({ ...record, subject });
  }

  return { subjects, total, sampleRows };
}

function showCSVPreview(rows) {
  $("csvPreviewSection").style.display = "block";
  $("csvRecordCount").textContent = totalParsedRecords.toLocaleString();
  $("csvPreviewHead").innerHTML = "<tr>" + ["Subject", "Class", "Arm", "Student", "Reg No", "Score", "%"].map(h => `<th>${h}</th>`).join("") + "</tr>";
  $("csvPreviewBody").innerHTML = rows.map(r => `
    <tr>
      <td>${esc(r.subject)}</td>
      <td>${esc(r.class)}</td>
      <td>${esc(r.arm)}</td>
      <td style="font-weight:600">${esc(r.student)}</td>
      <td><code style="font-size:11px;background:rgba(255,255,255,0.06);padding:2px 4px;border-radius:3px;">${esc(r.reg || '-')}</code></td>
      <td>${esc(r.score)}</td>
      <td>${r.pct}%</td>
    </tr>
  `).join("");
}

if ($("uploadSubjectSelect")) {
  $("uploadSubjectSelect").onchange = () => {
    if (lastLoadedCSVText && lastLoadedCSVFile) {
      reparseLoadedCSV();
    }
  };
}

$("csvClearBtn").onclick = () => {
  parsedSubjects = {};
  totalParsedRecords = 0;
  csvFileInput.value = "";
  $("csvPreviewSection").style.display = "none";
  $("uploadSuccessBox").style.display = "none";
  $("dropTitle").textContent = "Click or drag Academic Records CSV here";
  $("dropSub").textContent = "Accepts standard .csv format";
  checkUploadReady();
  setUploadError("");
};

function checkUploadReady() {
  const btn = $("uploadScoresBtn");
  if (btn) {
    btn.disabled = !(totalParsedRecords > 0 && getTermName());
  }
}

function setUploadError(msg) {
  $("uploadErrorMsg").textContent = msg;
}

function safeId(str) {
  return encodeURIComponent(str.replace(/[\/\#\?\[\]]/g, "_"));
}

$("uploadScoresBtn").onclick = async () => {
  const term = getTermName();
  if (!term || !totalParsedRecords) return;

  // Auto-save custom term as a permanent selectable option
  if (selectedTerm === "__custom" && term) {
    addCustomTermAsOption(term);
  }

  $("uploadScoresBtn").disabled = true;
  setUploadError("");
  $("uploadSuccessBox").style.display = "none";
  $("uploadProgressWrap").style.display = "block";

  try {
    const subjectList = Object.keys(parsedSubjects);
    setUploadProgress(15, "Preparing records across " + subjectList.length + " subjects...");

    const allRowsToSave = [];
    for (const sub of subjectList) {
      const rows = parsedSubjects[sub];
      rows.forEach(r => {
        allRowsToSave.push({
          term,
          student: (r.student || r.name || "").toUpperCase(),
          reg: r.reg || r.regNo || r.admNo || "",
          subject: sub,
          class: r.class || "",
          arm: r.arm || "",
          score: String(r.score ?? ""),
          pct: Number(r.pct) || (parseFloat(r.score) || 0),
          date: r.date || r.dateTime || ""
        });
      });
    }

    setUploadProgress(40, "Writing records to Supabase in batches...");
    await window.dbClient.saveScoresBatch(allRowsToSave, term);

    // Automatic Push Notification to Teachers of Uploaded Subjects
    const notifyTeachersCheckbox = $("uploadNotifyTeachersCheckbox");
    const shouldNotify = !notifyTeachersCheckbox || notifyTeachersCheckbox.checked;
    const notifiedSubjects = [];

    if (shouldNotify && subjectList.length > 0) {
      setUploadProgress(85, "Notifying subject teachers...");
      for (const sub of subjectList) {
        const notifTitle = `New Scores Uploaded: ${sub}`;
        const notifMsg = `${term} scores for ${sub} have been uploaded and are now available in your portal.`;

        // 1. In-App Announcements record in Supabase
        if (window.dbClient && typeof window.dbClient.addTeacherAnnouncement === "function") {
          try {
            await window.dbClient.addTeacherAnnouncement({
              title: notifTitle,
              category: "scores",
              target: "subject",
              targetSubject: sub,
              message: notifMsg,
              pinned: false,
              author: "Exam Committee"
            });
          } catch (annErr) {
            console.warn("Announcement log error for", sub, annErr);
          }
        }

        // 2. OneSignal Device Push
        dispatchOneSignalPush({
          title: notifTitle,
          message: notifMsg,
          target: "subject",
          targetSubject: sub
        }).then(res => {
          if (res && res.success && res.recipients > 0) {
            console.log(`Pushed alert for ${sub} to ${res.recipients} teacher device(s).`);
          }
        }).catch(e => console.warn("OneSignal subject push error for", sub, e));

        notifiedSubjects.push(sub);
      }
    }

    setUploadProgress(100, "Update complete");
    const el = $("uploadSuccessBox");
    if (el) {
      const notifSuffix = (shouldNotify && notifiedSubjects.length > 0)
        ? ` Alerts sent to teachers of: ${notifiedSubjects.join(", ")}.`
        : "";
      el.textContent = `Successfully uploaded ${totalParsedRecords.toLocaleString()} records across ${subjectList.length} subjects for "${term}" to Supabase.${notifSuffix} The portal is live with these scores.`;
      el.style.display = "block";
    }

    if (shouldNotify && notifiedSubjects.length > 0) {
      showToast({
        type: "success",
        title: "Subject Teachers Notified",
        message: `Push alerts dispatched to teachers of: ${notifiedSubjects.join(", ")}`
      });
    }

    // Instantly refresh in-memory scores & UI views without requiring page reload!
    await loadStudentScores(true);
    renderUploadTermSelector();
    buildAdminTermTabs();
    applyScoreFilters();
    if (typeof renderExecutiveDashboard === "function") renderExecutiveDashboard();
    await loadLiveTerms();

    // ── Missing Student Audit: check uploaded scores against the directory ──
    if (_studentDirectory.length > 0) {
      const uploadedClasses = [...new Set(allRowsToSave.map(r => r.class).filter(Boolean))];
      triggerPostUploadMissingCheck(term, subjectList, uploadedClasses);
    }

    setTimeout(() => {
      $("csvClearBtn")?.click();
      if ($("uploadProgressWrap")) $("uploadProgressWrap").style.display = "none";
    }, 3000);
  } catch (e) {
    setUploadProgress(0, "");
    if ($("uploadProgressWrap")) $("uploadProgressWrap").style.display = "none";
    setUploadError("Upload failed: " + e.message);
  }
  $("uploadScoresBtn").disabled = false;
};

function setUploadProgress(pct, text) {
  $("uploadProgressBar").style.width = pct + "%";
  $("uploadProgressText").textContent = text;
}

// ══════════════════════════════════════════════════════════════════════════
// STUDENT DIRECTORY MANAGER & AUDIT NORMALIZATION HELPERS
// ══════════════════════════════════════════════════════════════════════════

let _studentDirectory = []; // { fullName, reg, class, arm, gender, status }
let _studentDirectoryPromise = null;
let _studentDirectoryLoaded = false;

function auditCanonicalSubject(subjectName) {
  if (typeof canonicalSubjectKey === "function") return canonicalSubjectKey(subjectName);
  return String(subjectName || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeAuditClassKey(className) {
  if (typeof normalizeClassLevelKey === "function") return normalizeClassLevelKey(className);
  return String(className || "").trim().toUpperCase().replace(/\s+/g, " ");
}

function normalizeAuditRegKey(reg) {
  return String(reg || "").trim().toUpperCase();
}

function compactAuditRegKey(reg) {
  return String(reg || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function normalizeAuditNameKey(name) {
  return String(name || "").trim().toUpperCase().replace(/\s+/g, " ");
}

function sortedAuditNameTokens(name) {
  const norm = normalizeAuditNameKey(name);
  if (!norm) return "";
  return norm.split(" ").filter(Boolean).sort().join(" ");
}

function getStudentIdentityLookupKeys(reg, name, clsKey) {
  const keys = [];
  const rExact = normalizeAuditRegKey(reg);
  const rCompact = compactAuditRegKey(reg);
  const nNorm = normalizeAuditNameKey(name);
  const nTokens = sortedAuditNameTokens(name);
  if (rExact) keys.push(`R:${rExact}`);
  if (rCompact && rCompact !== rExact) keys.push(`C:${rCompact}`);
  if (nNorm && clsKey) keys.push(`N:${nNorm}|${clsKey}`);
  if (nTokens && clsKey && nTokens !== nNorm) keys.push(`T:${nTokens}|${clsKey}`);
  return keys;
}

function indexStudentWrittenSubject(writtenMap, reg, name, clsKey, subCanon) {
  if (!subCanon) return;
  getStudentIdentityLookupKeys(reg, name, clsKey).forEach(k => {
    if (!writtenMap.has(k)) writtenMap.set(k, new Set());
    writtenMap.get(k).add(subCanon);
  });
}

function getStudentWrittenSubjects(writtenMap, reg, name, clsKey) {
  const combined = new Set();
  getStudentIdentityLookupKeys(reg, name, clsKey).forEach(k => {
    const subs = writtenMap.get(k);
    if (subs) subs.forEach(s => combined.add(s));
  });
  return combined;
}

function isSubjectInClassCurriculum(className, subjectName) {
  const clsKey = normalizeAuditClassKey(className);
  const subCanon = auditCanonicalSubject(subjectName);
  const curr = (typeof SCHOOL_CLASS_CURRICULUM !== "undefined") ? SCHOOL_CLASS_CURRICULUM[clsKey] : null;
  if (!curr || !subCanon) return true;
  if (curr.core.some(c => auditCanonicalSubject(c) === subCanon)) return true;
  return (curr.choiceGroups || []).some(g => g.options.some(opt => auditCanonicalSubject(opt) === subCanon));
}

function auditIsWithdrawnStudent(reg, fullName) {
  if (typeof isWithdrawnStudent === "function") return isWithdrawnStudent(reg, fullName);
  return false;
}

function normalizeStudentRegForKey(reg) {
  const clean = String(reg || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!clean || clean === "NA" || clean === "NONE" || clean === "NULL" || clean === "0" || clean === "NIL") return "";
  return clean;
}

function normalizeStudentNameTokens(name) {
  return String(name || "")
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function isOfficialStudentReg(regC) {
  return /^STDS\d+/i.test(String(regC || ""));
}

function areStudentRegsCompatible(regA, regB) {
  if (!regA || !regB) return true;
  if (regA === regB) return true;
  // Two DIFFERENT official STDS registration numbers belong to two distinct students;
  // temporary CBT IDs (e.g. STD1785, ST-2026-223) can merge with an official STDS profile.
  if (isOfficialStudentReg(regA) && isOfficialStudentReg(regB)) return false;
  return true;
}

function buildCanonicalStudentResolver(scoreRows, studentDirectory) {
  const canonicalProfiles = [];
  const byReg = new Map();
  const byExactNameCls = new Map();
  const bySortedTokCls = new Map();
  const byTokenCls = new Map();
  const resolveMemo = new Map();
  let pass1Done = false;

  const indexProfile = (profile) => {
    if (profile.regC) byReg.set(profile.regC, profile);
    if (profile.normName) {
      const k = `${profile.normName}|${profile.clsKey}`;
      if (!byExactNameCls.has(k)) byExactNameCls.set(k, []);
      if (!byExactNameCls.get(k).includes(profile)) byExactNameCls.get(k).push(profile);
    }
    if (profile.sortedTok) {
      const tk = `${profile.sortedTok}|${profile.clsKey}`;
      if (!bySortedTokCls.has(tk)) bySortedTokCls.set(tk, []);
      if (!bySortedTokCls.get(tk).includes(profile)) bySortedTokCls.get(tk).push(profile);
    }
    if (profile.tokenSet && profile.tokens.length >= 2) {
      profile.tokenSet.forEach(tok => {
        const ttk = `${tok}|${profile.clsKey}`;
        let bucket = byTokenCls.get(ttk);
        if (!bucket) { bucket = []; byTokenCls.set(ttk, bucket); }
        if (!bucket.includes(profile)) bucket.push(profile);
      });
    }
  };

  const registerProfile = (name, reg, cls, arm) => {
    const regC = normalizeStudentRegForKey(reg);
    const rawNameKey = String(name || "").trim().toUpperCase();

    // Fast path: already-indexed registration number with identical name avoids regex/token sorting
    if (regC && byReg.has(regC)) {
      const existing = byReg.get(regC);
      if (rawNameKey && rawNameKey === existing._lastRawName) {
        const armKeyFast = String(arm || "").trim().toUpperCase();
        if (!existing.armKey && armKeyFast && armKeyFast !== "-") existing.armKey = armKeyFast;
        return existing;
      }
    }

    const tokens = normalizeStudentNameTokens(name);
    const normName = tokens.join(" ");
    const sortedTok = tokens.length > 1 ? [...tokens].sort().join(" ") : normName;
    const regIsOfficial = isOfficialStudentReg(regC);
    const clsKey = normalizeAuditClassKey(cls || "");
    const armKey = String(arm || "").trim().toUpperCase();
    if (!regC && !normName) return null;

    if (regC && byReg.has(regC)) {
      const existing = byReg.get(regC);
      existing._lastRawName = rawNameKey;
      if (normName && (!existing.normName || tokens.length > existing.tokens.length)) {
        existing.name = normName;
        existing.normName = normName;
        existing.tokens = tokens;
        existing.tokenSet = new Set(tokens);
        existing.sortedTok = sortedTok;
        indexProfile(existing);
      }
      if (!existing.armKey && armKey && armKey !== "-") existing.armKey = armKey;
      if (!existing.clsKey && clsKey && clsKey !== "-") {
        existing.clsKey = clsKey;
        existing.clsDisplay = String(cls || "").trim();
      }
      return existing;
    }

    const findCompatibleMatch = (candidates) => {
      if (!candidates) return null;
      return candidates.find(p => {
        if (!areStudentRegsCompatible(regC, p.regC)) return false;
        if (!regC && !p.regC && armKey && armKey !== "-" && p.armKey && p.armKey !== "-" && armKey !== p.armKey) return false;
        return true;
      }) || null;
    };

    let matched = normName ? findCompatibleMatch(byExactNameCls.get(`${normName}|${clsKey}`)) : null;
    if (!matched && sortedTok) {
      matched = findCompatibleMatch(bySortedTokCls.get(`${sortedTok}|${clsKey}`));
    }

    if (matched) {
      if (regIsOfficial && !matched.isOfficial) {
        matched.reg = String(reg || "").trim();
        matched.regC = regC;
        matched.isOfficial = true;
        if (normName && tokens.length >= matched.tokens.length) {
          matched.name = normName;
          matched.normName = normName;
          matched.tokens = tokens;
          matched.tokenSet = new Set(tokens);
          matched.sortedTok = sortedTok;
        }
        if (armKey && armKey !== "-") matched.armKey = armKey;
      } else if (regC && !matched.regC) {
        matched.reg = String(reg || "").trim();
        matched.regC = regC;
      }
      if (regC) byReg.set(regC, matched);
      if ((!matched.armKey || matched.armKey === "-") && armKey && armKey !== "-") matched.armKey = armKey;
      indexProfile(matched);
      return matched;
    }

    const profile = {
      canonId: canonicalProfiles.length,
      _lastRawName: rawNameKey,
      name: normName || regC,
      normName,
      tokens,
      tokenSet: new Set(tokens),
      sortedTok,
      reg: String(reg || "").trim(),
      regC,
      isOfficial: regIsOfficial,
      clsKey,
      clsDisplay: String(cls || "").trim(),
      armKey
    };
    canonicalProfiles.push(profile);
    indexProfile(profile);
    return profile;
  };

  // Pass 1a: Active Student Directory (authoritative official STDS profiles)
  (studentDirectory || []).forEach(s => {
    const statusLow = String(s.status || "").trim().toLowerCase();
    if (statusLow === "inactive" || statusLow === "withdrawn") return;
    if (auditIsWithdrawnStudent(s.reg, s.fullName)) return;
    registerProfile(s.fullName, s.reg, s.class, s.arm);
  });

  // Pass 1b: Score rows bearing official STDS registration numbers first
  (scoreRows || []).forEach(r => {
    const regC = normalizeStudentRegForKey(r.reg || r.regNo);
    if (isOfficialStudentReg(regC)) {
      registerProfile(r.student || r.name, r.reg || r.regNo, r.class || r.className, r.arm);
    }
  });

  const findTokenMatchForTempRow = (tokens, regC, clsKey, armKey) => {
    if (tokens.length < 2) return null;
    const tSet = new Set(tokens);

    // Inverted token lookup within same class instead of O(N) full scan across all students
    const candidates = [];
    const seenCand = new Set();
    for (let i = 0; i < tokens.length; i++) {
      const bucket = byTokenCls.get(`${tokens[i]}|${clsKey}`);
      if (!bucket) continue;
      for (let j = 0; j < bucket.length; j++) {
        const p = bucket[j];
        if (!seenCand.has(p)) {
          seenCand.add(p);
          candidates.push(p);
        }
      }
    }
    if (!candidates.length) return null;

    // 1. Bidirectional subset match (e.g. "ABATI KIKI" <-> "ABATI MARTHA KIKI",
    //    or "ABAMBA EJIRO OGHENE MICHEAL" <-> "ABAMBA MICHEAL OGHENE")
    const subsetHits = [];
    for (let i = 0; i < candidates.length; i++) {
      const p = candidates[i];
      if (!areStudentRegsCompatible(regC, p.regC)) continue;
      if (tokens.every(t => p.tokenSet.has(t)) || p.tokens.every(t => tSet.has(t))) {
        subsetHits.push(p);
      }
    }
    if (subsetHits.length === 1) return subsetHits[0];
    if (subsetHits.length > 1) {
      const sameArm = subsetHits.filter(p => armKey && p.armKey === armKey);
      if (sameArm.length === 1) return sameArm[0];
      const officialOnly = subsetHits.filter(p => p.isOfficial);
      if (officialOnly.length === 1) return officialOnly[0];
    }

    // 2. Surname + given-name overlap match for temp IDs when middle/hyphen differs
    //    (e.g. "OLAIYA-OLOKOBA MICHEAL" STD1765 <-> "OLAIYA OLUWAMAYOWA MICHEAL" STDS8-2025-111)
    if (!isOfficialStudentReg(regC)) {
      const surname = tokens[0];
      const overlapHits = [];
      for (let i = 0; i < candidates.length; i++) {
        const p = candidates[i];
        if (!p.isOfficial || !p.tokens.length || p.tokens[0] !== surname) continue;
        let sharedCount = 0;
        for (let k = 0; k < tokens.length; k++) {
          if (p.tokenSet.has(tokens[k])) sharedCount++;
        }
        if (sharedCount >= 2) overlapHits.push(p);
      }
      if (overlapHits.length === 1) return overlapHits[0];
    }
    return null;
  };

  const resolveRow = (name, reg, cls, arm) => {
    const memoKey = pass1Done ? `${name || ""}|${reg || ""}|${cls || ""}|${arm || ""}` : "";
    if (memoKey && resolveMemo.has(memoKey)) return resolveMemo.get(memoKey);

    const tokens = normalizeStudentNameTokens(name);
    const normName = tokens.join(" ");
    const sortedTok = tokens.length > 1 ? [...tokens].sort().join(" ") : normName;
    const regC = normalizeStudentRegForKey(reg);
    const clsKey = normalizeAuditClassKey(cls || "");
    const armKey = String(arm || "").trim().toUpperCase();

    let result = null;
    if (regC && byReg.has(regC)) {
      result = byReg.get(regC);
    }

    if (!result && normName) {
      const exacts = (byExactNameCls.get(`${normName}|${clsKey}`) || []).filter(p =>
        areStudentRegsCompatible(regC, p.regC) &&
        (isOfficialStudentReg(p.regC) || !regC || !armKey || armKey === "-" || !p.armKey || armKey === p.armKey)
      );
      if (exacts.length === 1) {
        if (regC) byReg.set(regC, exacts[0]);
        result = exacts[0];
      }
    }

    if (!result && sortedTok) {
      const tokMatches = (bySortedTokCls.get(`${sortedTok}|${clsKey}`) || []).filter(p =>
        areStudentRegsCompatible(regC, p.regC) &&
        (isOfficialStudentReg(p.regC) || !regC || !armKey || armKey === "-" || !p.armKey || armKey === p.armKey)
      );
      if (tokMatches.length === 1) {
        if (regC) byReg.set(regC, tokMatches[0]);
        result = tokMatches[0];
      }
    }

    if (!result && !isOfficialStudentReg(regC)) {
      const tokenHit = findTokenMatchForTempRow(tokens, regC, clsKey, armKey);
      if (tokenHit) {
        if (regC) byReg.set(regC, tokenHit);
        result = tokenHit;
      }
    }

    if (!result) result = registerProfile(name, reg, cls, arm);
    if (memoKey && result && resolveMemo.size < 4000) resolveMemo.set(memoKey, result);
    return result;
  };

  // Pass 1c: Score rows with >= 3 name tokens (even without official STDS reg),
  // resolved through resolveRow so temp multi-token aliases match STDS profiles first.
  const seenTempTriplets = new Set();
  (scoreRows || []).forEach(r => {
    const rReg = r.reg || r.regNo || "";
    const regC = normalizeStudentRegForKey(rReg);
    if (isOfficialStudentReg(regC)) return;
    const rName = r.student || r.name || "";
    const rCls = r.class || r.className || "";
    const rArm = r.arm || "";
    const seenKey = `${regC}|${rName}|${rCls}|${rArm}`;
    if (seenTempTriplets.has(seenKey)) return;
    seenTempTriplets.add(seenKey);
    const tokens = normalizeStudentNameTokens(rName);
    if (tokens.length >= 3) {
      resolveRow(rName, rReg, rCls, rArm);
    }
  });
  pass1Done = true;

  return { resolveRow };
}

// Parse student directory CSV (matches the school's export format)
function parseStudentDirectoryCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return [];
  const headerRaw = lines[0];
  const cols = headerRaw.split(",").map(c => c.replace(/^"|"$/g, "").trim().toLowerCase());
  const idx = {
    fullName: cols.indexOf("full name"),
    reg: cols.indexOf("registration number"),
    cls: cols.indexOf("class"),
    arm: cols.indexOf("arm"),
    gender: cols.indexOf("gender"),
    status: cols.indexOf("status"),
    firstName: cols.indexOf("first name"),
    lastName: cols.indexOf("last name")
  };
  const students = [];
  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim()) continue;
    // CSV-safe split (handles quoted commas)
    const cells = [];
    let inQ = false, cur = "";
    for (let ch of raw) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { cells.push(cur.trim()); cur = ""; }
      else { cur += ch; }
    }
    cells.push(cur.trim());
    const get = (ii) => (ii >= 0 && ii < cells.length) ? cells[ii].replace(/^"|"$/g, "").trim() : "";
    const fullName = get(idx.fullName) || `${get(idx.firstName)} ${get(idx.lastName)}`.trim();
    const reg = get(idx.reg);
    const cls = get(idx.cls);
    const arm = get(idx.arm);
    const status = get(idx.status) || "Active";
    if (!fullName || !cls) continue;
    if (status.toLowerCase() === "inactive" || status.toLowerCase() === "withdrawn") continue;
    if (auditIsWithdrawnStudent(reg, fullName)) continue;
    students.push({ fullName: fullName.toUpperCase(), reg, class: cls, arm: arm.toUpperCase(), gender: get(idx.gender), status });
  }
  return students;
}

function renderDirectorySummary(students) {
  const grid = $("dirSummaryGrid");
  if (!grid) return;
  const byClass = {};
  students.forEach(s => {
    const k = s.class;
    if (!byClass[k]) byClass[k] = 0;
    byClass[k]++;
  });
  grid.innerHTML = Object.entries(byClass).sort((a, b) => a[0].localeCompare(b[0])).map(([cls, cnt]) =>
    `<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.3);font-size:12.5px;font-weight:700;color:var(--text)">
      <span style="color:#818cf8">${esc(cls)}</span>
      <span style="background:var(--surface-alt);border-radius:10px;padding:1px 7px;font-size:11px">${cnt}</span>
    </span>`
  ).join("");
  if ($("dirSummaryWrap")) $("dirSummaryWrap").style.display = "block";
  const badge = $("dirEnrolledBadge");
  if (badge) { badge.textContent = `${students.length} Students Enrolled`; badge.style.display = ""; }
}

async function loadStudentDirectoryFromCloud(forceRefresh = false) {
  if (_studentDirectoryPromise && !forceRefresh) return _studentDirectoryPromise;
  if (forceRefresh) _studentDirectoryLoaded = false;
  _studentDirectoryPromise = (async () => {
    try {
      const result = await window.dbClient.getStudentDirectory();
      if (result && Array.isArray(result.students) && result.students.length > 0) {
        _studentDirectory = result.students.filter(s => !auditIsWithdrawnStudent(s.reg, s.fullName));
        renderDirectorySummary(_studentDirectory);
        populateAuditDropdowns();
        const dtitle = $("dirDropTitle");
        const dsub = $("dirDropSub");
        if (dtitle) dtitle.textContent = `\u2705 Directory loaded: ${_studentDirectory.length} students`;
        if (dsub) dsub.textContent = `Last saved: ${result.uploadedAt ? new Date(result.uploadedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Unknown"}`;
      }
    } catch (e) {
      console.warn("Could not load student directory:", e);
    } finally {
      _studentDirectoryLoaded = true;
    }
    return _studentDirectory;
  })();
  return _studentDirectoryPromise;
}

function handleDirectoryFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const students = parseStudentDirectoryCSV(e.target.result);
    if (!students.length) {
      showToast({ type: "error", title: "Parse Error", message: "No valid student records found. Check the CSV format." });
      return;
    }
    _studentDirectory = students;
    const dtitle = $("dirDropTitle");
    const dsub = $("dirDropSub");
    if (dtitle) dtitle.textContent = `\u2705 ${students.length} students parsed from: ${file.name}`;
    if (dsub) dsub.textContent = "Review summary below, then click '\u{1F4BE} Save Directory to Cloud'";
    const statusRow = $("dirStatusRow");
    if (statusRow) {
      statusRow.style.display = "flex";
      const msg = $("dirStatusMsg");
      if (msg) msg.textContent = `${students.length} active students parsed successfully.`;
      const saveBtn = $("dirSaveBtn");
      if (saveBtn) { saveBtn.style.display = ""; saveBtn.textContent = "\u{1F4BE} Save Directory to Cloud"; saveBtn.disabled = false; }
    }
    renderDirectorySummary(students);
    populateAuditDropdowns();
  };
  reader.readAsText(file);
}

// Wire up Directory dropzone
(function wireDirectoryUpload() {
  const zone = $("dirDropZone");
  const fileInput = $("dirFileInput");
  if (!zone || !fileInput) return;

  zone.onclick = () => fileInput.click();
  zone.ondragover = (e) => { e.preventDefault(); zone.style.borderColor = "var(--accent)"; };
  zone.ondragleave = () => { zone.style.borderColor = "var(--border)"; };
  zone.ondrop = (e) => {
    e.preventDefault();
    zone.style.borderColor = "var(--border)";
    const file = e.dataTransfer.files[0];
    if (file) handleDirectoryFile(file);
  };
  fileInput.onchange = () => { if (fileInput.files[0]) handleDirectoryFile(fileInput.files[0]); };

  const saveBtn = $("dirSaveBtn");
  if (saveBtn) saveBtn.onclick = async () => {
    if (!_studentDirectory.length) return;
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
    try {
      await window.dbClient.saveStudentDirectory(_studentDirectory);
      saveBtn.textContent = "\u2705 Saved!";
      showToast({ type: "success", title: "Directory Saved", message: `${_studentDirectory.length} students saved to cloud.` });
      setTimeout(() => { saveBtn.style.display = "none"; saveBtn.disabled = false; saveBtn.textContent = "\u{1F4BE} Save Directory to Cloud"; }, 2500);
    } catch (e) {
      saveBtn.textContent = "Save Failed";
      saveBtn.disabled = false;
    }
  };

  const clearBtn = $("dirClearBtn");
  if (clearBtn) clearBtn.onclick = () => {
    _studentDirectory = [];
    fileInput.value = "";
    if ($("dirDropTitle")) $("dirDropTitle").textContent = "Click or drag Student Directory CSV here";
    if ($("dirDropSub")) $("dirDropSub").textContent = "Expected columns: Full Name, Registration Number, Class, Arm, Status";
    if ($("dirSummaryWrap")) $("dirSummaryWrap").style.display = "none";
    if ($("dirStatusRow")) $("dirStatusRow").style.display = "none";
    if ($("dirEnrolledBadge")) $("dirEnrolledBadge").style.display = "none";
  };

  const refreshBtn = $("dirRefreshBtn");
  if (refreshBtn) refreshBtn.onclick = () => loadStudentDirectoryFromCloud(true);

  // Auto-load from cloud on page init
  loadStudentDirectoryFromCloud();
})();

// ══════════════════════════════════════════════════════════════════════════
// MISSING EXAM RESULTS AUDIT ENGINE
// ══════════════════════════════════════════════════════════════════════════

function runMissingStudentAudit(filterClass, filterSubject, filterTerm) {
  if (!_studentDirectory.length) {
    showToast({ type: "warn", title: "No Directory", message: "Upload or load the Student Directory first to run the audit." });
    return null;
  }

  const filterTermNorm = normalizeTermKey(filterTerm);
  const filterClsKey = filterClass && filterClass.trim() ? normalizeAuditClassKey(filterClass) : "";
  const filterSubCanon = filterSubject && filterSubject.trim() ? auditCanonicalSubject(filterSubject) : "";

  const studentWrittenMap = new Map();
  allScoreRows.forEach(r => {
    const rTerm = (r.term || "").trim();
    if (filterTermNorm && rTerm && normalizeTermKey(rTerm) !== filterTermNorm) return;
    const rClsKey = normalizeAuditClassKey(r.class || r.className || "");
    if (filterClsKey && rClsKey !== filterClsKey) return;
    const rSubCanon = auditCanonicalSubject(r.subject);
    if (!rSubCanon) return;
    indexStudentWrittenSubject(studentWrittenMap, r.reg, r.student, rClsKey, rSubCanon);
  });

  const enrolled = _studentDirectory.filter(s => {
    const statusLow = (s.status || "").trim().toLowerCase();
    if (statusLow === "inactive" || statusLow === "withdrawn") return false;
    if (auditIsWithdrawnStudent(s.reg, s.fullName)) return false;
    const sClsKey = normalizeAuditClassKey(s.class);
    if (filterClsKey && sClsKey !== filterClsKey) return false;
    if (filterSubCanon && !isSubjectInClassCurriculum(s.class, filterSubject)) return false;
    return true;
  });

  const curConfigMap = (typeof SCHOOL_CLASS_CURRICULUM !== "undefined") ? SCHOOL_CLASS_CURRICULUM : {};

  const missing = enrolled.filter(s => {
    const sClsKey = normalizeAuditClassKey(s.class);
    const written = getStudentWrittenSubjects(studentWrittenMap, s.reg, s.fullName, sClsKey);
    if (!filterSubCanon) return written.size === 0;
    if (written.has(filterSubCanon)) return false;

    const curr = curConfigMap[sClsKey];
    if (curr && curr.choiceGroups) {
      const group = curr.choiceGroups.find(g =>
        g.options.some(opt => auditCanonicalSubject(opt) === filterSubCanon)
      );
      if (group && group.options.some(opt => written.has(auditCanonicalSubject(opt)))) {
        return false;
      }
    }
    return true;
  });

  const haveScore = enrolled.length - missing.length;

  const summaryBar = $("missingAuditSummaryBar");
  if (summaryBar) {
    summaryBar.style.display = "flex";
    const eEl = $("missingAuditEnrolled");
    const hEl = $("missingAuditHaveScore");
    const mEl = $("missingAuditMissing");
    if (eEl) eEl.textContent = `Enrolled: ${enrolled.length}`;
    if (hEl) hEl.textContent = `\u2705 Have score: ${haveScore} (${enrolled.length ? Math.round((haveScore / enrolled.length) * 100) : 0}%)`;
    if (mEl) mEl.textContent = `\u26a0\ufe0f Missing: ${missing.length}`;
  }

  const tbody = $("missingAuditBody");
  if (!tbody) return { missing, enrolled, haveScore };

  if (!missing.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:#10b981;font-weight:700">\u2705 All enrolled students have a score for this selection.</td></tr>`;
    return { missing, enrolled, haveScore };
  }

  tbody.innerHTML = missing.map((s, i) => `
    <tr>
      <td style="padding:8px;text-align:center;color:var(--text-muted)">${i + 1}</td>
      <td style="padding:8px;font-weight:600;color:var(--text)">${esc(s.fullName)}</td>
      <td style="padding:8px;font-family:monospace;font-size:12px;color:var(--text-muted)">${esc(s.reg)}</td>
      <td style="padding:8px">${esc(s.class)}</td>
      <td style="padding:8px">${esc(s.arm)}</td>
      <td style="padding:8px"><span style="padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;background:rgba(245,158,11,0.15);color:#f59e0b">Not Written</span></td>
    </tr>
  `).join("");

  return { missing, enrolled, haveScore };
}

// Wire audit panel
(function wireAuditPanel() {
  const runBtn = $("missingAuditRunBtn");
  if (runBtn) runBtn.onclick = () => {
    const cls = $("missingAuditClass") ? $("missingAuditClass").value : "";
    const subj = $("missingAuditSubject") ? $("missingAuditSubject").value : "";
    const term = $("missingAuditTerm") ? $("missingAuditTerm").value : "";
    runMissingStudentAudit(cls, subj, term);
  };

  const closeBtn = $("missingAuditCloseBtn");
  if (closeBtn) closeBtn.onclick = () => {
    const card = $("missingAuditCard");
    if (card) card.style.display = "none";
  };

  const alertViewBtn = $("missingAlertViewBtn");
  if (alertViewBtn) alertViewBtn.onclick = () => {
    const card = $("missingAuditCard");
    if (card) { card.style.display = ""; card.scrollIntoView({ behavior: "smooth", block: "start" }); }
    const alertEl = $("missingUploadAlert");
    if (alertEl) alertEl.style.display = "none";
  };

  const exportBtn = $("missingAuditExportBtn");
  if (exportBtn) exportBtn.onclick = () => {
    const rows = $("missingAuditBody") ? $("missingAuditBody").querySelectorAll("tr") : [];
    if (!rows.length) return;
    const csv = ["Student Name,Registration Number,Class,Arm,Status"];
    rows.forEach(tr => {
      const cells = tr.querySelectorAll("td");
      if (cells.length < 5) return;
      csv.push([cells[1].textContent.trim(), cells[2].textContent.trim(), cells[3].textContent.trim(), cells[4].textContent.trim(), "Not Written"].map(v => `"${v}"`).join(","));
    });
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `missing_students_audit_${Date.now()}.csv`;
    a.click();
  };
})();

function populateAuditDropdowns(term) {
  const classSet = new Set(_studentDirectory.map(s => s.class));
  const subjectSet = new Set(allScoreRows.map(r => r.subject).filter(Boolean));
  const termSet = new Set(allScoreRows.map(r => r.term).filter(Boolean));

  const clsSel = $("missingAuditClass");
  const subjSel = $("missingAuditSubject");
  const termSel = $("missingAuditTerm");

  if (clsSel) clsSel.innerHTML = `<option value="">All Classes</option>` + [...classSet].sort().map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
  if (subjSel) subjSel.innerHTML = `<option value="">All Subjects</option>` + [...subjectSet].sort().map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join("");
  if (termSel) termSel.innerHTML = `<option value="">All Terms</option>` + [...termSet].sort().map(t => `<option value="${esc(t)}" ${t === term ? "selected" : ""}>${esc(t)}</option>`).join("");
}

function triggerPostUploadMissingCheck(term, subjects, classes) {
  if (!_studentDirectory.length) return;

  const totalMissingSet = new Set();
  const auditResults = [];

  classes.forEach(cls => {
    subjects.forEach(subj => {
      if (!isSubjectInClassCurriculum(cls, subj)) return;
      const result = runMissingStudentAudit(cls, subj, term);
      if (result && result.missing.length > 0) {
        result.missing.forEach(s => totalMissingSet.add(s.reg || s.fullName));
        auditResults.push({ cls, subj, count: result.missing.length });
      }
    });
  });

  if (totalMissingSet.size > 0) {
    const alertEl = $("missingUploadAlert");
    const alertMsg = $("missingUploadAlertMsg");
    if (alertEl && alertMsg) {
      const summary = auditResults.slice(0, 3).map(r => `${r.count} student(s) missing in ${r.cls} \u00b7 ${r.subj}`).join("; ");
      alertMsg.textContent = `${totalMissingSet.size} unique student(s) have no score for this upload. ${summary}${auditResults.length > 3 ? ` +${auditResults.length - 3} more...` : ""}`;
      alertEl.style.display = "block";
      setTimeout(() => { if (alertEl) alertEl.style.display = "none"; }, 30000);
    }
    const auditCard = $("missingAuditCard");
    if (auditCard) auditCard.style.display = "";
    populateAuditDropdowns(term);
    if (auditResults.length > 0) {
      const first = auditResults[0];
      if ($("missingAuditClass")) $("missingAuditClass").value = first.cls;
      if ($("missingAuditSubject")) $("missingAuditSubject").value = first.subj;
      if ($("missingAuditTerm")) $("missingAuditTerm").value = term;
      runMissingStudentAudit(first.cls, first.subj, term);
    }
  }
}

async function loadLiveTerms() {
  const $list = $("liveTermsList");
  if ($list && !$list.children.length) $list.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:13px">Loading live terms from Supabase...</div>';
  try {
    const termList = await window.dbClient.getLiveTerms(allScoreRows);
    termScoreCountsMap = {};
    termList.forEach(t => { termScoreCountsMap[t.term] = t.count; });

    // Update dynamic term selector with live score counts
    renderUploadTermSelector();

    if (!termList.length) {
      if ($list) $list.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:13px">No test scores uploaded yet.</div>';
      return;
    }

    if ($list) {
      $list.innerHTML = termList.map(info => {
        const d = info.date ? new Date(info.date) : null;
        const dateStr = d && !isNaN(d.getTime()) ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently";
        return `<div class="live-term-item"><div><div class="live-term-name">${esc(info.term)}</div><div class="live-term-meta">${info.count.toLocaleString()} scores · ${(info.subjectsCount || 0)} subjects · ${dateStr}</div></div><button type="button" class="btn btn-danger btn-sm" data-delterm="${esc(info.term)}">Delete</button></div>`;
      }).join("");

      document.querySelectorAll("[data-delterm]").forEach(btn => {
        btn.onclick = () => deleteTerm(btn.dataset.delterm);
      });
    }
  } catch (e) {
    if ($list) $list.innerHTML = '<div style="padding:16px;color:var(--status-fail);font-size:13px">Failed to load terms: ' + esc(e.message) + '</div>';
  }
}

async function deleteTerm(term) {
  if (!confirm(`Are you sure you want to delete all scores for "${term}"?\n\nThis will remove it from all teacher portal views.`)) return;

  // 1. Instant optimistic DOM removal from "Live Test Scores" list (0ms wait)
  const $list = $("liveTermsList");
  if ($list) {
    const items = $list.querySelectorAll(".live-term-item");
    items.forEach(it => {
      const nameEl = it.querySelector(".live-term-name");
      if (nameEl && nameEl.textContent.trim().toLowerCase() === term.trim().toLowerCase()) {
        it.style.transition = "opacity 0.2s, transform 0.2s";
        it.style.opacity = "0";
        it.style.transform = "scale(0.95)";
        setTimeout(() => it.remove(), 200);
      }
    });
  }

  // 2. Immediately purge deleted term from in-memory records and local cache
  allScoreRows = allScoreRows.filter(r => (r.term || "").trim().toLowerCase() !== term.trim().toLowerCase());
  delete termScoreCountsMap[term];
  const now = new Date();
  const timeStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  setCachedScores(allScoreRows, now.toISOString(), timeStr);

  // 3. Immediately refresh tabs and dashboard
  renderUploadTermSelector();
  buildAdminTermTabs();
  applyScoreFilters();
  if (typeof renderExecutiveDashboard === "function") renderExecutiveDashboard();

  try {
    // 4. Delete from Supabase cloud (exam_results & live_terms in exam_meta)
    await window.dbClient.deleteTerm(term);

    // 5. Fresh reload from cloud to ensure perfect synchronization
    await loadStudentScores(true);
    await loadLiveTerms();
    renderUploadTermSelector();
    buildAdminTermTabs();
    applyScoreFilters();
    if (typeof renderExecutiveDashboard === "function") renderExecutiveDashboard();
  } catch (e) {
    alert("Delete failed: " + e.message);
    await loadLiveTerms();
  }
}

$("refreshTermsBtn").onclick = loadLiveTerms;

// ============================================================
// CBT EXAMS & OFFLINE JSON DOWNLOADS MODULE
// ============================================================
let allCbtSubmissions = [];
let cbtFilteredSubmissions = [];
let cbtCurrentPage = 1;
let cbtPageSize = 10;
let activePreviewSubmission = null;

// ── School-Wide Active CBT Examination Term (Dynamic & Editable Options) ──
const DEFAULT_CBT_TERM_OPTIONS = [
  "FIRST TERM EXAMINATION",
  "MID TERM TEST",
  "FIRST TEST",
  "SECOND TERM EXAMINATION",
  "SECOND TERM MID TERM TEST",
  "THIRD TERM EXAMINATION",
  "THIRD TERM MID TERM TEST"
];

let savedCbtTerms = [...DEFAULT_CBT_TERM_OPTIONS];
let activeCbtExamTerm = "FIRST TERM EXAMINATION";

function loadSavedCbtTerms() {
  try {
    const raw = localStorage.getItem("cbt_term_options_v2");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        savedCbtTerms = parsed;
      }
    }
  } catch (e) { }
}
loadSavedCbtTerms();

async function syncCbtTermsWithCloud() {
  try {
    if (window.dbClient && typeof window.dbClient.getMeta === "function") {
      const meta = await window.dbClient.getMeta("cbt_term_options_list");
      if (meta && Array.isArray(meta.terms) && meta.terms.length > 0) {
        savedCbtTerms = [...meta.terms];
        localStorage.setItem("cbt_term_options_v2", JSON.stringify(savedCbtTerms));
        renderCbtTermOptions();
      } else if (savedCbtTerms && savedCbtTerms.length > 0) {
        await saveCbtTermsList();
      }
    }
  } catch (err) {
    console.warn("Could not sync cbt terms from cloud:", err);
  }
}

async function saveCbtTermsList() {
  try {
    localStorage.setItem("cbt_term_options_v2", JSON.stringify(savedCbtTerms));
    if (window.dbClient && typeof window.dbClient.setMeta === "function") {
      await window.dbClient.setMeta("cbt_term_options_list", {
        terms: savedCbtTerms,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (e) {
    console.warn("Could not persist cbt terms to cloud:", e);
  }
}

function renderCbtTermOptions() {
  const select = $("cbtAdminTermSelect");

  // Ensure activeCbtExamTerm is in savedCbtTerms
  if (activeCbtExamTerm && !savedCbtTerms.some(t => t.toUpperCase() === activeCbtExamTerm.toUpperCase())) {
    savedCbtTerms.push(activeCbtExamTerm);
  }

  if (select) {
    let opts = savedCbtTerms.map(term => {
      const isSelected = (activeCbtExamTerm && activeCbtExamTerm.trim().toUpperCase() === term.trim().toUpperCase());
      return `<option value="${esc(term)}"${isSelected ? ' selected' : ''}>${esc(term)}</option>`;
    }).join("");

    // Option to quickly add custom term from dropdown
    opts += `<option value="__ADD_NEW_TERM__">➕ Add Custom Term...</option>`;

    select.innerHTML = opts;
    if (activeCbtExamTerm) {
      select.value = activeCbtExamTerm;
    }

    select.onchange = () => {
      const chosen = select.value;
      if (chosen === "__ADD_NEW_TERM__") {
        select.value = activeCbtExamTerm;
        const drawer = $("cbtAdminCustomTermDrawer");
        if (drawer) {
          drawer.classList.add("open");
          const input = $("cbtAdminCustomTermInput");
          if (input) {
            input.value = "";
            input.focus();
          }
        }
        return;
      }
      if (chosen && chosen !== activeCbtExamTerm) {
        setAdminCbtActiveTerm(chosen);
      }
    };
  }

  // Wire Rename & Delete buttons
  const renameBtn = $("cbtRenameTermBtn");
  if (renameBtn) {
    renameBtn.onclick = () => {
      const currentTerm = (select ? select.value : activeCbtExamTerm) || activeCbtExamTerm;
      if (!currentTerm || currentTerm === "__ADD_NEW_TERM__") return;
      const newTerm = prompt("Rename exam term option:", currentTerm);
      if (newTerm && newTerm.trim() && newTerm.trim().toUpperCase() !== currentTerm.toUpperCase()) {
        const cleaned = newTerm.trim().toUpperCase();
        const idx = savedCbtTerms.indexOf(currentTerm);
        if (idx !== -1) savedCbtTerms[idx] = cleaned;
        else savedCbtTerms.push(cleaned);

        saveCbtTermsList();
        if (activeCbtExamTerm.toUpperCase() === currentTerm.toUpperCase()) {
          setAdminCbtActiveTerm(cleaned);
        } else {
          renderCbtTermOptions();
        }
      }
    };
  }

  const deleteBtn = $("cbtDeleteTermBtn");
  if (deleteBtn) {
    deleteBtn.onclick = () => {
      const currentTerm = (select ? select.value : activeCbtExamTerm) || activeCbtExamTerm;
      if (!currentTerm || currentTerm === "__ADD_NEW_TERM__") return;
      if (confirm(`Remove "${currentTerm}" from active term options?`)) {
        savedCbtTerms = savedCbtTerms.filter(t => t.toUpperCase() !== currentTerm.toUpperCase());
        if (savedCbtTerms.length === 0) savedCbtTerms = [...DEFAULT_CBT_TERM_OPTIONS];
        saveCbtTermsList();
        if (activeCbtExamTerm.toUpperCase() === currentTerm.toUpperCase()) {
          setAdminCbtActiveTerm(savedCbtTerms[0]);
        } else {
          renderCbtTermOptions();
        }
      }
    };
  }
}

function addCustomCbtTermOption(termName) {
  if (!termName || !termName.trim()) {
    showToast({
      type: "warning",
      title: "Term Name Required",
      message: "Please enter a term name (e.g. FIRST TERM EXAMINATION)."
    });
    return;
  }
  const cleaned = termName.trim().toUpperCase();

  // If not already in options, add it permanently!
  if (!savedCbtTerms.some(t => t.toUpperCase() === cleaned)) {
    savedCbtTerms.push(cleaned);
    saveCbtTermsList();
  }

  // Set as active term
  setAdminCbtActiveTerm(cleaned);

  // Close custom drawer & clear input
  const drawer = $("cbtAdminCustomTermDrawer");
  if (drawer) drawer.classList.remove("open");
  if ($("cbtAdminCustomTermInput")) $("cbtAdminCustomTermInput").value = "";
}

async function loadAdminCbtActiveTerm() {
  try {
    const cached = localStorage.getItem("cbt_active_term");
    if (cached) {
      activeCbtExamTerm = cached.toUpperCase();
      updateAdminCbtTermUI();
    }
    if (window.dbClient && typeof window.dbClient.getActiveCbtTerm === "function") {
      const cloudTerm = await window.dbClient.getActiveCbtTerm();
      if (cloudTerm) {
        activeCbtExamTerm = cloudTerm.toUpperCase();
        localStorage.setItem("cbt_active_term", activeCbtExamTerm);
        updateAdminCbtTermUI();
      }
    }
    await syncCbtTermsWithCloud();
  } catch (e) {
    console.warn("Could not load cbt_active_term from Supabase:", e);
  }
}

async function setAdminCbtActiveTerm(newTerm) {
  if (!newTerm || !newTerm.trim()) return;
  activeCbtExamTerm = newTerm.trim().toUpperCase();
  localStorage.setItem("cbt_active_term", activeCbtExamTerm);

  // Ensure active term is part of saved options
  if (!savedCbtTerms.some(t => t.toUpperCase() === activeCbtExamTerm)) {
    savedCbtTerms.push(activeCbtExamTerm);
    saveCbtTermsList();
  }

  updateAdminCbtTermUI();

  try {
    if (window.dbClient && typeof window.dbClient.setActiveCbtTerm === "function") {
      await window.dbClient.setActiveCbtTerm(activeCbtExamTerm);
    }
    const badge = $("cbtAdminTermSavedBadge");
    if (badge) {
      badge.textContent = `✓ Set active: "${activeCbtExamTerm}" (Updated for all teachers!)`;
      badge.style.display = "inline";
      setTimeout(() => { badge.style.display = "none"; }, 4000);
    }
    showToast({
      type: "success",
      title: "Active Exam Term Updated",
      message: `CBT examination term set to "${activeCbtExamTerm}". Live for all teachers.`
    });
  } catch (err) {
    console.error("Could not update active term in Supabase:", err);
    showToast({
      type: "error",
      title: "Active Term Sync Failed",
      message: err.message
    });
  }
}

function updateCbtActiveTermHeaderSummary() {
  const summaryEl = $("cbtActiveTermHeaderSummary");
  if (!summaryEl) return;
  const term = activeCbtExamTerm || "FIRST TERM EXAMINATION";
  const dur = (adminCbtDefaults && adminCbtDefaults.duration) || 30;
  const marks = (adminCbtDefaults && adminCbtDefaults.marksPerQuestion != null) ? adminCbtDefaults.marksPerQuestion : 0.4;
  summaryEl.textContent = `${term} · ${dur}m · ${marks} pts/Q`;
}

// Collapsible Dropdown Accordion for CBT Active Term & Defaults
function toggleCbtActiveTermAccordion(forceOpen) {
  const body = $("cbtActiveTermCollapsibleBody");
  const card = $("cbtActiveTermCard");
  const btn = $("cbtToggleActiveTermBtn");
  const text = $("cbtActiveTermToggleText");
  if (!body) return;

  const isCurrentlyOpen = body.classList.contains("open");
  const willOpen = (typeof forceOpen === "boolean") ? forceOpen : !isCurrentlyOpen;

  if (willOpen) {
    body.classList.add("open");
    if (card) card.classList.add("cbt-accordion-open");
    if (btn) btn.classList.add("open");
    if (text) text.textContent = "Collapse Term";
  } else {
    body.classList.remove("open");
    if (card) card.classList.remove("cbt-accordion-open");
    if (btn) btn.classList.remove("open");
    if (text) text.textContent = "Configure Term";
  }
}

if ($("cbtToggleActiveTermBtn")) {
  $("cbtToggleActiveTermBtn").onclick = (e) => {
    e.stopPropagation();
    toggleCbtActiveTermAccordion();
  };
}

if ($("cbtActiveTermHeader")) {
  $("cbtActiveTermHeader").onclick = (e) => {
    if (e.target.closest("button") || e.target.closest("input") || e.target.closest("select")) return;
    toggleCbtActiveTermAccordion();
  };
}

function updateAdminCbtTermUI() {
  if ($("cbtAdminActiveTermDisplay")) {
    $("cbtAdminActiveTermDisplay").textContent = activeCbtExamTerm;
  }
  updateCbtActiveTermHeaderSummary();
  renderCbtTermOptions();
}

// Global buttons wiring for CBT Active Term
if ($("cbtAddCustomTermBtn")) {
  $("cbtAddCustomTermBtn").onclick = () => {
    const drawer = $("cbtAdminCustomTermDrawer");
    if (drawer) {
      drawer.classList.add("open");
      const input = $("cbtAdminCustomTermInput");
      if (input) {
        input.value = "";
        input.focus();
      }
    }
  };
}

if ($("cbtResetTermsBtn")) {
  $("cbtResetTermsBtn").onclick = () => {
    if (confirm("Reset CBT active term options to defaults (First Term Examination, Mid Term Test, First Test, etc.)?")) {
      savedCbtTerms = [...DEFAULT_CBT_TERM_OPTIONS];
      saveCbtTermsList();
      setAdminCbtActiveTerm(savedCbtTerms[0]);
    }
  };
}

if ($("cbtAdminSaveCustomTermBtn")) {
  $("cbtAdminSaveCustomTermBtn").onclick = () => {
    const val = $("cbtAdminCustomTermInput")?.value;
    addCustomCbtTermOption(val);
  };
}

if ($("cbtAdminCancelCustomBtn")) {
  $("cbtAdminCancelCustomBtn").onclick = () => {
    const drawer = $("cbtAdminCustomTermDrawer");
    if (drawer) drawer.classList.remove("open");
  };
}

if ($("cbtAdminCustomTermInput")) {
  $("cbtAdminCustomTermInput").onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      $("cbtAdminSaveCustomTermBtn")?.click();
    }
  };
}

// ── School-Wide CBT Exam Defaults (Duration & Marks) ──
let adminCbtDefaults = { duration: 30, marksPerQuestion: 0.4 };

async function loadAdminCbtDefaults() {
  try {
    const cached = localStorage.getItem("cbt_exam_defaults");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed) {
        if (parsed.duration) adminCbtDefaults.duration = Number(parsed.duration);
        if (parsed.marksPerQuestion !== undefined && parsed.marksPerQuestion !== null && !isNaN(Number(parsed.marksPerQuestion))) {
          adminCbtDefaults.marksPerQuestion = Number(parsed.marksPerQuestion);
        }
        updateAdminCbtDefaultsUI();
      }
    }
    if (window.dbClient && window.dbClient.getCbtExamDefaults) {
      const cloud = await window.dbClient.getCbtExamDefaults();
      if (cloud) {
        if (cloud.duration) adminCbtDefaults.duration = Number(cloud.duration);
        if (cloud.marksPerQuestion !== undefined && cloud.marksPerQuestion !== null && !isNaN(Number(cloud.marksPerQuestion))) {
          adminCbtDefaults.marksPerQuestion = Number(cloud.marksPerQuestion);
        }
        localStorage.setItem("cbt_exam_defaults", JSON.stringify(adminCbtDefaults));
        updateAdminCbtDefaultsUI();
      }
    }
  } catch (e) {
    console.warn("Could not load cbt_exam_defaults from Supabase:", e);
  }
}

function updateAdminCbtDefaultsUI() {
  if ($("cbtAdminGlobalDuration")) $("cbtAdminGlobalDuration").value = adminCbtDefaults.duration;
  if ($("cbtAdminGlobalMarks")) $("cbtAdminGlobalMarks").value = adminCbtDefaults.marksPerQuestion;
  updateCbtActiveTermHeaderSummary();
}

async function saveAdminCbtDefaults() {
  const dur = parseInt($("cbtAdminGlobalDuration")?.value, 10) || 30;
  const marks = parseFloat($("cbtAdminGlobalMarks")?.value) || 0.4;
  adminCbtDefaults = { duration: dur, marksPerQuestion: marks };
  localStorage.setItem("cbt_exam_defaults", JSON.stringify(adminCbtDefaults));
  updateCbtActiveTermHeaderSummary();

  try {
    if (window.dbClient && window.dbClient.setCbtExamDefaults) {
      await window.dbClient.setCbtExamDefaults(adminCbtDefaults);
    }
    const badge = $("cbtAdminDefaultsSavedBadge");
    if (badge) {
      badge.style.display = "inline";
      setTimeout(() => { badge.style.display = "none"; }, 3000);
    }
    showToast({
      type: "success",
      title: "Parameters Saved",
      message: `Enforced school-wide duration (${dur} mins) and marks per question (${marks}).`
    });
  } catch (err) {
    showToast({
      type: "error",
      title: "Save Failed",
      message: "Could not save exam defaults to Supabase: " + err.message
    });
  }
}

// Initial load of CBT active term and defaults (called after declarations)
loadAdminCbtActiveTerm();
loadAdminCbtDefaults();

// Download a JavaScript object as a .json file
function triggerJsonDownload(filename, data) {
  const str = JSON.stringify(data, null, 2);
  const blob = new Blob([str], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 300);
}

// ── CBT Submissions Filtering & Pagination State Helpers ──
function getSubClass(sub) {
  if (sub.className && sub.className !== "All" && sub.className !== "—") return sub.className;
  const match = (sub.title || "").match(/Year\s*([0-9]+)/i);
  if (match) return `Year ${match[1]}`;
  return sub.className || "All";
}

function getSubSubject(sub) {
  if (sub.subjectName && sub.subjectName !== "—" && sub.subjectName !== "-") return sub.subjectName;
  if (typeof resolveCbtSubject === "function") {
    const res = resolveCbtSubject(sub.title || "");
    if (res && res.name) return res.name;
  }
  return "General";
}

function populateCbtFilterOptions() {
  const classSelect = $("cbtFilterClass");
  const subjectSelect = $("cbtFilterSubject");
  if (!classSelect || !subjectSelect) return;

  const currentClass = classSelect.value;
  const currentSubject = subjectSelect.value;

  // Unique classes from submissions + Year 7, 8, 9
  const classSet = new Set(["Year 7", "Year 8", "Year 9"]);
  allCbtSubmissions.forEach(sub => {
    const c = getSubClass(sub);
    if (c && c !== "All" && c !== "—") classSet.add(c);
  });
  const sortedClasses = Array.from(classSet).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
    const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;
    return numA - numB || a.localeCompare(b);
  });

  classSelect.innerHTML = `<option value="">All classes</option>` + sortedClasses.map(c => `
    <option value="${esc(c)}" ${c === currentClass ? 'selected' : ''}>${esc(c)}</option>
  `).join("");

  // Unique subjects from submissions + catalog
  const subjectSet = new Set();
  allCbtSubmissions.forEach(sub => {
    const s = getSubSubject(sub);
    if (s && s !== "General") subjectSet.add(s);
  });
  if (typeof CBT_CONFIG !== "undefined" && CBT_CONFIG.subjects) {
    Object.keys(CBT_CONFIG.subjects).forEach(s => subjectSet.add(s));
  }
  const sortedSubjects = Array.from(subjectSet).sort((a, b) => a.localeCompare(b));

  subjectSelect.innerHTML = `<option value="">All subjects</option>` + sortedSubjects.map(s => `
    <option value="${esc(s)}" ${s === currentSubject ? 'selected' : ''}>${esc(s)}</option>
  `).join("");
}

function filterCbtSubmissions() {
  const classFilter = ($("cbtFilterClass")?.value || "").trim().toLowerCase();
  const subjectFilter = ($("cbtFilterSubject")?.value || "").trim().toLowerCase();
  const query = ($("cbtFilterSearch")?.value || "").trim().toLowerCase();

  cbtFilteredSubmissions = allCbtSubmissions.filter(sub => {
    if (classFilter) {
      const subCls = getSubClass(sub).toLowerCase();
      const titleLower = (sub.title || "").toLowerCase();
      const matchesClass = subCls === classFilter || titleLower.includes(classFilter);
      if (!matchesClass) return false;
    }

    if (subjectFilter) {
      const subSubject = getSubSubject(sub).toLowerCase();
      const titleLower = (sub.title || "").toLowerCase();
      const matchesSubject = subSubject === subjectFilter || titleLower.includes(subjectFilter);
      if (!matchesSubject) return false;
    }

    if (query) {
      const title = (sub.title || "").toLowerCase();
      const teacher = (sub.teacherName || sub.teacherUser || "").toLowerCase();
      const subject = getSubSubject(sub).toLowerCase();
      const cls = getSubClass(sub).toLowerCase();
      const matchesSearch = title.includes(query) || teacher.includes(query) || subject.includes(query) || cls.includes(query);
      if (!matchesSearch) return false;
    }

    return true;
  });

  cbtCurrentPage = 1;
  renderCBTSubmissions();
}

function resetCbtFilters() {
  if ($("cbtFilterClass")) $("cbtFilterClass").value = "";
  if ($("cbtFilterSubject")) $("cbtFilterSubject").value = "";
  if ($("cbtFilterSearch")) $("cbtFilterSearch").value = "";
  filterCbtSubmissions();
}

function updateCbtPaginationUI(startIdx, endIdx, totalRecords, totalPages) {
  const info = $("cbtPaginationInfo");
  if (info) {
    if (totalRecords === 0) {
      info.textContent = "Showing 0 to 0 of 0 exams";
    } else {
      info.textContent = `Showing ${startIdx + 1} to ${endIdx} of ${totalRecords} exam${totalRecords !== 1 ? 's' : ''}`;
    }
  }

  const btnFirst = $("cbtFirstPageBtn");
  const btnPrev = $("cbtPrevPageBtn");
  const btnNext = $("cbtNextPageBtn");
  const btnLast = $("cbtLastPageBtn");
  const btnGroup = $("cbtPageButtonsGroup");

  if (btnFirst) btnFirst.disabled = (cbtCurrentPage <= 1);
  if (btnPrev) btnPrev.disabled = (cbtCurrentPage <= 1);
  if (btnNext) btnNext.disabled = (cbtCurrentPage >= totalPages);
  if (btnLast) btnLast.disabled = (cbtCurrentPage >= totalPages);

  if (btnGroup) {
    btnGroup.innerHTML = "";
    if (totalPages > 1) {
      const maxButtons = 5;
      let startP = Math.max(1, cbtCurrentPage - Math.floor(maxButtons / 2));
      let endP = Math.min(totalPages, startP + maxButtons - 1);
      if (endP - startP + 1 < maxButtons) {
        startP = Math.max(1, endP - maxButtons + 1);
      }
      for (let p = startP; p <= endP; p++) {
        const pBtn = document.createElement("button");
        pBtn.type = "button";
        pBtn.className = "page-btn" + (p === cbtCurrentPage ? " active" : "");
        pBtn.textContent = p;
        pBtn.onclick = () => { cbtCurrentPage = p; renderCBTSubmissions(); };
        btnGroup.appendChild(pBtn);
      }
    }
  }
}

// Load submissions created by teachers from Supabase
async function loadCBTSubmissions() {
  const tbody = $("cbtSubmissionsTbody");
  if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted)">Loading teacher submissions from Supabase…</td></tr>';
  try {
    const sbSubs = await window.dbClient.getSubmissions();
    allCbtSubmissions = Array.isArray(sbSubs) ? sbSubs : [];
    allCbtSubmissions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const badge = cbtSubCountBadge;
    if (badge) {
      badge.textContent = allCbtSubmissions.length;
      badge.style.display = allCbtSubmissions.length ? "inline-block" : "none";
    }

    populateCbtFilterOptions();
    filterCbtSubmissions();

    // Check for re-uploaded / updated exams to show the top alert banner
    const reuploadedSubs = allCbtSubmissions.filter(s => s.isUpdate || (s.version && s.version > 1) || s.status === "Updated by Teacher");
    const banner = $("cbtReuploadedAlertBanner");
    const bannerText = $("cbtReuploadedAlertText");
    if (banner && bannerText) {
      if (reuploadedSubs.length > 0) {
        banner.style.display = "flex";
        bannerText.textContent = `${reuploadedSubs.length} CBT exam${reuploadedSubs.length > 1 ? 's have' : ' has'} been re-uploaded or edited by subject teachers. Look for the "🔄 Re-uploaded (vX)" badge in the table below before exporting offline JSON.`;
      } else {
        banner.style.display = "none";
      }
    }
  } catch (err) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--status-fail)">Failed to load submissions: ' + esc(err.message) + '</td></tr>';
  }
}

function renderCBTSubmissions() {
  const tbody = $("cbtSubmissionsTbody");
  if (!tbody) return;

  if (!allCbtSubmissions.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted)">No teacher exam submissions yet. When teachers upload from home in Notepad or Word, their exams will appear here ready to download as JSON.</td></tr>`;
    updateCbtPaginationUI(0, 0, 0, 1);
    return;
  }

  if (!cbtFilteredSubmissions.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted)">No exam submissions match your filter criteria. <button type="button" class="btn btn-secondary btn-sm" id="cbtInlineResetBtn" style="margin-left:8px">Reset filters</button></td></tr>`;
    if ($("cbtInlineResetBtn")) $("cbtInlineResetBtn").onclick = resetCbtFilters;
    updateCbtPaginationUI(0, 0, 0, 1);
    return;
  }

  const totalRecords = cbtFilteredSubmissions.length;
  const isAll = cbtPageSize === "All";
  const numPageSize = isAll ? totalRecords : (Number(cbtPageSize) || 10);
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(totalRecords / numPageSize));

  if (cbtCurrentPage > totalPages) cbtCurrentPage = totalPages;
  if (cbtCurrentPage < 1) cbtCurrentPage = 1;

  const startIdx = isAll ? 0 : (cbtCurrentPage - 1) * numPageSize;
  const endIdx = isAll ? totalRecords : Math.min(startIdx + numPageSize, totalRecords);
  const pageSubmissions = cbtFilteredSubmissions.slice(startIdx, endIdx);

  tbody.innerHTML = pageSubmissions.map(sub => {
    const qCount = (Array.isArray(sub.questions) && sub.questions.length > 0) ? sub.questions.length : (Number(sub.numberOfQuestions) || Number(sub.totalQuestions) || 0);
    const resolvedSubName = getSubSubject(sub);
    const resolvedClass = getSubClass(sub);
    const classInfo = resolveCbtClass(sub.className || resolvedClass || "");
    const totalArms = (classInfo.arms || []).length;
    let subArmCount = totalArms;
    if (Array.isArray(sub.selectedArms) && sub.selectedArms.length > 0) {
      subArmCount = sub.selectedArms.length;
    } else if (Array.isArray(sub.arm) && sub.arm.length > 0) {
      subArmCount = sub.arm.length;
    }
    const armBadgeText = (totalArms > 0 && subArmCount >= totalArms) ? "All Arms" : `${subArmCount} Arm${subArmCount === 1 ? '' : 's'}`;

    const isReupload = !!(sub.isUpdate || (sub.version && sub.version > 1) || sub.status === "Updated by Teacher");
    const versionNum = sub.version || (isReupload ? 2 : 1);
    const lastUpText = sub.lastUpdated ? new Date(sub.lastUpdated).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

    return `
      <tr${isReupload ? ' style="background:rgba(245, 158, 11, 0.04);"' : ''}>
        <td style="font-weight:600;color:var(--text)">
          <div>${esc(sub.title || "Untitled Exam")}</div>
          ${isReupload ? `
            <div style="margin-top:5px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <span class="badge-pill" style="background:#fef3c7;color:#b45309;border:1px solid #fcd34d;font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px;display:inline-flex;align-items:center;gap:4px;" title="Teacher updated or re-uploaded these questions">
                🔄 Re-uploaded (v${versionNum})
              </span>
              ${lastUpText ? `<span style="font-size:11px;color:var(--text-muted);font-weight:normal;">Updated: ${esc(lastUpText)}</span>` : ''}
            </div>
          ` : ''}
        </td>
        <td>${esc(sub.teacherName || sub.teacherUser || "Teacher")}</td>
        <td>
          <span style="font-weight:600">${esc(resolvedSubName)}</span> <span style="color:var(--text-muted)">(${esc(resolvedClass)})</span>
          <div style="font-size:11px;color:var(--accent);margin-top:2px;font-weight:600">🎯 ${esc(armBadgeText)}</div>
        </td>
        <td>${sub.duration || 30} mins</td>
        <td><span class="badge-pill badge-good">${qCount} questions</span></td>
        <td style="font-size:12px">
          ${(() => {
        const rawD = sub.launchDate || sub.examDate || sub.startDate;
        let lDate = "27 Oct 2026";
        if (rawD) {
          const dStr = (typeof rawD === "object" && rawD.$date) ? rawD.$date : rawD;
          const parsed = new Date(dStr.includes("T") ? dStr : dStr + "T00:00:00");
          if (!isNaN(parsed.getTime())) lDate = parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        }
        const timeD = `${sub.startTime || sub.gateOpen || "08:00"} – ${sub.endTime || sub.gateClose || "20:00"}`;
        const shufD = sub.shuffle !== false ? "🔀 Shuffled" : "Sequential";
        return `<strong style="color:var(--accent)">📅 ${esc(lDate)}</strong><div style="font-size:11px;color:var(--text-muted)">${esc(timeD)} · ${shufD}</div>`;
      })()}
        </td>
        <td style="text-align:right">
          <div style="display:inline-flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">
            <button type="button" class="btn btn-secondary btn-sm" data-preview-sub="${esc(sub.docId)}">Preview</button>
            <button type="button" class="btn btn-secondary btn-sm" data-dl-exams="${esc(sub.docId)}" title="Download cbtApp_v2.exams.json format">exams.json</button>
            <button type="button" class="btn btn-secondary btn-sm" data-dl-questions="${esc(sub.docId)}" title="Download cbtApp_v2.questions.json format">questions.json</button>
            <button type="button" class="btn btn-sm" data-dl-both="${esc(sub.docId)}" title="Download both JSON files">Both</button>
            <button type="button" class="btn btn-danger btn-sm" data-del-sub="${esc(sub.docId)}">&times;</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  // Attach button events
  tbody.querySelectorAll("[data-preview-sub]").forEach(b => {
    b.onclick = () => openCBTPreview(b.dataset.previewSub);
  });
  tbody.querySelectorAll("[data-dl-exams]").forEach(b => {
    b.onclick = () => downloadSubmissionExamsJson(b.dataset.dlExams);
  });
  tbody.querySelectorAll("[data-dl-questions]").forEach(b => {
    b.onclick = () => downloadSubmissionQuestionsJson(b.dataset.dlQuestions);
  });
  tbody.querySelectorAll("[data-dl-both]").forEach(b => {
    b.onclick = () => downloadSubmissionBothJson(b.dataset.dlBoth);
  });
  tbody.querySelectorAll("[data-del-sub]").forEach(b => {
    b.onclick = () => deleteCBTSubmission(b.dataset.delSub);
  });

  updateCbtPaginationUI(startIdx, endIdx, totalRecords, totalPages);
}

// ── CBT Custom Subjects Storage & State ──
const CBT_CUSTOM_SUBJECTS_KEY = "school_cbt_custom_subjects_v2";
let cbtCustomSubjectsMap = {};
let cbtDeletedDefaults = [];

function loadCbtSubjectsStorage() {
  try {
    const raw = localStorage.getItem(CBT_CUSTOM_SUBJECTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        cbtCustomSubjectsMap = parsed.custom || {};
        cbtDeletedDefaults = Array.isArray(parsed.deleted) ? parsed.deleted : [];
      }
    }
  } catch (e) {
    console.warn("Storage read error for custom subjects:", e);
  }
}

function saveCbtSubjectsStorage() {
  try {
    const payload = JSON.stringify({
      custom: cbtCustomSubjectsMap,
      deleted: cbtDeletedDefaults,
      updatedAt: new Date().toISOString()
    });
    localStorage.setItem(CBT_CUSTOM_SUBJECTS_KEY, payload);

    // Custom subjects saved in local storage
  } catch (e) {
    console.warn("Storage save error for custom subjects:", e);
  }
}

function refreshCbtSubjectsCatalog() {
  loadCbtSubjectsStorage();
  const merged = { ...DEFAULT_CBT_SUBJECTS };

  // Remove defaults marked deleted
  cbtDeletedDefaults.forEach(k => {
    delete merged[k];
  });

  // Apply custom / edited subjects
  Object.entries(cbtCustomSubjectsMap).forEach(([k, id]) => {
    merged[k] = id;
  });

  CBT_CONFIG.subjects = merged;

  // Update Teacher Modal Subjects Checkboxes
  const allSubNames = Object.keys(merged).sort((a, b) => a.localeCompare(b));
  if ($("subjectsCheckGrid")) {
    const selectedBefore = new Set([...document.querySelectorAll(".sub-chk:checked")].map(c => c.value));
    $("subjectsCheckGrid").innerHTML = allSubNames.map(s => `
      <label class="check-item"><input type="checkbox" class="sub-chk" value="${esc(s)}" ${selectedBefore.has(s) ? 'checked' : ''}> ${esc(s)}</label>
    `).join("");
  }

  renderCbtSubjectsTable();
}

function renderCbtSubjectsTable() {
  const tbody = $("cbtSubjectsTbody");
  if (!tbody) return;

  const q = ($("cbtSubjectSearchInput")?.value || "").toLowerCase().trim();
  const entries = Object.entries(CBT_CONFIG.subjects).sort((a, b) => a[0].localeCompare(b[0]));

  const filtered = entries.filter(([name, id]) => {
    if (!q) return true;
    return name.toLowerCase().includes(q) || id.toLowerCase().includes(q);
  });

  const total = entries.length;
  if ($("cbtSubjectCountLabel")) {
    $("cbtSubjectCountLabel").textContent = `${total} subject${total !== 1 ? 's' : ''} configured${q ? ` (${filtered.length} matching)` : ''}`;
  }
  if ($("cbtSubjectsHeaderCount")) {
    $("cbtSubjectsHeaderCount").textContent = `${total} subjects`;
  }

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-muted)">No subjects match "${esc(q)}". <button type="button" class="btn btn-secondary btn-sm" id="cbtClearSearchBtn">Clear search</button></td></tr>`;
    if ($("cbtClearSearchBtn")) {
      $("cbtClearSearchBtn").onclick = () => {
        $("cbtSubjectSearchInput").value = "";
        renderCbtSubjectsTable();
      };
    }
    return;
  }

  tbody.innerHTML = filtered.map(([name, id], idx) => {
    const isCustom = Boolean(cbtCustomSubjectsMap[name] && !DEFAULT_CBT_SUBJECTS[name]);
    const isOverridden = Boolean(DEFAULT_CBT_SUBJECTS[name] && cbtCustomSubjectsMap[name] && cbtCustomSubjectsMap[name] !== DEFAULT_CBT_SUBJECTS[name]);

    let badgeHtml = `<span class="badge-pill badge-good" style="font-size:10px">Prebuilt</span>`;
    if (isOverridden) {
      badgeHtml = `<span class="badge-pill" style="font-size:10px;background:#fef3c7;color:#b45309">Edited ID</span>`;
    } else if (isCustom) {
      badgeHtml = `<span class="badge-pill" style="font-size:10px;background:#e0f2fe;color:#0284c7">Custom</span>`;
    }

    return `
      <tr>
        <td style="color:var(--text-muted);font-size:12px">${idx + 1}</td>
        <td style="font-weight:600;color:var(--text)">${esc(name)}</td>
        <td>
          <div style="display:flex;align-items:center;gap:6px">
            <code style="font-size:11px;background:var(--bg-subtle);padding:2px 6px;border-radius:4px;border:1px solid var(--border);color:var(--text)">${esc(id)}</code>
            <button type="button" class="btn btn-secondary btn-sm" style="font-size:10px;padding:2px 6px" data-copy-id="${esc(id)}" title="Copy MongoDB ObjectId">Copy</button>
          </div>
        </td>
        <td>${badgeHtml}</td>
        <td style="text-align:right">
          <div style="display:inline-flex;gap:6px;justify-content:flex-end">
            <button type="button" class="btn btn-secondary btn-sm" data-edit-subject="${esc(name)}">Edit</button>
            <button type="button" class="btn btn-danger btn-sm" data-del-subject="${esc(name)}" title="Remove subject">&times;</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll("[data-copy-id]").forEach(b => {
    b.onclick = () => {
      navigator.clipboard.writeText(b.dataset.copyId).then(() => {
        const orig = b.textContent;
        b.textContent = "Copied!";
        setTimeout(() => b.textContent = orig, 1200);
      });
    };
  });

  tbody.querySelectorAll("[data-edit-subject]").forEach(b => {
    b.onclick = () => openEditCbtSubjectModal(b.dataset.editSubject);
  });

  tbody.querySelectorAll("[data-del-subject]").forEach(b => {
    b.onclick = () => deleteCbtSubject(b.dataset.delSubject);
  });
}

function openAddCbtSubjectModal() {
  toggleCbtSubjectsAccordion(true);
  $("cbtSubjectModalTitle").textContent = "Add New CBT Subject";
  $("cbtSubjectOrigKey").value = "";
  $("cbtSubjectNameInput").value = "";
  $("cbtSubjectIdInput").value = generateObjectId();
  $("cbtSubjectModalErrorMsg").textContent = "";
  $("cbtSubjectModal").classList.add("open");
  setTimeout(() => $("cbtSubjectNameInput").focus(), 80);
}

function openEditCbtSubjectModal(name) {
  const currentId = CBT_CONFIG.subjects[name] || generateObjectId();
  $("cbtSubjectModalTitle").textContent = `Edit Subject: ${name}`;
  $("cbtSubjectOrigKey").value = name;
  $("cbtSubjectNameInput").value = name;
  $("cbtSubjectIdInput").value = currentId;
  $("cbtSubjectModalErrorMsg").textContent = "";
  $("cbtSubjectModal").classList.add("open");
  setTimeout(() => $("cbtSubjectNameInput").focus(), 80);
}

function closeCbtSubjectModal() {
  $("cbtSubjectModal").classList.remove("open");
}

function saveCbtSubjectFromModal() {
  const origKey = $("cbtSubjectOrigKey").value.trim();
  const name = $("cbtSubjectNameInput").value.trim();
  const id = $("cbtSubjectIdInput").value.trim().toLowerCase();

  if (!name) {
    $("cbtSubjectModalErrorMsg").textContent = "Please enter a subject name.";
    return;
  }
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    $("cbtSubjectModalErrorMsg").textContent = "MongoDB ObjectId must be exactly 24 hexadecimal characters (0-9, a-f).";
    return;
  }

  // Renaming
  if (origKey && origKey !== name) {
    delete cbtCustomSubjectsMap[origKey];
    if (DEFAULT_CBT_SUBJECTS[origKey]) {
      if (!cbtDeletedDefaults.includes(origKey)) cbtDeletedDefaults.push(origKey);
    }
  }

  cbtDeletedDefaults = cbtDeletedDefaults.filter(k => k !== name);
  cbtCustomSubjectsMap[name] = id;

  saveCbtSubjectsStorage();
  refreshCbtSubjectsCatalog();
  closeCbtSubjectModal();
  showToast({
    type: "success",
    title: origKey ? "Subject Updated" : "Subject Added",
    message: `Subject "${name}" saved to CBT catalog.`
  });
}

function deleteCbtSubject(name) {
  if (!confirm(`Are you sure you want to remove "${name}" from the CBT catalog?\n\nExams referencing this subject will fallback to standard defaults unless restored.`)) return;

  delete cbtCustomSubjectsMap[name];
  if (DEFAULT_CBT_SUBJECTS[name]) {
    if (!cbtDeletedDefaults.includes(name)) cbtDeletedDefaults.push(name);
  }

  saveCbtSubjectsStorage();
  refreshCbtSubjectsCatalog();
  showToast({
    type: "info",
    title: "Subject Removed",
    message: `Subject "${name}" removed from CBT catalog.`
  });
}

function resetCbtSubjectsToDefault() {
  if (!confirm("Reset the subjects catalog back to the original 45 standard prebuilt subjects?\n\nAny custom subjects or modified ObjectIds will be restored.")) return;
  cbtCustomSubjectsMap = {};
  cbtDeletedDefaults = [];
  saveCbtSubjectsStorage();
  refreshCbtSubjectsCatalog();
  showToast({
    type: "success",
    title: "Catalog Reset",
    message: "Restored CBT subjects catalog to 45 standard defaults."
  });
}

function exportCbtSubjectsJson() {
  const entries = Object.entries(CBT_CONFIG.subjects).sort((a, b) => a[0].localeCompare(b[0]));
  const mongoSubjects = entries.map(([name, id]) => ({
    _id: { $oid: id },
    subject: name,
    createdAt: { $date: new Date().toISOString() },
    updatedAt: { $date: new Date().toISOString() },
    __v: 0
  }));

  triggerJsonDownload("cbtApp_v2.subjects.json", mongoSubjects);
  showToast({
    type: "success",
    title: "JSON Exported",
    message: `Exported ${entries.length} subjects to cbtApp_v2.subjects.json.`
  });
}

// Collapsible Dropdown Accordion for CBT Subjects Catalog
function toggleCbtSubjectsAccordion(forceOpen) {
  const body = $("cbtSubjectsCollapsibleBody");
  const card = $("cbtSubjectsManagerCard");
  const btn = $("cbtToggleSubjectsBtn");
  const text = $("cbtSubjectsToggleText");
  if (!body) return;

  const isCurrentlyOpen = body.classList.contains("open");
  const willOpen = (typeof forceOpen === "boolean") ? forceOpen : !isCurrentlyOpen;

  if (willOpen) {
    body.classList.add("open");
    if (card) card.classList.add("cbt-accordion-open");
    if (btn) btn.classList.add("open");
    if (text) text.textContent = "Collapse Catalog";
  } else {
    body.classList.remove("open");
    if (card) card.classList.remove("cbt-accordion-open");
    if (btn) btn.classList.remove("open");
    if (text) text.textContent = "Expand Catalog";
  }
}

if ($("cbtToggleSubjectsBtn")) {
  $("cbtToggleSubjectsBtn").onclick = (e) => {
    e.stopPropagation();
    toggleCbtSubjectsAccordion();
  };
}

if ($("cbtSubjectsHeader")) {
  $("cbtSubjectsHeader").onclick = (e) => {
    if (e.target.closest("button") || e.target.closest("input")) return;
    toggleCbtSubjectsAccordion();
  };
}

// Attach CBT Subjects Manager Event Listeners
$("cbtOpenAddSubjectBtn").onclick = openAddCbtSubjectModal;
$("cbtResetSubjectsBtn").onclick = resetCbtSubjectsToDefault;
$("cbtExportSubjectsJsonBtn").onclick = exportCbtSubjectsJson;
$("cbtSubjectSearchInput").oninput = renderCbtSubjectsTable;
$("cbtGenerateSubjectIdBtn").onclick = () => {
  $("cbtSubjectIdInput").value = generateObjectId();
};
$("cbtSubjectModalCloseBtn").onclick = closeCbtSubjectModal;
$("cbtSubjectModalCancelBtn").onclick = closeCbtSubjectModal;
$("cbtSubjectModalSaveBtn").onclick = saveCbtSubjectFromModal;

// ══════════════════════════════════════════════════════════
// CBT TERMS & ACADEMIC SESSIONS CATALOG MANAGER
// ══════════════════════════════════════════════════════════

async function loadCbtTermsMappings() {
  try {
    if (window.dbClient && typeof window.dbClient.getMeta === "function") {
      const meta = await window.dbClient.getMeta("cbt_term_mappings");
      if (meta && typeof meta === "object") {
        if (meta.terms && typeof meta.terms === "object") {
          localStorage.setItem("school_cbt_custom_terms_v1", JSON.stringify(meta.terms));
        }
        if (meta.sessions && typeof meta.sessions === "object") {
          localStorage.setItem("school_cbt_custom_sessions_v1", JSON.stringify(meta.sessions));
        }
        if (typeof refreshCbtTermsAndSessions === "function") refreshCbtTermsAndSessions();
      }
    }
  } catch (e) {
    console.warn("Failed fetching cbt_term_mappings from cloud:", e);
  }

  const termInputs = document.querySelectorAll(".cbt-term-id-input");
  termInputs.forEach(inp => {
    const key = inp.dataset.termKey;
    if (key && CBT_CONFIG.terms && CBT_CONFIG.terms[key]) {
      inp.value = CBT_CONFIG.terms[key];
    }
  });

  const sessInput = $("mongoSessionIdInput");
  if (sessInput) {
    sessInput.value = CBT_CONFIG.session || (CBT_CONFIG.sessions && Object.values(CBT_CONFIG.sessions)[0]) || "6aabf6c9fe918aaa23f28245";
  }
}

async function saveCbtTermsMappings() {
  const customTerms = { ...(CBT_CONFIG.terms || DEFAULT_CBT_TERMS) };
  const termInputs = document.querySelectorAll(".cbt-term-id-input");
  let hasInvalid = false;

  termInputs.forEach(inp => {
    const key = inp.dataset.termKey;
    const val = (inp.value || "").trim();
    if (val) {
      if (!/^[0-9a-fA-F]{24}$/.test(val)) {
        inp.style.borderColor = "#ef4444";
        hasInvalid = true;
      } else {
        inp.style.borderColor = "";
        customTerms[key] = val;
        if (key === "FIRST TERM FIRST TEST") customTerms["FIRST TEST"] = val;
        if (key === "MID TERM EXAMINATION") {
          customTerms["MID TERM"] = val;
          customTerms["MID TERM TEST"] = val;
          customTerms["FIRST TERM MID TERM EXAMINATION"] = val;
        }
        if (key === "FIRST TERM EXAMINATION") customTerms["FIRST TERM"] = val;
        if (key === "SECOND TERM EXAMINATION") customTerms["SECOND TERM"] = val;
        if (key === "THIRD TERM EXAMINATION") customTerms["THIRD TERM"] = val;
      }
    }
  });

  if (hasInvalid) {
    showToast({
      type: "error",
      title: "Invalid ObjectId",
      message: "One or more MongoDB ObjectIds are invalid. Each ObjectId must be exactly 24 hexadecimal characters (0-9, a-f)."
    });
    return;
  }

  const sessInput = $("mongoSessionIdInput");
  const sessVal = (sessInput?.value || "").trim();
  const customSessions = { ...(CBT_CONFIG.sessions || DEFAULT_CBT_SESSIONS) };
  if (sessVal) {
    if (!/^[0-9a-fA-F]{24}$/.test(sessVal)) {
      if (sessInput) sessInput.style.borderColor = "#ef4444";
      showToast({
        type: "error",
        title: "Invalid Session ID",
        message: "Academic Session ObjectId must be exactly 24 hexadecimal characters."
      });
      return;
    }
    if (sessInput) sessInput.style.borderColor = "";
    CBT_CONFIG.session = sessVal;
    customSessions["2026/2027"] = sessVal;
    customSessions["active"] = sessVal;
  }

  localStorage.setItem("school_cbt_custom_terms_v1", JSON.stringify(customTerms));
  localStorage.setItem("school_cbt_custom_sessions_v1", JSON.stringify(customSessions));

  if (typeof refreshCbtTermsAndSessions === "function") refreshCbtTermsAndSessions();

  try {
    if (window.dbClient && typeof window.dbClient.setMeta === "function") {
      await window.dbClient.setMeta("cbt_term_mappings", {
        terms: customTerms,
        sessions: customSessions,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn("Could not sync cbt_term_mappings to cloud:", err);
  }

  const fb = $("cbtTermsSavedFeedback");
  if (fb) {
    fb.style.display = "inline";
    setTimeout(() => { fb.style.display = "none"; }, 3500);
  }

  showToast({
    type: "success",
    title: "Mappings Saved",
    message: "Term & Academic Session MongoDB ObjectIds synchronized with cloud."
  });
}

function exportCbtTermsJson() {
  const termsList = [
    { name: "First Term First Test", key: "FIRST TERM FIRST TEST" },
    { name: "Mid Term Test", key: "MID TERM EXAMINATION" },
    { name: "First Term Examination", key: "FIRST TERM EXAMINATION" },
    { name: "Second Term First Test", key: "SECOND TERM FIRST TEST" },
    { name: "Second Term Mid Term Examination", key: "SECOND TERM MID TERM EXAMINATION" },
    { name: "Second Term Examination", key: "SECOND TERM EXAMINATION" },
    { name: "Third Term First Test", key: "THIRD TERM FIRST TEST" },
    { name: "Third Term Mid Term Examination", key: "THIRD TERM MID TERM EXAMINATION" },
    { name: "Third Term Examination", key: "THIRD TERM EXAMINATION" }
  ];

  const mongoTerms = termsList.map(t => {
    const id = (CBT_CONFIG.terms && CBT_CONFIG.terms[t.key]) || generateObjectId();
    return {
      _id: { $oid: id },
      term: t.name,
      session: { $oid: CBT_CONFIG.session || "6aabf6c9fe918aaa23f28245" },
      createdAt: { $date: new Date().toISOString() },
      updatedAt: { $date: new Date().toISOString() },
      __v: 0
    };
  });

  triggerJsonDownload("cbtApp_v2.terms.json", mongoTerms);
  showToast({
    type: "success",
    title: "Terms JSON Exported",
    message: "Exported cbtApp_v2.terms.json for MongoDB Compass."
  });
}

function initCbtTermsManager() {
  loadCbtTermsMappings();
  if ($("cbtSaveTermsMappingsBtn")) $("cbtSaveTermsMappingsBtn").onclick = saveCbtTermsMappings;
  if ($("cbtExportTermsJsonBtn")) $("cbtExportTermsJsonBtn").onclick = exportCbtTermsJson;

  const toggleBtn = $("cbtToggleTermsBtn");
  const card = $("cbtTermsManagerCard");
  const header = $("cbtTermsHeader");
  const body = $("cbtTermsCollapsibleBody");
  const text = $("cbtTermsToggleText");

  function toggleTermsAccordion(forceOpen) {
    if (!body) return;
    const isCurrentlyOpen = body.classList.contains("open");
    const willOpen = (typeof forceOpen === "boolean") ? forceOpen : !isCurrentlyOpen;

    if (willOpen) {
      body.classList.add("open");
      if (card) card.classList.add("cbt-accordion-open");
      if (toggleBtn) toggleBtn.classList.add("open");
      if (text) text.textContent = "Collapse Mappings";
    } else {
      body.classList.remove("open");
      if (card) card.classList.remove("cbt-accordion-open");
      if (toggleBtn) toggleBtn.classList.remove("open");
      if (text) text.textContent = "Expand Mappings";
    }
  }

  if (toggleBtn) {
    toggleBtn.onclick = (e) => {
      e.stopPropagation();
      toggleTermsAccordion();
    };
  }

  if (header) {
    header.onclick = (e) => {
      if (e.target.closest("button") || e.target.closest("input")) return;
      toggleTermsAccordion();
    };
  }
}

function getSanitizedSlug(title) {
  return (title || "cbtApp_v2").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "cbt_exam";
}

function buildExportData(sub) {
  const examId = sub.examId || (sub._id?.$oid) || generateObjectId();
  const classInfo = resolveCbtClass(sub.className);
  const subjectInfo = resolveCbtSubject(sub.subjectName || sub.title);

  const realClassId = classInfo.id;
  const realSubjectId = subjectInfo.id;
  const realArms = (classInfo.arms || []).map(a => ({ "$oid": a }));
  const realSessionId = sub.sessionId || resolveCbtSessionId(sub.sessionName) || CBT_CONFIG.session;
  const realTermId = sub.termId || resolveCbtTermId(sub.termName || sub.title || activeCbtExamTerm);

  // Selected cohort arms or all arms
  let finalArms = realArms;
  if (Array.isArray(sub.selectedArms) && sub.selectedArms.length > 0) {
    finalArms = sub.selectedArms.map(a => (typeof a === "object" && a.$oid) ? a : ({ "$oid": a }));
  } else if (Array.isArray(sub.arm) && sub.arm.length > 0) {
    finalArms = sub.arm.map(a => (typeof a === "object" && a.$oid) ? a : ({ "$oid": a }));
  }

  // Calculate Launch Date dynamically
  let startDateIso = "2026-10-27T00:00:00.000Z";
  const rawDate = sub.launchDate || sub.examDate || sub.startDate;
  if (rawDate) {
    const rawVal = (typeof rawDate === "object" && rawDate.$date) ? rawDate.$date : rawDate;
    if (typeof rawVal === "string" && /^\d{4}-\d{2}-\d{2}$/.test(rawVal.trim())) {
      const [y, m, d] = rawVal.trim().split("-").map(Number);
      startDateIso = new Date(Date.UTC(y, m - 1, d, 0, 0, 0)).toISOString();
    } else {
      const parsed = new Date(rawVal);
      if (!isNaN(parsed.getTime())) {
        startDateIso = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), 0, 0, 0)).toISOString();
      }
    }
  } else {
    startDateIso = "2026-10-27T00:00:00.000Z";
  }

  const startTime = sub.startTime || sub.gateOpen || "08:00";
  const endTime = sub.endTime || sub.gateClose || "20:00";
  const shuffle = typeof sub.shuffle === "boolean" ? sub.shuffle : true;

  const questions = (sub.questions || []).map(q => {
    const qId = q._id?.$oid || q.id || generateObjectId();
    const opts = Array.isArray(q.options) ? q.options : (q.optionStrings || []);
    const imgData = q.image || null;
    let exportText = q.text || "";
    if (imgData && !exportText.includes("<img")) {
      exportText = `${exportText}<br><img src="${imgData}" style="max-width:100%;max-height:260px;margin:8px 0;border-radius:4px;display:block" />`;
    }
    return {
      _id: { $oid: qId },
      text: exportText,
      image: imgData,
      options: opts,
      correctAnswer: q.correctAnswer || (opts[0] || ""),
      points: parseFloat(sub.marksPerQuestion !== undefined && sub.marksPerQuestion !== null ? sub.marksPerQuestion : (q.points || adminCbtDefaults.marksPerQuestion || 0.4)),
      test_id: { $oid: examId },
      subject: { $oid: realSubjectId },
      class: { $oid: realClassId },
      createdAt: { $date: new Date().toISOString() },
      updatedAt: { $date: new Date().toISOString() },
      __v: 0
    };
  });

  const exams = [
    {
      _id: { $oid: examId },
      title: (sub.title || `${subjectInfo.name} MID TERM EXAM`).toUpperCase(),
      subject: { $oid: realSubjectId },
      duration: parseInt(sub.duration, 10) || 20,
      questions: questions.map(q => ({ $oid: q._id.$oid })),
      numberOfQuestions: questions.length,
      taken: [],
      teachers: [],
      startDate: { $date: startDateIso },
      startTime: startTime,
      endTime: endTime,
      class: { $oid: realClassId },
      arm: finalArms,
      session: { $oid: realSessionId },
      term: { $oid: realTermId },
      isActive: true,
      shuffle: shuffle,
      allowSameOptions: false,
      createdAt: { $date: new Date().toISOString() },
      updatedAt: { $date: new Date().toISOString() },
      __v: 0
    }
  ];

  return { exams, questions };
}

function downloadSubmissionExamsJson(docId) {
  const sub = allCbtSubmissions.find(s => s.docId === docId);
  if (!sub) return;
  const { exams } = buildExportData(sub);
  const slug = getSanitizedSlug(sub.title);
  triggerJsonDownload(`${slug}.exams.json`, exams);
}

async function ensureSubmissionQuestions(sub) {
  if (!sub) return sub;
  if (Array.isArray(sub.questions) && sub.questions.length > 0) return sub;
  if (window.dbClient && window.dbClient.getSubmission && sub.docId) {
    try {
      const full = await window.dbClient.getSubmission(sub.docId);
      if (full && Array.isArray(full.questions)) {
        sub.questions = full.questions;
      }
    } catch (e) {
      console.warn("Could not fetch full submission questions:", e);
    }
  }
  return sub;
}

async function downloadSubmissionQuestionsJson(docId) {
  const sub = allCbtSubmissions.find(s => s.docId === docId);
  if (!sub) return;
  await ensureSubmissionQuestions(sub);
  const { questions } = buildExportData(sub);
  const slug = getSanitizedSlug(sub.title);
  triggerJsonDownload(`${slug}.questions.json`, questions);
}

async function downloadSubmissionBothJson(docId) {
  const sub = allCbtSubmissions.find(s => s.docId === docId);
  if (!sub) return;
  await ensureSubmissionQuestions(sub);
  const { exams, questions } = buildExportData(sub);
  const slug = getSanitizedSlug(sub.title);
  triggerJsonDownload(`${slug}.exams.json`, exams);
  setTimeout(() => {
    triggerJsonDownload(`${slug}.questions.json`, questions);
  }, 400);
}

async function deleteCBTSubmission(docId) {
  const sub = allCbtSubmissions.find(s => s.docId === docId);
  if (!confirm(`Delete exam "${sub?.title || 'this submission'}"?`)) return;
  try {
    await window.dbClient.deleteSubmission(docId);
    showToast({
      type: "info",
      title: "Exam Deleted",
      message: `Exam "${sub?.title || 'submission'}" was removed.`
    });
    await loadCBTSubmissions();
  } catch (err) {
    showToast({
      type: "error",
      title: "Delete Failed",
      message: err.message
    });
  }
}

async function openCBTPreview(docId) {
  const sub = allCbtSubmissions.find(s => s.docId === docId);
  if (!sub) return;
  await ensureSubmissionQuestions(sub);
  activePreviewSubmission = sub;
  const questions = sub.questions || [];

  $("cbtPreviewModalTitle").textContent = sub.title || "Exam Questions Preview";
  const resolvedSubName = (sub.subjectName && sub.subjectName !== "—" && sub.subjectName !== "-")
    ? sub.subjectName
    : ((typeof resolveCbtSubject === "function" ? resolveCbtSubject(sub.title || "").name : "") || "Biology");
  const isUp = !!(sub.isUpdate || (sub.version && sub.version > 1) || sub.status === "Updated by Teacher");
  const verText = isUp ? ` · 🔄 Version: v${sub.version || 2} (Updated)` : "";
  $("cbtPreviewModalMeta").textContent = `Teacher: ${sub.teacherName || "Staff"} · Subject: ${resolvedSubName} · Class: ${sub.className || "All"} · Duration: ${sub.duration || 30} mins · Total: ${questions.length} questions${verText}`;
  $("cbtPreviewModalFootnote").textContent = `Offline Exam ID: ${sub.examId || sub.docId}`;

  // Populate schedule & parameters
  let launchDateVal = "2026-10-27";
  const rawD = sub.launchDate || sub.examDate || sub.startDate;
  if (rawD) {
    const rawVal = (typeof rawD === "object" && rawD.$date) ? rawD.$date : rawD;
    if (typeof rawVal === "string" && /^\d{4}-\d{2}-\d{2}$/.test(rawVal.trim())) {
      launchDateVal = rawVal.trim();
    } else {
      const parsed = new Date(rawVal);
      if (!isNaN(parsed.getTime())) launchDateVal = parsed.toISOString().slice(0, 10);
    }
  }
  if ($("cbtPreviewLaunchDate")) $("cbtPreviewLaunchDate").value = launchDateVal;
  if ($("cbtPreviewGateOpen")) $("cbtPreviewGateOpen").value = sub.startTime || sub.gateOpen || "08:00";
  if ($("cbtPreviewGateClose")) $("cbtPreviewGateClose").value = sub.endTime || sub.gateClose || "20:00";
  if ($("cbtPreviewDuration")) $("cbtPreviewDuration").value = parseInt(sub.duration || sub.durationMinutes || 40, 10);
  const subMarks = (sub.marksPerQuestion !== undefined && sub.marksPerQuestion !== null && !isNaN(Number(sub.marksPerQuestion)))
    ? Number(sub.marksPerQuestion)
    : (adminCbtDefaults.marksPerQuestion || 0.4);
  if ($("cbtPreviewMarks")) $("cbtPreviewMarks").value = subMarks;
  if ($("cbtPreviewShuffle")) $("cbtPreviewShuffle").checked = sub.shuffle !== false;

  const timeD = `${sub.startTime || sub.gateOpen || "08:00"} – ${sub.endTime || sub.gateClose || "20:00"}`;
  const shufD = sub.shuffle !== false ? "🔀 Shuffled" : "Sequential";
  let displayLaunch = launchDateVal;
  try {
    displayLaunch = new Date(launchDateVal + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch (e) { }

  // Populate Assigned Cohort Arms (Admin Only)
  const classInfo = resolveCbtClass(sub.className || "");
  const availableArms = classInfo.armsDetail || (classInfo.arms || []).map((id, idx) => ({ id, name: `Arm ${idx + 1}` }));

  let currentSelectedArms = [];
  if (Array.isArray(sub.selectedArms) && sub.selectedArms.length > 0) {
    currentSelectedArms = sub.selectedArms.map(a => (typeof a === "object" && a.$oid) ? a.$oid : String(a));
  } else if (Array.isArray(sub.arm) && sub.arm.length > 0) {
    currentSelectedArms = sub.arm.map(a => (typeof a === "object" && a.$oid) ? a.$oid : String(a));
  } else {
    currentSelectedArms = (classInfo.arms || []).map(String);
  }

  const armsContainer = $("cbtPreviewArmsContainer");
  if (armsContainer) {
    if (!availableArms.length) {
      armsContainer.innerHTML = `<span style="font-size:12px;color:var(--text-muted)">No specific arms configured for class "${esc(sub.className || 'Unknown')}".</span>`;
    } else {
      armsContainer.innerHTML = availableArms.map(a => {
        const isChecked = currentSelectedArms.includes(String(a.id));
        return `
          <label style="display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;background:var(--surface-alt);border:1px solid var(--border);padding:4px 10px;border-radius:4px;cursor:pointer;user-select:none">
            <input type="checkbox" class="cbt-admin-arm-checkbox" value="${esc(a.id)}" ${isChecked ? 'checked' : ''} style="cursor:pointer;accent-color:var(--accent)">
            <span>${esc(a.name)}</span>
          </label>
        `;
      }).join("");
    }
  }

  const totalArmsCount = (classInfo.arms || []).length;
  const selArmsCount = currentSelectedArms.length;
  const armsPill = (totalArmsCount > 0 && selArmsCount >= totalArmsCount) ? "All Arms" : `${selArmsCount} Arm${selArmsCount === 1 ? '' : 's'}`;

  if ($("cbtScheduleSummaryPill")) {
    $("cbtScheduleSummaryPill").textContent = `📅 ${displayLaunch} · ${timeD} · ${shufD} · 🎯 ${armsPill}`;
  }
  if ($("cbtScheduleAccordion")) {
    $("cbtScheduleAccordion").open = false;
  }

  renderCBTPreviewQuestions();
  $("cbtPreviewModal").classList.add("open");
}

let adminEditingQIdx = null;
let adminTempQImage = undefined;
let currentAdminEditingCorrectLetter = "A";

async function saveAdminQuestionsToCloud(msg) {
  if (!activePreviewSubmission) return;
  try {
    const qCount = activePreviewSubmission.questions.length;
    activePreviewSubmission.numberOfQuestions = qCount;

    // Use Supabase as primary database to support questions with diagrams exceeding 1MB
    await window.dbClient.saveSubmission(activePreviewSubmission.docId, activePreviewSubmission);
    const idx = allCbtSubmissions.findIndex(s => s.docId === activePreviewSubmission.docId);
    if (idx >= 0) {
      allCbtSubmissions[idx].questions = activePreviewSubmission.questions;
      allCbtSubmissions[idx].numberOfQuestions = qCount;
    }
    renderCBTSubmissions();

    const notice = $("cbtPreviewNotice");
    if (notice) {
      notice.textContent = `✓ ${msg}`;
      notice.style.display = "block";
      setTimeout(() => { notice.style.display = "none"; }, 3500);
    }
  } catch (err) {
    alert("Failed to save question to cloud: " + err.message);
  }
}

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

function renderCBTPreviewQuestions() {
  if (!activePreviewSubmission) return;
  const questions = activePreviewSubmission.questions || [];
  const effectiveMarks = (activePreviewSubmission.marksPerQuestion !== undefined && activePreviewSubmission.marksPerQuestion !== null && !isNaN(Number(activePreviewSubmission.marksPerQuestion)))
    ? Number(activePreviewSubmission.marksPerQuestion)
    : (adminCbtDefaults.marksPerQuestion || 0.4);

  if ($("cbtPreviewCountDisplay")) {
    $("cbtPreviewCountDisplay").textContent = `Questions (${questions.length})`;
  }
  const resolvedSubName = (activePreviewSubmission.subjectName && activePreviewSubmission.subjectName !== "—" && activePreviewSubmission.subjectName !== "-")
    ? activePreviewSubmission.subjectName
    : ((typeof resolveCbtSubject === "function" ? resolveCbtSubject(activePreviewSubmission.title || "").name : "") || "Biology");
  if ($("cbtPreviewModalMeta")) {
    $("cbtPreviewModalMeta").textContent = `Teacher: ${activePreviewSubmission.teacherName || "Staff"} · Subject: ${resolvedSubName} · Class: ${activePreviewSubmission.className || "All"} · Duration: ${activePreviewSubmission.duration || 30} mins · Total: ${questions.length} questions`;
  }

  if (questions.length === 0) {
    $("cbtPreviewModalQuestionsList").innerHTML = `
      <div style="text-align:center;padding:32px;color:var(--text-muted);background:var(--surface-alt);border:1px dashed var(--border);border-radius:var(--radius)">
        No questions in this exam yet. Click <strong>➕ Add Question</strong> above to create one.
      </div>
    `;
    return;
  }

  $("cbtPreviewModalQuestionsList").innerHTML = questions.map((q, idx) => {
    const rawOpts = Array.isArray(q.options) ? q.options : (q.optionStrings || []);
    const opts = rawOpts.map(o => (typeof o === "object" && o !== null && o.text !== undefined) ? o.text : String(o));

    // Normal View
    if (adminEditingQIdx !== idx) {
      const cleanImg = getCleanImageSrc(q.image);
      const imgHtml = cleanImg ? `
        <div style="margin:8px 0;text-align:center">
          <div style="display:inline-block;background:#ffffff;border:1px solid var(--border);border-radius:6px;padding:6px;box-shadow:0 1px 3px rgba(0,0,0,0.06);text-align:center">
            <img src="${cleanImg}" alt="Question ${idx + 1} diagram" style="max-height:160px;max-width:100%;object-fit:contain;border-radius:4px;display:block;margin:0 auto;cursor:zoom-in" data-zoom-img="${cleanImg}" title="Click diagram to view full size">
            <div style="font-size:10px;color:var(--text-muted);margin-top:3px;cursor:pointer" data-zoom-img="${cleanImg}">🔍 Click diagram to expand</div>
          </div>
        </div>
      ` : '';
      return `
        <div class="q-card">
          <div class="q-card-head">
            <span class="q-badge">Question ${idx + 1}</span>
            <div style="display:flex;align-items:center;gap:12px">
              <span style="font-size:12px;color:var(--text-muted);font-weight:600">Pts: <strong style="color:var(--accent)">${effectiveMarks}</strong></span>
              <button type="button" class="btn-text" data-admin-edit-q="${idx}" style="font-size:12px;color:var(--accent);font-weight:600;cursor:pointer">✏️ Edit</button>
              <button type="button" class="btn-text" data-admin-del-q="${idx}" style="font-size:12px;color:var(--status-fail);font-weight:600;cursor:pointer">🗑️ Delete</button>
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

    // Inline Edit Mode
    const currImg = adminTempQImage !== undefined ? adminTempQImage : q.image;
    return `
      <div class="q-card q-card-edit">
        <div class="q-card-head">
          <span class="q-badge" style="background:var(--accent);color:#fff">Editing Question ${idx + 1}</span>
          <div style="display:flex;align-items:center;gap:8px">
            <label style="font-size:12px;color:var(--text-muted);font-weight:600">Points:</label>
            <input type="number" step="any" min="0.01" id="adminEditQPoints" value="${effectiveMarks}" class="form-input" style="width:70px;padding:3px 6px;font-size:12px">
          </div>
        </div>
        <div style="margin-bottom:10px">
          <label style="font-size:12px;font-weight:600;color:var(--text);display:block;margin-bottom:4px">Question Text:</label>
          <textarea class="form-input" id="adminEditQText" style="width:100%;min-height:75px;font-size:13px;line-height:1.4">${esc(q.text || "")}</textarea>
        </div>
        
        <div style="margin-bottom:12px">
          <label style="font-size:12px;font-weight:600;color:var(--text);display:block;margin-bottom:4px">Diagram / Image:</label>
          ${currImg ? `
            <div style="margin:8px 0;text-align:center">
              <div style="display:inline-block;background:#ffffff;border:1px solid var(--border);border-radius:6px;padding:6px;box-shadow:0 1px 3px rgba(0,0,0,0.06);text-align:center">
                <img src="${getCleanImageSrc(currImg)}" alt="Diagram" style="max-height:160px;max-width:100%;object-fit:contain;border-radius:4px;display:block;margin:0 auto">
                <div style="margin-top:6px;display:flex;gap:12px;justify-content:center">
                  <button type="button" class="btn-text" style="font-size:12px;color:var(--accent);font-weight:600" id="adminChangeImgBtn">🔄 Change Diagram</button>
                  <button type="button" class="btn-text" style="font-size:12px;color:var(--status-fail);font-weight:600" id="adminRemoveImgBtn">🗑️ Remove Diagram</button>
                </div>
              </div>
            </div>
          ` : `
            <button type="button" class="btn btn-secondary btn-sm" id="adminAttachImgBtn" style="font-size:11px;padding:4px 10px;display:inline-flex;align-items:center;gap:6px">
              🖼️ Attach Diagram / Image
            </button>
          `}
        </div>

        <div style="margin-bottom:10px">
          <label style="font-size:12px;font-weight:600;color:var(--text);display:block;margin-bottom:6px">Options &amp; Correct Answer (Click "Mark as Correct" for the right answer):</label>
          <div style="display:flex;flex-direction:column;gap:8px" id="adminEditOptionsList">
            ${['A', 'B', 'C', 'D'].map((letter, oIdx) => {
      const optVal = opts[oIdx] !== undefined ? opts[oIdx] : "";
      const isCorrect = currentAdminEditingCorrectLetter === letter;
      return `
                <div style="display:flex;align-items:center;gap:8px">
                  <strong style="width:20px;font-size:13px;color:var(--text)">${letter}.</strong>
                  <input type="text" class="form-input admin-opt-input" data-letter="${letter}" data-opt-idx="${oIdx}" value="${esc(optVal)}" placeholder="Option ${letter}" style="flex:1;font-size:13px;padding:6px 10px">
                  <button type="button" class="btn btn-sm ${isCorrect ? 'btn-good' : 'btn-secondary'} admin-set-correct-btn" data-letter="${letter}" style="font-size:11px;padding:4px 10px;white-space:nowrap">
                    ${isCorrect ? '✓ Correct Answer' : 'Mark as Correct'}
                  </button>
                </div>
              `;
    }).join("")}
          </div>
        </div>

        <div style="margin-top:14px;display:flex;justify-content:flex-end;gap:8px">
          <button type="button" class="btn btn-secondary btn-sm" id="adminCancelEditBtn">Cancel</button>
          <button type="button" class="btn btn-sm" id="adminSaveQBtn" data-save-idx="${idx}">💾 Save Question</button>
        </div>
      </div>
    `;
  }).join("");

  // Attach button events
  document.querySelectorAll("[data-admin-edit-q]").forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.adminEditQ, 10);
      adminEditingQIdx = idx;
      const q = questions[idx];
      adminTempQImage = q.image || null;
      const rawOpts = Array.isArray(q.options) ? q.options : (q.optionStrings || []);
      const opts = rawOpts.map(o => (typeof o === "object" && o !== null && o.text !== undefined) ? o.text : String(o));
      let cLetter = q.correctLetter;
      if (!cLetter && q.correctAnswer) {
        const foundIdx = opts.findIndex(o => o.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase());
        if (foundIdx >= 0) cLetter = String.fromCharCode(65 + foundIdx);
      }
      currentAdminEditingCorrectLetter = cLetter || "A";
      renderCBTPreviewQuestions();
    };
  });

  document.querySelectorAll("[data-admin-del-q]").forEach(btn => {
    btn.onclick = async () => {
      const idx = parseInt(btn.dataset.adminDelQ, 10);
      if (!confirm(`Are you sure you want to delete Question ${idx + 1}?`)) return;
      activePreviewSubmission.questions.splice(idx, 1);
      if (adminEditingQIdx === idx) {
        adminEditingQIdx = null;
        adminTempQImage = undefined;
      } else if (adminEditingQIdx > idx) {
        adminEditingQIdx--;
      }
      await saveAdminQuestionsToCloud(`Question ${idx + 1} deleted.`);
      renderCBTPreviewQuestions();
    };
  });

  if (adminEditingQIdx !== null) {
    document.querySelectorAll(".admin-set-correct-btn").forEach(b => {
      b.onclick = () => {
        currentAdminEditingCorrectLetter = b.dataset.letter;
        document.querySelectorAll(".admin-set-correct-btn").forEach(btn => {
          const isCurr = btn.dataset.letter === currentAdminEditingCorrectLetter;
          btn.className = `btn btn-sm ${isCurr ? 'btn-good' : 'btn-secondary'} admin-set-correct-btn`;
          btn.textContent = isCurr ? '✓ Correct Answer' : 'Mark as Correct';
        });
      };
    });

    const attachBtn = $("adminAttachImgBtn") || $("adminChangeImgBtn");
    if (attachBtn) {
      attachBtn.onclick = () => {
        let fileInput = $("adminPreviewImgInput");
        if (!fileInput) {
          fileInput = document.createElement("input");
          fileInput.type = "file";
          fileInput.id = "adminPreviewImgInput";
          fileInput.accept = "image/*";
          fileInput.style.display = "none";
          document.body.appendChild(fileInput);
        }
        fileInput.onchange = (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            adminTempQImage = ev.target.result;
            renderCBTPreviewQuestions();
          };
          reader.readAsDataURL(file);
          e.target.value = "";
        };
        fileInput.click();
      };
    }

    if ($("adminRemoveImgBtn")) {
      $("adminRemoveImgBtn").onclick = () => {
        adminTempQImage = null;
        renderCBTPreviewQuestions();
      };
    }

    if ($("adminCancelEditBtn")) {
      $("adminCancelEditBtn").onclick = () => {
        adminEditingQIdx = null;
        adminTempQImage = undefined;
        renderCBTPreviewQuestions();
      };
    }

    if ($("adminSaveQBtn")) {
      $("adminSaveQBtn").onclick = async () => {
        const qIdx = parseInt($("adminSaveQBtn").dataset.saveIdx, 10);
        const newText = ($("adminEditQText")?.value || "").trim();
        if (!newText) {
          alert("Question text cannot be empty.");
          return;
        }
        const optInputs = document.querySelectorAll(".admin-opt-input");
        const newOptions = Array.from(optInputs).map(inp => (inp.value || "").trim());
        const selectedLetter = currentAdminEditingCorrectLetter || "A";
        const correctIdx = ["A", "B", "C", "D"].indexOf(selectedLetter);
        const newCorrect = (correctIdx >= 0 && newOptions[correctIdx]) ? newOptions[correctIdx] : newOptions[0];
        const effectiveMarks = (activePreviewSubmission.marksPerQuestion !== undefined && activePreviewSubmission.marksPerQuestion !== null && !isNaN(Number(activePreviewSubmission.marksPerQuestion)))
          ? Number(activePreviewSubmission.marksPerQuestion)
          : (adminCbtDefaults.marksPerQuestion || 0.4);
        const newPts = parseFloat($("adminEditQPoints")?.value) || effectiveMarks;

        const targetQ = activePreviewSubmission.questions[qIdx];
        targetQ.text = newText;
        targetQ.options = newOptions;
        targetQ.optionStrings = newOptions;
        targetQ.correctAnswer = newCorrect;
        targetQ.correctLetter = selectedLetter;
        targetQ.points = newPts;
        if (adminTempQImage !== undefined) {
          targetQ.image = adminTempQImage;
        }

        const saveBtn = $("adminSaveQBtn");
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";

        await saveAdminQuestionsToCloud(`Question ${qIdx + 1} updated and saved to cloud.`);
        adminEditingQIdx = null;
        adminTempQImage = undefined;
        renderCBTPreviewQuestions();
      };
    }
  }

  // Lightbox click for diagrams
  document.querySelectorAll("[data-zoom-img]").forEach(el => {
    el.onclick = () => {
      const src = el.dataset.zoomImg;
      if ($("cbtLightboxImg") && $("cbtImageLightboxModal")) {
        $("cbtLightboxImg").src = src;
        $("cbtImageLightboxModal").classList.add("open");
      }
    };
  });
}

if ($("cbtLightboxCloseBtn")) {
  $("cbtLightboxCloseBtn").onclick = () => $("cbtImageLightboxModal")?.classList.remove("open");
}

if ($("cbtPreviewAddQuestionBtn")) {
  $("cbtPreviewAddQuestionBtn").onclick = () => {
    if (!activePreviewSubmission) return;
    if (!Array.isArray(activePreviewSubmission.questions)) {
      activePreviewSubmission.questions = [];
    }
    const newQ = {
      _id: { $oid: generateObjectId() },
      text: "",
      image: null,
      options: ["", "", "", ""],
      optionStrings: ["", "", "", ""],
      correctAnswer: "",
      correctLetter: "A",
      points: (activePreviewSubmission.marksPerQuestion !== undefined && activePreviewSubmission.marksPerQuestion !== null && !isNaN(Number(activePreviewSubmission.marksPerQuestion)))
        ? Number(activePreviewSubmission.marksPerQuestion)
        : (adminCbtDefaults.marksPerQuestion || 0.4),
      test_id: { $oid: activePreviewSubmission.examId || activePreviewSubmission.docId },
      subject: activePreviewSubmission.subjectId ? { $oid: activePreviewSubmission.subjectId } : null,
      class: activePreviewSubmission.classId ? { $oid: activePreviewSubmission.classId } : null,
      __v: 0
    };
    activePreviewSubmission.questions.push(newQ);
    adminEditingQIdx = activePreviewSubmission.questions.length - 1;
    adminTempQImage = null;
    currentAdminEditingCorrectLetter = "A";
    renderCBTPreviewQuestions();
  };
}

// Save schedule and assigned arms changes from within the preview modal (Admin Only)
if ($("cbtPreviewSaveScheduleBtn")) {
  $("cbtPreviewSaveScheduleBtn").onclick = async () => {
    if (!activePreviewSubmission) return;
    const newLaunch = $("cbtPreviewLaunchDate")?.value || "2026-10-27";
    const newGateOpen = $("cbtPreviewGateOpen")?.value || "08:00";
    const newGateClose = $("cbtPreviewGateClose")?.value || "20:00";
    const newDuration = parseInt($("cbtPreviewDuration")?.value, 10) || 40;
    const newMarks = parseFloat($("cbtPreviewMarks")?.value) || adminCbtDefaults.marksPerQuestion || 0.4;
    const newShuffle = $("cbtPreviewShuffle") ? $("cbtPreviewShuffle").checked : true;

    activePreviewSubmission.marksPerQuestion = newMarks;
    (activePreviewSubmission.questions || []).forEach(q => {
      q.points = newMarks;
    });

    // Collect updated assigned arms (Admin exclusive)
    const classInfo = resolveCbtClass(activePreviewSubmission.className || "");
    const armCheckboxes = document.querySelectorAll(".cbt-admin-arm-checkbox");
    let checkedArms = [];
    if (armCheckboxes.length > 0) {
      checkedArms = Array.from(armCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
    }
    // If admin left all unchecked or no checkboxes, default to all class arms
    if (checkedArms.length === 0 && classInfo && Array.isArray(classInfo.arms)) {
      checkedArms = [...classInfo.arms];
    }

    activePreviewSubmission.launchDate = newLaunch;
    activePreviewSubmission.examDate = newLaunch;
    activePreviewSubmission.startTime = newGateOpen;
    activePreviewSubmission.endTime = newGateClose;
    activePreviewSubmission.gateOpen = newGateOpen;
    activePreviewSubmission.gateClose = newGateClose;
    activePreviewSubmission.duration = newDuration;
    activePreviewSubmission.durationMinutes = newDuration;
    activePreviewSubmission.shuffle = newShuffle;
    activePreviewSubmission.selectedArms = checkedArms;
    activePreviewSubmission.arm = checkedArms.map(a => ({ "$oid": a }));

    const btn = $("cbtPreviewSaveScheduleBtn");
    btn.disabled = true;
    btn.textContent = "Saving...";

    try {
      await window.dbClient.saveSubmission(activePreviewSubmission.docId, activePreviewSubmission);

      const subIdx = allCbtSubmissions.findIndex(s => s.docId === activePreviewSubmission.docId);
      if (subIdx >= 0) {
        allCbtSubmissions[subIdx].selectedArms = checkedArms;
        allCbtSubmissions[subIdx].arm = activePreviewSubmission.arm;
        allCbtSubmissions[subIdx].launchDate = newLaunch;
        allCbtSubmissions[subIdx].examDate = newLaunch;
        allCbtSubmissions[subIdx].startTime = newGateOpen;
        allCbtSubmissions[subIdx].endTime = newGateClose;
        allCbtSubmissions[subIdx].gateOpen = newGateOpen;
        allCbtSubmissions[subIdx].gateClose = newGateClose;
        allCbtSubmissions[subIdx].duration = newDuration;
        allCbtSubmissions[subIdx].durationMinutes = newDuration;
        allCbtSubmissions[subIdx].marksPerQuestion = newMarks;
        allCbtSubmissions[subIdx].shuffle = newShuffle;
        allCbtSubmissions[subIdx].questions = activePreviewSubmission.questions;
      }

      // Update modal header duration display
      const resolvedSubName = (activePreviewSubmission.subjectName && activePreviewSubmission.subjectName !== "—" && activePreviewSubmission.subjectName !== "-")
        ? activePreviewSubmission.subjectName
        : ((typeof resolveCbtSubject === "function" ? resolveCbtSubject(activePreviewSubmission.title || "").name : "") || "Biology");
      if ($("cbtPreviewModalMeta")) {
        $("cbtPreviewModalMeta").textContent = `Teacher: ${activePreviewSubmission.teacherName || "Staff"} · Subject: ${resolvedSubName} · Class: ${activePreviewSubmission.className || "All"} · Duration: ${newDuration} mins · Marks/Q: ${newMarks} · Total: ${(activePreviewSubmission.questions || []).length} questions`;
      }

      if ($("cbtScheduleSummaryPill")) {
        const timeD = `${newGateOpen} – ${newGateClose}`;
        const shufD = newShuffle ? "🔀 Shuffled" : "Sequential";
        let displayLaunch = newLaunch;
        try {
          displayLaunch = new Date(newLaunch + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        } catch (e) { }
        const totalArmsCount = (classInfo.arms || []).length;
        const selArmsCount = checkedArms.length;
        const armsPill = (totalArmsCount > 0 && selArmsCount >= totalArmsCount) ? "All Arms" : `${selArmsCount} Arm${selArmsCount === 1 ? '' : 's'}`;
        $("cbtScheduleSummaryPill").textContent = `📅 ${displayLaunch} · ${timeD} · ${shufD} · ⏳ ${newDuration}m · 🎯 ${armsPill}`;
      }
      btn.textContent = "✓ Saved!";
      setTimeout(() => {
        btn.textContent = "💾 Save Settings & Arms";
        btn.disabled = false;
      }, 1500);
      renderCBTSubmissions();
    } catch (err) {
      alert("Could not update schedule and arms in cloud: " + err.message);
      btn.textContent = "💾 Save Settings & Arms";
      btn.disabled = false;
    }
  };
}

if ($("cbtPreviewSelectAllArmsBtn")) {
  $("cbtPreviewSelectAllArmsBtn").onclick = () => {
    document.querySelectorAll(".cbt-admin-arm-checkbox").forEach(cb => { cb.checked = true; });
  };
}
if ($("cbtPreviewClearArmsBtn")) {
  $("cbtPreviewClearArmsBtn").onclick = () => {
    document.querySelectorAll(".cbt-admin-arm-checkbox").forEach(cb => { cb.checked = false; });
  };
}

function syncPreviewInputsToActiveSubmission() {
  if (!activePreviewSubmission) return;
  if ($("cbtPreviewLaunchDate")?.value) {
    activePreviewSubmission.launchDate = $("cbtPreviewLaunchDate").value;
    activePreviewSubmission.examDate = $("cbtPreviewLaunchDate").value;
  }
  if ($("cbtPreviewGateOpen")?.value) {
    activePreviewSubmission.startTime = $("cbtPreviewGateOpen").value;
    activePreviewSubmission.gateOpen = $("cbtPreviewGateOpen").value;
  }
  if ($("cbtPreviewGateClose")?.value) {
    activePreviewSubmission.endTime = $("cbtPreviewGateClose").value;
    activePreviewSubmission.gateClose = $("cbtPreviewGateClose").value;
  }
  if ($("cbtPreviewShuffle")) {
    activePreviewSubmission.shuffle = $("cbtPreviewShuffle").checked;
  }
}

$("cbtPreviewModalCloseBtn").onclick = () => {
  $("cbtPreviewModal").classList.remove("open");
  activePreviewSubmission = null;
};

$("cbtModalDownloadExamsBtn").onclick = () => {
  if (activePreviewSubmission) {
    syncPreviewInputsToActiveSubmission();
    downloadSubmissionExamsJson(activePreviewSubmission.docId);
  }
};
$("cbtModalDownloadQuestionsBtn").onclick = () => {
  if (activePreviewSubmission) {
    syncPreviewInputsToActiveSubmission();
    downloadSubmissionQuestionsJson(activePreviewSubmission.docId);
  }
};
$("cbtModalDownloadBothBtn").onclick = () => {
  if (activePreviewSubmission) {
    syncPreviewInputsToActiveSubmission();
    downloadSubmissionBothJson(activePreviewSubmission.docId);
  }
};
$("refreshCBTSubmissionsBtn").onclick = loadCBTSubmissions;
if ($("cbtAdminSaveDefaultsBtn")) $("cbtAdminSaveDefaultsBtn").onclick = saveAdminCbtDefaults;

// ── CBT Submissions Filters & Pagination Event Wiring ──
if ($("cbtFilterClass")) $("cbtFilterClass").onchange = filterCbtSubmissions;
if ($("cbtFilterSubject")) $("cbtFilterSubject").onchange = filterCbtSubmissions;
if ($("cbtFilterSearch")) $("cbtFilterSearch").oninput = filterCbtSubmissions;
if ($("cbtClearFiltersBtn")) $("cbtClearFiltersBtn").onclick = resetCbtFilters;

if ($("cbtPageSizeSelect")) {
  $("cbtPageSizeSelect").onchange = () => {
    const val = $("cbtPageSizeSelect").value;
    cbtPageSize = (val === "All") ? "All" : (Number(val) || 10);
    cbtCurrentPage = 1;
    renderCBTSubmissions();
  };
}
if ($("cbtFirstPageBtn")) $("cbtFirstPageBtn").onclick = () => { cbtCurrentPage = 1; renderCBTSubmissions(); };
if ($("cbtPrevPageBtn")) $("cbtPrevPageBtn").onclick = () => { if (cbtCurrentPage > 1) { cbtCurrentPage--; renderCBTSubmissions(); } };
if ($("cbtNextPageBtn")) $("cbtNextPageBtn").onclick = () => { cbtCurrentPage++; renderCBTSubmissions(); };
if ($("cbtLastPageBtn")) $("cbtLastPageBtn").onclick = () => {
  const totalRecords = cbtFilteredSubmissions.length;
  const numPageSize = cbtPageSize === "All" ? totalRecords : (Number(cbtPageSize) || 10);
  cbtCurrentPage = Math.max(1, Math.ceil(totalRecords / numPageSize));
  renderCBTSubmissions();
};

// ============================================================
// STUDENT SCORES VIEWER MODULE
// ============================================================
let allScoreRows = [];
let activeFilteredRows = [];
let scoresCurrentPage = 1;
let scoresPerPage = 25;
let adminCurrentTerm = null;
let adminSortCol = "student";
let adminSortAsc = true;

const SCORES_CACHE_KEY = "admin_exam_scores_cache_v3";

// ── Per-Term Score Conversion ──────────────────────────────────────────
const SCORE_CONVERSION_KEY = "SCORE_CONVERSION_SETTING_v1";

let _convConfigCacheRaw = "__UNSET__";
let _convConfigCacheVal = { terms: {} };
let _convTermLookupCacheRaw = "__UNSET__";
const _convTermLookupCache = new Map();

function getConversionConfig() {
  try {
    const raw = localStorage.getItem(SCORE_CONVERSION_KEY) || "";
    if (raw === _convConfigCacheRaw) return _convConfigCacheVal;
    if (!raw) {
      _convConfigCacheRaw = "";
      _convConfigCacheVal = { terms: {} };
      return _convConfigCacheVal;
    }
    const parsed = JSON.parse(raw);
    if (!parsed) {
      _convConfigCacheRaw = raw;
      _convConfigCacheVal = { terms: {} };
      return _convConfigCacheVal;
    }
    let terms = parsed.terms || {};
    // Normalize legacy single-term setting:
    if (parsed.originalMax && parsed.targetMax) {
      const tKey = parsed.targetTerm || "__ALL__";
      terms = {
        [tKey]: { originalMax: parsed.originalMax, targetMax: parsed.targetMax }
      };
    }
    // Deduplicate synonymous entries so localStorage stays clean
    const cleanTerms = {};
    const seenCats = new Set();
    let hasDupes = false;
    for (const [k, c] of Object.entries(terms)) {
      if (!c) continue;
      const cat = (k === "__ALL__") ? "__ALL__" : getCanonicalAdminTermCategory(k);
      const key = `${cat}_${c.targetMax}_${c.originalMax}`;
      if (!seenCats.has(key)) {
        seenCats.add(key);
        cleanTerms[k] = c;
      } else {
        hasDupes = true;
      }
    }
    let finalRaw = raw;
    if (hasDupes) {
      try {
        finalRaw = JSON.stringify({ terms: cleanTerms });
        localStorage.setItem(SCORE_CONVERSION_KEY, finalRaw);
      } catch (_) {}
    }
    _convConfigCacheRaw = finalRaw;
    _convConfigCacheVal = { terms: cleanTerms };
    return _convConfigCacheVal;
  } catch (e) {
    return { terms: {} };
  }
}

function normalizeAdminTermKey(str) {
  return String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getCanonicalAdminTermCategory(str) {
  const s = normalizeAdminTermKey(str);
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

function getConversionForTerm(term) {
  const config = getConversionConfig();
  if (!config || !config.terms) return null;

  const dashTerm = (typeof $("dashFilterTerm") !== "undefined" && $("dashFilterTerm")) ? $("dashFilterTerm").value : "";
  const effectiveTerm = term || dashTerm || adminCurrentTerm || (typeof activeCbtExamTerm !== "undefined" ? activeCbtExamTerm : "");
  const cacheKey = effectiveTerm || "__EMPTY__";
  if (_convTermLookupCacheRaw === _convConfigCacheRaw && _convTermLookupCache.has(cacheKey)) {
    return _convTermLookupCache.get(cacheKey);
  }
  if (_convTermLookupCacheRaw !== _convConfigCacheRaw) {
    _convTermLookupCache.clear();
    _convTermLookupCacheRaw = _convConfigCacheRaw;
  }

  let matched = null;
  if (!effectiveTerm) {
    if (config.terms["__ALL__"]) {
      const c = config.terms["__ALL__"];
      if (c.originalMax && c.targetMax && c.originalMax !== c.targetMax) matched = c;
    }
    _convTermLookupCache.set(cacheKey, matched);
    return matched;
  }

  // 1. Direct exact match
  if (config.terms[effectiveTerm]) {
    const c = config.terms[effectiveTerm];
    if (c.originalMax && c.targetMax && c.originalMax !== c.targetMax) matched = c;
  }

  // 2. Normalized case-insensitive and punctuation-insensitive match
  if (!matched) {
    const tNorm = normalizeAdminTermKey(effectiveTerm);
    if (tNorm) {
      for (const [k, c] of Object.entries(config.terms)) {
        if (k === "__ALL__" || !c) continue;
        const kNorm = normalizeAdminTermKey(k);
        if (kNorm && (kNorm === tNorm || kNorm.includes(tNorm) || tNorm.includes(kNorm))) {
          if (c.originalMax && c.targetMax && c.originalMax !== c.targetMax) { matched = c; break; }
        }
      }
    }
  }

  // 3. Semantic / canonical assessment matching (e.g. "Mid Term Test" matches "Mid Term Examination", "Mid Term", "midterm")
  if (!matched) {
    const tCat = getCanonicalAdminTermCategory(effectiveTerm);
    if (tCat) {
      for (const [k, c] of Object.entries(config.terms)) {
        if (k === "__ALL__" || !c) continue;
        const kCat = getCanonicalAdminTermCategory(k);
        if (kCat && (kCat === tCat || (kCat.endsWith("midterm") && tCat.endsWith("midterm")) || (kCat.endsWith("firsttest") && tCat.endsWith("firsttest")) || (kCat.endsWith("exam") && tCat.endsWith("exam")))) {
          if (c.originalMax && c.targetMax && c.originalMax !== c.targetMax) { matched = c; break; }
        }
      }
    }
  }

  // 4. Global "__ALL__" rule (applied across all terms ONLY if school explicitly set All Terms)
  if (!matched && config.terms["__ALL__"]) {
    const c = config.terms["__ALL__"];
    if (c.originalMax && c.targetMax && c.originalMax !== c.targetMax) matched = c;
  }

  _convTermLookupCache.set(cacheKey, matched);
  return matched;
}

function getScoreConversion() {
  return getConversionConfig();
}

function setScoreConversion(config) {
  _convConfigCacheRaw = "__UNSET__";
  _convTermLookupCacheRaw = "__UNSET__";
  _convTermLookupCache.clear();
  if (config && config.terms && Object.keys(config.terms).length > 0) {
    localStorage.setItem(SCORE_CONVERSION_KEY, JSON.stringify(config));
  } else {
    localStorage.removeItem(SCORE_CONVERSION_KEY);
  }
}

function parseAdminRawScoreNum(val) {
  if (val === undefined || val === null || val === "") return NaN;
  if (typeof val === "number") return val;
  const str = String(val).trim();
  const m = str.match(/^([\d.]+)\s*(?:of|\/)/i);
  return m ? parseFloat(m[1]) : parseFloat(str);
}

function applyScoreConversion(rawScore, term) {
  const num = parseAdminRawScoreNum(rawScore);
  if (isNaN(num)) return rawScore;
  const c = getConversionForTerm(term);
  if (!c || !c.originalMax || !c.targetMax || c.originalMax === c.targetMax) return num;
  const factor = c.targetMax / c.originalMax;
  return Math.round(num * factor * 100) / 100;
}

function applyPctConversion(rawScore, term) {
  const num = parseAdminRawScoreNum(rawScore);
  if (isNaN(num)) return null;
  const c = getConversionForTerm(term);
  if (!c || !c.originalMax || !c.targetMax) return null; // null = use stored pct
  const converted = applyScoreConversion(num, term);
  return Math.round((converted / c.targetMax) * 100 * 10) / 10;
}

function getAdminSubjectMaxMark(subObj, termName) {
  const dashTerm = (typeof $("dashFilterTerm") !== "undefined" && $("dashFilterTerm")) ? $("dashFilterTerm").value : "";
  const t = termName || (subObj && subObj.term) || dashTerm || adminCurrentTerm;
  const c = getConversionForTerm(t);
  if (c && c.targetMax) return Number(c.targetMax);

  if (subObj) {
    if (subObj.maxMark) return Number(subObj.maxMark);
    if (subObj.max) return Number(subObj.max);
    if (subObj.maxScore) return Number(subObj.maxScore);

    if (typeof subObj.origScoreText === "string") {
      const m = subObj.origScoreText.match(/(?:of|\/)\s*([\d.]+)/i);
      if (m) return parseFloat(m[1]);
    }
    if (typeof subObj.score === "string") {
      const m = subObj.score.match(/(?:of|\/)\s*([\d.]+)/i);
      if (m) return parseFloat(m[1]);
    }

    const s = parseFloat(subObj.rawScore !== undefined ? subObj.rawScore : subObj.score);
    const p = parseFloat(subObj.pct);
    if (s > 0 && p > 0) {
      const derived = Math.round(s / (p / 100));
      if (derived > 0 && Number.isFinite(derived)) return derived;
    }
  }

  if (typeof detectOriginalMaxForTerm === "function" && Array.isArray(allScoreRows) && allScoreRows.length > 0) {
    const detected = detectOriginalMaxForTerm(allScoreRows, t);
    if (detected && detected > 0) return detected;
  }

  return 20;
}

function populateConversionTermSelect(terms) {
  const sel = document.getElementById("convTermSelect");
  if (!sel) return;
  const prevVal = sel.value;
  const uniqueTerms = Array.isArray(terms) ? terms : [];
  let html = '<option value="__ALL__">All Terms</option>';
  uniqueTerms.forEach(t => {
    html += `<option value="${esc(t)}">${esc(t)}</option>`;
  });
  sel.innerHTML = html;
  if (prevVal && (prevVal === "__ALL__" || uniqueTerms.includes(prevVal))) {
    sel.value = prevVal;
  } else if (adminCurrentTerm && uniqueTerms.includes(adminCurrentTerm)) {
    sel.value = adminCurrentTerm;
  } else {
    sel.value = "__ALL__";
  }
}

const _origMaxByRowsCache = new WeakMap();

function detectOriginalMaxForTerm(rows, term) {
  if (!Array.isArray(rows) || !rows.length) return null;
  const termKey = term || "__ALL__";
  const len = rows.length;
  const firstRow = rows[0];
  const lastRow = rows[len - 1];
  let rowCache = _origMaxByRowsCache.get(rows);
  if (!rowCache || rowCache.len !== len || rowCache.firstRow !== firstRow || rowCache.lastRow !== lastRow) {
    rowCache = { len, firstRow, lastRow, terms: new Map() };
    _origMaxByRowsCache.set(rows, rowCache);
  }
  if (rowCache.terms.has(termKey)) return rowCache.terms.get(termKey);

  const counts = {};
  let sampled = 0;
  const isAll = !term || term === "__ALL__";
  for (let i = 0; i < len && sampled < 500; i++) {
    const r = rows[i];
    if (!isAll && r.term !== term) continue;
    sampled++;
    const rawStr = String(r.score || "");
    const m = (rawStr.includes("/") || rawStr.toLowerCase().includes("of")) ? rawStr.match(/(?:of|\/)\s*(\d+(?:\.\d+)?)/i) : null;
    let val = null;
    if (m) {
      val = Math.round(parseFloat(m[1]));
    } else {
      const s = parseFloat(r.score);
      const p = parseFloat(r.pct);
      if (s > 0 && p > 0) {
        const d = (s / (p / 100));
        val = Math.round(d * 10) / 10;
        if (Math.abs(val - Math.round(val)) < 0.05) val = Math.round(val);
      }
    }
    if (val && val > 0 && val <= 1000) counts[val] = (counts[val] || 0) + 1;
  }
  if (!sampled) {
    rowCache.terms.set(termKey, null);
    return null;
  }
  let best = null, maxCount = 0;
  for (const [val, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      best = parseFloat(val);
    }
  }
  rowCache.terms.set(termKey, best);
  return best;
}

function refreshConversionUI() {
  const sel = document.getElementById("convTermSelect");
  const selectedTerm = sel ? sel.value : (adminCurrentTerm || "__ALL__");
  const origEl = document.getElementById("convOrigMax");
  const tgtEl = document.getElementById("convTargetMax");
  const multLbl = document.getElementById("convMultiplierLabel");
  const activeLbl = document.getElementById("convActiveLabel");
  const autoBadge = document.getElementById("convOrigAutoBadge");
  if (!origEl) return;

  const config = getConversionConfig();
  const termSetting = config.terms ? config.terms[selectedTerm] : null;

  if (termSetting && termSetting.originalMax && termSetting.targetMax) {
    origEl.value = termSetting.originalMax;
    tgtEl.value = termSetting.targetMax;
    if (autoBadge) autoBadge.style.display = "none";
    const f = (termSetting.targetMax / termSetting.originalMax).toFixed(4).replace(/\.?0+$/, "");
    if (multLbl) multLbl.textContent = "× " + f;
  } else {
    // Auto-detect original max from the term's scores
    const detected = detectOriginalMaxForTerm(allScoreRows, selectedTerm);
    if (detected) {
      origEl.value = detected;
      if (autoBadge) {
        autoBadge.style.display = "inline";
        autoBadge.textContent = `(auto: /${detected})`;
      }
    } else {
      origEl.value = "";
      if (autoBadge) autoBadge.style.display = "none";
    }
    tgtEl.value = "";
    if (multLbl) multLbl.textContent = "";
  }

  const activeEntries = Object.entries(config.terms || {}).filter(([_, s]) => s && s.originalMax && s.targetMax && s.originalMax !== s.targetMax);
  if (activeEntries.length > 0) {
    const seenCats = new Set();
    const uniqueActive = [];
    for (const [t, s] of activeEntries) {
      const cat = (t === "__ALL__") ? "__ALL__" : getCanonicalAdminTermCategory(t);
      const catKey = `${cat}_${s.targetMax}`;
      if (!seenCats.has(catKey)) {
        seenCats.add(catKey);
        let cleanName = t === "__ALL__" ? "All Terms" : t;
        if (cat.endsWith("midterm")) cleanName = "Mid Term";
        else if (cat.endsWith("firsttest")) cleanName = "First Test";
        else if (cat.endsWith("exam")) cleanName = "Examination";
        uniqueActive.push(`${cleanName} (/${s.targetMax})`);
      }
    }

    if (activeLbl) {
      activeLbl.textContent = "✅ Active scaling: " + uniqueActive.join(", ");
      activeLbl.style.color = "var(--status-good, #10b981)";
    }
  } else {
    if (activeLbl) {
      activeLbl.textContent = "No conversion – raw scores displayed";
      activeLbl.style.color = "var(--text-muted, #8892b0)";
    }
  }
}
// ─────────────────────────────────────────────────────────────

// ── High-Capacity IndexedDB & In-Memory Score Storage (Zero 5MB Quota Limits) ──
let _memoryCachedScores = null;

const idbScoreStorage = {
  dbPromise: null,
  getDb() {
    if (!this.dbPromise) {
      this.dbPromise = new Promise(resolve => {
        if (typeof indexedDB === "undefined") return resolve(null);
        try {
          const req = indexedDB.open("AcademicPortalScoresDB", 1);
          req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("scores_store")) {
              db.createObjectStore("scores_store");
            }
          };
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        } catch (e) { resolve(null); }
      });
    }
    return this.dbPromise;
  },
  async set(key, val) {
    try {
      const db = await this.getDb();
      if (!db) return false;
      return new Promise(resolve => {
        const tx = db.transaction("scores_store", "readwrite");
        tx.objectStore("scores_store").put(val, key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (e) { return false; }
  },
  async get(key) {
    try {
      const db = await this.getDb();
      if (!db) return null;
      return new Promise(resolve => {
        const tx = db.transaction("scores_store", "readonly");
        const req = tx.objectStore("scores_store").get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch (e) { return null; }
  }
};

// Clean up duplicate and obsolete keys to free up localStorage megabytes
function cleanupObsoleteStorage() {
  const obsoleteKeys = [
    "admin_exam_scores_backup",
    "school_exam_scores_cache_v3",
    "admin_exam_scores_cache_v2",
    "school_exam_scores_cache_v2",
    "admin_exam_scores_cache",
    "school_exam_scores_cache"
  ];
  obsoleteKeys.forEach(k => {
    try { localStorage.removeItem(k); } catch (e) { }
  });
}

// Background auto-hydration from IndexedDB
(async () => {
  try {
    const idbData = await idbScoreStorage.get("admin_scores");
    if (idbData && Array.isArray(idbData.rows) && idbData.rows.length > 0) {
      if (!_memoryCachedScores || !_memoryCachedScores.rows || _memoryCachedScores.rows.length < idbData.rows.length) {
        _memoryCachedScores = idbData;
        if (typeof allScoreRows !== "undefined" && (!allScoreRows || allScoreRows.length === 0)) {
          allScoreRows = idbData.rows;
          if (typeof buildAdminTermTabs === "function") buildAdminTermTabs();
          if (typeof updateAdminFreshness === "function") updateAdminFreshness(idbData.lastUpdatedText || "Saved device copy", false);
        }
      }
    }
  } catch (e) { }
})();

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

function getCachedScores() {
  // 0. High-speed in-memory cache
  if (_memoryCachedScores && Array.isArray(_memoryCachedScores.rows) && _memoryCachedScores.rows.length > 0) {
    return _memoryCachedScores;
  }
  try {
    // 1. Primary admin cache from localStorage
    const primaryRaw = localStorage.getItem(SCORES_CACHE_KEY);
    if (primaryRaw) {
      const parsed = JSON.parse(primaryRaw);
      if (parsed && Array.isArray(parsed.rows) && parsed.rows.length > 0) {
        parsed.rows = deduplicateScoreRows(parsed.rows);
        _memoryCachedScores = parsed;
        return parsed;
      }
    }

    // 2. Backup or fallback keys
    const fallbackKeys = [
      "school_exam_scores_cache_v3",
      "admin_exam_scores_backup",
      "admin_exam_scores_cache_v2",
      "school_exam_scores_cache_v2",
      "admin_exam_scores_cache",
      "school_exam_scores_cache"
    ];
    for (const key of fallbackKeys) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          const rows = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.rows) ? parsed.rows : null);
          if (rows && rows.length > 0) {
            const res = {
              rows,
              version: parsed.version || "",
              lastUpdatedText: parsed.lastUpdatedText || "Saved device copy",
              timestamp: parsed.timestamp || Date.now()
            };
            _memoryCachedScores = res;
            return res;
          }
        }
      } catch (e) { }
    }

    // 3. Recover from teacher score caches on this device if any exist
    const recoveredMap = new Map();
    let recoveredTime = "";
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith("school_teacher_scores_") || k.includes("teacher_scores"))) {
        try {
          const parsed = JSON.parse(localStorage.getItem(k));
          const rows = parsed && Array.isArray(parsed.rows) ? parsed.rows : (Array.isArray(parsed) ? parsed : []);
          if (rows.length > 0 && !recoveredTime) recoveredTime = parsed.lastUpdatedText || "";
          rows.forEach(r => {
            const uid = (r.reg || r.student) + "___" + (r.subject || "") + "___" + (r.term || "");
            if (!recoveredMap.has(uid)) recoveredMap.set(uid, r);
          });
        } catch (e) { }
      }
    }
    if (recoveredMap.size > 0) {
      const rows = Array.from(recoveredMap.values());
      const res = {
        rows,
        version: "recovered",
        lastUpdatedText: recoveredTime || "Saved device copy",
        timestamp: Date.now()
      };
      _memoryCachedScores = res;
      return res;
    }
    return null;
  } catch (e) {
    return null;
  }
}

function setCachedScores(rows, version, timeStr) {
  if (!rows || rows.length === 0) {
    const existing = getCachedScores();
    if (existing && existing.rows && existing.rows.length > 0) {
      console.warn("Prevented overwriting cached scores with empty array.");
      return;
    }
  }

  const cacheObj = {
    version: version || "",
    timestamp: Date.now(),
    lastUpdatedText: timeStr || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    rows
  };

  _memoryCachedScores = cacheObj;

  // 1. Unlimited capacity storage in IndexedDB (never hits 5MB quota)
  idbScoreStorage.set("admin_scores", cacheObj).catch(() => { });

  // 2. Free up localStorage by deleting duplicate/stale backup keys
  cleanupObsoleteStorage();

  // 3. Save single copy to localStorage
  try {
    const payload = JSON.stringify(cacheObj);
    localStorage.setItem(SCORES_CACHE_KEY, payload);
  } catch (err) {
    // If browser hits 5MB limit on localStorage, IndexedDB safely preserves all records
    console.info("localStorage 5MB limit handled safely; records preserved in IndexedDB.");
  }
}

function updateAdminFreshness(timeStr, isOffline = false) {
  const badge = $("adminFreshnessBadge");
  if (badge) {
    if (isOffline) {
      badge.innerHTML = ` · <span style="color:var(--text-muted)">Saved device copy (${esc(timeStr)})</span>`;
    } else {
      badge.innerHTML = ` · <span>Last updated: ${esc(timeStr)}</span>`;
    }
  }
}

async function loadStudentScores(force = false) {
  const cached = getCachedScores();

  // If in-memory records are already loaded and not forcing, just re-apply filters
  if (!force && allScoreRows.length) {
    applyScoreFilters();
    return;
  }

  // ── INSTANT DISPLAY: show cached scores immediately, zero wait ──
  if (cached && Array.isArray(cached.rows) && cached.rows.length > 0) {
    allScoreRows = deduplicateScoreRows(cached.rows);
    updateAdminFreshness(cached.lastUpdatedText || "Saved device copy", false);
    buildAdminTermTabs();

    // If not forced, do a background version check — if cache matches cloud, we're done
    if (!force) {
      (async () => {
        try {
          if (!window.dbClient || !window.dbClient.getVersion) return;
          const cloudVersion = await window.dbClient.getVersion();
          // Cache is up to date — nothing more to do
          if (cloudVersion && cached.version && cached.version === cloudVersion) return;
          // Version mismatch or new data — fetch silently in background
          const freshRows = await window.dbClient.getScores();
          if (freshRows && freshRows.length > 0) {
            allScoreRows = deduplicateScoreRows(freshRows);
            const now = new Date();
            const timeStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
            setCachedScores(allScoreRows, cloudVersion || now.toISOString(), timeStr);
            updateAdminFreshness(timeStr, false);
            buildAdminTermTabs();
            const pushBtn = $("scoresPushCloudBtn");
            if (pushBtn) pushBtn.style.display = "none";
          } else if (!cloudVersion) {
            // Supabase empty — show push button
            const pushBtn = $("scoresPushCloudBtn");
            if (pushBtn) { pushBtn.style.display = ""; pushBtn.disabled = false; pushBtn.innerHTML = "&#8679; Push to Cloud"; }
            _autoSeedSupabaseFromCache(allScoreRows);
          }
        } catch (e) {
          console.warn("Background version check:", e);
        }
      })();
      return; // Return immediately — scores already on screen!
    }
  }

  // ── FORCED REFRESH or first-ever load with no cache ──
  if (!allScoreRows.length) {
    const tbody = $("scoresTbody");
    if (tbody) tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--text-muted)">Loading examination records from Supabase...</td></tr>';
  }

  try {
    const refBtn = $("scoresRefreshBtn");
    if (force && refBtn) {
      refBtn.innerHTML = "&#8635; Refreshing...";
      refBtn.disabled = true;
    }
    const freshRows = await window.dbClient.getScores();

    if (freshRows && freshRows.length > 0) {
      allScoreRows = deduplicateScoreRows(freshRows);
      const now = new Date();
      const timeStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
      const cloudVersion = now.toISOString();
      await window.dbClient.setVersion({ lastUpdated: cloudVersion });
      setCachedScores(allScoreRows, cloudVersion, timeStr);
      updateAdminFreshness(timeStr, false);
      buildAdminTermTabs();
      const pushBtn = $("scoresPushCloudBtn");
      if (pushBtn) pushBtn.style.display = "none";
    } else {
      // Supabase returned 0 rows
      const savedCache = getCachedScores();
      if (savedCache && Array.isArray(savedCache.rows) && savedCache.rows.length > 0) {
        allScoreRows = deduplicateScoreRows(savedCache.rows);
        updateAdminFreshness(savedCache.lastUpdatedText || "Saved device copy", false);
        buildAdminTermTabs();
        const pushBtn = $("scoresPushCloudBtn");
        if (pushBtn) { pushBtn.style.display = ""; pushBtn.disabled = false; pushBtn.innerHTML = "&#8679; Push to Cloud"; }
        _autoSeedSupabaseFromCache(allScoreRows);
      } else {
        allScoreRows = [];
        updateAdminFreshness("No records", false);
        buildAdminTermTabs();
      }
    }
  } catch (e) {
    console.warn("Supabase scores fetch error:", e);
    const savedCache = getCachedScores();
    if (savedCache && Array.isArray(savedCache.rows) && savedCache.rows.length > 0) {
      allScoreRows = savedCache.rows;
      updateAdminFreshness(savedCache.lastUpdatedText || "Earlier session", true);
      buildAdminTermTabs();
    } else {
      const tbody = $("scoresTbody");
      if (tbody) tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:24px;color:var(--status-fail)">Failed to load scores: ' + esc(e.message) + '</td></tr>';
    }
  } finally {
    const refBtn = $("scoresRefreshBtn");
    if (refBtn) {
      refBtn.innerHTML = "&#8635; Refresh Cloud";
      refBtn.disabled = false;
    }
  }
}

// Background helper: seeds Supabase from cached rows grouped by term
function _autoSeedSupabaseFromCache(rows) {
  const termMap = {};
  rows.forEach(r => {
    const t = r.term || "Unknown Term";
    if (!termMap[t]) termMap[t] = [];
    termMap[t].push(r);
  });
  (async () => {
    try {
      for (const [term, termRows] of Object.entries(termMap)) {
        await window.dbClient.saveScoresBatch(termRows, term);
      }
      console.log("Supabase auto-seed completed:", rows.length, "records.");
      const pushBtn = $("scoresPushCloudBtn");
      if (pushBtn) pushBtn.style.display = "none";
    } catch (err) {
      console.warn("Supabase auto-seed warning:", err);
    }
  })();
}

// ── Push Cached Scores to Supabase Cloud ──────────────────────────────────────
async function pushCachedScoresToCloud() {
  const cached = getCachedScores();
  if (!cached || !Array.isArray(cached.rows) || cached.rows.length === 0) {
    showToast({
      type: "warning",
      title: "No Cached Scores",
      message: "No saved device scores found to push. Please upload a CSV first."
    });
    return;
  }

  const pushBtn = $("scoresPushCloudBtn");
  if (pushBtn) { pushBtn.disabled = true; pushBtn.textContent = "Pushing..."; }

  try {
    const rows = cached.rows;
    // Group rows by term
    const termMap = {};
    rows.forEach(r => {
      const t = r.term || "Unknown Term";
      if (!termMap[t]) termMap[t] = [];
      termMap[t].push(r);
    });

    const terms = Object.keys(termMap);
    console.log("Pushing " + rows.length + " cached records across " + terms.length + " term(s) to Supabase...");

    for (const term of terms) {
      const termRows = termMap[term];
      console.log("  -> Uploading " + termRows.length + " rows for term: " + term);
      await window.dbClient.saveScoresBatch(termRows, term);
    }

    // Reload from Supabase to confirm
    await loadStudentScores(true);

    if (pushBtn) { pushBtn.style.display = "none"; }
    showToast({
      type: "success",
      title: "Scores Pushed",
      message: `Successfully pushed ${rows.length.toLocaleString()} records to Supabase! All portals now have access.`
    });
  } catch (err) {
    console.error("Push to cloud error:", err);
    showToast({
      type: "error",
      title: "Push Failed",
      message: err.message
    });
    if (pushBtn) { pushBtn.disabled = false; pushBtn.innerHTML = "&#8679; Push to Cloud"; }
  }
}

function buildAdminTermTabs() {
  const terms = [...new Set(allScoreRows.map(r => r.term).filter(Boolean))].sort();
  const $tabs = $("scoresTermTabs");
  $tabs.innerHTML = "";

  populateConversionTermSelect(terms);

  if (!terms.length) {
    $tabs.innerHTML = `<span style="color:var(--text-muted);font-size:13px">No examination records uploaded yet.</span>`;
    applyScoreFilters();
    return;
  }

  // "All terms" button
  const allTab = document.createElement("button");
  allTab.type = "button";
  allTab.className = "term-tab" + (adminCurrentTerm === null ? " active" : "");
  allTab.textContent = "All terms";
  allTab.onclick = () => {
    adminCurrentTerm = null;
    scoresCurrentPage = 1;
    updateAdminTermTabs();
    const scoped = termScopedRows();
    buildAdminFilters(scoped);
    applyScoreFilters(scoped);

    const sel = document.getElementById("convTermSelect");
    if (sel) {
      sel.value = "__ALL__";
      refreshConversionUI();
    }
    const tSel = $("dashFilterTerm");
    if (tSel) {
      tSel.value = "";
    }
  };
  $tabs.appendChild(allTab);

  terms.forEach(term => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "term-tab" + (adminCurrentTerm === term ? " active" : "");
    btn.textContent = term;
    btn.onclick = () => {
      adminCurrentTerm = term;
      scoresCurrentPage = 1;
      updateAdminTermTabs();
      const scoped = termScopedRows();
      buildAdminFilters(scoped);
      applyScoreFilters(scoped);

      const sel = document.getElementById("convTermSelect");
      if (sel) {
        sel.value = term;
        refreshConversionUI();
      }
      const tSel = $("dashFilterTerm");
      if (tSel) {
        tSel.value = term;
      }
    };
    $tabs.appendChild(btn);
  });

  if ((!adminCurrentTerm || !terms.includes(adminCurrentTerm)) && terms.length) {
    adminCurrentTerm = terms[terms.length - 1];
  }
  const sel = document.getElementById("convTermSelect");
  if (sel && adminCurrentTerm) {
    sel.value = adminCurrentTerm;
  }
  refreshConversionUI();
  updateAdminTermTabs();
  buildAdminFilters();
  applyScoreFilters();
  if ($("paneDashboard") && $("paneDashboard").style.display !== "none") {
    renderExecutiveDashboard();
  }
}

function updateAdminTermTabs() {
  document.querySelectorAll("#scoresTermTabs .term-tab").forEach(btn => {
    const isAll = btn.textContent === "All terms";
    btn.classList.toggle("active", isAll ? adminCurrentTerm === null : btn.textContent === adminCurrentTerm);
  });
  $("scoresTableHeadingText").textContent = (adminCurrentTerm || "All terms") + " — Examination Scores";
}

const _termNormCache = new Map();
function normalizeTermKey(str) {
  const raw = String(str || "");
  if (_termNormCache.has(raw)) return _termNormCache.get(raw);
  const res = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (_termNormCache.size < 200) _termNormCache.set(raw, res);
  return res;
}

function termScopedRows() {
  if (!adminCurrentTerm) return allScoreRows;
  const targetNorm = normalizeTermKey(adminCurrentTerm);
  const targetIsMid = targetNorm.includes("midterm");
  const targetIsFirstTest = targetNorm.includes("firsttest");
  const targetIsFirstTerm = targetNorm.includes("firstterm");
  return allScoreRows.filter(r => {
    if (!r.term) return false;
    if (r.term === adminCurrentTerm) return true;
    const rNorm = normalizeTermKey(r.term);
    if (rNorm === targetNorm) return true;
    if (targetIsMid && rNorm.includes("midterm")) return true;
    if (targetIsFirstTest && rNorm.includes("firsttest")) return true;
    if (targetIsFirstTerm && rNorm.includes("firstterm")) return true;
    return false;
  });
}

function buildAdminFilters(precomputedRows) {
  const s = precomputedRows || termScopedRows();
  populateFilter($("scoresFilterClass"), [...new Set(s.map(r => r.class).filter(Boolean))].sort());
  updateDependentFilters(s);
}

function updateDependentFilters(precomputedRows) {
  const s = precomputedRows || termScopedRows();
  const selectedClass = $("scoresFilterClass").value;

  // Filter rows for the selected class to determine available subjects and arms
  const classRows = selectedClass ? s.filter(r => r.class === selectedClass) : s;

  const subjects = [...new Set(classRows.map(r => r.subject).filter(Boolean))].sort();
  populateFilter($("scoresFilterSubject"), subjects);

  const arms = [...new Set(classRows.map(r => r.arm).filter(Boolean))].sort();
  populateFilter($("scoresFilterArm"), arms);
}

function populateFilter(sel, vals) {
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

function applyScoreFilters(precomputedRows) {
  const sub = $("scoresFilterSubject").value;
  const cls = $("scoresFilterClass").value;
  const arm = $("scoresFilterArm").value;
  const q = ($("scoresSearchInput").value || "").trim().toLowerCase();

  const baseRows = precomputedRows || termScopedRows();
  activeFilteredRows = (!sub && !cls && !arm && !q) ? baseRows : baseRows.filter(r => {
    if (sub && r.subject !== sub) return false;
    if (cls && r.class !== cls) return false;
    if (arm && r.arm !== arm) return false;
    if (q && !(r.student || "").toLowerCase().includes(q) && !(r.reg || "").toLowerCase().includes(q)) return false;
    return true;
  });

  const total = activeFilteredRows.length;
  $("scoresRowCount").textContent = ` · ${total.toLocaleString()} record${total !== 1 ? "s" : ""}`;

  updateScoreDistributionChart(activeFilteredRows);
  updateSortIndicators();
  renderScoresTableOnly();
}

function updateScoreDistributionChart(rows) {
  const total = rows.length;
  $("scoresChartTotalLabel").textContent = total ? `${total.toLocaleString()} records analyzed` : "0 records analyzed";

  if (!total) {
    ["fail", "50", "60", "70", "80"].forEach(k => {
      $(`scores-bar-${k}`).style.width = "0%";
      $(`scores-lbl-${k}`).textContent = "0 (0%)";
    });
    return;
  }

  let fail = 0, p50 = 0, p60 = 0, p70 = 0, p80 = 0;
  for (let i = 0; i < total; i++) {
    const p = rows[i].pct || 0;
    if (p < 50) fail++;
    else if (p < 60) p50++;
    else if (p < 70) p60++;
    else if (p < 80) p70++;
    else p80++;
  }

  const pctOf = count => Math.round((count / total) * 100);

  $("scores-bar-fail").style.width = pctOf(fail) + "%";
  $("scores-lbl-fail").textContent = `${fail} (${pctOf(fail)}%)`;

  $("scores-bar-50").style.width = pctOf(p50) + "%";
  $("scores-lbl-50").textContent = `${p50} (${pctOf(p50)}%)`;

  $("scores-bar-60").style.width = pctOf(p60) + "%";
  $("scores-lbl-60").textContent = `${p60} (${pctOf(p60)}%)`;

  $("scores-bar-70").style.width = pctOf(p70) + "%";
  $("scores-lbl-70").textContent = `${p70} (${pctOf(p70)}%)`;

  $("scores-bar-80").style.width = pctOf(p80) + "%";
  $("scores-lbl-80").textContent = `${p80} (${pctOf(p80)}%)`;
}

// ── Sorting ──
document.querySelectorAll(".table-scroll thead th.sortable").forEach(th => {
  th.onclick = () => {
    const col = th.dataset.sort;
    if (adminSortCol === col) {
      adminSortAsc = !adminSortAsc;
    } else {
      adminSortCol = col;
      adminSortAsc = true;
    }
    updateSortIndicators();
    renderScoresTableOnly();
  };
});

function updateSortIndicators() {
  document.querySelectorAll(".table-scroll .sort-indicator").forEach(el => el.textContent = "");
  const activeIndicator = $(`si-${adminSortCol}`);
  if (activeIndicator) {
    activeIndicator.textContent = adminSortAsc ? " ↑" : " ↓";
  }
}

function getSortedAdminRows() {
  if (adminSortCol === "index") return activeFilteredRows;
  const len = activeFilteredRows.length;
  if (len <= 1) return activeFilteredRows;
  const dir = adminSortAsc ? 1 : -1;
  if (adminSortCol === "pct" || adminSortCol === "score") {
    return [...activeFilteredRows].sort((a, b) => {
      const va = Number(a.pct) || 0;
      const vb = Number(b.pct) || 0;
      return va < vb ? -dir : (va > vb ? dir : 0);
    });
  }
  const col = adminSortCol;
  // Precompute lowercase keys once (Schwarzian transform) instead of .toLowerCase() inside every comparator step
  const keyed = new Array(len);
  for (let i = 0; i < len; i++) {
    const row = activeFilteredRows[i];
    keyed[i] = { k: String(row[col] || "").toLowerCase(), row };
  }
  keyed.sort((a, b) => (a.k < b.k ? -dir : (a.k > b.k ? dir : 0)));
  const out = new Array(len);
  for (let i = 0; i < len; i++) out[i] = keyed[i].row;
  return out;
}

function renderScoresTableOnly() {
  const sorted = getSortedAdminRows();
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / scoresPerPage));

  if (scoresCurrentPage > totalPages) scoresCurrentPage = totalPages;
  if (scoresCurrentPage < 1) scoresCurrentPage = 1;

  if (!total) {
    $("scoresTbody").innerHTML = `<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--text-muted)">No examination records match the selected filters.</td></tr>`;
    $("scoresPaginationInfo").textContent = "Showing 0 to 0 of 0 records";
    renderScoresPaginationControls(1, 1);
    return;
  }

  const startIdx = (scoresCurrentPage - 1) * scoresPerPage;
  const endIdx = Math.min(startIdx + scoresPerPage, total);
  const pageRows = sorted.slice(startIdx, endIdx);

  $("scoresPaginationInfo").textContent = `Showing ${(startIdx + 1).toLocaleString()} to ${endIdx.toLocaleString()} of ${total.toLocaleString()} records`;

  $("scoresTbody").innerHTML = pageRows.map((r, idx) => {
    const globalIdx = startIdx + idx + 1;
    const rawScore = parseFloat(r.score) || 0;
    const dispScore = applyScoreConversion(rawScore, r.term);
    const convPct = applyPctConversion(rawScore, r.term);
    const pctVal = convPct !== null ? convPct : (r.pct || 0);

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

    return `
      <tr>
        <td data-label="#" class="muted-cell">${globalIdx}</td>
        <td data-label="Student Name" class="student-cell">${esc(r.student)}</td>
        <td data-label="Reg Number" class="muted-cell">${esc(r.reg)}</td>
        <td data-label="Subject">${esc(r.subject)}</td>
        <td data-label="Class">${esc(r.class)}</td>
        <td data-label="Arm">${esc(r.arm)}</td>
        <td data-label="Score" class="numeric">${scoreDisplay}</td>
        <td data-label="Percentage" class="numeric">${pctVal}%</td>
        <td data-label="Status"><span class="status-text ${statusClass}">${statusLabel}</span></td>
        <td data-label="Date &amp; Time" class="muted-cell">${esc(r.date)}</td>
      </tr>
    `;
  }).join("");

  renderScoresPaginationControls(scoresCurrentPage, totalPages);
}

function renderScoresPaginationControls(cur, totalPages) {
  $("scoresFirstPageBtn").disabled = (cur <= 1);
  $("scoresPrevPageBtn").disabled = (cur <= 1);
  $("scoresNextPageBtn").disabled = (cur >= totalPages);
  $("scoresLastPageBtn").disabled = (cur >= totalPages);

  const maxButtons = 5;
  let start = Math.max(1, cur - Math.floor(maxButtons / 2));
  let end = Math.min(totalPages, start + maxButtons - 1);
  if (end - start + 1 < maxButtons) {
    start = Math.max(1, end - maxButtons + 1);
  }

  const btnHtml = [];
  for (let p = start; p <= end; p++) {
    btnHtml.push(`
      <button type="button" class="page-btn ${p === cur ? 'active' : ''}" data-goto-score-page="${p}">${p}</button>
    `);
  }
  $("scoresPageButtonsGroup").innerHTML = btnHtml.join("");

  document.querySelectorAll("[data-goto-score-page]").forEach(b => {
    b.onclick = () => {
      scoresCurrentPage = parseInt(b.dataset.gotoScorePage, 10);
      renderScoresTableOnly();
    };
  });
}

$("scoresFirstPageBtn").onclick = () => { scoresCurrentPage = 1; renderScoresTableOnly(); };
$("scoresPrevPageBtn").onclick = () => { scoresCurrentPage--; renderScoresTableOnly(); };
$("scoresNextPageBtn").onclick = () => { scoresCurrentPage++; renderScoresTableOnly(); };
$("scoresLastPageBtn").onclick = () => {
  scoresCurrentPage = Math.ceil(activeFilteredRows.length / scoresPerPage);
  renderScoresTableOnly();
};

$("scoresPageSizeSelect").onchange = (e) => {
  scoresPerPage = parseInt(e.target.value, 10) || 25;
  scoresCurrentPage = 1;
  renderScoresTableOnly();
};

$("scoresFilterClass").onchange = () => {
  scoresCurrentPage = 1;
  updateDependentFilters();
  applyScoreFilters();
};
$("scoresFilterSubject").onchange = () => {
  scoresCurrentPage = 1;
  applyScoreFilters();
};
$("scoresFilterArm").onchange = () => {
  scoresCurrentPage = 1;
  applyScoreFilters();
};
$("scoresSearchInput").oninput = () => {
  scoresCurrentPage = 1;
  applyScoreFilters();
};

// Refresh Cloud Buttons
if ($("scoresRefreshBtn")) {
  $("scoresRefreshBtn").onclick = () => loadStudentScores(true);
}

// Push cached scores to Supabase cloud
if ($("scoresPushCloudBtn")) {
  $("scoresPushCloudBtn").onclick = () => pushCachedScoresToCloud();
}

// Smart Deduplicate Button: cleans duplicates across admin, Supabase, and all teachers
async function runSmartDeduplication() {
  if (!confirm("Are you sure you want to scan and remove duplicate scores?\n\nThis will scan Supabase cloud, keep only 1 clean copy per student per subject, and instantly clean all teacher portals.")) return;
  const btns = [document.getElementById("scoresDeduplicateBtn"), document.getElementById("uploadDeduplicateBtn")].filter(Boolean);
  btns.forEach(b => { b.disabled = true; b.innerHTML = "🧹 Scanning & cleaning duplicates..."; });
  try {
    // 1. Immediately deduplicate in-memory & local cache
    allScoreRows = deduplicateScoreRows(allScoreRows);
    const now = new Date();
    const timeStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    setCachedScores(allScoreRows, now.toISOString(), timeStr);
    renderScoresTableOnly();
    buildAdminTermTabs();

    // 2. Clear any teacher private caches stored on this device
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && (k.startsWith("school_teacher_scores_") || k.includes("teacher_scores"))) {
          localStorage.removeItem(k);
        }
      }
    } catch (_) { }

    // 3. Run cloud deduplication on Supabase
    let stats = { removed: 0 };
    if (window.dbClient && window.dbClient.cleanAllDuplicates) {
      stats = await window.dbClient.cleanAllDuplicates();
    }

    // 4. Force reload fresh scores to confirm
    await loadStudentScores(true);
    await loadLiveTerms();

    showToast({
      type: "success",
      title: "Deduplication Complete",
      message: `Removed ${stats.removed || 0} duplicate records from Supabase. Teacher views updated.`
    });
  } catch (err) {
    showToast({
      type: "error",
      title: "Deduplication Error",
      message: err.message
    });
  } finally {
    const sBtn = document.getElementById("scoresDeduplicateBtn");
    if (sBtn) { sBtn.disabled = false; sBtn.innerHTML = "🧹 Remove Duplicates"; }
    const uBtn = document.getElementById("uploadDeduplicateBtn");
    if (uBtn) { uBtn.disabled = false; uBtn.innerHTML = "🧹 Clean Duplicates"; }
  }
}

if ($("scoresDeduplicateBtn")) {
  $("scoresDeduplicateBtn").onclick = runSmartDeduplication;
}
if ($("uploadDeduplicateBtn")) {
  $("uploadDeduplicateBtn").onclick = runSmartDeduplication;
}

// Print Report
if ($("scoresPrintBtn")) {
  $("scoresPrintBtn").onclick = () => window.print();
}

// Score Conversion Controls — wired lazily when scores pane opens
let _convPanelWired = false;
function initConversionPanel() {
  if (_convPanelWired) { refreshConversionUI(); return; }
  const origEl = document.getElementById("convOrigMax");
  const tgtEl = document.getElementById("convTargetMax");
  const applyBtn = document.getElementById("convApplyBtn");
  const resetBtn = document.getElementById("convResetBtn");
  const termSel = document.getElementById("convTermSelect");
  if (!origEl || !applyBtn) return;
  _convPanelWired = true;

  if (termSel) {
    termSel.addEventListener("change", () => {
      refreshConversionUI();
    });
  }

  // Collapsible Dropdown toggle for Score Conversion (Desktop and Mobile)
  const convToggleBtn = document.getElementById("convToggleBtn") || document.getElementById("convMobileToggleBtn");
  const convHeader = document.getElementById("convHeaderBar");
  const convPanel = document.getElementById("scoreConversionPanel");
  const convBody = document.getElementById("convCollapsibleBody");
  const convToggleText = document.getElementById("convToggleText") || document.getElementById("convMobileToggleText");

  function toggleScoreConversion(forceOpen) {
    if (!convPanel) return;
    const isCurrentlyOpen = convPanel.classList.contains("open") || (convBody && convBody.classList.contains("open"));
    const willOpen = (typeof forceOpen === "boolean") ? forceOpen : !isCurrentlyOpen;

    if (willOpen) {
      convPanel.classList.add("open");
      convPanel.classList.add("cbt-accordion-open");
      if (convBody) convBody.classList.add("open");
      if (convToggleBtn) convToggleBtn.classList.add("open");
      if (convToggleText) convToggleText.textContent = "Collapse Scaling";
    } else {
      convPanel.classList.remove("open");
      convPanel.classList.remove("cbt-accordion-open");
      if (convBody) convBody.classList.remove("open");
      if (convToggleBtn) convToggleBtn.classList.remove("open");
      if (convToggleText) convToggleText.textContent = "Configure Scaling";
    }
  }

  if (convToggleBtn) {
    convToggleBtn.onclick = (e) => {
      e.stopPropagation();
      toggleScoreConversion();
    };
  }

  if (convHeader) {
    convHeader.onclick = (e) => {
      if (e.target.closest("button") || e.target.closest("select") || e.target.closest("input")) return;
      toggleScoreConversion();
    };
  }

  refreshConversionUI();

  function updatePreview() {
    const o = parseFloat(origEl.value);
    const t = parseFloat(tgtEl.value);
    const multLbl = document.getElementById("convMultiplierLabel");
    if (multLbl) multLbl.textContent = (o > 0 && t > 0) ? ("x " + (t / o).toFixed(3).replace(/\.?0+$/, "")) : "";
  }
  origEl.addEventListener("input", updatePreview);
  tgtEl.addEventListener("input", updatePreview);

  function showConversionFeedback(msg) {
    let badge = document.getElementById("convFeedbackBadge");
    if (!badge) {
      badge = document.createElement("span");
      badge.id = "convFeedbackBadge";
      badge.style.fontSize = "12px";
      badge.style.fontWeight = "600";
      badge.style.marginLeft = "10px";
      badge.style.color = "var(--status-good, #10b981)";
      const p = (document.getElementById("convResetBtn") || resetBtn)?.parentNode;
      if (p) p.appendChild(badge);
    }
    badge.textContent = msg;
    badge.style.display = "inline";
    setTimeout(() => { badge.style.display = "none"; }, 4000);
  }

  applyBtn.onclick = async () => {
    const targetTerm = termSel ? termSel.value : (adminCurrentTerm || "__ALL__");
    let o = parseFloat(origEl.value);
    const t = parseFloat(tgtEl.value);

    // Auto-fallback: if user didn't enter Original Max, use auto-detected max
    if (!o || o <= 0) {
      const detected = detectOriginalMaxForTerm(allScoreRows, targetTerm);
      if (detected) {
        o = detected;
        origEl.value = detected;
      }
    }

    if (!o || o <= 0) {
      showToast({
        type: "warning",
        title: "Original Max Required",
        message: "Please provide the Original Max score (e.g. 20) or select a term with uploaded scores."
      });
      origEl.focus();
      return;
    }
    if (!t || t <= 0) {
      showToast({
        type: "warning",
        title: "Target Max Required",
        message: "Please enter the Target Max score you want to scale to (e.g. 30)."
      });
      tgtEl.focus();
      return;
    }
    const config = getConversionConfig();
    if (!config.terms) config.terms = {};
    const newCat = (targetTerm === "__ALL__") ? "__ALL__" : getCanonicalAdminTermCategory(targetTerm);
    for (const k of Object.keys(config.terms)) {
      const kCat = (k === "__ALL__") ? "__ALL__" : getCanonicalAdminTermCategory(k);
      if (kCat === newCat) delete config.terms[k];
    }
    config.terms[targetTerm] = { originalMax: o, targetMax: t };

    applyBtn.disabled = true;
    applyBtn.textContent = "Applying...";

    setScoreConversion(config);
    refreshConversionUI();
    renderScoresTableOnly();
    if (typeof renderExecutiveDashboard === "function") renderExecutiveDashboard();
    if (typeof renderExecutiveDashboard === "function") renderExecutiveDashboard();

    try {
      if (window.dbClient && window.dbClient.saveScoreConversion) {
        await window.dbClient.saveScoreConversion(config);
      }
      const label = targetTerm === "__ALL__" ? "All Terms" : targetTerm;
      showConversionFeedback(`✓ Scaling for "${label}" saved to Supabase & live for teachers!`);
      showToast({
        type: "success",
        title: "Scaling Applied",
        message: `Scaled "${label}" from /${o} to /${t} (×${(t / o).toFixed(2).replace(/\.00$/, "")}). Saved to cloud.`
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Cloud Sync Failed",
        message: "Score conversion saved locally but cloud sync failed: " + err.message
      });
    } finally {
      applyBtn.disabled = false;
      applyBtn.textContent = "Apply";
    }
  };

  resetBtn.onclick = async () => {
    const targetTerm = termSel ? termSel.value : (adminCurrentTerm || "__ALL__");
    const config = getConversionConfig();
    if (config.terms) {
      if (targetTerm === "__ALL__") {
        config.terms = {};
      } else {
        delete config.terms[targetTerm];
      }
    }
    resetBtn.disabled = true;
    resetBtn.textContent = "Resetting...";
    setScoreConversion(config);
    origEl.value = "";
    tgtEl.value = "";
    refreshConversionUI();
    renderScoresTableOnly();
    if (typeof renderExecutiveDashboard === "function") renderExecutiveDashboard();

    try {
      if (window.dbClient && window.dbClient.saveScoreConversion) {
        await window.dbClient.saveScoreConversion(config);
      }
      const label = targetTerm === "__ALL__" ? "All Terms" : targetTerm;
      showConversionFeedback(`✓ Reset scaling for "${label}"`);
      showToast({
        type: "info",
        title: "Scaling Reset",
        message: `Reset score conversion for "${label}".`
      });
    } catch (err) {
      console.warn("Cloud reset warning:", err);
    } finally {
      resetBtn.disabled = false;
      resetBtn.textContent = "Reset";
    }
  };

  // Sync latest score conversion from cloud (Supabase)
  if (window.dbClient && window.dbClient.getScoreConversionCloud) {
    window.dbClient.getScoreConversionCloud().then(cloudConv => {
      if (cloudConv && ((cloudConv.terms && Object.keys(cloudConv.terms).length > 0) || (cloudConv.originalMax && cloudConv.targetMax))) {
        setScoreConversion(cloudConv);
        refreshConversionUI();
        renderScoresTableOnly();
        if (typeof renderExecutiveDashboard === "function") renderExecutiveDashboard();
      }
    }).catch(e => console.warn("Admin cloud score conversion sync error:", e));
  }
}
// Export CSV
$("scoresExportCsvBtn").onclick = () => {
  const sorted = getSortedAdminRows();
  if (!sorted.length) {
    showToast({
      type: "warning",
      title: "No Rows to Export",
      message: "There are no score rows available to export."
    });
    return;
  }
  const headers = ["#", "Student Name", "Reg Number", "Subject", "Class", "Arm", "Score", "Percentage", "Status", "Date & Time", "Term"];
  const rows = sorted.map((r, i) => {
    const rawScore = parseFloat(r.score) || 0;
    const dispScore = applyScoreConversion(rawScore, r.term);
    const convPct = applyPctConversion(rawScore, r.term);
    const pctVal = convPct !== null ? convPct : (r.pct || 0);
    return [
      i + 1,
      `"${(r.student || "").replace(/"/g, '""')}"`,
      `"${(r.reg || "").replace(/"/g, '""')}"`,
      `"${(r.subject || "").replace(/"/g, '""')}"`,
      `"${(r.class || "").replace(/"/g, '""')}"`,
      `"${(r.arm || "").replace(/"/g, '""')}"`,
      dispScore,
      `${pctVal}%`,
      pctVal < 50 ? "Fail" : "Pass",
      `"${(r.date || "").replace(/"/g, '""')}"`,
      `"${(r.term || "").replace(/"/g, '""')}"`
    ];
  });
  const csv = [headers.join(","), ...rows.map(e => e.join(","))].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const termSlug = adminCurrentTerm ? adminCurrentTerm.replace(/\s+/g, "_") : "All_Terms";
  a.download = `Examination_Scores_${termSlug}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 300);
  showToast({
    type: "success",
    title: "Scores Exported",
    message: `Exported ${sorted.length} student examination score records.`
  });
};

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ══════════════════════════════════════════════════════════
// TEACHER ANNOUNCEMENTS & BROADCASTS MANAGEMENT
// ══════════════════════════════════════════════════════════

let adminAnnouncementsList = [];
let adminNotifEventsInitialized = false;

function populateAdminNotifSubjects() {
  const sel = $("adminNotifSubjectSelect");
  if (!sel) return;
  const currentVal = sel.value;
  const subjects = getAdminAllSubjects();
  sel.innerHTML = `<option value="">-- Choose Subject --</option>` +
    subjects.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join("");
  if (currentVal && subjects.includes(currentVal)) {
    sel.value = currentVal;
  }
}

// Helper to normalize author display (defaults legacy / administration notices to Exam Committee)
function getAuthorDisplay(author) {
  if (!author || author === "Academic Administration" || author === "School Administrator") {
    return "Exam Committee";
  }
  return author;
}

// Pre-set templates
const NOTIF_TEMPLATES = {
  locked_class: {
    category: "locked_server",
    title: "Urgent: Locked Classroom / Server Inaccessible - [Class Arm]",
    target: "all",
    message: "Dear Teachers / Class Supervisors,\n\nThe Exam Committee is currently going round to collect examination results from the local classroom servers for upload to the portal.\n\nHowever, [e.g. Year 8 Ivy Classroom / Lab Server] is currently locked, preventing us from accessing the server to harvest and upload your students' results.\n\nKindly unlock the classroom/lab or ensure the server is accessible immediately so the scores can be collected and uploaded to the portal without delay.\n\nThank you,\nExam Committee"
  },
  server_harvest: {
    category: "urgent",
    title: "Notice: CBT Server Results Harvest In Progress (Keep Rooms & Servers Open)",
    target: "all",
    message: "Dear Academic Staff & Class Tutors,\n\nPlease be informed that the Exam Committee is currently going round all classrooms and computer labs to harvest and collect examination results from local servers for upload to the portal.\n\nPlease DO NOT lock any classrooms or shut down the server computers until the Exam Committee has completed harvesting results for all class arms.\n\nThank you for your cooperation,\nExam Committee"
  },
  missing_class: {
    category: "missing_class",
    title: "Missing Class Scores Notice: [Subject / Class]",
    target: "all",
    message: "Dear Subject Teacher / Academic Staff,\n\nPlease note that the score records currently compiled for [Subject] are missing results for [e.g. Year 8 Ivy].\n\nKindly forward or submit your assessment score sheet for this class arm to the Exam Committee immediately so it can be uploaded and published to the portal.\n\nThank you,\nExam Committee"
  },
  missing_cbt_class: {
    category: "missing_class",
    title: "CBT Exam Question Paper Missing Class: [Subject / Class]",
    target: "all",
    message: "Dear Teacher,\n\nYour CBT examination questions submitted for [Subject] currently do not include questions or arm assignments for [e.g. Year 8].\n\nKindly log in to your Teacher Portal, click 'Set CBT Exam', and submit the questions for the missing class as soon as possible so the exam can be scheduled.\n\nThank you,\nExam Committee"
  },
  deadline: {
    category: "exam_upload",
    title: "Reminder: Score Submission Deadline to Exam Committee",
    target: "all",
    message: "Dear Teachers,\n\nThis is a gentle reminder that the deadline for submitting all examination scores, continuous assessments, and broadsheets to the Exam Committee is [Date/Time, e.g. Friday by 4:00 PM].\n\nPlease ensure all subject score sheets across all your assigned class arms are handed in on time so results can be compiled and uploaded to the portal.\n\nThank you,\nExam Committee"
  },
  scores_published: {
    category: "exam_upload",
    title: "Examination Scores Successfully Uploaded & Published",
    target: "all",
    message: "Dear Academic Staff,\n\nThe examination scores for [Term, e.g. First Term Examination] have now been uploaded and published to the portal.\n\nPlease log in to your Teacher Dashboard to inspect your students' scores, verify averages, and review candidates requiring rewrites (≤25%).\n\nThank you,\nExam Committee"
  },
  cbt_review: {
    category: "urgent",
    title: "Urgent: CBT Exam Questions Submission & Review",
    target: "all",
    message: "Dear Teachers,\n\nAll teachers who have not yet submitted their CBT examination questions for the upcoming assessment period must upload them via the 'Set CBT Exam' tab as soon as possible for Exam Committee review and gate scheduling.\n\nThank you,\nExam Committee"
  },
  moderation: {
    category: "general",
    title: "Examination Results Moderation In Progress",
    target: "all",
    message: "Dear Teachers,\n\nScore verification and grade moderation are currently in progress. Please review your class student score tables on your dashboard and report any discrepancies or students requiring rewrite to the Exam Committee.\n\nThank you,\nExam Committee"
  },
  general: {
    category: "general",
    title: "Notice: Academic Staff Briefing - Exam Committee",
    target: "all",
    message: "Dear Teachers,\n\nPlease be informed that an academic briefing will be held on [Day/Date] at [Time] regarding the examination schedule and student score assessments.\n\nAttendance is mandatory.\n\nExam Committee"
  },
  portal: {
    category: "portal",
    title: "System Notice: Cloud Database Synchronization",
    target: "all",
    message: "Dear Academic Staff,\n\nPlease note that scheduled portal database maintenance and cloud synchronization are scheduled for [Date & Time]. All teacher scores and CBT questions will remain safely backed up in the cloud.\n\nThank you,\nExam Committee & Technical Support"
  }
};

// Collapsible Dropdown Accordion for Broadcast Composer
function toggleAdminComposerAccordion(forceOpen) {
  const body = $("adminComposerCollapsibleBody");
  const card = $("adminComposerCard");
  const btn = $("adminToggleComposerBtn");
  const text = $("adminComposerToggleText");
  if (!body) return;

  const isCurrentlyOpen = body.classList.contains("open");
  const willOpen = (typeof forceOpen === "boolean") ? forceOpen : !isCurrentlyOpen;

  if (willOpen) {
    body.classList.add("open");
    if (card) card.classList.add("cbt-accordion-open");
    if (btn) btn.classList.add("open");
    if (text) text.textContent = "Collapse Composer";
  } else {
    body.classList.remove("open");
    if (card) card.classList.remove("cbt-accordion-open");
    if (btn) btn.classList.remove("open");
    if (text) text.textContent = "Expand Composer";
  }
}

// Collapsible Dropdown Accordion for Push Gateway
function toggleAdminGatewayAccordion(forceOpen) {
  const body = $("adminGatewayCollapsibleBody");
  const card = $("adminGatewayCard");
  const btn = $("adminToggleGatewayBtn");
  const text = $("adminGatewayToggleText");
  if (!body) return;

  const isCurrentlyOpen = body.classList.contains("open");
  const willOpen = (typeof forceOpen === "boolean") ? forceOpen : !isCurrentlyOpen;

  if (willOpen) {
    body.classList.add("open");
    if (card) card.classList.add("cbt-accordion-open");
    if (btn) btn.classList.add("open");
    if (text) text.textContent = "Collapse Gateway";
  } else {
    body.classList.remove("open");
    if (card) card.classList.remove("cbt-accordion-open");
    if (btn) btn.classList.remove("open");
    if (text) text.textContent = "Expand Gateway";
  }
}

function initAdminAnnouncementsEvents() {
  if (adminNotifEventsInitialized) return;
  adminNotifEventsInitialized = true;

  // Accordion Dropdown Toggles
  const compBtn = $("adminToggleComposerBtn");
  if (compBtn) {
    compBtn.onclick = (e) => {
      e.stopPropagation();
      toggleAdminComposerAccordion();
    };
  }

  const compHeader = $("adminComposerHeader");
  if (compHeader) {
    compHeader.onclick = (e) => {
      if (e.target.closest("button") || e.target.closest("input") || e.target.closest("select") || e.target.closest("textarea")) return;
      toggleAdminComposerAccordion();
    };
  }

  const gateBtn = $("adminToggleGatewayBtn");
  if (gateBtn) {
    gateBtn.onclick = (e) => {
      e.stopPropagation();
      toggleAdminGatewayAccordion();
    };
  }

  const gateHeader = $("adminGatewayHeader");
  if (gateHeader) {
    gateHeader.onclick = (e) => {
      if (e.target.closest("button") || e.target.closest("input") || e.target.closest("select")) return;
      toggleAdminGatewayAccordion();
    };
  }

  const tplSelect = $("adminNotifTemplateSelect");
  if (tplSelect) {
    tplSelect.onchange = () => {
      const val = tplSelect.value;
      if (!val || !NOTIF_TEMPLATES[val]) return;
      toggleAdminComposerAccordion(true);
      const t = NOTIF_TEMPLATES[val];
      if ($("adminNotifCategory")) $("adminNotifCategory").value = t.category;
      if ($("adminNotifTitle")) $("adminNotifTitle").value = t.title;
      if ($("adminNotifMessage")) {
        $("adminNotifMessage").value = t.message;
        const countEl = $("adminNotifCharCount");
        if (countEl) countEl.textContent = `${t.message.length} characters`;
      }
      if ($("adminNotifTarget")) {
        $("adminNotifTarget").value = t.target;
        $("adminNotifTarget").dispatchEvent(new Event("change"));
      }
    };
  }

  const targetSelect = $("adminNotifTarget");
  if (targetSelect) {
    targetSelect.onchange = () => {
      const mode = targetSelect.value;
      const subWrap = $("adminNotifSubjectWrap");
      const clsWrap = $("adminNotifClassWrap");
      if (subWrap) subWrap.style.display = (mode === "subject") ? "block" : "none";
      if (clsWrap) clsWrap.style.display = (mode === "class") ? "block" : "none";
      if (mode === "subject") populateAdminNotifSubjects();
    };
  }

  const clearBtn = $("adminClearNotifBtn");
  if (clearBtn) {
    clearBtn.onclick = () => {
      if ($("adminNotifForm")) $("adminNotifForm").reset();
      if ($("adminNotifTemplateSelect")) $("adminNotifTemplateSelect").value = "";
      if ($("adminNotifTarget")) $("adminNotifTarget").dispatchEvent(new Event("change"));
      const countEl = $("adminNotifCharCount");
      if (countEl) countEl.textContent = "0 characters";
    };
  }

  const msgInput = $("adminNotifMessage");
  const countEl = $("adminNotifCharCount");
  if (msgInput && countEl) {
    msgInput.addEventListener("input", () => {
      const len = msgInput.value.length;
      countEl.textContent = `${len} character${len === 1 ? '' : 's'}`;
    });
  }

  const sendBtn = $("adminSendNotifBtn");
  if (sendBtn) {
    sendBtn.onclick = handleSendAdminAnnouncement;
  }

  const refreshBtn = $("adminRefreshNotifsBtn");
  if (refreshBtn) {
    refreshBtn.onclick = () => {
      loadAdminAnnouncements(true);
      showToast({ type: "info", title: "Refreshed", message: "Announcements synchronized with cloud." });
    };
  }

  // OneSignal Push Gateway Events
  const savePushBtn = $("adminSavePushConfigBtn");
  if (savePushBtn) {
    savePushBtn.onclick = handleSaveAdminOneSignalConfig;
  }

  const testPushBtn = $("adminTestPushBtn");
  if (testPushBtn) {
    testPushBtn.onclick = handleTestAdminPush;
  }

  loadAdminOneSignalConfig();
}

// ══════════════════════════════════════════════════════════
// ONESIGNAL CONFIGURATION & PUSH GATEWAY HELPERS
// ══════════════════════════════════════════════════════════

async function getEffectiveOneSignalConfig() {
  let cfg = null;
  // 1. Try Supabase
  if (window.dbClient && typeof window.dbClient.getOneSignalConfig === "function") {
    try {
      cfg = await window.dbClient.getOneSignalConfig();
    } catch (e) {
      console.warn("dbClient.getOneSignalConfig warning:", e);
    }
  }
  // 2. Fallback to localStorage
  if (!cfg || !cfg.restApiKey) {
    try {
      const raw = localStorage.getItem("onesignal_admin_config");
      if (raw) {
        const parsed = JSON.parse(raw);
        cfg = Object.assign({}, cfg || {}, parsed);
      }
    } catch (e) {}
  }
  // 3. Fallback to active input fields on admin screen
  const inputAppId = $("adminOneSignalAppId")?.value?.trim();
  const inputRestKey = $("adminOneSignalRestKey")?.value?.trim();
  return {
    appId: inputAppId || cfg?.appId || "89e9469f-65f7-48aa-a798-6f6628cf4c5e",
    restApiKey: inputRestKey || cfg?.restApiKey || "",
    enabled: cfg ? cfg.enabled !== false : true
  };
}

async function loadAdminOneSignalConfig() {
  try {
    const cfg = await getEffectiveOneSignalConfig();
    const appIdInput = $("adminOneSignalAppId");
    const restKeyInput = $("adminOneSignalRestKey");
    const badge = $("adminPushGatewayBadge");
    const statusText = $("adminPushGatewayStatusText");

    const currentAppId = cfg?.appId || "89e9469f-65f7-48aa-a798-6f6628cf4c5e";
    if (appIdInput && (!appIdInput.value || appIdInput.value === "89e9469f-65f7-48aa-a798-6f6628cf4c5e")) {
      appIdInput.value = currentAppId;
    }
    if (restKeyInput && !restKeyInput.value && cfg?.restApiKey) {
      restKeyInput.value = cfg.restApiKey;
    }

    const hasKey = !!(restKeyInput?.value || cfg?.restApiKey);
    if (currentAppId && hasKey) {
      if (badge && statusText) {
        badge.style.background = "rgba(16, 185, 129, 0.12)";
        badge.style.borderColor = "rgba(16, 185, 129, 0.35)";
        badge.style.color = "#10b981";
        const dot = badge.querySelector(".pulse-dot");
        if (dot) dot.style.background = "#10b981";
        statusText.textContent = "Gateway Ready (OneSignal Active)";
      }
    } else {
      if (badge && statusText) {
        badge.style.background = "rgba(245, 158, 11, 0.1)";
        badge.style.borderColor = "rgba(245, 158, 11, 0.3)";
        badge.style.color = "#f59e0b";
        const dot = badge.querySelector(".pulse-dot");
        if (dot) dot.style.background = "#f59e0b";
        statusText.textContent = "Paste REST API Key to Activate";
      }
    }
  } catch (err) {
    console.warn("loadAdminOneSignalConfig error:", err);
  }
}

async function handleSaveAdminOneSignalConfig() {
  const appId = $("adminOneSignalAppId")?.value.trim();
  let restApiKey = $("adminOneSignalRestKey")?.value.trim();

  if (!appId) {
    showToast({ type: "warning", title: "App ID Required", message: "Please enter your OneSignal App ID." });
    $("adminOneSignalAppId")?.focus();
    return;
  }

  if (!restApiKey) {
    showToast({ type: "warning", title: "REST API Key Required", message: "Please paste your OneSignal REST API Key before saving." });
    $("adminOneSignalRestKey")?.focus();
    return;
  }

  // Clean key: strip quotes, whitespace, and any accidental 'Key ' or 'Basic ' prefix
  restApiKey = restApiKey.replace(/^["']|["']$/g, "").trim();
  restApiKey = restApiKey.replace(/^(?:Key|Bearer|Basic)\s+/i, "").trim();

  // Validate that the user didn't accidentally paste the App ID into the REST API Key field
  if (appId.toLowerCase() === restApiKey.toLowerCase()) {
    showToast({
      type: "error",
      title: "Invalid REST API Key",
      message: "The REST API Key cannot be the same as the App ID! In OneSignal, go to Settings (gear icon) > Keys & IDs and copy the 'App API Key' (REST API Key)."
    });
    $("adminOneSignalRestKey")?.focus();
    return;
  }

  const saveBtn = $("adminSavePushConfigBtn");
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
  }

  try {
    const payload = { appId, restApiKey, enabled: true, updatedAt: new Date().toISOString() };

    // 1. Immediately store in localStorage so it always works
    try {
      localStorage.setItem("onesignal_admin_config", JSON.stringify(payload));
    } catch (e) {}

    // 2. Persist to Supabase if available
    if (window.dbClient && typeof window.dbClient.saveOneSignalConfig === "function") {
      try {
        await window.dbClient.saveOneSignalConfig(payload);
      } catch (dbErr) {
        console.warn("Supabase saveOneSignalConfig note:", dbErr);
      }
    }

    showToast({ type: "success", title: "Push Settings Saved", message: "OneSignal Push Gateway configured successfully." });
    await loadAdminOneSignalConfig();
  } catch (err) {
    console.error("Save OneSignal config error:", err);
    showToast({ type: "error", title: "Save Failed", message: err.message || "Failed to save push settings." });
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = "💾 Save Push Settings";
    }
  }
}

async function handleTestAdminPush() {
  const cfg = await getEffectiveOneSignalConfig();
  if (!cfg || !cfg.appId || !cfg.restApiKey) {
    showToast({ type: "warning", title: "Configuration Incomplete", message: "Please paste your OneSignal REST API Key and click 'Save Push Settings' first." });
    $("adminOneSignalRestKey")?.focus();
    return;
  }

  const cleanKey = cfg.restApiKey.trim().replace(/^["']|["']$/g, "").replace(/^(?:Key|Bearer|Basic)\s+/i, "").trim();
  if (cfg.appId.trim().toLowerCase() === cleanKey.toLowerCase()) {
    showToast({
      type: "error",
      title: "Invalid REST API Key",
      message: "Your REST API Key is identical to your App ID. Please copy the 'App API Key' from OneSignal > Settings > Keys & IDs."
    });
    $("adminOneSignalRestKey")?.focus();
    return;
  }

  const testBtn = $("adminTestPushBtn");
  if (testBtn) {
    testBtn.disabled = true;
    testBtn.textContent = "Sending Test...";
  }

  try {
    const res = await dispatchOneSignalPush({
      title: "Test Alert",
      message: "This is a test notification from the Exam Committee. Push notifications are active on your device!",
      target: "all"
    });
    if (res && res.success) {
      showToast({ type: "success", title: "Test Push Sent", message: `Dispatched to ${res.recipients || 'active'} device(s)! Check phone lock screen.` });
    } else {
      showToast({ type: "error", title: "Push Notice", message: res?.error || "Dispatched. Check your device lock screen.", duration: 8500 });
    }
  } catch (err) {
    console.error("Test push error:", err);
    showToast({ type: "error", title: "Push Dispatch Error", message: err.message || "Failed to send test push." });
  } finally {
    if (testBtn) {
      testBtn.disabled = false;
      testBtn.textContent = "🔔 Send Test Push";
    }
  }
}

async function dispatchOneSignalPush({ title, message, target, targetSubject }) {
  try {
    const cfg = await getEffectiveOneSignalConfig();
    const appId = (cfg?.appId || "89e9469f-65f7-48aa-a798-6f6628cf4c5e").trim();
    let restApiKey = (cfg?.restApiKey || "").trim();

    if (!appId || !restApiKey || cfg?.enabled === false) {
      return { success: false, reason: "not_configured" };
    }

    // Clean key: strip quotes, whitespace, and prefixes
    restApiKey = restApiKey.replace(/^["']|["']$/g, "").trim();
    restApiKey = restApiKey.replace(/^(?:Key|Bearer|Basic)\s+/i, "").trim();

    // Determine endpoint: use relative endpoint on Vercel, or full URL on local/file testing
    const isLiveVercel = window.location.hostname.includes("vercel.app");
    const pushEndpoint = isLiveVercel ? "/api/send-push" : "https://hlconline.vercel.app/api/send-push";

    const payload = {
      appId,
      restApiKey,
      title: title || "Announcement",
      message: message || "",
      target: target || "all",
      targetSubject: targetSubject || ""
    };

    const resp = await fetch(pushEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await resp.json().catch(() => null);
    if (!resp.ok) {
      throw new Error(data?.error || `Server error ${resp.status}`);
    }
    return { success: true, recipients: data?.recipients || 0 };
  } catch (err) {
    console.warn("dispatchOneSignalPush error:", err);
    return { success: false, error: err.message };
  }
}

async function handleSendAdminAnnouncement() {
  const title = $("adminNotifTitle")?.value.trim();
  const message = $("adminNotifMessage")?.value.trim();
  const category = $("adminNotifCategory")?.value || "general";
  const target = $("adminNotifTarget")?.value || "all";
  const targetSubject = (target === "subject") ? ($("adminNotifSubjectSelect")?.value || "").trim() : "";
  const targetClass = (target === "class") ? ($("adminNotifClassSelect")?.value || "").trim() : "";
  const pinned = !!$("adminNotifPinned")?.checked;

  if (!title) {
    showToast({ type: "warning", title: "Missing Title", message: "Please enter a broadcast title or subject." });
    $("adminNotifTitle")?.focus();
    return;
  }

  if (target === "subject" && !targetSubject) {
    showToast({ type: "warning", title: "Select Subject", message: "Please choose the target subject for this notice." });
    $("adminNotifSubjectSelect")?.focus();
    return;
  }

  if (!message) {
    showToast({ type: "warning", title: "Missing Message", message: "Please enter your announcement message instructions." });
    $("adminNotifMessage")?.focus();
    return;
  }

  const sendBtn = $("adminSendNotifBtn");
  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.innerHTML = "<span>Sending Broadcast...</span>";
  }

  try {
    const authorInput = $("adminNotifAuthor");
    const author = (authorInput && authorInput.value.trim()) ? authorInput.value.trim() : "Exam Committee";

    const notif = {
      title,
      category,
      target,
      targetSubject,
      targetClass,
      message,
      pinned,
      author: author
    };

    if (window.dbClient && window.dbClient.addTeacherAnnouncement) {
      await window.dbClient.addTeacherAnnouncement(notif);
    } else {
      throw new Error("Database client not available");
    }

    showToast({
      type: "success",
      title: "Broadcast Published",
      message: "Announcement successfully dispatched to teacher dashboards."
    });

    // Also dispatch OneSignal Background Push if checked
    const sendPushCheckbox = $("adminSendPushCheckbox");
    if (sendPushCheckbox && sendPushCheckbox.checked) {
      dispatchOneSignalPush({
        title,
        message: cleanNotifMessage(message),
        target,
        targetSubject
      }).then(res => {
        if (res.success && res.recipients > 0) {
          showToast({
            type: "info",
            title: "Device Push Sent",
            message: `Background alert pushed to ${res.recipients} teacher device(s).`
          });
        }
      }).catch(e => console.warn("Background push dispatch error:", e));
    }

    // Reset form
    if ($("adminNotifForm")) $("adminNotifForm").reset();
    if ($("adminNotifTemplateSelect")) $("adminNotifTemplateSelect").value = "";
    if ($("adminNotifTarget")) $("adminNotifTarget").dispatchEvent(new Event("change"));

    // Reload list
    await loadAdminAnnouncements(true);
  } catch (err) {
    console.error("handleSendAdminAnnouncement error:", err);
    showToast({ type: "error", title: "Broadcast Failed", message: err.message || "Failed to publish announcement to cloud." });
  } finally {
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.innerHTML = "<span>🚀 Send Broadcast to Teachers</span>";
    }
  }
}

async function loadAdminAnnouncements(force = false) {
  try {
    if (window.dbClient && window.dbClient.getTeacherAnnouncements) {
      adminAnnouncementsList = await window.dbClient.getTeacherAnnouncements();
    } else {
      adminAnnouncementsList = [];
    }

    renderAdminAnnouncementsList();
  } catch (err) {
    console.error("loadAdminAnnouncements error:", err);
    const container = $("adminNotifsList");
    if (container) {
      container.innerHTML = `<div style="text-align:center;padding:24px;color:var(--status-fail);">Failed to load announcements from cloud.</div>`;
    }
  }
}

function cleanNotifMessage(msg) {
  if (!msg) return "";
  return msg
    .replace(/Academic Administration/g, "Exam Committee")
    .replace(/administrative review/gi, "Exam Committee review")
    .replace(/Administrative Office/g, "Exam Committee")
    .replace(/Administration team/g, "Exam Committee");
}

function renderAdminAnnouncementsList() {
  const countEl = $("adminNotifCount");
  const badgeEl = $("adminNotifsCountBadge");
  const container = $("adminNotifsList");

  const total = adminAnnouncementsList.length;
  if (countEl) countEl.textContent = total;
  if (badgeEl) {
    badgeEl.textContent = total;
    badgeEl.style.display = total > 0 ? "inline-block" : "none";
  }

  if (!container) return;

  if (total === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:36px 16px;background:var(--surface-alt);border:1px dashed var(--border);border-radius:var(--radius);color:var(--text-muted);">
        <div style="font-size:24px;margin-bottom:8px;">📢</div>
        <div style="font-weight:700;font-size:14px;color:var(--text);margin-bottom:4px;">No Broadcasts Sent Yet</div>
        <div style="font-size:12.5px;">Announcements you send from the composer above will appear here and on teacher dashboards instantly.</div>
      </div>
    `;
    return;
  }

  const categoryLabels = {
    cbt_reupload: { label: "🔄 CBT Exam Re-uploaded / Edited", color: "#d97706", bg: "rgba(217, 119, 6, 0.12)", border: "rgba(217, 119, 6, 0.3)" },
    locked_server: { label: "🔒 Locked Room / Server Inaccessible", color: "#dc2626", bg: "rgba(220, 38, 38, 0.12)", border: "rgba(220, 38, 38, 0.35)" },
    missing_class: { label: "⚠️ Missing Class / Incomplete Upload", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.3)" },
    exam_upload: { label: "📝 Exam Upload Notice", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.3)" },
    urgent: { label: "🚨 Urgent Notice", color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)", border: "rgba(239, 68, 68, 0.3)" },
    general: { label: "📢 General Staff Notice", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.12)", border: "rgba(139, 92, 246, 0.3)" },
    portal: { label: "🛠️ Portal Maintenance", color: "#06b6d4", bg: "rgba(6, 182, 212, 0.12)", border: "rgba(6, 182, 212, 0.3)" }
  };

  container.innerHTML = adminAnnouncementsList.map(item => {
    const cat = categoryLabels[item.category] || categoryLabels.general;
    let targetLabel = "👥 All Teachers";
    let isForTeachers = true;
    if (item.target === "admin" || item.category === "cbt_reupload") {
      targetLabel = "🛡️ Admin Only";
      isForTeachers = false;
    } else if (item.target === "subject" && item.targetSubject) {
      targetLabel = `🎯 Subject: ${esc(item.targetSubject)}`;
    } else if (item.target === "class" && item.targetClass) {
      targetLabel = `🏫 Class: ${esc(item.targetClass)}`;
    }

    const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
    }) : "Recent";

    return `
      <div class="admin-notif-card category-${esc(item.category || 'general')}" id="adminNotifCard_${item.id}">
        <div class="admin-notif-topbar">
          <div class="admin-notif-chips">
            <span class="admin-notif-pill" style="color:${cat.color};background:${cat.bg};border:1px solid ${cat.border};">
              ${cat.label}
            </span>
            <span class="admin-notif-pill" style="color:var(--text);background:var(--surface-alt);border:1px solid var(--border);">
              ${targetLabel}
            </span>
            ${item.pinned ? `<span class="admin-notif-pill" style="color:#ef4444;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);">📌 PINNED</span>` : ""}
          </div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <span style="font-size:11.5px;color:var(--text-muted);font-weight:500;">${dateStr}</span>
            <button type="button" class="btn btn-secondary btn-sm" onclick="handleDeleteAdminAnnouncement('${item.id}')" style="color:var(--status-fail);border-color:var(--status-fail);padding:4px 10px;font-size:12px;font-weight:600;min-height:30px;">
              🗑️ Delete / Retract
            </button>
          </div>
        </div>

        <h4 style="font-size:15.5px;font-weight:800;color:var(--text);margin-bottom:8px;line-height:1.35;">${esc(item.title)}</h4>
        <div class="admin-notif-message-box">
          ${esc(cleanNotifMessage(item.message))}
        </div>
        <div class="admin-notif-footer">
          <span>Author: <strong>${esc(getAuthorDisplay(item.author))}</strong></span>
          ${isForTeachers ? `
            <span style="color:var(--status-good);font-weight:700;display:inline-flex;align-items:center;gap:5px;">
              <span style="width:6px;height:6px;border-radius:50%;background:var(--status-good);box-shadow:0 0 6px var(--status-good);"></span>
              Live on Teacher Dashboard
            </span>
          ` : `
            <span style="color:var(--accent);font-weight:700;display:inline-flex;align-items:center;gap:5px;">
              <span style="width:6px;height:6px;border-radius:50%;background:var(--accent);box-shadow:0 0 6px var(--accent);"></span>
              🔒 Private Admin Alert (Hidden from Teachers)
            </span>
          `}
        </div>
      </div>
    `;
  }).join("");
}

window.handleDeleteAdminAnnouncement = async function(id) {
  if (!confirm("Are you sure you want to retract and delete this announcement? Teachers will no longer see it.")) {
    return;
  }

  // Optimistic UI update
  const card = $("adminNotifCard_" + id);
  if (card) card.remove();
  adminAnnouncementsList = adminAnnouncementsList.filter(x => x.id !== id);
  const countEl = $("adminNotifCount");
  const badgeEl = $("adminNotifsCountBadge");
  if (countEl) countEl.textContent = adminAnnouncementsList.length;
  if (badgeEl) {
    badgeEl.textContent = adminAnnouncementsList.length;
    badgeEl.style.display = adminAnnouncementsList.length > 0 ? "inline-block" : "none";
  }

  try {
    if (window.dbClient && window.dbClient.deleteTeacherAnnouncement) {
      await window.dbClient.deleteTeacherAnnouncement(id);
    }
    showToast({ type: "success", title: "Announcement Deleted", message: "Notice was removed from teacher portals." });
  } catch (err) {
    console.error("handleDeleteAdminAnnouncement error:", err);
    showToast({ type: "error", title: "Delete Error", message: "Could not remove notice from database." });
    await loadAdminAnnouncements(true);
  }
};

// ══════════════════════════════════════════════════════════
// ANTI-FOUC APP LOADER CONTROLLER
// ══════════════════════════════════════════════════════════
function hideAppLoader() {
  if (window.__appLoaderTimeout) {
    clearTimeout(window.__appLoaderTimeout);
    window.__appLoaderTimeout = null;
  }
  const loader = $("app-loader");
  if (loader) {
    loader.classList.add("app-loader-fade");
    setTimeout(() => {
      try { loader.remove(); } catch (_) { }
    }, 240);
  }
  document.documentElement.classList.remove("app-loading");
}
window.hideAppLoader = hideAppLoader;

// ══════════════════════════════════════════════════════════
// AUTO-RESTORE ADMIN SESSION (RUNS ONCE ALL SCRIPTS LOAD)
// ══════════════════════════════════════════════════════════
function autoRestoreAdminSession() {
  try {
    const isAuthed = localStorage.getItem("admin_auth_session_v1");
    if (isAuthed === "true") {
      performAdminSignIn();
    } else {
      document.documentElement.classList.remove("restoring-admin-session");
      if ($("viewLogin")) $("viewLogin").style.display = "flex";
      if ($("viewApp")) $("viewApp").style.display = "none";
    }
  } catch (err) {
    console.warn("Auto-restore admin session failed:", err);
    document.documentElement.classList.remove("restoring-admin-session");
    if ($("viewLogin")) $("viewLogin").style.display = "flex";
    if ($("viewApp")) $("viewApp").style.display = "none";
  } finally {
    // Dismiss anti-FOUC loader immediately after auth decision and first render
    hideAppLoader();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoRestoreAdminSession);
} else {
  autoRestoreAdminSession();
}


