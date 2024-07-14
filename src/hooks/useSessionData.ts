'use client'

import { useContext } from 'react'
import type { Session } from 'next-auth'
import { SessionContext, type TSessionContextValue } from '@/components/provider/session-data-provider'

/**
 * Retrieve session data from the SessionContext for client side usage only.
 * Content:
 * ```
 *   {
 *     data: session [Session | null]
 *     status: 'authenticated' | 'unauthenticated' | 'loading'
 *     update: (data?: any) => Promise<Session | null | undefined>
 *   }
 * ```
 *
 * @throws {Error} - If React Context is unavailable in Server Components.
 * @throws {Error} - If `useSessionData` is not wrapped in a <SessionDataProvider /> where the error message is shown only in development mode.
 *
 * @returns {TSessionContextValue} - The session data obtained from the SessionContext.
 */
export function useSessionData(): TSessionContextValue {
  if (!SessionContext) {
    throw new Error('React Context is unavailable in Server Components')
  }

  const sessionContent: TSessionContextValue = useContext(SessionContext) || {
    data: null,
    status: 'unauthenticated',
    async update(): Promise<Session | null | undefined> {
      return undefined
    },
  }

  if (!sessionContent && process.env.NODE_ENV !== 'production') {
    throw new Error('[auth-wrapper-error]: `useSessionData` must be wrapped in a <SessionDataProvider />')
  }

  return sessionContent
}
