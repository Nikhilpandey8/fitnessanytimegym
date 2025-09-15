'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Users, Calendar, AlertTriangle, Search, Filter, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AddMemberModal from '@/components/AddMemberModal'
import ActivateMembershipModal from '@/components/ActivateMembershipModal'
import RenewMembershipModal from '@/components/RenewMembershipModal'
import MemberCard from '@/components/MemberCard'
import { Member, Membership } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

interface MemberWithMemberships extends Member {
  memberships: Membership[]
}

export default function StatusDashboard() {
  const [members, setMembers] = useState<MemberWithMemberships[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddMember, setShowAddMember] = useState(false)
  const [showActivateMembership, setShowActivateMembership] = useState(false)
  const [showRenewMembership, setShowRenewMembership] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const params = useParams()
  const statusFilter = params.status as string

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members')
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (memberData: { full_name: string; phone?: string; email: string; notes?: string }) => {
    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      })
      if (response.ok) {
        fetchMembers()
      }
    } catch (error) {
      console.error('Error adding member:', error)
    }
  }

  const handleActivateMembership = async (data: {
    duration_label: string
    fee_amount: number
    start_date: string
  }) => {
    if (!selectedMember) return
    try {
      const response = await fetch(`/api/members/${selectedMember.id}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        fetchMembers()
      }
    } catch (error) {
      console.error('Error activating membership:', error)
    }
  }

  const handleRenewMembership = async (data: {
    duration_label: string
    fee_amount: number
    start_date: string
  }) => {
    if (!selectedMember) return
    try {
      const memberWithMemberships = members.find(m => m.id === selectedMember.id)
      const activeMembership = memberWithMemberships?.memberships.find(m => m.status === 'active') ||
                              memberWithMemberships?.memberships.find(m => m.status === 'expired') ||
                              memberWithMemberships?.memberships[0]
      if (!activeMembership) {
        console.error('No membership found to renew')
        return
      }
      const response = await fetch(`/api/memberships/${activeMembership.id}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        fetchMembers()
      }
    } catch (error) {
      console.error('Error renewing membership:', error)
    }
  }

  const handleHoldMembership = async (membershipId: string) => {
    try {
      const response = await fetch(`/api/memberships/${membershipId}/hold`, {
        method: 'POST',
      })
      if (response.ok) {
        fetchMembers()
      }
    } catch (error) {
      console.error('Error holding membership:', error)
    }
  }

  const handleResumeMembership = async (membershipId: string) => {
    try {
      const response = await fetch(`/api/memberships/${membershipId}/resume`, {
        method: 'POST',
      })
      if (response.ok) {
        fetchMembers()
      }
    } catch (error) {
      console.error('Error resuming membership:', error)
    }
  }

  const handleDeactivateMembership = async (membershipId: string) => {
    try {
      const response = await fetch(`/api/memberships/${membershipId}/deactivate`, {
        method: 'POST',
      })
      if (response.ok) {
        fetchMembers()
      }
    } catch (error) {
      console.error('Error deactivating membership:', error)
    }
  }

  const handleViewSlip = (membershipId: string) => {
    router.push(`/slip/${membershipId}`)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    if (statusFilter === 'all' || statusFilter === 'total') return matchesSearch
    const memberStatus = member.memberships.find(m => m.status === 'active') ||
                            member.memberships.find(m => m.status === 'hold') ||
                            member.memberships[0]
    return matchesSearch && (memberStatus?.status || 'inactive') === statusFilter
  })

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold capitalize">{statusFilter} Members</h1>
        <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
      </div>

      {/* Member Cards */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map(member => (
          <MemberCard
            key={member.id}
            member={member}
            onActivate={() => { setSelectedMember(member); setShowActivateMembership(true) }}
            onRenew={() => { setSelectedMember(member); setShowRenewMembership(true) }}
            onHold={handleHoldMembership}
            onResume={handleResumeMembership}
            onDeactivate={handleDeactivateMembership}
            onViewSlip={handleViewSlip}
          />
        ))}
      </div>

      {/* Modals */}
      {showAddMember && <AddMemberModal isOpen={showAddMember} onClose={() => setShowAddMember(false)} onSubmit={handleAddMember} />}
      {showActivateMembership && <ActivateMembershipModal isOpen={showActivateMembership} onClose={() => setShowActivateMembership(false)} member={selectedMember} onSubmit={handleActivateMembership} />}
      {showRenewMembership && <RenewMembershipModal isOpen={showRenewMembership} onClose={() => setShowRenewMembership(false)} member={selectedMember} onSubmit={handleRenewMembership} />}
    </div>
  )
}
