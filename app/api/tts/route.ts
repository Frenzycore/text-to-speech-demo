import { NextRequest, NextResponse } from 'next/server'

const TTS_BASE_URL = process.env.TTS_API_BASE_URL || 'https://text-to-speech.ornzora.eu.cc'
const TTS_API_KEY  = process.env.TTS_API_KEY      || 'core'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, voice, lang, reverb } = body

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required.' }, { status: 400 })
    }

    const upstream = await fetch(`${TTS_BASE_URL}/tts`, {
      method:  'POST',
      headers: {
        'x-api-key':    TTS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text:   text.trim(),
        voice:  Number(voice  ?? 0),
        lang:   Number(lang   ?? 0),
        reverb: reverb === true,
      }),
    })

    if (!upstream.ok) {
      const errorText = await upstream.text().catch(() => '')
      return NextResponse.json(
        { error: errorText || `Upstream error ${upstream.status}.` },
        { status: upstream.status }
      )
    }

    const audioBuffer = await upstream.arrayBuffer()

    return new NextResponse(audioBuffer, {
      status:  200,
      headers: {
        'Content-Type':   upstream.headers.get('content-type') || 'audio/mpeg',
        'Content-Length': String(audioBuffer.byteLength),
        'Cache-Control':  'no-cache',
      },
    })
  } catch (err) {
    console.error('[/api/tts]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
