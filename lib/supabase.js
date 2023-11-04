import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xuzmldjqyfgjhiusogqg.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1em1sZGpxeWZnamhpdXNvZ3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTgxMjI1NjUsImV4cCI6MjAxMzY5ODU2NX0.P8ArC6Qs3oxEkbJx8anPh49WJrKtRPVMbQsLjkXHRyI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
