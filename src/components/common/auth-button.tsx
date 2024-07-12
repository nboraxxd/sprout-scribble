'use client'

import Link from 'next/link'
import Image from 'next/image'
import { User } from 'next-auth'
import { useTheme } from 'next-themes'
import { signOut } from 'next-auth/react'
import { cva } from 'class-variance-authority'
import { CircleUserRoundIcon, LogInIcon, LogOutIcon, MoonIcon, SettingsIcon, SunIcon, TruckIcon } from 'lucide-react'

import { capitalizeFirstLetter, cn } from '@/utils'
import useCurrentSession from '@/hooks/use-current-session'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function AuthButton() {
  const { session, status } = useCurrentSession()

  if (status === 'loading') return <Skeleton className="size-10" />

  return status === 'authenticated' && session ? (
    <UserButton user={session.user} />
  ) : (
    <Button className="w-10 gap-1.5 max-md:p-0 md:w-auto" asChild>
      <Link href="/login">
        <CircleUserRoundIcon className="size-5 md:hidden" />
        <LogInIcon className="hidden size-5 md:block" />
        <span className="hidden md:inline">Log In</span>
      </Link>
    </Button>
  )
}

function UserButton({ user }: { user?: User }) {
  const { theme, setTheme } = useTheme()

  return user ? (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer" asChild>
        <Button variant="ghost" size="icon">
          <UserAvatar user={user} variant="square" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-4 font-medium" align="end">
        <DropdownMenuLabel className="mb-4 flex flex-col items-center gap-1 rounded-lg bg-primary/25 p-4 text-xs">
          <UserAvatar user={user} />
          <p className="mt-1 line-clamp-1">{user.name}</p>
          <p className="line-clamp-1 font-medium text-secondary-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="group cursor-pointer gap-2 transition-colors focus:text-primary">
              <TruckIcon className="size-3.5 transition-transform group-hover:translate-x-1" />
              My orders
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="group cursor-pointer gap-2 transition-colors focus:text-primary">
              <SettingsIcon className="size-3.5 transition-transform group-hover:rotate-180" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <button
              className="group w-full cursor-pointer gap-2 transition-colors focus:text-primary"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              <SunIcon className="size-3.5 rotate-0 scale-100 transition-transform group-hover:rotate-180 dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute size-3.5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
              {theme ? `${capitalizeFirstLetter(theme)} mode` : 'Light/Dark'}
            </button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <button
            onClick={() => signOut()}
            className="group w-full cursor-pointer gap-2 transition-colors focus:text-primary"
          >
            <LogOutIcon className="size-3.5 transition-transform group-hover:scale-90" />
            Log out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null
}

function UserAvatar({ user, variant }: { user: User; variant?: 'square' }) {
  const variantOptions = cva('', {
    variants: {
      variant: {
        square: 'rounded-md',
      },
    },
  })

  return (
    <Avatar className={cn(variantOptions({ variant }))}>
      {user.image ? (
        <Image
          src={user.image}
          alt={user.name || 'User avatar'}
          width={40}
          height={40}
          className="relative flex size-full shrink-0 overflow-hidden"
          priority
        />
      ) : (
        <AvatarFallback className={cn(variantOptions({ variant }), 'rounded-md text-lg font-semibold')}>
          {user.name ? user.name.charAt(0).toLocaleUpperCase() : user.email?.charAt(0).toLocaleUpperCase()}
        </AvatarFallback>
      )}
    </Avatar>
  )
}
