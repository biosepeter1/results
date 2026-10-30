// ══════════════════════════════════════════════════════════════════════════════
// ADMINISTRATOR PORTAL JAVASCRIPT
// ══════════════════════════════════════════════════════════════════════════════

// Firebase SDK Proxies (works seamlessly on file:/// and http://)
function getFb() { return window.FirebaseSDK || {}; }
const doc = (...args) => (getFb().doc)(...args);
const getDoc = (...args) => (getFb().getDoc)(...args);
const setDoc = (...args) => (getFb().setDoc)(...args);
const updateDoc = (...args) => (getFb().updateDoc || getFb().setDoc)(...args);
const deleteDoc = (...args) => (getFb().deleteDoc)(...args);
const collection = (...args) => (getFb().collection)(...args);
const getDocs = (...args) => (getFb().getDocs)(...args);
const query = (...args) => (getFb().query)(...args);
const where = (...args) => (getFb().where)(...args);
const writeBatch = (...args) => (getFb().writeBatch)(...args);

let _db = null;
function getActiveDb() {
  if (!_db && window.FirebaseDB) _db = window.FirebaseDB;
  return _db;
}
Object.defineProperty(window, 'db', {
  get() { return getActiveDb(); },
  set(v) { _db = v; },
  configurable: true
});

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

const $ = id => document.getElementById(id);

// ── Admin Sign In ──
$("loginForm").onsubmit = (e) => {
  e.preventDefault();
  const pw = $("adminPwInput").value.trim();
  if (pw === ADMIN_PASSWORD) {
    $("viewLogin").style.display = "none";
    $("viewApp").style.display = "block";
    switchTab("scores");
    loadTeachers();
    loadLiveTerms();
  } else {
    $("loginErrorMsg").textContent = "Invalid administrator password.";
  }
};

$("adminSignOutBtn").onclick = () => {
  $("viewApp").style.display = "none";
  $("viewLogin").style.display = "flex";
  $("adminPwInput").value = "";
  $("loginErrorMsg").textContent = "";
};

// ── Navigation Tabs ──
function switchTab(target) {
  const TABS = ["scores", "teachers", "upload", "cbt"];
  const BTNS = { scores: "tabScores", teachers: "tabTeachers", upload: "tabUpload", cbt: "tabCBT" };
  const PANES = { scores: "paneScores", teachers: "paneTeachers", upload: "paneUpload", cbt: "paneCBT" };
  TABS.forEach(t => {
    $(BTNS[t]).classList.toggle("active", t === target);
    $(PANES[t]).style.display = (t === target) ? "block" : "none";
  });
  if (target === "teachers") loadTeachers(true);
  if (target === "upload") loadLiveTerms();
  if (target === "cbt") {
    loadAdminCbtActiveTerm();
    loadCBTSubmissions();
    refreshCbtSubjectsCatalog();
  }
  if (target === "scores") loadStudentScores();
}
$("tabScores").onclick = () => switchTab("scores");
$("tabTeachers").onclick = () => switchTab("teachers");
$("tabUpload").onclick = () => switchTab("upload");
$("tabCBT").onclick = () => switchTab("cbt");

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
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.teachers)) return null;
    return parsed;
  } catch (e) { return null; }
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

  // 2. If not forced and refreshed less than 15 seconds ago, save Firestore reads
  const isVeryRecent = cached && (Date.now() - cached.timestamp < 15 * 1000);
  if (!force && isVeryRecent && allTeachers.length > 0) {
    return;
  }

  // 3. Fetch latest live teachers from Firestore
  try {
    const snap = await getDocs(collection(db, "exam_teachers"));
    const fresh = [];
    snap.docs.forEach(d => {
      fresh.push({ id: d.id, ...d.data() });
    });
    fresh.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    allTeachers = fresh;
    $("teacherCountBadge").textContent = allTeachers.length;
    setCachedTeachers(allTeachers);
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
    btn.textContent = "Refreshing…";
    btn.disabled = true;
    await loadTeachers(true);
    btn.textContent = orig;
    btn.disabled = false;
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
      await deleteDoc(doc(db, "exam_teachers", origId));
      allTeachers = allTeachers.filter(x => x.id !== origId);
    }

    await setDoc(doc(db, "exam_teachers", cleanUser), docData);

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
    await loadTeachers(true);
  } catch (e) {
    $("modalErrorMsg").textContent = "Save failed: " + e.message;
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

    await deleteDoc(doc(db, "exam_teachers", docId));
    await loadTeachers(true);
  } catch (e) {
    alert("Delete failed: " + e.message);
  }
}

// ══════════════════════════════════════════════════════════
// EXAM SCORES CSV UPLOAD MODULE
// ══════════════════════════════════════════════════════════
let selectedTerm = "First Test";
document.querySelectorAll(".term-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".term-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedTerm = btn.dataset.term;
    $("customTermGroup").style.display = (selectedTerm === "__custom") ? "block" : "none";
    updateTargetLabel();
    checkUploadReady();
  };
});

function getTermName() {
  if (!selectedTerm) return null;
  if (selectedTerm === "__custom") return $("customTermInput").value.trim() || null;
  return selectedTerm;
}

function updateTargetLabel() {
  $("targetTermLabel").textContent = getTermName() || "(enter custom term name)";
}
$("customTermInput").oninput = () => { updateTargetLabel(); checkUploadReady(); };

const dropZone = $("csvDropZone");
const csvFileInput = $("csvFileInput");
dropZone.onclick = () => csvFileInput.click();
dropZone.ondragover = e => { e.preventDefault(); dropZone.classList.add("drag"); };
dropZone.ondragleave = () => dropZone.classList.remove("drag");
dropZone.ondrop = e => {
  e.preventDefault();
  dropZone.classList.remove("drag");
  handleCSVFile(e.dataTransfer.files[0]);
};
csvFileInput.onchange = () => handleCSVFile(csvFileInput.files[0]);

let parsedSubjects = {};
let totalParsedRecords = 0;

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
  $("uploadScoresBtn").disabled = !(totalParsedRecords > 0 && getTermName());
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

  $("uploadScoresBtn").disabled = true;
  setUploadError("");
  $("uploadSuccessBox").style.display = "none";
  $("uploadProgressWrap").style.display = "block";

  try {
    const subjectList = Object.keys(parsedSubjects);
    const nowIso = new Date().toISOString();

    setUploadProgress(10, `Clearing old records for "${term}"…`);
    const q = query(collection(db, "exam_results"), where("term", "==", term));
    const oldSnap = await getDocs(q);
    if (oldSnap.docs.length > 0) {
      const CHUNK = 400;
      for (let i = 0; i < oldSnap.docs.length; i += CHUNK) {
        const batch = writeBatch(db);
        oldSnap.docs.slice(i, i + CHUNK).forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
    }

    for (let i = 0; i < subjectList.length; i++) {
      const sub = subjectList[i];
      const rows = parsedSubjects[sub];
      const docId = safeId(`${term}___${sub}`);
      await setDoc(doc(db, "exam_results", docId), {
        term,
        subject: sub,
        count: rows.length,
        updatedAt: nowIso,
        rows
      });
      const pct = Math.round(15 + (i + 1) / subjectList.length * 80);
      setUploadProgress(pct, `Uploaded ${sub} (${i + 1}/${subjectList.length} subjects)`);
    }

    const metaRef = doc(db, "exam_meta", "terms");
    let existingMeta = {};
    try {
      const snap = await getDocs(collection(db, "exam_meta"));
      snap.forEach(d => { if (d.id === "terms") existingMeta = d.data().terms || {}; });
    } catch (e) { }

    existingMeta[term] = {
      count: totalParsedRecords,
      updatedAt: nowIso,
      subjects: subjectList.sort()
    };
    await setDoc(metaRef, { terms: existingMeta });

    // Bump global version document (1 doc, 1 read for all clients!)
    await setDoc(doc(db, "exam_meta", "version"), {
      lastUpdated: nowIso,
      timestamp: Date.now(),
      term: term,
      totalRecords: totalParsedRecords
    });

    setUploadProgress(100, "Update complete");
    const el = $("uploadSuccessBox");
    el.textContent = `Successfully uploaded ${totalParsedRecords.toLocaleString()} records across ${subjectList.length} subjects for "${term}". The portal is live with these scores.`;
    el.style.display = "block";

    setTimeout(() => {
      $("csvClearBtn").click();
      $("uploadProgressWrap").style.display = "none";
    }, 3000);

    await loadLiveTerms();
  } catch (e) {
    setUploadProgress(0, "");
    $("uploadProgressWrap").style.display = "none";
    setUploadError("Upload failed: " + e.message);
  }
  $("uploadScoresBtn").disabled = false;
};

function setUploadProgress(pct, text) {
  $("uploadProgressBar").style.width = pct + "%";
  $("uploadProgressText").textContent = text;
}

async function loadLiveTerms() {
  $("liveTermsList").innerHTML = `<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:13px">Loading live terms…</div>`;
  try {
    const snap = await getDocs(collection(db, "exam_results"));
    const map = {};
    snap.docs.forEach(d => {
      const data = d.data();
      if (!data.term) return;
      if (!map[data.term]) map[data.term] = { count: 0, date: data.updatedAt || "", subjects: new Set() };
      map[data.term].count += (data.count || (data.rows ? data.rows.length : 0));
      map[data.term].subjects.add(data.subject);
      if (data.updatedAt > map[data.term].date) map[data.term].date = data.updatedAt;
    });

    const metaFields = {
      "First Test": $("metaFirstTest"),
      "Mid Term Test": $("metaMidTerm"),
      "Third Term Examination": $("metaThirdTerm")
    };
    Object.entries(metaFields).forEach(([t, el]) => {
      const match = map[t] || (t === "Third Term Examination" ? map["Third Term Test"] : null);
      if (el) el.textContent = match ? `${match.count.toLocaleString()} scores` : "Not uploaded";
    });

    const termEntries = Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
    if (!termEntries.length) {
      $("liveTermsList").innerHTML = `<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:13px">No test scores uploaded yet.</div>`;
      return;
    }

    $("liveTermsList").innerHTML = termEntries.map(([tName, info]) => {
      const d = info.date ? new Date(info.date) : null;
      const dateStr = d ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently";
      return `
        <div class="live-term-item">
          <div>
            <div class="live-term-name">${esc(tName)}</div>
            <div class="live-term-meta">${info.count.toLocaleString()} scores · ${info.subjects.size} subjects · ${dateStr}</div>
          </div>
          <button type="button" class="btn btn-danger btn-sm" data-delterm="${esc(tName)}">Delete</button>
        </div>
      `;
    }).join("");

    document.querySelectorAll("[data-delterm]").forEach(btn => {
      btn.onclick = () => deleteTerm(btn.dataset.delterm);
    });
  } catch (e) {
    $("liveTermsList").innerHTML = `<div style="padding:16px;color:var(--status-fail);font-size:13px">Failed to load terms: ${esc(e.message)}</div>`;
  }
}

async function deleteTerm(term) {
  if (!confirm(`Are you sure you want to delete all scores for "${term}"?\n\nThis will remove it from all teacher portal views.`)) return;
  try {
    const q = query(collection(db, "exam_results"), where("term", "==", term));
    const snap = await getDocs(q);
    const b = writeBatch(db);
    snap.docs.forEach(d => b.delete(d.ref));
    await b.commit();
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
let activePreviewSubmission = null;

// ── School-Wide Active CBT Examination Term ──
let activeCbtExamTerm = "MID TERM EXAMINATION";

async function loadAdminCbtActiveTerm() {
  try {
    const cached = localStorage.getItem("cbt_active_term");
    if (cached) {
      activeCbtExamTerm = cached.toUpperCase();
      updateAdminCbtTermUI();
    }
    const snap = await getDoc(doc(db, "exam_meta", "cbt_active_term"));
    if (snap.exists() && snap.data().activeTerm) {
      activeCbtExamTerm = snap.data().activeTerm.toUpperCase();
      localStorage.setItem("cbt_active_term", activeCbtExamTerm);
      updateAdminCbtTermUI();
    }
  } catch (e) {
    console.warn("Could not load cbt_active_term:", e);
  }
}

async function setAdminCbtActiveTerm(newTerm) {
  if (!newTerm || !newTerm.trim()) return;
  activeCbtExamTerm = newTerm.trim().toUpperCase();
  localStorage.setItem("cbt_active_term", activeCbtExamTerm);
  updateAdminCbtTermUI();

  try {
    await setDoc(doc(db, "exam_meta", "cbt_active_term"), {
      activeTerm: activeCbtExamTerm,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    const badge = $("cbtAdminTermSavedBadge");
    if (badge) {
      badge.style.display = "inline";
      setTimeout(() => { badge.style.display = "none"; }, 3000);
    }
  } catch (err) {
    alert("Could not update active term in cloud: " + err.message);
  }
}

function updateAdminCbtTermUI() {
  if ($("cbtAdminActiveTermDisplay")) {
    $("cbtAdminActiveTermDisplay").textContent = activeCbtExamTerm;
  }
  document.querySelectorAll(".cbt-term-btn").forEach(btn => {
    const t = btn.dataset.cbtTerm;
    if (t === "__custom") {
      const isKnown = ["FIRST TERM EXAMINATION", "MID TERM EXAMINATION", "THIRD TERM EXAMINATION"].includes(activeCbtExamTerm);
      btn.classList.toggle("active", !isKnown);
      if ($("cbtAdminCustomTermWrap")) {
        $("cbtAdminCustomTermWrap").style.display = !isKnown ? "inline-flex" : "none";
      }
    } else {
      btn.classList.toggle("active", t === activeCbtExamTerm);
    }
  });
}

document.querySelectorAll(".cbt-term-btn").forEach(btn => {
  btn.onclick = () => {
    const t = btn.dataset.cbtTerm;
    if (t === "__custom") {
      $("cbtAdminCustomTermWrap").style.display = "inline-flex";
      $("cbtAdminCustomTermInput")?.focus();
    } else {
      if ($("cbtAdminCustomTermWrap")) $("cbtAdminCustomTermWrap").style.display = "none";
      setAdminCbtActiveTerm(t);
    }
  };
});
if ($("cbtAdminSaveCustomTermBtn")) {
  $("cbtAdminSaveCustomTermBtn").onclick = () => {
    const customVal = $("cbtAdminCustomTermInput")?.value.trim();
    if (customVal) {
      setAdminCbtActiveTerm(customVal);
    }
  };
}

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

// Load submissions created by teachers from Firestore or Supabase
async function loadCBTSubmissions() {
  $("cbtSubmissionsTbody").innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted)">Loading teacher submissions…</td></tr>`;
  try {
    // 1. Check Supabase First
    if (window.dbClient && window.dbClient.isSupabaseActive()) {
      try {
        const sbSubs = await window.dbClient.getSubmissions();
        if (Array.isArray(sbSubs) && sbSubs.length > 0) {
          allCbtSubmissions = sbSubs;
          allCbtSubmissions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          const badge = $("cbtSubCountBadge");
          if (badge) {
            badge.textContent = allCbtSubmissions.length;
            badge.style.display = allCbtSubmissions.length ? "inline-block" : "none";
          }
          renderCBTSubmissions();
          return;
        }
      } catch (sbErr) {
        console.warn("Supabase loadCBTSubmissions note:", sbErr);
      }
    }

    // 2. Firebase Fallback & Auto-Migration to Supabase
    const snap = await getDocs(collection(db, "cbt_submissions"));
    allCbtSubmissions = [];
    snap.docs.forEach(d => {
      const data = d.data();
      const sub = { docId: d.id, ...data };

      // Auto-detect & auto-repair subject if missing or empty
      let subName = sub.subjectName || (typeof sub.subject === "string" ? sub.subject : "");
      if (!subName || subName.trim() === "" || subName === "—" || subName === "-") {
        let detectedName = "";
        let detectedId = "";
        const sId = sub.subjectId || (sub.subject && typeof sub.subject === "object" ? sub.subject.$oid : "");
        if (sId && typeof CBT_CONFIG !== "undefined" && CBT_CONFIG.subjects) {
          for (const [k, id] of Object.entries(CBT_CONFIG.subjects)) {
            if (id === sId) { detectedName = k; detectedId = id; break; }
          }
        }
        if (!detectedName && (sub.title || sub.examTitle)) {
          const tText = (sub.title || sub.examTitle || "").toLowerCase();
          if (typeof CBT_CONFIG !== "undefined" && CBT_CONFIG.subjects) {
            for (const [k, id] of Object.entries(CBT_CONFIG.subjects)) {
              if (tText.includes(k.toLowerCase())) {
                detectedName = k;
                detectedId = id;
                break;
              }
            }
          }
        }
        if (!detectedName && typeof resolveCbtSubject === "function") {
          const res = resolveCbtSubject(sub.title || "");
          if (res && res.name && res.name !== "Social Studies") {
            detectedName = res.name;
            detectedId = res.id;
          }
        }
        if (detectedName) {
          sub.subjectName = detectedName;
          sub.subjectId = detectedId;
          try {
            setDoc(doc(db, "cbt_submissions", d.id), { subjectName: detectedName, subjectId: detectedId }, { merge: true });
          } catch(err) { /* non-fatal */ }
        }
      }

      allCbtSubmissions.push(sub);
    });
    // Sort latest first
    allCbtSubmissions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const badge = $("cbtSubCountBadge");
    if (badge) {
      badge.textContent = allCbtSubmissions.length;
      badge.style.display = allCbtSubmissions.length ? "inline-block" : "none";
    }

    renderCBTSubmissions();

    // Auto-seed Supabase from Firebase so no existing submissions are lost
    if (window.dbClient && window.dbClient.isSupabaseActive() && allCbtSubmissions.length > 0) {
      allCbtSubmissions.forEach(sub => {
        window.dbClient.saveSubmission(sub.docId, sub).catch(() => {});
      });
    }
  } catch (err) {
    $("cbtSubmissionsTbody").innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--status-fail)">Failed to load submissions: ${esc(err.message)}</td></tr>`;
  }
}

function renderCBTSubmissions() {
  if (!allCbtSubmissions.length) {
    $("cbtSubmissionsTbody").innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted)">No teacher exam submissions yet. When teachers upload from home in Notepad or Word, their exams will appear here ready to download as JSON.</td></tr>`;
    return;
  }

  $("cbtSubmissionsTbody").innerHTML = allCbtSubmissions.map(sub => {
    const qCount = Array.isArray(sub.questions) ? sub.questions.length : (sub.numberOfQuestions || 0);
    const resolvedSubName = (sub.subjectName && sub.subjectName !== "—" && sub.subjectName !== "-")
      ? sub.subjectName
      : ((typeof resolveCbtSubject === "function" ? resolveCbtSubject(sub.title || "").name : "") || "Biology");

    return `
      <tr>
        <td style="font-weight:600;color:var(--text)">${esc(sub.title || "Untitled Exam")}</td>
        <td>${esc(sub.teacherName || sub.teacherUser || "Teacher")}</td>
        <td>${esc(resolvedSubName)} <span style="color:var(--text-muted)">(${esc(sub.className || "All")})</span></td>
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
  document.querySelectorAll("[data-preview-sub]").forEach(b => {
    b.onclick = () => openCBTPreview(b.dataset.previewSub);
  });
  document.querySelectorAll("[data-dl-exams]").forEach(b => {
    b.onclick = () => downloadSubmissionExamsJson(b.dataset.dlExams);
  });
  document.querySelectorAll("[data-dl-questions]").forEach(b => {
    b.onclick = () => downloadSubmissionQuestionsJson(b.dataset.dlQuestions);
  });
  document.querySelectorAll("[data-dl-both]").forEach(b => {
    b.onclick = () => downloadSubmissionBothJson(b.dataset.dlBoth);
  });
  document.querySelectorAll("[data-del-sub]").forEach(b => {
    b.onclick = () => deleteCBTSubmission(b.dataset.delSub);
  });
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

    setDoc(doc(db, "system_config", "cbt_subjects"), {
      custom: cbtCustomSubjectsMap,
      deleted: cbtDeletedDefaults,
      updatedAt: new Date().toISOString()
    }).catch(err => {
      console.warn("Firestore sync for subjects skipped:", err.message);
    });
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
}

function deleteCbtSubject(name) {
  if (!confirm(`Are you sure you want to remove "${name}" from the CBT catalog?\n\nExams referencing this subject will fallback to standard defaults unless restored.`)) return;

  delete cbtCustomSubjectsMap[name];
  if (DEFAULT_CBT_SUBJECTS[name]) {
    if (!cbtDeletedDefaults.includes(name)) cbtDeletedDefaults.push(name);
  }

  saveCbtSubjectsStorage();
  refreshCbtSubjectsCatalog();
}

function resetCbtSubjectsToDefault() {
  if (!confirm("Reset the subjects catalog back to the original 45 standard prebuilt subjects?\n\nAny custom subjects or modified ObjectIds will be restored.")) return;
  cbtCustomSubjectsMap = {};
  cbtDeletedDefaults = [];
  saveCbtSubjectsStorage();
  refreshCbtSubjectsCatalog();
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
  const realSessionId = CBT_CONFIG.session;
  const realTermId = CBT_CONFIG.term;

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

function downloadSubmissionQuestionsJson(docId) {
  const sub = allCbtSubmissions.find(s => s.docId === docId);
  if (!sub) return;
  const { questions } = buildExportData(sub);
  const slug = getSanitizedSlug(sub.title);
  triggerJsonDownload(`${slug}.questions.json`, questions);
}

function downloadSubmissionBothJson(docId) {
  const sub = allCbtSubmissions.find(s => s.docId === docId);
  if (!sub) return;
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
    await deleteDoc(doc(db, "cbt_submissions", docId));
    await loadCBTSubmissions();
  } catch (err) {
    alert("Delete failed: " + err.message);
  }
}

function openCBTPreview(docId) {
  const sub = allCbtSubmissions.find(s => s.docId === docId);
  if (!sub) return;
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
  } catch(e) {}
  if ($("cbtScheduleSummaryPill")) {
    $("cbtScheduleSummaryPill").textContent = `📅 ${displayLaunch} · ${timeD} · ${shufD}`;
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
    try {
      await setDoc(doc(db, "cbt_submissions", activePreviewSubmission.docId), {
        questions: activePreviewSubmission.questions,
        numberOfQuestions: qCount
      }, { merge: true });
    } catch (fbErr) {
      console.warn("Firebase note:", fbErr);
    }

    if (window.dbClient && window.dbClient.isSupabaseActive()) {
      try {
        await window.dbClient.saveSubmission(activePreviewSubmission.docId, activePreviewSubmission);
      } catch (sbErr) {
        console.warn("Supabase note:", sbErr);
      }
    }

    activePreviewSubmission.numberOfQuestions = qCount;
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

// Save schedule changes from within the preview modal
if ($("cbtPreviewSaveScheduleBtn")) {
  $("cbtPreviewSaveScheduleBtn").onclick = async () => {
    if (!activePreviewSubmission) return;
    const newLaunch = $("cbtPreviewLaunchDate")?.value || "2026-10-27";
    const newGateOpen = $("cbtPreviewGateOpen")?.value || "08:00";
    const newGateClose = $("cbtPreviewGateClose")?.value || "20:00";
    const newShuffle = $("cbtPreviewShuffle") ? $("cbtPreviewShuffle").checked : true;

    activePreviewSubmission.launchDate = newLaunch;
    activePreviewSubmission.examDate = newLaunch;
    activePreviewSubmission.startTime = newGateOpen;
    activePreviewSubmission.endTime = newGateClose;
    activePreviewSubmission.gateOpen = newGateOpen;
    activePreviewSubmission.gateClose = newGateClose;
    activePreviewSubmission.shuffle = newShuffle;

    const btn = $("cbtPreviewSaveScheduleBtn");
    btn.disabled = true;
    btn.textContent = "Saving...";

    try {
      await setDoc(doc(db, "cbt_submissions", activePreviewSubmission.docId), {
        launchDate: newLaunch,
        examDate: newLaunch,
        startTime: newGateOpen,
        endTime: newGateClose,
        gateOpen: newGateOpen,
        gateClose: newGateClose,
        shuffle: newShuffle
      }, { merge: true });

      if (window.dbClient && window.dbClient.isSupabaseActive()) {
        try {
          await window.dbClient.saveSubmission(activePreviewSubmission.docId, activePreviewSubmission);
        } catch (sbErr) {
          console.warn("Supabase schedule note:", sbErr);
        }
      }

      if ($("cbtScheduleSummaryPill")) {
        const timeD = `${newGateOpen} – ${newGateClose}`;
        const shufD = newShuffle ? "🔀 Shuffled" : "Sequential";
        let displayLaunch = newLaunch;
        try {
          displayLaunch = new Date(newLaunch + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        } catch(e) {}
        $("cbtScheduleSummaryPill").textContent = `📅 ${displayLaunch} · ${timeD} · ${shufD}`;
      }
      btn.textContent = "✓ Saved!";
      setTimeout(() => {
        btn.textContent = "💾 Save Schedule";
        btn.disabled = false;
      }, 1500);
      renderCBTSubmissions();
    } catch (err) {
      alert("Could not update schedule in cloud: " + err.message);
      btn.textContent = "💾 Save Schedule";
      btn.disabled = false;
    }
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

function getCachedScores() {
  try {
    const raw = localStorage.getItem(SCORES_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.rows)) return null;
    return parsed;
  } catch (e) { return null; }
}

function setCachedScores(rows, version, timeStr) {
  try {
    const payload = JSON.stringify({
      version: version || "",
      timestamp: Date.now(),
      lastUpdatedText: timeStr || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      rows
    });
    localStorage.setItem(SCORES_CACHE_KEY, payload);
  } catch (err) {
    console.warn("localStorage quota exceeded (handled safely):", err);
  }
}

function updateAdminFreshness(timeStr, isFallback) {
  const badge = $("adminFreshnessBadge");
  const notice = $("scoresCacheNotice");
  if (badge) {
    if (isFallback) {
      badge.innerHTML = ` · <span style="color:var(--status-fail);font-weight:600">⚡ Saved device copy (Last updated: ${esc(timeStr)}) — cloud quota exceeded</span>`;
    } else {
      badge.innerHTML = ` · <span>Last updated: ${esc(timeStr)}</span>`;
    }
  }
  if (notice) {
    if (isFallback) {
      $("scoresCacheNoticeText").innerHTML = `<strong>⚡ Offline / Quota Fallback:</strong> Firebase daily read quota limit reached. Displaying latest saved records (${esc(timeStr)}). All filters, search, and CSV downloads remain 100% active.`;
      notice.style.display = "flex";
    } else {
      notice.style.display = "none";
    }
  }
}

async function loadStudentScores(force = false) {
  const cached = getCachedScores();

  if (!force && allScoreRows.length) {
    applyScoreFilters();
    return;
  }

  // 1. Check version in cloud using exactly 1 small read!
  let cloudVersion = null;
  let isCloudAvailable = false;

  if (!force) {
    try {
      const vSnap = await getDoc(doc(db, "exam_meta", "version"));
      isCloudAvailable = true;
      if (vSnap.exists()) {
        cloudVersion = vSnap.data().lastUpdated;
      }
    } catch (e) {
      console.warn("Version check notice (quota/network):", e);
      isCloudAvailable = false;
    }
  }

  // 2. If cached data matches cloudVersion, skip the full query completely! (1 read used total)
  if (!force && isCloudAvailable && cloudVersion && cached && cached.version && cached.version === cloudVersion && Array.isArray(cached.rows) && cached.rows.length > 0) {
    allScoreRows = cached.rows;
    updateAdminFreshness(cached.lastUpdatedText || new Date(cached.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), false);
    buildAdminTermTabs();
    return;
  }

  // 3. Quota Fallback: If cloud is unreachable, but we have cached records:
  if (!force && !isCloudAvailable && cached && Array.isArray(cached.rows) && cached.rows.length > 0) {
    allScoreRows = cached.rows;
    updateAdminFreshness(cached.lastUpdatedText || "Earlier session", true);
    buildAdminTermTabs();
    return;
  }

  // Display placeholder if first-time load
  if (!allScoreRows.length) {
    $("scoresTbody").innerHTML = `<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--text-muted)">Loading examination records…</td></tr>`;
  }

  // 4. Fetch full data from Firestore (on force or when version changed)
  try {
    if (force && $("scoresRefreshBtn")) {
      $("scoresRefreshBtn").textContent = "Refreshing…";
      $("scoresRefreshBtn").disabled = true;
    }
    const snap = await getDocs(collection(db, "exam_results"));
    const freshRows = [];
    snap.docs.forEach(docSnap => {
      const data = docSnap.data();
      if (Array.isArray(data.rows)) {
        data.rows.forEach(r => {
          const studentName = (r.student || r.name || "").toUpperCase();
          const regNum = r.reg || r.regNo || r.admNo || r.admissionNumber || "";
          const className = r.class || r.className || "";
          const armName = r.arm || "";
          const subjectName = data.subject || r.subject || "";
          const scoreDisplay = r.score !== undefined ? String(r.score) : "";
          const pctVal = r.pct !== undefined ? Number(r.pct) : (r.percentage !== undefined ? Number(r.percentage) : (parseFloat(scoreDisplay) || 0));
          const dateStr = r.date || r.dateTime || (data.uploadedAt ? new Date(data.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");

          freshRows.push({
            student: studentName,
            reg: regNum,
            subject: subjectName,
            class: className,
            arm: armName,
            score: scoreDisplay,
            pct: pctVal,
            term: data.term || "",
            date: dateStr
          });
        });
      }
    });

    allScoreRows = freshRows;
    const now = new Date();
    const timeStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

    // Auto-create version doc if it didn't exist yet, so future loads use 1 read
    if (!cloudVersion && freshRows.length > 0) {
      try {
        await setDoc(doc(db, "exam_meta", "version"), {
          lastUpdated: now.toISOString(),
          timestamp: Date.now()
        }, { merge: true });
        cloudVersion = now.toISOString();
      } catch (err) { /* non-fatal */ }
    }

    setCachedScores(freshRows, cloudVersion || now.toISOString(), timeStr);
    updateAdminFreshness(timeStr, false);
    buildAdminTermTabs();
  } catch (e) {
    console.warn("Firestore scores fetch error:", e);
    // Seamless fallback on quota exhaustion:
    if (cached && Array.isArray(cached.rows) && cached.rows.length > 0) {
      allScoreRows = cached.rows;
      updateAdminFreshness(cached.lastUpdatedText || "Earlier session", true);
      buildAdminTermTabs();
    } else {
      $("scoresTbody").innerHTML = `<tr><td colspan="10" style="text-align:center;padding:24px;color:var(--status-fail)">Failed to load scores: ${esc(e.message)}<br><small style="color:var(--text-muted)">The daily free cloud read quota is currently exhausted and no cached records exist on this browser. The quota resets daily between 8:00 AM – 9:00 AM WAT.</small></td></tr>`;
    }
  } finally {
    if ($("scoresRefreshBtn")) {
      $("scoresRefreshBtn").textContent = "↻ Refresh Cloud";
      $("scoresRefreshBtn").disabled = false;
    }
  }
}

function buildAdminTermTabs() {
  const terms = [...new Set(allScoreRows.map(r => r.term).filter(Boolean))].sort();
  const $tabs = $("scoresTermTabs");
  $tabs.innerHTML = "";

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
    };
    $tabs.appendChild(btn);
  });

  if (!adminCurrentTerm && terms.length) adminCurrentTerm = terms[terms.length - 1];
  updateAdminTermTabs();
  buildAdminFilters();
  applyScoreFilters();
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
    const pctVal = r.pct || 0;

    let statusClass = "status-good";
    let statusLabel = "Pass";
    if (pctVal < 50) {
      statusClass = "status-fail";
      statusLabel = "Fail";
    } else if (pctVal < 70) {
      statusClass = "status-avg";
      statusLabel = "Pass";
    }

    return `
      <tr>
        <td data-label="#" class="muted-cell">${globalIdx}</td>
        <td data-label="Student Name" class="student-cell">${esc(r.student)}</td>
        <td data-label="Reg Number" class="muted-cell">${esc(r.reg)}</td>
        <td data-label="Subject">${esc(r.subject)}</td>
        <td data-label="Class">${esc(r.class)}</td>
        <td data-label="Arm">${esc(r.arm)}</td>
        <td data-label="Score" class="numeric">${esc(r.score)}</td>
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
$("scoresRefreshBtn").onclick = () => loadStudentScores(true);
if ($("scoresCacheRetryBtn")) $("scoresCacheRetryBtn").onclick = () => loadStudentScores(true);

// Print Report
$("scoresPrintBtn").onclick = () => window.print();

// Export CSV
$("scoresExportCsvBtn").onclick = () => {
  const sorted = getSortedAdminRows();
  if (!sorted.length) { alert("No rows to export."); return; }
  const headers = ["#", "Student Name", "Reg Number", "Subject", "Class", "Arm", "Score", "Percentage", "Status", "Date & Time", "Term"];
  const rows = sorted.map((r, i) => [
    i + 1,
    `"${(r.student || "").replace(/"/g, '""')}"`,
    `"${(r.reg || "").replace(/"/g, '""')}"`,
    `"${(r.subject || "").replace(/"/g, '""')}"`,
    `"${(r.class || "").replace(/"/g, '""')}"`,
    `"${(r.arm || "").replace(/"/g, '""')}"`,
    `"${(r.score || "").replace(/"/g, '""')}"`,
    `${r.pct || 0}%`,
    (r.pct || 0) < 50 ? "Fail" : "Pass",
    `"${(r.date || "").replace(/"/g, '""')}"`,
    `"${(r.term || "").replace(/"/g, '""')}"`
  ]);
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
};

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

