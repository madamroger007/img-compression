// lib/removeBackground.ts
import { removeBackground, Config as ImglyConfig } from "@imgly/background-removal-node";
import sharp from "sharp";

const MAX_CONCURRENT_REMOVALS = 2;
let activeRemovals = 0;

export class BGError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BGError";
  }
}

/**
 * Removes background from an image buffer using @imgly/background-removal-node.
 * The official IMG.LY library handles ONNX model caching, downloads, and inference.
 *
 * Supported formats: PNG, JPG, JPEG, WebP (input)
 * Output: PNG with alpha channel (transparency)
 */
export async function removeBackgroundLocal(
  inputBuffer: Buffer
): Promise<Buffer> {
  if (activeRemovals >= MAX_CONCURRENT_REMOVALS) {
    throw new BGError(
      "Server is busy processing other background removals. Please try again shortly."
    );
  }

  activeRemovals++;
  try {
    if (!inputBuffer?.length) {
      throw new BGError("Uploaded file is empty or unreadable.");
    }

    // Get input image metadata for better processing
    const metadata = await sharp(inputBuffer).metadata();
    const { width, height } = metadata;

    // Preprocess image for better background removal
    // Normalize and enhance contrast slightly for better edge detection
    const preprocessedBuffer = await sharp(inputBuffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
        kernel: 'lanczos3' // High-quality resampling
      })
      .normalize() // Enhance contrast for better segmentation
      .toBuffer();

    // IMG.LY config with highest quality settings
    const config: ImglyConfig = {
      model: "medium", // Medium is the best available for Node.js
      output: {
        format: "image/png",
        quality: 1.0 // Maximum quality
      },
      debug: false,
      proxyToWorker: false
    };

    console.log(
      `[BG Removal] Processing image (${inputBuffer.length} bytes, ${width}x${height}) with medium model`
    );

    // Convert preprocessed buffer to Blob
    const uint8Array = new Uint8Array(preprocessedBuffer);
    const inputBlob = new Blob([uint8Array], { type: "application/octet-stream" });

    // IMG.LY's removeBackground returns a Blob
    const outputBlob = await removeBackground(inputBlob, config);

    // Convert Blob to Buffer
    const arrayBuffer = await outputBlob.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    // Post-process: Refine alpha channel to remove remaining background artifacts
    const alphaChannel = await sharp(rawBuffer)
      .extractChannel('alpha')
      .linear(1.2, -25) // Increase contrast: amplify alpha, darken near-transparent pixels
      .threshold(15) // Remove very faint background pixels (0-15 becomes 0)
      .blur(0.5) // Slight blur for smoother edges
      .toBuffer();

    const outputBuffer = await sharp(rawBuffer)
      .removeAlpha() // Extract RGB channels
      .joinChannel(alphaChannel) // Apply cleaned alpha channel
      .png({
        quality: 100,
        compressionLevel: 9,
        adaptiveFiltering: true,
        palette: false,
        effort: 10
      })
      .toBuffer();

    console.log(
      `[BG Removal] Completed successfully (${outputBuffer.length} bytes)`
    );

    return outputBuffer;
  } catch (err: any) {
    const message =
      err instanceof BGError
        ? err.message
        : err?.message ?? "Unknown background removal error";
    console.error("[BG Removal] Error:", message);
    throw new BGError(message);
  } finally {
    activeRemovals = Math.max(0, activeRemovals - 1);
  }
}
