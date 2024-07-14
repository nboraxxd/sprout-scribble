'use client'

import { toast } from 'sonner'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

import { loginByToken } from '@/server/actions/user.action'

export default function LoginByToken({ token }: { token: string }) {
  const loginByEmailRef = useRef<unknown>(null)

  const router = useRouter()

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null

    if (!loginByEmailRef.current) {
      ;(async () => {
        loginByEmailRef.current = loginByToken

        try {
          const response = await loginByToken(token)

          if (response?.success === false) {
            toast.error(response.message)
            router.replace('/')
          }

          timeout = setTimeout(() => {
            loginByEmailRef.current = null
          }, 1000)
        } catch (error: any) {
          toast.error(error.message)
          router.replace('/')
        }
      })()
    }

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [router, token])

  return null
}
