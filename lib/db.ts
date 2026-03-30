import Database from "better-sqlite3";
import path from "path";
import { mkdirSync } from "fs";

const dataDir = path.join(process.cwd(), "data");
mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "referrals.sqlite");

declare global {
  // eslint-disable-next-line no-var
  var __referralDb: Database.Database | undefined;
}

export const db =
  global.__referralDb ??
  new Database(dbPath, {
    fileMustExist: false
  });

if (process.env.NODE_ENV !== "production") {
  global.__referralDb = db;
}

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
