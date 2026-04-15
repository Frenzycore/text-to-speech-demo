"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Download, Volume2, VolumeX } from "lucide-react"

interface AudioPlayerProps {
  audioUrl:    string
  onDownload?: () => void
}

export function AudioPlayer({ audioUrl, onDownload }: AudioPlayerProps) {
  const [isPlaying,   setIsPlaying]   = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration,    setDuration]    = useState(0)
  const [volume,      setVolume]      = useState([0.8])
  const [isMuted,     setIsMuted]     = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Reset all playback state whenever a new audio URL is provided.
  useEffect(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
  }, [audioUrl])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onMeta    = () => setDuration(audio.duration)
    const onTime    = () => setCurrentTime(audio.currentTime)
    const onEnded   = () => { setIsPlaying(false); setCurrentTime(0) }
    const onError   = () => setIsPlaying(false)

    audio.addEventListener("loadedmetadata", onMeta)
    audio.addEventListener("timeupdate",     onTime)
    audio.addEventListener("ended",          onEnded)
    audio.addEventListener("error",          onError)

    return () => {
      audio.removeEventListener("loadedmetadata", onMeta)
      audio.removeEventListener("timeupdate",     onTime)
      audio.removeEventListener("ended",          onEnded)
      audio.removeEventListener("error",          onError)
    }
  }, [audioUrl])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0]
    }
  }, [volume, isMuted])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().catch(() => setIsPlaying(false))
      setIsPlaying(true)
    }
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return "0:00"
    const m = Math.floor(time / 60)
    const s = Math.floor(time % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div
      className="bg-secondary/50 border border-border rounded-lg p-4 space-y-4"
      role="region"
      aria-label="Audio player"
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Play/Pause */}
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlay}
          className="h-12 w-12 rounded-full border-accent text-accent hover:bg-accent hover:text-accent-foreground shrink-0"
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying
            ? <Pause className="h-5 w-5"       aria-hidden="true" />
            : <Play  className="h-5 w-5 ml-0.5" aria-hidden="true" />
          }
        </Button>

        {/* Progress */}
        <div className="flex-1 w-full space-y-1">
          <Slider
            value={[currentTime]}
            onValueChange={handleSeek}
            max={duration || 100}
            step={0.1}
            className="cursor-pointer"
            aria-label="Audio progress"
          />
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="h-8 w-8"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted
              ? <VolumeX className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              : <Volume2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            }
          </Button>
          <Slider
            value={isMuted ? [0] : volume}
            onValueChange={setVolume}
            max={1}
            step={0.1}
            className="w-20"
            aria-label="Volume"
          />
        </div>

        {/* Download */}
        <Button
          variant="outline"
          size="icon"
          onClick={onDownload}
          className="border-border hover:border-accent hover:text-accent shrink-0"
          aria-label="Download audio"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
