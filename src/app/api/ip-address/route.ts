import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const privateIP = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]
  console.log('🔥 ~ GET ~ privateIP:', privateIP)

  return NextResponse.json({ privateIP })
}
