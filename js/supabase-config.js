// ══════════════════════════════════════════════════════════════════════════════
// Supabase Client Configuration & Universal Adapter
// Connects the Academic Portal & CBT System directly to Supabase PostgreSQL
// ══════════════════════════════════════════════════════════════════════════════

const SUPABASE_CONFIG = {
  // Project ID: leaxpelbwgdlpfjhdijw (EU West Paris)
  url: "https://leaxpelbwgdlpfjhdijw.supabase.co",
  anonKey: "sb_publishable_p5VX6sRdxq5-DsHh6mC-Aw_YU70wSEw"
};

let _supabaseClient = null;

function getSupabase() {
  if (!_supabaseClient && window.supabase && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey && !SUPABASE_CONFIG.anonKey.includes("YOUR_")) {
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
    teacher_user: s.teacherUser || s.teacher_user || "",
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

// ── Universal Database API ──
const dbClient = {
  isSupabaseActive() {
    return Boolean(getSupabase());
  },

  // 1. CBT Submissions
  async getSubmissions() {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from("cbt_submissions").select("*").order("created_at", { ascending: false });
        if (!error && Array.isArray(data)) {
          return data.map(mapSubFromSupabase);
        }
        console.warn("Supabase getSubmissions fallback:", error);
      } catch (err) {
        console.warn("Supabase getSubmissions error:", err);
      }
    }
    return null; // Fallback to Firebase
  },

  async saveSubmission(docId, subObj) {
    const sb = getSupabase();
    if (sb) {
      try {
        const payload = mapSubToSupabase({ ...subObj, docId });
        const { error } = await sb.from("cbt_submissions").upsert(payload, { onConflict: "doc_id" });
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn("Supabase saveSubmission error:", err);
      }
    }
    return false;
  },

  async deleteSubmission(docId) {
    const sb = getSupabase();
    if (sb) {
      try {
        const { error } = await sb.from("cbt_submissions").delete().eq("doc_id", docId);
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn("Supabase deleteSubmission error:", err);
      }
    }
    return false;
  },

  // 2. Teachers
  async getTeachers() {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from("exam_teachers").select("*").order("name");
        if (!error && Array.isArray(data)) {
          return data.map(t => ({
            id: t.id,
            docId: t.id,
            username: t.username,
            name: t.name,
            password: t.password,
            subjects: t.subjects || [],
            classes: t.classes || [],
            arms: t.arms || []
          }));
        }
      } catch (err) {
        console.warn("Supabase getTeachers error:", err);
      }
    }
    return null;
  },

  async saveTeacher(teacher) {
    const sb = getSupabase();
    if (sb) {
      try {
        const payload = {
          id: teacher.username.trim().toLowerCase(),
          username: teacher.username.trim().toLowerCase(),
          name: teacher.name.trim(),
          password: teacher.password,
          subjects: teacher.subjects || [],
          classes: teacher.classes || [],
          arms: teacher.arms || [],
          updated_at: new Date().toISOString()
        };
        const { error } = await sb.from("exam_teachers").upsert(payload, { onConflict: "id" });
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn("Supabase saveTeacher error:", err);
      }
    }
    return false;
  },

  async deleteTeacher(teacherId) {
    const sb = getSupabase();
    if (sb) {
      try {
        const { error } = await sb.from("exam_teachers").delete().eq("id", teacherId);
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn("Supabase deleteTeacher error:", err);
      }
    }
    return false;
  },

  // 3. Exam Results (Scores)
  async getScores(term) {
    const sb = getSupabase();
    if (sb) {
      try {
        let q = sb.from("exam_results").select("*");
        if (term) q = q.eq("term", term);
        const { data, error } = await q;
        if (!error && Array.isArray(data)) {
          return data.map(r => ({
            id: r.id,
            term: r.term,
            student: r.student,
            reg: r.reg,
            subject: r.subject,
            class: r.class,
            arm: r.arm || "",
            score: r.score || "",
            pct: Number(r.pct) || 0,
            date: r.exam_date || ""
          }));
        }
      } catch (err) {
        console.warn("Supabase getScores error:", err);
      }
    }
    return null;
  },

  async saveScoresBatch(rows, term) {
    const sb = getSupabase();
    if (sb) {
      try {
        const batchSize = 250;
        for (let i = 0; i < rows.length; i += batchSize) {
          const chunk = rows.slice(i, i + batchSize).map(r => ({
            term: term || r.term,
            student: r.student,
            reg: r.reg,
            subject: r.subject,
            class: r.class,
            arm: r.arm || "",
            score: String(r.score ?? ""),
            pct: Number(r.pct) || 0,
            exam_date: r.date || ""
          }));
          const { error } = await sb.from("exam_results").insert(chunk);
          if (error) throw error;
        }
        return true;
      } catch (err) {
        console.warn("Supabase saveScoresBatch error:", err);
      }
    }
    return false;
  }
};

window.getSupabase = getSupabase;
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.dbClient = dbClient;
