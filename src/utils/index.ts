import { twMerge } from 'tailwind-merge'
import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatCurrency(number: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(number)
}
