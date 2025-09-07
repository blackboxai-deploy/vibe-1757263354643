'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface VideoPlayerProps {
  videoUrl: string
}

export function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleVideoLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleVideoError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = videoUrl
    link.download = `minecraft-animation-${Date.now()}.mp4`
    link.click()
  }

  const handleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen()
    }
  }

  if (hasError) {
    return (
      <Card className="bg-red-900/20 border-red-500/50">
        <CardContent className="p-6 text-center">
          <div className="text-red-200">
            <div className="text-4xl mb-2">❌</div>
            <p className="text-lg font-medium">Video Loading Failed</p>
            <p className="text-sm mt-2 opacity-75">
              The animation video could not be loaded. Please try generating again.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 hover:bg-red-700"
            >
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="text-center text-white">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm">Loading your 20-second animation...</p>
            </div>
          </div>
        )}
        
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="w-full aspect-video"
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
          preload="metadata"
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='%23047857'/%3E%3Ctext x='320' y='180' fill='white' text-anchor='middle' font-family='Arial' font-size='24'%3E🎬 Minecraft Animation%3C/text%3E%3C/svg%3E"
        >
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Video Controls */}
      <div className="flex gap-3 flex-wrap">
        <Button
          onClick={handleDownload}
          className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white"
        >
          📥 Download MP4
        </Button>
        <Button
          onClick={handleFullscreen}
          variant="outline"
          className="flex-1 min-w-[120px] border-green-400/30 text-green-100 hover:bg-green-900/20"
        >
          ⛶ Fullscreen
        </Button>
      </div>

      {/* Video Information */}
      <Card className="bg-white/5 border-green-400/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-green-400 font-medium">Duration</div>
              <div className="text-white">20 seconds</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-medium">FPS</div>
              <div className="text-white">24 fps</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-medium">Frames</div>
              <div className="text-white">480 total</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-medium">Format</div>
              <div className="text-white">MP4 (H.264)</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-green-400/20">
            <p className="text-xs text-green-200/80 text-center">
              🎨 Generated with Blender 3D • 🔧 Processed with FFmpeg • 🚀 Optimized for web playback
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}