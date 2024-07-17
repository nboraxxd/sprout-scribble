import { Metadata } from 'next'

import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Home',
}

export default function Homepage() {
  return (
    <div>
      <Button>Click me</Button>
    </div>
  )
}
