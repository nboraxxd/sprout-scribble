'use client'

import { toast } from 'sonner'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

import { MessageResponse } from '@/types'

export default function LoginByToken({ response }: { response: MessageResponse | undefined }) {
  const messageRef = useRef<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null

    if (!messageRef.current && response && response.success === false) {
      messageRef.current = response.message

      toast.error(response.message)
      router.push('/')
      router.refresh()

      timeout = setTimeout(() => {
        messageRef.current = null
      }, 1000)
    }

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [response, router])

  return null
}
