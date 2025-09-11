'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, Calendar, CreditCard, Pause, Play, X, Receipt, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Member, Membership } from '@/lib/supabase'
import { formatCurrency, formatDate, isExpired, isExpiringSoon } from '@/lib/utils'

interface MemberCardProps {
  member: Member & { memberships: Membership[] }
  onActivate: (member: Member) => void
  onRenew: (member: Member) => void
  onHold: (membershipId: string) => Promise<void>
  onResume: (membershipId: string) => Promise<void>
  onDeactivate: (membershipId: string) => Promise<void>
  onViewSlip: (membershipId: string) => void
}

export default function MemberCard({
  member,
  onActivate,
  onRenew,
  onHold,
  onResume,
  onDeactivate,
  onViewSlip
}: MemberCardProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  
  const activeMembership = member.memberships.find(m => m.status === 'active') ||
                          member.memberships.find(m => m.status === 'hold') ||
                          member.memberships[0]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'hold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'expired': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const handleAction = async (action: () => Promise<void>, loadingKey: string) => {
    setIsLoading(loadingKey)
    try {
      await action()
    } finally {
      setIsLoading(null)
    }
  }

  const membershipStatus = activeMembership?.status || 'inactive'
  const isExpiredStatus = activeMembership && isExpired(activeMembership.end_date)
  const isExpiringSoonStatus = activeMembership && isExpiringSoon(activeMembership.end_date)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full glassmorphism border-gray-600/30 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center justify-between">
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-400" />
              {member.full_name}
            </div>
            {(isExpiredStatus || isExpiringSoonStatus) && (
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            )}
          </CardTitle>
          {member.phone && (
            <div className="flex items-center text-gray-400 text-sm">
              <Phone className="w-4 h-4 mr-1" />
              {member.phone}
            </div>
          )}
          {member.email && (
            <div className="flex items-center text-gray-400 text-sm">
              <span className="w-4 h-4 mr-1">📧</span>
              {member.email}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {activeMembership ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge className={`${getStatusColor(membershipStatus)} font-medium`}>
                  {membershipStatus.toUpperCase()}
                </Badge>
                <span className="text-gray-400 text-sm">
                  {activeMembership.duration_label}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400">Start Date</p>
                  <p className="text-white font-medium">{formatDate(activeMembership.start_date)}</p>
                </div>
                <div>
                  <p className="text-gray-400">End Date</p>
                  <p className={`font-medium ${
                    isExpiredStatus ? 'text-red-400' : 
                    isExpiringSoonStatus ? 'text-yellow-400' : 'text-white'
                  }`}>
                    {formatDate(activeMembership.end_date)}
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-gray-400 text-sm">Fee Amount</p>
                <p className="text-lg font-bold text-green-400">
                  {formatCurrency(activeMembership.fee_amount)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {membershipStatus === 'active' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction(() => onHold(activeMembership.id), 'hold')}
                      disabled={isLoading === 'hold'}
                      className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/10"
                    >
                      {isLoading === 'hold' ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          <Pause className="w-4 h-4 mr-1" />
                          Hold
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction(() => onDeactivate(activeMembership.id), 'deactivate')}
                      disabled={isLoading === 'deactivate'}
                      className="border-red-600 text-red-400 hover:bg-red-600/10"
                    >
                      {isLoading === 'deactivate' ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          <X className="w-4 h-4 mr-1" />
                          Deactivate
                        </>
                      )}
                    </Button>
                  </>
                )}
                
                {membershipStatus === 'hold' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(() => onResume(activeMembership.id), 'resume')}
                    disabled={isLoading === 'resume'}
                    className="border-green-600 text-green-400 hover:bg-green-600/10 col-span-2"
                  >
                    {isLoading === 'resume' ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Resume
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewSlip(activeMembership.id)}
                className="w-full border-purple-600 text-purple-400 hover:bg-purple-600/10"
              >
                <Receipt className="w-4 h-4 mr-1" />
                View Fee Slip
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRenew(member)}
                className="w-full border-green-600 text-green-400 hover:bg-green-600/10 mt-2"
              >
                <CreditCard className="w-4 h-4 mr-1" />
                Renew Membership
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-gray-400">No active membership</p>
              <Button
                onClick={() => onActivate(member)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Activate Membership
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}