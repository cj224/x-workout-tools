/**
 * Conversion dispatcher:
 * - ARW → Web Worker pool (LibRaw demosaic; keeps UI responsive)
 * - HEIC → main thread (heic-to needs `document`)
 */

import {
  convertToJpg,
  isArw,
  isHeicName,
  preloadConverters,
} from "./convertCore";

function defaultConcurrency() {
  const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4;
  // LibRaw is memory-heavy; keep ARW parallelism modest
  return Math.max(1, Math.min(2, cores));
}

function createWorker() {
  return new Worker(new URL("../workers/convertWorker.js", import.meta.url), {
    type: "module",
  });
}

function isWorkerInfraError(error) {
  const msg = error instanceof Error ? error.message : String(error);
  return /Worker|OffscreenCanvas|Failed to fetch|import|network|document is not defined/i.test(msg);
}

class ConvertPool {
  constructor(size = defaultConcurrency()) {
    this.size = size;
    this.workers = [];
    this.idle = [];
    this.queue = [];
    this.nextId = 1;
    this.pending = new Map();
    this.heicActive = 0;
    this.heicLimit = 2;
    this.heicWaiters = [];
    this.useMainForArw = false;
  }

  ensureWorkers() {
    if (this.useMainForArw) return;
    while (this.workers.length < this.size) {
      const worker = createWorker();
      worker.onmessage = (event) => this.onMessage(worker, event.data);
      worker.onerror = (event) => {
        for (const [id, job] of this.pending) {
          if (job.worker === worker) {
            this.pending.delete(id);
            job.reject(new Error(event.message || "Worker 错误"));
            this.idle.push(worker);
            this.pump();
            break;
          }
        }
      };
      this.workers.push(worker);
      this.idle.push(worker);
    }
  }

  onMessage(worker, data) {
    const job = this.pending.get(data?.id);
    if (!job) return;
    this.pending.delete(data.id);
    this.idle.push(worker);
    if (data.ok) {
      job.resolve(new Blob([data.buffer], { type: data.type || "image/jpeg" }));
    } else {
      job.reject(new Error(data.error || "转换失败"));
    }
    this.pump();
  }

  pump() {
    while (this.idle.length && this.queue.length) {
      const worker = this.idle.pop();
      const task = this.queue.shift();
      this.pending.set(task.id, { resolve: task.resolve, reject: task.reject, worker });
      worker.postMessage(
        {
          id: task.id,
          name: task.name,
          buffer: task.buffer,
          quality: task.quality,
        },
        [task.buffer],
      );
    }
  }

  runArwWorker(job) {
    this.ensureWorkers();
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.queue.push({
        id,
        name: job.name,
        buffer: job.buffer,
        quality: job.quality ?? 0.92,
        resolve,
        reject,
      });
      this.pump();
    });
  }

  async withHeicSlot(fn) {
    if (this.heicActive >= this.heicLimit) {
      await new Promise((resolve) => this.heicWaiters.push(resolve));
    }
    this.heicActive += 1;
    try {
      return await fn();
    } finally {
      this.heicActive -= 1;
      const next = this.heicWaiters.shift();
      if (next) next();
    }
  }

  async convertFile(file, quality = 0.92) {
    const name = file.name || "image";
    if (isHeicName(name)) {
      return this.withHeicSlot(() => convertToJpg(file, quality));
    }
    if (isArw(name)) {
      if (this.useMainForArw) {
        return convertToJpg(file, quality);
      }
      try {
        const buffer = await file.arrayBuffer();
        return await this.runArwWorker({ name, buffer, quality });
      } catch (error) {
        if (isWorkerInfraError(error)) {
          this.useMainForArw = true;
          // buffer may already be transferred — re-read from File
          return convertToJpg(file, quality);
        }
        throw error;
      }
    }
    return convertToJpg(file, quality);
  }

  warmUp() {
    preloadConverters();
  }

  terminate() {
    for (const worker of this.workers) worker.terminate();
    this.workers = [];
    this.idle = [];
    for (const [, job] of this.pending) {
      job.reject(new Error("转换已取消"));
    }
    this.pending.clear();
    for (const task of this.queue) {
      task.reject(new Error("转换已取消"));
    }
    this.queue = [];
    this.heicWaiters = [];
    this.heicActive = 0;
  }
}

let sharedPool = null;

export function getConvertPool() {
  if (!sharedPool) {
    sharedPool = new ConvertPool();
    sharedPool.warmUp();
  }
  return sharedPool;
}

export function disposeConvertPool() {
  if (sharedPool) {
    sharedPool.terminate();
    sharedPool = null;
  }
}
