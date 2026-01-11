import { readFile } from 'node:fs/promises';
import { Client } from 'pg';

const loadDbUrlFromEnvFile = async () => {
  try {
    const envPath = new URL('../.env', import.meta.url);
    const content = await readFile(envPath, 'utf8');
    const match = content.match(/^SUPABASE_DB_URL=(.+)$/m);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
};

const applySchema = async (client) => {
  const schemaPath = new URL('../supabase/CORE_SCHEMA.sql', import.meta.url);
  const sql = await readFile(schemaPath, 'utf8');
  await client.query(sql);
};

const run = async () => {
  const dbUrl = process.env.SUPABASE_DB_URL || await loadDbUrlFromEnvFile();
  if (!dbUrl) {
    console.error('Missing SUPABASE_DB_URL environment variable.');
    process.exit(1);
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  try {
    await applySchema(client);
    console.log('Schema applied.');
  } finally {
    await client.end();
  }
};

run().catch((err) => {
  console.error('Schema apply failed:', err);
  process.exit(1);
});
