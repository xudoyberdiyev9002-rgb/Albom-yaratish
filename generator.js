/**
 * generator.js
 * Barcha o'quvchilar uchun Canvas rasm generatsiya qiladi va ZIP sifatida yuklab beradi.
 * Har bir o'quvchi alohida PNG. ZIP ichida tartib: 01_Ism_Familya.png
 */

window.Generator = {
  students: [],      // { name, img }
  template: null,
  config: {},
  canvases: [],      // generatsiya qilingan canvaslar

  /**
   * Asosiy generatsiya funksiyasi
   * onProgress(current, total) callback
   * onDone(blobs) callback
   */
  async generate(students, template, config, onProgress, onDone) {
    this.canvases = [];
    const total = students.length;

    for (let i = 0; i < total; i++) {
      const student = students[i];
      const canvas = await this._renderOne(student, template, config);
      this.canvases.push({ canvas, name: student.name, index: i });

      if (onProgress) onProgress(i + 1, total);

      // UI freeze oldini olish uchun micro-break
      await sleep(10);
    }

    if (onDone) onDone(this.canvases);
  },

  /** Bitta o'quvchi uchun canvas render */
  async _renderOne(student, template, config) {
    const quality = parseInt(config.exportQuality) || 2;
    const w = parseInt(config.canvasW) || template.defaultW;
    const h = parseInt(config.canvasH) || template.defaultH;

    const canvas = document.createElement('canvas');
    canvas.width = w * quality;
    canvas.height = h * quality;
    const ctx = canvas.getContext('2d');
    ctx.scale(quality, quality);

    const cfg = {
      ...config,
      w, h,
      photo: student.img,
      studentName: student.name,
      nameFontSize: parseInt(config.nameFontSize) || 22,
      schoolFontSize: parseInt(config.schoolFontSize) || 13,
      nameColor: config.nameColor || template.nameColor,
      schoolColor: config.schoolColor || template.schoolColor,
      bgColor1: config.bgColor1 || template.bgColor1,
      bgColor2: config.bgColor2 || template.bgColor2,
      accentColor: config.accentColor || template.accentColor,
      photoScale: parseInt(config.photoScale) || 100,
      photoOffsetY: parseInt(config.photoOffsetY) || 0,
      photoShape: config.photoShape || 'circle',
    };

    template.draw(ctx, window.AppState?.classInfo || {}, cfg);

    return canvas;
  },

  /** Barcha canvaslarni ZIP qilib yuklab beradi */
  async downloadZip(canvases, onProgress) {
    const zip = new JSZip();
    const folder = zip.folder('vinyetkalar');
    const total = canvases.length;

    for (let i = 0; i < total; i++) {
      const item = canvases[i];
      const safeName = sanitizeFilename(item.name);
      const num = String(item.index + 1).padStart(2, '0');
      const filename = `${num}_${safeName}.png`;

      const blob = await canvasToBlob(item.canvas);
      folder.file(filename, blob);

      if (onProgress) onProgress(i + 1, total);
      await sleep(5);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' }, (meta) => {
      if (onProgress) onProgress(Math.round(meta.percent / 100 * total), total);
    });

    triggerDownload(zipBlob, 'vinyetkalar.zip');
  },

  /** Bitta canvas preview uchun URL qaytaradi */
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
