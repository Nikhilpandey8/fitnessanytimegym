import { z } from 'zod'

export const memberSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

export const membershipSchema = z.object({
  member_id: z.string().uuid(),
  start_date: z.string(),
  duration_label: z.string(),
  fee_amount: z.number().positive('Fee amount must be positive'),
})

export const paymentSchema = z.object({
  member_id: z.string().uuid(),
  membership_id: z.string().uuid().optional(),
  amount: z.number().positive('Amount must be positive'),
  note: z.string().optional(),
})

export type MemberInput = z.infer<typeof memberSchema>
export type MembershipInput = z.infer<typeof membershipSchema>
export type PaymentInput = z.infer<typeof paymentSchema>