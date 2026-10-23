/**
 * Dependency-free server-side LaTeX → Unicode rendering for math embedded in
 * prose (mostly `$…$` inline segments arriving from automated ingest).
 *
 * Rationale: the project ships zero client-side math bundle and renders
 * everything on the server. The math vocabulary in the dataset is small and
 * closed, so a targeted Unicode mapping is more honest and testable than a
 * full typesetter (KaTeX ≈ 277 KB + fonts + a sanitising surface). Anything we
 * cannot map is left legible rather than mangled.
 *
 * Money (`\$`, `$2 per problem …`) is deliberately preserved as literal text.
 */

/** Greek + symbol commands → single Unicode code points. */
const SYMBOLS: Record<string, string> = {
  subseteq: "⊆", supseteq: "⊇", subset: "⊂", supset: "⊃",
  in: "∈", notin: "∉", ni: "∋", leq: "≤", le: "≤", geq: "≥", ge: "≥",
  approx: "≈", equiv: "≡", sim: "∼", simeq: "≃", neq: "≠",
  to: "→", rightarrow: "→", leftarrow: "←", Rightarrow: "⇒", Leftrightarrow: "⇔",
  colon: ":", coloneqq: ":=",
  times: "×", pm: "±", mp: "∓", cdot: "·", ast: "∗", star: "⋆", div: "÷",
  infty: "∞", partial: "∂", nabla: "∇", ell: "ℓ",
  alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε", varepsilon: "ε",
  zeta: "ζ", eta: "η", theta: "θ", vartheta: "ϑ", iota: "ι", kappa: "κ",
  lambda: "λ", mu: "μ", nu: "ν", xi: "ξ", pi: "π", varpi: "ϖ", rho: "ρ",
  varrho: "ϱ", sigma: "σ", varsigma: "ς", tau: "τ", upsilon: "υ", phi: "φ",
  varphi: "ϕ", chi: "χ", psi: "ψ", omega: "ω",
  Gamma: "Γ", Delta: "Δ", Theta: "Θ", Lambda: "Λ", Xi: "Ξ", Pi: "Π",
  Sigma: "Σ", Upsilon: "Υ", Phi: "Φ", Psi: "Ψ", Omega: "Ω",
  sum: "∑", prod: "∏", int: "∫", oint: "∮", bigcup: "⋃", bigcap: "⋂",
  forall: "∀", exists: "∃", nexists: "∄", neg: "¬", land: "∧", lor: "∨",
  emptyset: "∅", varnothing: "∅", cup: "∪", cap: "∩", setminus: "∖",
  ldots: "…", cdots: "⋯", vdots: "⋮", dots: "…",
  // plain-text function names keep their spelling
  log: "log", ln: "ln", exp: "exp", max: "max", min: "min", arg: "arg", det: "det",
};

/** \mathbb{…} blackboard letters actually seen (extend as data grows). */
const MATHBB: Record<string, string> = {
  R: "ℝ", N: "ℕ", Z: "ℤ", Q: "ℚ", C: "ℂ", P: "ℙ", H: "ℍ", B: "𝐵",
};

/** Superscript modifier letters. Unmapped chars fall back to `^( … )`. */
const SUP: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾", n: "ⁿ", x: "ˣ", y: "ʸ", i: "ⁱ",
  a: "ᵃ", o: "ᵒ", e: "ᵉ", u: "ᵘ", h: "ʰ", l: "ˡ", m: "ᵐ", p: "ᵖ", r: "ʳ", s: "ˢ", t: "ᵗ", v: "ᵛ", k: "ᵏ",
  α: "ᵅ", β: "ᵝ", γ: "ᵞ", δ: "ᵟ", ε: "ᵋ", θ: "ᶿ", φ: "ᵠ", χ: "ᵡ", ψ: "ᵚ",
};

/** Subscript digits / sign (fallback `_( … )`). */
const SUB: Record<string, string> = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎", a: "ₐ", e: "ₑ", o: "ₒ", x: "ₓ", n: "ₙ",
};

/** Command words that must never count as "English prose" in the math guard. */
const CMD_WORDS = new Set([
  ...Object.keys(SYMBOLS), "mathrm", "mathbf", "mathcal", "mathit", "mathtt", "mathbb",
  "text", "textbf", "operatorname", "frac", "sqrt", "big", "Big", "bigg", "Bigg",
  "left", "right", "coloneqq", "defeq", "ast",
]);

const PUA_DOLLAR = "\uE000"; // placeholder protecting escaped `\$` (money)
const PUA_LBRACE = "\uE001"; // placeholder protecting escaped `\{` (literal brace)
const PUA_RBRACE = "\uE002"; // placeholder protecting escaped `\}` (literal brace)

function mapAll(src: string, table: Record<string, string>): string | null {
  let out = "";
  for (const ch of src) {
    const m = table[ch];
    if (!m) return null;
    out += m;
  }
  return out;
}

function superscript(content: string): string {
  // `^*` / `^∗` (H^ast style) → a plain raised asterisk reads best.
  if (content === "∗" || content === "*") return "∗";
  return mapAll(content, SUP) ?? `^(${content})`;
}

function subscript(content: string): string {
  return mapAll(content, SUB) ?? `_${content}`;
}

/** Convert the interior of one math segment to readable Unicode. */
function convertLatex(inner: string): string {
  let s = inner.trim();
  // Drop wrappers that only style plain text: \mathrm{BB}(6) → BB(6)
  s = s.replace(
    /\\(?:mathrm|mathbf|mathcal|mathit|mathtt|text|textbf|operatorname)\s*\{([^{}]*)\}/g,
    (_m, c: string) => c
  );
  // \mathbb{R} / \mathbb R → ℝ
  s = s.replace(/\\mathbb\s*\{([A-Za-z])\}/g, (_m, c: string) => MATHBB[c] ?? c);
  s = s.replace(/\\mathbb\s+([A-Za-z])/g, (_m, c: string) => MATHBB[c] ?? c);
  // \frac{a}{b} → (a)/(b)
  s = s.replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "($1)/($2)");
  s = s.replace(/\\sqrt\s*\{([^{}]*)\}/g, "√($1)");
  s = s.replace(/\{,\}/g, ","); // 1{,}990 → 1,990
  // sizing commands vanish entirely; spacing commands become one space
  s = s.replace(/\\(?:big|Big|bigg|Bigg|left|right)\b/g, "");
  s = s.replace(/\\(?:quad|qquad)\b/g, " ");
  s = s.replace(/\\[,;!]/g, " ");
  // remaining \command → symbol / literal word
  s = s.replace(/\\([a-zA-Z]+)/g, (_m, cmd: string) => SYMBOLS[cmd] ?? cmd);
  // escaped specials: \% \$ \_ \& … → the character itself; \{ \} are guarded
  // as literal braces so the grouping-unwrap below cannot eat set brackets.
  s = s.replace(/\\\{/g, PUA_LBRACE).replace(/\\\}/g, PUA_RBRACE);
  s = s.replace(/\\([{}%$&#_])/g, "$1");
  // `^∗` / `^*` before generic superscripts
  s = s.replace(/\^[∗*]/g, "∗");
  // braced then single-char super/subscripts
  s = s.replace(/\^\{([^{}]*)\}/g, (_m, c: string) => superscript(c));
  s = s.replace(/\^([A-Za-z0-9αβγδεθφχψ])/g, (_m, c: string) => superscript(c));
  s = s.replace(/_\{([^{}]*)\}/g, (_m, c: string) => subscript(c));
  s = s.replace(/_([A-Za-z0-9])/g, (_m, c: string) => subscript(c));
  // any leftover grouping braces → unwrap
  s = s.replace(/\{([^{}]*)\}/g, "$1");
  // restore guarded literal braces \{ \}
  s = s.replace(new RegExp(PUA_LBRACE, "g"), "{").replace(new RegExp(PUA_RBRACE, "g"), "}");
  // LaTeX dashes: --- → —, -- → – (e.g. \text{--} unwrapped above)
  s = s.replace(/---/g, "—").replace(/--/g, "–");
  return s.replace(/\s+/g, " ").trim();
}

/**
 * A `$…$` segment is treated as math only if, once command words are removed,
 * it contains no ≥4-letter ASCII word (whitelisted function/command names
 * excluded). This keeps money text ("$2 per problem limit …") literal.
 */
function looksLikeMath(inner: string): boolean {
  // Replace whitelisted commands with a space (preserving word boundaries),
  // keep unknown \words as text, then flag any ≥3-letter ASCII run that is not
  // a known command/function — that is what distinguishes prose from math.
  const noCmds = inner.replace(/\\([a-zA-Z]+)/g, (_m, cmd: string) =>
    CMD_WORDS.has(cmd) ? " " : cmd
  );
  const words = noCmds.match(/[A-Za-z]{3,}/g) ?? [];
  return words.every((w) => CMD_WORDS.has(w.toLowerCase()));
}

/**
 * Render inline (`$…$`) and display (`$$…$$`) LaTeX embedded in prose to
 * Unicode. Returns the input untouched when it contains no `$`, so the common
 * path costs a single `includes` check. Unparseable / money segments are left
 * exactly as they were.
 */
export function renderMath(text: string): string {
  if (!text.includes("$") && !text.includes("\\")) return text;
  // Protect escaped dollars (literal currency) from the delimiter scan.
  const protectedText = text.replace(/\\\$/g, PUA_DOLLAR);
  // Prose-level LaTeX cleanup: keep emphasis content, drop citation keys.
  const cleaned = protectedText
    .replace(/\\(?:emph|textit|textbf|underline|mathrm|mathit|operatorname)\s*\{([^{}]*)\}/g, "$1")
    .replace(/\\(?:cite|citet|citep|citealp|citealt|citeyear)\s*(?:\[[^\]]*\])?\{[^{}]*\}/g, "");
  const rendered = cleaned
    .replace(/\$\$([^$]+)\$\$/g, (_m, inner: string) =>
      looksLikeMath(inner) ? convertLatex(inner) : `$$${inner}$$`
    )
    .replace(/\$([^$]+)\$/g, (_m, inner: string) =>
      looksLikeMath(inner) ? convertLatex(inner) : `$${inner}$`
    )
    // LaTeX quote pairs → curly quotes; literal `` `` and '' rarely survive.
    .replace(/``/g, "“")
    .replace(/''/g, "”");
  return rendered.replace(new RegExp(PUA_DOLLAR, "g"), "$");
}
