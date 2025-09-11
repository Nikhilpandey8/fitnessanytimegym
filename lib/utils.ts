import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateEndDate(startDate: string, durationLabel: string): string {
  const start = dayjs(startDate);
  
  switch (durationLabel.toLowerCase()) {
    case '1 month':
      return start.add(1, 'month').format('YYYY-MM-DD');
    case '3 months':
      return start.add(3, 'month').format('YYYY-MM-DD');
    case '1 year':
      return start.add(1, 'year').format('YYYY-MM-DD');
    default:
      return start.add(1, 'month').format('YYYY-MM-DD');
  }
}

export function isExpired(endDate: string): boolean {
  return dayjs().isAfter(dayjs(endDate));
}

export function isExpiringSoon(endDate: string, days = 7): boolean {
  const expiry = dayjs(endDate);
  const warning = dayjs().add(days, 'day');
  return expiry.isBefore(warning) && !isExpired(endDate);
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function formatDate(date: string): string {
  return dayjs(date).format('DD/MM/YYYY');
}