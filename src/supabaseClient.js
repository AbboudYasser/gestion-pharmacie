import { createClient } from '@supabase/supabase-js'

// استبدل بالمعلومات الخاصة بك من إعدادات Supabase
const supabaseUrl = 'https://nwnozegwhuvfqucdnbpd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53bm96ZWd3aHV2ZnF1Y2RuYnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDg4NzcsImV4cCI6MjA3MzcyNDg3N30.YHSL2XZy_4H07cA1mvt42l-7uuUQDtwhrv5vzEzWENw';

// إنشاء وتصدير العميل
export const supabase = createClient(supabaseUrl, supabaseKey);
