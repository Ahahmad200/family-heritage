import { createClient } from
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://vscpcjqtiwyuggyzzlva.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_PosGs_76ce8sMTPnMYuYaw_4CtdADcR";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
