import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { mkdir } from 'fs/promises'
import { join } from 'path'
import { executeAnimation } from '@/lib/animation'

// In-memory job storage (use Redis/DB in production)
const JOBS = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const prompt = formData.get('prompt') as string

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Validate prompt length and content
    if (prompt.length > 500) {
      return NextResponse.json(
        { error: 'Prompt too long. Please keep it under 500 characters.' },
        { status: 400 }
      )
    }

    const jobId = uuidv4()
    const outputDir = join(process.cwd(), 'public', 'outputs', jobId)
    
    // Create output directory
    await mkdir(outputDir, { recursive: true })

    // Initialize job status
    JOBS.set(jobId, {
      status: 'processing',
      prompt,
      createdAt: new Date().toISOString(),
      progress: 0
    })

    // Start animation generation asynchronously
    executeAnimation(jobId, prompt, outputDir, JOBS)
      .catch((error) => {
        console.error(`Job ${jobId} failed:`, error)
        JOBS.set(jobId, {
          ...JOBS.get(jobId),
          status: 'error',
          error: error.message || 'Animation generation failed'
        })
      })

    return NextResponse.json({
      job_id: jobId,
      status: 'processing',
      message: '20-second animation generation started'
    })

  } catch (error) {
    console.error('Generation endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export job storage for other API routes
export { JOBS }