import { readFile } from "node:fs/promises";
import pg from "pg";
import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL)
	throw new Error("Isi DATABASE_URL di .env.local terlebih dahulu.");
const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
try {
	await c.query("BEGIN");
	await c.query(
		await readFile(
			new URL("../migrations/001_transactions.sql", import.meta.url),
			"utf8",
		),
	);
	await c.query("COMMIT");
	console.log("Migrasi berhasil.");
} catch (e) {
	await c.query("ROLLBACK");
	throw e;
} finally {
	await c.end();
}
