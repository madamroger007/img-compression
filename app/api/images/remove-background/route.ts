// app/api/images/remove-background/route.ts
import { NextRequest } from "next/server";
import { removeBackgroundLocal, BGError } from "@/lib/removeBackground";

// App Router config
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

function jsonError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

// Read file from FormData (App Router friendly, no deprecated config)
async function readFileFromRequest(req: NextRequest): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof Blob)) {
    throw new BGError("No file field named 'file' was provided.");
  }

  const mimeType = (file.type || "").toLowerCase();
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new BGError("Unsupported file format. Please upload PNG, JPG, JPEG, or WebP.");
  }

  const filename = (file as File).name || "upload";
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (!buffer.length) {
    throw new BGError("Uploaded file is empty or unreadable.");
  }

  return { buffer, filename, mimeType };
}

// Main handler
export async function POST(req: NextRequest) {
  try {
    const started = Date.now();
    const { buffer: inputBuffer, filename, mimeType } = await readFileFromRequest(req);

    console.log(`[BG Removal Route] Processing ${filename} (${inputBuffer.length} bytes)`);
    console.log("[BG Removal] Starting processing");

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return jsonError("Unsupported file format. Please upload PNG, JPG, JPEG, or WebP.", 400);
    }

    const outputBuffer = await removeBackgroundLocal(inputBuffer);
    console.log(`[BG Removal] Completed in ${Date.now() - started} ms`);

    const outputBinary = new Uint8Array(outputBuffer); // Response typing expects BufferSource/Uint8Array
    return new Response(outputBinary, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "attachment; filename=removed-bg.png"
      }
    });
  } catch (err: any) {
    const message = err instanceof BGError ? err.message : err?.message ?? "Unknown server error";
    const status = err instanceof BGError ? 400 : 500;
    console.error("[BG Removal Route] Processing failed:", err);
    return jsonError(message, status);
  }
}
