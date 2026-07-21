import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bwdscrgwtklaqkrlwmfb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3ZHNjcmd3dGtsYXFrcmx3bWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NTQyOTcsImV4cCI6MjA5OTUzMDI5N30.V98nRQNdPPZ3o0a8jAcMWN1t16BhPRLkxqipjcM_eAk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
