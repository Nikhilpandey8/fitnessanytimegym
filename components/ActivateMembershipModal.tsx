'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Member } from '@/lib/supabase'

interface ActivateMembershipModalProps {
  isOpen: boolean
  onClose: () => void
  member: Member | null
  onSubmit: (data: {
    duration_label: string
    fee_amount: number
    start_date: string
  }) => Promise<void>
}

const membershipOptions = [
  { label: '1 month', defaultFee: 1500 },
  { label: '3 months', defaultFee: 4000 },
  { label: '1 year', defaultFee: 15000 },
]

export default function ActivateMembershipModal({
  isOpen,
  onClose,
  member,
  onSubmit
}: ActivateMembershipModalProps) {
  const [formData, setFormData] = useState({
    duration_label: '',
    fee_amount: 0,
    start_date: new Date().toISOString().split('T')[0]
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDurationChange = (duration: string) => {
    const option = membershipOptions.find(opt => opt.label === duration)
    setFormData(prev => ({
      ...prev,
      duration_label: duration,
      fee_amount: option?.defaultFee || 0
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      console.log('Submitting membership data:', formData)
      await onSubmit(formData)
      setFormData({
        duration_label: '',
        fee_amount: 0,
        start_date: new Date().toISOString().split('T')[0]
      })
      onClose()
    } catch (error) {
      console.error('Failed to activate membership:', error)
      setError('Failed to activate membership. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !member) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="w-full max-w-md glassmorphism border-purple-500/20 neon-glow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-purple-400" />
              Activate Membership
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
              <p className="text-gray-200 font-medium">{member.full_name}</p>
              {member.phone && <p className="text-gray-400 text-sm">{member.phone}</p>}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-gray-200">Membership Duration *</Label>
                <Select
                  value={formData.duration_label}
                  onValueChange={handleDurationChange}
                  required
                >
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 focus:border-purple-400 text-white">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {membershipOptions.map((option) => (
                      <SelectItem key={option.label} value={option.label}>
                        {option.label} (₹{option.defaultFee})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fee_amount" className="text-gray-200">Fee Amount *</Label>
                <Input
                  id="fee_amount"
                  type="number"
                  value={formData.fee_amount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fee_amount: Number(e.target.value) }))}
                  className="bg-gray-800/50 border-gray-600 focus:border-purple-400 text-white"
                  placeholder="Enter fee amount"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-gray-200">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="bg-gray-800/50 border-gray-600 focus:border-purple-400 text-white"
                  required
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm">{error}</div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    'Activate'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}