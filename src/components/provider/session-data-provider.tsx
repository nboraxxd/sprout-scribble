'use client'

import React, { Context, createContext, type PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { Session } from 'next-auth'
import { getCsrfToken } from 'next-auth/react'

/**
 * Provider props
 */
type TSessionProviderProps = PropsWithChildren<{
  session?: Session | null
}>

/**
 * Type of the returned Provider elements with data which contains session data, status that shows the state of the Provider, and update which is the function to update session data
 */
type TUpdateSession = (data?: any) => Promise<Session | null | undefined>
export type TSessionContextValue = { data: Session | null; status: string; update: TUpdateSession }

/**
 * React context to keep session through renders
 */
export const SessionContext: Context<TSessionContextValue | undefined> = createContext?.<
  TSessionContextValue | undefined
>(undefined)

export default function SessionDataProvider({ session: initialSession = null, children }: TSessionProviderProps) {
  const [session, setSession] = useState<Session | null>(initialSession)
  const [loading, setLoading] = useState<boolean>(!initialSession)
  const pathname: string = usePathname()

  useEffect(() => {
    const fetchSession = async () => {
      if (!initialSession) {
        // Retrive data from session callback
        const fetchedSessionResponse: Response = await fetch('/api/auth/session')
        const fetchedSession: Session | null = await fetchedSessionResponse.json()

        setSession(fetchedSession)
        setLoading(false)
      }
    }

    fetchSession().finally()
  }, [initialSession, pathname])

  const sessionData = useMemo(
    () => ({
      data: session,
      status: loading ? 'loading' : session ? 'authenticated' : 'unauthenticated',
      async update(data?: any) {
        if (loading || !session) return

        setLoading(true)

        const fetchOptions: RequestInit = {
          headers: {
            'Content-Type': 'application/json',
          },
        }

        if (data) {
          fetchOptions.method = 'POST'
          // That is possible to replace getCsrfToken with a fetch to /api/auth/csrf
          fetchOptions.body = JSON.stringify({ csrfToken: await getCsrfToken(), data })
        }

        const fetchedSessionResponse: Response = await fetch('/api/auth/session', fetchOptions)
        let fetchedSession: Session | null = null

        if (fetchedSessionResponse.ok) {
          fetchedSession = await fetchedSessionResponse.json()

          setSession(fetchedSession)
          setLoading(false)
        }

        return fetchedSession
      },
    }),
    [loading, session]
  )

  return <SessionContext.Provider value={sessionData}>{children}</SessionContext.Provider>
}
