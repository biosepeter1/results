// ══════════════════════════════════════════════════════════════════════════════
// Supabase Client Configuration & Universal Database Engine
// Sole, Independent Database Engine for Honeyland Schools Results & CBT Portal
// ══════════════════════════════════════════════════════════════════════════════

const SUPABASE_CONFIG = {
  // Project ID: leaxpelbwgdlpfjhdijw (EU West Paris)
  url: "https://leaxpelbwgdlpfjhdijw.supabase.co",
  anonKey: "sb_publishable_p5VX6sRdxq5-DsHh6mC-Aw_YU70wSEw"
};

let _supabaseClient = null;

function getSupabase() {
  if (!_supabaseClient && window.supabase && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
    try {
      _supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    } catch (e) {
      console.warn("Supabase init error:", e);
    }
  }
  return _supabaseClient;
}

// ── CBT Submissions Mappers ──
function mapSubToSupabase(s) {
  const docId = s.docId || s.id || s.examId || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
  return {
    doc_id: docId,
    exam_id: s.examId || docId,
    title: s.title || "Untitled Exam",
    teacher_name: s.teacherName || s.teacher_name || "",
    teacher_user: (s.teacherUser || s.teacher_user || "").toLowerCase().replace(/[^a-z0-9]/g, ""),
    subject_name: s.subjectName || s.subject_name || "",
    subject_id: s.subjectId || s.subject_id || null,
    class_name: s.className || s.class_name || "All",
    class_id: s.classId || s.class_id || null,
    term_name: s.termName || s.term_name || "",
    term_id: s.termId || s.term_id || null,
    session_name: s.sessionName || s.session_name || "",
    session_id: s.sessionId || s.session_id || null,
    duration: parseInt(s.duration || 30, 10),
    number_of_questions: parseInt(s.numberOfQuestions || (Array.isArray(s.questions) ? s.questions.length : 0), 10),
    questions: Array.isArray(s.questions) ? s.questions : [],
    launch_date: s.launchDate || s.examDate || s.launch_date || "2026-10-27",
    start_time: s.startTime || s.gateOpen || s.start_time || "08:00",
    end_time: s.endTime || s.gateClose || s.end_time || "20:00",
    shuffle: s.shuffle !== undefined ? Boolean(s.shuffle) : true,
    status: s.status || "Ready for Admin",
    updated_at: new Date().toISOString()
  };
}

function mapSubFromSupabase(row) {
  return {
    docId: row.doc_id || row.id,
    id: row.doc_id || row.id,
    examId: row.exam_id,
    title: row.title,
    teacherName: row.teacher_name,
    teacherUser: row.teacher_user,
    subjectName: row.subject_name,
    subjectId: row.subject_id,
    className: row.class_name,
    classId: row.class_id,
    termName: row.term_name,
    termId: row.term_id,
    sessionName: row.session_name,
    sessionId: row.session_id,
    duration: row.duration,
    numberOfQuestions: row.number_of_questions,
    totalQuestions: row.number_of_questions,
    questions: Array.isArray(row.questions) ? row.questions : [],
    launchDate: row.launch_date,
    examDate: row.launch_date,
    startTime: row.start_time,
    endTime: row.end_time,
    gateOpen: row.start_time,
    gateClose: row.end_time,
    shuffle: row.shuffle,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

const DEFAULT_TEACHERS = {
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

// ── Complete Independent Database Engine ──
const dbClient = {
  isSupabaseActive() {
    return Boolean(getSupabase());
  },

  // ══════════════════════════════════════════════════════════
  // 1. CBT EXAM SUBMISSIONS (Supports Unlimited Diagram Sizes)
  // ══════════════════════════════════════════════════════════
  async getSubmissions() {
    const sb = getSupabase();
    if (!sb) return [];
    try {
      const { data, error } = await sb.from("cbt_submissions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return Array.isArray(data) ? data.map(mapSubFromSupabase) : [];
    } catch (err) {
      console.warn("Supabase getSubmissions error:", err);
      return [];
    }
  },

  async saveSubmission(docId, subObj) {
    const sb = getSupabase();
    if (!sb) return false;
    try {
      const payload = mapSubToSupabase({ ...subObj, docId });
      const { error } = await sb.from("cbt_submissions").upsert(payload, { onConflict: "doc_id" });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase saveSubmission error:", err);
      throw err;
    }
  },

  async deleteSubmission(docId) {
    const sb = getSupabase();
    if (!sb) return false;
    try {
      const { error } = await sb.from("cbt_submissions").delete().eq("doc_id", docId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase deleteSubmission error:", err);
      throw err;
    }
  },

  // ══════════════════════════════════════════════════════════
  // 2. TEACHERS & AUTHENTICATION
  // ══════════════════════════════════════════════════════════
  async getTeachers() {
    const sb = getSupabase();
    if (!sb) return [];
    try {
      const { data, error } = await sb.from("exam_teachers").select("*").order("name");
      if (error) throw error;
      return (data || []).map(t => ({
        id: t.id,
        docId: t.id,
        username: t.username || t.id,
        name: t.name,
        password: t.password,
        subjects: t.subjects || [],
        classes: t.classes || [],
        arms: t.arms || []
      }));
    } catch (err) {
      console.warn("Supabase getTeachers error:", err);
      return [];
    }
  },

  async getTeacher(username) {
    const sb = getSupabase();
    if (!sb || !username) return null;
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    try {
      const { data, error } = await sb.from("exam_teachers").select("*").eq("id", clean).maybeSingle();
      if (error || !data) return null;
      return {
        id: data.id,
        docId: data.id,
        username: data.username || data.id,
        name: data.name,
        password: data.password,
        subjects: data.subjects || [],
        classes: data.classes || [],
        arms: data.arms || []
      };
    } catch (err) {
      console.warn("Supabase getTeacher error:", err);
      return null;
    }
  },

  async saveTeacher(teacher) {
    const sb = getSupabase();
    if (!sb) return false;
    try {
      const clean = (teacher.username || teacher.id || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const payload = {
        id: clean,
        username: clean,
        name: (teacher.name || clean).trim(),
        password: teacher.password || "",
        subjects: teacher.subjects || [],
        classes: teacher.classes || [],
        arms: teacher.arms || [],
        updated_at: new Date().toISOString()
      };
      const { error } = await sb.from("exam_teachers").upsert(payload, { onConflict: "id" });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase saveTeacher error:", err);
      throw err;
    }
  },

  async deleteTeacher(teacherId) {
    const sb = getSupabase();
    if (!sb) return false;
    try {
      const clean = (teacherId || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const { error } = await sb.from("exam_teachers").delete().eq("id", clean);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase deleteTeacher error:", err);
      throw err;
    }
  },

  async seedDefaultTeachers(customMap) {
    const sb = getSupabase();
    const map = (customMap && Object.keys(customMap).length > 0) ? customMap : (typeof DEFAULT_TEACHERS !== "undefined" ? DEFAULT_TEACHERS : {});
    const rows = Object.entries(map).map(([userKey, t]) => ({
      id: userKey.toLowerCase().replace(/[^a-z0-9]/g, ""),
      username: userKey.toLowerCase().replace(/[^a-z0-9]/g, ""),
      name: t.name || userKey,
      password: t.password || "password",
      subjects: t.subjects || [],
      classes: t.classes || [],
      arms: t.arms || [],
      updated_at: new Date().toISOString()
    }));
    if (sb && rows.length > 0) {
      try {
        await sb.from("exam_teachers").upsert(rows, { onConflict: "id" });
      } catch (e) {
        console.warn("Teacher seed note:", e);
      }
    }
    return rows.map(t => ({
      id: t.id,
      docId: t.id,
      username: t.username,
      name: t.name,
      password: t.password,
      subjects: t.subjects,
      classes: t.classes,
      arms: t.arms
    }));
  },

  // ══════════════════════════════════════════════════════════
  // 3. STUDENT EXAMINATION SCORES (Unlimited Paginated Fetch)
  // ══════════════════════════════════════════════════════════
  async getScores(term) {
    const sb = getSupabase();
    if (!sb) return [];
    try {
      const pageSize = 1000;
      let all = [];
      let from = 0;
      let more = true;
      while (more) {
        let q = sb.from("exam_results").select("*").range(from, from + pageSize - 1);
        if (term) q = q.eq("term", term);
        const { data, error } = await q;
        if (error) {
          console.warn("Supabase getScores page error:", error);
          break;
        }
        if (data && data.length > 0) {
          all.push(...data);
          if (data.length < pageSize) more = false;
          else from += pageSize;
        } else {
          more = false;
        }
      }
      return all.map(r => ({
        id: r.id,
        term: r.term,
        student: r.student,
        reg: r.reg,
        subject: r.subject,
        class: r.class,
        arm: r.arm || "",
        score: String(r.score ?? ""),
        pct: Number(r.pct) || 0,
        date: r.exam_date || ""
      }));
    } catch (err) {
      console.error("Supabase getScores error:", err);
      return [];
    }
  },

  async saveScoresBatch(rows, term) {
    const sb = getSupabase();
    if (!sb || !rows || !rows.length) return false;
    try {
      // 1. Delete previous records for this term
      if (term) {
        await sb.from("exam_results").delete().eq("term", term);
      }

      // 2. Insert records in chunks of 250
      const chunkSize = 250;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize).map(r => ({
          term: term || r.term,
          student: (r.student || r.name || "").toUpperCase().trim(),
          reg: (r.reg || r.regNo || r.admNo || r.admissionNumber || "").trim(),
          subject: (r.subject || "").trim(),
          class: (r.class || r.className || "").trim(),
          arm: (r.arm || "").trim(),
          score: String(r.score ?? ""),
          pct: Number(r.pct || r.percentage || 0),
          exam_date: r.date || r.dateTime || new Date().toISOString()
        }));
        const { error } = await sb.from("exam_results").insert(chunk);
        if (error) throw error;
      }

      // 3. Bump version document in Supabase
      const nowIso = new Date().toISOString();
      await sb.from("exam_meta").upsert({
        key: "version",
        last_updated: nowIso,
        meta: { lastUpdated: nowIso, timestamp: Date.now(), term, totalRecords: rows.length }
      }, { onConflict: "key" });

      return true;
    } catch (err) {
      console.error("Supabase saveScoresBatch error:", err);
      throw err;
    }
  },

  async getLiveTerms() {
    const sb = getSupabase();
    if (!sb) return [];
    try {
      const { data, error } = await sb.from("exam_results").select("term, subject, uploaded_at");
      if (error || !data) return [];
      const map = {};
      data.forEach(r => {
        if (!r.term) return;
        if (!map[r.term]) map[r.term] = { term: r.term, count: 0, date: r.uploaded_at || "", subjects: new Set() };
        map[r.term].count++;
        if (r.subject) map[r.term].subjects.add(r.subject);
        if (r.uploaded_at && r.uploaded_at > map[r.term].date) map[r.term].date = r.uploaded_at;
      });
      return Object.values(map).map(m => ({
        term: m.term,
        count: m.count,
        date: m.date,
        subjectsCount: m.subjects.size
      }));
    } catch (err) {
      console.warn("Supabase getLiveTerms error:", err);
      return [];
    }
  },

  async deleteTerm(term) {
    const sb = getSupabase();
    if (!sb) return false;
    try {
      const { error } = await sb.from("exam_results").delete().eq("term", term);
      if (error) throw error;

      const nowIso = new Date().toISOString();
      await sb.from("exam_meta").upsert({
        key: "version",
        last_updated: nowIso,
        meta: { lastUpdated: nowIso, timestamp: Date.now() }
      }, { onConflict: "key" });

      return true;
    } catch (err) {
      console.error("Supabase deleteTerm error:", err);
      throw err;
    }
  },

  // ══════════════════════════════════════════════════════════
  // 4. METADATA & SYSTEM CONFIG (Supabase exam_meta)
  // ══════════════════════════════════════════════════════════
  async getVersion() {
    const sb = getSupabase();
    if (!sb) return null;
    try {
      const { data, error } = await sb.from("exam_meta").select("meta, last_updated").eq("key", "version").maybeSingle();
      if (error || !data) return null;
      return data.meta?.lastUpdated || data.last_updated || null;
    } catch (err) {
      return null;
    }
  },

  async setVersion(metaObj) {
    const sb = getSupabase();
    if (!sb) return false;
    try {
      const nowIso = new Date().toISOString();
      const { error } = await sb.from("exam_meta").upsert({
        key: "version",
        last_updated: nowIso,
        meta: { lastUpdated: nowIso, timestamp: Date.now(), ...(metaObj || {}) }
      }, { onConflict: "key" });
      if (error) throw error;
      return true;
    } catch (err) {
      return false;
    }
  },

  async getActiveCbtTerm() {
    const sb = getSupabase();
    if (!sb) return null;
    try {
      const { data, error } = await sb.from("exam_meta").select("meta").eq("key", "cbt_active_term").maybeSingle();
      if (error || !data || !data.meta) return null;
      return data.meta.term || null;
    } catch (err) {
      return null;
    }
  },

  async setActiveCbtTerm(term) {
    const sb = getSupabase();
    if (!sb) return false;
    try {
      const { error } = await sb.from("exam_meta").upsert({
        key: "cbt_active_term",
        last_updated: new Date().toISOString(),
        meta: { term, updatedAt: new Date().toISOString() }
      }, { onConflict: "key" });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Supabase setActiveCbtTerm error:", err);
      throw err;
    }
  },

  // ══════════════════════════════════════════════════════════
  // 5. SCORE CONVERSION CONFIGURATION
  // ══════════════════════════════════════════════════════════
  async getScoreConversionCloud() {
    const sb = getSupabase();
    if (!sb) return null;
    try {
      const { data, error } = await sb.from("exam_meta").select("meta").eq("key", "score_conversion").maybeSingle();
      if (!error && data && data.meta && Object.keys(data.meta).length > 0) {
        return data.meta;
      }
    } catch (err) {
      console.warn("Supabase getScoreConversionCloud error:", err);
    }
    return null;
  },

  async saveScoreConversion(setting) {
    const sb = getSupabase();
    if (!sb) return false;
    try {
      const payload = {
        key: "score_conversion",
        last_updated: new Date().toISOString(),
        meta: setting || { disabled: true }
      };
      const { error } = await sb.from("exam_meta").upsert(payload, { onConflict: "key" });
      if (error) throw error;

      // Bump version document in Supabase so teacher portals immediately pick up the new scaling
      const nowIso = new Date().toISOString();
      await sb.from("exam_meta").upsert({
        key: "version",
        last_updated: nowIso,
        meta: { lastUpdated: nowIso, timestamp: Date.now(), reason: "score_conversion" }
      }, { onConflict: "key" });

      return true;
    } catch (err) {
      console.error("Supabase saveScoreConversion error:", err);
      throw err;
    }
  }
};

window.getSupabase = getSupabase;
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.dbClient = dbClient;
