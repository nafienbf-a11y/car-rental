import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read .env file manually
const envFile = readFileSync(resolve(__dirname, '..', '.env'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.trim().split('=');
    if (key && valueParts.length) env[key] = valueParts.join('=');
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const users = [
    { email: 'gatibi@admin.com', password: 'test123' },
    { email: 'admin@admin.com', password: 'admin123' },
    { email: 'test@test.com', password: 'test132' },
];

async function seedUsers() {
    console.log('🚀 Creating users in Supabase Auth...\n');

    for (const user of users) {
        const { data, error } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
        });

        if (error) {
            console.log(`❌ ${user.email}: ${error.message}`);
        } else {
            console.log(`✅ ${user.email}: Created successfully (ID: ${data.user?.id})`);
        }
    }

    console.log('\n✨ Done! Users can now log in.');
}

seedUsers();
