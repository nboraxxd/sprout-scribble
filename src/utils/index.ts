import { IncomingMessage } from 'http'
import { twMerge } from 'tailwind-merge'
import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export async function getServerSideProps({ req }: { req: IncomingMessage }) {
  const forwarded = req.headers['x-forwarded-for']
  const ip = forwarded ? (forwarded as string).split(/, /)[0] : req.socket.remoteAddress
  return {
    props: {
      ip,
    },
  }
}
