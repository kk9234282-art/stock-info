import { access, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
try {
  await access(".env.local");
  console.log("Existing local settings preserved.");
} catch {
  await writeFile(
    ".env.local",
    `DATABASE_URL=postgresql://atlas:atlas_local_only@127.0.0.1:54329/atlas\nADMIN_PASSWORD=${randomBytes(24).toString("hex")}\nSESSION_SECRET=${randomBytes(32).toString("hex")}\nSITE_URL=http://localhost:3000\n`,
    { mode: 0o600, flag: "wx" },
  );
  console.log(
    "Created ignored local development settings. Set your own administrator password in .env.local.",
  );
}
