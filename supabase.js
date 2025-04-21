// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://ceskdskhajcjdogrrzxl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlc2tkc2toYWpjamRvZ3JyenhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODQyMDQsImV4cCI6MjA2MDc2MDIwNH0.aZd2aMYEZhwSG2T1kKiAfZx_yup9uFQDuF--5mx4pIM'; // From Supabase settings → Project → API

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
