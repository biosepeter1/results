// ══════════════════════════════════════════════════════════════════════════════
// CBT Official Catalog & Subject/Class Mappings
// Shared by both Teacher Portal and Administrator Portal
// ══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CBT_SUBJECTS = {
  "Mathematics": "68acd2b5b81c01af321d0998",
  "Chemistry": "68c00870f7e71f38e1e4b962",
  "Physics": "68c5507544dc59aedc899ea7",
  "Computer Studies": "68c5508044dc59aedc899eab",
  "Physical Health Education": "68c550a044dc59aedc899eb6",
  "Biology": "68c822cae693c212be80d8f1",
  "Data Processing": "68d0467fc92e802af0bb8746",
  "English Language": "68d04890c92e802af0bb876d",
  "Literature in English": "68d04a5dc92e802af0bb8785",
  "Economics": "68d04b14c92e802af0bb8793",
  "French Language": "68d290c4dccbf5227b8d79e0",
  "Yoruba Language": "68d29460dccbf5227b8d79ff",
  "Further Mathematics": "68d296e6dccbf5227b8d7a1b",
  "Robotics": "68d2bd64dccbf5227b8d7ac2",
  "Civic Education": "68d2c7fddccbf5227b8d7bdf",
  "Technical Drawing": "68d3d4fe213f0bc29679c451",
  "ICT": "68d3e53b213f0bc29679c4b1",
  "Geography": "68d3e617213f0bc29679c4da",
  "Commerce": "68d3fd7d213f0bc29679c500",
  "Financial Accounting": "68d3fe38213f0bc29679c512",
  "Marketing": "68d40248213f0bc29679c524",
  "Government": "68d402ef213f0bc29679c539",
  "Islamic Religious Studies": "68d404b1213f0bc29679c57c",
  "Christian Religious Studies": "68d404d8213f0bc29679c586",
  "Agricultural Science": "68d4544a902dbca0fec8274e",
  "Cultural and Creative Art": "68d454ee902dbca0fec82766",
  "Visual Art": "68d455bf902dbca0fec82782",
  "Catering Craft": "68dba35fdf88b5964096cc94",
  "Food and Nutrition": "68e8d1539203b2ed5d085aa0",
  "English Language (Checkpoint)": "6919e73fa1f7894cb96a12c8",
  "Mathematics (Checkpoint)": "6919e952a1f7894cb96a1324",
  "Mathematic(Checkpoint)": "6919e952a1f7894cb96a1324",
  "Basic Science": "6919eaa4a1f7894cb96a1343",
  "Biology (Checkpoint)": "6919eb63a1f7894cb96a1356",
  "Chemistry (Checkpoint)": "6919ebc9a1f7894cb96a1368",
  "Basic Technology": "6919eebea1f7894cb96a13b2",
  "Business Studies": "6919f342a1f7894cb96a1401",
  "Social Studies": "6919f3f6a1f7894cb96a141d",
  "History": "6919f571a1f7894cb96a1465",
  "Home Economics": "6919f64ca1f7894cb96a1495",
  "Music": "6919f7f1a1f7894cb96a14cc",
  "Beauty and Cosmetology": "6985df8121fa2427ffc9c06d",
  "Computer Hardware and GSM Repair": "6985dfe321fa2427ffc9c072",
  "Fashion Design and Garment making": "6985e01f21fa2427ffc9c07b",
  "Horticulture and Crop Production": "6985e03c21fa2427ffc9c07f",
  "Social and Citizenship Studies": "6985e1d521fa2427ffc9c0b0"
};

const DEFAULT_CBT_TERMS = {
  "FIRST TERM FIRST TEST": "6ad23855ba97e63fcc418c98",
  "FIRST TEST": "6ad23855ba97e63fcc418c98",
  "MID TERM EXAMINATION": "6ad23855ba97e63fcc418c99",
  "MID TERM TEST": "6ad23855ba97e63fcc418c99",
  "MID TERM": "6ad23855ba97e63fcc418c99",
  "FIRST TERM MID TERM EXAMINATION": "6ad23855ba97e63fcc418c99",
  "FIRST TERM EXAMINATION": "6af2fad4eff03ebd34477ed1",
  "FIRST TERM": "6af2fad4eff03ebd34477ed1",
  "SECOND TERM FIRST TEST": "6ad23855ba97e63fcc418ca1",
  "SECOND TERM MID TERM EXAMINATION": "6ad23855ba97e63fcc418ca2",
  "SECOND TERM EXAMINATION": "6ad23855ba97e63fcc418ca3",
  "SECOND TERM": "6ad23855ba97e63fcc418ca3",
  "THIRD TERM FIRST TEST": "6ad23855ba97e63fcc418cb1",
  "THIRD TERM MID TERM EXAMINATION": "6ad23855ba97e63fcc418cb2",
  "THIRD TERM EXAMINATION": "6ad23855ba97e63fcc418cb3",
  "THIRD TERM": "6ad23855ba97e63fcc418cb3"
};

const DEFAULT_CBT_SESSIONS = {
  "2026/2027": "6aabf6c9fe918aaa23f28245",
  "2025/2026": "6aabf6c9fe918aaa23f28244"
};

const CBT_CONFIG = {
  session: "6aabf6c9fe918aaa23f28245",
  term: "6ad23855ba97e63fcc418c99",
  terms: { ...DEFAULT_CBT_TERMS },
  sessions: { ...DEFAULT_CBT_SESSIONS },
  classes: {
    "Year 7": {
      id: "68f3601b98086fbe04ba3fb0",
      arms: [
        "6915fd4de62cef47bf2847b0", "6915fd53e62cef47bf2847b7", "6915fd5ae62cef47bf2847be",
        "6915fd62e62cef47bf2847c5", "6915fd7be62cef47bf2847d1", "6915fd80e62cef47bf2847d8",
        "6915fd85e62cef47bf2847df", "6915fd8ae62cef47bf2847e6", "6915fd94e62cef47bf2847f0",
        "6915fd99e62cef47bf2847f7", "6915fde3e62cef47bf2847fe", "6915fe15e62cef47bf28480f",
        "6915fe3ae62cef47bf284819"
      ],
      armsDetail: [
        { id: "6915fd4de62cef47bf2847b0", name: "CHURCHILL" },
        { id: "6915fd53e62cef47bf2847b7", name: "DARWIN" },
        { id: "6915fd5ae62cef47bf2847be", name: "EINSTEIN" },
        { id: "6915fd62e62cef47bf2847c5", name: "FRANKLIN" },
        { id: "6915fd7be62cef47bf2847d1", name: "GRAHAM" },
        { id: "6915fd80e62cef47bf2847d8", name: "HOLMES" },
        { id: "6915fd85e62cef47bf2847df", name: "IVY" },
        { id: "6915fd8ae62cef47bf2847e6", name: "JOULES" },
        { id: "6915fd94e62cef47bf2847f0", name: "EMERALD" },
        { id: "6915fd99e62cef47bf2847f7", name: "BERYL" },
        { id: "6915fde3e62cef47bf2847fe", name: "SAPPHIRE" },
        { id: "6915fe15e62cef47bf28480f", name: "RUBY" },
        { id: "6915fe3ae62cef47bf284819", name: "DIAMOND" }
      ]
    },
    "Year 8": {
      id: "68f3602e98086fbe04ba3fb5",
      arms: [
        "6915fc0be62cef47bf284749", "6915fc4be62cef47bf284755", "6915fc52e62cef47bf28475c",
        "6915fc5ae62cef47bf284763", "6915fc68e62cef47bf28476d", "6915fc6de62cef47bf284774",
        "6915fc75e62cef47bf28477b", "6915fc7ae62cef47bf284782", "6915fc81e62cef47bf284789",
        "6915fcf7e62cef47bf284793", "6915fcfee62cef47bf28479a", "6915fd18e62cef47bf2847a4",
        "6916156de62cef47bf2848f7", "69161943e62cef47bf284bce"
      ],
      armsDetail: [
        { id: "6915fc0be62cef47bf284749", name: "EMERALD" },
        { id: "6915fc4be62cef47bf284755", name: "CHURCHILL" },
        { id: "6915fc52e62cef47bf28475c", name: "DARWIN" },
        { id: "6915fc5ae62cef47bf284763", name: "EINSTEIN" },
        { id: "6915fc68e62cef47bf28476d", name: "FRANKLIN" },
        { id: "6915fc6de62cef47bf284774", name: "GRAHAM" },
        { id: "6915fc75e62cef47bf28477b", name: "HOLMES" },
        { id: "6915fc81e62cef47bf284789", name: "JOULES" },
        { id: "6915fcf7e62cef47bf284793", name: "SAPPHIRE" },
        { id: "6915fcfee62cef47bf28479a", name: "BERYL" },
        { id: "6915fd18e62cef47bf2847a4", name: "RUBY" },
        { id: "6916156de62cef47bf2848f7", name: "DIAMOND" },
        { id: "69161943e62cef47bf284bce", name: "Ivy" }
      ]
    },
    "Year 9": {
      id: "68f3601098086fbe04ba3fab",
      arms: [
        "68f4d6d5fad606ee45d670ef", "6915fecee62cef47bf28482c", "6915fed3e62cef47bf284833",
        "6915fedde62cef47bf28483a", "6915ff3fe62cef47bf28484a", "6915ff44e62cef47bf284851",
        "6915ff4be62cef47bf284858", "6915ff50e62cef47bf28485f", "6915ff58e62cef47bf284866",
        "6915ff79e62cef47bf284870", "6915ff7fe62cef47bf284877", "6915ff87e62cef47bf28487e",
        "6915ffa9e62cef47bf284888", "6915ffcae62cef47bf284894", "69167c1ae62cef47bf2852e3"
      ],
      armsDetail: [
        { id: "6915fecee62cef47bf28482c", name: "CHURCHILL" },
        { id: "6915fed3e62cef47bf284833", name: "DARWIN" },
        { id: "6915fedde62cef47bf28483a", name: "EINSTEIN" },
        { id: "6915ff3fe62cef47bf28484a", name: "FRANKLIN" },
        { id: "6915ff44e62cef47bf284851", name: "GRAHAM" },
        { id: "6915ff4be62cef47bf284858", name: "HOLMES" },
        { id: "6915ff50e62cef47bf28485f", name: "IVY" },
        { id: "6915ff58e62cef47bf284866", name: "JOULES" },
        { id: "6915ff79e62cef47bf284870", name: "DIAMOND" },
        { id: "6915ff7fe62cef47bf284877", name: "RUBY" },
        { id: "6915ff87e62cef47bf28487e", name: "SAPPHIRE" },
        { id: "6915ffa9e62cef47bf284888", name: "BERYL" },
        { id: "69167c1ae62cef47bf2852e3", name: "EMERALD" }
      ]
    },
    "Year 10": {
      id: "68ac1a5dc5d562baa5c09995",
      arms: [
        "68ac1d6827a37002e92d7c9d", "68ac1d9227a37002e92d7ca4", "68bd6030565cc012736fefcf",
        "68bd6075565cc012736fefd6", "68c060d767923a99e3edf8ce", "68d8f11a54cc2395b9af2433",
        "68d8f9cbd60d385a0514208a", "68d8fb8dd60d385a0514214f", "68d8fb95d60d385a05142156",
        "68d8ff7681fe4790466cba6d", "68d901f281fe4790466cbb28", "68d9020481fe4790466cbb2f"
      ],
      armsDetail: [
        { id: "68d8f11a54cc2395b9af2433", name: "Churchill" },
        { id: "68bd6030565cc012736fefcf", name: "Darwin" },
        { id: "68d8f9cbd60d385a0514208a", name: "Eienstein" },
        { id: "68d8fb8dd60d385a0514214f", name: "Franklin" },
        { id: "68d8fb95d60d385a05142156", name: "Graham" },
        { id: "68d8ff7681fe4790466cba6d", name: "Holmes" },
        { id: "68d901f281fe4790466cbb28", name: "Ivy" },
        { id: "68d9020481fe4790466cbb2f", name: "Joules" },
        { id: "68bd6075565cc012736fefd6", name: "Orannge" }
      ]
    },
    "Year 11": {
      id: "68bd437084a82845dfe3f905",
      arms: [
        "68bd561631f33d7166d5abb9", "68bd5fef565cc012736fefca", "68bd621032e3078c29a674e4",
        "68cffb90bc0260d94cd63084", "68d2e028134ad8a7690a028f", "68dbd9bfdf88b5964096d2c6",
        "68dbdfdcdf88b5964096d413", "68dbe0ffdf88b5964096d4ed", "68dbe4b9df88b5964096d59c",
        "68dbe9e3df88b5964096d611"
      ],
      armsDetail: [
        { id: "68cffb90bc0260d94cd63084", name: "Churchill" },
        { id: "68bd5fef565cc012736fefca", name: "Darwin" },
        { id: "68d2e028134ad8a7690a028f", name: "Einstein" },
        { id: "68dbd9bfdf88b5964096d2c6", name: "Franklin" },
        { id: "68dbdfdcdf88b5964096d413", name: "Graham" },
        { id: "68dbe0ffdf88b5964096d4ed", name: "Holmes" },
        { id: "68dbe9e3df88b5964096d611", name: "Ivy" },
        { id: "68dbe4b9df88b5964096d59c", name: "Joules" },
        { id: "68bd621032e3078c29a674e4", name: "Orannge" }
      ]
    },
    "Year 12": {
      id: "68c0610067923a99e3edf8dc",
      arms: [
        "68c0611f67923a99e3edf8e2", "68c0613067923a99e3edf8ee", "68d2e13e134ad8a7690a02c2",
        "68dbd9cbdf88b5964096d2d0", "68dcf9ed2eb95895e2fe478c", "68dd002a2eb95895e2fe4813",
        "68dd07942eb95895e2fe489f", "68dd07992eb95895e2fe48a6", "68e6a2fcc2a7f2dff2b59e9f"
      ],
      armsDetail: [
        { id: "68c0613067923a99e3edf8ee", name: "Churchill" },
        { id: "68dbd9cbdf88b5964096d2d0", name: "Darwin" },
        { id: "68d2e13e134ad8a7690a02c2", name: "Einstein" },
        { id: "68dcf9ed2eb95895e2fe478c", name: "Franklin" },
        { id: "68dd002a2eb95895e2fe4813", name: "Graham" },
        { id: "68dd07942eb95895e2fe489f", name: "Holmes" },
        { id: "68dd07992eb95895e2fe48a6", name: "Ivy" },
        { id: "68e6a2fcc2a7f2dff2b59e9f", name: "orange" }
      ]
    }
  },
  subjects: { ...DEFAULT_CBT_SUBJECTS }
};

// Generate 24-character hexadecimal MongoDB ObjectId
function generateObjectId() {
  const ts = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const rnd = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return ts + rnd;
}

function resolveCbtClass(className) {
  if (!className) return { name: "Year 9", ...CBT_CONFIG.classes["Year 9"] };
  const s = String(className).trim().toLowerCase();
  for (const [k, v] of Object.entries(CBT_CONFIG.classes)) {
    if (k.toLowerCase() === s) return { name: k, ...v };
  }
  if (s.includes("7") || s.includes("jss 1") || s.includes("jss1")) return { name: "Year 7", ...CBT_CONFIG.classes["Year 7"] };
  if (s.includes("8") || s.includes("jss 2") || s.includes("jss2")) return { name: "Year 8", ...CBT_CONFIG.classes["Year 8"] };
  if (s.includes("9") || s.includes("jss 3") || s.includes("jss3")) return { name: "Year 9", ...CBT_CONFIG.classes["Year 9"] };
  if (s.includes("10") || s.includes("sss 1") || s.includes("ss 1")) return { name: "Year 10", ...CBT_CONFIG.classes["Year 10"] };
  if (s.includes("11") || s.includes("sss 2") || s.includes("ss 2")) return { name: "Year 11", ...CBT_CONFIG.classes["Year 11"] };
  if (s.includes("12") || s.includes("sss 3") || s.includes("ss 3")) return { name: "Year 12", ...CBT_CONFIG.classes["Year 12"] };
  return { name: "Year 9", ...CBT_CONFIG.classes["Year 9"] };
}

function resolveCbtSubject(subjectName) {
  if (!subjectName) return { name: "Social Studies", id: (CBT_CONFIG.subjects["Social Studies"] || "6919f3f6a1f7894cb96a141d") };
  const s = String(subjectName).trim().toLowerCase();

  // 1. Exact match against all catalog subjects
  for (const [k, id] of Object.entries(CBT_CONFIG.subjects)) {
    if (k.toLowerCase() === s) return { name: k, id };
  }

  // 2. Partial substring match against catalog subjects
  for (const [k, id] of Object.entries(CBT_CONFIG.subjects)) {
    const kLow = k.toLowerCase();
    if (s.includes(kLow) || kLow.includes(s)) return { name: k, id };
  }

  // 3. Known aliases
  if (s.includes("comput")) return { name: "Computer Studies", id: CBT_CONFIG.subjects["Computer Studies"] || "68c5508044dc59aedc899eab" };
  if (s.includes("social")) return { name: "Social Studies", id: CBT_CONFIG.subjects["Social Studies"] || "6919f3f6a1f7894cb96a141d" };
  if (s.includes("french")) return { name: "French Language", id: CBT_CONFIG.subjects["French Language"] || "68d290c4dccbf5227b8d79e0" };
  if (s.includes("yoruba")) return { name: "Yoruba Language", id: CBT_CONFIG.subjects["Yoruba Language"] || "68d29460dccbf5227b8d79ff" };
  if (s.includes("cca") || s.includes("creative") || s.includes("cultural")) return { name: "Cultural and Creative Art", id: CBT_CONFIG.subjects["Cultural and Creative Art"] || "68d454ee902dbca0fec82766" };
  if (s.includes("math")) return { name: "Mathematics", id: CBT_CONFIG.subjects["Mathematics"] || "68acd2b5b81c01af321d0998" };
  if (s.includes("basic tech") || s.includes("technology")) return { name: "Basic Technology", id: CBT_CONFIG.subjects["Basic Technology"] || "6919eebea1f7894cb96a13b2" };
  if (s.includes("basic sci") || s.includes("intermediate sci") || s.includes("science")) return { name: "Basic Science", id: CBT_CONFIG.subjects["Basic Science"] || "6919eaa4a1f7894cb96a1343" };
  if (s.includes("business")) return { name: "Business Studies", id: CBT_CONFIG.subjects["Business Studies"] || "6919f342a1f7894cb96a1401" };
  if (s.includes("english")) return { name: "English Language", id: CBT_CONFIG.subjects["English Language"] || "68d04890c92e802af0bb876d" };
  if (s.includes("agric")) return { name: "Agricultural Science", id: CBT_CONFIG.subjects["Agricultural Science"] || "68d4544a902dbca0fec8274e" };
  if (s.includes("phe") || s.includes("physical")) return { name: "Physical Health Education", id: CBT_CONFIG.subjects["Physical Health Education"] || "68c550a044dc59aedc899eb6" };
  if (s.includes("civic")) return { name: "Civic Education", id: CBT_CONFIG.subjects["Civic Education"] || "68d2c7fddccbf5227b8d7bdf" };
  if (s.includes("crs") || s.includes("christian")) return { name: "Christian Religious Studies", id: CBT_CONFIG.subjects["Christian Religious Studies"] || "68d404d8213f0bc29679c586" };
  if (s.includes("irs") || s.includes("islamic")) return { name: "Islamic Religious Studies", id: CBT_CONFIG.subjects["Islamic Religious Studies"] || "68d404b1213f0bc29679c57c" };
  if (s.includes("history")) return { name: "History", id: CBT_CONFIG.subjects["History"] || "6919f571a1f7894cb96a1465" };
  if (s.includes("home econ")) return { name: "Home Economics", id: CBT_CONFIG.subjects["Home Economics"] || "6919f64ca1f7894cb96a1495" };

  const firstKey = Object.keys(CBT_CONFIG.subjects)[0] || "Social Studies";
  return { name: subjectName, id: CBT_CONFIG.subjects[firstKey] || "6919f3f6a1f7894cb96a141d" };
}

function refreshTeacherCbtSubjects() {
  const merged = { ...DEFAULT_CBT_SUBJECTS };
  try {
    const raw = localStorage.getItem("school_cbt_custom_subjects_v2");
    if (raw) {
      const p = JSON.parse(raw);
      if (p && typeof p === "object") {
        if (Array.isArray(p.deleted)) {
          p.deleted.forEach(delKey => delete merged[delKey]);
        }
        if (p.custom) {
          Object.entries(p.custom).forEach(([k, id]) => { merged[k] = id; });
        }
      }
    }
  } catch (e) { }
  CBT_CONFIG.subjects = merged;
}
refreshTeacherCbtSubjects();

function refreshCbtTermsAndSessions() {
  const mergedTerms = { ...DEFAULT_CBT_TERMS };
  const mergedSessions = { ...DEFAULT_CBT_SESSIONS };
  try {
    const rawT = localStorage.getItem("school_cbt_custom_terms_v1");
    if (rawT) {
      const p = JSON.parse(rawT);
      if (p && typeof p === "object") Object.assign(mergedTerms, p);
    }
    const rawS = localStorage.getItem("school_cbt_custom_sessions_v1");
    if (rawS) {
      const p = JSON.parse(rawS);
      if (p && typeof p === "object") Object.assign(mergedSessions, p);
    }
  } catch (e) { }
  CBT_CONFIG.terms = mergedTerms;
  CBT_CONFIG.sessions = mergedSessions;
}
refreshCbtTermsAndSessions();

function resolveCbtTermId(termName) {
  refreshCbtTermsAndSessions();
  if (!termName) return CBT_CONFIG.terms["MID TERM EXAMINATION"] || "6ad23855ba97e63fcc418c99";
  const s = String(termName).trim().toUpperCase();

  if (CBT_CONFIG.terms[s]) return CBT_CONFIG.terms[s];

  if (s.includes("SECOND TERM") || s.includes("2ND TERM")) {
    if (s.includes("FIRST TEST") || s.includes("1ST TEST")) return CBT_CONFIG.terms["SECOND TERM FIRST TEST"] || "6ad23855ba97e63fcc418ca1";
    if (s.includes("MID TERM") || s.includes("MID-TERM")) return CBT_CONFIG.terms["SECOND TERM MID TERM EXAMINATION"] || "6ad23855ba97e63fcc418ca2";
    return CBT_CONFIG.terms["SECOND TERM EXAMINATION"] || CBT_CONFIG.terms["SECOND TERM"] || "6ad23855ba97e63fcc418ca3";
  }

  if (s.includes("THIRD TERM") || s.includes("3RD TERM")) {
    if (s.includes("FIRST TEST") || s.includes("1ST TEST")) return CBT_CONFIG.terms["THIRD TERM FIRST TEST"] || "6ad23855ba97e63fcc418cb1";
    if (s.includes("MID TERM") || s.includes("MID-TERM")) return CBT_CONFIG.terms["THIRD TERM MID TERM EXAMINATION"] || "6ad23855ba97e63fcc418cb2";
    return CBT_CONFIG.terms["THIRD TERM EXAMINATION"] || CBT_CONFIG.terms["THIRD TERM"] || "6ad23855ba97e63fcc418cb3";
  }

  if (s.includes("FIRST TEST") || s.includes("1ST TEST")) {
    return CBT_CONFIG.terms["FIRST TERM FIRST TEST"] || CBT_CONFIG.terms["FIRST TEST"] || "6ad23855ba97e63fcc418c98";
  }
  if (s.includes("MID TERM") || s.includes("MID-TERM") || s.includes("MIDTERM")) {
    return CBT_CONFIG.terms["MID TERM EXAMINATION"] || CBT_CONFIG.terms["MID TERM"] || "6ad23855ba97e63fcc418c99";
  }
  if (s.includes("FIRST TERM") || s.includes("1ST TERM") || s.includes("EXAMINATION") || s.includes("EXAM")) {
    return CBT_CONFIG.terms["FIRST TERM EXAMINATION"] || CBT_CONFIG.terms["FIRST TERM"] || "6af2fad4eff03ebd34477ed1";
  }

  return CBT_CONFIG.terms["MID TERM EXAMINATION"] || "6ad23855ba97e63fcc418c99";
}

function resolveCbtSessionId(sessionName) {
  refreshCbtTermsAndSessions();
  if (!sessionName) return CBT_CONFIG.session || "6aabf6c9fe918aaa23f28245";
  const s = String(sessionName).trim();
  if (CBT_CONFIG.sessions && CBT_CONFIG.sessions[s]) return CBT_CONFIG.sessions[s];
  return CBT_CONFIG.session || "6aabf6c9fe918aaa23f28245";
}

// Official class curriculum mapping and subject alias normalization for exam audits.
const SUBJECT_CANONICAL_ALIASES = {
  "cultural and creative arts": "cultural and creative art",
  "cca": "cultural and creative art",
  "digital technology": "digital technologies",
  "digital tech": "digital technologies",
  "physical and health education": "physical health education",
  "phe": "physical health education",
  "nigerian history": "history",
  "yoruba": "yoruba language",
  "yoruba studies": "yoruba language",
  "french": "french language",
  "intermediate science": "basic science",
  "crs": "christian religious studies",
  "irs": "islamic religious studies",
  "agric science": "agricultural science",
  "agric": "agricultural science",
  "home econ": "home economics",
  "english": "english language",
  "maths": "mathematics",
  "mathematic": "mathematics",
  "fashion design": "fashion design and garment making",
  "horticulture": "horticulture and crop production",
  "social citizenship": "social and citizenship studies"
};

const _subjectCanonCache = new Map();
function canonicalSubjectKey(subjectName) {
  const raw = String(subjectName || "");
  if (_subjectCanonCache.has(raw)) return _subjectCanonCache.get(raw);
  const clean = raw.trim().toLowerCase().replace(/\s+/g, " ");
  const res = clean ? (SUBJECT_CANONICAL_ALIASES[clean] || clean) : "";
  if (_subjectCanonCache.size < 500) _subjectCanonCache.set(raw, res);
  return res;
}

const _classLevelCanonCache = new Map();
function normalizeClassLevelKey(className) {
  const raw = String(className || "");
  if (_classLevelCanonCache.has(raw)) return _classLevelCanonCache.get(raw);
  const s = raw.trim().toUpperCase().replace(/\s+/g, " ");
  let res = s;
  if (!s) res = "";
  else if (s === "JSS 1" || s === "JSS1" || s === "YEAR7" || s.startsWith("YEAR 7 ")) res = "YEAR 7";
  else if (s === "JSS 2" || s === "JSS2" || s === "YEAR8" || s.startsWith("YEAR 8 ")) res = "YEAR 8";
  else if (s === "JSS 3" || s === "JSS3" || s === "YEAR9" || s.startsWith("YEAR 9 ")) res = "YEAR 9";
  else if (s === "SSS 1" || s === "SS 1" || s === "SSS1" || s === "YEAR10") res = "YEAR 10";
  else if (s === "SSS 2" || s === "SS 2" || s === "SSS2" || s === "YEAR11") res = "YEAR 11";
  else if (s === "SSS 3" || s === "SS 3" || s === "SSS3" || s === "YEAR12") res = "YEAR 12";
  if (_classLevelCanonCache.size < 200) _classLevelCanonCache.set(raw, res);
  return res;
}

const JUNIOR_EARLY_CURRICULUM = {
  core: [
    "Basic Science",
    "Business Studies",
    "Cultural and Creative Art",
    "Digital Technologies",
    "English Language",
    "French Language",
    "History",
    "Mathematics",
    "Physical Health Education",
    "Social and Citizenship Studies",
    "Yoruba Language"
  ],
  choiceGroups: [
    {
      label: "Religious Studies (CRS / IRS)",
      options: ["Christian Religious Studies", "Islamic Religious Studies"]
    },
    {
      label: "Trade Subject (Fashion Design / Horticulture)",
      options: [
        "Fashion Design and Garment making",
        "Horticulture and Crop Production"
      ]
    }
  ]
};

const SCHOOL_CLASS_CURRICULUM = {
  "YEAR 7": JUNIOR_EARLY_CURRICULUM,
  "YEAR 8": JUNIOR_EARLY_CURRICULUM,
  "YEAR 9": {
    core: [
      "Agricultural Science",
      "Basic Science",
      "Basic Technology",
      "Business Studies",
      "Civic Education",
      "Computer Studies",
      "Cultural and Creative Art",
      "English Language",
      "French Language",
      "History",
      "Home Economics",
      "Mathematics",
      "Physical Health Education",
      "Social Studies",
      "Yoruba Language"
    ],
    choiceGroups: [
      {
        label: "Religious Studies (CRS / IRS)",
        options: ["Christian Religious Studies", "Islamic Religious Studies"]
      }
    ]
  }
};

// Students who have left / withdrawn from the school (excluded from active rosters and missing-exam audits)
const WITHDRAWN_STUDENTS = [
  { name: "ADEBAYO MARYAM OLUWASEMILORE", reg: "STDS9-2024-178" },
  { name: "ADIKA MICHEAL OLUWAFERANMI", reg: "STDS9-2024-134" },
  { name: "AKUETIEMHE HARRISON GANIYU", reg: "STDS9-2024-061" },
  { name: "BABATUNDE OLUWATENIOLA VIRTUE", reg: "STDS9-2024-084" },
  { name: "EHPRAIM IFEOMA MICHELLE", reg: "STDS9-2024-162" },
  { name: "EMMANUEL DIVINE PRINCE", reg: "STDS9-2024-183" },
  { name: "IWU JEWEL KAMSIRIOCHI", reg: "STDS9-2024-117" },
  { name: "KIKI GABRIEL KIKI", reg: "STDS9-2024-044" },
  { name: "MUOTOH MELVIN CHIDUBEM", reg: "STDS9-2024-018" },
  { name: "OGUDE DAVID UDOKA", reg: "STDS9-2024-119" },
  { name: "OLALERE OLAOLUWA ADORATION", reg: "STDS9-2024-125" },
  { name: "OLUBUNMI OLUWAFERANMI RICHMAN", reg: "STDS9-2024-075" },
  { name: "OSHIN OLUWADEMILADE JEFFREY", reg: "STDS9-2024-078" },
  { name: "SALAKO OYINDAMOLA HALEEMAT", reg: "STDS9-2024-026" },
  { name: "SILAS CHIDALU TONY", reg: "STDS9-2024-128" },
  { name: "SOYINKA ADERINSOLA IFEOLUWA", reg: "STDS9-2024-201" },
  { name: "HASSAN OLAWAMIWA AWWAL", reg: "STDS9-2024-066" },
  { name: "ADEBAYO OLUWANIFEMI FIRDAOUS", reg: "STDS8-2025-004" },
  { name: "ADEDIRAN CHUKWUZUBE DAVID", reg: "STDS8-2025-064" },
  { name: "AWODI JOY AWODI", reg: "STDS8-2025-100" },
  { name: "DOMINIC CHIEMENA CLINTON", reg: "STDS8-2025-208" },
  { name: "ENATUFE ENATUFE ENATUFE", reg: "STDS7-2026-162" },
  { name: "EZEH SUCCESS CHISIMDIRI", reg: "STDS8-2025-078" },
  { name: "MOHAMMED AISHA JODA", reg: "STDS8-2025-050" },
  { name: "POPOOLA OLUWAFEMIFOLA ILYAS", reg: "STDS8-2025-057" },
  { name: "SHOBANDA AKANNI MUBARAK", reg: "STDS8-2025-060" },
  { name: "SYLVESTER OSAGIODUWA WISDOM", reg: "STDS8-2025-168" }
];

const _WITHDRAWN_REG_SET = new Set(
  WITHDRAWN_STUDENTS.map(s => String(s.reg || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "")).filter(Boolean)
);
const _WITHDRAWN_NAME_SET = new Set(
  WITHDRAWN_STUDENTS.map(s => String(s.name || "").trim().toUpperCase().replace(/\s+/g, " ")).filter(Boolean)
);

function isWithdrawnStudent(reg, fullName) {
  const rCompact = String(reg || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (rCompact && _WITHDRAWN_REG_SET.has(rCompact)) return true;
  const nNorm = String(fullName || "").trim().toUpperCase().replace(/\s+/g, " ");
  return Boolean(nNorm && _WITHDRAWN_NAME_SET.has(nNorm));
}

// ── Shared Stacked Math & Rich HTML Renderer (Teacher Portal, Admin Portal, & CBT Export) ──
const CBT_SUP_UNICODE_TO_ASCII = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
  "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
  "⁺": "+", "⁻": "-", "⁼": "=", "⁽": "(", "⁾": ")",
  "ⁿ": "n", "ⁱ": "i", "ᵃ": "a", "ᵇ": "b", "ᶜ": "c", "ᵈ": "d",
  "ᵉ": "e", "ᶠ": "f", "ᵍ": "g", "ʰ": "h", "ʲ": "j", "ᵏ": "k",
  "ˡ": "l", "ᵐ": "m", "ᵒ": "o", "ᵖ": "p", "ʳ": "r", "ˢ": "s",
  "ᵗ": "t", "ᵘ": "u", "ᵛ": "v", "ʷ": "w", "ˣ": "x", "ʸ": "y", "ᶻ": "z"
};

const CBT_SUB_UNICODE_TO_ASCII = {
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4",
  "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
  "₊": "+", "₋": "-", "₌": "=", "₍": "(", "₎": ")",
  "ₐ": "a", "ₑ": "e", "ₕ": "h", "ᵢ": "i", "ⱼ": "j", "ₖ": "k",
  "ₗ": "l", "ₘ": "m", "ₙ": "n", "ₒ": "o", "ₚ": "p", "ᵣ": "r",
  "ₛ": "s", "ₜ": "t", "ᵤ": "u", "ᵥ": "v", "ₓ": "x"
};

function escapeCbtHtml(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readBalancedMathGroup(str, openIdx, openCh = "{", closeCh = "}") {
  if (!str || str[openIdx] !== openCh) return null;
  let depth = 0;
  for (let i = openIdx; i < str.length; i++) {
    if (str[i] === openCh) depth++;
    else if (str[i] === closeCh) {
      depth--;
      if (depth === 0) {
        return { content: str.slice(openIdx + 1, i), nextIdx: i + 1 };
      }
    }
  }
  return null;
}

function stripOuterMathParens(s) {
  const t = String(s || "").trim();
  if (t.length >= 2 && t[0] === "(" && t[t.length - 1] === ")") {
    let d = 0;
    for (let i = 0; i < t.length; i++) {
      if (t[i] === "(") d++;
      else if (t[i] === ")") {
        d--;
        if (d === 0) {
          return i === t.length - 1 ? t.slice(1, -1).trim() : t;
        }
      }
    }
  }
  return t;
}

function isSafeBareMathFraction(num, den, fullStr, startIdx, endIdx) {
  if (!num || !den) return false;
  // Never break URLs (http://), decimal numbers (1.5/2 or 1/2.5), or multi-part dates (26/11/2026)
  const before = startIdx > 0 ? fullStr[startIdx - 1] : "";
  const after = endIdx < fullStr.length ? fullStr[endIdx] : "";
  if (before === "/" || before === ":" || after === "/") return false;
  if (before === "." && /\d/.test(startIdx > 1 ? fullStr[startIdx - 2] : "")) return false;
  if (after === "." && /\d/.test(fullStr[endIdx + 1] || "")) return false;
  if (/^\d{1,4}$/.test(num) && /^\d{1,4}$/.test(den)) {
    const restAfter = fullStr.slice(endIdx);
    const restBefore = fullStr.slice(0, startIdx);
    if (/^\s*\/\s*\d+/.test(restAfter) || /\d+\s*\/\s*$/.test(restBefore)) return false;
  }
  // Must have digits, Unicode superscripts/subscripts, or Greek math letters on at least one side
  const hasMathSignal = /[\d⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉ⁿπθ]/.test(num) || /[\d⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉ⁿπθ]/.test(den);
  if (!hasMathSignal) return false;
  // Avoid matching mixed words + slashes like "10/month" or "1/day"
  if (/^[A-Za-z]{2,}$/.test(num) || /^[A-Za-z]{2,}$/.test(den)) {
    if (!/^[a-z]{1,2}$/.test(den) || /^(?:km|hr|hrs|sec|min|mo|wk|yr|pa|am|pm|kg|mg|ml|cm|mm|or|and|no|na|to|of|in|on|at|by|is)$/i.test(den) || /^(?:km|hr|hrs|sec|min|mo|wk|yr|pa|am|pm|kg|mg|ml|cm|mm|or|and|no|na|to|of|in|on|at|by|is)$/i.test(num)) {
      return false;
    }
  }
  return true;
}

function buildStackedFractionHtml(numHtml, denHtml) {
  return `<span style="display:inline-flex;flex-direction:column;align-items:stretch;vertical-align:middle;line-height:1.12;margin:0 3px;font-size:0.92em;font-family:'Cambria Math','Times New Roman',Georgia,serif"><span style="padding:0 4px 2px;border-bottom:1.5px solid currentColor;text-align:center;white-space:nowrap">${numHtml}</span><span style="padding:2px 4px 0;text-align:center;white-space:nowrap">${denHtml}</span></span>`;
}

function buildRadicalHtml(degHtml, bodyHtml, isTallContent) {
  const degPart = degHtml ? `<sup style="font-size:0.68em;vertical-align:top;margin-right:-2px;line-height:1">${degHtml}</sup>` : "";
  const sqrtSize = isTallContent ? "1.95em" : "1.15em";
  return `${degPart}<span style="display:inline-flex;align-items:stretch;vertical-align:middle;margin:0 2px"><span style="display:inline-flex;align-items:center;font-family:'Cambria Math','Times New Roman',Georgia,serif;font-size:${sqrtSize};line-height:0.85;padding-right:1px;user-select:none">√</span><span style="border-top:1.5px solid currentColor;padding:2px 4px 0 2px;display:inline-flex;align-items:center">${bodyHtml}</span></span>`;
}

function buildSupSubHtml(tag, innerHtml) {
  const va = tag === "sup" ? "super" : "sub";
  return `<${tag} style="font-size:0.74em;line-height:0;vertical-align:${va}">${innerHtml}</${tag}>`;
}

function renderMathInlineRuns(expr) {
  const str = String(expr == null ? "" : expr);
  if (!str) return "";
  let out = "";
  let i = 0;

  while (i < str.length) {
    // 1. \frac{num}{den}
    if (str.startsWith("\\frac", i)) {
      let j = i + 5;
      while (j < str.length && /\s/.test(str[j])) j++;
      const g1 = readBalancedMathGroup(str, j, "{", "}");
      if (g1) {
        let k = g1.nextIdx;
        while (k < str.length && /\s/.test(str[k])) k++;
        const g2 = readBalancedMathGroup(str, k, "{", "}");
        if (g2) {
          out += buildStackedFractionHtml(renderMathInlineRuns(g1.content), renderMathInlineRuns(g2.content));
          i = g2.nextIdx;
          continue;
        }
      }
    }

    // 2. \sqrt[deg]{body} or \sqrt{body}
    if (str.startsWith("\\sqrt", i)) {
      let j = i + 5;
      let deg = "";
      if (str[j] === "[") {
        const dg = readBalancedMathGroup(str, j, "[", "]");
        if (dg) {
          deg = dg.content;
          j = dg.nextIdx;
        }
      }
      while (j < str.length && /\s/.test(str[j])) j++;
      const bg = readBalancedMathGroup(str, j, "{", "}");
      if (bg) {
        const bodyHtml = renderMathInlineRuns(bg.content);
        const isTall = /border-bottom:1\.5px/.test(bodyHtml);
        out += buildRadicalHtml(deg ? renderMathInlineRuns(deg) : "", bodyHtml, isTall);
        i = bg.nextIdx;
        continue;
      }
    }

    // 3. Explicit braced scripts ^{...} or _{...}
    if ((str[i] === "^" || str[i] === "_") && str[i + 1] === "{") {
      const grp = readBalancedMathGroup(str, i + 1, "{", "}");
      if (grp) {
        out += buildSupSubHtml(str[i] === "^" ? "sup" : "sub", renderMathInlineRuns(grp.content));
        i = grp.nextIdx;
        continue;
      }
    }

    // 4. Parenthesized / plain plain-text exponents e.g. x^(2), 10^6
    if ((str[i] === "^" || str[i] === "_") && (str[i + 1] === "(" || /^[a-zA-Z0-9]$/.test(str[i + 1] || ""))) {
      if (str[i + 1] === "(") {
        const pg = readBalancedMathGroup(str, i + 1, "(", ")");
        if (pg) {
          out += buildSupSubHtml(str[i] === "^" ? "sup" : "sub", renderMathInlineRuns(pg.content));
          i = pg.nextIdx;
          continue;
        }
      } else {
        out += buildSupSubHtml(str[i] === "^" ? "sup" : "sub", escapeCbtHtml(str[i + 1]));
        i += 2;
        continue;
      }
    }

    // 5. Plain √(...) or simple √token when user pasted plain text
    if (str[i] === "√") {
      if (str[i + 1] === "(") {
        const pg = readBalancedMathGroup(str, i + 1, "(", ")");
        if (pg) {
          const bodyHtml = renderMathInlineRuns(pg.content);
          const isTall = /border-bottom:1\.5px/.test(bodyHtml);
          out += buildRadicalHtml("", bodyHtml, isTall);
          i = pg.nextIdx;
          continue;
        }
      } else {
        const tokM = str.slice(i + 1).match(/^([0-9a-zA-Zπ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+(?:\^[0-9a-zA-Z]+)?)/);
        if (tokM) {
          const bodyHtml = renderMathInlineRuns(tokM[1]);
          out += buildRadicalHtml("", bodyHtml, false);
          i += 1 + tokM[1].length;
          continue;
        }
      }
    }

    // 6. Unicode superscript runs (²³⁴⁻³⁻¹²ⁿ) -> crisp typographic <sup>
    if (CBT_SUP_UNICODE_TO_ASCII[str[i]]) {
      let mapped = "";
      let j = i;
      while (j < str.length && CBT_SUP_UNICODE_TO_ASCII[str[j]]) {
        mapped += CBT_SUP_UNICODE_TO_ASCII[str[j]];
        j++;
      }
      out += buildSupSubHtml("sup", escapeCbtHtml(mapped));
      i = j;
      continue;
    }

    // 7. Unicode subscript runs -> crisp <sub>
    if (CBT_SUB_UNICODE_TO_ASCII[str[i]]) {
      let mapped = "";
      let j = i;
      while (j < str.length && CBT_SUB_UNICODE_TO_ASCII[str[j]]) {
        mapped += CBT_SUB_UNICODE_TO_ASCII[str[j]];
        j++;
      }
      out += buildSupSubHtml("sub", escapeCbtHtml(mapped));
      i = j;
      continue;
    }

    // 8. Safe standalone plain math fractions e.g. 12xy²/18x²y, 3 1/16, (-1/4), 72/50
    const slice = str.slice(i);
    const bareFracM = slice.match(/^(\([0-9a-zA-Zπ⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉⁺⁻+\-−\s]{1,24}\)|[0-9a-zA-Zπ⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉ⁿ]{1,18})\/(\([0-9a-zA-Zπ⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉⁺⁻+\-−\s]{1,24}\)|[0-9a-zA-Zπ⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉ⁿ]{1,18})/);
    if (bareFracM && (i === 0 || !/[0-9a-zA-Zπ⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉ⁿ\/.]/.test(str[i - 1]))) {
      const rawNum = bareFracM[1];
      const rawDen = bareFracM[2];
      const endIdx = i + bareFracM[0].length;
      if (isSafeBareMathFraction(rawNum, rawDen, str, i, endIdx)) {
        const cleanNum = stripOuterMathParens(rawNum);
        const cleanDen = stripOuterMathParens(rawDen);
        out += buildStackedFractionHtml(renderMathInlineRuns(cleanNum), renderMathInlineRuns(cleanDen));
        i = endIdx;
        continue;
      }
    }

    out += escapeCbtHtml(str[i]);
    i++;
  }

  return out;
}

function sanitizeCbtLegacyHtml(html) {
  const s = String(html || "");
  try {
    if (typeof DOMParser !== "undefined") {
      const doc = new DOMParser().parseFromString(s, "text/html");
      if (doc && doc.body && typeof doc.querySelectorAll === "function") {
        doc.querySelectorAll("script, iframe, object, embed, link, meta, style, form").forEach(el => el.remove());
        doc.querySelectorAll("*").forEach(el => {
          Array.from(el.attributes || []).forEach(attr => {
            const n = attr.name.toLowerCase();
            const v = attr.value || "";
            if (n.startsWith("on") || (/^\s*javascript:/i.test(v))) {
              el.removeAttribute(attr.name);
            }
          });
        });
        // Render any \frac / \sqrt math inside existing text nodes cleanly
        const walkText = (node) => {
          if (!node) return;
          if (node.nodeType === 3) {
            const txt = node.nodeValue || "";
            if (/\\frac\b|\\sqrt\b|\^\{|_\{/.test(txt)) {
              const span = doc.createElement("span");
              span.innerHTML = renderMathInlineRuns(txt);
              node.replaceWith(span);
            }
            return;
          }
          Array.from(node.childNodes || []).forEach(walkText);
        };
        walkText(doc.body);
        if (typeof doc.body.innerHTML === "string") return doc.body.innerHTML;
      }
    }
  } catch (e) { }
  return s
    .replace(/<\s*(script|iframe|object|embed|style|form)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|iframe|object|embed|link|meta|form)\b[^>]*\/?>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript\s*:/gi, "");
}

function formatCbtMathHtml(rawText) {
  const s = String(rawText == null ? "" : rawText);
  if (!s) return "";
  const looksLikeLegacyHtml = /<(?:\/(?:p|div|span|sup|sub|strong|em|b|i|u|math)|(?:p|div|span|sup|sub|strong|em|b|i|u)(?:\s[^>]*)?>|br\s*\/?>|img\s+[^>]*src=)/i.test(s);
  if (looksLikeLegacyHtml) {
    return sanitizeCbtLegacyHtml(s);
  }
  return renderMathInlineRuns(s);
}
