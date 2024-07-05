'use client'

import { useFormStatus } from 'react-dom'

interface Props extends React.ComponentProps<'button'> {
  children: React.ReactNode
}

export default function Button({ children }: Props) {
  const { pending } = useFormStatus()

  return (
    <button disabled={pending} className="bg-blue-600 px-4 py-2 disabled:bg-blue-600/50">
      {children}
    </button>
  )
}
