// Print a public URL for the app running in this GitHub Codespace, so a prototype
// branch can be sent to a stakeholder as a link.
//
//   npm run prototype:share
//
// Run it inside the codespace. Outside one, it prints how to open the current
// branch in a codespace first.
import { execFileSync } from "child_process";

const PORT = 5173;
const name = process.env.CODESPACE_NAME;
const domain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || "app.github.dev";

if (!name) {
  const branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { encoding: "utf8" }).trim();
  console.log(`Not in a codespace. Push the branch, then open it in one:

  git push -u origin ${branch}
  gh codespace create -R bitovi-training/bitovi-shop -b ${branch}
  gh codespace code        # or open it from github.com

The codespace runs \`npm start\` on its own. Then run \`npm run prototype:share\` inside it.`);
  process.exit(0);
}

try {
  execFileSync("gh", ["codespace", "ports", "visibility", `${PORT}:public`, "-c", name], { stdio: "inherit" });
} catch {
  console.error(`Couldn't make port ${PORT} public. Your org may not allow public ports;
set it to "Private to Organization" in the Ports panel instead and share with people in the org.`);
  process.exit(1);
}

console.log(`\nPublic URL (works while this codespace is running):\n\n  https://${name}-${PORT}.${domain}/\n`);
