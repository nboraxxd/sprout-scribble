'use client'

import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'

export default function UserButton({ user }: Session) {
  return (
    <div>
      {user?.email}
      <button onClick={() => signOut()}>sign out</button>
    </div>
  )
}
