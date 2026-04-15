export interface Voice {
  id:          number
  name:        string
  description: string
  audio:       string
}

export interface Language {
  id:   number
  name: string
}

export interface TTSError {
  type:    'network' | 'auth' | 'rate_limit' | 'server' | 'unknown'
  message: string
  status?: number
}

export async function fetchVoices(): Promise<{
  voices:    Voice[]
  languages: Language[]
  error:     TTSError | null
}> {
  try {
    const response = await fetch('/api/voices')

    if (!response.ok) {
      return { voices: [], languages: [], error: handleApiError(response.status) }
    }

    const data = await response.json()

    const voices: Voice[] = (data.voices ?? []).map((v: { id: number; name: string }) => {
      const detail = (data.details ?? []).find((d: { id: number }) => d.id === v.id) ?? {}
      return {
        id:          v.id,
        name:        v.name,
        description: (detail as { description?: string }).description ?? '',
        audio:       (detail as { audio?: string }).audio ?? '',
      }
    })

    const languages: Language[] = (data.languages ?? []).map(
      (l: { id: number; name: string }) => ({ id: l.id, name: l.name })
    )

    return { voices, languages, error: null }
  } catch {
    return {
      voices:    [],
      languages: [],
      error: {
        type:    'network',
        message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
      },
    }
  }
}

export async function generateSpeech(params: {
  text:    string
  voice:   number
  lang?:   number
  reverb?: boolean
}): Promise<{ audioUrl: string | null; error: TTSError | null }> {
  try {
    const response = await fetch('/api/tts', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        text:   params.text,
        voice:  params.voice,
        lang:   params.lang ?? 0,
        reverb: params.reverb ?? false,
      }),
    })

    if (!response.ok) {
      return { audioUrl: null, error: handleApiError(response.status) }
    }

    const blob     = await response.blob()
    const audioUrl = URL.createObjectURL(blob)
    return { audioUrl, error: null }
  } catch {
    return {
      audioUrl: null,
      error: {
        type:    'network',
        message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
      },
    }
  }
}

function handleApiError(status: number): TTSError {
  switch (status) {
    case 401:
      return { type: 'auth',       status, message: 'API key tidak valid. Silakan hubungi administrator.' }
    case 403:
      return { type: 'auth',       status, message: 'Akses ditolak. API key tidak diizinkan.' }
    case 429:
      return { type: 'rate_limit', status, message: 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.' }
    case 500:
    case 502:
    case 503:
    case 504:
      return { type: 'server',     status, message: 'Server sedang bermasalah. Silakan coba lagi nanti.' }
    default:
      return { type: 'unknown',    status, message: `Terjadi kesalahan (${status}). Silakan coba lagi.` }
  }
}
