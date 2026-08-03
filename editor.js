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
  splitBgImg:          null, // (eski — ishlatilmaydi)
  splitBgImgInner:     null, // ICHKI qism fon rasmi
  splitBgImgOuter:     null, // USTKI (muqova) qism fon rasmi
  staffImgs:           [],   // bog'cha xodimlar: [{img, name, role}]
  groupImgs:           [],   // bog'cha guruh rasmlari: [{img, rt}] (rt=retush)
  transforms:          {},   // free-transform: key -> {scale, ox, oy} (faol qism)
  _ct:                 null,  // { inner:[], outer:[] } — qo'shilgan matnlar
  customTexts:         [],    // faol qismning matnlari
  activeTextId:        null,
  _ic:                 null,  // { inner:[], outer:[] } — PNG ikonlar
  icons:               [],    // faol qismning ikonlari
  activeIconId:        null,
  _blz:                null,  // { inner:{bg,cardbg,photo}, outer:{...} } — bazaviy qatlam z (tartib)
  blz:                 null,  // faol qismning bazaviy qatlam z lari
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
  initBogchaUploads();
  initEditorControls();
  initNavigation();
  loadAlbumState();   // oxirgi albom parametrlarini (agar bo'lsa) o'qib qo'yamiz

  // Ichki/ustki uchun alohida transform xotirasi
  window.AppState._tf = { inner: window.AppState.transforms, outer: {} };
  window.AppState._ct = { inner: window.AppState.customTexts, outer: [] };
  window.AppState._ic = { inner: window.AppState.icons, outer: [] };
  // Bazaviy qatlam tartibi (past→ust: fon=0, card oq foni=1, rasm=2) — ichki/ustki alohida
  window.AppState._blz = { inner: { bg: 0, cardbg: 1, photo: 2 }, outer: { bg: 0, cardbg: 1, photo: 2 } };
  window.AppState.blz = window.AppState._blz.inner;
  // Ustki (vinyetka) shabloni — default: Bitiruvchi Albom (mavjud bo'lsa)
  const outer = (window.TEMPLATES || []).find(t => t.id === 'bitiruvchi-cover')
            || (window.TEMPLATES || []).find(t => t.type === 'vinyetka');
  window.AppState.outerTemplate = outer || null;

  // Google Fonts (Coiny/Oswald) yuklangач preview'ni qayta chizamiz (canvas fallback bo'lmasin)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (window.AppState.students && window.AppState.students.length &&
          typeof renderPreview === 'function') renderPreview();
    });
  }
});

// ============================================================
// STEP 1 – TEMPLATE SELECTION
// ============================================================
function initTemplateGrid() {
  const grid = document.getElementById('templatesGrid');
  const tabs = document.querySelectorAll('.tab-btn');

  function renderTemplates(type) {
    grid.innerHTML = '';
    const list = window.TEMPLATES.filter(t => !t.hidden && (
      type === 'all' ||
      t.type === type ||
      (type === 'inner' && (t.type === 'split-inner' || t.type === 'poster-inner'))  // ichki tabga qo'shamiz
    ));

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

  renderTemplates('all');
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

// Ma'lumot formasi label/placeholderlarini bog'cha yoki maktabga moslash
function setClassInfoLabels(bogcha) {
  const set = (id, txt) => { const e = document.getElementById(id); if (e) e.textContent = txt; };
  const ph  = (id, txt) => { const e = document.getElementById(id); if (e) e.placeholder = txt; };
  const show = (id, on) => { const e = document.getElementById(id); if (e) e.style.display = on ? '' : 'none'; };
  if (bogcha) {
    set('classInfoTitle', '🧸 Bog\'cha Ma\'lumotlari');
    set('lblSchoolName', 'Bog\'cha nomi');   ph('schoolName', 'Yangi Avlod DXShMTT');
    set('lblClassName',  'Guruh nomi');       ph('className',  '1-Tayyorlov');
    show('fgSchoolNumber', false);
    show('fgTeacherName', false);
  } else {
    set('classInfoTitle', '🏫 Sinf Ma\'lumotlari');
    set('lblSchoolName', 'Maktab nomi');      ph('schoolName', '1-son umumiy o\'rta maktab');
    set('lblClassName',  'Sinf');             ph('className',  '11-A');
    show('fgSchoolNumber', true);
    show('fgTeacherName', true);
  }
}

function selectTemplate(card, tpl) {
  document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  window.AppState.selectedTemplate = tpl;
  window.AppState.innerTemplate    = tpl;   // ICHKI qism shabloni
  window.AppState.editPart         = 'inner';
  window.AppState.outerTemplate    = null;  // ustki shablon qayta juftlanadi (pairedOuter)

  const saved = window.AppState._saved;
  window.AppState._restoring = false;
  if (saved && saved.innerTemplateId === tpl.id) {
    // OXIRGI ALBOM parametrlarini tiklaymiz (rasm joyi, retush, matnlar, transformlar)
    window.AppState.cfgInner    = saved.cfgInner || null;
    window.AppState.cfgOuter    = saved.cfgOuter || null;
    window.AppState._tf         = saved.tf || { inner: {}, outer: {} };
    window.AppState.transforms  = window.AppState._tf.inner || (window.AppState._tf.inner = {});
    window.AppState._ct         = saved.ct || { inner: [], outer: [] };
    window.AppState.customTexts = window.AppState._ct.inner || (window.AppState._ct.inner = []);
    window.AppState._ic         = { inner: [], outer: [] };
    window.AppState.icons       = window.AppState._ic.inner;
    window.AppState._blz        = normalizeBlz(saved.blz);
    window.AppState.blz         = window.AppState._blz.inner;
    if (saved.ic && typeof icRestoreAll === 'function')
      icRestoreAll(saved.ic).then(() => { if (typeof renderPreview === 'function') renderPreview(); });
    window.AppState.retouchMap  = saved.retouchMap || {};
    window.AppState.faces       = saved.faces || {};
    window.AppState.frameLocked = !!saved.frameLocked;
    window.AppState._pendingStaffMeta = saved.staffMeta || null;
    window.AppState._pendingGroupRt   = saved.groupRt || null;
    window.AppState._restoring  = true;
  } else {
    window.AppState.cfgInner = null;  // yangi shablon -> snapshotni tozalaymiz
    if (window.AppState._tf) { window.AppState._tf.inner = {}; window.AppState.transforms = window.AppState._tf.inner; }
    if (window.AppState._ct) { window.AppState._ct.inner = []; window.AppState.customTexts = window.AppState._ct.inner; }
    if (window.AppState._ic) { window.AppState._ic.inner = []; window.AppState.icons = window.AppState._ic.inner; }
    window.AppState._blz = normalizeBlz(null);   // yangi shablon -> qatlam tartibi standart
    window.AppState.blz  = window.AppState._blz.inner;
  }

  // Sinf rahbari upload blokini ko'rsat/yashir
  const wrap = document.getElementById('teacherUploadWrap');
  if (wrap) wrap.style.display = tpl.type === 'inner' ? 'block' : 'none';

  // Split-inner upload blokini ko'rsat/yashir
  const splitWrap = document.getElementById('leftPhotoUploadWrap');
  if (splitWrap) splitWrap.style.display =
    (tpl.type === 'split-inner' || tpl.type === 'poster-inner') ? 'block' : 'none';

  // Bog'cha shabloni: xodim + guruh rasmlari upload blokini ko'rsat/yashir
  const bogchaWrap = document.getElementById('bogchaUploadWrap');
  if (bogchaWrap) bogchaWrap.style.display = (tpl.id === 'bogcha-inner') ? 'block' : 'none';
  if (tpl.id === 'bogcha-inner' && splitWrap) splitWrap.style.display = 'none';

  // Ma'lumot formasi nomlari: default maktab; window.BOGCHA_V9 yoqilsa — bog'cha nomlari
  setClassInfoLabels(tpl.id === 'bogcha-inner' && !!window.BOGCHA_V9);

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

  // Bitiruvchi Poster ichki sahifa uchun maxsus defaultlar (type: split-inner)
  if (tpl.id === 'bitiruvchi-poster-inner') {
    const setV = (id, v) => { const e = document.getElementById(id); if (e) e.value = v; };
    const setT = (id, t) => { const e = document.getElementById(id); if (e) e.textContent = t; };
    setV('canvasW', 1280);
    setV('canvasH', 960);
    // Poster = qora fon, 6 ustun, to'rtburchak foto, gold aksent
    setV('splitBgType',   'color');
    setV('splitBgColor',  '#0a0a0a');
    setV('splitBgColor2', '#000000');
    setV('splitNameColor','#ffffff');
    setV('splitMaxCols',  6);  setT('splitMaxColsVal', '6');
    setV('splitPhotoShape','rect');
    setV('splitDivider',  'line');
    setV('splitNamePos',  'bottom');
    setV('accentColor',   '#d4af37');
    // CHAP blok = sinf rahbari → o'qituvchi rasmini yuklash kerak (split bo'lsa ham ko'rsatamiz)
    if (wrap)      wrap.style.display      = 'block';
    if (splitWrap) splitWrap.style.display = 'none';
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

  // Bog'cha ichki shablon uchun maxsus defaultlar (portret 30.5×40, split-inner)
  if (tpl.id === 'bogcha-inner') {
    const setV = (id, v) => { const e = document.getElementById(id); if (e) e.value = v; };
    const setT = (id, t) => { const e = document.getElementById(id); if (e) e.textContent = t; };
    setV('canvasW', 1200);   // albom landscape 40×30.5 sm (eni×bo'yi)
    setV('canvasH', 915);
    setV('splitBgType',   'color');
    setV('splitBgColor',  '#d3e4f6');
    setV('splitBgColor2', '#eef5fc');
    setV('splitNameColor','#173a5e');
    setV('splitMaxCols',  9);  setT('splitMaxColsVal', '9');
    setV('splitPhotoShape','rounded');
    setV('splitDivider',  'none');
    setV('splitNamePos',  'bottom');
    setV('accentColor',   '#5b8def');
    if (wrap)      wrap.style.display      = 'none';
    if (splitWrap) splitWrap.style.display = 'none';
  }

  // Poster-split shablon uchun maxsus defaultlar (aniq o'lcham, landscape)
  if (tpl.id === 'poster-split') {
    document.getElementById('canvasW').value = 4724;
    document.getElementById('canvasH').value = 3602;
    document.getElementById('bgColor1').value = '#000000';
    document.getElementById('bgColor2').value = '#000000';
  }

  // Tiklangan bo'lsa — saqlangan kontrol qiymatlarini DOMga qo'yamiz (defaultlar ustidan)
  if (window.AppState._restoring && window.AppState.cfgInner) restoreControls(window.AppState.cfgInner);

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

  // ── FON RASM (ICHKI/USTKI alohida) ──
  initSplitBgUpload();

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

// ============================================================
// BOG'CHA — XODIM (4) va GURUH (4–5) rasmlari (ko'p-faylli)
// ============================================================
// Xodim fayl nomidan ism + lavozimni ajratish.
// Format: "Familya Ism Lavozim" (yoki "Familya Ism - Lavozim" / vergul bilan).
function parseStaffName(fname) {
  let base = (fname || '').replace(/\.[^.]+$/, '').trim();
  let name = base, role = '';
  if (/[-,]/.test(base)) {
    const idx = base.search(/[-,]/);
    name = base.slice(0, idx).trim();
    role = base.slice(idx + 1).trim();
  } else {
    const toks = base.split(/\s+/);
    if (toks.length >= 3) { name = toks.slice(0, 2).join(' '); role = toks.slice(2).join(' '); }
    else { name = base; role = ''; }
  }
  return { name, role };
}

function initBogchaUploads() {
  window.AppState.staffImgs = window.AppState.staffImgs || [];
  window.AppState.groupImgs = window.AppState.groupImgs || [];

  // stateKey elementlari: { img, name, role } (group uchun name/role bo'sh)
  function wire(zoneId, inputId, thumbsId, stateKey, max, isStaff) {
    const dz = document.getElementById(zoneId);
    const fi = document.getElementById(inputId);
    const tw = document.getElementById(thumbsId);
    if (!dz || !fi) return;

    function renderThumbs() {
      if (!tw) return;
      tw.innerHTML = '';
      const ph = document.getElementById(isStaff ? 'staffPlaceholder' : 'groupPlaceholder');
      (window.AppState[stateKey] || []).forEach((item, i) => {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'position:relative;display:inline-block;margin:3px;text-align:center;vertical-align:top';
        const im = document.createElement('img');
        im.src = (item.img || item).src;
        im.style.cssText = 'width:46px;height:46px;object-fit:cover;border-radius:6px;border:1px solid #3a3a5c;display:block';
        const rm = document.createElement('button');
        rm.textContent = '✕'; rm.title = 'O\'chirish';
        rm.style.cssText = 'position:absolute;top:-6px;right:-6px;width:18px;height:18px;border:none;border-radius:50%;background:#e53e3e;color:#fff;font-size:11px;line-height:1;cursor:pointer;padding:0';
        rm.addEventListener('click', () => {
          window.AppState[stateKey].splice(i, 1);
          renderThumbs();
          if (typeof renderPreview === 'function') renderPreview();
        });
        wrap.append(im, rm);
        if (isStaff && item.name) {
          const cap = document.createElement('div');
          cap.textContent = item.name + (item.role ? (' · ' + item.role) : '');
          cap.style.cssText = 'font-size:9px;color:#9a9ac5;max-width:52px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px';
          wrap.appendChild(cap);
        }
        tw.appendChild(wrap);
      });
      // Placeholder'ni ko'rsatish/yashirish
      if (ph) {
        ph.style.opacity = (window.AppState[stateKey] || []).length > 0 ? '0' : '1';
      }
    }

    function addFiles(files) {
      const arr = Array.from(files || []).filter(f => f.type && f.type.startsWith('image/'));
      arr.forEach(file => {
        if (window.AppState[stateKey].length >= max) return;
        const meta = isStaff ? parseStaffName(file.name) : { name: '', role: '' };
        const img = new Image();
        img.onload = () => {
          if (window.AppState[stateKey].length < max) {
            const item = { img, name: meta.name, role: meta.role };
            const idx = window.AppState[stateKey].length;
            // Saqlangan guruh retushini indeks bo'yicha qayta ulaymiz
            if (stateKey === 'groupImgs' && window.AppState._pendingGroupRt && window.AppState._pendingGroupRt[idx])
              item.rt = window.AppState._pendingGroupRt[idx];
            window.AppState[stateKey].push(item);
          }
          renderThumbs();
          if (typeof renderPreview === 'function') renderPreview();
        };
        img.src = URL.createObjectURL(file);
      });
    }

    dz.addEventListener('click', () => fi.click());
    dz.addEventListener('dragover',  e => { e.preventDefault(); dz.style.borderColor = '#6366f1'; });
    dz.addEventListener('dragleave', () => { dz.style.borderColor = ''; });
    dz.addEventListener('drop', e => { e.preventDefault(); dz.style.borderColor = ''; addFiles(e.dataTransfer.files); });
    fi.addEventListener('change', () => { addFiles(fi.files); fi.value = ''; });
    renderThumbs();
    return renderThumbs;
  }

  const staffApi = wire('staffDropZone', 'staffFileInput', 'staffThumbs', 'staffImgs', 4, true);
  const groupApi = wire('groupDropZone', 'groupFileInput', 'groupThumbs', 'groupImgs', 10, false);
  // Loyiha fayldan ochilganda staff/guruh thumbnaillarini qayta chizish uchun
  window._refreshBogchaThumbs = () => { staffApi && staffApi(); groupApi && groupApi(); };
}

// Joriy qism (ichki/ustki) uchun fon rasmi kaliti va qiymati
function splitBgKey() {
  return (window.AppState.editPart === 'outer') ? 'splitBgImgOuter' : 'splitBgImgInner';
}
function currentSplitBg() {
  return window.AppState[splitBgKey()] || null;
}

// FON RASM yuklash — ICHKI va USTKI qism uchun ALOHIDA saqlanadi.
// Yuklangan rasm joriy editPart ('inner'/'outer') slotiga yoziladi.
function initSplitBgUpload() {
  const dz = document.getElementById('splitBgDropZone');
  const fi = document.getElementById('splitBgFileInput');
  const th = document.getElementById('splitBgThumb');
  const pd = document.getElementById('splitBgPreviewDiv');
  const pl = document.getElementById('splitBgPlaceholder');
  const rb = document.getElementById('splitBgRemove');
  if (!dz || !fi) return;

  // Thumbnail'ni joriy qism fon rasmiga moslash (qism almashganda chaqiriladi)
  function refresh() {
    const img = window.AppState[splitBgKey()];
    if (img) { if (th) th.src = img.src; if (pd) pd.style.display = 'block'; if (pl) pl.style.display = 'none'; }
    else { if (th) th.src = ''; if (pd) pd.style.display = 'none'; if (pl) pl.style.display = ''; }
  }
  window._refreshSplitBg = refresh;

  function load(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const img = new Image();
    img.onload = () => { window.AppState[splitBgKey()] = img; refresh(); renderPreview(); };
    img.src = URL.createObjectURL(file);
  }
  dz.addEventListener('click', () => fi.click());
  dz.addEventListener('dragover',  e => { e.preventDefault(); dz.style.borderColor = '#6366f1'; });
  dz.addEventListener('dragleave', () => { dz.style.borderColor = ''; });
  dz.addEventListener('drop', e => { e.preventDefault(); dz.style.borderColor = ''; load(e.dataTransfer.files[0]); });
  fi.addEventListener('change', () => { load(fi.files[0]); fi.value = ''; });
  rb && rb.addEventListener('click', e => { e.stopPropagation(); window.AppState[splitBgKey()] = null; refresh(); renderPreview(); });
  refresh();
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
    const cx = c.getContext('2d');
    cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high';
    cx.drawImage(bmp, 0, 0);
    if (bmp.close) bmp.close();
    // Orientatsiyani bakelash — deyarli yo'qotishsiz (0.98) sifat saqlanadi
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.98));
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
function ctSelected() {
  const id = window.AppState.activeTextId;
  return id ? (window.AppState.customTexts || []).find(t => t.id === id) : null;
}
function overlayAll() {
  return (window.AppState.icons || []).concat(window.AppState.customTexts || []);
}
function nextZ() {
  const es = (typeof allLayerEntries === 'function') ? allLayerEntries() : overlayAll().map(o => ({ obj: o, z: o.z || 0 }));
  return es.length ? Math.max(...es.map(e => (typeof entryZ === 'function' ? entryZ(e) : (e.z || 0)))) + 1 : 1;
}
function selectedOverlay() {
  return ctSelected() || (typeof icSelected === 'function' ? icSelected() : null);
}
function layerReorder(mode, item) {
  item = item || selectedOverlay();
  if (!item) return;
  const list = overlayAll();
  list.forEach((o, i) => { if (o.z == null) o.z = i; });
  const sorted = list.slice().sort((a, b) => (a.z || 0) - (b.z || 0));
  const idx = sorted.indexOf(item);
  if (mode === 'front') item.z = (sorted[sorted.length - 1].z || 0) + 1;
  else if (mode === 'back') item.z = (sorted[0].z || 0) - 1;
  else if (mode === 'forward' && idx < sorted.length - 1) {
    const nb = sorted[idx + 1], t = item.z; item.z = (nb.z === t) ? t + 1 : nb.z; nb.z = t;
  } else if (mode === 'backward' && idx > 0) {
    const nb = sorted[idx - 1], t = item.z; item.z = (nb.z === t) ? t - 1 : nb.z; nb.z = t;
  }
  renderPreview();
}
// Overlay = ikon yoki matn? Ikonlarda `src` bo'ladi, matnda yo'q.
function overlayIsIcon(o) { return !!(o && o.src != null); }
function overlayName(o) {
  if (overlayIsIcon(o)) {
    const n = (window.AppState.icons || []).indexOf(o);
    return 'PNG overlay ' + (n >= 0 ? n + 1 : '');
  }
  const txt = String(o && o.text == null ? '' : o.text).replace(/\s+/g, ' ').trim();
  return txt ? (txt.length > 20 ? txt.slice(0, 20) + '…' : txt) : 'Matn';
}
function selectOverlay(o) {
  if (!o) return;
  if (overlayIsIcon(o)) { window.AppState.activeIconId = o.id; window.AppState.activeTextId = null; }
  else { window.AppState.activeTextId = o.id; window.AppState.activeIconId = null; }
  window.AppState.activeFrameKey = null;
  if (typeof ctLoadSelected === 'function') ctLoadSelected();
  if (typeof icLoadSelected === 'function') icLoadSelected();
  renderPreview();
}
// ── Bazaviy qatlamlar (layered shablon: bog'cha) — fon / card oq foni / rasm ──
const BASE_LAYER_META = {
  bg:     { name: 'Orqa fon (rasm)',                  color: '#facc15' },
  cardbg: { name: 'Kartalar oq foni',                 color: '#e2e8f0' },
  photo:  { name: 'Rasmlar (o\'quvchi/guruh/katta)',  color: '#a5b4fc' },
};
function layeredActive() {
  const t = window.AppState.selectedTemplate;
  return !!(t && t.layered && window.AppState.blz);
}
// Barcha qatlam yozuvlari: bazaviy (bg/cardbg/photo) + qo'shilgan elementlar
function allLayerEntries() {
  const entries = [];
  if (layeredActive()) {
    const z = window.AppState.blz;
    entries.push({ base: 'bg',     z: z.bg });
    entries.push({ base: 'cardbg', z: z.cardbg });
    entries.push({ base: 'photo',  z: z.photo });
  }
  (window.AppState.icons || []).forEach(o => entries.push({ icon: true, obj: o, id: o.id, z: o.z || 0 }));
  (window.AppState.customTexts || []).forEach(o => entries.push({ text: true, obj: o, id: o.id, z: o.z || 0 }));
  return entries;
}
function entryZ(e) { return e.base ? (window.AppState.blz[e.base] || 0) : (e.obj.z || 0); }
function entrySetZ(e, z) { if (e.base) window.AppState.blz[e.base] = z; else e.obj.z = z; }
function entryKeyOf(e) { return e.base ? ('base:' + e.base) : ((e.icon ? 'ic:' : 'ct:') + e.id); }
// Saqlangan (yoki bo'sh) blz ni to'liq {inner,outer:{bg,cardbg,photo}} shakliga keltiradi
function normalizeBlz(saved) {
  const one = (o) => (!o || typeof o !== 'object')
    ? { bg: 0, cardbg: 1, photo: 2 }
    : { bg: o.bg != null ? o.bg : 0, cardbg: o.cardbg != null ? o.cardbg : 1, photo: o.photo != null ? o.photo : 2 };
  saved = saved || {};
  return { inner: one(saved.inner), outer: one(saved.outer) };
}
// Qatlamni oldinga (+1, ustga) yoki orqaga (-1, ostga) suradi — z ni qo'shni bilan almashtiradi
function moveLayer(key, dir) {
  const list = allLayerEntries().sort((a, b) => entryZ(a) - entryZ(b));  // past→ust
  list.forEach((e, i) => entrySetZ(e, i));   // 0..n-1 ga normallash (to'qnashuvsiz)
  const idx = list.findIndex(e => entryKeyOf(e) === key);
  const j = idx + dir;
  if (idx < 0 || j < 0 || j >= list.length) return;
  const zi = entryZ(list[idx]), zj = entryZ(list[j]);
  entrySetZ(list[idx], zj); entrySetZ(list[j], zi);
  renderPreview();
}
// Qatlamlar ro'yxatini chizadi — eng ustki qator = eng oldindagi qatlam
function renderLayersList() {
  const box = document.getElementById('layersList');
  if (!box) return;
  const entries = allLayerEntries().sort((a, b) => entryZ(b) - entryZ(a));  // front tepada
  box.innerHTML = '';
  if (!entries.length) {
    box.innerHTML = '<small style="color:#7a7aa5;font-size:11px">Hali qatlam yo\'q.</small>';
    return;
  }
  const activeId = window.AppState.activeTextId || window.AppState.activeIconId;
  entries.forEach((e, i) => {
    const isBase = !!e.base;
    const active = !isBase && e.id === activeId;
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:6px;padding:5px 7px;border-radius:7px;'
      + (active ? 'background:#312e6e;border:1px solid #6366f1;'
        : isBase ? 'background:#191933;border:1px solid #2b2b4d;border-left:3px solid ' + BASE_LAYER_META[e.base].color + ';'
        : 'background:#1f1f3a;border:1px solid #2b2b4d;');
    const name = document.createElement('span');
    let label, colr;
    if (isBase) { label = '▦ ' + BASE_LAYER_META[e.base].name; colr = '#c9c9e0'; }
    else if (e.icon) { label = '🖼 ' + overlayName(e.obj); colr = '#7fe3f0'; }
    else { label = '✍️ ' + overlayName(e.obj); colr = '#e6e6f5'; }
    name.textContent = label;
    name.title = isBase ? 'Bazaviy qatlam' : 'Tanlash uchun bosing';
    name.style.cssText = 'flex:1;font-size:12px;' + (isBase ? '' : 'cursor:pointer;')
      + 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:' + colr;
    if (!isBase) name.addEventListener('click', () => selectOverlay(e.obj));
    const up = document.createElement('button'); up.type = 'button'; up.textContent = '+'; up.title = 'Oldinga (ustga) suradi';
    const down = document.createElement('button'); down.type = 'button'; down.textContent = '\u2212'; down.title = 'Orqaga (ostga) suradi';
    [up, down].forEach(b => b.style.cssText = 'width:26px;height:24px;padding:0;border:none;border-radius:5px;'
      + 'background:#3a3a63;color:#fff;font-size:14px;font-weight:700;cursor:pointer;line-height:1;flex:0 0 auto');
    up.disabled = i === 0; down.disabled = i === entries.length - 1;
    if (up.disabled) { up.style.opacity = '0.35'; up.style.cursor = 'default'; }
    if (down.disabled) { down.style.opacity = '0.35'; down.style.cursor = 'default'; }
    const key = entryKeyOf(e);
    up.addEventListener('click', (ev) => { ev.stopPropagation(); moveLayer(key, +1); });
    down.addEventListener('click', (ev) => { ev.stopPropagation(); moveLayer(key, -1); });
    row.appendChild(name); row.appendChild(up); row.appendChild(down);
    box.appendChild(row);
  });
}
window.renderLayersList = renderLayersList;
function ctLoadSelected() {
  const t = ctSelected();
  const ed = document.getElementById('ctEditor');
  if (ed) ed.style.display = t ? '' : 'none';
  if (!t) return;
  const setV = (id, v) => { const e = document.getElementById(id); if (e) e.value = v; };
  const setC = (id, v) => { const e = document.getElementById(id); if (e) e.checked = !!v; };
  setV('ctText', t.text || '');
  setV('ctFamily', t.family || 'Oswald, sans-serif');
  setV('ctColor', t.color || '#173a5e');
  setV('ctSize', (t.size || 0.04) * 100);
  setV('ctRot', t.rot || 0); setV('ctRotNum', t.rot || 0);
  setV('ctAlign', t.align || 'center');
  setC('ctBold', t.bold); setC('ctItalic', t.italic); setC('ctStroke', t.stroke);
  setV('ctStrokeColor', t.strokeColor || '#ffffff');
  const sv = document.getElementById('ctSizeVal'); if (sv) sv.textContent = ((t.size || 0.04) * 100).toFixed(1);
}
function initCustomText() {
  const add = document.getElementById('ctAddBtn');
  if (add) add.addEventListener('click', () => {
    const list = window.AppState.customTexts || (window.AppState.customTexts = []);
    const t = { id: 'T' + Date.now().toString(36) + Math.floor(Math.random() * 1000),
      text: 'Matn', xf: 0.5, yf: 0.5, size: 0.05, color: '#173a5e',
      family: 'Oswald, sans-serif', bold: false, italic: false, rot: 0, align: 'center',
      stroke: false, strokeColor: '#ffffff' };
    t.z = nextZ();
    list.push(t);
    window.AppState.activeTextId = t.id;
    ctLoadSelected();
    renderPreview();
  });
  const del = document.getElementById('ctDelBtn');
  if (del) del.addEventListener('click', () => {
    const id = window.AppState.activeTextId;
    if (!id) return;
    window.AppState.customTexts = (window.AppState.customTexts || []).filter(t => t.id !== id);
    if (window.AppState._ct) window.AppState._ct[window.AppState.editPart] = window.AppState.customTexts;
    window.AppState.activeTextId = null;
    ctLoadSelected();
    renderPreview();
  });
  const bind = (id, prop, kind) => {
    const el = document.getElementById(id);
    if (!el) return;
    const ev = (kind === 'check' || el.tagName === 'SELECT' || el.type === 'color') ? 'change' : 'input';
    el.addEventListener(ev, () => {
      const t = ctSelected(); if (!t) return;
      if (kind === 'check') t[prop] = el.checked;
      else if (kind === 'sizePct') { t[prop] = parseFloat(el.value) / 100; const v = document.getElementById('ctSizeVal'); if (v) v.textContent = parseFloat(el.value).toFixed(1); }
      else if (kind === 'rot') { const v = Math.max(-180, Math.min(180, parseFloat(el.value) || 0)); t[prop] = v; const s = document.getElementById('ctRot'), n = document.getElementById('ctRotNum'); if (s) s.value = v; if (n) n.value = v; }
      else t[prop] = el.value;
      renderPreview();
    });
  };
  bind('ctText', 'text');
  bind('ctFamily', 'family');
  bind('ctColor', 'color');
  bind('ctSize', 'size', 'sizePct');
  bind('ctRot', 'rot', 'rot');
  bind('ctRotNum', 'rot', 'rot');
  bind('ctAlign', 'align');
  bind('ctBold', 'bold', 'check');
  bind('ctItalic', 'italic', 'check');
  bind('ctStroke', 'stroke', 'check');
  bind('ctStrokeColor', 'strokeColor');
}

function icSelected() {
  const id = window.AppState.activeIconId;
  return id ? (window.AppState.icons || []).find(o => o.id === id) : null;
}
function icLoadSelected() {
  const o = icSelected();
  const ed = document.getElementById('icEditor');
  if (ed) ed.style.display = o ? '' : 'none';
  if (!o) return;
  const setV = (id, v) => { const e = document.getElementById(id); if (e) e.value = v; };
  setV('icSize', (o.size || 0.15) * 100);
  setV('icRot', o.rot || 0); setV('icRotNum', o.rot || 0);
  setV('icOpacity', Math.round((o.opacity != null ? o.opacity : 1) * 100));
  const sv = document.getElementById('icSizeVal'); if (sv) sv.textContent = ((o.size || 0.15) * 100).toFixed(0);
  const ov = document.getElementById('icOpacityVal'); if (ov) ov.textContent = Math.round((o.opacity != null ? o.opacity : 1) * 100);
}
function initIconTool() {
  const add = document.getElementById('icAddBtn');
  const inp = document.getElementById('icAddInput');
  if (add && inp) {
    add.addEventListener('click', () => inp.click());
    inp.addEventListener('change', async () => {
      const f = inp.files && inp.files[0]; inp.value = '';
      if (!f) return;
      const src = await new Promise(res => { const rd = new FileReader(); rd.onload = () => res(rd.result); rd.onerror = () => res(null); rd.readAsDataURL(f); });
      const img = await dataURLToImg(src);
      if (!img) return;
      const list = window.AppState.icons || (window.AppState.icons = []);
      const o = { id: 'I' + Date.now().toString(36) + Math.floor(Math.random() * 1000),
        src, img, xf: 0.5, yf: 0.5, size: 0.18, rot: 0, opacity: 1 };
      o.z = nextZ();
      list.push(o);
      if (window.AppState._ic) window.AppState._ic[window.AppState.editPart] = list;
      window.AppState.activeIconId = o.id;
      icLoadSelected();
      renderPreview();
    });
  }
  const del = document.getElementById('icDelBtn');
  if (del) del.addEventListener('click', () => {
    const id = window.AppState.activeIconId;
    if (!id) return;
    window.AppState.icons = (window.AppState.icons || []).filter(o => o.id !== id);
    if (window.AppState._ic) window.AppState._ic[window.AppState.editPart] = window.AppState.icons;
    window.AppState.activeIconId = null;
    icLoadSelected();
    renderPreview();
  });
  const bind = (id, prop, kind) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      const o = icSelected(); if (!o) return;
      if (kind === 'sizePct') { o[prop] = parseFloat(el.value) / 100; const v = document.getElementById('icSizeVal'); if (v) v.textContent = parseFloat(el.value).toFixed(0); }
      else if (kind === 'opacity') { o[prop] = Math.max(0.05, Math.min(1, parseFloat(el.value) / 100)); const v = document.getElementById('icOpacityVal'); if (v) v.textContent = el.value; }
      else if (kind === 'rot') { const v = Math.max(-180, Math.min(180, parseFloat(el.value) || 0)); o[prop] = v; const s = document.getElementById('icRot'), n = document.getElementById('icRotNum'); if (s) s.value = v; if (n) n.value = v; }
      renderPreview();
    });
  };
  bind('icSize', 'size', 'sizePct');
  bind('icRot', 'rot', 'rot');
  bind('icRotNum', 'rot', 'rot');
  bind('icOpacity', 'opacity', 'opacity');
}

function initEditorControls() {
  initCustomText();
  initIconTool();
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
  document.querySelectorAll('#ovTitle,#ovSchoolNum,#ovClass,#ovYear,#ovCity,#bogInnerLeft,#bogInnerRight,#bogBottomColor,#bogCollageTitle,#innerLayoutMode').forEach(el => {
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
    window.AppState.activeFrameKey = null;   // o'quvchi retushiga qaytish
    rtLoadCurrent();
    renderPreview();
  });
  document.getElementById('nextStudent').addEventListener('click', () => {
    const len = window.AppState.students.length;
    if (!len) return;
    window.AppState.currentPreviewIdx =
      (window.AppState.currentPreviewIdx + 1) % len;
    window.AppState.activeFrameKey = null;   // o'quvchi retushiga qaytish
    rtLoadCurrent();
    renderPreview();
  });

  // ── FREE TRANSFORM: rasmlarni qo'lda siljitish/masshtab (Photoshop kabi) ──
  initFreeTransform();

  // Oyna o'lchami o'zgarsa — preview'ni qayta o'lchash (transformda emas)
  window.addEventListener('resize', () => { if (typeof sizePreviewCanvas === 'function') sizePreviewCanvas(); });

  // ── PREVIEW ZOOM (yaqinlashtirish) ──
  const pzIn  = document.getElementById('previewZoomIn');
  const pzOut = document.getElementById('previewZoomOut');
  const pzRst = document.getElementById('previewZoomReset');
  if (pzIn)  pzIn.addEventListener('click',  () => setPreviewZoom((window.AppState.previewZoom || 1) + 0.25));
  if (pzOut) pzOut.addEventListener('click', () => setPreviewZoom((window.AppState.previewZoom || 1) - 0.25));
  if (pzRst) pzRst.addEventListener('click', () => setPreviewZoom(1));

  const afBtn = document.getElementById('autoFitBtn');
  if (afBtn) afBtn.addEventListener('click', runAutoFit);

  // Muqova ramka rejimi qulfi (ramka ↔ ichki rasm)
  const flBtn = document.getElementById('frameLockBtn');
  if (flBtn) flBtn.addEventListener('click', () => {
    window.AppState.frameLocked = !window.AppState.frameLocked;
    flBtn.textContent = window.AppState.frameLocked
      ? '🔒 Ichki rasm rejimi (surish/zoom)'
      : '🔓 Ramka rejimi (ko\'chirish/o\'lcham)';
    if (typeof renderPreview === 'function') renderPreview();
  });

  // Tekislash — o'rtadagi 3 ta rasmni bir xil o'lcham + bir sathga keltirish
  const eqBtn = document.getElementById('equalizeFramesBtn');
  if (eqBtn) eqBtn.addEventListener('click', () => {
    equalizeFrames(['grp1', 'grp2', 'grp3']);   // o'rta 3 ta
    if (typeof renderPreview === 'function') renderPreview();
  });

  // Rasm joyini almashtirish rejimi (2 ta ramkani bosib almashtirish)
  const swBtn = document.getElementById('frameSwapBtn');
  if (swBtn) swBtn.addEventListener('click', () => {
    window.AppState.swapMode = !window.AppState.swapMode;
    window.AppState.swapFirst = null;
    swBtn.textContent = window.AppState.swapMode
      ? '🔀 Almashtirish: 2 ta rasmni bosing'
      : '🔀 Rasm joyini almashtirish';
    swBtn.classList.toggle('active', window.AppState.swapMode);
    if (typeof renderPreview === 'function') renderPreview();
  });

  const afF = document.getElementById('afFace');
  const afFV = document.getElementById('afFaceVal');
  if (afF) afF.addEventListener('input', () => { if (afFV) afFV.textContent = afF.value + '%'; resetImgAuto(['g']); renderPreview(); });

  const afY = document.getElementById('afFaceY');
  const afYV = document.getElementById('afFaceYVal');
  if (afY) afY.addEventListener('input', () => { if (afYV) afYV.textContent = afY.value + '%'; resetImgAuto(['g']); renderPreview(); });

  const afFL = document.getElementById('afFaceLeft');
  const afFLV = document.getElementById('afFaceLeftVal');
  if (afFL) afFL.addEventListener('input', () => { if (afFLV) afFLV.textContent = afFL.value + '%'; resetImgAuto(['L', 'coverPortrait', 'staff']); renderPreview(); });

  // Ustki muqova rasm kattaligi (zoom) slayderi
  const cvS  = document.getElementById('coverScale');
  const cvSV = document.getElementById('coverScaleVal');
  if (cvS) cvS.addEventListener('input', () => { if (cvSV) cvSV.textContent = cvS.value + '%'; renderPreview(); });

  // Ustki muqova rasm vertikal joyi slayderi
  const cvY  = document.getElementById('coverOffsetY');
  const cvYV = document.getElementById('coverOffsetYVal');
  if (cvY) cvY.addEventListener('input', () => { if (cvYV) cvYV.textContent = cvY.value; renderPreview(); });

  const afYL = document.getElementById('afFaceYLeft');
  const afYLV = document.getElementById('afFaceYLeftVal');
  if (afYL) afYL.addEventListener('input', () => { if (afYLV) afYLV.textContent = afYL.value + '%'; resetImgAuto(['L', 'coverPortrait', 'staff']); renderPreview(); });

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
      delete window.AppState.transforms[`coverPortraitIn${i}`];   // muqova portreti ichki avto-yuz markaz
    }
    // Bog'cha XODIMLARI uchun ham yuz aniqlash (staff0..)
    const staff = window.AppState.staffImgs || [];
    for (let i = 0; i < staff.length; i++) {
      if (btn) btn.textContent = `⏳ Xodim yuzi ${i + 1}/${staff.length}`;
      const im = staff[i] && staff[i].img;
      let det = null;
      if (im) { try { det = await faceapi.detectSingleFace(im, opt); } catch (e) {} }
      if (det && det.box) {
        const b = det.box;
        const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height;
        window.AppState.faces[`staff${i}`] = { cx: (b.x + b.width / 2) / iw, cy: (b.y + b.height / 2) / ih, fh: b.height / ih };
      } else {
        window.AppState.faces[`staff${i}`] = null;
      }
      delete window.AppState.transforms[`staff${i}`];
    }
    renderPreview();
    if (btn) { btn.textContent = '✓ Tayyor'; setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1300); }
  } catch (e) {
    if (btn) { btn.textContent = orig; btn.disabled = false; }
    alert('Avto-tekislashda xatolik: ' + (e && e.message ? e.message : e));
  }
}

// Bir qatordagi ramkalarni BIR XIL o'lcham + bir sathga keltirish (tekislash).
// Mavjud transformlarning o'rtacha o'lchami olinadi; ox=0 (default X — bir tekis),
// oy va sx/sy hammasi uchun bir xil qilinadi → biri katta/kichik yoki past/baland qolmaydi.
function equalizeFrames(keys) {
  const T = window.AppState.transforms || (window.AppState.transforms = {});
  let n = 0, sx = 0, sy = 0, oy = 0;
  keys.forEach(k => {
    const t = T[k];
    if (t) {
      sx += (t.sx != null ? t.sx : (t.scale || 1));
      sy += (t.sy != null ? t.sy : (t.scale || 1));
      oy += (t.oy || 0);
      n++;
    }
  });
  const aSx = n ? sx / n : 1, aSy = n ? sy / n : 1, aOy = n ? oy / n : 0;
  keys.forEach(k => {
    const t = T[k] || {};
    t.sx = aSx; t.sy = aSy; t.ox = 0; t.oy = aOy;   // bir xil o'lcham, default X, bir sath
    T[k] = t;
  });
}

// Preview canvas ustida rasmlarni sudrash (move) va g'ildirak (zoom)
function initFreeTransform() {
  const pc = document.getElementById('previewCanvas');
  if (!pc) return;

  let drag = null;
  const HANDLE = 22;   // o'lcham dastasi (burchak) hit radiusi (canvas px)

  const toCanvas = (e) => {
    const rect = pc.getBoundingClientRect();
    const fx = pc.width / rect.width, fy = pc.height / rect.height;
    const t = e.touches ? e.touches[0] : e;
    return { x: (t.clientX - rect.left) * fx, y: (t.clientY - rect.top) * fy, fx, fy };
  };
  const regionAt = (cx, cy) => {
    const regs = window.AppState._regions || [];
    for (let i = regs.length - 1; i >= 0; i--) {
      const r = regs[i];
      if (cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h) return r;
    }
    return null;
  };
  // Oddiy rasm transformi (ichki pan/zoom)
  const getT = (key) => {
    const t = window.AppState.transforms[key] || { scale: 1, ox: 0, oy: 0 };
    t.src = 'manual';
    window.AppState.transforms[key] = t;
    return t;
  };
  // Ramka transformi (ko'chirish/o'lcham + ichki)
  const getFT = (key) => {
    const t = window.AppState.transforms[key] || {};
    if (t.sx == null) t.sx = t.scale || 1;
    if (t.sy == null) t.sy = t.scale || 1;
    window.AppState.transforms[key] = t;
    return t;
  };
  // Qaysi o'lcham dastasi: 'r' = o'ng chekka (eni), 'b' = past chekka (bo'yi), aks holda null
  const handleAt = (r, p) => {
    const rx = r.x + r.w, ry = r.y + r.h / 2;   // o'ng-o'rta
    const bx = r.x + r.w / 2, by = r.y + r.h;   // past-o'rta
    if (Math.abs(p.x - rx) <= HANDLE && Math.abs(p.y - ry) <= HANDLE) return 'r';
    if (Math.abs(p.x - bx) <= HANDLE && Math.abs(p.y - by) <= HANDLE) return 'b';
    return null;
  };

  pc.addEventListener('mousedown', (e) => {
    const p = toCanvas(e);
    const r = regionAt(p.x, p.y);
    if (!r) return;

    // ALMASHTIRISH rejimi — faqat guruh rasmlari (grp) almashtiriladi
    if (window.AppState.swapMode && r.frame && String(r.key).indexOf('grp') === 0) {
      const idx = parseInt(String(r.key).replace(/\D/g, ''), 10);
      if (window.AppState.swapFirst == null) {
        window.AppState.swapFirst = idx;
      } else if (window.AppState.swapFirst !== idx) {
        const g = window.AppState.groupImgs || [];
        const a = window.AppState.swapFirst;
        const tmp = g[a]; g[a] = g[idx]; g[idx] = tmp;   // faqat RASMLAR o'rin almashadi
        // ramka transformlari (grp) O'CHIRILMAYDI — slot pozitsiyalari o'zgarmaydi
        window.AppState.swapFirst = null;
      } else {
        window.AppState.swapFirst = null;   // o'zini bossa — bekor
      }
      renderPreview();
      e.preventDefault();
      return;
    }

    if (r.custom) {
      window.AppState.activeFrameKey = null;
      window.AppState.activeIconId = null;
      window.AppState.activeTextId = r.id;
      if (typeof ctLoadSelected === 'function') ctLoadSelected();
      if (typeof icLoadSelected === 'function') icLoadSelected();
      const t = (window.AppState.customTexts || []).find(x => x.id === r.id);
      drag = { mode: 'custom', t, lastX: e.clientX, lastY: e.clientY, cw: pc.width, ch: pc.height, fx: p.fx, fy: p.fy };
      pc.style.cursor = 'grabbing'; e.preventDefault(); renderPreview(); return;
    }
    if (r.icon) {
      window.AppState.activeFrameKey = null;
      window.AppState.activeTextId = null;
      window.AppState.activeIconId = r.id;
      if (typeof ctLoadSelected === 'function') ctLoadSelected();
      if (typeof icLoadSelected === 'function') icLoadSelected();
      const o = (window.AppState.icons || []).find(x => x.id === r.id);
      drag = { mode: 'icon', t: o, lastX: e.clientX, lastY: e.clientY, cw: pc.width, ch: pc.height, fx: p.fx, fy: p.fy };
      pc.style.cursor = 'grabbing'; e.preventDefault(); renderPreview(); return;
    }

    // Vertikal matn (muqova pastidagi shahar·yil) — faqat tepa/pastga sudraladi
    if (r.textY) {
      const t = window.AppState.transforms[r.key] || (window.AppState.transforms[r.key] = {});
      drag = { mode: 'texty', t, lastY: e.clientY, fy: p.fy, ch: pc.height };
      pc.style.cursor = 'grabbing'; e.preventDefault(); return;
    }

    const locked = !!window.AppState.frameLocked;
    if (r.frame) {
      window.AppState.activeFrameKey = r.key;
      if (typeof rtLoadCurrent === 'function') rtLoadCurrent();  // shu rasm retushini sliderlarga
      const hnd = locked ? null : handleAt(r, p);
      if (hnd) {
        const t = getFT(r.key);   // RAMKA o'lchami (umumiy) — eni yoki bo'yi alohida
        drag = { mode: 'resize', axis: hnd, t, downX: e.clientX, downY: e.clientY, fx: p.fx, fy: p.fy,
                 startW: r.w, startH: r.h, startSx: t.sx, startSy: t.sy };
      } else if (locked) {
        const t = getFT(r.innerKey || r.key);   // ICHKI pozitsiya (alohida)
        drag = { mode: 'inner', t, lastX: e.clientX, lastY: e.clientY, fx: p.fx, fy: p.fy, w: r.w, h: r.h };
      } else {
        const t = getFT(r.key);   // RAMKA joyi (umumiy)
        const sx = t.sx || 1, sy = t.sy || 1;
        drag = { mode: 'frame', t, lastX: e.clientX, lastY: e.clientY, fx: p.fx, fy: p.fy, baseW: r.w / sx, baseH: r.h / sy };
      }
    } else if (String(r.key).indexOf('staff') === 0) {
      window.AppState.activeFrameKey = r.key;   // xodim → retush shu xodimga
      if (typeof rtLoadCurrent === 'function') rtLoadCurrent();
      drag = { mode: 'image', t: getT(r.key), lastX: e.clientX, lastY: e.clientY, fx: p.fx, fy: p.fy, w: r.w, h: r.h };
    } else {
      window.AppState.activeFrameKey = null;   // guruh emas → o'quvchi retushi
      drag = { mode: 'image', t: getT(r.key), lastX: e.clientX, lastY: e.clientY, fx: p.fx, fy: p.fy, w: r.w, h: r.h };
    }
    pc.style.cursor = 'grabbing';
    e.preventDefault();
    renderPreview();
  });

  window.addEventListener('mousemove', (e) => {
    if (!drag) return;
    const t = drag.t;
    if (drag.mode === 'resize') {
      if (drag.axis === 'r') {   // ENI (gorizontal)
        const dxP = (e.clientX - drag.downX) * drag.fx;
        t.sx = Math.max(0.3, Math.min(4, drag.startSx * Math.max(20, drag.startW + dxP) / drag.startW));
      } else {                    // BO'YI (vertikal)
        const dyP = (e.clientY - drag.downY) * drag.fy;
        t.sy = Math.max(0.3, Math.min(4, drag.startSy * Math.max(20, drag.startH + dyP) / drag.startH));
      }
    } else if (drag.mode === 'frame') {
      const dx = (e.clientX - drag.lastX) * drag.fx, dy = (e.clientY - drag.lastY) * drag.fy;
      t.ox = (t.ox || 0) + dx / drag.baseW;
      t.oy = (t.oy || 0) + dy / drag.baseH;
      drag.lastX = e.clientX; drag.lastY = e.clientY;
    } else if (drag.mode === 'texty') {
      const dy = (e.clientY - drag.lastY) * drag.fy;
      t.ty = Math.max(-0.55, Math.min(0.4, (t.ty || 0) + dy / drag.ch));  // balandlik ULUSHI
      drag.lastY = e.clientY;
    } else if (drag.mode === 'custom' || drag.mode === 'icon') {
      const dx = (e.clientX - drag.lastX) * drag.fx, dy = (e.clientY - drag.lastY) * drag.fy;
      t.xf = Math.max(0, Math.min(1, (t.xf != null ? t.xf : 0.5) + dx / drag.cw));
      t.yf = Math.max(0, Math.min(1, (t.yf != null ? t.yf : 0.5) + dy / drag.ch));
      drag.lastX = e.clientX; drag.lastY = e.clientY;
    } else if (drag.mode === 'inner') {
      const dx = (e.clientX - drag.lastX) * drag.fx, dy = (e.clientY - drag.lastY) * drag.fy;
      t.iox = (t.iox || 0) + dx / drag.w;
      t.ioy = (t.ioy || 0) + dy / drag.h;
      t.iSrc = 'manual';   // qo'lda surildi → avto yuz kadrlashni bekor qiladi
      drag.lastX = e.clientX; drag.lastY = e.clientY;
    } else {
      const dx = (e.clientX - drag.lastX) * drag.fx, dy = (e.clientY - drag.lastY) * drag.fy;
      t.ox += dx / drag.w; t.oy += dy / drag.h;
      drag.lastX = e.clientX; drag.lastY = e.clientY;
    }
    renderPreview();
  });
  window.addEventListener('mouseup', () => { if (drag) { drag = null; pc.style.cursor = 'default'; } });

  // Hover — kursor
  pc.addEventListener('mousemove', (e) => {
    if (drag) return;
    const p = toCanvas(e);
    const r = regionAt(p.x, p.y);
    const hnd = (r && r.frame && !window.AppState.frameLocked) ? handleAt(r, p) : null;
    if (hnd === 'r') pc.style.cursor = 'ew-resize';
    else if (hnd === 'b') pc.style.cursor = 'ns-resize';
    else if (r && r.textY) pc.style.cursor = 'ns-resize';
    else pc.style.cursor = r ? 'grab' : 'default';
  });

  // G'ildirak — zoom (ramka bo'lsa: qulf ochiq=o'lcham, qulflangan=ichki rasm)
  pc.addEventListener('wheel', (e) => {
    const p = toCanvas(e);
    const r = regionAt(p.x, p.y);
    if (!r) return;
    e.preventDefault();
    const f = e.deltaY < 0 ? 1.08 : 0.926;
    if (r.icon) {
      const o = (window.AppState.icons || []).find(x => x.id === r.id);
      if (o) { o.size = Math.max(0.02, Math.min(1.5, (o.size || 0.15) * f)); if (typeof icLoadSelected === 'function') icLoadSelected(); renderPreview(); }
      return;
    }
    if (r.custom) {
      const t = (window.AppState.customTexts || []).find(x => x.id === r.id);
      if (t) { t.size = Math.max(0.005, Math.min(0.5, (t.size || 0.05) * f)); if (typeof ctLoadSelected === 'function') ctLoadSelected(); renderPreview(); }
      return;
    }
    if (r.frame) {
      const t = getFT(r.key);
      if (window.AppState.frameLocked) { t.iscale = Math.max(1, Math.min(6, (t.iscale || 1) * f)); t.iSrc = 'manual'; }
      else { t.sx = Math.max(0.3, Math.min(4, (t.sx || 1) * f)); t.sy = Math.max(0.3, Math.min(4, (t.sy || 1) * f)); }
    } else {
      const t = getT(r.key);
      t.scale = Math.max(0.2, Math.min(8, (t.scale || 1) * f));
    }
    renderPreview();
  }, { passive: false });

  // Ikki marta bosish — transformni tiklash
  pc.addEventListener('dblclick', (e) => {
    const p = toCanvas(e);
    const r = regionAt(p.x, p.y);
    if (!r) return;
    if (r.custom) {
      const t = (window.AppState.customTexts || []).find(x => x.id === r.id);
      if (t) { const v = prompt('Matn:', t.text); if (v != null) { t.text = v; if (typeof ctLoadSelected === 'function') ctLoadSelected(); renderPreview(); } }
      return;
    }
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
  const availH = ((cont ? cont.clientHeight : 700) - 44);
  const cW = canvas.width  || tpl.defaultW;
  const cH = canvas.height || tpl.defaultH;
  // Eni VA bo'yi bo'yicha sig'diriladi — landscape albom vertikal qirqilib/scroll bo'lib qolmasin
  const baseScale = Math.min(1, availW / cW, availH / cH);
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
  // Print shablonlarda (printW/printH) preview NISBATI aynan bosma nisbatiga
  // tenglashtiriladi — aks holda cover-fit chetlarni renderда boshqacha qirqadi.
  if (tpl.printW && tpl.printH) {
    const pw = Math.min(1400, tpl.printW);
    cfg.canvasW = pw;
    cfg.canvasH = Math.round(pw * tpl.printH / tpl.printW);
  }
  const canvas  = document.getElementById('previewCanvas');
  // Preview o'lchamini FAQAT canvas o'lchami yoki zoom o'zgarganda qayta hisoblaymiz —
  // transform (sudrash/zoom) paytida preview qimirlab/siljib ketmasligi uchun.
  const zoomNow = window.AppState.previewZoom || 1;
  const needSize = (canvas.width !== cfg.canvasW || canvas.height !== cfg.canvasH || window.AppState._lastZoom !== zoomNow);
  canvas.width  = cfg.canvasW;
  canvas.height = cfg.canvasH;
  if (needSize) { sizePreviewCanvas(); window.AppState._lastZoom = zoomNow; }

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
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
  const bogTextCard = document.getElementById('bogchaTextCard');
  if (bogTextCard) bogTextCard.style.display = (panelTpl.id === 'bogcha-inner') ? '' : 'none';

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
    const splitDrawCfg = {
      ...cfg,
      w: cfg.canvasW, h: cfg.canvasH,
      allStudents:    students,
      ownerIndex:     idx,
      leftImg:        student.img || null,           // o'quvchining o'zi = chap portret
      teacherImg:     window.AppState.teacherImg,     // poster shabloni chap blok uchun
      bgImg:          currentSplitBg(),                // ichki/ustki alohida fon
      transforms:     window.AppState.transforms,    // free-transform
      faces:          window.AppState.faces,
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
      blz:            window.AppState.blz,             // bazaviy qatlam tartibi
    };
    if (tpl.layered && window.compositeLayers) {
      // Qatlamli (bog'cha): fon/card/rasm + elementlar tanlangan tartibda birlashtiriladi
      window.compositeLayers(ctx, canvas, tpl, window.AppState.classInfo, splitDrawCfg, _hit);
    } else {
      splitDrawCfg.hitRegions = _hit;                // rasm hududlari (hit-test)
      tpl.draw(ctx, window.AppState.classInfo, splitDrawCfg);
    }
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
      transforms:  window.AppState.transforms,   // free-transform (qo'lda sudrash/zoom)
      faces:       window.AppState.faces,         // avtomatik yuz kadrlash
      hitRegions:  _hit,                          // rasm hududlari (hit-test)
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
      faceIdx:     idx,                            // cover auto-yuz/transform kaliti uchun
      transforms:  window.AppState.transforms,     // free-transform (cover rasmi)
      faces:       window.AppState.faces,           // avtomatik yuz kadrlash
      hitRegions:  _hit,                            // rasm hududlari (hit-test)
    });
    document.querySelector('.preview-label').textContent =
      `Ko'rish — ${idx + 1}-o'quvchi namunasi`;
  }

  // Layered shablonda elementlar kompozitsiya ichida chizildi — bu yerda takrorlanmaydi
  if (!tpl.layered && window.bDrawOverlays) window.bDrawOverlays(ctx, { icons: cfg.icons, customTexts: cfg.customTexts, hitRegions: _hit }, canvas.width, canvas.height);

  // Almashtirish rejimida tanlangan birinchi rasmни yashil belgilash
  if (window.AppState.swapMode && window.AppState.swapFirst != null) {
    const sf = _hit.find(x => x.key === ('grp' + window.AppState.swapFirst) && x.frame);
    if (sf) {
      ctx.save();
      ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 3;
      ctx.strokeRect(sf.x, sf.y, sf.w, sf.h);
      ctx.fillStyle = 'rgba(34,197,94,0.12)'; ctx.fillRect(sf.x, sf.y, sf.w, sf.h);
      ctx.restore();
    }
  }

  // Aktiv ramka (muqova guruh rasmi) — tanlash chizig'i + o'lcham dastasi (almashtirish rejimida emas)
  const afk = window.AppState.swapMode ? null : window.AppState.activeFrameKey;
  if (afk) {
    const fr = _hit.find(x => x.key === afk && x.frame);
    if (fr) {
      ctx.save();
      ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2;
      ctx.setLineDash([7, 5]);
      ctx.strokeRect(fr.x, fr.y, fr.w, fr.h);
      ctx.setLineDash([]);
      if (!window.AppState.frameLocked) {
        const hs = 16;
        const drawH = (cx, cy) => {
          ctx.fillStyle = '#6366f1';
          ctx.beginPath(); ctx.roundRect(cx - hs / 2, cy - hs / 2, hs, hs, 3); ctx.fill();
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        };
        drawH(fr.x + fr.w, fr.y + fr.h / 2);   // o'ng-o'rta → eni
        drawH(fr.x + fr.w / 2, fr.y + fr.h);   // past-o'rta → bo'yi
      }
      ctx.restore();
    } else {
      // Xodim (ramka emas) — tanlash chizig'i (retush shu rasmga tegishli)
      const sr = _hit.find(x => x.key === afk);
      if (sr) {
        ctx.save();
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
        ctx.setLineDash([7, 5]); ctx.strokeRect(sr.x, sr.y, sr.w, sr.h);
        ctx.setLineDash([]); ctx.restore();
      }
    }
  }

  if (window.AppState.activeTextId) {
    const tr = _hit.find(x => x.custom && x.id === window.AppState.activeTextId);
    if (tr) {
      ctx.save();
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      ctx.strokeRect(tr.x - 4, tr.y - 4, tr.w + 8, tr.h + 8);
      ctx.setLineDash([]); ctx.restore();
    }
  }
  if (window.AppState.activeIconId) {
    const ir = _hit.find(x => x.icon && x.id === window.AppState.activeIconId);
    if (ir) {
      ctx.save();
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      ctx.strokeRect(ir.x - 4, ir.y - 4, ir.w + 8, ir.h + 8);
      ctx.setLineDash([]); ctx.restore();
    }
  }

  window.AppState._regions = _hit;  // hit-test uchun saqlash
  if (typeof renderLayersList === 'function') renderLayersList();  // qatlamlar ro'yxati
  saveAlbumStateDebounced();        // parametrlarni localStorage'ga saqlaymiz
}

// ============================================================
// AVTO-RETUSH (API'siz, lokal) — har bir rasmni o'qib, ideal parametr tanlaydi
// ============================================================
function rtClamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

// Joriy preview o'quvchisining slider qiymatlarini retouchMap ga saqlash
// Faol tanlangan guruh rasmi indeksi (activeFrameKey 'grpN' bo'lsa), aks holda -1
function resetImgAuto(prefixes) {
  const T = window.AppState.transforms || {};
  Object.keys(T).forEach(k => {
    if (!prefixes.some(p => k.indexOf(p) === 0)) return;
    const t = T[k]; if (!t) return;
    if (t.src === 'manual') delete T[k];
    if (t.iSrc === 'manual') { t.iSrc = null; t.iox = 0; t.ioy = 0; t.iscale = 1; }
  });
}
function activeGroupIdx() {
  const k = window.AppState.activeFrameKey;
  if (k && String(k).indexOf('grp') === 0) return parseInt(String(k).replace(/\D/g, ''), 10);
  return -1;
}

function rtSaveCurrent() {
  const g = id => parseInt((document.getElementById(id) || {}).value) || 0;
  const rt = {
    smooth:     g('rtSmooth'),
    warmth:     g('rtWarmth'),
    brightness: g('rtBright'),
    contrast:   g('rtContrast'),
    saturation: g('rtSat'),
    vignette:   g('rtVignette'),
  };
  const ak = window.AppState.activeFrameKey;
  if (ak && String(ak).indexOf('staff') === 0) {             // tanlangan xodim retushi
    window.AppState.retouchMap[ak] = rt; return;
  }
  const gi = activeGroupIdx();
  const gr = (gi >= 0 && window.AppState.groupImgs) ? window.AppState.groupImgs[gi] : null;
  if (gr) gr.rt = rt;                                        // tanlangan guruh rasmi retushi
  else window.AppState.retouchMap[window.AppState.currentPreviewIdx || 0] = rt;  // o'quvchi
}

// retouchMap/guruh retushini sliderlarga yuklash
function rtLoadCurrent() {
  const ak = window.AppState.activeFrameKey;
  const gi = activeGroupIdx();
  const gr = (gi >= 0 && window.AppState.groupImgs) ? window.AppState.groupImgs[gi] : null;
  const p = (ak && String(ak).indexOf('staff') === 0)
    ? (window.AppState.retouchMap[ak] || {})
    : (gr ? (gr.rt || {}) : (window.AppState.retouchMap[window.AppState.currentPreviewIdx || 0] || {}));
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
  // Xodimlar (bog'cha) — har biriga individual retush
  const staff = window.AppState.staffImgs || [];
  for (let i = 0; i < staff.length; i++) {
    const im = staff[i] && staff[i].img;
    if (!im) continue;
    const p = analyzeRetouch(im, window.AppState.faces['staff' + i]);
    if (p) { window.AppState.retouchMap['staff' + i] = p; applied++; }
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
  'splitDivider','splitNamePos','splitMaxCols','leftLabel','splitBgType','coverScale','coverOffsetY',
  'ovType','ovTitle','ovSchoolNum','ovClass','ovYear','ovCity',
  'bogInnerLeft','bogInnerRight','bogBottomColor','bogCollageTitle','innerLayoutMode',
  'afFace','afFaceY','afFaceLeft','afFaceYLeft',   // yuz tekislash — ichki/tashqi alohida
];
const CFG_LABEL_SFX = { nameFontSize:'px', schoolFontSize:'px', photoScale:'%', photoOffsetY:'px', coverScale:'%',
  afFace:'%', afFaceY:'%', afFaceLeft:'%', afFaceYLeft:'%' };

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

// ============================================================
// ALBOM PARAMETRLARINI SAQLASH (localStorage) — rasmlar joyi/retush/matnlar
// (Rasmlarning o'zi saqlanmaydi; sozlamalar INDEKS bo'yicha qayta tiklanadi.)
// ============================================================
const ALBUM_STATE_KEY = 'VINYETKA_ALBUM_STATE';
let _albumSaveTimer = null;
function saveAlbumStateDebounced() { clearTimeout(_albumSaveTimer); _albumSaveTimer = setTimeout(saveAlbumState, 500); }
// Joriy holat sozlamalarini (rasmlarsiz) obyekt sifatida yig'adi
function buildAlbumStateData() {
  const st = window.AppState;
  if (!st.innerTemplate) return null;
  if (st.editPart === 'inner') st.cfgInner = snapshotControls();
  else st.cfgOuter = snapshotControls();
  if (st._tf) st._tf[st.editPart] = st.transforms;
  if (st._ct) st._ct[st.editPart] = st.customTexts;
  const classInfo = {};
  ['schoolName', 'schoolNumber', 'className', 'schoolYear', 'cityName', 'teacherName']
    .forEach(id => { const e = document.getElementById(id); if (e) classInfo[id] = e.value; });
  return {
    innerTemplateId: st.innerTemplate.id,
    outerTemplateId: st.outerTemplate ? st.outerTemplate.id : null,
    cfgInner: st.cfgInner, cfgOuter: st.cfgOuter,
    tf: st._tf || { inner: {}, outer: {} },
    ct: st._ct || { inner: [], outer: [] },
    ic: { inner: icSerialize((st._ic || {}).inner), outer: icSerialize((st._ic || {}).outer) },
    blz: st._blz || { inner: { bg: 0, cardbg: 1, photo: 2 }, outer: { bg: 0, cardbg: 1, photo: 2 } },
    retouchMap: st.retouchMap || {},
    groupRt: (st.groupImgs || []).map(g => (g && g.rt) || null),
    staffMeta: (st.staffImgs || []).map(s => s ? { name: s.name, role: s.role } : null),
    faces: st.faces || {},
    frameLocked: !!st.frameLocked,
    generateOuter: !!st.generateOuter,
    currentPreviewIdx: st.currentPreviewIdx || 0,
    classInfo,
  };
}
function saveAlbumState() {
  try {
    const data = buildAlbumStateData();
    if (!data) return;
    localStorage.setItem(ALBUM_STATE_KEY, JSON.stringify(data));
  } catch (e) { /* localStorage to'lgan/o'chirilgan bo'lishi mumkin */ }
}

// ── Rasmni dataURL ga / dataURL dan Image ga ──────────────
function imgToDataURL(img, q) {
  if (!img) return null;
  try {
    const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    if (!w || !h) return null;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const cx = c.getContext('2d');
    cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high';
    cx.drawImage(img, 0, 0);
    return c.toDataURL('image/jpeg', q || 0.95);
  } catch (e) { return null; }
}
function dataURLToImg(dataUrl) {
  return new Promise(res => {
    if (!dataUrl) return res(null);
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = dataUrl;
  });
}
function icSerialize(arr) {
  return (arr || []).map(o => ({ id: o.id, src: o.src, xf: o.xf, yf: o.yf, size: o.size, rot: o.rot, opacity: o.opacity, z: o.z }));
}
async function icRebuild(arr) {
  return Promise.all((arr || []).map(async o => ({ ...o, img: await dataURLToImg(o.src) })));
}
async function icRestoreAll(icObj) {
  const inner = await icRebuild((icObj || {}).inner);
  const outer = await icRebuild((icObj || {}).outer);
  window.AppState._ic = { inner, outer };
  window.AppState.icons = window.AppState.editPart === 'outer' ? outer : inner;
}

// ── LOYIHANI FAYLGA SAQLASH (barcha rasmlar + sozlamalar) ──
function exportProjectFile() {
  const st = window.AppState;
  if (!st.innerTemplate || !st.students || !st.students.length) {
    alert('Avval shablon tanlab, rasmlarni yuklang.');
    return;
  }
  const settings = buildAlbumStateData();
  const proj = {
    __vinyetka: 1,
    savedAt: new Date().toISOString(),
    settings,
    students: st.students.map(s => ({
      name: s.name,
      img: imgToDataURL(s.img),
      origImg: s.origImg ? imgToDataURL(s.origImg) : null,
      keepMoles: s.keepMoles || null,
    })),
    staff: (st.staffImgs || []).map(s => ({
      name: s.name, role: s.role, img: imgToDataURL(s.img), rt: s.rt || null,
    })),
    group: (st.groupImgs || []).map(g => ({ img: imgToDataURL(g.img), rt: g.rt || null })),
    bgInner: imgToDataURL(st.splitBgImgInner),
    bgOuter: imgToDataURL(st.splitBgImgOuter),
    teacher: imgToDataURL(st.teacherImg),
  };
  const cls = (settings.classInfo && (settings.classInfo.className || settings.classInfo.schoolName)) || 'albom';
  const fname = String(cls).replace(/[^\w\u0400-\u04FF -]/g, '').trim().replace(/\s+/g, '_') || 'albom';
  const blob = new Blob([JSON.stringify(proj)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fname + '.voy';
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

// ── LOYIHANI FAYLDAN OCHISH (hamma narsa tiklanadi) ────────
async function importProjectFile(file) {
  if (!file) return;
  let proj;
  try { proj = JSON.parse(await file.text()); }
  catch (e) { alert('Faylni o\'qib bo\'lmadi (buzilgan yoki noto\'g\'ri format).'); return; }
  if (!proj || !proj.__vinyetka || !proj.settings) { alert('Bu VinyetkaLab loyiha fayli emas.'); return; }

  const st = window.AppState;
  const S = proj.settings;
  const tpls = window.TEMPLATES || [];
  const innerTpl = tpls.find(t => t.id === S.innerTemplateId);
  if (!innerTpl) { alert('Loyiha shabloni topilmadi: ' + S.innerTemplateId); return; }
  const outerTpl = (S.outerTemplateId && tpls.find(t => t.id === S.outerTemplateId))
    || tpls.find(t => t.id === (innerTpl.pairedOuter || 'bitiruvchi-cover'))
    || tpls.find(t => t.type === 'vinyetka') || null;

  // Barcha rasmlarni yuklash
  const students = await Promise.all((proj.students || []).map(async s => {
    const img = await dataURLToImg(s.img);
    const origImg = s.origImg ? await dataURLToImg(s.origImg) : null;
    return { name: s.name || '', img, url: s.img || (img && img.src) || '', origImg, keepMoles: s.keepMoles || null };
  }));
  const staffImgs = await Promise.all((proj.staff || []).map(async s => ({
    img: await dataURLToImg(s.img), name: s.name || '', role: s.role || '', rt: s.rt || null,
  })));
  const groupImgs = await Promise.all((proj.group || []).map(async g => ({
    img: await dataURLToImg(g.img), rt: g.rt || null,
  })));
  const bgInner = await dataURLToImg(proj.bgInner);
  const bgOuter = await dataURLToImg(proj.bgOuter);
  const teacher = await dataURLToImg(proj.teacher);

  // AppState ni tiklash
  st.students = students.filter(s => s.img);
  st.staffImgs = staffImgs;
  st.groupImgs = groupImgs;
  st.splitBgImgInner = bgInner;
  st.splitBgImgOuter = bgOuter;
  st.teacherImg = teacher;
  st.retouchMap = S.retouchMap || {};
  st.faces = S.faces || {};
  st.frameLocked = !!S.frameLocked;
  st.generateOuter = S.generateOuter !== false;
  st._tf = S.tf || { inner: {}, outer: {} };
  st._ct = S.ct || { inner: [], outer: [] };
  st.customTexts = st._ct.inner || (st._ct.inner = []);
  st.activeTextId = null;
  st._ic = { inner: [], outer: [] }; st.icons = st._ic.inner; st.activeIconId = null;
  await icRestoreAll(S.ic);
  st.icons = st._ic.inner;
  st.cfgInner = S.cfgInner || null;
  st.cfgOuter = S.cfgOuter || null;
  st.innerTemplate = innerTpl;
  st.outerTemplate = outerTpl;
  st.selectedTemplate = innerTpl;
  st.editPart = 'inner';
  st.transforms = st._tf.inner || (st._tf.inner = {});
  st._blz = normalizeBlz(S.blz);
  st.blz = st._blz.inner;
  st.currentPreviewIdx = Math.min(S.currentPreviewIdx || 0, Math.max(0, st.students.length - 1));
  st.previewZoom = 1;

  // Class-info inputlarini to'ldirish
  if (S.classInfo) Object.entries(S.classInfo).forEach(([id, v]) => {
    const e = document.getElementById(id); if (e && v != null) e.value = v;
  });
  collectClassInfo();

  // UI: ro'yxat, thumbnaillar, kontrollar, shablon karta
  renderStudentsList();
  document.getElementById('toStep2').disabled = false;
  if (window._refreshBogchaThumbs) window._refreshBogchaThumbs();
  document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
  // Shablonga mos upload bloklari ko'rinishini sozlash
  const teacherWrap = document.getElementById('teacherUploadWrap');
  if (teacherWrap) teacherWrap.style.display = innerTpl.type === 'inner' ? 'block' : 'none';
  const splitWrap = document.getElementById('leftPhotoUploadWrap');
  if (splitWrap) splitWrap.style.display =
    (innerTpl.type === 'split-inner' || innerTpl.type === 'poster-inner') ? 'block' : 'none';
  const bogchaWrap = document.getElementById('bogchaUploadWrap');
  if (bogchaWrap) bogchaWrap.style.display = (innerTpl.id === 'bogcha-inner') ? 'block' : 'none';
  if (innerTpl.id === 'bogcha-inner' && splitWrap) splitWrap.style.display = 'none';
  if (typeof setClassInfoLabels === 'function') setClassInfoLabels(innerTpl.id === 'bogcha-inner' && !!window.BOGCHA_V9);
  restoreControls(st.cfgInner);
  if (window._refreshSplitBg) window._refreshSplitBg();
  if (typeof ctLoadSelected === 'function') ctLoadSelected();
  if (typeof icLoadSelected === 'function') icLoadSelected();

  // Tahrirlash oynasiga o'tish
  if (window._goTo) window._goTo(3);
  setTimeout(() => { if (typeof renderPreview === 'function') renderPreview(); }, 150);
}
function loadAlbumState() {
  try {
    const raw = localStorage.getItem(ALBUM_STATE_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    window.AppState._saved = d;
    if (d.classInfo) Object.entries(d.classInfo).forEach(([id, v]) => {
      const e = document.getElementById(id); if (e && v != null && !e.value) e.value = v;
    });
  } catch (e) { /* ignore */ }
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
  if (st._ct) st._ct[st.editPart] = st.customTexts;
  if (st._ic) st._ic[st.editPart] = st.icons;

  st.editPart = part;
  if (part === 'outer' && !st.outerTemplate) {
    const pairedId = st.innerTemplate && st.innerTemplate.pairedOuter;
    st.outerTemplate = (pairedId && (window.TEMPLATES || []).find(t => t.id === pairedId))
                    || (window.TEMPLATES || []).find(t => t.id === 'bitiruvchi-cover')
                    || (window.TEMPLATES || []).find(t => t.type === 'vinyetka') || null;
  }
  const tpl = part === 'inner' ? st.innerTemplate : st.outerTemplate;
  st.selectedTemplate = tpl;
  if (st._tf) { st._tf[part] = st._tf[part] || {}; st.transforms = st._tf[part]; }
  if (st._ct) { st._ct[part] = st._ct[part] || []; st.customTexts = st._ct[part]; }
  if (st._ic) { st._ic[part] = st._ic[part] || []; st.icons = st._ic[part]; }
  if (st._blz) { st._blz[part] = st._blz[part] || { bg: 0, cardbg: 1, photo: 2 }; st.blz = st._blz[part]; }
  st.activeTextId = null; st.activeIconId = null;
  if (typeof ctLoadSelected === 'function') ctLoadSelected();
  if (typeof icLoadSelected === 'function') icLoadSelected();

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

  // Fon rasm thumbnaili — joriy qism (ichki/ustki) rasmiga moslash
  if (window._refreshSplitBg) window._refreshSplitBg();
  if (typeof renderPreview === 'function') renderPreview();
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
    splitBgImg:    currentSplitBg(),
    staffImgs:     window.AppState.staffImgs || [],   // bog'cha: 4 xodim
    groupImgs:     window.AppState.groupImgs || [],   // bog'cha: guruh kollaji
    innerLeftText:  ($('bogInnerLeft')  || {}).value || '',   // bog'cha: chap yon yozuv
    innerRightText: ($('bogInnerRight') || {}).value || '',   // bog'cha: o'ng yon yozuv
    coverBottomColor: ($('bogBottomColor') || {}).value || '#173a5e',
    coverCollageTitle: ($('bogCollageTitle') || {}).value || '',
    innerLayoutMode: ($('innerLayoutMode') || {}).value || 'maktab',
    cornerMode:    !!window.BOGCHA_V9,   // (ixtiyoriy) chekka yozuvlar + bog'cha sarlavhasi
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
    customTexts:   window.AppState.customTexts,   // qo'shilgan matnlar
    icons:         window.AppState.icons,          // PNG ikonlar
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
    // Ustki muqova rasm kattaligi (zoom) — % → koeffitsient
    coverScale:     (parseInt(($('coverScale') || {}).value) || 100) / 100,
    coverOffsetY:   (parseInt(($('coverOffsetY') || {}).value) || 0) / 100,
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
  if (window.AppState._ct) window.AppState._ct[window.AppState.editPart] = window.AppState.customTexts;
  if (window.AppState._ic) window.AppState._ic[window.AppState.editPart] = window.AppState.icons;

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
    window.AppState.customTexts = (window.AppState._ct && window.AppState._ct[p.part]) || [];
    window.AppState.icons = (window.AppState._ic && window.AppState._ic[p.part]) || [];
    if (p.snap) restoreControls(p.snap); else seedTemplateDefaults(p.tpl);
    const cfg = getEditorConfig();
    // Har qism uchun MOS fon rasmi (ichki/ustki alohida)
    const partBg = (p.part === 'outer') ? window.AppState.splitBgImgOuter : window.AppState.splitBgImgInner;

    const partBlz = (window.AppState._blz && window.AppState._blz[p.part]) || null;

    await Generator.generate(
      students, p.tpl,
      { ...cfg, ...window.AppState.classInfo, teacherImg: window.AppState.teacherImg, splitBgImg: partBg, blz: partBlz },
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

  // ── Loyihani faylga saqlash / fayldan ochish ──
  const openBtn = document.getElementById('openProjectBtn');
  const projInput = document.getElementById('projectFileInput');
  if (openBtn && projInput) {
    openBtn.addEventListener('click', () => projInput.click());
    projInput.addEventListener('change', async () => {
      const f = projInput.files && projInput.files[0];
      projInput.value = '';
      if (!f) return;
      openBtn.disabled = true; const o = openBtn.textContent; openBtn.textContent = '⏳ Ochilmoqda...';
      try { await importProjectFile(f); }
      catch (e) { alert('Loyihani ochishda xato: ' + (e.message || e)); }
      openBtn.textContent = o; openBtn.disabled = false;
    });
  }
  const saveBtns = [document.getElementById('saveProjectBtn'), document.getElementById('saveProjectBtn2')];
  saveBtns.forEach(b => { if (b) b.addEventListener('click', () => { try { exportProjectFile(); } catch (e) { alert('Saqlashda xato: ' + (e.message || e)); } }); });

  document.getElementById('restartBtn').addEventListener('click', () => {
    window.AppState.students          = [];
    window.AppState.selectedTemplate  = null;
    window.AppState.innerTemplate     = null;
    window.AppState.editPart          = 'inner';
    window.AppState.teacherImg        = null;
    window.AppState.leftImg           = null;
    window.AppState.splitBgImg        = null;
    window.AppState.splitBgImgInner   = null;
    window.AppState.splitBgImgOuter   = null;
    window.AppState.transforms        = {};
    window.AppState._tf               = { inner: window.AppState.transforms, outer: {} };
    window.AppState.customTexts       = [];
    window.AppState._ct               = { inner: window.AppState.customTexts, outer: [] };
    window.AppState.activeTextId      = null;
    window.AppState.icons             = [];
    window.AppState._ic               = { inner: window.AppState.icons, outer: [] };
    window.AppState.activeIconId      = null;
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
