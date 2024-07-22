'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { BarChartIcon, PackageIcon, PenSquareIcon, SettingsIcon, TruckIcon } from 'lucide-react'

import { cn } from '@/utils'
import { useSessionData } from '@/hooks/useSessionData'

const navLinks = [
  {
    label: 'Profile',
    href: '/dashboard/profile',
    icon: SettingsIcon,
    adminRequired: false,
  },
  {
    label: 'Orders',
    href: '/dashboard/orders',
    icon: TruckIcon,
    adminRequired: false,
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChartIcon,
    adminRequired: true,
  },
  {
    label: 'Create',
    href: '/dashboard/products/create',
    icon: PenSquareIcon,
    adminRequired: true,
  },
  {
    label: 'Products',
    href: '/dashboard/products',
    icon: PackageIcon,
    adminRequired: true,
  },
] as const

export default function DashboardNav() {
  const MotionLink = motion(Link)

  const pathname = usePathname()
  const { session } = useSessionData()

  return (
    <nav className="my-4 flex overflow-x-auto py-2">
      <ul className="mx-auto flex gap-3 text-xs font-semibold md:gap-6">
        {navLinks.map((link) => {
          const Icon = link.icon

          return !link.adminRequired || (link.adminRequired && session && session.user.role === 'admin') ? (
            <li key={link.href} className="relative">
              <MotionLink
                className={cn('flex flex-col items-center gap-1 px-2 py-1', pathname === link.href && 'text-primary')}
                href={link.href}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="size-5" />
                {link.label}
              </MotionLink>
              <AnimatePresence>
                {pathname === link.href ? (
                  <motion.div
                    className="absolute -bottom-1 left-0 z-0 h-0.5 w-full rounded-full bg-primary"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    layoutId="underline"
                    transition={{ type: 'spring', stiffness: 35 }}
                  />
                ) : null}
              </AnimatePresence>
            </li>
          ) : null
        })}
      </ul>
    </nav>
  )
}
