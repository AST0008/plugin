import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://umcncouxfntmvpnzgihw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtY25jb3V4Zm50bXZwbnpnaWh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzkxNzk1MywiZXhwIjoyMDQ5NDkzOTUzfQ.xv9fJEEZCKsqhUnexYKJvvVNz75v_TMk4wmjcGLOHI4";

export const supabase = createClient(supabaseUrl, supabaseKey);