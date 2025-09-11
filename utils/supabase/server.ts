import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient(cookieStore: any) {
  return createServerClient(
    'https://jmsemkiiabamogziuqbn.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptc2Vta2lpYWJhbW9neml1cWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTE3NjYsImV4cCI6MjA3MjU2Nzc2Nn0.yiuBumJd-mujTPP0KhuYwwepLujMej9wS3yXpCUUhM4',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}