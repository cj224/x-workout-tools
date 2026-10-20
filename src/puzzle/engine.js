export function mountPuzzle() {
  const MIN_SIZE = 200;
  const MAX_SIZE = 4096;

  const RATIOS = [
    { id: "1:1", w: 1, h: 1 },
    { id: "4:5", w: 4, h: 5 },
    { id: "5:4", w: 5, h: 4 },
    { id: "3:4", w: 3, h: 4 },
    { id: "4:3", w: 4, h: 3 },
    { id: "2:3", w: 2, h: 3 },
    { id: "3:2", w: 3, h: 2 },
    { id: "9:16", w: 9, h: 16 },
    { id: "16:9", w: 16, h: 9 },
  ];

  const LAYOUTS = [
    { id: "1", count: 1, label: "单图", cols: 1, rows: 1, areas: ["a"] },
    { id: "2h", count: 2, label: "左右", cols: 2, rows: 1, areas: ["a b"] },
    { id: "2v", count: 2, label: "上下", cols: 1, rows: 2, areas: ["a", "b"] },
    { id: "3h", count: 3, label: "横三", cols: 3, rows: 1, areas: ["a b c"] },
    { id: "3v", count: 3, label: "竖三", cols: 1, rows: 3, areas: ["a", "b", "c"] },
    { id: "3l", count: 3, label: "左大", cols: 2, rows: 2, areas: ["a b", "a c"] },
    { id: "3t", count: 3, label: "上大", cols: 2, rows: 2, areas: ["a a", "b c"] },
    { id: "3r", count: 3, label: "右大", cols: 2, rows: 2, areas: ["a b", "c b"] },
    { id: "3b", count: 3, label: "下大", cols: 2, rows: 2, areas: ["a b", "c c"] },
    { id: "4g", count: 4, label: "四宫格", cols: 2, rows: 2, areas: ["a b", "c d"] },
    { id: "4h", count: 4, label: "横四", cols: 4, rows: 1, areas: ["a b c d"] },
    { id: "4v", count: 4, label: "竖四", cols: 1, rows: 4, areas: ["a", "b", "c", "d"] },
    { id: "4l", count: 4, label: "左大", cols: 2, rows: 3, areas: ["a b", "a c", "a d"] },
    { id: "4t", count: 4, label: "上大", cols: 3, rows: 2, areas: ["a a a", "b c d"] },
    { id: "5h", count: 5, label: "横五", cols: 5, rows: 1, areas: ["a b c d e"] },
    { id: "5s", count: 5, label: "上二下三", cols: 6, rows: 2, areas: ["a a a b b b", "c c d d e e"] },
    { id: "5t", count: 5, label: "上一下四", cols: 4, rows: 2, areas: ["a a a a", "b c d e"] },
    { id: "5l", count: 5, label: "左大", cols: 3, rows: 2, areas: ["a b c", "a d e"] },
    { id: "6g", count: 6, label: "二行三列", cols: 3, rows: 2, areas: ["a b c", "d e f"] },
    { id: "6v", count: 6, label: "三行两列", cols: 2, rows: 3, areas: ["a b", "c d", "e f"] },
    { id: "6h", count: 6, label: "横六", cols: 6, rows: 1, areas: ["a b c d e f"] },
    { id: "6t", count: 6, label: "左大", cols: 3, rows: 3, areas: ["a a b", "a a c", "d e f"] },
    { id: "7b", count: 7, label: "上三下四", cols: 12, rows: 2, areas: ["a a a a b b b b c c c c", "d d d e e e f f f g g g"] },
    { id: "7l", count: 7, label: "左大", cols: 4, rows: 3, areas: ["a a b c", "a a d e", "a a f g"] },
    { id: "8g", count: 8, label: "二行四列", cols: 4, rows: 2, areas: ["a b c d", "e f g h"] },
    { id: "8v", count: 8, label: "四行两列", cols: 2, rows: 4, areas: ["a b", "c d", "e f", "g h"] },
    { id: "8t", count: 8, label: "上二下六", cols: 6, rows: 2, areas: ["a a a b b b", "c d e f g h"] },
    { id: "9g", count: 9, label: "九宫格", cols: 3, rows: 3, areas: ["a b c", "d e f", "g h i"] },
    { id: "9l", count: 9, label: "左上大", cols: 4, rows: 3, areas: ["a a b c", "a a d e", "f g h i"] },
  ];

  // 常用中文滤镜风格（预览 + 导出共用 CSS filter）
  const FILTERS = [
    { id: "none", label: "原图", css: "none" },
    { id: "qingtou", label: "清透", css: "contrast(0.85) brightness(1.12) saturate(0.95) hue-rotate(-6deg)" },
    { id: "xiaoqingxin", label: "小清新", css: "brightness(1.1) contrast(0.92) saturate(1.15) hue-rotate(-8deg)" },
    { id: "rixi", label: "街头日系", css: "brightness(1.08) contrast(0.95) saturate(0.85) hue-rotate(-12deg)" },
    { id: "rizaz", label: "日杂", css: "contrast(0.9) brightness(1.06) saturate(0.8) sepia(0.08)" },
    { id: "naiyou", label: "奶油肌", css: "brightness(1.12) contrast(0.88) saturate(0.92) sepia(0.06)" },
    { id: "lengbaipi", label: "冷白皮", css: "brightness(1.1) contrast(1.05) saturate(0.85) hue-rotate(-18deg)" },
    { id: "morandi", label: "莫兰迪", css: "saturate(0.55) contrast(0.92) brightness(1.05) sepia(0.12)" },
    { id: "huise", label: "灰调", css: "saturate(0.45) contrast(0.95) brightness(1.08)" },
    { id: "jiaopian", label: "地铁胶片", css: "contrast(0.95) brightness(1.05) saturate(0.9) sepia(0.18)" },
    { id: "fugu", label: "老街复古", css: "sepia(0.35) contrast(0.95) brightness(1.02) saturate(1.1)" },
    { id: "fugu80", label: "80复古", css: "contrast(0.85) brightness(1.08) sepia(0.25) hue-rotate(-8deg) saturate(1.15)" },
    { id: "gangfeng", label: "港风", css: "contrast(1.25) saturate(1.35) brightness(0.95) hue-rotate(-5deg)" },
    { id: "dianying", label: "电影感", css: "contrast(1.15) brightness(0.95) saturate(1.1) hue-rotate(-12deg)" },
    { id: "qingcheng", label: "青橙调", css: "contrast(1.1) saturate(1.2) hue-rotate(-20deg) brightness(1.02)" },
    { id: "hailan", label: "海边蓝紫", css: "hue-rotate(-28deg) saturate(1.25) contrast(1.05) brightness(1.05)" },
    { id: "nuantiao", label: "暖调食欲", css: "sepia(0.2) saturate(1.45) brightness(1.08) contrast(1.05)" },
    { id: "jietou", label: "马路街拍", css: "contrast(1.12) brightness(1.04) saturate(1.05) sepia(0.08)" },
    { id: "yepai", label: "闪光夜拍", css: "contrast(1.2) brightness(0.92) saturate(1.15) hue-rotate(8deg)" },
    { id: "heibai", label: "黑白纪实", css: "grayscale(1) contrast(1.15) brightness(1.05)" },
    { id: "yinban", label: "银盐", css: "grayscale(0.85) contrast(1.1) brightness(1.08) sepia(0.08)" },
    { id: "lomo", label: "LOMO", css: "contrast(1.35) saturate(1.4) brightness(0.92) hue-rotate(-10deg)" },
    { id: "baolilai", label: "宝丽来", css: "sepia(0.28) contrast(1.1) brightness(1.12) saturate(1.25)" },
    { id: "menghuan", label: "梦幻", css: "brightness(1.15) contrast(0.88) saturate(1.2) hue-rotate(8deg)" },
    { id: "saibo", label: "赛博朋克", css: "contrast(1.3) saturate(1.5) hue-rotate(-35deg) brightness(0.95)" },
    { id: "ins", label: "INS风", css: "contrast(1.12) saturate(1.25) brightness(1.05)" },
  ];

  const $ = (id) => document.getElementById(id);

  const state = {
    layoutId: "1",
    countFilter: 0,
    images: [],
    selected: -1,
    width: 1080,
    height: 1080,
    ratioId: "1:1",
    margin: 0,
    gap: 0,
    radius: 0,
    bg: "#ffffff",
    format: "image/jpeg",
    quality: 0.92,
    pickIndex: null,
  };

  let toastTimer = 0;

  function toast(message) {
    const el = $("toast");
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, 2400);
  }

  function clampSize(n) {
    return Math.max(MIN_SIZE, Math.min(MAX_SIZE, Math.round(n)));
  }

  function layout() {
    return LAYOUTS.find((item) => item.id === state.layoutId) || LAYOUTS[0];
  }

  function slotsOf(item) {
    const seen = [];
    item.areas.join(" ").split(/\s+/).forEach((token) => {
      if (token && !seen.includes(token)) seen.push(token);
    });
    return seen;
  }

  function isJpegOrPng(file) {
    return file.type === "image/jpeg" || file.type === "image/png" || /\.jpe?g$|\.png$/i.test(file.name);
  }

  function revokeImage(image) {
    if (image && image.url) URL.revokeObjectURL(image.url);
  }

  function applyRatio(ratio, keepWidth) {
    state.ratioId = ratio.id;
    const width = keepWidth ? state.width : state.width;
    let w = width;
    let h = Math.round(w * ratio.h / ratio.w);
    if (h > MAX_SIZE) {
      h = MAX_SIZE;
      w = Math.round(h * ratio.w / ratio.h);
    }
    if (h < MIN_SIZE) {
      h = MIN_SIZE;
      w = Math.round(h * ratio.w / ratio.h);
    }
    state.width = clampSize(w);
    state.height = clampSize(h);
    syncSizeInputs();
    renderStageFrame();
    renderRatios();
  }

  function syncSizeInputs() {
    $("widthInput").value = String(state.width);
    $("heightInput").value = String(state.height);
    const ratioText = state.ratioId ? state.ratioId : "自定义";
    $("sizeReadout").textContent = `${state.width} × ${state.height} px · ${ratioText}`;
  }

  function renderRatios() {
    $("ratios").innerHTML = RATIOS.map((ratio) => {
      const active = ratio.id === state.ratioId ? " active" : "";
      return `<button type="button" class="${active.trim()}" data-ratio="${ratio.id}">${ratio.id}</button>`;
    }).join("");
  }

  function renderCounts() {
    const tabs = [{ count: 0, label: "全部" }].concat(
      [1, 2, 3, 4, 5, 6, 7, 8, 9].map((count) => ({ count, label: String(count) }))
    );
    $("countTabs").innerHTML = tabs.map((tab) => {
      const active = tab.count === state.countFilter ? " active" : "";
      return `<button type="button" class="${active.trim()}" data-count="${tab.count}">${tab.label}</button>`;
    }).join("");
  }

  function miniHtml(item) {
    const pad = 3;
    const gap = 3;
    const W = 100;
    const H = 72;
    const cols = item.cols;
    const rows = item.rows;
    const innerW = W - pad * 2;
    const innerH = H - pad * 2;
    const cw = (innerW - gap * (cols - 1)) / cols;
    const ch = (innerH - gap * (rows - 1)) / rows;
    const rects = slotsOf(item).map((letter) => {
      let minC = cols;
      let minR = rows;
      let maxC = 0;
      let maxR = 0;
      item.areas.forEach((row, r) => {
        row.split(/\s+/).forEach((cell, c) => {
          if (cell !== letter) return;
          minC = Math.min(minC, c);
          maxC = Math.max(maxC, c);
          minR = Math.min(minR, r);
          maxR = Math.max(maxR, r);
        });
      });
      const x = pad + minC * (cw + gap);
      const y = pad + minR * (ch + gap);
      const w = (maxC - minC + 1) * cw + (maxC - minC) * gap;
      const h = (maxR - minR + 1) * ch + (maxR - minR) * gap;
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="1.5" ry="1.5"/>`;
    }).join("");
    return `<svg class="mini" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${rects}</svg>`;
  }

  function filterOf(id) {
    return FILTERS.find((item) => item.id === id) || FILTERS[0];
  }

  function filterCss(image) {
    return filterOf(image && image.filter).css;
  }

  function renderLayouts() {
    const list = LAYOUTS.filter((item) => state.countFilter === 0 || item.count === state.countFilter);
    $("layoutList").innerHTML = list.map((item) => {
      const active = item.id === state.layoutId ? " active" : "";
      return `<button type="button" class="layout-card${active}" data-layout="${item.id}">${miniHtml(item)}<span>${item.label}</span></button>`;
    }).join("");
  }

  function renderStageFrame() {
    const workspace = $("workspace");
    const frame = $("stageFrame");
    if (!workspace || !frame) return;

    // Leave room for workspace padding; keep a tiny inset so shadows aren't clipped.
    const inset = 8;
    const availW = Math.max(40, workspace.clientWidth - inset * 2);
    const availH = Math.max(40, workspace.clientHeight - inset * 2);
    const ratio = state.width / Math.max(state.height, 1);

    // Prefer fitting the whole canvas in view; scrollbars cover residual overflow.
    let displayW = availW;
    let displayH = Math.round(displayW / ratio);
    if (displayH > availH) {
      displayH = availH;
      displayW = Math.round(displayH * ratio);
    }
    displayW = Math.max(1, displayW);
    displayH = Math.max(1, displayH);

    frame.style.aspectRatio = "auto";
    frame.style.width = `${displayW}px`;
    frame.style.height = `${displayH}px`;
    frame.style.maxWidth = "none";
    frame.style.maxHeight = "none";
  }

  function imageStyle(image) {
    const s = Math.max(1, Number(image.scale) || 1);
    const fx = Number.isFinite(image.fx) ? image.fx : 50;
    const fy = Number.isFinite(image.fy) ? image.fy : 50;
    const filter = filterCss(image);
    // scale=1：用 object-position 裁切平移
    // scale>1：放大盒子再用 left/top 平移，保证格子内可左右/上下拖动
    if (s <= 1.001) {
      return `inset:0;width:100%;height:100%;left:auto;top:auto;object-position:${fx}% ${fy}%;transform:none;filter:${filter}`;
    }
    const left = (1 - s) * fx;
    const top = (1 - s) * fy;
    return `inset:auto;width:${s * 100}%;height:${s * 100}%;left:${left}%;top:${top}%;object-position:50% 50%;transform:none;filter:${filter}`;
  }

  function renderFilters() {
    const has = state.selected >= 0 && state.images[state.selected];
    const current = has ? (state.images[state.selected].filter || "none") : "none";
    $("filters").innerHTML = FILTERS.map((item) => {
      const active = item.id === current ? " active" : "";
      const disabled = has ? "" : " disabled";
      return `<button type="button" class="${active.trim()}" data-filter="${item.id}"${disabled}>${item.label}</button>`;
    }).join("");
    $("btnFilterAll").disabled = !has;
  }

  function renderStage() {
    const item = layout();
    const stage = $("stage");
    const areas = item.areas.map((row) => `"${row}"`).join(" ");
    stage.style.gridTemplateColumns = `repeat(${item.cols}, 1fr)`;
    stage.style.gridTemplateRows = `repeat(${item.rows}, 1fr)`;
    stage.style.gridTemplateAreas = areas;
    stage.style.background = state.bg;
    stage.style.aspectRatio = "auto";
    stage.style.width = "100%";
    stage.style.height = "100%";
    const letters = slotsOf(item);
    stage.innerHTML = letters.map((letter, index) => {
      const image = state.images[index];
      const selected = index === state.selected ? " selected" : "";
      const body = image
        ? `<img alt="" draggable="false" src="${image.url}" style="${imageStyle(image)}">`
        : `<button type="button" class="empty" data-add="${index}"><strong>+</strong><span>添加</span></button>`;
      return `<div class="cell${selected}" style="grid-area:${letter}" data-index="${index}">${body}</div>`;
    }).join("");
    applySpacing();
    const hidden = state.images.slice(letters.length).filter(Boolean).length;
    $("hint").textContent = hidden
      ? `还有 ${hidden} 张未显示，可换更大的布局`
      : "拖到另一格换序，拖到空白处或按 Delete 删除";
  }

  function applySpacing() {
    const stage = $("stage");
    const width = stage.clientWidth || state.width;
    const pad = width * state.margin / 100;
    const gap = width * state.gap / 100;
    const radius = width * state.radius / 100;
    stage.style.padding = `${pad}px`;
    stage.style.gap = `${gap}px`;
    stage.querySelectorAll(".cell").forEach((cell) => {
      cell.style.borderRadius = `${radius}px`;
    });
  }

  function updateSelectionUI() {
    const has = state.selected >= 0 && state.images[state.selected];
    $("btnPrev").disabled = !has || state.selected === 0;
    $("btnNext").disabled = !has || state.selected >= state.images.length - 1;
    $("zoom").disabled = !has;
    const scale = has ? state.images[state.selected].scale : 1;
    $("zoom").value = String(Math.round(scale * 100));
    $("zoomVal").textContent = `${Math.round(scale * 100)}%`;
    renderFilters();
  }

  function render() {
    renderStageFrame();
    renderStage();
    updateSelectionUI();
    renderLayouts();
  }

  function select(index) {
    state.selected = index;
    renderStage();
    updateSelectionUI();
  }

  function trimTrailing() {
    while (state.images.length && !state.images[state.images.length - 1]) state.images.pop();
  }

  function moveSelected(step) {
    const from = state.selected;
    const to = from + step;
    if (from < 0 || !state.images[from] || to < 0) return;
    swap(from, to);
  }

  function swap(a, b) {
    if (a === b || a < 0 || b < 0 || Number.isNaN(a) || Number.isNaN(b)) return;
    const max = Math.max(a, b);
    while (state.images.length <= max) state.images.push(null);
    const tmp = state.images[a];
    state.images[a] = state.images[b];
    state.images[b] = tmp;
    trimTrailing();
    if (state.selected === a) state.selected = b;
    else if (state.selected === b) state.selected = a;
    render();
  }

  function loadFiles(fileList, startIndex) {
    const files = [...fileList];
    const accepted = [];
    let skipped = 0;
    files.forEach((file) => {
      if (isJpegOrPng(file)) accepted.push(file);
      else skipped += 1;
    });
    if (!accepted.length) {
      if (skipped) toast("只支持 JPG 和 PNG");
      return;
    }
    if (skipped) toast(`已跳过 ${skipped} 个不支持的文件`);

    let cursor = startIndex == null ? firstHole() : startIndex;
    const sequential = startIndex != null;
    accepted.forEach((file) => {
      const url = URL.createObjectURL(file);
      const image = { url, name: file.name, scale: 1, fx: 50, fy: 50, filter: "none", bitmap: new Image() };
      image.bitmap.src = url;
      while (state.images.length < cursor) state.images.push(null);
      if (state.images[cursor]) revokeImage(state.images[cursor]);
      if (cursor === state.images.length) state.images.push(image);
      else state.images[cursor] = image;
      cursor = sequential ? cursor + 1 : firstHole();
    });
    trimTrailing();
    if (state.selected < 0 && state.images.length) state.selected = startIndex == null ? 0 : startIndex;
    render();
  }

  function firstHole() {
    const count = slotsOf(layout()).length;
    for (let i = 0; i < count; i += 1) {
      if (!state.images[i]) return i;
    }
    return state.images.length;
  }

  function clearCanvas() {
    state.images.forEach(revokeImage);
    state.images = [];
    state.selected = -1;
    render();
  }

  function removeAt(index) {
    const image = state.images[index];
    if (!image) return;
    revokeImage(image);
    state.images[index] = null;
    trimTrailing();
    if (!state.images[state.selected]) state.selected = -1;
    render();
  }

  function cellRects(item, x, y, w, h, gap) {
    const cols = item.cols;
    const rows = item.rows;
    const cw = (w - gap * (cols - 1)) / cols;
    const ch = (h - gap * (rows - 1)) / rows;
    return slotsOf(item).map((letter) => {
      let minC = cols;
      let minR = rows;
      let maxC = 0;
      let maxR = 0;
      item.areas.forEach((row, r) => {
        row.split(/\s+/).forEach((cell, c) => {
          if (cell !== letter) return;
          minC = Math.min(minC, c);
          maxC = Math.max(maxC, c);
          minR = Math.min(minR, r);
          maxR = Math.max(maxR, r);
        });
      });
      return {
        x: x + minC * (cw + gap),
        y: y + minR * (ch + gap),
        w: (maxC - minC + 1) * cw + (maxC - minC) * gap,
        h: (maxR - minR + 1) * ch + (maxR - minR) * gap,
      };
    });
  }

  function drawCover(ctx, image, rect) {
    const bitmap = image.bitmap;
    if (!bitmap.naturalWidth) return;
    const iw = bitmap.naturalWidth;
    const ih = bitmap.naturalHeight;
    const s = Math.max(1, Number(image.scale) || 1);
    const fx = (Number.isFinite(image.fx) ? image.fx : 50) / 100;
    const fy = (Number.isFinite(image.fy) ? image.fy : 50) / 100;

    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    ctx.filter = filterCss(image);

    if (s <= 1.001) {
      const cover = Math.max(rect.w / iw, rect.h / ih);
      const dw = iw * cover;
      const dh = ih * cover;
      let left = rect.x + fx * rect.w - fx * dw;
      let top = rect.y + fy * rect.h - fy * dh;
      left = Math.min(rect.x, Math.max(rect.x + rect.w - dw, left));
      top = Math.min(rect.y, Math.max(rect.y + rect.h - dh, top));
      ctx.drawImage(bitmap, left, top, dw, dh);
    } else {
      // Match preview: oversized cover box + left/top = (1-s)*fx
      const boxW = rect.w * s;
      const boxH = rect.h * s;
      const boxX = rect.x + rect.w * (1 - s) * fx;
      const boxY = rect.y + rect.h * (1 - s) * fy;
      const cover = Math.max(boxW / iw, boxH / ih);
      const dw = iw * cover;
      const dh = ih * cover;
      const left = boxX + (boxW - dw) / 2;
      const top = boxY + (boxH - dh) / 2;
      ctx.drawImage(bitmap, left, top, dw, dh);
    }

    ctx.filter = "none";
    ctx.restore();
  }

  function roundClip(ctx, x, y, w, h, r) {
    const radius = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
    ctx.clip();
  }

  async function exportImage() {
    await Promise.all(state.images.filter(Boolean).map((image) => {
      if (image.bitmap.complete && image.bitmap.naturalWidth) return Promise.resolve();
      return image.bitmap.decode().catch(() => {});
    }));
    const item = layout();
    const canvas = document.createElement("canvas");
    canvas.width = state.width;
    canvas.height = state.height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = state.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const pad = canvas.width * state.margin / 100;
    const gap = canvas.width * state.gap / 100;
    const radius = canvas.width * state.radius / 100;
    const rects = cellRects(item, pad, pad, canvas.width - pad * 2, canvas.height - pad * 2, gap);
    rects.forEach((rect, index) => {
      const image = state.images[index];
      if (!image) return;
      ctx.save();
      roundClip(ctx, rect.x, rect.y, rect.w, rect.h, radius);
      drawCover(ctx, image, rect);
      ctx.restore();
    });
    const quality = state.format === "image/png" ? undefined : state.quality;
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, state.format, quality));
    if (!blob) {
      toast("当前浏览器不支持这个格式");
      return;
    }
    const ext = state.format === "image/png" ? "png" : state.format === "image/webp" ? "webp" : "jpg";
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "");
    link.download = `puzzle-${stamp}.${ext}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1500);
  }

  function onFileDrop(event, startIndex) {
    event.preventDefault();
    $("workspace").classList.remove("dragover");
    const files = event.dataTransfer.files;
    if (files && files.length) {
      loadFiles(files, startIndex);
      return true;
    }
    return false;
  }

  $("countTabs").addEventListener("click", (event) => {
    const button = event.target.closest("[data-count]");
    if (!button) return;
    state.countFilter = Number(button.dataset.count);
    renderCounts();
    renderLayouts();
  });

  $("layoutList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-layout]");
    if (!button) return;
    state.layoutId = button.dataset.layout;
    render();
  });

  $("filters").addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button || button.disabled) return;
    const image = state.images[state.selected];
    if (!image) return;
    image.filter = button.dataset.filter;
    const img = $("stage").querySelector(`.cell[data-index="${state.selected}"] img`);
    if (img) img.style.cssText = imageStyle(image);
    renderFilters();
  });

  $("btnFilterAll").addEventListener("click", () => {
    const image = state.images[state.selected];
    if (!image) return;
    const filter = image.filter || "none";
    state.images.forEach((item) => {
      if (item) item.filter = filter;
    });
    renderStage();
    renderFilters();
    toast(`已应用「${filterOf(filter).label}」到全部`);
  });

  $("ratios").addEventListener("click", (event) => {
    const button = event.target.closest("[data-ratio]");
    if (!button) return;
    const ratio = RATIOS.find((item) => item.id === button.dataset.ratio);
    applyRatio(ratio, true);
  });

  $("widthInput").addEventListener("change", () => {
    state.width = clampSize(Number($("widthInput").value) || state.width);
    state.ratioId = null;
    syncSizeInputs();
    renderStageFrame();
    renderRatios();
  });

  $("heightInput").addEventListener("change", () => {
    state.height = clampSize(Number($("heightInput").value) || state.height);
    state.ratioId = null;
    syncSizeInputs();
    renderStageFrame();
    renderRatios();
  });

  $("btnSwap").addEventListener("click", () => {
    const width = state.width;
    state.width = state.height;
    state.height = width;
    const flipped = RATIOS.find((ratio) => Math.abs(ratio.w / ratio.h - state.width / state.height) < 0.01);
    state.ratioId = flipped ? flipped.id : null;
    syncSizeInputs();
    renderStageFrame();
    renderRatios();
  });

  function styleSlider(id, key, labelId, suffix) {
    const input = $(id);
    const paint = () => {
      state[key] = Number(input.value);
      $(labelId).textContent = `${input.value}${suffix}`;
      applySpacing();
    };
    input.addEventListener("input", paint);
    paint();
  }

  styleSlider("margin", "margin", "marginVal", "%");
  styleSlider("gap", "gap", "gapVal", "%");
  styleSlider("radius", "radius", "radiusVal", "%");

  $("bgColor").addEventListener("input", () => {
    state.bg = $("bgColor").value;
    $("stage").style.background = state.bg;
  });

  $("formats").addEventListener("click", (event) => {
    const button = event.target.closest("[data-format]");
    if (!button) return;
    state.format = button.dataset.format;
    $("formats").querySelectorAll("button").forEach((el) => el.classList.toggle("active", el === button));
    $("qualityRow").style.display = state.format === "image/png" ? "none" : "";
  });

  $("quality").addEventListener("input", () => {
    state.quality = Number($("quality").value) / 100;
    $("qualityVal").textContent = `${$("quality").value}%`;
  });
  $("qualityVal").textContent = "92%";

  $("btnPick").addEventListener("click", () => {
    state.pickIndex = null;
    $("fileInput").click();
  });

  $("fileInput").addEventListener("change", () => {
    const start = state.pickIndex;
    state.pickIndex = null;
    loadFiles($("fileInput").files, start);
    $("fileInput").value = "";
  });

  $("btnClear").addEventListener("click", clearCanvas);
  $("btnPrev").addEventListener("click", () => moveSelected(-1));
  $("btnNext").addEventListener("click", () => moveSelected(1));
  $("btnExport").addEventListener("click", () => {
    exportImage().catch(() => toast("导出失败"));
  });

  $("zoom").addEventListener("input", () => {
    const image = state.images[state.selected];
    if (!image) return;
    image.scale = Number($("zoom").value) / 100;
    $("zoomVal").textContent = `${$("zoom").value}%`;
    const img = $("stage").querySelector(`.cell[data-index="${state.selected}"] img`);
    if (img) img.style.cssText = imageStyle(image);
  });

  let suppressClick = false;
  $("stage").addEventListener("click", (event) => {
    if (suppressClick) {
      suppressClick = false;
      event.preventDefault();
      return;
    }
    const add = event.target.closest("[data-add]");
    if (add) {
      state.pickIndex = Number(add.dataset.add);
      state.selected = state.pickIndex;
      $("fileInput").click();
      return;
    }
    const cell = event.target.closest(".cell");
    if (!cell) return;
    select(Number(cell.dataset.index));
  });

  $("stage").addEventListener("wheel", (event) => {
    const cell = event.target.closest(".cell");
    if (!cell) return;
    const index = Number(cell.dataset.index);
    const image = state.images[index];
    if (!image) return;
    event.preventDefault();
    const next = image.scale + (event.deltaY < 0 ? 0.08 : -0.08);
    image.scale = Math.max(1, Math.min(3, Math.round(next * 100) / 100));
    state.selected = index;
    const img = cell.querySelector("img");
    if (img) img.style.cssText = imageStyle(image);
    updateSelectionUI();
    cell.classList.add("selected");
  }, { passive: false });

  let gesture = null;

  function cellAt(x, y) {
    const hit = document.elementFromPoint(x, y);
    return hit ? hit.closest(".cell") : null;
  }

  function clearDragMarks() {
    $("stage").querySelectorAll(".drop-target, .is-dragging").forEach((el) => {
      el.classList.remove("drop-target", "is-dragging");
    });
    $("workspace").classList.remove("will-delete");
  }

  function applyPanFromPointer(gestureState, event, cell, image) {
    const rect = cell.getBoundingClientRect();
    // 在格子内拖过一整格 ≈ 走完 fx/fy 全范围，放大后左右移动更跟手
    const dx = ((event.clientX - gestureState.x) / Math.max(rect.width, 1)) * 100;
    const dy = ((event.clientY - gestureState.y) / Math.max(rect.height, 1)) * 100;
    image.fx = Math.max(0, Math.min(100, gestureState.fx - dx));
    image.fy = Math.max(0, Math.min(100, gestureState.fy - dy));
    const img = cell.querySelector("img");
    if (img) {
      img.style.cssText = imageStyle(image);
      img.style.cursor = "grabbing";
    }
  }

  $("stage").addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.target.closest(".empty")) return;
    const cell = event.target.closest(".cell");
    if (!cell) return;
    const index = Number(cell.dataset.index);
    const image = state.images[index];
    if (!image) return;
    state.selected = index;
    gesture = {
      mode: "pending",
      index,
      x: event.clientX,
      y: event.clientY,
      fx: image.fx,
      fy: image.fy,
      pointer: event.pointerId,
    };
    try { cell.setPointerCapture(event.pointerId); } catch (err) { /* pointer may already be released */ }
  });

  $("stage").addEventListener("pointermove", (event) => {
    if (!gesture || gesture.pointer !== event.pointerId) return;
    const image = state.images[gesture.index];
    const cell = $("stage").querySelector(`.cell[data-index="${gesture.index}"]`);
    if (!image || !cell) return;
    const moved = Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y);
    const inside = cellAt(event.clientX, event.clientY) === cell;

    // 在原格子内：平移（放大后可左右/上下移动画面）
    if (gesture.mode !== "drag" && inside) {
      if (moved < 4) return;
      gesture.mode = "pan";
      applyPanFromPointer(gesture, event, cell, image);
      return;
    }

    // 拖出格子：切换为换序 / 拖到空白处删除
    if (gesture.mode !== "drag") {
      if (moved < 4) return;
      image.fx = gesture.fx;
      image.fy = gesture.fy;
      const img = cell.querySelector("img");
      if (img) img.style.cssText = imageStyle(image);
      gesture.mode = "drag";
    }

    clearDragMarks();
    cell.classList.add("is-dragging");
    const hit = document.elementFromPoint(event.clientX, event.clientY);
    const target = hit ? hit.closest(".cell") : null;
    const outsideStage = !hit || !hit.closest("#stage");
    if (target && Number(target.dataset.index) !== gesture.index) {
      target.classList.add("drop-target");
    } else if (outsideStage && !(hit && hit.closest(".sidebar, .panel, .toolbar"))) {
      $("workspace").classList.add("will-delete");
    }
  });

  function endGesture(event) {
    if (!gesture || (event && gesture.pointer !== event.pointerId)) return;
    const current = gesture;
    gesture = null;
    clearDragMarks();
    if (current.mode !== "drag") {
      if (current.mode === "pan") updateSelectionUI();
      return;
    }
    suppressClick = true;
    const hit = document.elementFromPoint(event.clientX, event.clientY);
    const targetCell = hit ? hit.closest(".cell") : null;
    if (targetCell) {
      const target = Number(targetCell.dataset.index);
      if (target !== current.index) swap(current.index, target);
      else renderStage();
      return;
    }
    // 拖到工作区空白处删除；停在画布格内/侧栏/工具栏则取消
    if (hit && hit.closest("#stage, .sidebar, .panel, .toolbar")) {
      renderStage();
      return;
    }
    removeAt(current.index);
  }
  $("stage").addEventListener("pointerup", endGesture);
  $("stage").addEventListener("pointercancel", (event) => {
    if (!gesture || gesture.pointer !== event.pointerId) return;
    const image = state.images[gesture.index];
    if (image && gesture.mode === "drag") {
      image.fx = gesture.fx;
      image.fy = gesture.fy;
    }
    gesture = null;
    clearDragMarks();
  });

  document.addEventListener("keydown", onKeyDown);

  $("stage").addEventListener("dragover", (event) => {
    event.preventDefault();
    const cell = event.target.closest(".cell");
    $("stage").querySelectorAll(".cell").forEach((el) => el.classList.toggle("drop-target", el === cell));
  });

  $("stage").addEventListener("dragleave", (event) => {
    if (event.target === $("stage")) {
      $("stage").querySelectorAll(".drop-target").forEach((el) => el.classList.remove("drop-target"));
    }
  });

  $("stage").addEventListener("drop", (event) => {
    $("stage").querySelectorAll(".drop-target").forEach((el) => el.classList.remove("drop-target"));
    const cell = event.target.closest(".cell");
    const startIndex = cell ? Number(cell.dataset.index) : null;
    if (onFileDrop(event, startIndex)) return;
    const from = Number(event.dataTransfer.getData("text/puzzle-index"));
    if (Number.isNaN(from) || startIndex == null) return;
    event.preventDefault();
    swap(from, startIndex);
  });

  const workspace = $("workspace");
  workspace.addEventListener("dragover", (event) => {
    event.preventDefault();
    workspace.classList.add("dragover");
  });
  workspace.addEventListener("dragleave", (event) => {
    if (!workspace.contains(event.relatedTarget)) workspace.classList.remove("dragover");
  });
  workspace.addEventListener("drop", (event) => {
    if (event.target.closest("#stage")) return;
    if (onFileDrop(event, null)) return;
    const from = Number(event.dataTransfer.getData("text/puzzle-index"));
    if (Number.isNaN(from)) return;
    event.preventDefault();
    removeAt(from);
  });

  function onResize() {
    renderStageFrame();
    applySpacing();
  }

  function onKeyDown(event) {
    if (event.key !== "Delete" && event.key !== "Backspace") return;
    if (event.target instanceof Element && event.target.closest("input, textarea")) return;
    if (!state.images[state.selected]) return;
    event.preventDefault();
    removeAt(state.selected);
  }

  window.addEventListener("resize", onResize);

  renderCounts();
  renderRatios();
  syncSizeInputs();
  render();

  return function destroyPuzzle() {
    clearTimeout(toastTimer);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("keydown", onKeyDown);
    state.images.forEach(revokeImage);
  };
}
