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
    const list = window.TEMPLATES.filter(t => type === 'all' || t.type === type);

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

function loadStudentFile(file) {
  return new Promise(resolve => {
    const name = file.name.replace(/\.[^.]+$/, '').trim();
    const url  = URL.createObjectURL(file);
    const img  = new Image();
    img.onload  = () => resolve({ name, img, url });
    img.onerror = () => resolve({ name, img: null, url: null });
    img.src = url;
  });
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
  document.querySelectorAll(
    '#nameFontSize,#schoolFontSize,#nameColor,#schoolColor,' +
    '#photoScale,#photoOffsetY,#photoShape,#bgColor1,#bgColor2,' +
    '#accentColor,#canvasW,#canvasH'
  ).forEach(el => {
    ['input', 'change'].forEach(ev =>
      el.addEventListener(ev, () => {
        clearTimeout(debTimer);
        debTimer = setTimeout(renderPreview, 280);
      }));
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

  // Responsive masshtab
  const container  = document.querySelector('.canvas-container');
  const maxW       = Math.min(520, (container?.offsetWidth || 560) - 40);
  const dispScale  = Math.min(1, maxW / cfg.canvasW);
  canvas.style.width  = cfg.canvasW  * dispScale + 'px';
  canvas.style.height = cfg.canvasH * dispScale + 'px';

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (tpl.type === 'inner') {
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
}

function getEditorConfig() {
  const tpl = window.AppState.selectedTemplate;
  return {
    canvasW:       parseInt(document.getElementById('canvasW').value)       || tpl?.defaultW || 400,
    canvasH:       parseInt(document.getElementById('canvasH').value)       || tpl?.defaultH || 560,
    nameFontSize:  parseInt(document.getElementById('nameFontSize').value)  || 22,
    schoolFontSize:parseInt(document.getElementById('schoolFontSize').value)|| 13,
    nameColor:     document.getElementById('nameColor').value,
    schoolColor:   document.getElementById('schoolColor').value,
    bgColor1:      document.getElementById('bgColor1').value,
    bgColor2:      document.getElementById('bgColor2').value,
    accentColor:   document.getElementById('accentColor').value,
    photoScale:    parseInt(document.getElementById('photoScale').value)    || 100,
    photoOffsetY:  parseInt(document.getElementById('photoOffsetY').value)  || 0,
    photoShape:    document.getElementById('photoShape').value,
    exportQuality: parseInt(document.getElementById('exportQuality').value) || 2,
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
  progressTitle.textContent  = tpl.type === 'inner'
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
      document.getElementById('doneCount').textContent =
        `${canvases.length} ta ${tpl.type === 'inner' ? 'albom sahifasi' : 'vinyetka'} muvaffaqiyatli yaratildi`;
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
