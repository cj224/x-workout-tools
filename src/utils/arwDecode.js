/**
 * Sony ARW → JPEG via LibRaw demosaic (correct orientation).
 * Tuned for speed (half-size) and underexposed / night shots.
 */

const ARW_SETTINGS = {
  useCameraWb: true,
  useAutoWb: false,
  outputColor: 1, // sRGB
  outputBps: 8,
  // ~4× fewer pixels — biggest speed win for sharing / puzzle use
  halfSize: true,
  // bilinear demosaic — fastest usable quality
  userQual: 0,
  // apply camera orientation from RAW metadata
  userFlip: -1,
  noAutoBright: false,
  autoBrightThr: 0.008,
  bright: 1.45,
  // lift exposure for typically dark indoor / night ARWs
  expCorrec: true,
  expShift: 2.0,
  expPreser: 0.28,
  // sRGB-ish tone curve (LibRaw: gamm[0]=1/power, gamm[1]=toe slope)
  gamm: [1 / 2.4, 12.92],
};

function pixelsToRgba(src, width, height, colors, bits) {
  const scale = bits > 8 ? 1 / 256 : 1;
  const sample = (index) => Math.min(255, Math.round((src[index] || 0) * scale));
  const rgba = new Uint8ClampedArray(width * height * 4);
  const stride = colors >= 4 ? 4 : 3;
  const expected = width * height * stride;
  if (src.length < expected) {
    throw new Error(`RAW 像素不足：${src.length} < ${expected}`);
  }
  for (let p = 0; p < width * height; p += 1) {
    const i = p * stride;
    rgba[p * 4] = sample(i);
    rgba[p * 4 + 1] = sample(i + 1);
    rgba[p * 4 + 2] = sample(i + 2);
    rgba[p * 4 + 3] = 255;
  }
  return rgba;
}

function sampleAvgLuma(rgba) {
  let sum = 0;
  let count = 0;
  for (let i = 0; i < rgba.length; i += 64) {
    sum += 0.2126 * rgba[i] + 0.7152 * rgba[i + 1] + 0.0722 * rgba[i + 2];
    count += 1;
  }
  return sum / Math.max(count, 1);
}

/** Extra lift when the frame is still too dark after LibRaw auto-bright. */
function brightnessFilterFor(avgLuma) {
  const target = 115;
  if (avgLuma >= 92) return "none";
  const gain = Math.min(2.4, Math.max(1.12, target / Math.max(avgLuma, 8)));
  const contrast = avgLuma < 50 ? 1.08 : 1.04;
  return `brightness(${gain.toFixed(3)}) contrast(${contrast})`;
}

function makeCanvas(width, height) {
  if (typeof OffscreenCanvas === "function") {
    return new OffscreenCanvas(width, height);
  }
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  throw new Error("无可用的 Canvas");
}

async function canvasToJpeg(canvas, quality) {
  if (typeof canvas.convertToBlob === "function") {
    return canvas.convertToBlob({ type: "image/jpeg", quality });
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (out) => (out ? resolve(out) : reject(new Error("JPG 编码失败"))),
      "image/jpeg",
      quality,
    );
  });
}

async function rgbaToJpeg(rgba, width, height, quality) {
  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.putImageData(new ImageData(rgba, width, height), 0, 0);

  const avg = sampleAvgLuma(rgba);
  const filter = brightnessFilterFor(avg);
  if (filter === "none") {
    return canvasToJpeg(canvas, quality);
  }

  const out = makeCanvas(width, height);
  const octx = out.getContext("2d");
  octx.filter = filter;
  octx.drawImage(canvas, 0, 0);
  return canvasToJpeg(out, quality);
}

let librawModulePromise = null;

export function preloadArwDecoder() {
  if (!librawModulePromise) {
    librawModulePromise = import("libraw-wasm");
  }
  return librawModulePromise;
}

/**
 * @param {ArrayBuffer|Uint8Array} buffer
 * @param {number} quality 0..1
 * @returns {Promise<Blob>}
 */
export async function arwBufferToJpg(buffer, quality = 0.92) {
  const { default: LibRaw } = await preloadArwDecoder();
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const raw = new LibRaw();
  try {
    await raw.open(bytes, ARW_SETTINGS);
    const image = await raw.imageData();
    if (!image?.data || !image.width || !image.height) {
      throw new Error("RAW 解码无结果");
    }
    const rgba = pixelsToRgba(
      image.data,
      image.width,
      image.height,
      image.colors || 3,
      image.bits || 8,
    );
    return rgbaToJpeg(rgba, image.width, image.height, quality);
  } finally {
    if (typeof raw.dispose === "function") raw.dispose();
  }
}
