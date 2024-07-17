'use client'

import { toast } from 'sonner'
import { useAction } from 'next-safe-action/hooks'

import { useSessionData } from '@/hooks/useSessionData'
import { resendEmailToken } from '@/server/actions/email-token.action'
import { Button } from '@/components/ui/button'
import { LoaderCircleIcon } from 'lucide-react'

export default function CallToVerify() {
  const { session } = useSessionData()
  const { status, executeAsync } = useAction(resendEmailToken)

  if (!session) return null

  const isVerified = !!session.user.emailVerified

  async function handleResendEmail() {
    if (!session || status === 'executing') return

    try {
      const response = await executeAsync({
        email: session.user.email,
        name: session.user.name ?? undefined,
      })

      if (response?.data?.success === true) {
        toast.success(response.data.message)
      } else if (response?.data?.success === false) {
        toast.error(response.data.message)
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return !isVerified ? (
    <div className="h-8 w-full bg-primary print:hidden">
      <div className="flex h-full items-center justify-center gap-3 px-2">
        <div className="flex flex-col gap-x-1 text-balance text-[10px] font-medium text-white sm:flex-row sm:text-xs">
          Your account is not verified.
          <strong className="font-semibold">Please verify your email address.</strong>
        </div>
        <Button
          size="none"
          className="gap-1.5 bg-white px-3 py-1 text-[10px] font-semibold text-primary transition-colors hover:bg-white disabled:opacity-70 sm:text-xs"
          onClick={handleResendEmail}
          disabled={status === 'executing'}
        >
          {status === 'executing' ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
          Resend email
        </Button>
      </div>
    </div>
  ) : null
}
