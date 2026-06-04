import { createClient } from '@supabase/supabase-js';
import * as dotenv       from 'dotenv';

dotenv.config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
  throw new Error(
    'Missing Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_KEY are required.',
  );
}

export const supabase = createClient(url, key);