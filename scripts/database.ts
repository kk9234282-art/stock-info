import EmbeddedPostgres from "embedded-postgres";
import { mkdir, access } from "node:fs/promises";
await mkdir(".local", { recursive: true });
const pg = new EmbeddedPostgres({
  databaseDir: ".local/postgres",
  user: "atlas",
  password: "atlas_local_only",
  port: 54329,
  persistent: true,
});
try {
  await access(".local/postgres/PG_VERSION");
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  await pg.initialise();
}
await pg.start();
try {
  await pg.createDatabase("atlas");
} catch (e) {
  if (!String(e).includes("already exists")) throw e;
}
console.log("Local PostgreSQL ready on 127.0.0.1:54329 (development only)");
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, async () => {
    await pg.stop();
    process.exit(0);
  });
await new Promise(() => {});
