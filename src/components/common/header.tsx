import Link from 'next/link'
import { ShoppingBagIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AuthButton } from '@/components/common'
import { LogoTextIcon } from '@/components/icons'

export default async function Header() {
  return (
    <header className="flex h-header-height items-center gap-4">
      <Link href="/">
        <LogoTextIcon />
      </Link>
      <Link href="/register">Register</Link>

      <ul className="ml-auto flex items-center gap-4">
        <li>
          <Button size="icon" variant="ghost">
            <ShoppingBagIcon />
          </Button>
        </li>
        <li>
          <AuthButton />
        </li>
      </ul>
    </header>
  )
}
