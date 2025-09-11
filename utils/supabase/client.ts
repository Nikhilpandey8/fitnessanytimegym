import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    'https://jmsemkiiabamogziuqbn.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptc2Vta2lpYWJhbW9neml1cWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTE3NjYsImV4cCI6MjA3MjU2Nzc2Nn0.yiuBumJd-mujTPP0KhuYwwepLujMej9wS3yXpCUUhM4'
  )
}