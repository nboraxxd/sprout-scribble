'use client'

import { signIn } from 'next-auth/react'

import { Button } from '@/components/ui/button'
import { GithubIcon, GoogleIcon } from '@/components/icons'

export default function Socials() {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Button
        variant={'outline'}
        className="flex w-full gap-1.5"
        onClick={() =>
          signIn('google', {
            redirect: false,
            callbackUrl: '/',
          })
        }
      >
        <GoogleIcon className="size-5" />
        <span>Log in with Google</span>
      </Button>
      <Button
        className="flex w-full gap-1.5"
        variant={'outline'}
        onClick={() =>
          signIn('github', {
            redirect: false,
            callbackUrl: '/',
          })
        }
      >
        <GithubIcon className="size-5" />
        <span>Log in with Github</span>
      </Button>
    </div>
  )
}
