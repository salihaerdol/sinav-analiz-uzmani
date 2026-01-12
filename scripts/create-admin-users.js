import { readFile } from 'node:fs/promises';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAILS = ['turhanhamza@gmail.com', 'salihaerdol11@gmail.com'];

const loadEnv = async () => {
  try {
    const envPath = new URL('../.env', import.meta.url);
    const content = await readFile(envPath, 'utf8');
    const normalized = content.replace(/^\uFEFF/, '');
    const urlMatch = normalized.match(/^VITE_SUPABASE_URL=(.+)$/m);
    const keyMatch = normalized.match(/^SUPABASE_SERVICE_ROLE_KEY=(.+)$/m);
    return {
      url: urlMatch ? urlMatch[1].trim() : null,
      key: keyMatch ? keyMatch[1].trim() : null
    };
  } catch {
    return { url: null, key: null };
  }
};

const createPassword = () => {
  const suffix = crypto.randomBytes(6).toString('base64url');
  return `Admin!${suffix}`;
};

const run = async () => {
  const env = await loadEnv();
  const url = process.env.VITE_SUPABASE_URL || env.url;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || env.key;

  if (!url || !key) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const findUserByEmail = async (targetEmail) => {
    const perPage = 200;
    let page = 1;
    while (page < 20) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
      if (error) {
        throw error;
      }
      const match = data?.users?.find((user) => user.email?.toLowerCase() === targetEmail.toLowerCase());
      if (match) return match;
      if (!data?.users || data.users.length < perPage) {
        break;
      }
      page += 1;
    }
    return null;
  };

  for (const email of ADMIN_EMAILS) {
    let userId = null;
    let createdPassword = null;

    let existingUser = null;
    try {
      existingUser = await findUserByEmail(email);
    } catch (err) {
      console.error(`Failed to lookup ${email}:`, err.message || err);
      continue;
    }

    if (existingUser) {
      userId = existingUser.id;
      console.log(`Admin user already exists: ${email}`);
    } else {
      createdPassword = createPassword();
      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: createdPassword,
        email_confirm: true
      });
      if (createError) {
        console.error(`Failed to create ${email}:`, createError.message);
        continue;
      }
      userId = created.user?.id || null;
      console.log(`Admin user created: ${email}`);
    }

    if (!userId) {
      console.error(`Missing user id for ${email}`);
      continue;
    }

    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        email,
        is_admin: true,
        role: 'admin'
      });

    if (profileError) {
      console.error(`Failed to update profile for ${email}:`, profileError.message);
    } else {
      console.log(`Admin profile ensured: ${email}`);
    }

    if (createdPassword) {
      console.log(`Temp password for ${email}: ${createdPassword}`);
    }
  }
};

run().catch((err) => {
  console.error('Admin user setup failed:', err);
  process.exit(1);
});
