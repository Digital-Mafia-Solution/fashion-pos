import fs from "fs/promises";
import path from "path";

const SRC = path.resolve(process.cwd(), "src");
const EXT = [".ts", ".tsx", ".js", ".jsx", ".json", ".css"];

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const res = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...(await listFiles(res)));
    } else {
      files.push(res);
    }
  }
  return files;
}

function extractImports(code) {
  const imports = new Set();
  const re = /(?:from|require|import)\s*(?:\()?['"]([^'"\)]+)['"]/g;
  let m;
  while ((m = re.exec(code))) {
    imports.add(m[1]);
  }
  // dynamic import()
  const re2 = /import\(['"]([^'"\)]+)['"]\)/g;
  while ((m = re2.exec(code))) {
    imports.add(m[1]);
  }
  return [...imports];
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (e) {
    return false;
  }
}

async function resolveImport(fromFile, importPath) {
  if (!importPath.startsWith(".")) return null; // external module
  const base = path.resolve(path.dirname(fromFile), importPath);
  // Try direct file with extensions
  for (const ext of EXT) {
    const candidate = base + ext;
    if (await fileExists(candidate)) return path.normalize(candidate);
  }
  // Try index files
  for (const ext of EXT) {
    const candidate = path.join(base, "index" + ext);
    if (await fileExists(candidate)) return path.normalize(candidate);
  }
  // Try the path as-is
  if (await fileExists(base)) return path.normalize(base);
  return null;
}

async function run() {
  const all = await listFiles(SRC);
  const sourceFiles = all.filter((p) => EXT.includes(path.extname(p)));

  const fileSet = new Set(sourceFiles.map((p) => path.normalize(p)));

  // seeds: main entry points
  const seeds = [
    path.join(SRC, "main.tsx"),
    path.join(SRC, "main.ts"),
    path.join(SRC, "App.tsx"),
  ];

  const used = new Set();
  const queue = [];
  for (const s of seeds) {
    if (fileSet.has(path.normalize(s))) {
      used.add(path.normalize(s));
      queue.push(path.normalize(s));
    }
  }

  // If no seeds found, try all files as potential entry points (best-effort)
  if (queue.length === 0) {
    sourceFiles.slice(0, 5).forEach((f) => {
      used.add(path.normalize(f));
      queue.push(path.normalize(f));
    });
  }

  while (queue.length) {
    const file = queue.shift();
    let code;
    try {
      code = await fs.readFile(file, "utf8");
    } catch (e) {
      continue;
    }
    const imports = extractImports(code);
    for (const imp of imports) {
      const resolved = await resolveImport(file, imp);
      if (resolved && fileSet.has(resolved) && !used.has(resolved)) {
        used.add(resolved);
        queue.push(resolved);
      }
    }
  }

  const unused = [...fileSet].filter((f) => !used.has(f));

  if (unused.length === 0) {
    console.log("No unused files found.");
    return;
  }

  console.log("Unused files (relative to project root):");
  for (const u of unused) {
    console.log("-", path.relative(process.cwd(), u));
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
