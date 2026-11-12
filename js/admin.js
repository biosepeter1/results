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
  switchTab(activeTab);
  // Run teachers and live-terms in parallel — don't block the scores tab
  Promise.all([loadTeachers(), loadLiveTerms()]).catch(() => { });
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
  const TABS = ["dashboard", "scores", "teachers", "upload", "cbt"];
  const BTNS = { dashboard: "tabDashboard", scores: "tabScores", teachers: "tabTeachers", upload: "tabUpload", cbt: "tabCBT" };
  const PANES = { dashboard: "paneDashboard", scores: "paneScores", teachers: "paneTeachers", upload: "paneUpload", cbt: "paneCBT" };
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
  }
  if (target === "cbt") {
    loadAdminCbtActiveTerm();
    loadAdminCbtDefaults();
    loadCBTSubmissions();
    refreshCbtSubjectsCatalog();
    initCbtTermsManager();
  }
  if (target === "scores") { initConversionPanel(); loadStudentScores(); }
}
if ($("tabDashboard")) $("tabDashboard").onclick = () => switchTab("dashboard");
if ($("tabScores")) $("tabScores").onclick = () => switchTab("scores");
if ($("tabTeachers")) $("tabTeachers").onclick = () => switchTab("teachers");
if ($("tabUpload")) $("tabUpload").onclick = () => switchTab("upload");
if ($("tabCBT")) $("tabCBT").onclick = () => switchTab("cbt");

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
let dashActiveTabStudentView = "fail"; // "fail", "rewrite", or "honor"
let dashSubjectView = "best"; // "best" or "needs_support"
let dashAtRiskStudents = [];
let dashHonorRollStudents = [];
let dashRewriteStudents = [];
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
      populateDashboardClassAndArmFilters();
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
    if ($("dashRewriteToolbar")) $("dashRewriteToolbar").style.display = (tab === "rewrite") ? "flex" : "none";
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

  if ($("dashCardRewriteKpi")) {
    $("dashCardRewriteKpi").onclick = () => {
      setStudentViewTab("rewrite");
      toggleDashActionCenterAccordion(true);
      const card = $("dashStudentActionCenterCard");
      if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
    };
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

function syncDashboardFilterOptions() {
  if (!allScoreRows || !allScoreRows.length) return;
  const tSel = $("dashFilterTerm");
  if (!tSel) return;

  const currentTermVal = tSel.value;
  const terms = [...new Set(allScoreRows.map(r => r.term).filter(Boolean))].sort();

  tSel.innerHTML = `<option value="">All Terms (${terms.length} terms)</option>` +
    terms.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join("");

  if (currentTermVal && terms.includes(currentTermVal)) {
    tSel.value = currentTermVal;
  } else if (adminCurrentTerm && terms.includes(adminCurrentTerm)) {
    tSel.value = adminCurrentTerm;
  }

  populateDashboardClassAndArmFilters();
}

function populateDashboardClassAndArmFilters() {
  const tSel = $("dashFilterTerm");
  const cSel = $("dashFilterClass");
  const sSel = $("dashFilterSubject");
  if (!cSel) return;

  const selectedTerm = tSel ? tSel.value : "";
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

  populateDashboardArmFilter();
}

function populateDashboardArmFilter() {
  const tSel = $("dashFilterTerm");
  const cSel = $("dashFilterClass");
  const aSel = $("dashFilterArm");
  if (!aSel) return;

  const selectedTerm = tSel ? tSel.value : "";
  const selectedClass = cSel ? cSel.value : "";

  let rows = allScoreRows || [];
  if (selectedTerm) rows = rows.filter(r => r.term === selectedTerm);
  if (selectedClass) rows = rows.filter(r => (r.class || r.className) === selectedClass);

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

  syncDashboardFilterOptions();

  const rows = getDashboardFilteredRows();
  const totalAssessments = rows.length;

  const termVal = $("dashFilterTerm") ? $("dashFilterTerm").value : "";
  const classVal = $("dashFilterClass") ? $("dashFilterClass").value : "";
  const scopeSummary = `${termVal ? termVal : "All Terms"} · ${classVal ? classVal : "All Classes"} · ${totalAssessments.toLocaleString()} assessment records`;
  if ($("dashScopeSummary")) $("dashScopeSummary").textContent = scopeSummary;

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

  rows.forEach(r => {
    // Extract raw score and original max mark
    let parsedRawScore = NaN;
    let parsedOrigMax = null;

    if (r.score !== undefined && r.score !== null && r.score !== "") {
      const str = String(r.score).trim();
      const m = str.match(/^([\d.]+)\s*(?:of|\/)\s*([\d.]+)$/i);
      if (m) {
        parsedRawScore = parseFloat(m[1]);
        parsedOrigMax = parseFloat(m[2]);
      } else {
        parsedRawScore = parseFloat(str);
      }
    }

    const rowTerm = r.term || adminCurrentTerm || "";
    const convSetting = getConversionForTerm(rowTerm);
    const origMax = parsedOrigMax || (convSetting ? convSetting.originalMax : 20);
    const targetMax = convSetting ? convSetting.targetMax : origMax;

    // Converted / scaled score
    const scaledScore = (!isNaN(parsedRawScore) && convSetting)
      ? applyScoreConversion(parsedRawScore, rowTerm)
      : parsedRawScore;

    // Percentage
    const rawPct = r.pct !== undefined ? parseFloat(r.pct) : NaN;
    const convPct = (!isNaN(parsedRawScore) && convSetting)
      ? applyPctConversion(parsedRawScore, rowTerm)
      : null;

    const pctVal = convPct !== null ? convPct : (!isNaN(rawPct) ? rawPct : (!isNaN(parsedRawScore) ? Math.round((parsedRawScore / origMax) * 100 * 10) / 10 : 0));
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

    // Student Key
    const studentName = (r.student || r.name || "Unknown Student").toUpperCase().trim();
    const regNo = (r.reg || r.regNo || "").trim();
    const studentKey = `${studentName}|${regNo}`;

    if (!studentMap.has(studentKey)) {
      studentMap.set(studentKey, {
        id: "stud_" + Math.random().toString(36).substr(2, 9),
        name: studentName,
        reg: regNo,
        class: r.class || r.className || "-",
        arm: r.arm || "-",
        term: rowTerm || "-",
        scores: [],
        totalPct: 0,
        failedSubjects: []
      });
    }
    const sObj = studentMap.get(studentKey);
    sObj.scores.push({
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
    });
    sObj.totalPct += pctVal;
    if (!isPass) {
      sObj.failedSubjects.push({
        subject: r.subject || "Unknown",
        pct: pctVal,
        score: scoreVal,
        scaledScore: scoreVal,
        rawScore: parsedRawScore,
        origScoreText: r.score,
        maxMark: targetMax,
        origMax: origMax,
        term: rowTerm
      });
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

  // ── 4. Render Class Comparative Analysis ──
  const classList = Array.from(classMap.values()).sort((a, b) => a.className.localeCompare(b.className));
  const classTbody = $("dashClassBreakdownTbody");
  if (classTbody) {
    if (!classList.length) {
      classTbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:16px;color:var(--text-muted);">No class data available.</td></tr>`;
    } else {
      classTbody.innerHTML = classList.map(c => {
        const cPassRate = c.totalScores ? ((c.passes / c.totalScores) * 100).toFixed(1) : "0.0";
        const cAvg = c.totalScores ? (c.scoreSum / c.totalScores).toFixed(1) : "0.0";
        const rateNum = Number(cPassRate);
        const statusBadge = rateNum >= 80 ? `<span style="font-size:11px;padding:2px 6px;border-radius:4px;background:rgba(16,185,129,0.12);color:#10b981;font-weight:600;">Excellent</span>` :
          (rateNum >= 60 ? `<span style="font-size:11px;padding:2px 6px;border-radius:4px;background:rgba(59,130,246,0.12);color:#3b82f6;font-weight:600;">Good</span>` :
            `<span style="font-size:11px;padding:2px 6px;border-radius:4px;background:rgba(239,68,68,0.12);color:#ef4444;font-weight:600;">Needs Support</span>`);

        return `
          <tr style="border-bottom:1px solid var(--border-subtle);">
            <td style="padding:10px 8px;font-weight:600;color:var(--text);">${esc(c.className)}</td>
            <td style="padding:10px 8px;text-align:center;font-variant-numeric:tabular-nums;">${c.students.size}</td>
            <td style="padding:10px 8px;text-align:center;font-weight:600;color:${rateNum >= 70 ? '#10b981' : (rateNum >= 50 ? '#f59e0b' : '#ef4444')}">${cPassRate}%</td>
            <td style="padding:10px 8px;text-align:center;font-variant-numeric:tabular-nums;">${cAvg}%</td>
            <td style="padding:10px 8px;text-align:right;">
              <span style="color:#10b981;font-weight:600;">${c.passes}P</span> / <span style="color:#ef4444;font-weight:600;">${c.fails}F</span> ${statusBadge}
            </td>
          </tr>
        `;
      }).join("");
    }
  }

  // ── 5. Render Subject Radar ──
  dashSubjectStats = Array.from(subjectMap.values()).map(s => {
    s.passRate = s.total ? Number(((s.passes / s.total) * 100).toFixed(1)) : 0;
    s.avgScore = s.total ? Number((s.scoreSum / s.total).toFixed(1)) : 0;
    return s;
  });

  const subjectTopCount = dashSubjectStats.filter(s => s.passRate >= 75).length;
  const subjectFailCount = dashSubjectStats.filter(s => s.fails > 0).length;
  if ($("dashBadgeSubjectTopCount")) $("dashBadgeSubjectTopCount").textContent = subjectTopCount;
  if ($("dashBadgeSubjectFailCount")) $("dashBadgeSubjectFailCount").textContent = subjectFailCount;

  renderDashboardSubjectRadar();

  // ── 6. Render Student Action Center ──
  if ($("dashBadgeFailCount")) $("dashBadgeFailCount").textContent = dashAtRiskStudents.length.toLocaleString();
  if ($("dashBadgeRewriteCount")) $("dashBadgeRewriteCount").textContent = dashRewriteStudents.length.toLocaleString();
  if ($("dashBadgeHonorCount")) $("dashBadgeHonorCount").textContent = dashHonorRollStudents.length.toLocaleString();

  renderDashboardStudentActionCenter();
}

function renderDashboardSubjectRadar() {
  const container = $("dashSubjectRankingList");
  if (!container) return;

  if (!dashSubjectStats || !dashSubjectStats.length) {
    container.innerHTML = `<div style="text-align:center;padding:16px;color:var(--text-muted);">No subject data available.</div>`;
    return;
  }

  const renderSubjectRow = (s, isIntervention) => {
    const badgeColor = s.passRate >= 75 ? "#10b981" : (s.passRate >= 50 ? "#f59e0b" : "#ef4444");
    const accentBorder = isIntervention
      ? (s.fails > 0 ? "border-left:4px solid #ef4444;" : "border-left:4px solid #f59e0b;")
      : "border-left:4px solid #10b981;";

    return `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--surface-alt);border-radius:var(--radius);border:1px solid var(--border-subtle);${accentBorder}width:100%;box-sizing:border-box;gap:8px;">
        <div style="min-width:0;flex:1;overflow:hidden;">
          <div style="font-weight:600;font-size:13px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(s.subject)}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${s.total} evaluated · Avg: <strong style="color:var(--text);">${s.avgScore}%</strong>
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0;white-space:nowrap;">
          <div style="font-size:12px;font-weight:700;color:${badgeColor};">${s.passRate}% Pass</div>
          <div style="font-size:11px;color:${s.fails > 0 ? '#ef4444' : '#10b981'};font-weight:600;">
            ${s.fails > 0 ? `${s.fails} failed` : 'Zero fails'}
          </div>
        </div>
      </div>
    `;
  };

  const getInterventionList = () => {
    const failsList = dashSubjectStats.filter(s => s.fails > 0).sort((a, b) => b.fails - a.fails || a.passRate - b.passRate);
    const lowPassList = dashSubjectStats.filter(s => s.fails === 0 && s.passRate < 75).sort((a, b) => a.passRate - b.passRate || a.avgScore - b.avgScore);
    return [...failsList, ...lowPassList];
  };

  const getBestList = () => {
    return [...dashSubjectStats].sort((a, b) => b.passRate - a.passRate || b.avgScore - a.avgScore);
  };

  if (dashSubjectView === "needs_support") {
    const interventionList = getInterventionList();
    if (!interventionList.length) {
      container.innerHTML = `
        <div style="text-align:center;padding:24px 14px;background:var(--surface-alt);border-radius:var(--radius);border:1px solid rgba(16,185,129,0.3);width:100%;box-sizing:border-box;">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(16,185,129,0.12);color:#10b981;display:inline-flex;align-items:center;justify-content:center;margin-bottom:8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style="font-weight:700;color:#10b981;font-size:13px;margin-bottom:2px;">No Curriculum Interventions Required</div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:12px;">All evaluated subjects currently meet academic benchmarks with zero failing outcomes.</div>
          <button type="button" class="btn btn-secondary btn-sm" onclick="if(document.getElementById('dashSubjectTabBest')) document.getElementById('dashSubjectTabBest').click();" style="font-size:11px;display:inline-flex;align-items:center;gap:4px;">
            <span>View Top Performing Subjects</span> &rarr;
          </button>
        </div>
      `;
      return;
    }
    container.innerHTML = interventionList.slice(0, 10).map(s => renderSubjectRow(s, true)).join("");
    return;
  }

  if (dashSubjectView === "best") {
    const bestList = getBestList();
    container.innerHTML = bestList.slice(0, 10).map(s => renderSubjectRow(s, false)).join("");
    return;
  }
}

let dashStudentByIdMap = new Map();

window.toggleDashStudentDrawer = function (studentId, highlightSubject) {
  const drawer = $(`dash-drawer-${studentId}`);
  const chevron = $(`dash-chevron-${studentId}`);
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
    const card = document.getElementById(`dash-card-${studentId}-${slug}`);
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

  if ($("dashStudentModalMeta")) $("dashStudentModalMeta").textContent = `${s.class} · ${s.arm} | Reg: ${s.reg || "N/A"} | Term: ${s.term || adminCurrentTerm || "All Terms"}`;
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

function exportRewriteRosterCsv() {
  if (!dashRewriteStudents || !dashRewriteStudents.length) {
    showToast({
      type: "warning",
      title: "No Rewrite Students",
      message: "No students currently require rewrite under the selected cutoff (≤" + dashRewriteCutoffPct + "%)."
    });
    return;
  }

  const activeTerm = adminCurrentTerm || (dashRewriteStudents[0] && dashRewriteStudents[0].term) || "Current Academic Term";
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

  // Update Table Header accordingly
  if (thead) {
    if (isRewriteTab) {
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
          <th>FAILED SUBJECTS (CLICK TO REVEAL)</th>
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

  const rawList = isRewriteTab ? dashRewriteStudents : (isFailTab ? dashAtRiskStudents : dashHonorRollStudents);
  const filteredList = rawList.filter(s => {
    if (!query) return true;
    return s.name.toLowerCase().includes(query) ||
      s.reg.toLowerCase().includes(query) ||
      s.class.toLowerCase().includes(query) ||
      s.arm.toLowerCase().includes(query);
  });

  if (!filteredList.length) {
    const emptyMsg = isRewriteTab ?
      `No students currently require rewrite under the selected cutoff (≤${dashRewriteCutoffPct}%).` :
      (isFailTab ?
        "Zero failing grades recorded in the selected analytical scope." :
        "No honor roll students found matching the selected scope.");
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted);">${emptyMsg}</td></tr>`;
    return;
  }

  const rowsHtml = [];
  filteredList.slice(0, 60).forEach((s, idx) => {
    if (isRewriteTab) {
      const rewriteBadges = s.rewriteSubjects.map(rSub => {
        const maxMark = rSub.maxMark || getAdminSubjectMaxMark(rSub, s.term || adminCurrentTerm) || 20;
        const curScore = (rSub.scaledScore !== undefined && !isNaN(rSub.scaledScore))
          ? rSub.scaledScore
          : (rSub.score !== undefined ? rSub.score : rSub.pct);
        const scoreDisplay = `${curScore} of ${maxMark} (${rSub.pct}%)`;
        const hasConversion = rSub.origMax && maxMark !== rSub.origMax;
        const titleTip = hasConversion
          ? `Scaled: ${curScore}/${maxMark} (Original raw: ${rSub.rawScore}/${rSub.origMax})`
          : `Score: ${curScore}/${maxMark}`;

        return `
          <span onclick="event.stopPropagation(); window.toggleDashStudentDrawer('${s.id}', '${esc(rSub.subject)}');" 
            title="${esc(titleTip)} — Click to reveal exact marks for ${esc(rSub.subject)}" 
            style="cursor:pointer; display:inline-flex; align-items:center; gap:5px; margin:2px 4px 2px 0; padding:4px 9px; border-radius:4px; background:rgba(245,158,11,0.18); color:#d97706; font-size:11px; font-weight:700; border:1px solid rgba(245,158,11,0.45); transition:transform 0.15s, background 0.15s;">
            <span>${esc(rSub.subject)}</span>
            <strong style="background:rgba(245,158,11,0.3); padding:1px 6px; border-radius:3px; color:#b45309;">${scoreDisplay}</strong>
          </span>
        `;
      }).join("");

      // Main Student Row for Rewrite
      rowsHtml.push(`
        <tr class="dash-student-row" onclick="window.toggleDashStudentDrawer('${s.id}')" style="cursor:pointer; transition:background 0.15s; border-bottom:1px solid var(--border-subtle);" title="Click to reveal all assessment scores">
          <td style="padding:10px 8px;font-weight:700;color:var(--text-subtle);">${idx + 1}</td>
          <td style="padding:10px 8px;font-weight:600;color:var(--text);">${esc(s.name)}</td>
          <td style="padding:10px 8px;font-family:monospace;font-size:12px;color:var(--text-muted);">${esc(s.reg || "-")}</td>
          <td style="padding:10px 8px;">${esc(s.class)} · ${esc(s.arm)}</td>
          <td style="padding:10px 8px;">${rewriteBadges}</td>
          <td style="padding:10px 8px;text-align:center;font-weight:700;color:#ef4444;">${s.avgScore}%</td>
        </tr>
      `);

      // Expandable Drawer Row for Rewrite
      rowsHtml.push(`
        <tr id="dash-drawer-${s.id}" class="dash-student-drawer" style="display:none; background:var(--surface-alt);">
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
                <span style="font-size:11px; padding:3px 8px; border-radius:4px; background:rgba(245,158,11,0.15); color:#d97706; font-weight:700;">${s.rewriteSubjects.length} Paper(s) Scheduled for Rewrite (≤${dashRewriteCutoffPct}%)</span>
                <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); window.openStudentResitSlip('${s.id}')" style="font-size:11px; padding:3px 8px; font-weight:600; color:#d97706; display:inline-flex; align-items:center; gap:5px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Print Resit Slip
                </button>
              </div>
            </div>

            <div class="dash-drawer-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:8px;">
              ${s.scores.map(sc => {
        const isPass = sc.pct >= 50;
        const isRewrite = sc.pct <= dashRewriteCutoffPct;
        const cardId = `dash-card-${s.id}-${(sc.subject || '').replace(/[^a-zA-Z0-9]/g, '_')}`;
        const borderColor = isRewrite ? '#f59e0b' : (isPass ? 'var(--border)' : 'rgba(239,68,68,0.4)');
        const borderLeftColor = isRewrite ? '#f59e0b' : (isPass ? '#10b981' : '#ef4444');
        const badgeText = isRewrite ? 'REWRITE REQUIRED' : (isPass ? 'PASS' : 'FAIL');
        const badgeBg = isRewrite ? 'rgba(245,158,11,0.2)' : (isPass ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.15)');
        const badgeColor = isRewrite ? '#d97706' : (isPass ? '#10b981' : '#ef4444');

        return `
                  <div id="${cardId}" style="padding:10px 12px; background:var(--surface); border:1px solid ${borderColor}; border-left:4px solid ${borderLeftColor}; border-radius:var(--radius); transition:all 0.25s ease;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px;">
                      <span style="font-weight:600; font-size:12px; color:var(--text); line-height:1.3;">${esc(sc.subject)}</span>
                      <span style="font-size:10px; font-weight:700; padding:1px 5px; border-radius:3px; background:${badgeBg}; color:${badgeColor}; white-space:nowrap;">
                        ${badgeText}
                      </span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:6px;">
                      <span style="font-size:11px; color:var(--text-muted);">Exact Score: <strong style="color:var(--text); font-size:13px;">${sc.scaledScore !== undefined && !isNaN(sc.scaledScore) ? `${sc.scaledScore} of ${sc.maxMark || 20}` : esc(sc.score !== undefined ? sc.score : sc.pct)}</strong>${(sc.origMax && sc.maxMark && sc.maxMark !== sc.origMax && !isNaN(sc.rawScore)) ? ` <span style="font-size:10px;color:var(--text-muted);">(raw: ${sc.rawScore} of ${sc.origMax})</span>` : ""}</span>
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
        </tr>
      `);
    } else if (isFailTab) {
      const failBadges = s.failedSubjects.map(f => {
        const maxMark = f.maxMark || getAdminSubjectMaxMark(f, s.term || adminCurrentTerm) || 20;
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
          <span onclick="event.stopPropagation(); window.toggleDashStudentDrawer('${s.id}', '${esc(f.subject)}');" 
            title="${esc(titleTip)} — Click to reveal exact marks for ${esc(f.subject)}" 
            style="cursor:pointer; display:inline-flex; align-items:center; gap:5px; margin:2px 4px 2px 0; padding:3px 8px; border-radius:4px; background:${isRewrite ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.12)'}; color:${isRewrite ? '#d97706' : '#ef4444'}; font-size:11px; font-weight:600; border:1px solid ${isRewrite ? 'rgba(245,158,11,0.35)' : 'rgba(239,68,68,0.25)'}; transition:transform 0.15s, background 0.15s;">
            <span>${esc(f.subject)}</span>
            <strong style="background:${isRewrite ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.22)'}; padding:1px 5px; border-radius:3px;">${scoreDisplay}</strong>
            ${isRewrite ? `<span style="font-size:9px;background:#f59e0b;color:#fff;padding:1px 4px;border-radius:2px;font-weight:700;">REWRITE</span>` : ''}
          </span>
        `;
      }).join("");

      // Main Student Row
      rowsHtml.push(`
        <tr class="dash-student-row" onclick="window.toggleDashStudentDrawer('${s.id}')" style="cursor:pointer; transition:background 0.15s; border-bottom:1px solid var(--border-subtle);" title="Click to reveal all assessment scores">
          <td style="padding:10px 8px;font-weight:700;color:var(--text-subtle);">${idx + 1}</td>
          <td style="padding:10px 8px;font-weight:600;color:var(--text);">${esc(s.name)}</td>
          <td style="padding:10px 8px;font-family:monospace;font-size:12px;color:var(--text-muted);">${esc(s.reg || "-")}</td>
          <td style="padding:10px 8px;">${esc(s.class)} · ${esc(s.arm)}</td>
          <td style="padding:10px 8px;">${failBadges}</td>
          <td style="padding:10px 8px;text-align:center;font-weight:700;color:#ef4444;">${s.avgScore}%</td>
        </tr>
      `);

      // Expandable Drawer Row
      rowsHtml.push(`
        <tr id="dash-drawer-${s.id}" class="dash-student-drawer" style="display:none; background:var(--surface-alt);">
          <td colspan="6" style="padding:14px 18px; border-bottom:2px solid var(--border);">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid var(--border);">
              <div>
                <span style="font-weight:700; font-size:13px; color:var(--text); display:inline-flex; align-items:center; gap:6px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  Assessment Score Breakdown: ${esc(s.name)}
                </span>
                <span style="font-size:12px; color:var(--text-muted); margin-left:6px;">(${esc(s.class)} · ${esc(s.arm)} · Reg: ${esc(s.reg || "N/A")})</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:11px; padding:3px 8px; border-radius:4px; background:${s.avgScore >= 50 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'}; color:${s.avgScore >= 50 ? '#10b981' : '#ef4444'}; font-weight:700;">Overall Average: ${s.avgScore}%</span>
                <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); window.openStudentScoreModal('${s.id}')" style="font-size:11px; padding:3px 8px; display:inline-flex; align-items:center; gap:5px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  View Official Report Slip
                </button>
              </div>
            </div>

            <div class="dash-drawer-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:8px;">
              ${s.scores.map(sc => {
        const isPass = sc.pct >= 50;
        const isRewrite = sc.pct <= dashRewriteCutoffPct;
        const cardId = `dash-card-${s.id}-${(sc.subject || '').replace(/[^a-zA-Z0-9]/g, '_')}`;
        const maxMark = getAdminSubjectMaxMark(sc, s.term || adminCurrentTerm);
        const exactScoreDisplay = sc.score !== undefined ? (maxMark ? `${sc.score}/${maxMark}` : sc.score) : (maxMark ? `${sc.pct}/${maxMark}` : sc.pct);
        return `
                  <div id="${cardId}" style="padding:10px 12px; background:var(--surface); border:1px solid ${isRewrite ? '#f59e0b' : (isPass ? 'var(--border)' : 'rgba(239,68,68,0.4)')}; border-left:4px solid ${isRewrite ? '#f59e0b' : (isPass ? '#10b981' : '#ef4444')}; border-radius:var(--radius); transition:all 0.25s ease;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px;">
                      <span style="font-weight:600; font-size:12px; color:var(--text); line-height:1.3;">${esc(sc.subject)}</span>
                      <span style="font-size:10px; font-weight:700; padding:1px 5px; border-radius:3px; background:${isRewrite ? 'rgba(245,158,11,0.2)' : (isPass ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.15)')}; color:${isRewrite ? '#d97706' : (isPass ? '#10b981' : '#ef4444')}; white-space:nowrap;">
                        ${isRewrite ? 'REWRITE' : (isPass ? 'PASS' : 'FAIL')}
                      </span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:6px;">
                      <span style="font-size:11px; color:var(--text-muted);">Exact Score: <strong style="color:var(--text); font-size:13px;">${esc(exactScoreDisplay)}</strong></span>
                      <span style="font-size:13px; font-weight:700; color:${isRewrite ? '#d97706' : (isPass ? '#10b981' : '#ef4444')};">${sc.pct}%</span>
                    </div>
                    <div style="height:4px; width:100%; background:var(--surface-alt); border-radius:2px; overflow:hidden; margin-top:5px;">
                      <div style="width:${Math.min(100, Math.max(0, sc.pct))}%; height:100%; background:${isRewrite ? '#f59e0b' : (isPass ? '#10b981' : '#ef4444')};"></div>
                    </div>
                  </div>
                `;
      }).join('')}
            </div>
          </td>
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
        <tr class="dash-student-row" onclick="window.toggleDashStudentDrawer('${s.id}')" style="cursor:pointer; transition:background 0.15s; border-bottom:1px solid var(--border-subtle);" title="Click to reveal all assessment scores">
          <td style="padding:10px 8px;font-weight:700;color:var(--accent);">${rankBadge}</td>
          <td style="padding:10px 8px;font-weight:600;color:var(--text);">${esc(s.name)}</td>
          <td style="padding:10px 8px;font-family:monospace;font-size:12px;color:var(--text-muted);">${esc(s.reg || "-")}</td>
          <td style="padding:10px 8px;">${esc(s.class)} · ${esc(s.arm)}</td>
          <td style="padding:10px 8px;text-align:center;font-variant-numeric:tabular-nums;">${s.scores.length} subjects</td>
          <td style="padding:10px 8px;text-align:center;font-weight:700;color:#10b981;font-size:14px;">${s.avgScore}%</td>
        </tr>
      `);

      // Expandable Drawer Row for Honor student
      rowsHtml.push(`
        <tr id="dash-drawer-${s.id}" class="dash-student-drawer" style="display:none; background:var(--surface-alt);">
          <td colspan="6" style="padding:14px 18px; border-bottom:2px solid var(--border);">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid var(--border);">
              <div>
                <span style="font-weight:700; font-size:13px; color:var(--text); display:inline-flex; align-items:center; gap:6px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                  Academic Honors Transcript: ${esc(s.name)}
                </span>
                <span style="font-size:12px; color:var(--text-muted); margin-left:6px;">(${esc(s.class)} · ${esc(s.arm)} · Reg: ${esc(s.reg || "N/A")})</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:11px; padding:3px 8px; border-radius:4px; background:rgba(16,185,129,0.12); color:#10b981; font-weight:700;">Distinction Average: ${s.avgScore}%</span>
                <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); window.openStudentScoreModal('${s.id}')" style="font-size:11px; padding:3px 8px; display:inline-flex; align-items:center; gap:5px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  View Official Report Slip
                </button>
              </div>
            </div>

            <div class="dash-drawer-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:8px;">
              ${s.scores.map(sc => {
        return `
                  <div style="padding:10px 12px; background:var(--surface); border:1px solid var(--border); border-left:4px solid #10b981; border-radius:var(--radius);">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px;">
                      <span style="font-weight:600; font-size:12px; color:var(--text); line-height:1.3;">${esc(sc.subject)}</span>
                      <span style="font-size:10px; font-weight:700; padding:1px 5px; border-radius:3px; background:rgba(16,185,129,0.12); color:#10b981; white-space:nowrap;">
                        PASS
                      </span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:6px;">
                      <span style="font-size:11px; color:var(--text-muted);">Exact Score: <strong style="color:var(--text); font-size:13px;">${esc(sc.score !== undefined ? sc.score : sc.pct)}</strong></span>
                      <span style="font-size:13px; font-weight:700; color:#10b981;">${sc.pct}%</span>
                    </div>
                    <div style="height:4px; width:100%; background:var(--surface-alt); border-radius:2px; overflow:hidden; margin-top:5px;">
                      <div style="width:${Math.min(100, Math.max(0, sc.pct))}%; height:100%; background:#10b981;"></div>
                    </div>
                  </div>
                `;
      }).join('')}
            </div>
          </td>
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
  const keys = [
    TEACHERS_CACHE_KEY,
    "school_exam_teachers_cache",
    "school_exam_teachers_backup",
    "admin_teachers_cache"
  ];
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
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
  }
  return null;
}

function setCachedTeachers(teachers) {
  try {
    localStorage.setItem(TEACHERS_CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      teachers
    }));
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

    // If local cache contains additional teachers that were not in the default seed,
    // preserve them and automatically push them into Supabase so they are never lost!
    if (cached && Array.isArray(cached.teachers) && cached.teachers.length > fresh.length) {
      const existingIds = new Set(fresh.map(t => (t.id || t.username || "").toLowerCase().replace(/[^a-z0-9]/g, "")));
      const missingTeachers = cached.teachers.filter(t => {
        const id = (t.id || t.username || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        return id && !existingIds.has(id);
      });
      if (missingTeachers.length > 0) {
        console.log(`Auto-migrating ${missingTeachers.length} previously saved teacher(s) to Supabase...`);
        for (const mt of missingTeachers) {
          fresh.push(mt);
          try {
            await window.dbClient.saveTeacher(mt);
          } catch (err) {
            console.warn("Failed to auto-sync cached teacher:", mt.name, err);
          }
        }
      }
    }

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

async function syncUploadTermsWithCloud() {
  try {
    if (window.dbClient && typeof window.dbClient.getMeta === "function") {
      const meta = await window.dbClient.getMeta("upload_terms_list");
      if (meta && Array.isArray(meta.terms) && meta.terms.length > 0) {
        meta.terms.forEach(t => {
          if (!savedUploadTerms.includes(t)) savedUploadTerms.push(t);
        });
        localStorage.setItem("school_upload_terms_v2", JSON.stringify(savedUploadTerms));
        renderUploadTermSelector();
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

function handleCSVFile(file) {
  if (!file || !file.name.toLowerCase().endsWith(".csv")) {
    setUploadError("Please provide a valid .csv file.");
    return;
  }
  const fr = new FileReader();
  fr.onload = e => {
    const res = parseCSV(e.target.result);
    parsedSubjects = res.subjects;
    totalParsedRecords = res.total;
    if (!totalParsedRecords) {
      setUploadError("No valid student score rows found in this CSV.");
      return;
    }
    showCSVPreview(res.sampleRows);
    $("dropTitle").textContent = file.name;
    $("dropSub").textContent = `${totalParsedRecords.toLocaleString()} records across ${Object.keys(parsedSubjects).length} subjects`;
    setUploadError("");
    checkUploadReady();
  };
  fr.readAsText(file);
}

function splitLine(line) {
  const res = [];
  const re = /("([^"]*)"|([^,]*))(,|$)/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    res.push(m[2] !== undefined ? m[2] : (m[3] || ''));
    if (!m[4]) break;
  }
  return res;
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  const subjects = {};
  const sampleRows = [];
  let total = 0;

  for (let i = 1; i < lines.length; i++) {
    const c = splitLine(lines[i]);
    if (c.length < 9) continue;
    const subject = c[0].trim();
    const student = c[3].trim();
    if (!subject || !student) continue;

    const pct = Math.round(parseFloat((c[8] || '').replace(/[^0-9.]/g, '')) || 0);
    const date = c.slice(9).join(',').replace(/"/g, '').trim();

    if (!subjects[subject]) subjects[subject] = [];
    const record = {
      class: c[1].trim(),
      arm: c[2].trim().toUpperCase(),
      student,
      reg: c[4].trim(),
      score: (c[6] || '').replace(/"/g, '').trim(),
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
  $("csvPreviewHead").innerHTML = "<tr>" + ["Subject", "Class", "Arm", "Student", "Score", "%"].map(h => `<th>${h}</th>`).join("") + "</tr>";
  $("csvPreviewBody").innerHTML = rows.map(r => `
    <tr>
      <td>${esc(r.subject)}</td>
      <td>${esc(r.class)}</td>
      <td>${esc(r.arm)}</td>
      <td style="font-weight:600">${esc(r.student)}</td>
      <td>${esc(r.score)}</td>
      <td>${r.pct}%</td>
    </tr>
  `).join("");
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

    setUploadProgress(100, "Update complete");
    const el = $("uploadSuccessBox");
    if (el) {
      el.textContent = `Successfully uploaded ${totalParsedRecords.toLocaleString()} records across ${subjectList.length} subjects for "${term}" to Supabase. The portal is live with these scores.`;
      el.style.display = "block";
    }

    setTimeout(() => {
      $("csvClearBtn")?.click();
      if ($("uploadProgressWrap")) $("uploadProgressWrap").style.display = "none";
    }, 3000);

    await loadLiveTerms();
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

async function loadLiveTerms() {
  const $list = $("liveTermsList");
  if ($list) $list.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:13px">Loading live terms from Supabase...</div>';
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
  try {
    await window.dbClient.deleteTerm(term);
    delete termScoreCountsMap[term];
    await loadLiveTerms();
  } catch (e) {
    alert("Delete failed: " + e.message);
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
        meta.terms.forEach(t => {
          if (!savedCbtTerms.includes(t)) savedCbtTerms.push(t);
        });
        localStorage.setItem("cbt_term_options_v2", JSON.stringify(savedCbtTerms));
        renderCbtTermOptions();
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

function updateAdminCbtTermUI() {
  if ($("cbtAdminActiveTermDisplay")) {
    $("cbtAdminActiveTermDisplay").textContent = activeCbtExamTerm;
  }
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
let adminCbtDefaults = { duration: 30, marksPerQuestion: 1.5 };

async function loadAdminCbtDefaults() {
  try {
    const cached = localStorage.getItem("cbt_exam_defaults");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed) {
        if (parsed.duration) adminCbtDefaults.duration = Number(parsed.duration);
        if (parsed.marksPerQuestion) adminCbtDefaults.marksPerQuestion = Number(parsed.marksPerQuestion);
        updateAdminCbtDefaultsUI();
      }
    }
    if (window.dbClient && window.dbClient.getCbtExamDefaults) {
      const cloud = await window.dbClient.getCbtExamDefaults();
      if (cloud) {
        if (cloud.duration) adminCbtDefaults.duration = Number(cloud.duration);
        if (cloud.marksPerQuestion) adminCbtDefaults.marksPerQuestion = Number(cloud.marksPerQuestion);
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
}

async function saveAdminCbtDefaults() {
  const dur = parseInt($("cbtAdminGlobalDuration")?.value, 10) || 30;
  const marks = parseFloat($("cbtAdminGlobalMarks")?.value) || 1.5;
  adminCbtDefaults = { duration: dur, marksPerQuestion: marks };
  localStorage.setItem("cbt_exam_defaults", JSON.stringify(adminCbtDefaults));

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

    return `
      <tr>
        <td style="font-weight:600;color:var(--text)">${esc(sub.title || "Untitled Exam")}</td>
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
      points: parseFloat(q.points) || 1.5,
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
  $("cbtPreviewModalMeta").textContent = `Teacher: ${sub.teacherName || "Staff"} · Subject: ${resolvedSubName} · Class: ${sub.className || "All"} · Duration: ${sub.duration || 30} mins · Total: ${questions.length} questions`;
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
              <span style="font-size:12px;color:var(--text-muted)">Pts: ${q.points || 1.5}</span>
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
            <input type="number" step="0.5" id="adminEditQPoints" value="${q.points || 1.5}" class="form-input" style="width:70px;padding:3px 6px;font-size:12px">
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
        const newPts = parseFloat($("adminEditQPoints")?.value) || 1.5;

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
      points: 1.5,
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
    const newShuffle = $("cbtPreviewShuffle") ? $("cbtPreviewShuffle").checked : true;

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
        allCbtSubmissions[subIdx].shuffle = newShuffle;
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
        $("cbtScheduleSummaryPill").textContent = `📅 ${displayLaunch} · ${timeD} · ${shufD} · 🎯 ${armsPill}`;
      }
      btn.textContent = "✓ Saved!";
      setTimeout(() => {
        btn.textContent = "💾 Save Schedule & Arms";
        btn.disabled = false;
      }, 1500);
      renderCBTSubmissions();
    } catch (err) {
      alert("Could not update schedule and arms in cloud: " + err.message);
      btn.textContent = "💾 Save Schedule & Arms";
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

function getConversionConfig() {
  try {
    const raw = localStorage.getItem(SCORE_CONVERSION_KEY);
    if (!raw) return { terms: {} };
    const parsed = JSON.parse(raw);
    if (!parsed) return { terms: {} };
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
    if (hasDupes) {
      try {
        localStorage.setItem(SCORE_CONVERSION_KEY, JSON.stringify({ terms: cleanTerms }));
      } catch (_) {}
    }
    return { terms: cleanTerms };
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

  // 1. Direct exact match
  if (term && config.terms[term]) {
    const c = config.terms[term];
    if (c.originalMax && c.targetMax && c.originalMax !== c.targetMax) return c;
  }

  // 2. Normalized case-insensitive and punctuation-insensitive match
  const tNorm = normalizeAdminTermKey(term || adminCurrentTerm || (typeof activeCbtExamTerm !== "undefined" ? activeCbtExamTerm : ""));
  if (tNorm) {
    for (const [k, c] of Object.entries(config.terms)) {
      if (k === "__ALL__" || !c) continue;
      const kNorm = normalizeAdminTermKey(k);
      if (kNorm && (kNorm === tNorm || kNorm.includes(tNorm) || tNorm.includes(kNorm))) {
        if (c.originalMax && c.targetMax && c.originalMax !== c.targetMax) return c;
      }
    }
  }

  // 3. Semantic / canonical assessment matching (e.g. "Mid Term Test" matches "Mid Term Examination", "Mid Term", "midterm")
  const tCat = getCanonicalAdminTermCategory(term || adminCurrentTerm || (typeof activeCbtExamTerm !== "undefined" ? activeCbtExamTerm : ""));
  if (tCat) {
    for (const [k, c] of Object.entries(config.terms)) {
      if (k === "__ALL__" || !c) continue;
      const kCat = getCanonicalAdminTermCategory(k);
      if (kCat && (kCat === tCat || (kCat.endsWith("midterm") && tCat.endsWith("midterm")) || (kCat.endsWith("firsttest") && tCat.endsWith("firsttest")) || (kCat.endsWith("exam") && tCat.endsWith("exam")))) {
        if (c.originalMax && c.targetMax && c.originalMax !== c.targetMax) return c;
      }
    }
  }

  // 4. Fallback to active system term if row term differed
  const curNorm = normalizeAdminTermKey(adminCurrentTerm || (typeof activeCbtExamTerm !== "undefined" ? activeCbtExamTerm : ""));
  if (curNorm && curNorm !== tNorm) {
    for (const [k, c] of Object.entries(config.terms)) {
      if (k === "__ALL__" || !c) continue;
      const kNorm = normalizeAdminTermKey(k);
      if (kNorm && (kNorm === curNorm || kNorm.includes(curNorm) || curNorm.includes(kNorm))) {
        if (c.originalMax && c.targetMax && c.originalMax !== c.targetMax) return c;
      }
    }
  }

  // 5. Fallback: If only ONE term conversion is configured, apply it school-wide
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

function getScoreConversion() {
  return getConversionConfig();
}

function setScoreConversion(config) {
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
  const t = termName || (subObj && subObj.term) || adminCurrentTerm;
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

function detectOriginalMaxForTerm(rows, term) {
  if (!Array.isArray(rows) || !rows.length) return null;
  const termRows = rows.filter(r => !term || term === "__ALL__" || r.term === term);
  if (!termRows.length) return null;
  const counts = {};
  for (let i = 0; i < Math.min(termRows.length, 500); i++) {
    const r = termRows[i];
    const m = String(r.score || "").match(/(?:of|\/)\s*(\d+(?:\.\d+)?)/i);
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
  let best = null, maxCount = 0;
  for (const [val, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      best = parseFloat(val);
    }
  }
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
    buildAdminFilters();
    applyScoreFilters();

    const sel = document.getElementById("convTermSelect");
    if (sel) {
      sel.value = "__ALL__";
      refreshConversionUI();
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
      buildAdminFilters();
      applyScoreFilters();

      const sel = document.getElementById("convTermSelect");
      if (sel) {
        sel.value = term;
        refreshConversionUI();
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

function termScopedRows() {
  if (!adminCurrentTerm) return allScoreRows;
  return allScoreRows.filter(r => r.term === adminCurrentTerm);
}

function buildAdminFilters() {
  const s = termScopedRows();
  populateFilter($("scoresFilterClass"), [...new Set(s.map(r => r.class).filter(Boolean))].sort());
  updateDependentFilters();
}

function updateDependentFilters() {
  const s = termScopedRows();
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

function applyScoreFilters() {
  const sub = $("scoresFilterSubject").value;
  const cls = $("scoresFilterClass").value;
  const arm = $("scoresFilterArm").value;
  const q = ($("scoresSearchInput").value || "").trim().toLowerCase();

  activeFilteredRows = termScopedRows().filter(r => {
    if (sub && r.subject !== sub) return false;
    if (cls && r.class !== cls) return false;
    if (arm && r.arm !== arm) return false;
    if (q && !r.student.toLowerCase().includes(q) && !r.reg.toLowerCase().includes(q)) return false;
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

  const fail = rows.filter(r => (r.pct || 0) < 50).length;
  const p50 = rows.filter(r => (r.pct || 0) >= 50 && (r.pct || 0) < 60).length;
  const p60 = rows.filter(r => (r.pct || 0) >= 60 && (r.pct || 0) < 70).length;
  const p70 = rows.filter(r => (r.pct || 0) >= 70 && (r.pct || 0) < 80).length;
  const p80 = rows.filter(r => (r.pct || 0) >= 80).length;

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
  return [...activeFilteredRows].sort((a, b) => {
    let va = a[adminSortCol];
    let vb = b[adminSortCol];
    if (adminSortCol === "pct" || adminSortCol === "score") {
      va = Number(a.pct) || 0;
      vb = Number(b.pct) || 0;
    } else if (adminSortCol === "index") {
      return 0;
    } else {
      va = String(va || "").toLowerCase();
      vb = String(vb || "").toLowerCase();
    }
    if (va < vb) return adminSortAsc ? -1 : 1;
    if (va > vb) return adminSortAsc ? 1 : -1;
    return 0;
  });
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

  // Mobile Collapsible Dropdown toggle for Score Conversion (only active on mobile)
  const convToggleBtn = document.getElementById("convMobileToggleBtn");
  const convHeader = document.getElementById("convHeaderBar");
  const convPanel = document.getElementById("scoreConversionPanel");
  const convBody = document.getElementById("convCollapsibleBody");
  const convToggleText = document.getElementById("convMobileToggleText");

  function toggleMobileScoreConversion(forceOpen) {
    if (!convPanel) return;
    const isCurrentlyOpen = convPanel.classList.contains("mobile-open");
    const willOpen = (typeof forceOpen === "boolean") ? forceOpen : !isCurrentlyOpen;

    if (willOpen) {
      convPanel.classList.add("mobile-open");
      if (convBody) convBody.classList.add("open");
      if (convToggleText) convToggleText.textContent = "Close";
    } else {
      convPanel.classList.remove("mobile-open");
      if (convBody) convBody.classList.remove("open");
      if (convToggleText) convToggleText.textContent = "Configure";
    }
  }

  if (convToggleBtn) {
    convToggleBtn.onclick = (e) => {
      e.stopPropagation();
      toggleMobileScoreConversion();
    };
  }

  if (convHeader) {
    convHeader.onclick = (e) => {
      if (window.innerWidth <= 768) {
        if (e.target.closest("button") || e.target.closest("select") || e.target.closest("input")) return;
        toggleMobileScoreConversion();
      }
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
// AUTO-RESTORE ADMIN SESSION (RUNS ONCE ALL SCRIPTS LOAD)
// ══════════════════════════════════════════════════════════
function autoRestoreAdminSession() {
  try {
    const isAuthed = localStorage.getItem("admin_auth_session_v1");
    if (isAuthed === "true") {
      performAdminSignIn();
    } else {
      document.documentElement.classList.remove("restoring-admin-session");
    }
  } catch (err) {
    console.warn("Auto-restore admin session failed:", err);
    document.documentElement.classList.remove("restoring-admin-session");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoRestoreAdminSession);
} else {
  autoRestoreAdminSession();
}


