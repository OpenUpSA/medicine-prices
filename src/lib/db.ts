import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

/**
 * Resolve the location of the read-only SQLite database.
 *
 * Locally this is just `<repo>/data/mpr.db`. On Netlify the file is bundled
 * into the function via `included_files` in netlify.toml, but the working
 * directory of a function is not always the repo root, so we probe a few
 * likely candidates and use the first that exists.
 */
function resolveDbPath(): string {
  const candidates = [
    process.env.MPR_DB_PATH,
    path.join(process.cwd(), "data", "mpr.db"),
    path.join(process.cwd(), "mpr.db"),
    // Netlify bundles included_files relative to the repo root, which is
    // mounted under the task root at runtime.
    path.join(process.cwd(), ".next", "data", "mpr.db"),
  ].filter((p): p is string => Boolean(p));

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error(
    `Could not locate mpr.db. Looked in:\n${candidates.join("\n")}`
  );
}

// Reuse a single connection across warm invocations.
let _db: Database.Database | null = null;

export function db(): Database.Database {
  if (_db) return _db;
  _db = new Database(resolveDbPath(), { readonly: true, fileMustExist: true });
  _db.pragma("journal_mode = OFF");
  _db.pragma("query_only = ON");
  return _db;
}
