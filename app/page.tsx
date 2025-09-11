'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoadingScreen from '@/components/LoadingScreen'

export default function HomePage() {
  const router = useRouter()

  return (
    <LoadingScreen onComplete={() => router.push('/dashboard')} />
  )
}