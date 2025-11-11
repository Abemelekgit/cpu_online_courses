import { NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif'
}

export async function GET(
  _request: Request,
  { params }: { params: { filename: string } }
) {
  const safeFilename = path.basename(params.filename)
  const filePath = path.join(process.cwd(), 'picturesofcpucollegeonline', safeFilename)
  try {
    const file = await fs.readFile(filePath)
    const ext = path.extname(safeFilename).toLowerCase()
    const contentType = MIME_MAP[ext] || 'application/octet-stream'

  const uint8Array = new Uint8Array(file)

  return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400'
      }
    })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return new NextResponse('Not Found', { status: 404 })
    }

    console.error('Asset fetch error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
