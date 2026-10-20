<template>
  <div class="convert-page">
    <header class="top">
      <div class="top-left">
        <router-link class="back" to="/">← 拼图</router-link>
        <h1>格式转换</h1>
      </div>
      <p class="desc">前端上传 HEIC / ARW，浏览器内转成 JPG（ARW 半幅解码+自动提亮；HEIC 主线程），手动下载，不删源文件</p>
    </header>

    <main class="body">
      <el-card shadow="never" class="card">
        <el-upload
          drag
          multiple
          :auto-upload="false"
          :show-file-list="false"
          accept=".heic,.heif,.arw,image/heic,image/heif"
          :disabled="busy"
          :on-change="onUploadChange"
        >
          <div class="upload-inner">
            <p class="upload-title">拖拽或点击上传文件</p>
            <p class="upload-sub">支持 HEIC / HEIF / ARW，可多选批量上传</p>
          </div>
        </el-upload>

        <div class="quality-row">
          <span>JPG 质量</span>
          <el-slider v-model="quality" :min="60" :max="100" :disabled="busy" style="flex: 1; margin: 0 16px" />
          <span class="qval">{{ quality }}%</span>
        </div>

        <div class="actions">
          <el-button
            type="primary"
            :disabled="!pendingCount || busy"
            :loading="converting"
            @click="convertAll"
          >
            批量转换（{{ pendingCount }}）
          </el-button>
          <el-button
            type="success"
            :disabled="!doneCount || busy"
            :loading="zipping"
            @click="exportZip"
          >
            批量导出 ZIP（{{ doneCount }}）
          </el-button>
          <el-button :disabled="!items.length || busy" @click="clearAll">清空列表</el-button>
        </div>

        <div v-if="converting || progress.total > 0" class="progress-box">
          <div class="progress-label">
            <span>{{ progressLabel }}</span>
            <span>{{ progress.current }} / {{ progress.total }}</span>
          </div>
          <el-progress
            :percentage="progressPercent"
            :status="progressStatus"
            :stroke-width="14"
          />
        </div>
      </el-card>

      <el-card shadow="never" class="card list-card">
        <template #header>
          <div class="list-header">
            <span>文件列表（{{ items.length }}）</span>
            <span class="hint">转换后请手动下载；批量结果用 ZIP 导出</span>
          </div>
        </template>

        <div class="list-scroll">
          <el-empty v-if="!items.length" description="先上传 HEIC 或 ARW 文件" />

          <div v-for="item in items" :key="item.id" class="row">
            <div class="meta">
              <div class="name">{{ item.name }}</div>
              <div class="sub">
                {{ formatSize(item.size) }} · {{ item.kind.toUpperCase() }}
                <template v-if="item.message"> · {{ item.message }}</template>
              </div>
              <el-progress
                v-if="item.status === 'running'"
                :percentage="item.percent"
                :stroke-width="8"
                style="margin-top: 8px"
              />
            </div>
            <el-tag :type="statusType(item.status)" size="small">{{ statusText(item.status) }}</el-tag>
            <div class="row-actions">
              <el-button
                link
                type="primary"
                :disabled="item.status === 'done' || busy"
                :loading="item.status === 'running'"
                @click="convertOne(item)"
              >
                转换
              </el-button>
              <el-button
                v-if="item.blob"
                link
                type="success"
                :disabled="busy"
                @click="downloadBlob(item.blob, jpgName(item.name))"
              >
                下载 JPG
              </el-button>
              <el-button link type="danger" :disabled="busy" @click="removeItem(item.id)">
                移除
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import JSZip from "jszip";
import {
  disposeConvertPool,
  downloadBlob,
  getConvertPool,
  isConvertible,
  jpgName,
  preloadConverters,
} from "@/utils/convertImage";

const items = ref([]);
const quality = ref(92);
const converting = ref(false);
const zipping = ref(false);
const progress = ref({ current: 0, total: 0, label: "" });
let seq = 0;

onMounted(() => {
  preloadConverters();
  getConvertPool();
});

onBeforeUnmount(() => {
  disposeConvertPool();
});

const busy = computed(() => converting.value || zipping.value);
const pendingCount = computed(() => items.value.filter((i) => i.status !== "done").length);
const doneCount = computed(() => items.value.filter((i) => i.status === "done" && i.blob).length);
const progressPercent = computed(() => {
  if (!progress.value.total) return 0;
  return Math.min(100, Math.round((progress.value.current / progress.value.total) * 100));
});
const progressStatus = computed(() => {
  if (converting.value || zipping.value) return undefined;
  if (progress.value.total && progress.value.current >= progress.value.total) return "success";
  return undefined;
});
const progressLabel = computed(() => progress.value.label || "进度");

function formatSize(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function statusText(status) {
  return {
    pending: "待转换",
    running: "转换中",
    done: "已完成",
    error: "失败",
  }[status] || status;
}

function statusType(status) {
  return {
    pending: "info",
    running: "warning",
    done: "success",
    error: "danger",
  }[status] || "info";
}

function kindOf(name) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".arw")) return "arw";
  if (lower.endsWith(".heic") || lower.endsWith(".heif")) return "heic";
  return "unknown";
}

function addFiles(fileList) {
  const files = [...fileList].filter((f) => isConvertible(f.name));
  if (!files.length) {
    ElMessage.warning("请选择 HEIC 或 ARW 文件");
    return;
  }
  const existing = new Set(items.value.map((i) => `${i.name}:${i.size}`));
  files.forEach((file) => {
    const key = `${file.name}:${file.size}`;
    if (existing.has(key)) return;
    existing.add(key);
    items.value.push({
      id: `${Date.now()}-${seq++}`,
      name: file.name,
      size: file.size,
      kind: kindOf(file.name),
      file,
      status: "pending",
      percent: 0,
      message: "",
      blob: null,
    });
  });
}

function onUploadChange(uploadFile) {
  if (uploadFile?.raw) addFiles([uploadFile.raw]);
}

function clearAll() {
  items.value = [];
  progress.value = { current: 0, total: 0, label: "" };
}

function removeItem(id) {
  items.value = items.value.filter((i) => i.id !== id);
}

async function convertOne(item, opts = {}) {
  const { silent = false, trackBatch = false, pool = getConvertPool() } = opts;
  if (item.status === "done" || item.status === "running") return true;
  item.status = "running";
  item.percent = 8;
    item.message = item.kind === "arw" ? "RAW 解码中…" : "解码中…";
  try {
    item.percent = 35;
    const blob = await pool.convertFile(item.file, quality.value / 100);
    item.percent = 100;
    item.blob = blob;
    item.status = "done";
    item.message = `${jpgName(item.name)}（${formatSize(blob.size)}）· 可手动下载`;
    if (!silent) ElMessage.success(`${item.name} 转换完成，请点击下载`);
    return true;
  } catch (error) {
    item.status = "error";
    item.percent = 0;
    item.message = error instanceof Error ? error.message : "转换失败";
    if (!silent) ElMessage.error(`${item.name} 转换失败`);
    return false;
  } finally {
    if (trackBatch) progress.value.current += 1;
  }
}

async function convertAll() {
  const queue = items.value.filter((i) => i.status !== "done");
  if (!queue.length) return;
  converting.value = true;
  progress.value = { current: 0, total: queue.length, label: "批量转换中（Worker）" };
  const pool = getConvertPool();
  try {
    // Parallel via worker pool; UI stays responsive while workers run
    const results = await Promise.all(
      queue.map(async (item) => {
        progress.value.label = `正在转换：${item.name}`;
        const success = await convertOne(item, { silent: true, trackBatch: true, pool });
        progress.value.label = `批量转换中（Worker）${progress.value.current}/${progress.value.total}`;
        return success;
      }),
    );
    const ok = results.filter(Boolean).length;
    const fail = results.length - ok;
    progress.value.label = "批量转换完成";
    if (fail) ElMessage.warning(`批量完成：成功 ${ok}，失败 ${fail}。请手动下载或导出 ZIP`);
    else ElMessage.success(`批量完成 ${ok} 张。请手动下载单张，或导出 ZIP`);
  } finally {
    converting.value = false;
  }
}

async function exportZip() {
  const done = items.value.filter((i) => i.status === "done" && i.blob);
  if (!done.length) {
    ElMessage.warning("没有可导出的 JPG，请先转换");
    return;
  }
  zipping.value = true;
  progress.value = { current: 0, total: done.length, label: "打包 ZIP 中" };
  try {
    const zip = new JSZip();
    const used = new Map();
    for (const item of done) {
      let name = jpgName(item.name);
      const base = name.replace(/\.jpg$/i, "");
      const count = used.get(base) || 0;
      used.set(base, count + 1);
      if (count > 0) name = `${base}-${count}.jpg`;
      zip.file(name, item.blob);
      progress.value.current += 1;
      progress.value.label = `打包中：${name}`;
    }
    progress.value.label = "生成 ZIP…";
    const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "");
    downloadBlob(blob, `converted-jpg-${stamp}.zip`);
    progress.value.label = "ZIP 已生成，请保存到本地";
    ElMessage.success(`已打包 ${done.length} 张 JPG，请手动保存 ZIP`);
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "ZIP 打包失败");
  } finally {
    zipping.value = false;
  }
}
</script>

<style scoped>
.convert-page {
  min-height: 100%;
  background: #f5f4f1;
}

.top {
  padding: 20px 28px 8px;
}

.top-left {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.top h1 {
  margin: 0;
  font-size: 22px;
}

.back {
  color: #c2410c;
  text-decoration: none;
  font-size: 14px;
}

.desc {
  margin: 8px 0 0;
  color: #78716c;
  font-size: 13px;
}

.body {
  padding: 12px 28px 32px;
  display: grid;
  gap: 16px;
  max-width: 960px;
}

.card {
  border-radius: 12px;
}

.upload-inner {
  padding: 18px 0;
}

.upload-title {
  margin: 0;
  font-size: 16px;
  color: #1c1917;
}

.upload-sub {
  margin: 6px 0 0;
  color: #78716c;
  font-size: 13px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.quality-row {
  display: flex;
  align-items: center;
  margin-top: 18px;
  color: #78716c;
  font-size: 13px;
}

.qval {
  width: 42px;
  text-align: right;
}

.progress-box {
  margin-top: 18px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: #78716c;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.list-scroll {
  max-height: min(420px, calc(100vh - 380px));
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: 4px;
}

.hint {
  color: #78716c;
  font-size: 12px;
  font-weight: 400;
}

.row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e7e5e4;
}

.row:last-child {
  border-bottom: none;
}

.name {
  font-size: 14px;
  color: #1c1917;
  word-break: break-all;
}

.sub {
  margin-top: 4px;
  font-size: 12px;
  color: #78716c;
}

.row-actions {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
</style>
