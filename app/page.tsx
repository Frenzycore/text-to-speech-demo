'use client'

import { useState, useCallback } from 'react'
import { Navbar }         from '@/components/navbar'
import { Footer }         from '@/components/footer'
import { TTSInput }       from '@/components/tts-input'
import { AudioPlayer }    from '@/components/audio-player'
import { UserProvider, useUser }   from '@/lib/user-context'
import { ToastProvider, useToast } from '@/components/toast-provider'
import { generateSpeech }  from '@/lib/tts-service'
import { Volume2, Wand2, Globe, Zap } from 'lucide-react'
import Link from 'next/link'

function HomeContent() {
  const [audioUrl, setAudioUrl]         = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { useCharacters, getAvailableCharacters } = useUser()
  const { showToast } = useToast()

  const handleGenerate = async (text: string, voice: number, lang: number) => {
    const cost      = text.length
    const available = getAvailableCharacters()

    if (cost > available) {
      showToast('Saldo tidak cukup. Silakan top up terlebih dahulu.', 'error')
      return
    }

    setIsGenerating(true)

    const { audioUrl: generatedUrl, error } = await generateSpeech({ text, voice, lang })

    if (error) {
      showToast(error.message, 'error')
      setIsGenerating(false)
      return
    }

    if (!generatedUrl) {
      showToast('Gagal menghasilkan audio. Silakan coba lagi.', 'error')
      setIsGenerating(false)
      return
    }

    const success = useCharacters(cost)
    if (!success) {
      showToast('Saldo tidak cukup. Silakan top up terlebih dahulu.', 'error')
      setIsGenerating(false)
      return
    }

    if (audioUrl) URL.revokeObjectURL(audioUrl)

    setAudioUrl(generatedUrl)
    showToast('Audio berhasil di-generate!', 'success')
    setIsGenerating(false)
  }

  const handleError = useCallback((message: string) => {
    showToast(message, 'error')
  }, [showToast])

  const handleDownload = () => {
    if (!audioUrl) return
    const link    = document.createElement('a')
    link.href     = audioUrl
    link.download = `voicegen-${Date.now()}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Wand2 className="h-4 w-4" aria-hidden="true" />
            AI-Powered Text to Speech
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance">
            Ubah Teks Menjadi Suara Natural
          </h1>
          <p className="text-base md:text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Teknologi AI terdepan untuk menghasilkan suara yang jernih dan natural.
            Mendukung Bahasa Indonesia dan English dengan berbagai pilihan suara.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8 md:mb-12">
          {[
            { icon: Volume2, title: 'Suara Natural',  sub: 'Neural TTS Technology' },
            { icon: Globe,   title: 'Multi Bahasa',   sub: 'Indonesia & English'   },
            { icon: Zap,     title: 'Proses Cepat',   sub: 'Generate dalam detik'  },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium text-sm">{title}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-4 md:p-6 lg:p-8">
            <TTSInput
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              onError={handleError}
            />

            {audioUrl && (
              <div className="mt-6 pt-6 border-t border-border">
                <h2 className="text-sm font-medium text-muted-foreground mb-3">
                  Audio Hasil Generate
                </h2>
                <AudioPlayer audioUrl={audioUrl} onDownload={handleDownload} />
              </div>
            )}
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Butuh lebih banyak karakter?{' '}
            <Link href="/pricing" className="text-accent hover:underline">
              Lihat paket harga
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function Home() {
  return (
    <UserProvider>
      <ToastProvider>
        <HomeContent />
      </ToastProvider>
    </UserProvider>
  )
}
