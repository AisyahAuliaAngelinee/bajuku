import {readFile,readdir} from 'node:fs/promises';
import pg from 'pg';
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL belum diatur.');
const c=new pg.Client({connectionString:process.env.DATABASE_URL});await c.connect();
try{
 await c.query('BEGIN');await c.query("SELECT pg_advisory_xact_lock(21760409)");
 await c.query('CREATE TABLE IF NOT EXISTS schema_migrations(name text PRIMARY KEY,applied_at timestamptz NOT NULL DEFAULT now())');
 const dir=new URL('../migrations/',import.meta.url);
 for(const name of (await readdir(dir)).filter(n=>n.endsWith('.sql')).sort()){
  if((await c.query('SELECT name FROM schema_migrations WHERE name=$1',[name])).rowCount)continue;
  await c.query(await readFile(new URL(name,dir),'utf8'));await c.query('INSERT INTO schema_migrations(name) VALUES ($1)',[name]);console.log('Applied',name);
 }
 await c.query('COMMIT');console.log('Migrasi berhasil.');
}catch(error){await c.query('ROLLBACK');throw error;}finally{await c.end();}
