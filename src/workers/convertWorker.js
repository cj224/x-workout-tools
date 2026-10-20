/**
 * Worker entry for ARW LibRaw demosaic.
 * HEIC stays on the main thread (heic-to needs `document`).
 */
import { arwBufferToJpg } from "@/utils/arwDecode";

self.onmessage = async (event) => {
  const { id, name, buffer, quality } = event.data || {};
  try {
    const lower = String(name || "").toLowerCase();
    if (!lower.endsWith(".arw")) {
      throw new Error("Worker 仅支持 ARW，HEIC 请走主线程");
    }
    const blob = await arwBufferToJpg(buffer, quality ?? 0.92);
    const out = await blob.arrayBuffer();
    self.postMessage(
      { id, ok: true, buffer: out, type: "image/jpeg", bytes: out.byteLength },
      [out],
    );
  } catch (error) {
    self.postMessage({
      id,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
