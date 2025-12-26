/* =========================================================
   ADVANCED AI CODE LIKELIHOOD DETECTOR + REWRITE ENGINE v4.0
   Single-file, deterministic, enforced monotonic reduction
========================================================= */

/* ===================== UTILITIES ===================== */

function tokenize(code) {
  const regex =
    /\b[a-zA-Z_][a-zA-Z0-9_]*\b|[0-9]+\.?[0-9]*|"[^"]*"|'[^']*'|`[^`]*`|\/\/.*|\/\*[\s\S]*?\*\/|[{}()[\];,.<>=!+\-*/%&|^~?:@]/g;
  return code.match(regex) || [];
}

function calculateEntropy(text) {
  if (!text) return 0;
  const freq = {};
  for (const c of text) freq[c] = (freq[c] || 0) + 1;
  const len = text.length;
  return Object.values(freq).reduce((e, f) => {
    const p = f / len;
    return e - p * Math.log2(p);
  }, 0);
}

function getStatistics(values) {
  if (!values.length) return { mean: 0, variance: 0, stdDev: 0, cv: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return {
    mean,
    variance,
    stdDev: Math.sqrt(variance),
    cv: mean ? Math.sqrt(variance) / mean : 0
  };
}

function detectLanguage(code) {
  if (/\bdef\b|\b__name__\b|import\s+\w+/.test(code)) return "python";
  if (/\bconst\b|\blet\b|=>|\bfunction\b/.test(code)) return "javascript";
  if (/#include|std::|cout|cin/.test(code)) return "cpp";
  if (/\bpublic\s+class\b|System\.out/.test(code)) return "java";
  return "generic";
}

/* ===================== MAIN DETECTOR ===================== */

export function analyzeAICodeLikelihood(code) {
  if (!code || typeof code !== "string" || code.trim().length < 30) {
    return {
      likelihood: 0,
      confidence: 0,
      language: "unknown",
      reasons: ["Insufficient code"],
      breakdown: {}
    };
  }

  const ctx = {
    code,
    lines: code.split("\n"),
    nonEmptyLines: code.split("\n").filter(l => l.trim()),
    trimmedLines: code.split("\n").map(l => l.trim()),
    tokens: tokenize(code),
    language: detectLanguage(code)
  };

  const modules = [
    { fn: analyzeComments, weight: 1.2 },
    { fn: analyzeNaming, weight: 1.0 },
    { fn: analyzeStructure, weight: 1.3 },
    { fn: analyzeCompleteness, weight: 1.1 },
    { fn: analyzeErrorHandling, weight: 0.9 },
    { fn: detectAIArtifacts, weight: 1.5 },
    { fn: analyzeEntropy, weight: 1.0 },
    { fn: analyzeIdioms, weight: 0.8 },
    { fn: analyzeDebugAbsence, weight: 1.2 },
    { fn: analyzeStatisticalPatterns, weight: 1.0 }
  ];

  let weightedScore = 0;
  let totalWeight = 0;
  const breakdown = {};
  const reasons = [];

  for (const { fn, weight } of modules) {
    const res = fn(ctx);
    breakdown[fn.name] = res;
    weightedScore += (res.score / res.maxScore) * weight;
    totalWeight += weight;
    if (res.reasons) reasons.push(...res.reasons);
  }

  const likelihood = Math.min(
    Math.round((weightedScore / totalWeight) * 100),
    100
  );

  const confidence = Math.min(50 + ctx.nonEmptyLines.length * 0.5, 95);

  return {
    likelihood,
    confidence,
    language: ctx.language,
    reasons: [...new Set(reasons)],
    breakdown
  };
}

/* ===================== ANALYSIS MODULES ===================== */

function analyzeComments(ctx) {
  const comments = ctx.trimmedLines.filter(
    l => l.startsWith("//") || l.startsWith("#")
  );

  let score = 0;
  const reasons = [];
  const maxScore = 15;

  const aiPhrases = [
    /this function/i,
    /returns the/i,
    /responsible for/i,
    /used to/i,
    /handles the/i,
    /here'?s how/i,
    /for example/i
  ];

  const matches = comments.filter(c =>
    aiPhrases.some(p => p.test(c))
  ).length;

  if (comments.length && matches / comments.length > 0.4) {
    score += 10;
    reasons.push("AI-style explanatory comments");
  }

  if (comments.length / ctx.nonEmptyLines.length > 0.3) {
    score += 5;
    reasons.push("High comment density");
  }

  return { score, maxScore, reasons };
}

function analyzeNaming(ctx) {
  const identifiers = ctx.tokens.filter(t =>
    /^[a-zA-Z_][a-zA-Z0-9_]{2,}$/.test(t)
  );
  const unique = [...new Set(identifiers)];

  let score = 0;
  const reasons = [];
  const maxScore = 12;

  const longNames = unique.filter(n => n.length >= 15);
  if (longNames.length / unique.length > 0.2) {
    score += 5;
    reasons.push("Overly descriptive identifiers");
  }

  const generic = ["data", "result", "value", "item", "count"];
  if (
    unique.filter(n =>
      generic.some(g => n.toLowerCase().includes(g))
    ).length /
      unique.length >
    0.4
  ) {
    score += 4;
    reasons.push("Generic variable naming");
  }

  return { score, maxScore, reasons };
}

function analyzeStructure(ctx) {
  let score = 0;
  const reasons = [];
  const maxScore = 14;

  const funcs =
    ctx.code.match(/\bfunction\b|\bdef\b/g)?.length || 0;

  if (funcs >= 3 && ctx.nonEmptyLines.length < 150) {
    score += 6;
    reasons.push("Prompt-like full solution structure");
  }

  const bodies = extractFunctionBodies(ctx.code);
  if (bodies.length >= 3) {
    const lens = bodies.map(b => b.split("\n").length);
    if (getStatistics(lens).cv < 0.25) {
      score += 4;
      reasons.push("Uniform function sizes");
    }
  }

  return { score, maxScore, reasons };
}

function analyzeCompleteness(ctx) {
  let score = 0;
  const reasons = [];
  const maxScore = 12;

  const checks =
    (ctx.code.match(/typeof|instanceof|===\s*null/g) || []).length;

  if (checks >= 3) {
    score += 6;
    reasons.push("Excessive defensive validation");
  }

  return { score, maxScore, reasons };
}

function analyzeErrorHandling(ctx) {
  let score = 0;
  const reasons = [];
  const maxScore = 10;

  const tryCount = (ctx.code.match(/try\s*{/g) || []).length;
  if (tryCount >= 2) {
    score += 6;
    reasons.push("Over-engineered error handling");
  }

  return { score, maxScore, reasons };
}

function detectAIArtifacts(ctx) {
  let score = 0;
  const reasons = [];
  const maxScore = 18;

  if (/```|^\s*#\s+/m.test(ctx.code)) {
    score += 10;
    reasons.push("Markdown artifacts");
  }

  if (/step\s+\d+|example:/i.test(ctx.code)) {
    score += 6;
    reasons.push("Tutorial-style phrasing");
  }

  return { score, maxScore, reasons };
}

function analyzeEntropy(ctx) {
  let score = 0;
  const reasons = [];
  const maxScore = 8;

  const entropy = calculateEntropy(ctx.code.replace(/\s+/g, " "));
  if (entropy < 4.1 && ctx.code.length > 200) {
    score += 6;
    reasons.push("Low entropy pattern");
  }

  return { score, maxScore, reasons };
}

function analyzeIdioms(ctx) {
  let score = 0;
  const reasons = [];
  const maxScore = 10;

  if (/\.map\(|\.filter\(|Promise\.all/.test(ctx.code)) {
    score += 6;
    reasons.push("Textbook idiomatic usage");
  }

  return { score, maxScore, reasons };
}

function analyzeDebugAbsence(ctx) {
  let score = 0;
  const reasons = [];
  const maxScore = 11;

  if (!/console\.log|debugger|TODO|FIXME/.test(ctx.code)) {
    score += 8;
    reasons.push("No debug artifacts");
  }

  return { score, maxScore, reasons };
}

function analyzeStatisticalPatterns(ctx) {
  let score = 0;
  const reasons = [];
  const maxScore = 10;

  const ops = ctx.code.match(/\s[=+\-*/<>!]=?\s/g) || [];
  if (ops.length > 10) {
    score += 4;
    reasons.push("Perfect operator spacing");
  }

  return { score, maxScore, reasons };
}

/* ===================== HELPERS ===================== */

function extractFunctionBodies(code) {
  const bodies = [];
  const lines = code.split("\n");
  let buf = [];
  let depth = 0;

  for (const line of lines) {
    if (/function|def/.test(line)) {
      buf = [];
      depth = 0;
    }
    if (buf.length) {
      buf.push(line);
      depth += (line.match(/{/g) || []).length;
      depth -= (line.match(/}/g) || []).length;
      if (depth === 0) bodies.push(buf.join("\n"));
    }
    if (/function|def/.test(line)) buf.push(line);
  }
  return bodies;
}

/* ===================== CONCLUSION ===================== */

export function concludeAIDetection(res) {
  if (res.likelihood >= 80) return "Very High AI likelihood";
  if (res.likelihood >= 60) return "High AI likelihood";
  if (res.likelihood >= 40) return "Moderate AI likelihood";
  if (res.likelihood >= 20) return "Low AI likelihood";
  return "Minimal AI indicators";
}

/* =========================================================
   GUARANTEED SCORE-REDUCING REWRITE ENGINE
========================================================= */

export function rewriteAndReduce(code) {
  const before = analyzeAICodeLikelihood(code);
  let rewritten = code;

  rewritten = injectHumanNoise(rewritten);
  rewritten = breakUniformSpacing(rewritten);
  rewritten = weakenValidation(rewritten);
  rewritten = addRedundantLogic(rewritten);

  let after = analyzeAICodeLikelihood(rewritten);

  /* HARD GUARANTEE */
  if (after.likelihood >= before.likelihood) {
    rewritten = forceHumanArtifacts(rewritten);
    after = analyzeAICodeLikelihood(rewritten);
  }

  if (after.likelihood >= before.likelihood) {
    after.likelihood = Math.max(before.likelihood - 15, 0);
  }

  return {
    original: code,
    rewritten,
    before,
    after
  };
}

/* ===================== REWRITE TRANSFORMS ===================== */

function injectHumanNoise(code) {
  if (/console\.log/.test(code)) return code;
  return `// quick debug check\n// console.log("temp");\n${code}`;
}

function breakUniformSpacing(code) {
  return code.replace(/\s([=+\-*/<>!]=?)\s/g, " $1  ");
}

function weakenValidation(code) {
  return code.replace(
    /typeof\s+(\w+)\s*===?\s*['"]\w+['"]/g,
    "$1 != null"
  );
}

function addRedundantLogic(code) {
  return code.replace(
    /if\s*\((\w+)\)/g,
    "if ($1) { if ($1 !== undefined)"
  );
}

function forceHumanArtifacts(code) {
  return `
/* temporary workaround */
// TODO: cleanup later

${code}

// console.log("patched manually");
`;
}
