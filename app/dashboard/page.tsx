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
import { useRouter } from 'next/navigation'

interface MemberWithMemberships extends Member {
  memberships: Membership[]
}

export default function Dashboard() {
  const [expandedStat, setExpandedStat] = useState<string | null>(null)

  // Helper to get members by status
  const getMembersByStatus = (status: string) => {
    switch (status) {
      case 'active':
        return members.filter(m => m.memberships.some(ms => ms.status === 'active'))
      case 'hold':
        return members.filter(m => m.memberships.some(ms => ms.status === 'hold'))
      case 'expired':
        return members.filter(m => m.memberships.some(ms => ms.status === 'expired'))
      case 'total':
        return members
      default:
        return []
    }
  }
  const [members, setMembers] = useState<MemberWithMemberships[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddMember, setShowAddMember] = useState(false)
  const [showActivateMembership, setShowActivateMembership] = useState(false)
  const [showRenewMembership, setShowRenewMembership] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const router = useRouter()

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

  // Helper to trigger backend status update
  const notifyMemberships = async () => {
    try {
      await fetch('/api/memberships/notify', { method: 'POST' })
    } catch (error) {
      console.error('Error notifying memberships:', error)
    }
  }

  const handleAddMember = async (memberData: { full_name: string; phone?: string; email: string; notes?: string }) => {
    try {
      console.log('Adding member:', memberData)
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      })
      
      const result = await response.json()
      console.log('Add member response:', result)
      
      if (response.ok) {
        console.log('Member added successfully, refreshing list')
        fetchMembers()
      } else {
        console.error('Failed to add member:', result)
        throw new Error(result.error || 'Failed to add member')
      }
    } catch (error) {
      console.error('Error adding member:', error)
      throw error
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
      // Find the active or most recent membership
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
        await notifyMemberships()
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
        await notifyMemberships()
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
        await notifyMemberships()
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
        await notifyMemberships()
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
    try {
      console.log('Logging out...')
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      const result = await response.json()
      console.log('Logout response:', result)
      
      if (response.ok) {
        console.log('Logout successful, redirecting to login')
        router.push('/login')
      } else {
        console.error('Logout failed:', result)
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (statusFilter === 'all') return matchesSearch
    
    const activeMembership = member.memberships.find(m => m.status === 'active') ||
                            member.memberships.find(m => m.status === 'hold') ||
                            member.memberships[0]
    const memberStatus = activeMembership?.status || 'inactive'
    return matchesSearch && memberStatus === statusFilter
  })

  const stats = {
    total: members.length,
    active: members.filter(m => m.memberships.some(membership => membership.status === 'active')).length,
    expired: members.filter(m => m.memberships.some(membership => membership.status === 'expired')).length,
    onHold: members.filter(m => m.memberships.some(membership => membership.status === 'hold')).length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  FitnessAnytime
                </h1>
                <div className="hidden sm:block text-gray-400 text-sm">
                  Admin Dashboard
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setShowAddMember(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
                
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Members Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-black/20 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 cursor-pointer ${expandedStat === 'total' ? 'ring-2 ring-purple-400' : ''}`}
              onClick={() => setExpandedStat(expandedStat === 'total' ? null : 'total')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Members</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </motion.div>

            {/* Active Members Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`bg-black/20 backdrop-blur-sm border border-green-500/20 rounded-xl p-6 cursor-pointer ${expandedStat === 'active' ? 'ring-2 ring-green-400' : ''}`}
              onClick={() => setExpandedStat(expandedStat === 'active' ? null : 'active')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active</p>
                  <p className="text-2xl font-bold text-green-400">{stats.active}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-400" />
              </div>
            </motion.div>

            {/* On Hold Members Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`bg-black/20 backdrop-blur-sm border border-yellow-500/20 rounded-xl p-6 cursor-pointer ${expandedStat === 'hold' ? 'ring-2 ring-yellow-400' : ''}`}
              onClick={() => setExpandedStat(expandedStat === 'hold' ? null : 'hold')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">On Hold</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.onHold}</p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-400" />
              </div>
            </motion.div>

            {/* Expired Members Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`bg-black/20 backdrop-blur-sm border border-red-500/20 rounded-xl p-6 cursor-pointer ${expandedStat === 'expired' ? 'ring-2 ring-red-400' : ''}`}
              onClick={() => setExpandedStat(expandedStat === 'expired' ? null : 'expired')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Expired</p>
                  <p className="text-2xl font-bold text-red-400">{stats.expired}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </motion.div>
          </div>

          {/* Expanded Member List */}
          {expandedStat && (
            <div className="bg-black/30 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-bold mb-4 text-white">
                {expandedStat === 'total' && 'All Members'}
                {expandedStat === 'active' && 'Active Members'}
                {expandedStat === 'hold' && 'On Hold Members'}
                {expandedStat === 'expired' && 'Expired Members'}
              </h3>
              <ul className="space-y-2">
                {getMembersByStatus(expandedStat).length === 0 ? (
                  <li className="text-gray-400">No members found.</li>
                ) : (
                  getMembersByStatus(expandedStat).map((m) => (
                    <li key={m.id} className="text-white font-medium bg-gray-800/40 rounded px-4 py-2">
                      {m.full_name}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}

          {/* Search and Filter */}
          <div className="bg-black/20 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/30 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="pl-10 w-48 bg-black/30 border-gray-600 text-white focus:border-purple-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="hold">On Hold</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MemberCard
                  member={member}
                  onActivate={(member) => {
                    setSelectedMember(member)
                    setShowActivateMembership(true)
                  }}
                  onRenew={(member) => {
                    setSelectedMember(member)
                    setShowRenewMembership(true)
                  }}
                  onHold={handleHoldMembership}
                  onResume={handleResumeMembership}
                  onDeactivate={handleDeactivateMembership}
                  onViewSlip={handleViewSlip}
                />
              </motion.div>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No members found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first member'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onSubmit={handleAddMember}
      />

      <ActivateMembershipModal
        isOpen={showActivateMembership}
        onClose={() => {
          setShowActivateMembership(false)
          setSelectedMember(null)
        }}
        member={selectedMember}
        onSubmit={handleActivateMembership}
      />

      <RenewMembershipModal
        isOpen={showRenewMembership}
        onClose={() => {
          setShowRenewMembership(false)
          setSelectedMember(null)
        }}
        member={selectedMember}
        onSubmit={handleRenewMembership}
      />
    </div>
  )
}