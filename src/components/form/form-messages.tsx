import { AlertCircleIcon, CheckCircle2Icon } from 'lucide-react'

interface Props {
  successMessage?: string
  errorMessage?: string
}

export default function FormMessages({ successMessage, errorMessage }: Props) {
  if (!successMessage && !errorMessage) return null

  return successMessage ? (
    <div className="my-2 flex items-center gap-2 rounded-md bg-teal-400/25 p-3 text-xs font-medium text-secondary-foreground">
      <CheckCircle2Icon className="size-4" />
      <p>{successMessage}</p>
    </div>
  ) : (
    <div className="my-4 flex items-center gap-2 rounded-md bg-destructive/25 p-3 text-xs font-medium text-secondary-foreground">
      <AlertCircleIcon className="size-4" />
      <p>{errorMessage}</p>
    </div>
  )
}
