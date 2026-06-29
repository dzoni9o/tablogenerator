import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kjknwyopecvheqaqxgou.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqa253eW9wZWN2aGVxYXF4Z291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NzgyNzEsImV4cCI6MjA5NTE1NDI3MX0.SFg27G-4hRjhkTtD_tVB2R94hbn3QjjZSb9CFgOn4m4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
