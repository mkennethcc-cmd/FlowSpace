// Catches "X is not defined" before a user does: parses every source file and reports names that are
// used but never declared or imported. A build does not catch these — they only crash when that line
// runs, which for sync or sign-in code can be long after shipping.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const here = path.dirname(fileURLToPath(import.meta.url));

// Things the browser (or Vite) provides.
const GLOBALS = new Set(`window document navigator localStorage sessionStorage console CSS setTimeout clearTimeout setInterval
  clearInterval requestAnimationFrame cancelAnimationFrame fetch URL Blob File FileReader Image Audio Notification Date Math
  JSON Object Array String Number Boolean Promise Set Map WeakMap Symbol Error TypeError RegExp Intl crypto alert confirm prompt
  undefined NaN Infinity isNaN parseInt parseFloat encodeURIComponent decodeURIComponent structuredClone globalThis
  AudioContext webkitAudioContext PointerEvent MouseEvent KeyboardEvent Event CustomEvent getComputedStyle matchMedia
  HTMLElement Node location history screen performance atob btoa queueMicrotask import`.split(/\s+/).filter(Boolean));

export function undefinedNames(file) {
  const code = fs.readFileSync(file, "utf8");
  const ast = parse(code, { sourceType: "module", plugins: ["jsx"] });
  const out = new Map();
  traverse(ast, {
    Program(p) {
      for (const [name, refs] of Object.entries(p.scope.globals)) {
        if (GLOBALS.has(name)) continue;
        const line = refs.loc?.start?.line;
        out.set(name, line);
      }
    },
  });
  // scope.globals only records the first reference; walk again for exact, complete locations.
  traverse(ast, {
    ReferencedIdentifier(p) {
      const n = p.node.name;
      if (out.has(n) && !p.scope.hasBinding(n) && out.get(n) === undefined) out.set(n, p.node.loc.start.line);
    },
  });
  return [...out.entries()];
}

export function run(report, section) {
  section("Undeclared names (would crash at runtime)");
  for (const f of ["App.jsx", "logic.js", "db.js", "AuthScreen.jsx", "main.jsx", "supabase.js"]) {
    const bad = undefinedNames(path.join(here, "../src", f));
    report(bad.length === 0, `src/${f}: ${bad.map(([n, l]) => `${n} (line ${l})`).join(", ")}`);
  }
}
