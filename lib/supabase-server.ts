import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a mock client that won't crash during build
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }), single: async () => ({ data: null, error: null }) }) }),
        insert: () => ({ select: async () => ({ data: null, error: { message: 'Supabase not configured' } }) }),
        update: () => ({ eq: () => ({ data: null, error: { message: 'Supabase not configured' } }) }),
        delete: () => ({ eq: () => ({ data: null, error: { message: 'Supabase not configured' } }) }),
      }),
    } as any;
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Safe to ignore in server components
        }
      },
    },
  });
}