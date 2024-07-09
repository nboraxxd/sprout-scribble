'use client'

import { toast } from 'sonner'
import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { loginByEmailToken } from '@/server/actions/user.action'

export default function LoginByToken() {
  const loginByEmailRef = useRef<unknown>(null)

  const router = useRouter()
  const token = useSearchParams().get('token')

  useEffect(() => {
    if (!token) return router.replace('/')

    let timeout: NodeJS.Timeout | null = null

    if (!loginByEmailRef.current) {
      ;(async () => {
        loginByEmailRef.current = loginByEmailToken

        try {
          const response = await loginByEmailToken(token)

          if (!response.success) {
            toast.error(response.message)
          }

          timeout = setTimeout(() => {
            loginByEmailRef.current = null
          }, 1000)
        } catch (error: any) {
          toast.error(error.message)
        } finally {
          router.replace('/')
          router.refresh()
        }
      })()
    }

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [router, token])

  return null
}
