import os from 'os'

export async function GET() {
  const interfaces = os.networkInterfaces()

  let privateIP = 'Not Found'

  for (const name of Object.keys(interfaces)) {
    const ifaceArray = interfaces[name]
    if (ifaceArray) {
      for (const iface of ifaceArray) {
        if (iface.family === 'IPv4' && !iface.internal) {
          privateIP = iface.address
          break
        }
      }
    }
  }

  return Response.json({ privateIP })
}
