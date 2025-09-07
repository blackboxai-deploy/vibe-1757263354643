'use client'

import { useState } from 'react'
import { VideoGenerator } from '@/components/VideoGenerator'
import { VideoPlayer } from '@/components/VideoPlayer'
import { StatusDisplay } from '@/components/StatusDisplay'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  const [currentJob, setCurrentJob] = useState<string | null>(null)
  const [jobStatus, setJobStatus] = useState<any>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const handleJobCreated = (jobId: string) => {
    setCurrentJob(jobId)
    setJobStatus({ status: 'processing' })
    setVideoUrl(null)
  }

  const handleJobCompleted = (jobId: string) => {
    setVideoUrl(`${window.location.origin}/api/download/${jobId}`)
    setJobStatus({ status: 'done' })
  }

  const handleStatusUpdate = (status: any) => {
    setJobStatus(status)
  }

  return (
    <div className="min-h-screen p-4">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto text-center py-12">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            🎬 Minecraft Animation AI
          </h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed">
            Create stunning 20-second Minecraft animations with AI. Describe your scene and watch 
            Steve, Creepers, and blocks come to life in beautiful 3D animations.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mt-12">
          {/* Generator Section */}
          <Card className="bg-white/10 backdrop-blur-sm border-green-400/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center gap-2">
                🎮 Animation Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <VideoGenerator 
                onJobCreated={handleJobCreated}
                disabled={currentJob !== null && jobStatus?.status === 'processing'}
              />
              
              {currentJob && (
                <StatusDisplay
                  jobId={currentJob}
                  onStatusUpdate={handleStatusUpdate}
                  onJobCompleted={handleJobCompleted}
                />
              )}
            </CardContent>
          </Card>

          {/* Video Display Section */}
          <Card className="bg-white/10 backdrop-blur-sm border-green-400/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center gap-2">
                🎥 Your Animation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {videoUrl ? (
                <VideoPlayer videoUrl={videoUrl} />
              ) : (
                <div className="aspect-video bg-black/20 rounded-lg flex items-center justify-center border-2 border-dashed border-green-400/30">
                  <div className="text-center text-green-100">
                    <div className="text-4xl mb-2">🎬</div>
                    <p className="text-lg font-medium">Your 20-second animation will appear here</p>
                    <p className="text-sm opacity-75 mt-2">Enter a prompt to get started</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-green-400/20">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-white font-semibold text-lg mb-2">Fast Rendering</h3>
            <p className="text-green-100 text-sm">
              Advanced Blender integration for smooth 20-second animations at 24 FPS
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-green-400/20">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="text-white font-semibold text-lg mb-2">AI-Powered</h3>
            <p className="text-green-100 text-sm">
              Describe your scene and let AI create complex animations with characters and environments
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-green-400/20">
            <div className="text-3xl mb-3">📹</div>
            <h3 className="text-white font-semibold text-lg mb-2">HD Quality</h3>
            <p className="text-green-100 text-sm">
              High-quality MP4 output optimized for web playback and sharing
            </p>
          </div>
        </div>

        {/* Examples Section */}
        <div className="mt-16 bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-green-400/20">
          <h2 className="text-white text-2xl font-bold mb-6">✨ Animation Examples</h2>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="bg-black/20 rounded-lg p-4">
              <code className="text-green-300 text-sm">
                "Steve walks across a grassy field and builds a house"
              </code>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <code className="text-green-300 text-sm">
                "A Creeper follows Steve through a dark forest"
              </code>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <code className="text-green-300 text-sm">
                "Steve mines blocks underground with torches"
              </code>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <code className="text-green-300 text-sm">
                "Multiple Creepers surround Steve in a desert"
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}