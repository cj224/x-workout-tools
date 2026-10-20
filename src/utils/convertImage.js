export {
  convertToJpg,
  convertBufferToJpg,
  isConvertible,
  jpgName,
  preloadHeicConverter,
  preloadArwDecoder,
  preloadConverters,
} from "./convertCore";

export { getConvertPool, disposeConvertPool } from "./convertPool";

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Self-test helper: fetch sample and convert in browser. */
export async function selfTestConvert(samples = [
  { url: "/samples/IMG_6034.heic", name: "IMG_6034.heic" },
  { url: "/samples/DSC04670.arw", name: "DSC04670.arw" },
]) {
  const { convertToJpg } = await import("./convertCore");
  const results = [];
  for (const sample of samples) {
    const started = performance.now();
    try {
      const res = await fetch(sample.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const file = new File([blob], sample.name, { type: blob.type || "application/octet-stream" });
      const jpg = await convertToJpg(file, 0.92);
      results.push({
        name: sample.name,
        ok: true,
        bytes: jpg.size,
        ms: Math.round(performance.now() - started),
        type: jpg.type,
      });
    } catch (error) {
      results.push({
        name: sample.name,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        ms: Math.round(performance.now() - started),
      });
    }
  }
  return results;
}
