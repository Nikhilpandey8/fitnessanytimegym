'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dumbbell } from 'lucide-react'

interface LoadingScreenProps {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(onComplete, 500)
          return 100
        }
        return prev + 2
      })
    }, 50)

    return () => clearInterval(timer)
  }, [onComplete])

     return (
       <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-lg">
         <img src="/logo.svg" alt="FitnessAnytime Gym Logo" className="w-20 h-20 mb-6 animate-spin-slow" />
         <h2 className="text-2xl font-bold text-purple-400 mb-2">FitnessAnytime</h2>
         <p className="text-pink-400 text-lg">Loading...</p>
       </div>
     );
}