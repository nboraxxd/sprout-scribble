import { CircleUserRoundIcon, LogInIcon, ShoppingBagIcon } from 'lucide-react'

import { auth } from '@/server/auth'
import { Button } from '@/components/ui/button'
import { UserButton } from '@/components/common'
import { LogoTextIcon } from '@/components/icons'
import Link from 'next/link'

export default async function Header() {
  const session = await auth()

  return (
    <header className="flex h-header-height items-center gap-4">
      <LogoTextIcon />

      <ul className="ml-auto flex items-center gap-4">
        <li>
          <Button size="icon" variant="ghost">
            <ShoppingBagIcon />
          </Button>
        </li>
        <li>
          {session ? (
            <UserButton user={session.user} expires={session.expires} />
          ) : (
            <Button className="w-10 gap-1.5 max-md:p-0 md:w-auto" asChild>
              <Link href="/auth/login">
                <CircleUserRoundIcon className="size-5 md:hidden" />
                <LogInIcon className="hidden size-5 md:block" />
                <span className="hidden md:inline">Log In</span>
              </Link>
            </Button>
          )}
        </li>
      </ul>
    </header>
  )
}
