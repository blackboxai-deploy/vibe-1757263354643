'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface VideoGeneratorProps {
  onJobCreated: (jobId: string) => void
  disabled?: boolean
}

export function VideoGenerator({ onJobCreated, disabled = false }: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isGenerating) return

    setIsGenerating(true)
    
    try {
      const formData = new FormData()
      formData.append('prompt', prompt.trim())

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to start generation')
      }

      const data = await response.json()
      onJobCreated(data.job_id)
    } catch (error) {
      console.error('Generation error:', error)
      alert('Failed to start animation generation. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const examplePrompts = [
    "Steve walks across a grassy field and builds a house",
    "A Creeper follows Steve through a dark forest",
    "Steve mines blocks underground with torches",
    "Multiple Creepers surround Steve in a desert",
    "Steve and Creeper dance together in a village",
  ]

  const handleExampleClick = (example: string) => {
    setPrompt(example)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-white text-lg font-medium">
          Describe your 20-second Minecraft animation
        </Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your animation idea... (e.g., 'Steve walks with a Creeper through a forest')"
          className="min-h-[100px] bg-white/10 border-green-400/30 text-white placeholder:text-green-200/60 resize-none"
          disabled={disabled || isGenerating}
        />
        <p className="text-green-200/80 text-sm">
          🎬 Your animation will be exactly 20 seconds long (480 frames at 24 FPS)
        </p>
      </div>

      {/* Example Prompts */}
      <div className="space-y-2">
        <Label className="text-white text-sm font-medium">Quick Examples:</Label>
        <div className="grid grid-cols-1 gap-2">
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleExampleClick(example)}
              disabled={disabled || isGenerating}
              className="text-left p-2 rounded bg-black/20 hover:bg-black/30 border border-green-400/20 hover:border-green-400/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <code className="text-green-300 text-xs">{example}</code>
            </button>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        disabled={!prompt.trim() || disabled || isGenerating}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Starting Generation...
          </div>
        ) : (
          <>
            🎬 Generate 20-Second Animation
          </>
        )}
      </Button>

      {prompt.trim() && (
        <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-3">
          <p className="text-blue-200 text-sm">
            <strong>Preview:</strong> Your animation will feature: {prompt}
          </p>
          <p className="text-blue-200/80 text-xs mt-1">
            ⏱️ Estimated rendering time: 2-5 minutes • 📹 Output: 20-second MP4 video
          </p>
        </div>
      )}
    </form>
  )
}