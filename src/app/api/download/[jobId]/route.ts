import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'
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
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    if (job.status !== 'done') {
      return NextResponse.json(
        { error: 'Animation not ready yet', status: job.status },
        { status: 400 }
      )
    }

    // Construct video file path
    const videoPath = join(process.cwd(), 'public', 'outputs', jobId, 'output.mp4')
    
    try {
      // Check if file exists and get stats
      const fileStats = await stat(videoPath)
      
      if (!fileStats.isFile()) {
        throw new Error('File not found')
      }

      // Read the video file
      const videoBuffer = await readFile(videoPath)
      
      // Create response with proper headers for video streaming
      const response = new NextResponse(videoBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': videoBuffer.length.toString(),
          'Content-Disposition': `attachment; filename="minecraft-animation-${jobId}.mp4"`,
          'Cache-Control': 'public, max-age=3600',
          'Accept-Ranges': 'bytes',
        },
      })

      return response

    } catch (fileError) {
      console.error(`File access error for job ${jobId}:`, fileError)
      return NextResponse.json(
        { error: 'Video file not available' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('Download endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}