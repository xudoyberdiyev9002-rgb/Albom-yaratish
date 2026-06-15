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
  selectedTemplate:    null,  // joriy tahrirlanayotgan shablon (ichki yoki ustki)
  innerTemplate:       null,  // ICHKI qism shabloni (1-qadamda tanlanadi)
  outerTemplate:       null,  // USTKI qism shabloni (default: Bitiruvchi Albom)
  editPart:            'inner',// 'inner' | 'outer'
  generateOuter:       true,  // ustki qism ham generatsiya qilinsinmi
  _tf:                 null,  // { inner:{}, outer:{} } — transformlar alohida
  cfgInner:            null,  // ichki kontrol qiymatlari snapshot
  cfgOuter:            null,  // ustki kontrol qiymatlari snapshot
  students:            [],   // [{ name, img, url }]
  classInfo:           {},
  teacherImg:          null, // sinf rahbari rasmi
  leftImg:             null, // split-inner chap portret rasmi
  splitBgImg:          null, // split-inner fon rasmi
  transforms:          {},   // free-transform: key -> {scale, ox, oy} (faol qism)
  _regions:            [],   // joriy preview dagi rasm hududlari (hit-test uchun)
  previewZoom:         1,     // tahrirlash oynasi masshtabi
  faces:               {},    // {studentIdx: {cx,cy,fh}} yuz aniqlash natijasi (umumiy)
  retouchMap:          {},    // {studentIdx: {...}} retush (umumiy — bir xil yuz)
  currentPreviewIdx:   0,
};

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', () => {
  initTemplateGrid();
  initUploadSection();
  initTeacherUpload();
  initEditorControls();
  initNavigation();

  // Ichki/ustki uchun alohida transform xotirasi
  window.AppState._tf = { inner: window.AppState.transforms, outer: {} };
  // Ustki (vinyetka) shabloni — default: Bitiruvchi Albom (mavjud bo'lsa)
  const outer = (window.TEMPLATES || []).find(t => t.id === 'bitiruvchi-cover')
            || (window.TEMPLATES || []).find(t => t.type === 'vinyetka');
  window.AppState.outerTemplate = outer || null;
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
  window.AppState.innerTemplate    = tpl;   // ICHKI qism shabloni
  window.AppState.editPart         = 'inner';
  window.AppState.cfgInner         = null;  // yangi shablon -> snapshotni tozalaymiz
  if (window.AppState._tf) { window.AppState._tf.inner = {}; window.AppState.transforms = window.AppState._tf.inner; }

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

  // Ustki (muqova) matn kontrollari
  document.querySelectorAll('#ovTitle,#ovSchoolNum,#ovClass,#ovYear,#ovCity').forEach(el => {
    if (el) ['input', 'change'].forEach(ev => el.addEventListener(ev, debRender));
  });
  const ovTypeEl = document.getElementById('ovType');
  if (ovTypeEl) ovTypeEl.addEventListener('change', () => { updateOvClassLabel(); renderPreview(); });

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
    rtLoadCurrent();
    renderPreview();
  });
  document.getElementById('nextStudent').addEventListener('click', () => {
    const len = window.AppState.students.length;
    if (!len) return;
    window.AppState.currentPreviewIdx =
      (window.AppState.currentPreviewIdx + 1) % len;
    rtLoadCurrent();
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

  const afFL = document.getElementById('afFaceLeft');
  const afFLV = document.getElementById('afFaceLeftVal');
  if (afFL) afFL.addEventListener('input', () => { if (afFLV) afFLV.textContent = afFL.value + '%'; renderPreview(); });

  const afYL = document.getElementById('afFaceYLeft');
  const afYLV = document.getElementById('afFaceYLeftVal');
  if (afYL) afYL.addEventListener('input', () => { if (afYLV) afYLV.textContent = afYL.value + '%'; renderPreview(); });

  // ── RETUSH sliderlari (har bir rasm uchun ALOHIDA — retouchMap) ──
  [['rtSmooth','rtSmoothVal'],['rtWarmth','rtWarmthVal'],['rtBright','rtBrightVal'],
   ['rtContrast','rtContrastVal'],['rtSat','rtSatVal'],['rtVignette','rtVignetteVal']]
  .forEach(([id, vid]) => {
    const el = document.getElementById(id), v = document.getElementById(vid);
    if (el) el.addEventListener('input', () => { if (v) v.textContent = el.value; rtSaveCurrent(); renderPreview(); });
  });
  const setRt = (vals) => {
    Object.entries(vals).forEach(([id, val]) => {
      const el = document.getElementById(id); if (!el) return;
      el.value = val; const v = document.getElementById(id + 'Val'); if (v) v.textContent = val;
    });
    rtSaveCurrent();
    renderPreview();
  };
  const rtP = document.getElementById('rtPreset');
  if (rtP) rtP.addEventListener('click', () => setRt({ rtSmooth:30, rtWarmth:20, rtBright:10, rtContrast:15, rtSat:15, rtVignette:25 }));
  const rtR = document.getElementById('rtReset');
  if (rtR) rtR.addEventListener('click', () => setRt({ rtSmooth:0, rtWarmth:0, rtBright:0, rtContrast:0, rtSat:0, rtVignette:0 }));
  const rtA = document.getElementById('rtAuto');
  if (rtA) rtA.addEventListener('click', runAutoRetouch);
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

  // Editor kartalarini shablon turiga qarab ko'rsat/yashir.
  // MUHIM: panel ko'rinishi ICHKI shablonga bog'lanadi — shunda ustki qadamga
  // o'tganda ham xuddi shu kontrollar qoladi (o'zgarib ketmaydi).
  const panelTpl     = window.AppState.innerTemplate || tpl;
  const isSplitMode  = panelTpl.type === 'split-inner';
  const isPosterMode = panelTpl.type === 'poster-inner';
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

// ============================================================
// AVTO-RETUSH (API'siz, lokal) — har bir rasmni o'qib, ideal parametr tanlaydi
// ============================================================
function rtClamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

// Joriy preview o'quvchisining slider qiymatlarini retouchMap ga saqlash
function rtSaveCurrent() {
  const idx = window.AppState.currentPreviewIdx || 0;
  const g = id => parseInt((document.getElementById(id) || {}).value) || 0;
  window.AppState.retouchMap[idx] = {
    smooth:     g('rtSmooth'),
    warmth:     g('rtWarmth'),
    brightness: g('rtBright'),
    contrast:   g('rtContrast'),
    saturation: g('rtSat'),
    vignette:   g('rtVignette'),
  };
}

// retouchMap dagi joriy o'quvchi qiymatlarini sliderlarga yuklash
function rtLoadCurrent() {
  const idx = window.AppState.currentPreviewIdx || 0;
  const p = window.AppState.retouchMap[idx] || {};
  const set = (id, val) => {
    const el = document.getElementById(id); if (!el) return;
    el.value = val || 0;
    const v = document.getElementById(id + 'Val'); if (v) v.textContent = val || 0;
  };
  set('rtSmooth',   p.smooth);
  set('rtWarmth',   p.warmth);
  set('rtBright',   p.brightness);
  set('rtContrast', p.contrast);
  set('rtSat',      p.saturation);
  set('rtVignette', p.vignette);
}

// Bitta rasmni tahlil qilib, ideal retush parametrlarini hisoblaydi (lokal, bepul)
function analyzeRetouch(img, faceNorm) {
  try {
    const iw = (img && (img.naturalWidth  || img.width))  || 0;
    const ih = (img && (img.naturalHeight || img.height)) || 0;
    if (!iw || !ih) return null;

    // Kichik ish-canvas (tez)
    const scale = Math.min(1, 320 / Math.max(iw, ih));
    const w = Math.max(1, Math.round(iw * scale));
    const h = Math.max(1, Math.round(ih * scale));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const cx = c.getContext('2d'); cx.drawImage(img, 0, 0, w, h);
    // Blur nusxa (tekstura/dog'ni o'lchash uchun)
    const cb = document.createElement('canvas'); cb.width = w; cb.height = h;
    const bx = cb.getContext('2d'); bx.filter = 'blur(2px)'; bx.drawImage(c, 0, 0); bx.filter = 'none';
    const O = cx.getImageData(0, 0, w, h).data;
    const B = bx.getImageData(0, 0, w, h).data;

    // Namuna olish hududi (yonoq/teri zonasi)
    let x0, y0, x1, y1;
    if (faceNorm && faceNorm.fh) {
      const fcx = faceNorm.cx * w, fcy = faceNorm.cy * h, fhpx = faceNorm.fh * h;
      const fw = fhpx * 0.7;
      x0 = Math.max(0, Math.round(fcx - fw * 0.42));
      x1 = Math.min(w, Math.round(fcx + fw * 0.42));
      y0 = Math.max(0, Math.round(fcy + fhpx * 0.02));   // ko'zdan past — yonoq
      y1 = Math.min(h, Math.round(fcy + fhpx * 0.38));
    } else {
      x0 = Math.round(w * 0.3); x1 = Math.round(w * 0.7);
      y0 = Math.round(h * 0.32); y1 = Math.round(h * 0.7);
    }
    if (x1 <= x0 || y1 <= y0) { x0 = 0; y0 = 0; x1 = w; y1 = h; }

    let n = 0, sumL = 0, sumL2 = 0, sumR = 0, sumG = 0, sumB = 0, sumSat = 0, sumTex = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * w + x) * 4;
        const r = O[i], g = O[i + 1], b = O[i + 2];
        // teri rangi (YCbCr)
        const Cb = -0.169 * r - 0.331 * g + 0.5 * b + 128;
        const Cr =  0.5 * r - 0.419 * g - 0.081 * b + 128;
        if (Cr < 133 || Cr > 183 || Cb < 77 || Cb > 140) continue;
        const L  = 0.299 * r + 0.587 * g + 0.114 * b;
        const Lb = 0.299 * B[i] + 0.587 * B[i + 1] + 0.114 * B[i + 2];
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        n++;
        sumL += L; sumL2 += L * L; sumR += r; sumG += g; sumB += b;
        sumSat += mx > 0 ? (mx - mn) / mx : 0;
        sumTex += Math.abs(L - Lb);
      }
    }
    if (n < 30) return null;   // teri topilmadi

    const meanL = sumL / n;
    const stdL  = Math.sqrt(Math.max(0, sumL2 / n - meanL * meanL));
    const meanR = sumR / n, meanB = sumB / n;
    const sat   = sumSat / n;
    const tex   = sumTex / n;

    // ── O'lchovlarni slider qiymatlariga aylantirish (YUMSHOQ — "kuydirmaslik") ──
    // Rang/yorug'lik faqat YENGIL tuzatiladi; asosiy effekt — silliqlash.
    const brightness = Math.round(rtClamp((160 - meanL) / 4,    -8, 10)); // faqat yengil ekspozitsiya
    const contrast   = Math.round(rtClamp((40 - stdL) * 0.35,   -8,  8)); // yassi → ozgina +kontrast
    const warmth     = Math.round(rtClamp((meanB - meanR + 12),  0, 16)); // sovuq → ozgina iliqlik
    const saturation = Math.round(rtClamp((0.30 - sat) * 60,   -12,  6)); // oshirib yubormaslik (kuyish oldini olish)
    const smooth     = Math.round(rtClamp((tex - 3) * 4.5,       0, 55)); // tekstura/dog' → silliqlash (asosiy)
    const vignette   = 8;                                                 // juda yengil vignette

    return { smooth, warmth, brightness, contrast, saturation, vignette };
  } catch (e) {
    return null;
  }
}

// Hamma rasmlarni tahlil qilib, har biriga individual retush qo'yadi
async function runAutoRetouch() {
  const btn = document.getElementById('rtAuto');
  const students = window.AppState.students;
  if (!students.length) return;
  const orig = btn ? btn.textContent : '';
  let applied = 0;
  for (let i = 0; i < students.length; i++) {
    if (btn) btn.textContent = `⏳ Tahlil ${i + 1}/${students.length}`;
    const s = students[i];
    if (s && s.img) {
      const p = analyzeRetouch(s.img, window.AppState.faces[i]);
      if (p) { window.AppState.retouchMap[i] = p; applied++; }
    }
    if (i % 4 === 3) await new Promise(r => setTimeout(r, 0));   // UI ni bloklamaslik
  }
  if (btn) btn.textContent = orig || '✨ Avto-retush (har bir rasm)';
  rtLoadCurrent();
  renderPreview();
  if (!applied) {
    alert("Teri zonasi aniqlanmadi. Avval \"· Avto-tekislash (yuz bo'yicha)\" tugmasi bilan yuzlarni aniqlang yoki rasm sifatini tekshiring.");
  }
}

// ============================================================
// ICHKI / USTKI qism o'rtasida almashish
// ============================================================
const CFG_CONTROL_IDS = [
  'canvasW','canvasH','bgColor1','bgColor2','accentColor','nameColor','schoolColor',
  'nameFontSize','schoolFontSize','photoScale','photoOffsetY','photoShape',
  'splitBgColor','splitBgColor2','splitNameColor','splitPhotoShape','splitBorderColor',
  'splitDivider','splitNamePos','splitMaxCols','leftLabel','splitBgType',
  'ovType','ovTitle','ovSchoolNum','ovClass','ovYear','ovCity',
];
const CFG_LABEL_SFX = { nameFontSize:'px', schoolFontSize:'px', photoScale:'%', photoOffsetY:'px' };

function snapshotControls() {
  const o = {};
  CFG_CONTROL_IDS.forEach(id => { const el = document.getElementById(id); if (el) o[id] = el.value; });
  return o;
}
function restoreControls(o) {
  if (!o) return;
  CFG_CONTROL_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el && o[id] !== undefined) {
      el.value = o[id];
      const lbl = document.getElementById(id + 'Val');
      if (lbl) lbl.textContent = o[id] + (CFG_LABEL_SFX[id] || '');
    }
  });
}
// Shablon defaultlarini kontrollarga qo'yish (birinchi marta ochilganda)
function seedTemplateDefaults(tpl) {
  if (!tpl) return;
  const set = (id, v) => { const el = document.getElementById(id); if (el != null && v != null) el.value = v; };
  set('canvasW', tpl.defaultW); set('canvasH', tpl.defaultH);
  set('bgColor1', tpl.bgColor1); set('bgColor2', tpl.bgColor2);
  set('accentColor', tpl.accentColor); set('nameColor', tpl.nameColor);
  set('schoolColor', tpl.schoolColor);
  if (tpl.type === 'vinyetka') set('photoShape', 'circle');
}

// Muqova matnlarini classInfo dan birinchi marta to'ldirish
function seedOuterTexts() {
  collectClassInfo();
  const ci = window.AppState.classInfo || {};
  const set = (id, v) => { const el = document.getElementById(id); if (el && !el.value) el.value = v || ''; };
  set('ovSchoolNum', ci.schoolNumber);
  set('ovClass',     ci.className);
  set('ovYear',      ci.schoolYear);
  set('ovCity',      ci.cityName);
}

// "Sinf" / "Guruh" yorlig'ini muassasa turiga qarab yangilash
function updateOvClassLabel() {
  const type = (document.getElementById('ovType') || {}).value || 'school';
  const lbl = document.getElementById('ovClassLabel');
  if (lbl) lbl.textContent = type === 'uni' ? 'Guruh' : 'Sinf';
}

// Tahrirlash qismini almashtirish ('inner' yoki 'outer')
function switchEditPart(part) {
  const st = window.AppState;
  // joriy qism holatini saqlash
  if (st.editPart === 'inner') st.cfgInner = snapshotControls();
  else st.cfgOuter = snapshotControls();
  if (st._tf) st._tf[st.editPart] = st.transforms;

  st.editPart = part;
  if (part === 'outer' && !st.outerTemplate) {
    st.outerTemplate = (window.TEMPLATES || []).find(t => t.id === 'bitiruvchi-cover')
                    || (window.TEMPLATES || []).find(t => t.type === 'vinyetka') || null;
  }
  const tpl = part === 'inner' ? st.innerTemplate : st.outerTemplate;
  st.selectedTemplate = tpl;
  if (st._tf) { st._tf[part] = st._tf[part] || {}; st.transforms = st._tf[part]; }

  const saved = part === 'inner' ? st.cfgInner : st.cfgOuter;
  if (saved) restoreControls(saved);
  else {
    seedTemplateDefaults(tpl);   // birinchi marta
    if (part === 'outer') seedOuterTexts();   // muqova matnlarini classInfo dan to'ldirish
  }

  // USTKI qadamda ham ICHKI qadamdagi barcha panellar ko'rinadi (yuz/retush umumiy).
  // Faqat ustki-maxsus panel (muqova matnlari) ustki qadamda qo'shimcha chiqadi.
  document.querySelectorAll('.inner-only').forEach(el => { el.style.display = ''; });
  document.querySelectorAll('.outer-only').forEach(el => { el.style.display = part === 'outer' ? '' : 'none'; });
  updateOvClassLabel();

  // qism sarlavhasi
  const titleEl = document.getElementById('editPartTitle');
  if (titleEl) titleEl.textContent = part === 'inner' ? '✏️ Ichki qism' : '🎓 Ustki qism (vinyetka)';

  // tugma matnlari
  const nextBtn = document.getElementById('editorNext');
  const backBtn = document.getElementById('editorBack');
  if (nextBtn) {
    nextBtn.textContent = part === 'inner' ? 'Keyingi: Ustki →' : '⚡ Generatsiya';
    nextBtn.classList.toggle('btn-generate', part === 'outer');
  }
  if (backBtn) backBtn.textContent = part === 'inner' ? '← Yuklash' : '← Ichki';
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
    autoFaceFracLeft: (parseInt(($('afFaceLeft')  || {}).value) || 27) / 100,
    autoFaceYLeft:    (parseInt(($('afFaceYLeft') || {}).value) || 43) / 100,
    retouchMap:    window.AppState.retouchMap,   // har bir o'quvchi uchun alohida retush
    // Ustki (muqova) matn override'lari
    coverType:      ($('ovType')      || {}).value || 'school',
    coverTitle:     ($('ovTitle')     || {}).value,
    coverSchoolNum: ($('ovSchoolNum') || {}).value,
    coverClass:     ($('ovClass')     || {}).value,
    coverYear:      ($('ovYear')      || {}).value,
    coverCity:      ($('ovCity')      || {}).value,
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
// STEP 5 – GENERATSIYA (ICHKI + USTKI)
// ============================================================
async function startGeneration() {
  const students = window.AppState.students;
  collectClassInfo();

  // joriy faol qism holatini saqlab qo'yamiz
  if (window.AppState.editPart === 'inner') window.AppState.cfgInner = snapshotControls();
  else window.AppState.cfgOuter = snapshotControls();
  if (window.AppState._tf) window.AppState._tf[window.AppState.editPart] = window.AppState.transforms;

  const parts = [{ part: 'inner', folder: 'ichki', tpl: window.AppState.innerTemplate, snap: window.AppState.cfgInner }];
  if (window.AppState.generateOuter && window.AppState.outerTemplate) {
    parts.push({ part: 'outer', folder: 'tashqi', tpl: window.AppState.outerTemplate, snap: window.AppState.cfgOuter });
  }

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
  progressTitle.textContent  = 'Albom sahifalari generatsiya qilinmoqda (ichki + ustki)...';

  Generator.canvases = [];
  const totalAll = students.length * parts.length;
  let doneAll = 0;

  for (const p of parts) {
    if (!p.tpl) continue;
    // shu qism kontrol/transformlarini tiklab, cfg quramiz
    window.AppState.selectedTemplate = p.tpl;
    window.AppState.transforms = (window.AppState._tf && window.AppState._tf[p.part]) || {};
    if (p.snap) restoreControls(p.snap); else seedTemplateDefaults(p.tpl);
    const cfg = getEditorConfig();

    await Generator.generate(
      students, p.tpl,
      { ...cfg, ...window.AppState.classInfo, teacherImg: window.AppState.teacherImg },
      () => {
        doneAll++;
        progressBar.style.width = Math.round(doneAll / totalAll * 100) + '%';
        progressText.textContent = `${doneAll} / ${totalAll} tayyor`;
        const item = Generator.canvases[Generator.canvases.length - 1];
        if (item && item.canvas) {
          const div = document.createElement('div');
          div.className = 'thumb-item';
          const img = document.createElement('img');
          img.src = item.canvas.toDataURL('image/png', 0.4);
          const cap = document.createElement('p');
          cap.textContent = (p.folder === 'tashqi' ? '🎓 ' : '✏️ ') + item.name;
          div.append(img, cap);
          thumbGrid.appendChild(div);
          thumbGrid.scrollLeft = thumbGrid.scrollWidth;
        }
      },
      null,
      { append: true, folder: p.folder }
    );
  }

  progressCard.style.display = 'none';
  exportDone.style.display   = 'block';
  const partTxt = parts.length > 1 ? 'ichki + ustki' : 'ichki';
  document.getElementById('doneCount').textContent =
    `${Generator.canvases.length} ta sahifa yaratildi (${partTxt})`;
}

// ============================================================
// NAVIGATSIYA
// ============================================================
function initNavigation() {
  const secTemplate = document.getElementById('step-template');
  const secUpload   = document.getElementById('step-upload');
  const secEditor   = document.getElementById('step-editor');
  const secExport   = document.getElementById('step-export');
  const steps = {
    1: document.getElementById('sb-1'),
    2: document.getElementById('sb-2'),
    3: document.getElementById('sb-3'),
    4: document.getElementById('sb-4'),
    5: document.getElementById('sb-5'),
  };

  function goTo(n) {
    [secTemplate, secUpload, secEditor, secExport].forEach(s => s && s.classList.remove('active-section'));
    if (n === 1) secTemplate.classList.add('active-section');
    else if (n === 2) secUpload.classList.add('active-section');
    else if (n === 3 || n === 4) secEditor.classList.add('active-section');
    else if (n === 5) secExport.classList.add('active-section');

    Object.entries(steps).forEach(([k, el]) => {
      if (!el) return;
      el.classList.remove('active', 'done');
      const num = +k;
      if (num < n) el.classList.add('done');
      if (num === n) el.classList.add('active');
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  window._goTo = goTo;

  document.getElementById('toStep2').addEventListener('click', () => goTo(2));

  // 2 -> 3 (ICHKI tahrirlash)
  document.getElementById('toStep3').addEventListener('click', () => {
    collectClassInfo();
    window.AppState.currentPreviewIdx = 0;
    switchEditPart('inner');
    goTo(3);
    setTimeout(renderPreview, 120);
  });

  // Editor "Keyingi" — ichki bo'lsa ustkiga, ustki bo'lsa generatsiyaga
  document.getElementById('editorNext').addEventListener('click', () => {
    if (window.AppState.editPart === 'inner') {
      switchEditPart('outer');
      goTo(4);
      setTimeout(renderPreview, 120);
    } else {
      goTo(5);
      setTimeout(startGeneration, 200);
    }
  });

  // Editor "Orqaga" — ustki bo'lsa ichkiga, ichki bo'lsa yuklashga
  document.getElementById('editorBack').addEventListener('click', () => {
    if (window.AppState.editPart === 'outer') {
      switchEditPart('inner');
      goTo(3);
      setTimeout(renderPreview, 120);
    } else {
      goTo(2);
    }
  });

  const b1 = document.getElementById('backToStep1');
  if (b1) b1.addEventListener('click', () => goTo(1));

  document.getElementById('restartBtn').addEventListener('click', () => {
    window.AppState.students          = [];
    window.AppState.selectedTemplate  = null;
    window.AppState.innerTemplate     = null;
    window.AppState.editPart          = 'inner';
    window.AppState.teacherImg        = null;
    window.AppState.leftImg           = null;
    window.AppState.splitBgImg        = null;
    window.AppState.transforms        = {};
    window.AppState._tf               = { inner: window.AppState.transforms, outer: {} };
    window.AppState.cfgInner          = null;
    window.AppState.cfgOuter          = null;
    window.AppState._regions          = [];
    window.AppState.faces             = {};
    window.AppState.previewZoom       = 1;
    window.AppState.currentPreviewIdx = 0;
    renderStudentsList();
    document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('toStep2').disabled = true;
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
    if (!el) return;
    el.addEventListener('click', () => {
      if (!(el.classList.contains('done') || el.classList.contains('active'))) return;
      const num = +n;
      if (num === 3) { switchEditPart('inner'); goTo(3); setTimeout(renderPreview, 120); }
      else if (num === 4) { switchEditPart('outer'); goTo(4); setTimeout(renderPreview, 120); }
      else goTo(num);
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
