'use client'

import Link from 'next/link'
import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import { CircleUserRoundIcon, LogInIcon } from 'lucide-react'

import useCurrentSession from '@/hooks/use-current-session'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function AuthButton() {
  const { session, status } = useCurrentSession()

  if (status === 'loading') return <Skeleton className="size-10" />

  return status === 'authenticated' && session ? (
    <UserButton user={session.user} expires={session.expires} />
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

function UserButton({ user }: Session) {
  return (
    <div>
      {user?.email}
      <button onClick={() => signOut()}>sign out</button>
    </div>
  )
}
