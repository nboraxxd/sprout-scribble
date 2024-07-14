import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'

export default function useCurrentSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<'authenticated' | 'loading' | 'unauthenticated'>('loading')
  const retrieveSessionRef = useRef<unknown>(null)

  const pathname = usePathname()

  const retrieveSession = useCallback(async () => {
    try {
      const sessionData = await getSession()

      if (sessionData) {
        setSession(sessionData)
        setStatus('authenticated')
        return
      }

      setStatus('unauthenticated')
    } catch (error) {
      setStatus('unauthenticated')
      setSession(null)
    }
  }, [])

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null

    // We only want to retrieve the session when there is no session
    if (!session && !retrieveSessionRef.current) {
      ;(async () => {
        retrieveSessionRef.current = retrieveSession

        await retrieveSession()

        timeout = setTimeout(() => {
          retrieveSessionRef.current = null
        }, 1000)
      })()
    }

    return () => {
      if (timeout) clearTimeout(timeout)
    }

    // use the pathname to force a re-render when the user navigates to a new page
  }, [retrieveSession, session, pathname])

  return { session, status }
}
