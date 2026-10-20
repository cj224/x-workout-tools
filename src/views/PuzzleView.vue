<template>
  <div class="puzzle-page">
    <div class="app">
      <aside class="sidebar">
        <div class="brand-row">
          <div class="brand">拼图</div>
          <router-link class="nav-link" to="/convert">格式转换</router-link>
        </div>
        <div class="count-tabs" id="countTabs"></div>
        <div class="layout-list" id="layoutList"></div>
      </aside>

      <main class="workspace-wrap">
        <header class="toolbar">
          <button type="button" class="btn" id="btnClear">清空</button>
          <button type="button" class="btn btn-primary" id="btnPick">选择图片</button>
          <input id="fileInput" type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" multiple hidden>
          <span class="hint" id="hint">拖到另一格换序，拖到空白处或按 Delete 删除</span>
          <div class="toolbar-grow"></div>
          <button type="button" class="btn" id="btnPrev" disabled>前移</button>
          <button type="button" class="btn" id="btnNext" disabled>后移</button>
          <label class="zoom-label">缩放
            <input id="zoom" type="range" min="100" max="300" value="100" disabled>
          </label>
          <span class="zoom-val" id="zoomVal">100%</span>
        </header>
        <div class="workspace" id="workspace">
          <div class="stage-frame" id="stageFrame">
            <div class="stage" id="stage"></div>
          </div>
        </div>
      </main>

      <aside class="panel">
        <section>
          <h2>画布比例</h2>
          <div class="ratio-grid" id="ratios"></div>
          <div class="size-row">
            <label>宽
              <input id="widthInput" type="number" min="200" max="4096" step="1">
            </label>
            <button type="button" class="btn icon-btn" id="btnSwap" title="互换宽高">⇄</button>
            <label>高
              <input id="heightInput" type="number" min="200" max="4096" step="1">
            </label>
          </div>
          <p class="size-readout" id="sizeReadout"></p>
        </section>
        <section>
          <h2>滤镜</h2>
          <div class="filter-grid" id="filters"></div>
          <button type="button" class="btn btn-block" id="btnFilterAll" disabled>滤镜应用到全部</button>
        </section>
        <section>
          <h2>样式</h2>
          <label class="slider-row">边距 <span id="marginVal"></span>
            <input id="margin" type="range" min="0" max="20" value="0">
          </label>
          <label class="slider-row">间距 <span id="gapVal"></span>
            <input id="gap" type="range" min="0" max="12" value="0">
          </label>
          <label class="slider-row">圆角 <span id="radiusVal"></span>
            <input id="radius" type="range" min="0" max="20" value="0">
          </label>
          <label class="color-row">背景
            <input id="bgColor" type="color" value="#ffffff">
          </label>
        </section>
        <section>
          <h2>导出</h2>
          <div class="format-row" id="formats">
            <button type="button" class="btn seg active" data-format="image/jpeg">JPG</button>
            <button type="button" class="btn seg" data-format="image/png">PNG</button>
            <button type="button" class="btn seg" data-format="image/webp">WebP</button>
          </div>
          <label class="slider-row" id="qualityRow">质量 <span id="qualityVal"></span>
            <input id="quality" type="range" min="60" max="100" value="92">
          </label>
          <button type="button" class="btn btn-dark btn-block" id="btnExport">下载</button>
        </section>
      </aside>
    </div>
    <div class="toast" id="toast" hidden></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import { mountPuzzle } from "@/puzzle/engine";
import "@/puzzle/puzzle.css";

let destroy = null;
onMounted(() => {
  destroy = mountPuzzle();
});
onBeforeUnmount(() => {
  if (destroy) destroy();
});
</script>

<style scoped>
.puzzle-page {
  height: 100%;
}

.brand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-right: 12px;
}

.nav-link {
  color: #fdba74;
  text-decoration: none;
  font-size: 13px;
  white-space: nowrap;
}

.nav-link:hover {
  text-decoration: underline;
}
</style>
