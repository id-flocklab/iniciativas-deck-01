// Fuente de la página: el kit de Anatomy (global), lathe como `G` y tube como `T`,
// para poder reconstruir piezas que cambian de forma (brazos, cables) en vivo.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const KIT = join(dirname(fileURLToPath(import.meta.url)), "kit");
const read = (file) => readFileSync(join(KIT, file), "utf8");
const names = (src) => [...src.matchAll(/^export (?:async )?(?:function\*?|const|let|class) ([A-Za-z0-9_$]+)/gm)].map((m) => m[1]);
const strip = (src) => src.replace(/^import .*$/gm, "").replace(/^export /gm, "");
const scoped = (name, file) => {
  const src = read(file);
  return `const ${name} = (() => {\n${strip(src)}\nreturn { ${names(src).join(", ")} };\n})();\n`;
};

export const pageScript = (live) => [strip(read("iso-kit.mjs")), scoped("G", "lathe.mjs"), scoped("T", "tube.mjs"), live].join("\n");
