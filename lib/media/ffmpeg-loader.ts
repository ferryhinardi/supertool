// Separate file to load FFmpeg modules
// This helps avoid bundling issues with dynamic imports

export async function loadFFmpegModules() {
  const { FFmpeg } = await import('@ffmpeg/ffmpeg')
  const { toBlobURL, fetchFile } = await import('@ffmpeg/util')

  return {
    FFmpeg,
    toBlobURL,
    fetchFile,
  }
}
