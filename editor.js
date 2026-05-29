/**
 * editor.js
 * Saytning barcha interaktivligi: step navigation, template tanlash,
 * rasm yuklash, editor preview, generatsiya va ZIP export.
 */

// ===== GLOBAL STATE =====
window.AppState = {
  selectedTemplate: null,
  students: [],        // [{ name, img, file }]
  classInfo: {},
  currentPreviewIdx: 0,
  editorConfig: {},
};

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', () => {
  initTemplateGrid();
  initUploadSection();
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
    const list = (type === 'all')
      ? window.TEMPLATES
      : window.TEMPLATES.filter(t => t.type === type);

    list.forEach(tpl => {
      const card = document.createElement('div');
      card.className = 'template-card';
      card.dataset.id = tpl.id;

      // Mini preview canvas
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = 180; previewCanvas.height = 240;
      previewCanvas.style.cssText = 'width:100%;height:auto;display:block';

      const ctx = previewCanvas.getContext('2d');
      renderTemplateThumb(ctx, tpl, 180, 240);

      card.innerHTML = `
        <div class="tpl-preview"></div>
        <div class="tpl-label">
          <h4>${tpl.name}</h4>
          <p>${tpl.desc}</p>
        </div>
        <div class="selected-badge">✓</div>
      `;
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
  const cfg = {
    w, h,
    photo: null,
    studentName: 'Ism Familya',
    nameFontSize: Math.round(w * 0.055),
    schoolFontSize: Math.round(w * 0.032),
    nameColor: tpl.nameColor,
    schoolColor: tpl.schoolColor,
    bgColor1: tpl.bgColor1,
    bgColor2: tpl.bgColor2,
    accentColor: tpl.accentColor,
    photoScale: 90,
    photoOffsetY: 0,
    photoShape: 'circle',
    exportQuality: 1,
    canvasW: w, canvasH: h,
  };
  const fakeData = {
    schoolNumber: 'Maktab №1',
    className: '11-A',
    schoolYear: '2025-2026',
    cityName: 'Toshkent',
    teacherName: 'O\'qituvchi F.I.O',
  };
  tpl.draw(ctx, fakeData, cfg);
}

function selectTemplate(card, tpl) {
  document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  window.AppState.selectedTemplate = tpl;

  // Update canvas default size
  document.getElementById('canvasW').value = tpl.defaultW;
  document.getElementById('canvasH').value = tpl.defaultH;
  document.getElementById('bgColor1').value = tpl.bgColor1;
  document.getElementById('bgColor2').value = tpl.bgColor2;
  document.getElementById('accentColor').value = tpl.accentColor;
  document.getElementById('nameColor').value = tpl.nameColor;
  document.getElementById('schoolColor').value = tpl.schoolColor;

  document.getElementById('toStep2').disabled = false;
}

// ============================================================
// STEP 2 – UPLOAD
// ============================================================
function initUploadSection() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('dragging');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragging');
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
  const imageFiles = files.filter(f => f.type.startsWith('image/'));
  if (!imageFiles.length) return;

  const loadPromises = imageFiles.map(file => loadStudentFile(file));
  Promise.all(loadPromises).then(newStudents => {
    // Yangi o'quvchilar ro'yxatning boshida EMAS – oxiriga qo'shamiz,
    // lekin keyinroq tartibni o'zgartirish mumkin.
    // Har safar qayta yüklanganda yangisi BOSHGA qo'shiladi (so'rov: yangi o'quvchi boshida)
    window.AppState.students = [...newStudents, ...window.AppState.students];
    renderStudentsList();
  });
}

function loadStudentFile(file) {
  return new Promise(resolve => {
    const nameWithoutExt = file.name.replace(/\.[^.]+$/, '').trim();
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ name: nameWithoutExt, img, url });
    };
    img.onerror = () => {
      resolve({ name: nameWithoutExt, img: null, url: null });
    };
    img.src = url;
  });
}

function renderStudentsList() {
  const list = document.getElementById('studentsList');
  const stats = document.getElementById('uploadStats');
  const count = document.getElementById('countLoaded');
  const toStep3Btn = document.getElementById('toStep3');

  list.innerHTML = '';
  const students = window.AppState.students;

  if (students.length === 0) {
    stats.style.display = 'none';
    toStep3Btn.disabled = true;
    return;
  }

  students.forEach((s, i) => {
    const row = document.createElement('div');
    row.className = 'student-row';
    row.innerHTML = `
      <div class="student-order">${i + 1}</div>
      ${s.url ? `<img class="student-thumb" src="${s.url}" alt="${s.name}"/>` : '<div class="student-thumb" style="background:#333;border-radius:6px"></div>'}
      <input class="student-name-input" value="${escapeHtml(s.name)}" placeholder="Ism Familya" data-idx="${i}"/>
      <button class="student-del" data-idx="${i}" title="O'chirish">✕</button>
    `;
    list.appendChild(row);
  });

  // Name editing
  list.querySelectorAll('.student-name-input').forEach(input => {
    input.addEventListener('input', e => {
      window.AppState.students[parseInt(e.target.dataset.idx)].name = e.target.value;
    });
  });

  // Delete
  list.querySelectorAll('.student-del').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = parseInt(e.currentTarget.dataset.idx);
      window.AppState.students.splice(idx, 1);
      renderStudentsList();
    });
  });

  count.textContent = students.length;
  stats.style.display = 'flex';
  toStep3Btn.disabled = students.length === 0;
}

// ============================================================
// STEP 3 – EDITOR
// ============================================================
function initEditorControls() {
  // Range sliders – real-time label update
  const sliders = [
    { id: 'nameFontSize', valId: 'nameFontSizeVal', suffix: 'px' },
    { id: 'schoolFontSize', valId: 'schoolFontSizeVal', suffix: 'px' },
    { id: 'photoScale', valId: 'photoScaleVal', suffix: '%' },
    { id: 'photoOffsetY', valId: 'photoOffsetYVal', suffix: 'px' },
  ];
  sliders.forEach(s => {
    const el = document.getElementById(s.id);
    const val = document.getElementById(s.valId);
    if (!el || !val) return;
    el.addEventListener('input', () => { val.textContent = el.value + s.suffix; });
  });

  document.getElementById('refreshPreview').addEventListener('click', () => renderPreview());

  // Auto-preview on any control change (debounced)
  const controls = document.querySelectorAll(
    '#nameFontSize,#schoolFontSize,#nameColor,#schoolColor,#photoScale,#photoOffsetY,#photoShape,#bgColor1,#bgColor2,#accentColor,#canvasW,#canvasH'
  );
  let debounceTimer;
  controls.forEach(ctrl => {
    ctrl.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(renderPreview, 300);
    });
    ctrl.addEventListener('change', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(renderPreview, 300);
    });
  });

  // Student navigation
  document.getElementById('prevStudent').addEventListener('click', () => {
    const len = window.AppState.students.length;
    if (!len) return;
    window.AppState.currentPreviewIdx = (window.AppState.currentPreviewIdx - 1 + len) % len;
    renderPreview();
  });
  document.getElementById('nextStudent').addEventListener('click', () => {
    const len = window.AppState.students.length;
    if (!len) return;
    window.AppState.currentPreviewIdx = (window.AppState.currentPreviewIdx + 1) % len;
    renderPreview();
  });
}

function renderPreview() {
  const tpl = window.AppState.selectedTemplate;
  const students = window.AppState.students;
  if (!tpl || !students.length) return;

  const idx = window.AppState.currentPreviewIdx;
  const student = students[idx];

  document.getElementById('studentNav').textContent = `${idx + 1} / ${students.length}`;

  const cfg = getEditorConfig();
  const quality = 1; // preview uchun 1x

  const canvas = document.getElementById('previewCanvas');
  canvas.width = cfg.canvasW;
  canvas.height = cfg.canvasH;

  // Responsive scaling for display
  const maxDisplayW = Math.min(420, document.querySelector('.canvas-container').offsetWidth - 40);
  const scale = Math.min(1, maxDisplayW / cfg.canvasW);
  canvas.style.width = (cfg.canvasW * scale) + 'px';
  canvas.style.height = (cfg.canvasH * scale) + 'px';

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  tpl.draw(ctx, window.AppState.classInfo, {
    ...cfg,
    w: cfg.canvasW,
    h: cfg.canvasH,
    photo: student.img,
    studentName: student.name,
  });
}

function getEditorConfig() {
  const tpl = window.AppState.selectedTemplate;
  return {
    canvasW: parseInt(document.getElementById('canvasW').value) || tpl?.defaultW || 400,
    canvasH: parseInt(document.getElementById('canvasH').value) || tpl?.defaultH || 560,
    nameFontSize: parseInt(document.getElementById('nameFontSize').value) || 22,
    schoolFontSize: parseInt(document.getElementById('schoolFontSize').value) || 13,
    nameColor: document.getElementById('nameColor').value,
    schoolColor: document.getElementById('schoolColor').value,
    bgColor1: document.getElementById('bgColor1').value,
    bgColor2: document.getElementById('bgColor2').value,
    accentColor: document.getElementById('accentColor').value,
    photoScale: parseInt(document.getElementById('photoScale').value) || 100,
    photoOffsetY: parseInt(document.getElementById('photoOffsetY').value) || 0,
    photoShape: document.getElementById('photoShape').value,
    exportQuality: parseInt(document.getElementById('exportQuality').value) || 2,
  };
}

function collectClassInfo() {
  window.AppState.classInfo = {
    schoolName: document.getElementById('schoolName').value.trim(),
    schoolNumber: document.getElementById('schoolNumber').value.trim(),
    className: document.getElementById('className').value.trim(),
    schoolYear: document.getElementById('schoolYear').value.trim(),
    cityName: document.getElementById('cityName').value.trim(),
    teacherName: document.getElementById('teacherName').value.trim(),
  };
}

// ============================================================
// STEP 4 – GENERATE & EXPORT
// ============================================================
async function startGeneration() {
  const tpl = window.AppState.selectedTemplate;
  const students = window.AppState.students;
  const cfg = getEditorConfig();
  collectClassInfo();

  const progressCard = document.getElementById('progressCard');
  const exportDone = document.getElementById('exportDone');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const progressTitle = document.getElementById('progressTitle');
  const thumbGrid = document.getElementById('thumbnailsGrid');

  progressCard.style.display = 'block';
  exportDone.style.display = 'none';
  thumbGrid.innerHTML = '';
  progressBar.style.width = '0%';
  progressTitle.textContent = 'Rasmlar generatsiya qilinmoqda...';

  await Generator.generate(
    students,
    tpl,
    { ...cfg, ...window.AppState.classInfo },
    (current, total) => {
      const pct = Math.round((current / total) * 100);
      progressBar.style.width = pct + '%';
      progressText.textContent = `${current} / ${total} tayyor`;

      // Thumbnail qo'shish
      const item = Generator.canvases[current - 1];
      if (item) {
        const div = document.createElement('div');
        div.className = 'thumb-item';
        const img = document.createElement('img');
        img.src = item.canvas.toDataURL('image/png', 0.5);
        const p = document.createElement('p');
        p.textContent = item.name;
        div.appendChild(img);
        div.appendChild(p);
        thumbGrid.appendChild(div);
      }
    },
    (canvases) => {
      progressCard.style.display = 'none';
      exportDone.style.display = 'block';
      document.getElementById('doneCount').textContent =
        `${canvases.length} ta vinyetka muvaffaqiyatli yaratildi`;
    }
  );
}

// ============================================================
// NAVIGATION
// ============================================================
function initNavigation() {
  const sections = {
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

  function goTo(stepNum) {
    Object.values(sections).forEach(s => s.classList.remove('active-section'));
    sections[stepNum].classList.add('active-section');

    Object.entries(steps).forEach(([n, el]) => {
      el.classList.remove('active', 'done');
      const num = parseInt(n);
      if (num < stepNum) el.classList.add('done');
      else if (num === stepNum) el.classList.add('active');
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Step 1 → 2
  document.getElementById('toStep2').addEventListener('click', () => goTo(2));

  // Step 2 → 3
  document.getElementById('toStep3').addEventListener('click', () => {
    collectClassInfo();
    window.AppState.currentPreviewIdx = 0;
    goTo(3);
    setTimeout(renderPreview, 100);
  });

  // Step 3 → 4 (Generate)
  document.getElementById('toStep4').addEventListener('click', () => {
    goTo(4);
    setTimeout(startGeneration, 200);
  });

  // Back buttons
  document.getElementById('backToStep1').addEventListener('click', () => goTo(1));
  document.getElementById('backToStep2').addEventListener('click', () => goTo(2));

  // Restart
  document.getElementById('restartBtn').addEventListener('click', () => {
    window.AppState.students = [];
    window.AppState.selectedTemplate = null;
    window.AppState.currentPreviewIdx = 0;
    renderStudentsList();
    document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('toStep2').disabled = true;
    goTo(1);
  });

  // Download ZIP
  document.getElementById('downloadZip').addEventListener('click', async () => {
    const btn = document.getElementById('downloadZip');
    const original = btn.innerHTML;
    btn.innerHTML = '⏳ ZIP tayyorlanmoqda...';
    btn.disabled = true;

    await Generator.downloadZip(Generator.canvases, (cur, tot) => {
      btn.innerHTML = `⏳ ${Math.round((cur / tot) * 100)}% siqilmoqda...`;
    });

    btn.innerHTML = original;
    btn.disabled = false;
  });

  // Step bar click navigation
  Object.entries(steps).forEach(([n, el]) => {
    el.addEventListener('click', () => {
      const num = parseInt(n);
      if (el.classList.contains('done') || el.classList.contains('active')) {
        goTo(num);
        if (num === 3) setTimeout(renderPreview, 100);
      }
    });
  });
}

// ============================================================
// UTILS
// ============================================================
function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
