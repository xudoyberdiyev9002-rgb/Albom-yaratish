/**
 * templates.js
 * Har bir shablon – Canvas'da chizish uchun konfiguratsiya + draw() funksiyasi
 */

window.TEMPLATES = [
  // ============================================================
  // 1. KLASSIK VINYETKA – Ko'k gradient
  // ============================================================
  {
    id: 'classic-blue',
    type: 'vinyetka',
    name: 'Klassik Ko\'k',
    desc: 'An\'anaviy maktab vinyetkasi',
    emoji: '🎓',
    defaultW: 400,
    defaultH: 560,
    bgColor1: '#1a237e',
    bgColor2: '#283593',
    accentColor: '#5c6bc0',
    nameColor: '#ffffff',
    schoolColor: '#c5cae9',
    draw(ctx, data, cfg) {
      const { w, h, photo, studentName, schoolName, schoolNumber,
              className, schoolYear, cityName, teacherName,
              nameFontSize, schoolFontSize, nameColor, schoolColor,
              bgColor1, bgColor2, accentColor,
              photoScale, photoOffsetY, photoShape } = cfg;

      // --- BG gradient ---
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, bgColor1);
      bg.addColorStop(1, bgColor2);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // --- top dekor chiziq ---
      ctx.fillStyle = accentColor;
      ctx.fillRect(0, 0, w, 6);

      // --- uchburchak dekor top-right ---
      ctx.beginPath();
      ctx.moveTo(w, 0); ctx.lineTo(w - 100, 0); ctx.lineTo(w, 120);
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fill();

      // --- bottom dekor ---
      ctx.beginPath();
      ctx.moveTo(0, h); ctx.lineTo(120, h); ctx.lineTo(0, h - 120);
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fill();

      // --- PHOTO ---
      const photoSize = Math.round(Math.min(w, h) * 0.38 * (photoScale / 100));
      const px = w / 2;
      const py = h * 0.32 + photoOffsetY;
      drawPhoto(ctx, photo, px, py, photoSize, photoShape, accentColor);

      // --- ism ---
      ctx.fillStyle = nameColor;
      ctx.font = `700 ${nameFontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      wrapText(ctx, studentName, px, py + photoSize / 2 + nameFontSize + 14, w - 40, nameFontSize + 8);

      // --- ajratgich ---
      const lineY = py + photoSize / 2 + nameFontSize * 2.8 + 14;
      ctx.fillStyle = accentColor;
      ctx.fillRect(w / 2 - 40, lineY, 80, 2);

      // --- maktab ma'lumotlari ---
      ctx.fillStyle = schoolColor;
      ctx.font = `600 ${schoolFontSize}px Inter, sans-serif`;
      let infoY = lineY + schoolFontSize + 14;
      const infos = buildInfoLines(data, cfg);
      infos.forEach(line => {
        ctx.fillText(line, px, infoY);
        infoY += schoolFontSize + 8;
      });

      // --- bottom logo yozuv ---
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font = `500 10px Inter, sans-serif`;
      ctx.fillText('VinyetkaLab', px, h - 14);
    }
  },

  // ============================================================
  // 2. PASTEL VINYETKA – Binafsha
  // ============================================================
  {
    id: 'pastel-purple',
    type: 'vinyetka',
    name: 'Pastel Binafsha',
    desc: 'Yumshoq rang, zamonaviy',
    emoji: '💜',
    defaultW: 400,
    defaultH: 560,
    bgColor1: '#f3e8ff',
    bgColor2: '#ede9fe',
    accentColor: '#7c3aed',
    nameColor: '#1e1b4b',
    schoolColor: '#4c1d95',
    draw(ctx, data, cfg) {
      const { w, h, photo, studentName,
              nameFontSize, schoolFontSize, nameColor, schoolColor,
              bgColor1, bgColor2, accentColor,
              photoScale, photoOffsetY, photoShape } = cfg;

      // BG
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, bgColor1);
      bg.addColorStop(1, bgColor2);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Dekor doiralar
      ctx.beginPath(); ctx.arc(w - 30, 30, 80, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(124,58,237,0.08)'; ctx.fill();
      ctx.beginPath(); ctx.arc(30, h - 30, 60, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(124,58,237,0.06)'; ctx.fill();

      // Top accent bar
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.roundRect(0, 0, w, 8, [0, 0, 4, 4]);
      ctx.fill();

      // Photo
      const photoSize = Math.round(Math.min(w, h) * 0.38 * (photoScale / 100));
      const px = w / 2, py = h * 0.32 + photoOffsetY;
      drawPhoto(ctx, photo, px, py, photoSize, photoShape, accentColor);

      // Name
      ctx.fillStyle = nameColor;
      ctx.font = `800 ${nameFontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      wrapText(ctx, studentName, px, py + photoSize / 2 + nameFontSize + 14, w - 40, nameFontSize + 8);

      // Divider
      const lineY = py + photoSize / 2 + nameFontSize * 2.8 + 14;
      const grad = ctx.createLinearGradient(w/2 - 60, 0, w/2 + 60, 0);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, accentColor);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(w / 2 - 60, lineY, 120, 2);

      // Info
      ctx.fillStyle = schoolColor;
      ctx.font = `500 ${schoolFontSize}px Inter, sans-serif`;
      let infoY = lineY + schoolFontSize + 14;
      buildInfoLines(data, cfg).forEach(line => {
        ctx.fillText(line, px, infoY);
        infoY += schoolFontSize + 8;
      });

      ctx.fillStyle = 'rgba(124,58,237,0.3)';
      ctx.font = `500 10px Inter, sans-serif`;
      ctx.fillText('VinyetkaLab', px, h - 14);
    }
  },

  // ============================================================
  // 3. ZAMONAVIY MINIMAL – Oq fon
  // ============================================================
  {
    id: 'modern-white',
    type: 'vinyetka',
    name: 'Zamonaviy Oq',
    desc: 'Minimal, professional',
    emoji: '⬜',
    defaultW: 400,
    defaultH: 560,
    bgColor1: '#ffffff',
    bgColor2: '#f8faff',
    accentColor: '#6366f1',
    nameColor: '#0f0f1a',
    schoolColor: '#4040a0',
    draw(ctx, data, cfg) {
      const { w, h, photo, studentName,
              nameFontSize, schoolFontSize, nameColor, schoolColor,
              bgColor1, bgColor2, accentColor,
              photoScale, photoOffsetY, photoShape } = cfg;

      ctx.fillStyle = bgColor1; ctx.fillRect(0, 0, w, h);

      // Card shadow effect
      ctx.shadowColor = 'rgba(99,102,241,0.1)';
      ctx.shadowBlur = 40;
      ctx.fillStyle = bgColor2;
      ctx.beginPath(); ctx.roundRect(16, 16, w - 32, h - 32, 16); ctx.fill();
      ctx.shadowBlur = 0;

      // Left accent stripe
      ctx.fillStyle = accentColor;
      ctx.beginPath(); ctx.roundRect(16, 16, 5, h - 32, [4, 0, 0, 4]); ctx.fill();

      // Top pattern dots
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 3; j++) {
          ctx.beginPath(); ctx.arc(w - 30 - i * 14, 30 + j * 14, 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(99,102,241,0.15)'; ctx.fill();
        }
      }

      // Photo
      const photoSize = Math.round(Math.min(w, h) * 0.38 * (photoScale / 100));
      const px = w / 2, py = h * 0.30 + photoOffsetY;
      drawPhoto(ctx, photo, px, py, photoSize, photoShape, accentColor);

      // Name
      ctx.fillStyle = nameColor;
      ctx.font = `700 ${nameFontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      wrapText(ctx, studentName, px, py + photoSize / 2 + nameFontSize + 14, w - 60, nameFontSize + 8);

      const lineY = py + photoSize / 2 + nameFontSize * 2.8 + 14;
      ctx.fillStyle = 'rgba(99,102,241,0.2)';
      ctx.fillRect(w / 2 - 50, lineY, 100, 1);

      ctx.fillStyle = schoolColor;
      ctx.font = `${schoolFontSize}px Inter, sans-serif`;
      let infoY = lineY + schoolFontSize + 12;
      buildInfoLines(data, cfg).forEach(line => {
        ctx.fillText(line, px, infoY);
        infoY += schoolFontSize + 7;
      });
    }
  },

  // ============================================================
  // 4. YASHIl – Tabiat
  // ============================================================
  {
    id: 'green-nature',
    type: 'vinyetka',
    name: 'Yashil Tabiat',
    desc: 'Yashil gradient',
    emoji: '🌿',
    defaultW: 400,
    defaultH: 560,
    bgColor1: '#064e3b',
    bgColor2: '#065f46',
    accentColor: '#10b981',
    nameColor: '#ecfdf5',
    schoolColor: '#a7f3d0',
    draw(ctx, data, cfg) {
      const { w, h, photo, studentName,
              nameFontSize, schoolFontSize, nameColor, schoolColor,
              bgColor1, bgColor2, accentColor,
              photoScale, photoOffsetY, photoShape } = cfg;

      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, bgColor1); bg.addColorStop(1, bgColor2);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

      // Wave dekor
      ctx.beginPath();
      ctx.moveTo(0, h * 0.65);
      ctx.bezierCurveTo(w * 0.25, h * 0.58, w * 0.75, h * 0.72, w, h * 0.65);
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      ctx.fillStyle = 'rgba(16,185,129,0.12)'; ctx.fill();

      // Accent top
      ctx.fillStyle = accentColor; ctx.fillRect(0, 0, w, 5);

      // Dekor circle
      ctx.beginPath(); ctx.arc(w - 40, h * 0.15, 70, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fill();

      const photoSize = Math.round(Math.min(w, h) * 0.38 * (photoScale / 100));
      const px = w / 2, py = h * 0.30 + photoOffsetY;
      drawPhoto(ctx, photo, px, py, photoSize, photoShape, accentColor);

      ctx.fillStyle = nameColor;
      ctx.font = `700 ${nameFontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      wrapText(ctx, studentName, px, py + photoSize / 2 + nameFontSize + 14, w - 40, nameFontSize + 8);

      const lineY = py + photoSize / 2 + nameFontSize * 2.8 + 14;
      ctx.fillStyle = accentColor;
      ctx.fillRect(w / 2 - 40, lineY, 80, 2);

      ctx.fillStyle = schoolColor;
      ctx.font = `${schoolFontSize}px Inter, sans-serif`;
      let infoY = lineY + schoolFontSize + 14;
      buildInfoLines(data, cfg).forEach(line => {
        ctx.fillText(line, px, infoY); infoY += schoolFontSize + 8;
      });

      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = `500 10px Inter, sans-serif`;
      ctx.fillText('VinyetkaLab', px, h - 14);
    }
  },

  // ============================================================
  // 5. ALBOM ICHKI SAHIFA – 2 ustun
  // ============================================================
  {
    id: 'album-inner',
    type: 'inner',
    name: 'Albom Sahifasi',
    desc: 'Katta format, 2 qator',
    emoji: '📖',
    defaultW: 400,
    defaultH: 560,
    bgColor1: '#fafafa',
    bgColor2: '#f0f4ff',
    accentColor: '#4f46e5',
    nameColor: '#1a1a2e',
    schoolColor: '#3030a0',
    draw(ctx, data, cfg) {
      const { w, h, photo, studentName,
              nameFontSize, schoolFontSize, nameColor, schoolColor,
              bgColor1, bgColor2, accentColor,
              photoScale, photoOffsetY, photoShape } = cfg;

      ctx.fillStyle = bgColor1; ctx.fillRect(0, 0, w, h);

      // Dekor header area
      const headerH = h * 0.18;
      const hg = ctx.createLinearGradient(0, 0, w, headerH);
      hg.addColorStop(0, accentColor);
      hg.addColorStop(1, bgColor2);
      ctx.fillStyle = hg;
      ctx.fillRect(0, 0, w, headerH);

      // Header text (school)
      ctx.fillStyle = '#fff';
      ctx.font = `700 ${schoolFontSize + 2}px Inter, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(data.schoolNumber || 'Maktab', w / 2, headerH * 0.3);
      ctx.font = `500 ${schoolFontSize}px Inter, sans-serif`;
      ctx.fillText((data.className || '') + '  ' + (data.schoolYear || ''), w / 2, headerH * 0.65);

      // Photo — markazda yuqorida
      const photoSize = Math.round(Math.min(w, h) * 0.36 * (photoScale / 100));
      const px = w / 2, py = headerH + photoSize / 2 + 20 + photoOffsetY;
      drawPhoto(ctx, photo, px, py, photoSize, photoShape, accentColor);

      // Student name
      ctx.fillStyle = nameColor;
      ctx.font = `700 ${nameFontSize}px Inter, sans-serif`;
      wrapText(ctx, studentName, px, py + photoSize / 2 + nameFontSize + 10, w - 40, nameFontSize + 6);

      // Bottom decorative band
      ctx.fillStyle = accentColor;
      ctx.fillRect(0, h - 5, w, 5);

      // City name at bottom
      ctx.fillStyle = schoolColor;
      ctx.font = `500 ${schoolFontSize - 1}px Inter, sans-serif`;
      ctx.fillText(data.cityName || '', w / 2, h - 20);
    }
  },

  // ============================================================
  // 6. QIZIL – Bayram vinyetkasi
  // ============================================================
  {
    id: 'festive-red',
    type: 'vinyetka',
    name: 'Bayram Qizil',
    desc: 'Tantanali dizayn',
    emoji: '🔴',
    defaultW: 400,
    defaultH: 560,
    bgColor1: '#7f1d1d',
    bgColor2: '#991b1b',
    accentColor: '#f87171',
    nameColor: '#fff7ed',
    schoolColor: '#fecaca',
    draw(ctx, data, cfg) {
      const { w, h, photo, studentName,
              nameFontSize, schoolFontSize, nameColor, schoolColor,
              bgColor1, bgColor2, accentColor,
              photoScale, photoOffsetY, photoShape } = cfg;

      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h));
      bg.addColorStop(0, bgColor2); bg.addColorStop(1, bgColor1);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

      // Star pattern
      for (let i = 0; i < 12; i++) {
        const x = Math.random() * w, y = Math.random() * h * 0.5;
        ctx.beginPath(); ctx.arc(x, y, Math.random() * 2 + 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fill();
      }

      // Gold accent top
      const goldGrad = ctx.createLinearGradient(0, 0, w, 0);
      goldGrad.addColorStop(0, '#d97706'); goldGrad.addColorStop(0.5, '#f59e0b'); goldGrad.addColorStop(1, '#d97706');
      ctx.fillStyle = goldGrad; ctx.fillRect(0, 0, w, 6);

      // Dekor circles
      ctx.beginPath(); ctx.arc(w / 2, -20, 130, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fill();

      const photoSize = Math.round(Math.min(w, h) * 0.36 * (photoScale / 100));
      const px = w / 2, py = h * 0.31 + photoOffsetY;
      drawPhoto(ctx, photo, px, py, photoSize, photoShape, '#f59e0b');

      ctx.fillStyle = nameColor;
      ctx.font = `700 ${nameFontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      wrapText(ctx, studentName, px, py + photoSize / 2 + nameFontSize + 14, w - 40, nameFontSize + 8);

      const lineY = py + photoSize / 2 + nameFontSize * 2.8 + 14;
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(w / 2 - 40, lineY, 80, 2);

      ctx.fillStyle = schoolColor;
      ctx.font = `${schoolFontSize}px Inter, sans-serif`;
      let infoY = lineY + schoolFontSize + 14;
      buildInfoLines(data, cfg).forEach(line => {
        ctx.fillText(line, px, infoY); infoY += schoolFontSize + 8;
      });

      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = `500 10px Inter, sans-serif`;
      ctx.fillText('VinyetkaLab', px, h - 14);
    }
  },

  // ============================================================
  // 7. ID-KARTA – Gorizontal
  // ============================================================
  {
    id: 'id-card',
    type: 'id-card',
    name: 'ID Karta',
    desc: 'Gorizontal, plastik karta',
    emoji: '🪪',
    defaultW: 560,
    defaultH: 360,
    bgColor1: '#1e1b4b',
    bgColor2: '#312e81',
    accentColor: '#818cf8',
    nameColor: '#ffffff',
    schoolColor: '#c7d2fe',
    draw(ctx, data, cfg) {
      const { w, h, photo, studentName,
              nameFontSize, schoolFontSize, nameColor, schoolColor,
              bgColor1, bgColor2, accentColor,
              photoScale, photoOffsetY, photoShape } = cfg;

      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, bgColor1); bg.addColorStop(1, bgColor2);
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.roundRect(0, 0, w, h, 20); ctx.fill();

      // Dekor wave
      ctx.beginPath();
      ctx.moveTo(0, h * 0.5);
      ctx.bezierCurveTo(w * 0.3, h * 0.3, w * 0.7, h * 0.7, w, h * 0.5);
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fill();

      // Left accent
      ctx.fillStyle = accentColor;
      ctx.beginPath(); ctx.roundRect(0, 0, 6, h, [20, 0, 0, 20]); ctx.fill();

      // Top accent
      ctx.fillStyle = accentColor; ctx.fillRect(6, 0, w - 6, 4);

      // Photo – left side
      const photoSize = Math.round(h * 0.55 * (photoScale / 100));
      const px = 30 + photoSize / 2, py = h / 2 + photoOffsetY;
      drawPhoto(ctx, photo, px, py, photoSize, photoShape, accentColor);

      // Right side text
      const textX = px + photoSize / 2 + 24;
      const maxTextW = w - textX - 20;

      ctx.fillStyle = accentColor;
      ctx.font = `600 ${schoolFontSize - 1}px Inter, sans-serif`;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(data.schoolNumber || 'Maktab', textX, h * 0.22);

      ctx.fillStyle = nameColor;
      ctx.font = `800 ${nameFontSize + 2}px Inter, sans-serif`;
      wrapTextLeft(ctx, studentName, textX, h * 0.40, maxTextW, nameFontSize + 8);

      ctx.fillStyle = schoolColor;
      ctx.font = `500 ${schoolFontSize}px Inter, sans-serif`;
      let iy = h * 0.58;
      const lines = [
        data.className ? `${data.className} sinf` : '',
        data.schoolYear || '',
        data.cityName || ''
      ].filter(Boolean);
      lines.forEach(l => { ctx.fillText(l, textX, iy); iy += schoolFontSize + 8; });

      // Bottom barcode-like pattern
      for (let i = 0; i < 20; i++) {
        const bh = 8 + Math.random() * 10;
        ctx.fillStyle = `rgba(129,140,248,${0.1 + Math.random() * 0.15})`;
        ctx.fillRect(textX + i * 9, h - 30, 5, bh);
      }
    }
  }
];

// ============================================================
// HELPERS
// ============================================================

/**
 * Rasm chizish – shape bo'yicha clip qiladi
 * photoSize = diametr (doira uchun)
 */
function drawPhoto(ctx, img, cx, cy, size, shape, borderColor) {
  const half = size / 2;
  ctx.save();

  // Soya
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 4;

  // Border
  ctx.beginPath();
  clipShape(ctx, cx, cy, half + 4, shape);
  ctx.fillStyle = borderColor || '#6366f1';
  ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

  // Clip
  ctx.beginPath();
  clipShape(ctx, cx, cy, half, shape);
  ctx.clip();

  if (img && img.complete && img.naturalWidth > 0) {
    // Cover-fit
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(size / iw, size / ih);
    const dw = iw * scale, dh = ih * scale;
    ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  } else {
    // Placeholder
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = `${half * 0.7}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('👤', cx, cy);
  }
  ctx.restore();
}

function clipShape(ctx, cx, cy, r, shape) {
  switch (shape) {
    case 'circle':
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      break;
    case 'rounded':
      ctx.roundRect(cx - r, cy - r * 1.2, r * 2, r * 2.4, r * 0.25);
      break;
    case 'rect':
      ctx.rect(cx - r, cy - r * 1.2, r * 2, r * 2.4);
      break;
    case 'oval':
      ctx.ellipse(cx, cy, r, r * 1.25, 0, 0, Math.PI * 2);
      break;
    default:
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
  }
}

function wrapText(ctx, text, x, y, maxW, lineH) {
  if (!text) return;
  const words = text.split(' ');
  let line = '';
  let curY = y;
  words.forEach((word, i) => {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxW && i > 0) {
      ctx.fillText(line.trim(), x, curY);
      line = word + ' ';
      curY += lineH;
    } else { line = test; }
  });
  ctx.fillText(line.trim(), x, curY);
}

function wrapTextLeft(ctx, text, x, y, maxW, lineH) {
  if (!text) return;
  const words = text.split(' ');
  let line = '';
  let curY = y;
  words.forEach((word, i) => {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxW && i > 0) {
      ctx.fillText(line.trim(), x, curY);
      line = word + ' ';
      curY += lineH;
    } else { line = test; }
  });
  ctx.fillText(line.trim(), x, curY);
}

function buildInfoLines(data, cfg) {
  const lines = [];
  if (data.schoolNumber) lines.push(data.schoolNumber);
  if (data.className && data.schoolYear) lines.push(`${data.className} sinf • ${data.schoolYear}`);
  else if (data.className) lines.push(`${data.className} sinf`);
  else if (data.schoolYear) lines.push(data.schoolYear);
  if (data.cityName) lines.push(data.cityName);
  if (data.teacherName) lines.push(`Sin. rah.: ${data.teacherName}`);
  return lines;
}

// Eksport uchun
window.drawPhoto = drawPhoto;
window.buildInfoLines = buildInfoLines;
window.wrapText = wrapText;
