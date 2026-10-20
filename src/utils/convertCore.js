/** Shared HEIC / ARW → JPEG logic. */

import { arwBufferToJpg, preloadArwDecoder } from "./arwDecode";

export { arwBufferToJpg, preloadArwDecoder } from "./arwDecode";

function extOf(name) {
  const i = String(name || "").lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

export function isConvertible(name) {
  const ext = extOf(name);
  return ext === "heic" || ext === "heif" || ext === "arw";
}

export function isArw(name) {
  return extOf(name) === "arw";
}

export function isHeicName(name) {
  const ext = extOf(name);
  return ext === "heic" || ext === "heif";
}

export function jpgName(name) {
  return String(name || "image").replace(/\.(heic|heif|arw)$/i, ".jpg");
}

async function bitmapToJpegBlob(bitmap, quality) {
  try {
    if (typeof OffscreenCanvas === "function") {
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      canvas.getContext("2d").drawImage(bitmap, 0, 0);
      return canvas.convertToBlob({ type: "image/jpeg", quality });
    }
    if (typeof document !== "undefined") {
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      canvas.getContext("2d").drawImage(bitmap, 0, 0);
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (out) => (out ? resolve(out) : reject(new Error("JPG 编码失败"))),
          "image/jpeg",
          quality,
        );
      });
    }
    throw new Error("无可用的 Canvas");
  } finally {
    if (typeof bitmap.close === "function") bitmap.close();
  }
}

async function heicNativeToJpg(fileOrBlob, quality) {
  if (typeof createImageBitmap !== "function") {
    throw new Error("环境不支持 createImageBitmap");
  }
  const bitmap = await createImageBitmap(fileOrBlob);
  return bitmapToJpegBlob(bitmap, quality);
}

let heicModulePromise = null;

/** Warm up heic-to + its decoder worker ahead of first convert. */
export function preloadHeicConverter() {
  if (!heicModulePromise) {
    heicModulePromise = import("heic-to").then(async (mod) => {
      if (typeof mod.isHeic === "function") {
        try {
          await mod.isHeic(new Blob([new Uint8Array(12)], { type: "application/octet-stream" }));
        } catch {
          /* ignore */
        }
      }
      return mod;
    });
  }
  return heicModulePromise;
}

async function heicLibToJpg(fileOrBlob, quality) {
  if (typeof document === "undefined") {
    throw new Error("HEIC 需在主线程转换");
  }
  const { heicTo } = await preloadHeicConverter();
  const result = await heicTo({
    blob: fileOrBlob,
    type: "image/jpeg",
    quality,
  });
  return Array.isArray(result) ? result[0] : result;
}

async function heicToJpg(fileOrBlob, quality) {
  try {
    return await heicNativeToJpg(fileOrBlob, quality);
  } catch {
    try {
      return await heicLibToJpg(fileOrBlob, quality);
    } catch (libError) {
      const libMsg = libError instanceof Error ? libError.message : String(libError);
      throw new Error(`HEIC 转换失败：${libMsg}`);
    }
  }
}

/**
 * Convert by file name + raw bytes.
 * ARW uses LibRaw (works in Worker via OffscreenCanvas).
 * HEIC must run on the main thread (heic-to needs document).
 */
export async function convertBufferToJpg(name, buffer, quality = 0.92) {
  const ext = extOf(name);
  if (ext === "arw") return arwBufferToJpg(buffer, quality);
  if (ext === "heic" || ext === "heif") {
    if (typeof document === "undefined") {
      throw new Error("HEIC 需在主线程转换");
    }
    const blob = new Blob([buffer], { type: "image/heic" });
    return heicToJpg(blob, quality);
  }
  throw new Error(`不支持的格式：.${ext || "未知"}`);
}

/** Convert a File|Blob on the current thread. */
export async function convertToJpg(file, quality = 0.92) {
  const name = file.name || "image";
  if (isHeicName(name)) {
    return heicToJpg(file, quality);
  }
  const buffer = await file.arrayBuffer();
  return convertBufferToJpg(name, buffer, quality);
}

/** Prefetch both converters. */
export function preloadConverters() {
  preloadHeicConverter().catch(() => {});
  preloadArwDecoder().catch(() => {});
}
