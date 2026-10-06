// Fails when a shared component has no Code Connect mapping, or a mapping
// has no url header. Never calls Figma, so it's safe to run in CI.
import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..", "..");
const componentsDir = path.join(root, "frontend", "src", "components");
const FILE_URL = "https://www.figma.com/design/v6L5bcFuh035HNwdjqy6GN/";

// Directories that hold other components rather than being one.
const CONTAINERS = ["Toast"];

function findMappings(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return findMappings(full);
    return entry.name.endsWith(".figma.ts") ? [full] : [];
  });
}

const problems = [];

for (const name of fs.readdirSync(componentsDir)) {
  const dir = path.join(componentsDir, name);
  if (!fs.statSync(dir).isDirectory() || CONTAINERS.includes(name)) continue;
  if (!fs.existsSync(path.join(dir, `${name}.figma.ts`))) {
    problems.push(`unmapped: components/${name}`);
  }
}

for (const file of findMappings(path.join(root, "frontend", "src"))) {
  const header = fs.readFileSync(file, "utf8").match(/^\/\/ url=(.*)$/m);
  if (!header || !header[1].startsWith(FILE_URL)) {
    problems.push(`missing or wrong url header: ${path.relative(root, file)}`);
  }
}

if (problems.length) {
  console.error(`Code Connect check failed:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log("Code Connect check passed.");
