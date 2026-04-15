'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Textarea }  from '@/components/ui/textarea'
import { Button }    from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label }     from '@/components/ui/label'
import { Spinner }   from '@/components/ui/spinner'
import { Skeleton }  from '@/components/ui/skeleton'
import { Type, Volume2, Play, Square } from 'lucide-react'
import { useUser }   from '@/lib/user-context'
import { fetchVoices, type Voice, type Language } from '@/lib/tts-service'
import { cn }        from '@/lib/utils'
import Link          from 'next/link'

function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num)
}

interface TTSInputProps {
  onGenerate:   (text: string, voice: number, lang: number) => Promise<void>
  isGenerating: boolean
  onError?:     (message: string) => void
}

export function TTSInput({ onGenerate, isGenerating, onError }: TTSInputProps) {
  const [text, setTextState]                    = useState('')
  const [selectedVoiceId, setSelectedVoiceId]   = useState<number>(0)
  const [selectedLangId, setSelectedLangId]     = useState<number>(0)
  const [voices, setVoices]                     = useState<Voice[]>([])
  const [languages, setLanguages]               = useState<Language[]>([])
  const [isLoadingVoices, setIsLoadingVoices]   = useState(true)
  const [voiceError, setVoiceError]             = useState<string | null>(null)
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)
  const [mounted, setMounted]                   = useState(false)
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)
  const onErrorRef      = useRef(onError)

  const { getAvailableCharacters, isLoading: isUserLoading } = useUser()

  useEffect(() => { onErrorRef.current = onError }, [onError])
  useEffect(() => { setMounted(true) }, [])

  const characterLimit = getAvailableCharacters()
  const characterCount = text.length
  const percentUsed    = characterLimit > 0 ? (characterCount / characterLimit) * 100 : 0
  const isOverLimit    = characterCount >= characterLimit
  const isNearLimit    = percentUsed >= 80 && percentUsed < 100
  const isEmpty        = text.trim().length === 0

  const getBorderClass = () => {
    if (isOverLimit) return 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20'
    if (isNearLimit) return 'border-yellow-500 focus-within:border-yellow-500 focus-within:ring-yellow-500/20'
    return 'border-border focus-within:border-accent focus-within:ring-accent/20'
  }

  const currentVoice = voices.find((v) => v.id === selectedVoiceId)

  const reportError = useCallback((message: string) => {
    onErrorRef.current?.(message)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoadingVoices(true)
      setVoiceError(null)

      const { voices: fetched, languages: fetchedLangs, error } = await fetchVoices()

      if (cancelled) return

      if (error) {
        setVoiceError(error.message)
        reportError(error.message)
      } else {
        setVoices(fetched)
        setLanguages(fetchedLangs)
        if (fetched.length > 0)      setSelectedVoiceId(fetched[0].id)
        if (fetchedLangs.length > 0) setSelectedLangId(fetchedLangs[0].id)
      }

      setIsLoadingVoices(false)
    }

    load()
    return () => { cancelled = true }
  }, [reportError])

  useEffect(() => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause()
      previewAudioRef.current = null
      setIsPreviewPlaying(false)
    }
  }, [selectedVoiceId])

  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause()
        previewAudioRef.current = null
      }
    }
  }, [])

  const handlePreview = () => {
    if (!currentVoice?.audio) return

    if (isPreviewPlaying && previewAudioRef.current) {
      previewAudioRef.current.pause()
      previewAudioRef.current.currentTime = 0
      setIsPreviewPlaying(false)
      return
    }

    const audio = new Audio(currentVoice.audio)
    audio.onended = () => setIsPreviewPlaying(false)
    audio.onerror = () => {
      setIsPreviewPlaying(false)
      reportError('Gagal memutar preview audio.')
    }

    previewAudioRef.current = audio
    audio.play().catch(() => {
      setIsPreviewPlaying(false)
      reportError('Gagal memutar preview audio.')
    })
    setIsPreviewPlaying(true)
  }

  const canGenerate = !isEmpty && !isOverLimit && !isGenerating && voices.length > 0

  const handleGenerate = async () => {
    if (isOverLimit) {
      reportError('Batas karakter terlampaui. Persingkat teks atau top up saldo.')
      return
    }
    if (!canGenerate) return
    await onGenerate(text, selectedVoiceId, selectedLangId)
  }

  const showLoading = isLoadingVoices || isUserLoading || !mounted

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className={cn('rounded-lg border transition-colors', getBorderClass())}>
          <Textarea
            placeholder="Masukkan teks yang ingin diubah menjadi suara..."
            value={text}
            onChange={(e) => setTextState(e.target.value)}
            disabled={isGenerating}
            className={cn(
              'min-h-[200px] resize-none text-base bg-card border-0 focus-visible:ring-0',
              'placeholder:text-muted-foreground/60'
            )}
            aria-label="Teks untuk diubah menjadi suara"
            aria-describedby="char-counter"
          />
        </div>
        <div className="flex items-center justify-between text-sm" id="char-counter">
          <div className="flex items-center gap-1.5">
            <Type className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            {mounted ? (
              <span className={cn(
                'tabular-nums transition-colors',
                isOverLimit ? 'text-red-500 font-medium' : 'text-muted-foreground'
              )}>
                {formatNumber(characterCount)} / {formatNumber(characterLimit)} karakter
              </span>
            ) : (
              <Skeleton className="h-4 w-32" />
            )}
          </div>
          {isOverLimit && (
            <Link href="/pricing" className="text-sm text-accent hover:underline">
              Top up saldo
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-muted-foreground">
            <Volume2 className="h-4 w-4" aria-hidden="true" />
            Pilih Suara
          </Label>
          {showLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : voiceError ? (
            <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {voiceError}
            </div>
          ) : (
            <Select
              value={String(selectedVoiceId)}
              onValueChange={(v) => setSelectedVoiceId(Number(v))}
              disabled={isGenerating}
            >
              <SelectTrigger className="bg-card border-border" aria-label="Pilih suara">
                <SelectValue placeholder="Pilih suara" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((v) => (
                  <SelectItem key={v.id} value={String(v.id)}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-muted-foreground">
            Bahasa
          </Label>
          {showLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : languages.length === 0 ? (
            <div className="h-10 flex items-center text-sm text-muted-foreground">
              Tidak ada bahasa tersedia
            </div>
          ) : (
            <Select
              value={String(selectedLangId)}
              onValueChange={(v) => setSelectedLangId(Number(v))}
              disabled={isGenerating}
            >
              <SelectTrigger className="bg-card border-border" aria-label="Pilih bahasa">
                <SelectValue placeholder="Pilih bahasa" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((l) => (
                  <SelectItem key={l.id} value={String(l.id)}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {currentVoice && (
        <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
          {currentVoice.description && (
            <p className="text-sm text-muted-foreground">{currentVoice.description}</p>
          )}
          {currentVoice.audio && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              disabled={isGenerating}
              className="gap-2"
              aria-label={isPreviewPlaying ? 'Stop preview' : 'Play voice preview'}
            >
              {isPreviewPlaying ? (
                <>
                  <Square className="h-3 w-3" aria-hidden="true" />
                  Stop Preview
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" aria-hidden="true" />
                  Preview Suara
                </>
              )}
            </Button>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate}
          size="lg"
          className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
          aria-busy={isGenerating}
        >
          {isGenerating ? (
            <>
              <Spinner className="h-4 w-4" aria-hidden="true" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4" aria-hidden="true" />
              <span>Generate Audio</span>
            </>
          )}
        </Button>

        {isOverLimit && (
          <p className="text-sm text-red-500 sm:self-center" role="alert">
            Batas karakter terlampaui
          </p>
        )}
      </div>
    </div>
  )
}
