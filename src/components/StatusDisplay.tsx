'use client'

import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface StatusDisplayProps {
  jobId: string
  onStatusUpdate: (status: any) => void
  onJobCompleted: (jobId: string) => void
}

interface JobStatus {
  status: 'processing' | 'done' | 'error' | 'not_found'
  progress?: number
  frame?: number
  error?: string
  estimated_time?: number
}

export function StatusDisplay({ jobId, onStatusUpdate, onJobCompleted }: StatusDisplayProps) {
  const [status, setStatus] = useState<JobStatus>({ status: 'processing' })
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/status/${jobId}`)
        const data = await response.json()
        
        setStatus(data)
        onStatusUpdate(data)

        if (data.status === 'done') {
          clearInterval(pollInterval)
          onJobCompleted(jobId)
        } else if (data.status === 'error') {
          clearInterval(pollInterval)
        }

        setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
      } catch (error) {
        console.error('Status check failed:', error)
      }
    }, 3000)

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval)
  }, [jobId, onStatusUpdate, onJobCompleted])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusMessage = () => {
    switch (status.status) {
      case 'processing':
        if (status.frame) {
          return `Rendering frame ${status.frame} of 480 (${Math.round((status.frame / 480) * 100)}%)`
        }
        return 'Initializing Blender and preparing scene...'
      case 'done':
        return 'Animation completed successfully! 🎉'
      case 'error':
        return `Error: ${status.error || 'Unknown error occurred'}`
      case 'not_found':
        return 'Job not found'
      default:
        return 'Unknown status'
    }
  }

  const getProgressValue = () => {
    if (status.progress) return status.progress
    if (status.frame) return (status.frame / 480) * 100
    return 0
  }

  const getEstimatedTimeLeft = () => {
    if (status.frame && status.frame > 10) {
      const framesPerSecond = status.frame / elapsedTime
      const remainingFrames = 480 - status.frame
      const estimatedSecondsLeft = Math.ceil(remainingFrames / framesPerSecond)
      return estimatedSecondsLeft
    }
    return null
  }

  if (status.status === 'error') {
    return (
      <Alert className="border-red-500/50 bg-red-900/20">
        <AlertDescription className="text-red-200">
          <div className="flex items-center gap-2">
            <span>❌</span>
            <div>
              <p className="font-medium">Generation Failed</p>
              <p className="text-sm mt-1">{status.error || 'An unknown error occurred'}</p>
              <p className="text-xs mt-2 opacity-75">
                Try a simpler prompt or check if Blender is properly installed
              </p>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (status.status === 'done') {
    return (
      <Alert className="border-green-500/50 bg-green-900/20">
        <AlertDescription className="text-green-200">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <div>
              <p className="font-medium">Animation Complete!</p>
              <p className="text-sm mt-1">Your 20-second Minecraft animation is ready to watch</p>
              <p className="text-xs mt-1 opacity-75">
                Total render time: {formatTime(elapsedTime)}
              </p>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  const estimatedTimeLeft = getEstimatedTimeLeft()

  return (
    <div className="space-y-4">
      <Alert className="border-blue-500/50 bg-blue-900/20">
        <AlertDescription className="text-blue-200">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
              <div>
                <p className="font-medium">Generating Animation...</p>
                <p className="text-sm mt-1">{getStatusMessage()}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress 
                value={getProgressValue()} 
                className="w-full h-3 bg-blue-900/30"
              />
              <div className="flex justify-between text-xs text-blue-200/80">
                <span>
                  {status.frame ? `Frame ${status.frame}/480` : 'Starting...'}
                </span>
                <span>
                  {Math.round(getProgressValue())}% Complete
                </span>
              </div>
            </div>

            {/* Timing Information */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blue-500/20 text-xs">
              <div>
                <span className="text-blue-300">Elapsed:</span>
                <span className="ml-1 font-mono">{formatTime(elapsedTime)}</span>
              </div>
              {estimatedTimeLeft && (
                <div>
                  <span className="text-blue-300">Est. remaining:</span>
                  <span className="ml-1 font-mono">{formatTime(estimatedTimeLeft)}</span>
                </div>
              )}
            </div>

            {/* Process Information */}
            <div className="text-xs text-blue-200/60 space-y-1">
              <p>🎬 Rendering 20-second animation (480 frames @ 24fps)</p>
              <p>⚙️ Using Blender for 3D rendering and FFmpeg for video compilation</p>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}