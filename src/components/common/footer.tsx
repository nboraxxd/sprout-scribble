import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="my-16 px-4 text-center text-muted-foreground">
      <small className="block text-xs">
        The project is developed under the guidance of{' '}
        <Link href="https://developedbyed.com" target="_blank" className="underline">
          developedbyed
        </Link>
        . Here is the{' '}
        <Link href="https://www.ultimatenextjs.com" target="_blank" className="underline">
          course link
        </Link>
        .
      </small>
      <p className="mt-3 text-xs">
        <span className="text-balance font-semibold">About this website:</span> Built with Next.js, TypeScript, Auth.js
        v5, Tailwind CSS, Drizzle ORM, Zustand, Mailgun and much more.
      </p>
    </footer>
  )
}
