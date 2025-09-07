import { spawn } from 'child_process'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function executeAnimation(
  jobId: string, 
  prompt: string, 
  outputDir: string, 
  JOBS: Map<string, any>
) {
  try {
    // Update job status
    const updateJob = (updates: any) => {
      const currentJob = JOBS.get(jobId)
      JOBS.set(jobId, {
        ...currentJob,
        ...updates,
        updatedAt: new Date().toISOString()
      })
    }

    updateJob({ status: 'processing', progress: 5 })

    // Create frames directory
    const framesDir = join(outputDir, 'frames')
    await mkdir(framesDir, { recursive: true })

    // Create enhanced Blender script for 20-second animations
    const blenderScript = generateBlenderScript(prompt, framesDir)
    const scriptPath = join(outputDir, 'animate_scene.py')
    await writeFile(scriptPath, blenderScript)

    updateJob({ status: 'processing', progress: 10 })

    // Execute Blender rendering
    await runBlenderRendering(scriptPath, updateJob)

    updateJob({ status: 'processing', progress: 80 })

    // Compile video with FFmpeg
    const videoPath = join(outputDir, 'output.mp4')
    await compileVideo(framesDir, videoPath, updateJob)

    // Mark job as complete
    updateJob({ 
      status: 'done', 
      progress: 100,
      videoPath,
      completedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error(`Animation generation failed for job ${jobId}:`, error)
    
    const currentJob = JOBS.get(jobId)
    JOBS.set(jobId, {
      ...currentJob,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      updatedAt: new Date().toISOString()
    })
    
    throw error
  }
}

function generateBlenderScript(prompt: string, framesDir: string): string {
  return `
import bpy
import sys
import os
import math

# Clear existing scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Set up scene for 20-second animation (480 frames at 24fps)
scene = bpy.context.scene
scene.frame_start = 1
scene.frame_end = 480
scene.render.fps = 24

# Set output directory
output_dir = "${framesDir.replace(/\\/g, '/')}"
os.makedirs(output_dir, exist_ok=True)

# Add lighting setup
bpy.ops.object.light_add(type='SUN', location=(10, -10, 15))
sun = bpy.context.object
sun.data.energy = 3.0

# Add ambient lighting
bpy.ops.object.light_add(type='AREA', location=(0, 0, 10))
area_light = bpy.context.object  
area_light.data.energy = 1.5
area_light.data.size = 5.0

# Add camera
bpy.ops.object.camera_add(location=(12, -12, 8))
camera = bpy.context.object
scene.camera = camera

# Point camera at origin
camera.rotation_euler = (1.1, 0, 0.785)

# Create ground plane
bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, -1))
ground = bpy.context.object
ground.name = "Ground"

# Add material to ground (grass-like)
mat_ground = bpy.data.materials.new(name="Ground")
mat_ground.use_nodes = True
mat_ground.node_tree.nodes.clear()
output = mat_ground.node_tree.nodes.new('ShaderNodeOutputMaterial')
principled = mat_ground.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
mat_ground.node_tree.links.new(principled.outputs[0], output.inputs[0])
principled.inputs[0].default_value = (0.1, 0.8, 0.1, 1.0)  # Green color
ground.data.materials.append(mat_ground)

# Load or create Steve character
def create_steve():
    # Simple Steve representation using cubes
    bpy.ops.mesh.primitive_cube_add(size=1.8, location=(0, 0, 0.9))
    body = bpy.context.object
    body.name = "Steve_Body"
    
    # Head
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 2.4))
    head = bpy.context.object
    head.name = "Steve_Head"
    
    # Arms
    bpy.ops.mesh.primitive_cube_add(size=(0.4, 0.4, 1.2), location=(-1.1, 0, 1.5))
    arm_left = bpy.context.object
    arm_left.name = "Steve_Arm_L"
    
    bpy.ops.mesh.primitive_cube_add(size=(0.4, 0.4, 1.2), location=(1.1, 0, 1.5))
    arm_right = bpy.context.object
    arm_right.name = "Steve_Arm_R"
    
    # Legs  
    bpy.ops.mesh.primitive_cube_add(size=(0.4, 0.4, 1.2), location=(-0.5, 0, -0.3))
    leg_left = bpy.context.object
    leg_left.name = "Steve_Leg_L"
    
    bpy.ops.mesh.primitive_cube_add(size=(0.4, 0.4, 1.2), location=(0.5, 0, -0.3))
    leg_right = bpy.context.object
    leg_right.name = "Steve_Leg_R"
    
    # Add materials
    mat_steve = bpy.data.materials.new(name="Steve")
    mat_steve.use_nodes = True
    principled = mat_steve.node_tree.nodes.get('Principled BSDF')
    principled.inputs[0].default_value = (0.4, 0.7, 1.0, 1.0)  # Blue shirt
    
    for obj in [body, head, arm_left, arm_right, leg_left, leg_right]:
        obj.data.materials.append(mat_steve)
    
    return [body, head, arm_left, arm_right, leg_left, leg_right]

def create_creeper():
    # Simple Creeper representation
    bpy.ops.mesh.primitive_cube_add(size=(1.2, 1.2, 1.8), location=(5, 0, 0.9))
    body = bpy.context.object
    body.name = "Creeper_Body"
    
    # Head
    bpy.ops.mesh.primitive_cube_add(size=1, location=(5, 0, 2.4))
    head = bpy.context.object
    head.name = "Creeper_Head"
    
    # Legs
    legs = []
    positions = [(-0.3, -0.3, -0.3), (0.3, -0.3, -0.3), (-0.3, 0.3, -0.3), (0.3, 0.3, -0.3)]
    for i, pos in enumerate(positions):
        bpy.ops.mesh.primitive_cube_add(size=(0.4, 0.4, 1.2), location=(5 + pos[0], pos[1], pos[2]))
        leg = bpy.context.object
        leg.name = f"Creeper_Leg_{i}"
        legs.append(leg)
    
    # Add green material
    mat_creeper = bpy.data.materials.new(name="Creeper")
    mat_creeper.use_nodes = True
    principled = mat_creeper.node_tree.nodes.get('Principled BSDF')
    principled.inputs[0].default_value = (0.2, 0.8, 0.2, 1.0)  # Green
    
    for obj in [body, head] + legs:
        obj.data.materials.append(mat_creeper)
    
    return [body, head] + legs

# Create characters based on prompt
steve_parts = create_steve()
steve_body = steve_parts[0]

prompt = "${prompt.toLowerCase()}"
creeper_parts = []
if "creeper" in prompt:
    creeper_parts = create_creeper()
    creeper_body = creeper_parts[0] if creeper_parts else None

# Animation logic for 20 seconds (480 frames)
def animate_walking(obj, start_pos, end_pos, start_frame=1, end_frame=480):
    obj.location = start_pos
    obj.keyframe_insert(data_path="location", frame=start_frame)
    
    # Add mid-points for more natural movement
    mid_frame = (start_frame + end_frame) // 2
    mid_pos = ((start_pos[0] + end_pos[0]) / 2, (start_pos[1] + end_pos[1]) / 2, start_pos[2])
    obj.location = mid_pos
    obj.keyframe_insert(data_path="location", frame=mid_frame)
    
    obj.location = end_pos
    obj.keyframe_insert(data_path="location", frame=end_frame)

def animate_rotation(obj, start_angle, end_angle, axis='Z', start_frame=1, end_frame=480):
    if axis == 'Z':
        obj.rotation_euler = (0, 0, start_angle)
    obj.keyframe_insert(data_path="rotation_euler", frame=start_frame)
    
    if axis == 'Z':
        obj.rotation_euler = (0, 0, end_angle) 
    obj.keyframe_insert(data_path="rotation_euler", frame=end_frame)

# Apply animations based on prompt
if "walk" in prompt:
    animate_walking(steve_body, (0, 0, 0.9), (10, 0, 0.9))
    if creeper_parts:
        animate_walking(creeper_parts[0], (5, 0, 0.9), (8, 0, 0.9))

if "dance" in prompt:
    # Dancing animation with rotation and bouncing
    for i in range(1, 481, 40):
        steve_body.location = (0, 0, 0.9 + 0.5 * math.sin(i/20))
        steve_body.keyframe_insert(data_path="location", frame=i)
        steve_body.rotation_euler = (0, 0, math.sin(i/10) * 0.5)
        steve_body.keyframe_insert(data_path="rotation_euler", frame=i)

if "build" in prompt:
    # Building animation - blocks appear over time
    for i in range(5):
        bpy.ops.mesh.primitive_cube_add(location=(2 + i, 2, 0))
        block = bpy.context.object
        block.name = f"Block_{i}"
        
        # Scale from 0 to 1 over time
        frame_start = 96 * i + 96  # Space out over 20 seconds
        block.scale = (0, 0, 0)
        block.keyframe_insert(data_path="scale", frame=frame_start)
        block.scale = (1, 1, 1)
        block.keyframe_insert(data_path="scale", frame=frame_start + 48)

# Camera animation for dynamic shots
camera.location = (12, -12, 8)
camera.keyframe_insert(data_path="location", frame=1)
camera.location = (8, -15, 6)
camera.keyframe_insert(data_path="location", frame=240)
camera.location = (15, -8, 10)
camera.keyframe_insert(data_path="location", frame=480)

# Render settings
scene.render.engine = 'CYCLES'
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 50  # Reduce for faster rendering

# Render all frames
for frame in range(1, 481):
    scene.frame_set(frame)
    scene.render.filepath = os.path.join(output_dir, f"frame_{frame:03d}.png")
    bpy.ops.render.render(write_still=True)
    
    # Print progress (will be captured by Node.js)
    if frame % 10 == 0:
        print(f"PROGRESS: Frame {frame}/480")

print("RENDER_COMPLETE")
`
}

async function runBlenderRendering(scriptPath: string, updateJob: (updates: any) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const blenderProcess = spawn('blender', [
      '--background',
      '--python', scriptPath
    ])

    let lastFrame = 0

    blenderProcess.stdout.on('data', (data) => {
      const output = data.toString()
      console.log('Blender stdout:', output)
      
      // Parse progress
      const progressMatch = output.match(/PROGRESS: Frame (\\d+)\/480/)
      if (progressMatch) {
        const frame = parseInt(progressMatch[1])
        lastFrame = frame
        const progress = Math.round((frame / 480) * 70) + 10 // 10-80% range
        updateJob({ frame, progress })
      }
      
      if (output.includes('RENDER_COMPLETE')) {
        resolve()
      }
    })

    blenderProcess.stderr.on('data', (data) => {
      console.error('Blender stderr:', data.toString())
    })

    blenderProcess.on('error', (error) => {
      reject(new Error(`Blender execution failed: ${error.message}`))
    })

    blenderProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Blender process exited with code ${code}`))
      } else if (lastFrame < 480) {
        reject(new Error('Blender rendering incomplete'))
      } else {
        resolve()
      }
    })

    // Timeout after 10 minutes
    setTimeout(() => {
      blenderProcess.kill()
      reject(new Error('Blender rendering timeout'))
    }, 10 * 60 * 1000)
  })
}

async function compileVideo(framesDir: string, videoPath: string, updateJob: (updates: any) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn('ffmpeg', [
      '-y', // Overwrite output file
      '-framerate', '24',
      '-i', join(framesDir, 'frame_%03d.png'),
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-preset', 'medium',
      '-crf', '23', // Good quality
      videoPath
    ])

    ffmpegProcess.stdout.on('data', (data) => {
      console.log('FFmpeg stdout:', data.toString())
    })

    ffmpegProcess.stderr.on('data', (data) => {
      const output = data.toString()
      console.log('FFmpeg stderr:', output)
      
      // Update progress during video compilation
      updateJob({ progress: 85 })
    })

    ffmpegProcess.on('error', (error) => {
      reject(new Error(`FFmpeg execution failed: ${error.message}`))
    })

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        updateJob({ progress: 95 })
        resolve()
      } else {
        reject(new Error(`FFmpeg process exited with code ${code}`))
      }
    })

    // Timeout after 5 minutes
    setTimeout(() => {
      ffmpegProcess.kill()
      reject(new Error('Video compilation timeout'))
    }, 5 * 60 * 1000)
  })
}