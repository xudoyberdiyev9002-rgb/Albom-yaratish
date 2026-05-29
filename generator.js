/**
 * generator.js
 * Barcha o'quvchilar uchun Canvas rasm generatsiya qiladi va ZIP sifatida yuklab beradi.
 *
 * ODDIY shablonlar (vinyetka, id-card):
 *   Har o'quvchi uchun alohida canvas → alohida PNG
 *
 * ICHKI shablon (album-inner):
 *   Har o'quvchi uchun alohida canvas chiziladi, lekin
 *   cfg.allStudents = barcha o'quvchilar,
 *   cfg.ownerIndex  = shu iteratsiyaning indeksi  (egasi 1-o'ringa chiqadi)
 *   cfg.teacherImg  = sinf rahbari rasmi
 */

window.Generator = {
  canvases: [],   // [{ canvas, name, index }]

  // ────────────────────────────────────────────────────────────
  // Asosiy generatsiya
  // ────────────────────────────────────────────────────────────
  async generate(students, template, config, onProgress, onDone) {
    this.canvases = [];
    const total     = students.length;
    const isInner   = template.type === 'inner';

    for (let i = 0; i < total; i++) {
      const student = students[i];
      let canvas;

      if (isInner) {
        // Ichki shablon: barcha o'quvchilar + shu o'quvchi 1-o'rinda
        canvas = await this._renderInner(students, i, template, config);
      } else {
        // Oddiy shablon: faqat shu o'quvchi
        canvas = await this._renderOne(student, template, config);
      }

      this.canvases.push({ canvas, name: student.name, index: i });
      if (onProgress) onProgress(i + 1, total);
      await sleep(10);
    }

    if (onDone) onDone(this.canvases);
  },

  // ────────────────────────────────────────────────────────────
  // Oddiy shablon uchun render (vinyetka, id-card)
  // ────────────────────────────────────────────────────────────
  async _renderOne(student, template, config) {
    const quality = parseInt(config.exportQuality) || 2;
    const w = parseInt(config.canvasW) || template.defaultW;
    const h = parseInt(config.canvasH) || template.defaultH;

    const canvas = document.createElement('canvas');
    canvas.width  = w * quality;
    canvas.height = h * quality;
    const ctx = canvas.getContext('2d');
    ctx.scale(quality, quality);

    template.draw(ctx, window.AppState?.classInfo || {}, {
      ...config,
      w, h,
      photo:         student.img,
      studentName:   student.name,
      nameFontSize:  parseInt(config.nameFontSize)  || 22,
      schoolFontSize:parseInt(config.schoolFontSize)|| 13,
      nameColor:     config.nameColor   || template.nameColor,
      schoolColor:   config.schoolColor || template.schoolColor,
      bgColor1:      config.bgColor1    || template.bgColor1,
      bgColor2:      config.bgColor2    || template.bgColor2,
      accentColor:   config.accentColor || template.accentColor,
      photoScale:    parseInt(config.photoScale)    || 100,
      photoOffsetY:  parseInt(config.photoOffsetY)  || 0,
      photoShape:    config.photoShape  || 'circle',
    });

    return canvas;
  },

  // ────────────────────────────────────────────────────────────
  // Ichki (album-inner) shablon uchun render
  // ownerIndex = joriy o'quvchi indeksi (u 1-o'ringa chiqadi)
  // ────────────────────────────────────────────────────────────
  async _renderInner(students, ownerIndex, template, config) {
    const quality = parseInt(config.exportQuality) || 2;
    const w = parseInt(config.canvasW) || template.defaultW;
    const h = parseInt(config.canvasH) || template.defaultH;

    const canvas = document.createElement('canvas');
    canvas.width  = w * quality;
    canvas.height = h * quality;
    const ctx = canvas.getContext('2d');
    ctx.scale(quality, quality);

    template.draw(ctx, window.AppState?.classInfo || {}, {
      ...config,
      w, h,
      // Ichki shablon o'ziga kerakli maydonlar:
      allStudents:   students,           // barcha o'quvchilar
      ownerIndex:    ownerIndex,         // egasi indeksi → 1-o'ringa
      teacherImg:    config.teacherImg || window.AppState?.teacherImg || null,
      nameFontSize:  parseInt(config.nameFontSize)   || 14,
      schoolFontSize:parseInt(config.schoolFontSize) || 13,
      nameColor:     config.nameColor   || template.nameColor,
      schoolColor:   config.schoolColor || template.schoolColor,
      bgColor1:      config.bgColor1    || template.bgColor1,
      bgColor2:      config.bgColor2    || template.bgColor2,
      accentColor:   config.accentColor || template.accentColor,
      photoScale:    parseInt(config.photoScale) || 100,
      photoShape:    config.photoShape  || 'rounded',
    });

    return canvas;
  },

  // ────────────────────────────────────────────────────────────
  // ZIP yuklab berish
  // ────────────────────────────────────────────────────────────
  async downloadZip(canvases, onProgress) {
    const zip    = new JSZip();
    const folder = zip.folder('vinyetkalar');
    const total  = canvases.length;

    for (let i = 0; i < total; i++) {
      const item     = canvases[i];
      const safeName = sanitizeFilename(item.name);
      const num      = String(item.index + 1).padStart(2, '0');
      const filename = `${num}_${safeName}.png`;

      const blob = await canvasToBlob(item.canvas);
      folder.file(filename, blob);

      if (onProgress) onProgress(i + 1, total);
      await sleep(5);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' }, meta => {
      if (onProgress) onProgress(Math.round(meta.percent / 100 * total), total);
    });

    triggerDownload(zipBlob, 'vinyetkalar.zip');
  },

  getPreviewURL(canvas) {
    return canvas.toDataURL('image/png');
  }
};

// ===== UTILS =====

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function canvasToBlob(canvas) {
  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), 'image/png', 1.0);
  });
}

function sanitizeFilename(name) {
  return (name || 'student')
    .trim()
    .replace(/[^a-zA-Zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\u00C0-\u024F\u0400-\u04FF\s_\-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 60);
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
