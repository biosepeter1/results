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
  } catch (e) {}
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
  } catch (e) {}
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
