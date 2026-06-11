/**
 * editor.js
 * Saytning barcha interaktivligi.
 *
 * AppState yangi maydonlari:
 *   teacherImg   – sinf rahbari Image ob'ekti (inner shablon uchun)
 *   teacherName  – classInfo.teacherName dan olinadi
 */

// ===== GLOBAL STATE =====
window.AppState = {
  selectedTemplate:    null,
  students:            [],   // [{ name, img, url }]
  classInfo:           {},
  teacherImg:          null, // sinf rahbari rasmi
  leftImg:             null, // split-inner chap portret rasmi
  splitBgImg:          null, // split-inner fon rasmi
  transforms:          {},   // free-transform: key -> {scale, ox, oy}
  _regions:            [],   // joriy preview dagi rasm hududlari (hit-test uchun)
  previewZoom:         1,     // tahrirlash oynasi masshtabi
  faces:               {},    // {studentIdx: {cx,cy,fh}} yuz aniqlash natijasi
  currentPreviewIdx:   0,
};

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', () => {
  initTemplateGrid();
  initUploadSection();
  initTeacherUpload();
  initEditorControls();
  initNavigation();
});

// ============================================================
// STEP 1 – TEMPLATE SELECTION
// ============================================================
function initTemplateGrid() {
  const grid = document.getElementById('templatesGrid');
  const tabs = document.querySelectorAll('.tab-btn');

  function renderTemplates(type) {
    grid.innerHTML = '';
    const list = window.TEMPLATES.filter(t =>
      type === 'all' ||
      t.type === type ||
      (type === 'inner' && (t.type === 'split-inner' || t.type === 'poster-inner'))  // ichki tabga qo'shamiz
    );

    list.forEach(tpl => {
      const card = document.createElement('div');
      card.className = 'template-card';
      card.dataset.id = tpl.id;

      const previewCanvas       = document.createElement('canvas');
      previewCanvas.width       = 180;
      previewCanvas.height      = tpl.type === 'id-card' ? 116 : 240;
      previewCanvas.style.cssText = 'width:100%;height:auto;display:block';
      renderTemplateThumb(previewCanvas.getContext('2d'), tpl,
                          previewCanvas.width, previewCanvas.height);

      card.innerHTML = `
        <div class="tpl-preview"></div>
        <div class="tpl-label">
          <h4>${tpl.name}</h4>
          <p>${tpl.desc}</p>
        </div>
        <div class="selected-badge">✓</div>`;
      card.querySelector('.tpl-preview').appendChild(previewCanvas);
      card.addEventListener('click', () => selectTemplate(card, tpl));
      grid.appendChild(card);
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderTemplates(tab.dataset.type);
    });
  });

  renderTemplates('vinyetka');
}

function renderTemplateThumb(ctx, tpl, w, h) {
  const fakeStudents = [
    { name: 'Ism Familya', img: null },
    { name: 'O\'quvchi 2',  img: null },
    { name: 'O\'quvchi 3',  img: null },
    { name: 'O\'quvchi 4',  img: null },
    { name: 'O\'quvchi 5',  img: null },
  ];
  const cfg = {
    w, h,
    photo:        null,
    studentName:  'Ism Familya',
    allStudents:  fakeStudents,
    ownerIndex:   0,
    teacherImg:   null,
    nameFontSize:   Math.round(w * 0.055),
    schoolFontSize: Math.round(w * 0.032),
    nameColor:    tpl.nameColor,
    schoolColor:  tpl.schoolColor,
    bgColor1:     tpl.bgColor1,
    bgColor2:     tpl.bgColor2,
    accentColor:  tpl.accentColor,
    photoScale:   90,
    photoOffsetY: 0,
    photoShape:   tpl.type === 'inner' ? 'rounded' : 'circle',
    canvasW: w, canvasH: h,
  };
  const fakeData = {
    schoolNumber: 'Maktab №1',
    className:    '11-A',
    schoolYear:   '2025-2026',
    cityName:     'Toshkent',
    teacherName:  'O\'qituvchi F.I.O',
    schoolName:   '1-son maktab',
  };
  tpl.draw(ctx, fakeData, cfg);
}

function selectTemplate(card, tpl) {
  document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  window.AppState.selectedTemplate = tpl;

  // Sinf rahbari upload blokini ko'rsat/yashir
  const wrap = document.getElementById('teacherUploadWrap');
  if (wrap) wrap.style.display = tpl.type === 'inner' ? 'block' : 'none';

  // Split-inner upload blokini ko'rsat/yashir
  const splitWrap = document.getElementById('leftPhotoUploadWrap');
  if (splitWrap) splitWrap.style.display =
    (tpl.type === 'split-inner' || tpl.type === 'poster-inner') ? 'block' : 'none';

  // Canvas default o'lchamlari
  document.getElementById('canvasW').value      = tpl.defaultW;
  document.getElementById('canvasH').value      = tpl.defaultH;
  document.getElementById('bgColor1').value     = tpl.bgColor1;
  document.getElementById('bgColor2').value     = tpl.bgColor2;
  document.getElementById('accentColor').value  = tpl.accentColor;
  document.getElementById('nameColor').value    = tpl.nameColor;
  document.getElementById('schoolColor').value  = tpl.schoolColor;

  // Inner shablon uchun shrift o'lchamlarini moslashtir
  if (tpl.type === 'inner') {
    document.getElementById('nameFontSize').value    = 14;
    document.getElementById('nameFontSizeVal').textContent = '14px';
    document.getElementById('schoolFontSize').value  = 13;
    document.getElementById('schoolFontSizeVal').textContent = '13px';
    document.getElementById('photoShape').value = 'rounded';
  }

  // Bitiruvchi albom ichki sahifa uchun maxsus defaultlar
  if (tpl.id === 'bitiruvchi-albom-inner') {
    document.getElementById('photoShape').value = 'rect';
    document.getElementById('photoScale').value = 100;
    document.getElementById('photoScaleVal').textContent = '100%';
    document.getElementById('canvasW').value = 1200;
    document.getElementById('canvasH').value = 900;
    document.getElementById('nameFontSize').value = 12;
    document.getElementById('nameFontSizeVal').textContent = '12px';
    document.getElementById('schoolFontSize').value = 11;
    document.getElementById('schoolFontSizeVal').textContent = '11px';
    document.getElementById('bgColor1').value = '#0a0a0a';
    document.getElementById('bgColor2').value = '#0a0a0a';
    document.getElementById('nameColor').value = '#ffffff';
    document.getElementById('accentColor').value = '#ffffff';
  }

  // Split-inner shablon uchun maxsus defaultlar
  if (tpl.id === 'split-inner') {
    document.getElementById('canvasW').value = 1440;
    document.getElementById('canvasH').value = 1098;
    document.getElementById('photoShape').value = 'rounded';
    document.getElementById('photoScale').value = 100;
    document.getElementById('photoScaleVal').textContent = '100%';
    document.getElementById('bgColor1').value = '#0f172a';
    document.getElementById('bgColor2').value = '#1e3a5f';
    document.getElementById('nameColor').value = '#ffffff';
    document.getElementById('accentColor').value = '#6366f1';
    document.getElementById('nameFontSize').value = 0;
    document.getElementById('nameFontSizeVal').textContent = '0px';
  }

  // Poster-split shablon uchun maxsus defaultlar (aniq o'lcham, landscape)
  if (tpl.id === 'poster-split') {
    document.getElementById('canvasW').value = 4724;
    document.getElementById('canvasH').value = 3602;
    document.getElementById('bgColor1').value = '#000000';
    document.getElementById('bgColor2').value = '#000000';
  }

  document.getElementById('toStep2').disabled = false;
}

// ============================================================
// SINF RAHBARI RASM YUKLASH
// ============================================================
function initTeacherUpload() {
  const dropZone    = document.getElementById('teacherDropZone');
  const fileInput   = document.getElementById('teacherFileInput');
  const thumb       = document.getElementById('teacherThumb');
  const previewDiv  = document.getElementById('teacherPreviewImg');
  const placeholder = document.getElementById('teacherPlaceholder');
  const removeBtn   = document.getElementById('teacherRemove');

  if (!dropZone) return;

  function loadTeacherFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      window.AppState.teacherImg = img;
      thumb.src = url;
      previewDiv.style.display  = 'block';
      placeholder.style.display = 'none';
    };
    img.src = url;
  }

  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.style.borderColor = '#6366f1'; });
  dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = ''; });
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.style.borderColor = '';
    loadTeacherFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', () => {
    loadTeacherFile(fileInput.files[0]);
    fileInput.value = '';
  });
  removeBtn && removeBtn.addEventListener('click', e => {
    e.stopPropagation();
    window.AppState.teacherImg  = null;
    thumb.src                   = '';
    previewDiv.style.display    = 'none';
    placeholder.style.display   = '';
  });

  // ── FON RASM (split-inner uchun) ──
  initImageUpload({
    dropZoneId:   'splitBgDropZone',
    fileInputId:  'splitBgFileInput',
    thumbId:      'splitBgThumb',
    previewDivId: 'splitBgPreviewDiv',
    placeholderId:'splitBgPlaceholder',
    removeBtnId:  'splitBgRemove',
    stateKey:     'splitBgImg',
  });

  // splitBgType o'zgarganda panellarni ko'rsat/yashir
  const splitBgTypeEl = document.getElementById('splitBgType');
  if (splitBgTypeEl) {
    splitBgTypeEl.addEventListener('change', () => {
      const v = splitBgTypeEl.value;
      const cg = document.getElementById('splitBgColorGroup');
      const c2 = document.getElementById('splitBgColor2Group');
      const ig = document.getElementById('splitBgImageGroup');
      if (cg) cg.style.display = v !== 'image' ? '' : 'none';
      if (c2) c2.style.display = v === 'gradient' ? '' : 'none';
      if (ig) ig.style.display = v === 'image' ? '' : 'none';
      renderPreview();
    });
  }
}

// Umumiy rasm yuklash yordamchi funksiyasi
function initImageUpload({ dropZoneId, fileInputId, thumbId, previewDivId, placeholderId, removeBtnId, stateKey }) {
  const dz   = document.getElementById(dropZoneId);
  const fi   = document.getElementById(fileInputId);
  const th   = document.getElementById(thumbId);
  const pd   = document.getElementById(previewDivId);
  const pl   = document.getElementById(placeholderId);
  const rb   = document.getElementById(removeBtnId);
  if (!dz || !fi) return;

  function load(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      window.AppState[stateKey] = img;
      if (th) th.src = url;
      if (pd) pd.style.display = 'block';
      if (pl) pl.style.display = 'none';
      renderPreview();
    };
    img.src = url;
  }

  dz.addEventListener('click', () => fi.click());
  dz.addEventListener('dragover',  e => { e.preventDefault(); dz.style.borderColor='#6366f1'; });
  dz.addEventListener('dragleave', () => { dz.style.borderColor=''; });
  dz.addEventListener('drop', e => { e.preventDefault(); dz.style.borderColor=''; load(e.dataTransfer.files[0]); });
  fi.addEventListener('change', () => { load(fi.files[0]); fi.value=''; });
  rb && rb.addEventListener('click', e => {
    e.stopPropagation();
    window.AppState[stateKey] = null;
    if (th) th.src = '';
    if (pd) pd.style.display = 'none';
    if (pl) pl.style.display = '';
    renderPreview();
  });
}

// ============================================================
// STEP 2 – O'QUVCHILAR YUKLASH
// ============================================================
function initUploadSection() {
  const dropZone  = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');

  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('dragging'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault(); dropZone.classList.remove('dragging');
    handleFiles(Array.from(e.dataTransfer.files));
  });
  fileInput.addEventListener('change', () => {
    handleFiles(Array.from(fileInput.files));
    fileInput.value = '';
  });
  document.getElementById('clearAll').addEventListener('click', () => {
    window.AppState.students = [];
    renderStudentsList();
  });
}

function handleFiles(files) {
  const imgs = files.filter(f => f.type.startsWith('image/'));
  if (!imgs.length) return;
  Promise.all(imgs.map(loadStudentFile)).then(newStudents => {
    // Yangi o'quvchilar RO'YXAT BOSHIGA qo'shiladi
    window.AppState.students = [...newStudents, ...window.AppState.students];
    renderStudentsList();
  });
}

async function loadStudentFile(file) {
  const name = file.name.replace(/\.[^.]+$/, '').trim();
  const { img, url } = await loadCorrectedImage(file);
  return { name, img, url };
}

// EXIF orientatsiyani to'g'rilab rasm yuklaydi (yonboshlab yuklanmasin)
async function loadCorrectedImage(file) {
  try {
    let bmp;
    try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
    catch (e) { bmp = await createImageBitmap(file); }
    const c = document.createElement('canvas');
    c.width = bmp.width; c.height = bmp.height;
    c.getContext('2d').drawImage(bmp, 0, 0);
    if (bmp.close) bmp.close();
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.92));
    const url = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise(res => { img.onload = res; img.onerror = res; img.src = url; });
    return { img, url };
  } catch (e) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    await new Promise(res => { img.onload = res; img.onerror = res; img.src = url; });
    return { img, url };
  }
}

function renderStudentsList() {
  const list      = document.getElementById('studentsList');
  const stats     = document.getElementById('uploadStats');
  const count     = document.getElementById('countLoaded');
  const toStep3   = document.getElementById('toStep3');
  const students  = window.AppState.students;

  list.innerHTML = '';

  if (!students.length) {
    stats.style.display = 'none';
    toStep3.disabled    = true;
    return;
  }

  students.forEach((s, i) => {
    const row = document.createElement('div');
    row.className = 'student-row';
    row.innerHTML = `
      <div class="student-order">${i + 1}</div>
      ${s.url
        ? `<img class="student-thumb" src="${s.url}" alt="${escHtml(s.name)}"/>`
        : '<div class="student-thumb" style="background:#2a2a3a;border-radius:6px"></div>'}
      <input class="student-name-input" value="${escHtml(s.name)}"
             placeholder="Ism Familya" data-idx="${i}"/>
      <button class="student-del" data-idx="${i}" title="O'chirish">✕</button>`;
    list.appendChild(row);
  });

  list.querySelectorAll('.student-name-input').forEach(inp =>
    inp.addEventListener('input', e =>
      (window.AppState.students[+e.target.dataset.idx].name = e.target.value)));

  list.querySelectorAll('.student-del').forEach(btn =>
    btn.addEventListener('click', e => {
      window.AppState.students.splice(+e.currentTarget.dataset.idx, 1);
      renderStudentsList();
    }));

  count.textContent   = students.length;
  stats.style.display = 'flex';
  toStep3.disabled    = false;
}

// ============================================================
// STEP 3 – EDITOR / PREVIEW
// ============================================================
function initEditorControls() {
  // Slider → label
  [
    ['nameFontSize',   'nameFontSizeVal',   'px'],
    ['schoolFontSize', 'schoolFontSizeVal', 'px'],
    ['photoScale',     'photoScaleVal',     '%'],
    ['photoOffsetY',   'photoOffsetYVal',   'px'],
  ].forEach(([id, valId, sfx]) => {
    const el = document.getElementById(id);
    const vl = document.getElementById(valId);
    if (el && vl) el.addEventListener('input', () => (vl.textContent = el.value + sfx));
  });

  document.getElementById('refreshPreview').addEventListener('click', renderPreview);

  // Barcha kontrol o'zgarishida debounced preview yangilash
  let debTimer;
  const debRender = () => { clearTimeout(debTimer); debTimer = setTimeout(renderPreview, 200); };

  document.querySelectorAll(
    '#nameFontSize,#schoolFontSize,#nameColor,#schoolColor,' +
    '#photoScale,#photoOffsetY,#photoShape,#bgColor1,#bgColor2,' +
    '#accentColor,#canvasW,#canvasH'
  ).forEach(el => {
    ['input', 'change'].forEach(ev => el.addEventListener(ev, debRender));
  });

  // Split-inner kontrollari
  document.querySelectorAll(
    '#splitBgColor,#splitBgColor2,#splitNamePos,#splitNameColor,' +
    '#splitPhotoShape,#splitBorderColor,#splitDivider,#leftLabel'
  ).forEach(el => {
    if (el) ['input', 'change'].forEach(ev => el.addEventListener(ev, debRender));
  });

  // splitMaxCols slider + label
  const maxColsEl = document.getElementById('splitMaxCols');
  const maxColsVal = document.getElementById('splitMaxColsVal');
  if (maxColsEl) maxColsEl.addEventListener('input', () => {
    if (maxColsVal) maxColsVal.textContent = maxColsEl.value;
    debRender();
  });

  // O'quvchilar navigatsiyasi
  document.getElementById('prevStudent').addEventListener('click', () => {
    const len = window.AppState.students.length;
    if (!len) return;
    window.AppState.currentPreviewIdx =
      (window.AppState.currentPreviewIdx - 1 + len) % len;
    renderPreview();
  });
  document.getElementById('nextStudent').addEventListener('click', () => {
    const len = window.AppState.students.length;
    if (!len) return;
    window.AppState.currentPreviewIdx =
      (window.AppState.currentPreviewIdx + 1) % len;
    renderPreview();
  });

  // ── FREE TRANSFORM: rasmlarni qo'lda siljitish/masshtab (Photoshop kabi) ──
  initFreeTransform();

  // ── PREVIEW ZOOM (yaqinlashtirish) ──
  const pzIn  = document.getElementById('previewZoomIn');
  const pzOut = document.getElementById('previewZoomOut');
  const pzRst = document.getElementById('previewZoomReset');
  if (pzIn)  pzIn.addEventListener('click',  () => setPreviewZoom((window.AppState.previewZoom || 1) + 0.25));
  if (pzOut) pzOut.addEventListener('click', () => setPreviewZoom((window.AppState.previewZoom || 1) - 0.25));
  if (pzRst) pzRst.addEventListener('click', () => setPreviewZoom(1));

  const afBtn = document.getElementById('autoFitBtn');
  if (afBtn) afBtn.addEventListener('click', runAutoFit);

  const afF = document.getElementById('afFace');
  const afFV = document.getElementById('afFaceVal');
  if (afF) afF.addEventListener('input', () => { if (afFV) afFV.textContent = afF.value + '%'; renderPreview(); });

  const afY = document.getElementById('afFaceY');
  const afYV = document.getElementById('afFaceYVal');
  if (afY) afY.addEventListener('input', () => { if (afYV) afYV.textContent = afY.value + '%'; renderPreview(); });
}

// Yuz aniqlash orqali har bir rasmni avto-tekislash (face-api.js)
async function runAutoFit() {
  const btn = document.getElementById('autoFitBtn');
  const students = window.AppState.students;
  if (!students.length) return;
  if (typeof faceapi === 'undefined') {
    alert("Yuz aniqlash kutubxonasi yuklanmadi. Internet aloqasini tekshiring va sahifani yangilang.");
    return;
  }
  const orig = btn ? btn.textContent : '';
  if (btn) btn.disabled = true;
  try {
    if (btn) btn.textContent = '⏳ Modellar yuklanmoqda...';
    if (!window._faceModelsLoaded) {
      await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model');
      window._faceModelsLoaded = true;
    }
    const opt = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.35 });
    for (let i = 0; i < students.length; i++) {
      if (btn) btn.textContent = `⏳ Yuz aniqlanmoqda ${i + 1}/${students.length}`;
      const s = students[i];
      let det = null;
      if (s && s.img) { try { det = await faceapi.detectSingleFace(s.img, opt); } catch (e) {} }
      if (det && det.box) {
        const b = det.box;
        const iw = s.img.naturalWidth || s.img.width;
        const ih = s.img.naturalHeight || s.img.height;
        window.AppState.faces[i] = {
          cx: (b.x + b.width / 2) / iw,
          cy: (b.y + b.height / 2) / ih,
          fh: b.height / ih,
        };
      } else {
        window.AppState.faces[i] = null;
      }
      delete window.AppState.transforms[`g${i}`];
      delete window.AppState.transforms[`L${i}`];
    }
    renderPreview();
    if (btn) { btn.textContent = '✓ Tayyor'; setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1300); }
  } catch (e) {
    if (btn) { btn.textContent = orig; btn.disabled = false; }
    alert('Avto-tekislashda xatolik: ' + (e && e.message ? e.message : e));
  }
}

// Preview canvas ustida rasmlarni sudrash (move) va g'ildirak (zoom)
function initFreeTransform() {
  const pc = document.getElementById('previewCanvas');
  if (!pc) return;

  let drag = null;  // { key, lastX, lastY, w, h }

  const toCanvas = (e) => {
    const rect = pc.getBoundingClientRect();
    const fx = pc.width / rect.width;
    const fy = pc.height / rect.height;
    return { x: (e.clientX - rect.left) * fx, y: (e.clientY - rect.top) * fy, fx, fy };
  };
  const regionAt = (cx, cy) => {
    const regs = window.AppState._regions || [];
    for (let i = regs.length - 1; i >= 0; i--) {
      const r = regs[i];
      if (cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h) return r;
    }
    return null;
  };
  const getT = (key) => {
    const t = window.AppState.transforms[key] || { scale: 1, ox: 0, oy: 0 };
    t.src = 'manual';
    window.AppState.transforms[key] = t;
    return t;
  };

  // Sudrash boshlanishi
  pc.addEventListener('mousedown', (e) => {
    const p = toCanvas(e);
    const r = regionAt(p.x, p.y);
    if (!r) return;
    drag = { key: r.key, lastX: e.clientX, lastY: e.clientY, w: r.w, h: r.h };
    pc.style.cursor = 'grabbing';
    e.preventDefault();
  });

  // Sudrash (move)
  window.addEventListener('mousemove', (e) => {
    if (!drag) return;
    const rect = pc.getBoundingClientRect();
    const fx = pc.width / rect.width;
    const dx = (e.clientX - drag.lastX) * fx;
    const dy = (e.clientY - drag.lastY) * fx;
    const t = getT(drag.key);
    t.ox += dx / drag.w;
    t.oy += dy / drag.h;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    renderPreview();
  });
  window.addEventListener('mouseup', () => {
    if (drag) { drag = null; pc.style.cursor = 'default'; }
  });

  // Hover — kursor ko'rinishi
  pc.addEventListener('mousemove', (e) => {
    if (drag) return;
    const p = toCanvas(e);
    pc.style.cursor = regionAt(p.x, p.y) ? 'grab' : 'default';
  });

  // G'ildirak — masshtab (zoom)
  pc.addEventListener('wheel', (e) => {
    const p = toCanvas(e);
    const r = regionAt(p.x, p.y);
    if (!r) return;
    e.preventDefault();
    const t = getT(r.key);
    t.scale = Math.max(0.2, Math.min(8, (t.scale || 1) * (e.deltaY < 0 ? 1.08 : 0.926)));
    renderPreview();
  }, { passive: false });

  // Ikki marta bosish — shu rasm transformini tiklash
  pc.addEventListener('dblclick', (e) => {
    const p = toCanvas(e);
    const r = regionAt(p.x, p.y);
    if (!r) return;
    delete window.AppState.transforms[r.key];
    renderPreview();
  });
}

// Preview canvasni masshtab bilan o'lchamlash (yaqinlashtirish funksiyasi)
function sizePreviewCanvas() {
  const canvas = document.getElementById('previewCanvas');
  const tpl = window.AppState.selectedTemplate;
  if (!canvas || !tpl) return;
  const cont = document.querySelector('.canvas-container');
  const availW = ((cont ? cont.clientWidth : 700) - 44);
  const cW = canvas.width  || tpl.defaultW;
  const cH = canvas.height || tpl.defaultH;
  const baseScale = Math.min(1, availW / cW);     // konteyner kengligiga moslash
  const z = window.AppState.previewZoom || 1;
  const disp = baseScale * z;
  canvas.style.width  = Math.round(cW * disp) + 'px';
  canvas.style.height = Math.round(cH * disp) + 'px';
  const lbl = document.getElementById('previewZoomLabel');
  if (lbl) lbl.textContent = Math.round(z * 100) + '%';
}

function setPreviewZoom(z) {
  window.AppState.previewZoom = Math.max(0.25, Math.min(5, z));
  sizePreviewCanvas();
}

function renderPreview() {
  const tpl      = window.AppState.selectedTemplate;
  const students = window.AppState.students;
  if (!tpl || !students.length) return;

  const idx     = window.AppState.currentPreviewIdx;
  const student = students[idx];

  document.getElementById('studentNav').textContent = `${idx + 1} / ${students.length}`;

  const cfg     = getEditorConfig();
  const canvas  = document.getElementById('previewCanvas');
  canvas.width  = cfg.canvasW;
  canvas.height = cfg.canvasH;

  // Responsive masshtab (preview zoom bilan)
  sizePreviewCanvas();

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const _hit = [];  // free-transform uchun rasm hududlari

  // Editor kartalarini shablon turiga qarab ko'rsat/yashir
  const isSplitMode  = tpl.type === 'split-inner';
  const isPosterMode = tpl.type === 'poster-inner';
  const hideGeneric  = isSplitMode || isPosterMode;
  document.querySelectorAll('.generic-ctrl').forEach(c => c.style.display = hideGeneric ? 'none' : '');
  const splitCard = document.getElementById('splitControlsCard');
  if (splitCard) splitCard.style.display = isSplitMode ? '' : 'none';

  if (tpl.type === 'poster-inner') {
    // Poster: HAR BIR o'quvchi chap katta panelda, o'ng 5×5 grid fiksir
    tpl.draw(ctx, window.AppState.classInfo, {
      ...cfg,
      w: cfg.canvasW, h: cfg.canvasH,
      allStudents: students,
      ownerIndex:  idx,
      leftImg:     student.img || null,
    });
    document.querySelector('.preview-label').textContent =
      `Poster — "${student.name}" chap panelda  (${idx + 1}/${students.length})`;
  } else if (tpl.type === 'split-inner') {
    // Split-inner: HAR BIR o'quvchi chapdagi katta rasm + birinchi o'rinda
    const leftLabelInput = (document.getElementById('leftLabel')?.value || '').trim();
    tpl.draw(ctx, window.AppState.classInfo, {
      ...cfg,
      w: cfg.canvasW, h: cfg.canvasH,
      allStudents:    students,
      ownerIndex:     idx,
      leftImg:        student.img || null,           // o'quvchining o'zi = chap portret
      bgImg:          window.AppState.splitBgImg || null,
      transforms:     window.AppState.transforms,    // free-transform
      faces:          window.AppState.faces,
      hitRegions:     _hit,                          // rasm hududlari (hit-test)
      bgType:         document.getElementById('splitBgType')?.value       || 'color',
      bgColor1:       document.getElementById('splitBgColor')?.value      || cfg.bgColor1,
      bgColor2:       document.getElementById('splitBgColor2')?.value     || cfg.bgColor2,
      leftLabel:      leftLabelInput || student.name || '',  // bo'sh bo'lsa = o'quvchi ismi
      divider:        document.getElementById('splitDivider')?.value      || 'line',
      namePos:        document.getElementById('splitNamePos')?.value      || 'bottom',
      photoShape:     document.getElementById('splitPhotoShape')?.value   || 'rounded',
      maxCols:        parseInt(document.getElementById('splitMaxCols')?.value) || 5,
      nameColor:      document.getElementById('splitNameColor')?.value    || '#ffffff',
      borderColor:    document.getElementById('splitBorderColor')?.value  || '#ffffff',
      headerText:     [window.AppState.classInfo.schoolNumber,
                       window.AppState.classInfo.className ? window.AppState.classInfo.className+' sinf' : '',
                       window.AppState.classInfo.schoolYear].filter(Boolean).join(' · '),
    });
    document.querySelector('.preview-label').textContent =
      `Split Ichki — "${student.name}" chapda + birinchi o'rinda  (${idx + 1}/${students.length})`;
  } else if (tpl.type === 'inner') {
    // Ichki shablon: barcha o'quvchilar uzatiladi, egasi = idx
    tpl.draw(ctx, window.AppState.classInfo, {
      ...cfg,
      w: cfg.canvasW, h: cfg.canvasH,
      allStudents: students,
      ownerIndex:  idx,
      teacherImg:  window.AppState.teacherImg,
    });
    // Preview label yangilash
    document.querySelector('.preview-label').textContent =
      `Ko'rish — "${student.name}" birinchi o'rinda`;
  } else {
    // Oddiy shablon: faqat shu o'quvchi
    tpl.draw(ctx, window.AppState.classInfo, {
      ...cfg,
      w: cfg.canvasW, h: cfg.canvasH,
      photo:       student.img,
      studentName: student.name,
    });
    document.querySelector('.preview-label').textContent =
      `Ko'rish — ${idx + 1}-o'quvchi namunasi`;
  }

  window.AppState._regions = _hit;  // hit-test uchun saqlash
}

function getEditorConfig() {
  const tpl = window.AppState.selectedTemplate;
  const isSplit = tpl?.type === 'split-inner';
  const $ = id => document.getElementById(id);
  return {
    canvasW:       parseInt($('canvasW').value)       || tpl?.defaultW || 400,
    canvasH:       parseInt($('canvasH').value)       || tpl?.defaultH || 560,
    nameFontSize:  parseInt($('nameFontSize').value)  || 22,
    schoolFontSize:parseInt($('schoolFontSize').value)|| 13,
    nameColor:     isSplit ? ($('splitNameColor')?.value || '#ffffff') : $('nameColor').value,
    schoolColor:   $('schoolColor').value,
    bgColor1:      isSplit ? ($('splitBgColor')?.value  || $('bgColor1').value) : $('bgColor1').value,
    bgColor2:      isSplit ? ($('splitBgColor2')?.value || $('bgColor2').value) : $('bgColor2').value,
    accentColor:   $('accentColor').value,
    photoScale:    parseInt($('photoScale').value)    || 100,
    photoOffsetY:  parseInt($('photoOffsetY').value)  || 0,
    photoShape:    isSplit ? ($('splitPhotoShape')?.value || 'rounded') : $('photoShape').value,
    exportQuality: parseInt($('exportQuality').value) || 2,
    // Split-inner uchun qo'shimcha
    bgType:        isSplit ? ($('splitBgType')?.value || 'color') : 'color',
    splitBgImg:    window.AppState.splitBgImg || null,
    leftLabel:     $('leftLabel')?.value || '',
    divider:       $('splitDivider')?.value  || 'line',
    namePos:       isSplit ? ($('splitNamePos')?.value || 'bottom') : 'bottom',
    maxCols:       parseInt($('splitMaxCols')?.value) || 5,
    nameFS:        0,
    nameWeight:    '400',
    gapX:          8,
    gapY:          12,
    borderW:       2,
    borderColor:   isSplit ? ($('splitBorderColor')?.value || '#ffffff') : ($('accentColor').value || '#ffffff'),
    transforms:    window.AppState.transforms,   // free-transform (generatsiyada ham)
    faces:         window.AppState.faces,
    autoFaceFrac:  (parseInt(($('afFace')  || {}).value) || 28) / 100,
    autoFaceY:     (parseInt(($('afFaceY') || {}).value) || 43) / 100,
  };
}

function collectClassInfo() {
  window.AppState.classInfo = {
    schoolName:  document.getElementById('schoolName').value.trim(),
    schoolNumber:document.getElementById('schoolNumber').value.trim(),
    className:   document.getElementById('className').value.trim(),
    schoolYear:  document.getElementById('schoolYear').value.trim(),
    cityName:    document.getElementById('cityName').value.trim(),
    teacherName: document.getElementById('teacherName').value.trim(),
  };
}

// ============================================================
// STEP 4 – GENERATSIYA
// ============================================================
async function startGeneration() {
  const tpl      = window.AppState.selectedTemplate;
  const students = window.AppState.students;
  const cfg      = getEditorConfig();
  collectClassInfo();

  const progressCard  = document.getElementById('progressCard');
  const exportDone    = document.getElementById('exportDone');
  const progressBar   = document.getElementById('progressBar');
  const progressText  = document.getElementById('progressText');
  const progressTitle = document.getElementById('progressTitle');
  const thumbGrid     = document.getElementById('thumbnailsGrid');

  progressCard.style.display = 'block';
  exportDone.style.display   = 'none';
  thumbGrid.innerHTML        = '';
  progressBar.style.width    = '0%';
  progressTitle.textContent  = (tpl.type === 'inner' || tpl.type === 'split-inner' || tpl.type === 'poster-inner')
    ? 'Albom sahifalari generatsiya qilinmoqda...'
    : 'Vinyetkalar generatsiya qilinmoqda...';

  await Generator.generate(
    students, tpl,
    { ...cfg, ...window.AppState.classInfo, teacherImg: window.AppState.teacherImg },
    (current, total) => {
      progressBar.style.width = Math.round(current / total * 100) + '%';
      progressText.textContent = `${current} / ${total} tayyor`;

      // Thumbnail qo'shish
      const item = Generator.canvases[current - 1];
      if (item) {
        const div = document.createElement('div');
        div.className = 'thumb-item';
        const img = document.createElement('img');
        img.src = item.canvas.toDataURL('image/png', 0.4);
        const p = document.createElement('p');
        p.textContent = item.name;
        div.append(img, p);
        thumbGrid.appendChild(div);
        // Auto-scroll oxirgi thumbga
        thumbGrid.scrollLeft = thumbGrid.scrollWidth;
      }
    },
    canvases => {
      progressCard.style.display = 'none';
      exportDone.style.display   = 'block';
      const kind = (tpl.type === 'inner' || tpl.type === 'split-inner' || tpl.type === 'poster-inner') ? 'albom sahifasi' : 'vinyetka';
      document.getElementById('doneCount').textContent =
        `${canvases.length} ta ${kind} muvaffaqiyatli yaratildi`;
    }
  );
}

// ============================================================
// NAVIGATSIYA
// ============================================================
function initNavigation() {
  const secs  = {
    1: document.getElementById('step-template'),
    2: document.getElementById('step-upload'),
    3: document.getElementById('step-editor'),
    4: document.getElementById('step-export'),
  };
  const steps = {
    1: document.getElementById('sb-1'),
    2: document.getElementById('sb-2'),
    3: document.getElementById('sb-3'),
    4: document.getElementById('sb-4'),
  };

  function goTo(n) {
    Object.values(secs).forEach(s  => s.classList.remove('active-section'));
    secs[n].classList.add('active-section');
    Object.entries(steps).forEach(([k, el]) => {
      el.classList.remove('active', 'done');
      const num = +k;
      if (num < n)  el.classList.add('done');
      if (num === n) el.classList.add('active');
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.getElementById('toStep2').addEventListener('click', () => goTo(2));

  document.getElementById('toStep3').addEventListener('click', () => {
    collectClassInfo();
    window.AppState.currentPreviewIdx = 0;
    goTo(3);
    setTimeout(renderPreview, 120);
  });

  document.getElementById('toStep4').addEventListener('click', () => {
    goTo(4);
    setTimeout(startGeneration, 200);
  });

  document.getElementById('backToStep1').addEventListener('click', () => goTo(1));
  document.getElementById('backToStep2').addEventListener('click', () => goTo(2));

  document.getElementById('restartBtn').addEventListener('click', () => {
    window.AppState.students          = [];
    window.AppState.selectedTemplate  = null;
    window.AppState.teacherImg        = null;
    window.AppState.leftImg           = null;
    window.AppState.splitBgImg        = null;
    window.AppState.transforms        = {};
    window.AppState._regions          = [];
    window.AppState.faces             = {};
    window.AppState.previewZoom       = 1;
    window.AppState.currentPreviewIdx = 0;
    renderStudentsList();
    document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('toStep2').disabled = true;
    // Rahbar preview reset
    const previewDiv  = document.getElementById('teacherPreviewImg');
    const placeholder = document.getElementById('teacherPlaceholder');
    if (previewDiv)  previewDiv.style.display  = 'none';
    if (placeholder) placeholder.style.display = '';
    goTo(1);
  });

  document.getElementById('downloadZip').addEventListener('click', async () => {
    const btn = document.getElementById('downloadZip');
    const orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '⏳ ZIP tayyorlanmoqda...';
    await Generator.downloadZip(Generator.canvases, (cur, tot) => {
      btn.innerHTML = `⏳ ${Math.round(cur / tot * 100)}% siqilmoqda...`;
    });
    btn.innerHTML = orig;
    btn.disabled  = false;
  });

  // Steps bar orqali navigatsiya
  Object.entries(steps).forEach(([n, el]) => {
    el.addEventListener('click', () => {
      if (el.classList.contains('done') || el.classList.contains('active')) {
        goTo(+n);
        if (+n === 3) setTimeout(renderPreview, 120);
      }
    });
  });
}

// ============================================================
// UTILS
// ============================================================
function escHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
