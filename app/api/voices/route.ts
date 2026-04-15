import { NextResponse } from 'next/server'

const TTS_BASE_URL = process.env.TTS_API_BASE_URL || 'https://text-to-speech.ornzora.eu.cc'
const TTS_API_KEY  = process.env.TTS_API_KEY      || 'core'

export async function GET() {
  try {
    const upstream = await fetch(`${TTS_BASE_URL}/voices`, {
      headers: { 'x-api-key': TTS_API_KEY },
      next:    { revalidate: 3600 },
    })

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream error ${upstream.status}.` },
        { status: upstream.status }
      )
    }

    const data = await upstream.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[/api/voices]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
