import { NextRequest, NextResponse } from 'next/server'
import { JOBS } from '../../generate/route'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const job = JOBS.get(jobId)
    
    if (!job) {
      return NextResponse.json(
        { status: 'not_found' },
        { status: 404 }
      )
    }

    // Return job status with additional metadata
    const response = {
      status: job.status,
      progress: job.progress || 0,
      frame: job.frame || 0,
      error: job.error || null,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt || job.createdAt,
      prompt: job.prompt
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Status endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error', status: 'error' },
      { status: 500 }
    )
  }
}