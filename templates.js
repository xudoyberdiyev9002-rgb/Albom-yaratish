/**
 * templates.js
 * Har bir shablon – Canvas'da chizish uchun konfiguratsiya + draw() funksiyasi
 */

window.TEMPLATES = [
  // ============================================================
  // 0. BITIRUVCHI ALBOM MUQOVASI (qora fon, vatermark, elegant)
  //
  // Tashqi muqova: Yuqorida "BITIRUVCHI ALBOM",
  //  to'rtburchak rasm, ortida vatermark (yil/raqam),
  //  past qismda yil + tuman + maktab + sinf
  // ============================================================
  {
    id: 'bitiruvchi-cover',
    type: 'vinyetka',
    name: 'Bitiruvchi Albom',
    desc: 'Qora muqova, vatermark, elegant',
    emoji: '🎓',
    defaultW: 600,
    defaultH: 850,
    bgColor1: '#000000',
    bgColor2: '#0a0a0a',
    accentColor: '#ffffff',
    nameColor: '#ffffff',
    schoolColor: '#e8e8e8',

    draw(ctx, data, cfg) {
      const {
        w, h, photo,
        nameColor   = '#ffffff',
        schoolColor = '#e8e8e8',
        bgColor1    = '#000000',
        bgColor2    = '#0a0a0a',
        accentColor = '#ffffff',
        photoScale  = 100,
        photoOffsetY = 0,
      } = cfg;

      // ── 1. QORA FON (gradient) ─────────────────────────────
      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
      bg.addColorStop(0, bgColor2);
      bg.addColorStop(1, bgColor1);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // ── 2. VATERMARK (orqa fonda yirik raqamlar/№) ─────────
      // Maktab raqamidan vatermark hosil qilamiz: "№65" yoki kerak bo'lsa yil
      const wmText = (data.schoolNumber || '№65')
        .replace(/maktab|школа|school|umumiy.*/gi, '')
        .trim() || '№';

      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.045)';
      // 3 ta belgi (M, raqam1, raqam2) ni o'rtada ulkan qilib chizamiz
      const wmFontSize = Math.round(h * 0.55);
      ctx.font = `200 ${wmFontSize}px 'Times New Roman', Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Markazda – bitta yirik harf/belgi
      const chars = wmText.split('');
      // Agar 1 ta bo'lsa markazda, 2-3 ta bo'lsa yon-yonida
      if (chars.length === 1) {
        ctx.fillText(chars[0], w / 2, h / 2);
      } else {
        // Birinchisi chap, oxirgisi o'ng, o'rtadagilar markazda
        const slots = chars.length;
        for (let i = 0; i < slots; i++) {
          const x = w * (0.18 + (i / Math.max(slots - 1, 1)) * 0.64);
          // Vertikal joy ham ozgina farq qilsin (parallax effekti)
          const y = h / 2 + (i % 2 === 0 ? -h * 0.08 : h * 0.08);
          ctx.fillText(chars[i], x, y);
        }
      }
      ctx.restore();

      // ── 3. SARLAVHA "BITIRUVCHI ALBOM" ─────────────────────
      const titleY = Math.round(h * 0.085);
      ctx.fillStyle = nameColor;
      ctx.font = `300 ${Math.round(h * 0.038)}px 'Inter', 'Helvetica Neue', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      drawSpacedText(ctx, 'BITIRUVCHI ALBOM', w / 2, titleY, Math.round(h * 0.012));

      // ── 4. RASM TO'RTBURCHAK ───────────────────────────────
      const photoTop    = Math.round(h * 0.14);
      const photoBottom = Math.round(h * 0.65);
      // Rasm o'lchamlari (foiz scale bilan)
      const photoH = Math.round((photoBottom - photoTop) * (photoScale / 100));
      const photoW = Math.round(photoH * 0.72); // 3:4 nisbat
      const photoX = Math.round(w / 2 - photoW / 2);
      const photoY = photoTop + photoOffsetY;

      // Yengil oq border
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(photoX - 1, photoY - 1, photoW + 2, photoH + 2);

      // Rasmni clipping bilan chizish
      ctx.save();
      ctx.beginPath();
      ctx.rect(photoX, photoY, photoW, photoH);
      ctx.clip();

      if (photo && photo.complete && photo.naturalWidth > 0) {
        const iw = photo.naturalWidth, ih = photo.naturalHeight;
        const scale = Math.max(photoW / iw, photoH / ih);
        const dw = iw * scale, dh = ih * scale;
        const dx = photoX + (photoW - dw) / 2;
        const dy = photoY + (photoH - dh) / 2;
        ctx.drawImage(photo, dx, dy, dw, dh);
      } else {
        // Placeholder
        const grad = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoH);
        grad.addColorStop(0, '#1a1a1a');
        grad.addColorStop(1, '#2a2a2a');
        ctx.fillStyle = grad;
        ctx.fillRect(photoX, photoY, photoW, photoH);

        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.font = `${Math.round(photoH * 0.25)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👤', photoX + photoW / 2, photoY + photoH / 2);
      }
      ctx.restore();

      // ── 5. YIL "2 0 2 6" (yirik, ingichka) ─────────────────
      const yearText = (data.schoolYear || '2026').split('-')[0].trim();
      const yearY    = photoY + photoH + Math.round(h * 0.06);

      ctx.fillStyle = nameColor;
      ctx.font = `200 ${Math.round(h * 0.075)}px 'Inter', 'Helvetica Neue', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      drawSpacedText(ctx, yearText.split('').join(' '), w / 2, yearY, Math.round(h * 0.005));

      // ── 6. TUMAN (chiziqlar bilan) ─────────────────────────
      const districtText = (data.cityName || '').toUpperCase();
      const districtY    = yearY + Math.round(h * 0.052);

      if (districtText) {
        ctx.fillStyle = schoolColor;
        ctx.font = `400 ${Math.round(h * 0.018)}px 'Inter', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Matn kengligini o'lchaymiz va yon chiziqlar chizamiz
        const dWidth = ctx.measureText(districtText).width;
        const lineLen = Math.round(h * 0.05);
        const gap = Math.round(h * 0.014);
        const cx = w / 2;

        ctx.fillText(districtText, cx, districtY);

        // Chap chiziq
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(cx - dWidth / 2 - gap, districtY);
        ctx.lineTo(cx - dWidth / 2 - gap - lineLen, districtY);
        ctx.stroke();

        // O'ng chiziq
        ctx.beginPath();
        ctx.moveTo(cx + dWidth / 2 + gap, districtY);
        ctx.lineTo(cx + dWidth / 2 + gap + lineLen, districtY);
        ctx.stroke();
      }

      // ── 7. MAKTAB № (yirik, tantanali) ─────────────────────
      const schoolText = (data.schoolNumber || '№ MAKTAB').toUpperCase();
      const schoolY    = districtY + Math.round(h * 0.045);

      ctx.fillStyle = nameColor;
      ctx.font = `500 ${Math.round(h * 0.038)}px 'Inter', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      drawSpacedText(ctx, schoolText, w / 2, schoolY, Math.round(h * 0.003));

      // ── 8. SINF (kichik) ───────────────────────────────────
      const classText = (data.className || '').toUpperCase();
      const classY    = schoolY + Math.round(h * 0.034);

      if (classText) {
        ctx.fillStyle = schoolColor;
        ctx.font = `400 ${Math.round(h * 0.018)}px 'Inter', sans-serif`;
        drawSpacedText(ctx,
          classText.includes('SINF') ? classText : classText + ' SINF',
          w / 2, classY, Math.round(h * 0.003));
      }
    }
  },

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
  // 5. ALBOM ICHKI SAHIFA – O'qituvchi yuqorida katta + bola birinchi o'rinda
  //
  // cfg.allStudents  = barcha o'quvchilar massivi [{name, img}]
  // cfg.ownerIndex   = shu vinyetka egasining indeksi (0-based)
  // cfg.teacherImg   = sinf rahbari rasmi (Image ob'ekti yoki null)
  // ============================================================
  {
    id: 'album-inner',
    type: 'inner',
    name: 'Albom Ichki',
    desc: 'O\'qituvchi katta + bola 1-o\'rinda',
    emoji: '📖',
    defaultW: 900,
    defaultH: 1200,
    bgColor1: '#fafbff',
    bgColor2: '#eef2ff',
    accentColor: '#3730a3',
    nameColor: '#1e1b4b',
    schoolColor: '#4338ca',

    draw(ctx, data, cfg) {
      const {
        w, h,
        allStudents = [],
        ownerIndex  = 0,
        teacherImg  = null,
        nameFontSize   = 13,
        schoolFontSize = 12,
        nameColor   = '#1e1b4b',
        schoolColor = '#4338ca',
        bgColor1    = '#fafbff',
        bgColor2    = '#eef2ff',
        accentColor = '#3730a3',
        photoScale  = 100,
        photoShape  = 'rounded',
      } = cfg;

      // ══════════════════════════════════════════════════════
      // 1. FON
      // ══════════════════════════════════════════════════════
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, bgColor1);
      bgGrad.addColorStop(1, bgColor2);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Yuqori chap burchak dekor
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(w * 0.52, 0); ctx.lineTo(0, h * 0.14);
      ctx.fillStyle = hexAlpha(accentColor, 0.06);
      ctx.fill();
      ctx.restore();

      // Quyi o'ng burchak dekor
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(w, h); ctx.lineTo(w * 0.48, h); ctx.lineTo(w, h * 0.86);
      ctx.fillStyle = hexAlpha(accentColor, 0.06);
      ctx.fill();
      ctx.restore();

      // ══════════════════════════════════════════════════════
      // 2. HEADER – Gradient band
      // ══════════════════════════════════════════════════════
      const headerH = Math.round(h * 0.068);
      const hgrd = ctx.createLinearGradient(0, 0, w, 0);
      hgrd.addColorStop(0,   accentColor);
      hgrd.addColorStop(0.5, shiftHue(accentColor, 30));
      hgrd.addColorStop(1,   accentColor);
      ctx.fillStyle = hgrd;
      ctx.fillRect(0, 0, w, headerH);

      // Header matni
      const headerFS = Math.round(headerH * 0.38);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `700 ${headerFS}px Inter, sans-serif`;
      const headerText = [
        data.schoolNumber || '',
        data.className    ? data.className + ' sinf' : '',
        data.schoolYear   || ''
      ].filter(Boolean).join('   ·   ');
      ctx.fillText(headerText, w / 2, headerH / 2);

      // ══════════════════════════════════════════════════════
      // 3. O'QITUVCHI BLOKI – Katta rasm, markazda
      // ══════════════════════════════════════════════════════
      const teacherBlockTop = headerH + Math.round(h * 0.016);

      // O'qituvchi rasmi o'lchami – ancha katta
      const teacherD  = Math.round(h * 0.155 * (photoScale / 100));
      const teacherPx = w / 2;
      const teacherPy = teacherBlockTop + Math.round(h * 0.01) + teacherD / 2;

      // O'qituvchi kartasi (oq panel)
      const tcardW = Math.round(w * 0.38);
      const tcardH = teacherD + Math.round(h * 0.072);
      const tcardX = teacherPx - tcardW / 2;
      const tcardY = teacherBlockTop;

      ctx.save();
      ctx.shadowColor = 'rgba(55,48,163,0.14)';
      ctx.shadowBlur  = 24;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle   = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(tcardX, tcardY, tcardW, tcardH, 18);
      ctx.fill();
      ctx.restore();

      // Karta yuqori accent chiziq
      ctx.save();
      ctx.fillStyle = hgrd;
      ctx.beginPath();
      ctx.roundRect(tcardX, tcardY, tcardW, 5, [18, 18, 0, 0]);
      ctx.fill();
      ctx.restore();

      // O'qituvchi rasmi
      drawPhoto(ctx, teacherImg, teacherPx, teacherPy, teacherD, 'rounded', accentColor);

      // "Sinf rahbari" yorlig'i
      const labelFS = Math.round(h * 0.013);
      const labelY  = teacherPy + teacherD / 2 + Math.round(h * 0.01);

      ctx.save();
      const lblW = Math.round(tcardW * 0.72);
      const lblH = Math.round(labelFS * 2);
      ctx.fillStyle = hexAlpha(accentColor, 0.1);
      ctx.beginPath();
      ctx.roundRect(teacherPx - lblW / 2, labelY, lblW, lblH, lblH / 2);
      ctx.fill();
      ctx.fillStyle = accentColor;
      ctx.font = `600 ${labelFS}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('👩‍🏫  Sinf rahbari', teacherPx, labelY + lblH / 2);
      ctx.restore();

      // O'qituvchi ismi
      const tNameY = labelY + Math.round(h * 0.028);
      ctx.fillStyle = nameColor;
      ctx.font = `700 ${Math.round(h * 0.019)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(data.teacherName || 'Sinf rahbari F.I.O', teacherPx, tNameY);

      // ══════════════════════════════════════════════════════
      // 4. AJRATGICH
      // ══════════════════════════════════════════════════════
      const divY = tcardY + tcardH + Math.round(h * 0.022);

      // "O'quvchilar" yozuvi
      const secLabelFS = Math.round(h * 0.013);
      ctx.fillStyle = hexAlpha(accentColor, 0.65);
      ctx.font = `600 ${secLabelFS}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('━━━━━━   O\'quvchilar   ━━━━━━', w / 2, divY);

      // ══════════════════════════════════════════════════════
      // 5. O'QUVCHILAR GRID – Egasi birinchi, qolganlar tartibida
      // ══════════════════════════════════════════════════════
      const ordered    = buildOrderedStudents(allStudents, ownerIndex);
      const COLS       = 5;
      const gridTop    = divY + Math.round(h * 0.02);
      const gridBottom = h - Math.round(h * 0.05);
      const gridH      = gridBottom - gridTop;
      const rows       = Math.ceil(ordered.length / COLS) || 1;
      const cellW      = Math.floor(w / COLS);
      const cellH      = Math.floor(gridH / rows);
      const photoD     = Math.round(Math.min(cellW * 0.72, cellH * 0.60) * (photoScale / 100));
      const nameFS     = Math.max(9, Math.round(cellH * 0.095));

      ordered.forEach((st, idx) => {
        const col = idx % COLS;
        const row = Math.floor(idx / COLS);
        const cx  = cellW * col + cellW / 2;
        const cy  = gridTop + cellH * row + cellH * 0.40;
        const nameY = cy + photoD / 2 + Math.round(cellH * 0.045);

        // ── Egasi (birinchi o'rin) alohida highlight ──
        if (idx === 0) {
          ctx.save();

          // Highlight kartasi
          ctx.shadowColor = 'rgba(55,48,163,0.18)';
          ctx.shadowBlur  = 16;
          ctx.shadowOffsetY = 4;
          ctx.fillStyle   = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(cellW * col + 6, gridTop + cellH * row + 4, cellW - 12, cellH - 8, 14);
          ctx.fill();
          ctx.restore();

          // Accent border
          ctx.save();
          ctx.strokeStyle = accentColor;
          ctx.lineWidth   = 2.5;
          ctx.beginPath();
          ctx.roundRect(cellW * col + 6, gridTop + cellH * row + 4, cellW - 12, cellH - 8, 14);
          ctx.stroke();
          ctx.restore();

          // "★ 1" nishon
          ctx.save();
          const badgeR = Math.round(cellW * 0.14);
          const badgeCx = cellW * col + cellW - badgeR - 2;
          const badgeCy = gridTop + cellH * row + badgeR + 2;
          ctx.fillStyle = accentColor;
          ctx.beginPath();
          ctx.arc(badgeCx, badgeCy, badgeR, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = `700 ${Math.round(badgeR * 1.0)}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', badgeCx, badgeCy);
          ctx.restore();
        }

        // Rasm
        drawPhoto(ctx, st.img, cx, cy, photoD, photoShape, idx === 0 ? accentColor : hexAlpha(accentColor, 0.45));

        // Ism
        ctx.fillStyle = (idx === 0) ? accentColor : nameColor;
        ctx.font = `${idx === 0 ? '700' : '500'} ${nameFS}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        wrapTextCentered(ctx, st.name || '—', cx, nameY, cellW - 10, nameFS + 3, 2);
      });

      // ══════════════════════════════════════════════════════
      // 6. FOOTER
      // ══════════════════════════════════════════════════════
      const footerH = Math.round(h * 0.036);
      ctx.fillStyle = hgrd;
      ctx.fillRect(0, h - footerH, w, footerH);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = `500 ${Math.round(footerH * 0.38)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        [data.cityName, data.schoolName].filter(Boolean).join('   ·   '),
        w / 2, h - footerH / 2
      );
    }
  },

  // ============================================================
  // 6. BITIRUVCHI ALBOM ICHKI SAHIFA
  //    Landscape 4:3 · Qora teksturali fon · Chevron ramka
  //    Chap blok: O'qituvchi + maktab info
  //    O'ng blok: BITIRUVCHI / ALBOM + ikkita 4×4 sub-grid
  // ============================================================
  {
    id: 'bitiruvchi-albom-inner',
    type: 'inner',
    name: 'Bitiruvchi Albom Ichki',
    desc: 'Qora fon · Landscape · 28 o\'quvchi',
    emoji: '🎓',
    defaultW: 1200,
    defaultH: 900,
    bgColor1:   '#0a0a0a',
    bgColor2:   '#0a0a0a',
    accentColor:'#ffffff',
    nameColor:  '#ffffff',
    schoolColor:'#cccccc',

    draw(ctx, data, cfg) {
      const {
        w, h,
        allStudents  = [],
        ownerIndex   = 0,
        teacherImg   = null,
        nameColor    = '#ffffff',
        schoolColor  = '#cccccc',
        accentColor  = '#ffffff',
        photoScale   = 100,
        photoShape   = 'rect',
      } = cfg;

      // ── YORDAMCHI FUNKSIYALAR ──────────────────────────────

      // To'rtburchak portret rasm chizish (thin white border)
      function drawPortrait(img, x, y, pw, ph, featured) {
        ctx.save();
        // Border
        ctx.strokeStyle = featured ? '#ffffff' : 'rgba(255,255,255,0.55)';
        ctx.lineWidth   = featured ? 1.5 : 1;
        ctx.strokeRect(x, y, pw, ph);
        // Clip
        ctx.beginPath();
        ctx.rect(x + 1, y + 1, pw - 2, ph - 2);
        ctx.clip();
        if (img && img.complete && img.naturalWidth > 0) {
          const iw = img.naturalWidth, ih = img.naturalHeight;
          const sc = Math.max(pw / iw, ph / ih);
          const dw = iw * sc, dh = ih * sc;
          ctx.drawImage(img, x + 1 + (pw - 2 - dw) / 2, y + 1 + (ph - 2 - dh) / 2, dw, dh);
        } else {
          // Placeholder – qoʻngʻir-kulrang fon
          ctx.fillStyle = '#1e1e1e';
          ctx.fillRect(x + 1, y + 1, pw - 2, ph - 2);
          ctx.fillStyle = 'rgba(255,255,255,0.18)';
          ctx.font = `${Math.round(ph * 0.35)}px sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('👤', x + pw / 2, y + ph / 2);
        }
        ctx.restore();
      }

      // ── 1. QORA FON ────────────────────────────────────────
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, w, h);

      // Tekstura – mayda scratch chiziqlar
      ctx.save();
      for (let i = 0; i < 180; i++) {
        const x1 = Math.random() * w;
        const y1 = Math.random() * h;
        const len = 4 + Math.random() * 22;
        const ang = Math.random() * Math.PI;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + Math.cos(ang) * len, y1 + Math.sin(ang) * len);
        ctx.strokeStyle = `rgba(255,255,255,${0.018 + Math.random() * 0.028})`;
        ctx.lineWidth   = 0.5 + Math.random() * 0.8;
        ctx.stroke();
      }
      // Mayda dog'lar
      for (let i = 0; i < 90; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.015 + Math.random() * 0.035})`;
        ctx.fill();
      }
      ctx.restore();

      // Vignette (chetlarni qoraytiradi)
      const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.28, w / 2, h / 2, Math.max(w, h) * 0.72);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      // ── 2. CHEVRON (ZIGZAG) RAMKALAR – Chap va O'ng ────────
      function drawChevrons(side) {
        ctx.save();
        const cw   = Math.round(w * 0.038);    // chevron kengligi
        const step = Math.round(h / 11);        // har bir "tish" balandligi
        const tip  = Math.round(cw * 0.55);     // uchi ichga qancha kiradi

        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        if (side === 'left') {
          ctx.moveTo(0, 0);
          ctx.lineTo(cw, 0);
          for (let i = 0; i <= 12; i++) {
            const y0 = i * step;
            const y1 = y0 + step / 2;
            const y2 = y0 + step;
            ctx.lineTo(cw - tip, y1);
            ctx.lineTo(cw, y2);
          }
          ctx.lineTo(0, h);
          ctx.closePath();
        } else {
          ctx.moveTo(w, 0);
          ctx.lineTo(w - cw, 0);
          for (let i = 0; i <= 12; i++) {
            const y0 = i * step;
            const y1 = y0 + step / 2;
            const y2 = y0 + step;
            ctx.lineTo(w - cw + tip, y1);
            ctx.lineTo(w - cw, y2);
          }
          ctx.lineTo(w, h);
          ctx.closePath();
        }
        ctx.fill();

        // Chevron edge glow
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth   = 1;
        ctx.stroke();
        ctx.restore();
      }
      drawChevrons('left');
      drawChevrons('right');

      const chevW = Math.round(w * 0.038);
      const pad   = chevW + Math.round(w * 0.012);  // content padding

      // ── 3. PASTKI YUPQA NUQTALI AJRATGICH ──────────────────
      const dashY = Math.round(h * 0.918);
      ctx.save();
      ctx.setLineDash([3, 6]);
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth   = 0.8;
      ctx.beginPath();
      ctx.moveTo(pad, dashY);
      ctx.lineTo(w - pad, dashY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // ── 4. CHAP BLOK – O'qituvchi + Maktab ma'lumotlari ────
      const leftBlockW = Math.round(w * 0.28);
      const contentTop = Math.round(h * 0.052);
      const contentBot = dashY - Math.round(h * 0.015);

      // O'qituvchi rasmi – vertikal to'rtburchak
      const tPhotoW = Math.round(leftBlockW * 0.62 * (photoScale / 100));
      const tPhotoH = Math.round(tPhotoW * 1.32);
      const tPhotoX = pad + Math.round((leftBlockW - tPhotoW) / 2);
      const tPhotoY = contentTop;

      drawPortrait(teacherImg, tPhotoX, tPhotoY, tPhotoW, tPhotoH, true);

      // "Sinf rahbari" yozuvi – kichik italic
      const tLabelY = tPhotoY + tPhotoH + Math.round(h * 0.012);
      ctx.fillStyle   = 'rgba(255,255,255,0.65)';
      ctx.font        = `italic 400 ${Math.round(h * 0.017)}px Georgia, serif`;
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('Sinf rahbari', pad + leftBlockW / 2, tLabelY);

      // O'qituvchi ismi
      const tNameY = tLabelY + Math.round(h * 0.024);
      ctx.fillStyle = '#ffffff';
      ctx.font      = `italic 400 ${Math.round(h * 0.02)}px Georgia, serif`;
      ctx.fillText(data.teacherName || 'F.I.O', pad + leftBlockW / 2, tNameY);

      // Yupqa ajratgich chiziq
      const infoSepY = tNameY + Math.round(h * 0.038);
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth   = 0.8;
      ctx.beginPath();
      ctx.moveTo(pad + leftBlockW * 0.1, infoSepY);
      ctx.lineTo(pad + leftBlockW * 0.9, infoSepY);
      ctx.stroke();
      ctx.restore();

      // Maktab raqami
      const infoY1 = infoSepY + Math.round(h * 0.028);
      ctx.fillStyle   = '#ffffff';
      ctx.font        = `400 ${Math.round(h * 0.022)}px Inter, sans-serif`;
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'top';
      drawSpacedText(ctx, (data.schoolNumber || 'MAKTAB № 64').toUpperCase(),
        pad + leftBlockW / 2, infoY1, Math.round(h * 0.004));

      // Sinf
      const infoY2 = infoY1 + Math.round(h * 0.038);
      const classStr = data.className
        ? `${data.className.toUpperCase()} SINF`
        : '9 "A" SINF';
      drawSpacedText(ctx, classStr, pad + leftBlockW / 2, infoY2, Math.round(h * 0.004));

      // "Graduate" – kaligrafik kursiv
      const gradY = infoY2 + Math.round(h * 0.042);
      ctx.fillStyle = '#ffffff';
      ctx.font      = `italic 400 ${Math.round(h * 0.052)}px Georgia, 'Times New Roman', serif`;
      ctx.fillText('Graduate', pad + leftBlockW / 2, gradY);

      // Yil
      const yearY = gradY + Math.round(h * 0.065);
      ctx.font = `700 ${Math.round(h * 0.056)}px Inter, sans-serif`;
      ctx.fillText(data.schoolYear?.split('-')[0] || '2026', pad + leftBlockW / 2, yearY);

      // ── 5. O'NG BLOK – BITIRUVCHI + ALBOM + GRID ───────────
      const rightStart = pad + leftBlockW + Math.round(w * 0.022);
      const rightW     = w - rightStart - pad;

      // Sarlavha: "BITIRUVCHI" katta, "ALBOM" kichikroq
      const titleY = contentTop;
      ctx.textAlign   = 'left';
      ctx.textBaseline = 'top';

      ctx.fillStyle = '#ffffff';
      ctx.font      = `800 ${Math.round(h * 0.072)}px Inter, sans-serif`;
      const btW = ctx.measureText('BITIRUVCHI').width;
      ctx.fillText('BITIRUVCHI', rightStart, titleY);

      ctx.font      = `400 ${Math.round(h * 0.048)}px Inter, sans-serif`;
      ctx.fillText('ALBOM', rightStart + btW + Math.round(w * 0.012), titleY + Math.round(h * 0.018));

      // Ingichka chiziq sarlavha ostida
      const titleLineY = titleY + Math.round(h * 0.088);
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rightStart, titleLineY);
      ctx.lineTo(rightStart + rightW, titleLineY);
      ctx.stroke();
      ctx.restore();

      // ── 6. O'QUVCHILAR – Ikkita 4×4 sub-grid ──────────────
      const gridTop  = titleLineY + Math.round(h * 0.018);
      const gridBot  = dashY - Math.round(h * 0.01);
      const gridH    = gridBot - gridTop;

      const subGap   = Math.round(rightW * 0.028);   // ikki sub-grid orasidagi bo'shliq
      const subW     = Math.round((rightW - subGap) / 2);

      // Har bir sub-grid: 4 ustun × 4 qator
      const COLS = 4;
      const ROWS = 4;
      const cellGapX = Math.round(subW * 0.025);
      const cellGapY = Math.round(gridH * 0.022);
      const cellW    = Math.round((subW - cellGapX * (COLS - 1)) / COLS);
      const cellH    = Math.round((gridH - cellGapY * (ROWS - 1)) / ROWS);

      // O'quvchi foto o'lchami – portret nisbat
      const pW = cellW;
      const pH = Math.round(cellH * 0.76);

      // Ism uchun joy
      const nameFSize = Math.max(8, Math.round(cellH * 0.1));

      // Barcha o'quvchilar — egasi 1-o'rinda
      const ordered = buildOrderedStudents(allStudents, ownerIndex);

      // LEFT sub-grid: 0–15 (16 ta)
      // RIGHT sub-grid: 16–27 (12 ta, 0-qator "featured" = biroz kattaroq)
      // Lekin biz allStudents dan foydalanamiz, tartibini saqlaymiz

      // Sub-grid chizish funksiyasi
      function drawSubGrid(students, startX, featured0) {
        students.forEach((st, idx) => {
          const col = idx % COLS;
          const row = Math.floor(idx / COLS);
          const isFeatured = featured0 && row === 0;

          // Featured qator ozgina kattaroq
          const featScale = isFeatured ? 1.12 : 1.0;
          const cpW = Math.round(pW * featScale);
          const cpH = Math.round(pH * featScale);

          // Featured qator uchun Y offset (boshidan hisoblash)
          let rowY = gridTop;
          for (let r = 0; r < row; r++) {
            const rFeat = featured0 && r === 0;
            rowY += Math.round(pH * (rFeat ? 1.12 : 1.0)) + Math.round(cellGapY * (rFeat ? 1.2 : 1.0));
          }

          const cx = startX + col * (cellW + cellGapX) + (cellW - cpW) / 2;
          const cy = rowY;

          drawPortrait(st?.img || null, cx, cy, cpW, cpH, isFeatured || idx === 0);

          // Ism
          const nm = st?.name || '';
          ctx.fillStyle   = '#ffffff';
          ctx.font        = `300 ${nameFSize}px Inter, sans-serif`;
          ctx.textAlign   = 'center';
          ctx.textBaseline = 'top';
          const nameY = cy + cpH + Math.round(cellH * 0.028);
          // Qisqa ism (fayl nomidan surname + birinchi harf)
          const shortName = nm.length > 14 ? nm.substring(0, 14) : nm;
          ctx.fillText(shortName, cx + cpW / 2, nameY);
        });
      }

      // Left sub-grid: birinchi 16 ta o'quvchi
      const leftStudents  = ordered.slice(0, 16);
      // Right sub-grid: keyingi 12 ta (0-qator "featured")
      const rightStudents = ordered.slice(16, 28);

      drawSubGrid(leftStudents,  rightStart,           false);
      drawSubGrid(rightStudents, rightStart + subW + subGap, true);

      // ── 7. PASTKI MATN (ajratgich ostida) ──────────────────
      const footerY = dashY + Math.round(h * 0.018);
      ctx.fillStyle   = 'rgba(255,255,255,0.45)';
      ctx.font        = `300 ${Math.round(h * 0.018)}px Inter, sans-serif`;
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(
        [data.cityName, data.schoolName].filter(Boolean).join('   ·   ') || '',
        w / 2, footerY
      );
    }
  },

  // ============================================================
  // 7. SPLIT INNER – 305×400mm Landscape, chap portret + o'ng grid
  // ============================================================
  {
    id: 'split-inner',
    type: 'split-inner',
    name: 'Split Ichki Sahifa',
    desc: 'Chap: 1 portret · O\'ng: avtomatik grid',
    emoji: '📐',
    defaultW: 1440,
    defaultH: 1098,
    printW: 6000,            // ~380 DPI @ 400×305mm (yuqori sifat)
    printH: 4575,
    exportFormat: 'jpeg',
    jpegQuality: 1.0,        // maksimal sifat (kam siqilish)
    bgColor1:    '#0f172a',
    bgColor2:    '#1e3a5f',
    accentColor: '#6366f1',
    nameColor:   '#ffffff',
    schoolColor: '#cbd5e1',

    draw(ctx, data, cfg) {
      const W = cfg.w || cfg.canvasW || 1440;
      const H = cfg.h || cfg.canvasH || 1098;

      // cfg parametrlari
      const bgType         = cfg.bgType       || 'color';
      const bgColor1       = cfg.bgColor1      || '#0f172a';
      const bgColor2       = cfg.bgColor2      || '#1e3a5f';
      const gradDir        = cfg.gradDir       || 'tb';
      const bgImg          = cfg.bgImg         || null;
      const bgOverlay      = cfg.bgOverlay     != null ? cfg.bgOverlay : 0.4;
      const bgOvColor      = cfg.bgOvColor     || '#000000';

      let leftImg          = cfg.leftImg       || cfg.teacherImg || null;
      const leftScale      = cfg.leftScale     != null ? cfg.leftScale : 0.90;
      const leftBorderColor= cfg.leftBorderColor || '#ffffff';
      const leftBorderW    = 0;   // border olib tashlandi
      const leftRadius     = cfg.leftRadius    != null ? cfg.leftRadius : 8;
      let leftLabel        = cfg.leftLabel     || '';
      const leftLabelFS    = cfg.leftLabelFS   || 14;
      const leftLabelColor = cfg.leftLabelColor || '#ffffff';

      const allStudents    = cfg.allStudents   || [];
      const ownerIndex     = cfg.ownerIndex    != null ? cfg.ownerIndex : 0;
      // Chap portret = egasining rasmi (agar alohida berilmagan bo'lsa)
      if (!leftImg && allStudents[ownerIndex] && allStudents[ownerIndex].img) {
        leftImg = allStudents[ownerIndex].img;
      }
      // Chap pastdagi yozuv = egasining ismi (agar alohida berilmagan bo'lsa)
      if (!leftLabel && allStudents[ownerIndex] && allStudents[ownerIndex].name) {
        leftLabel = allStudents[ownerIndex].name;
      }
      const maxCols        = cfg.maxCols       || 5;
      const gapX           = cfg.gapX         != null ? cfg.gapX : 8;
      const gapY           = cfg.gapY         != null ? cfg.gapY : 12;
      const photoShape     = cfg.photoShape    || 'rounded';
      const borderW        = 0;   // ramka borderlari olib tashlandi
      const borderColor    = cfg.borderColor   || '#ffffff';

      const namePos        = cfg.namePos       || 'bottom';
      const nameFSManual   = cfg.nameFS        || 0;
      const nameColor      = cfg.nameColor     || '#ffffff';
      const nameAlign      = cfg.nameAlign     || 'center';
      const nameWeight     = cfg.nameWeight    || '400';

      const headerStyle    = cfg.headerStyle   || 'band';
      const headerH        = cfg.headerH       != null ? cfg.headerH : 50;
      const headerColor    = cfg.headerColor   || '#1e3a8a';
      const headerText     = cfg.headerText    || [
        data.schoolNumber, data.className ? data.className+' sinf' : '', data.schoolYear
      ].filter(Boolean).join(' · ');
      const headerFS       = cfg.headerFS      || 13;
      const headerTextColor= cfg.headerTextColor || '#ffffff';

      const divider        = cfg.divider       || 'line';
      const divW           = cfg.divW          != null ? cfg.divW : 1;
      const divColor       = cfg.divColor      || '#ffffff';
      const divOp          = cfg.divOp         != null ? cfg.divOp : 0.30;

      // ── Yordamchi funksiyalar ──
      function hA(hex, a) {
        const n = parseInt((hex||'#000').replace('#',''), 16);
        return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
      }

      // GRID ALGORITMI:
      //  - count <= cols  → bitta qator
      //  - ortiqcha 1 ta  → tepa (birinchi) qatorga qo'shiladi (cols+1)
      //  - ortiqcha 2+ ta → yangi tepa qator ochiladi (rem ta)
      //  Barcha qatorlar gorizontal markazlanadi.
      function buildRows(count, cols) {
        if (count <= 0) return [];
        if (count <= cols) return [count];
        const fullRows = Math.floor(count / cols);
        const rem = count % cols;
        if (rem === 0) {
          return Array(fullRows).fill(cols);
        } else if (rem === 1) {
          // 1 ta ortsa — yangi qator ochilmaydi, birinchi qatorga qo'shiladi
          return [cols + 1, ...Array(fullRows - 1).fill(cols)];
        } else {
          // 2+ ortsa — yangi (tepa) qator
          return [rem, ...Array(fullRows).fill(cols)];
        }
      }

      function clipPath(x, y, pw, ph, shape, ins) {
        const r = Math.min(pw, ph) * 0.12;
        const xi = x+ins, yi = y+ins, wi = pw-ins*2, hi = ph-ins*2;
        switch(shape) {
          case 'circle': ctx.arc(x+pw/2, y+ph/2, Math.min(pw,ph)/2-ins, 0, Math.PI*2); break;
          case 'oval':   ctx.ellipse(x+pw/2, y+ph/2, pw/2-ins, ph/2-ins, 0, 0, Math.PI*2); break;
          case 'rect':   ctx.rect(xi, yi, wi, hi); break;
          default:       ctx.roundRect(xi, yi, wi, hi, Math.max(1, r-ins));
        }
      }

      // ── 1. HEADER — o'chirilgan (tepa bar yo'q) ──
      let topOffset = 0;

      // ── 2. FON ──
      const contentH = H - topOffset;
      if (bgType === 'image' && bgImg) {
        const iw = bgImg.naturalWidth, ih = bgImg.naturalHeight;
        const sc = Math.max(W/iw, contentH/ih);
        ctx.drawImage(bgImg, (W-iw*sc)/2, topOffset+(contentH-ih*sc)/2, iw*sc, ih*sc);
        if (bgOverlay > 0.01) {
          ctx.fillStyle = hA(bgOvColor, bgOverlay);
          ctx.fillRect(0, topOffset, W, contentH);
        }
      } else if (bgType === 'gradient') {
        let g;
        if (gradDir === 'radial') g = ctx.createRadialGradient(W/2, topOffset+contentH/2, 0, W/2, topOffset+contentH/2, Math.max(W,contentH)*0.75);
        else if (gradDir === 'lr') g = ctx.createLinearGradient(0, 0, W, 0);
        else if (gradDir === 'diag') g = ctx.createLinearGradient(0, topOffset, W, H);
        else g = ctx.createLinearGradient(0, topOffset, 0, H);
        g.addColorStop(0, bgColor1); g.addColorStop(1, bgColor2);
        ctx.fillStyle = g;
        ctx.fillRect(0, topOffset, W, contentH);
      } else {
        ctx.fillStyle = bgColor1;
        ctx.fillRect(0, topOffset, W, contentH);
      }

      const contentY = topOffset;
      const halfW = Math.floor(W / 2);

      // Umumiy vertikal band — chap rasm va o'ng grid bir xil tepa/past
      const padV    = Math.round(contentH * 0.045);
      const bandTop = contentY + padV;
      const bandBot = contentY + contentH - padV;
      const bandH   = bandBot - bandTop;

      // ── Free-transform yordamchilari (har rasmni qo'lda siljitish/masshtab) ──
      const transforms = cfg.transforms || {};
      const hitRegions = cfg.hitRegions || null;
      const faces      = cfg.faces || {};

      function drawImgT(img, x, y, w, h, key, faceIdx, targetFrac) {
        const iw = (img && (img.naturalWidth || img.width)) || 0;
        const ih = (img && (img.naturalHeight || img.height)) || 0;
        if (!(iw > 0 && ih > 0)) return false;
        if (hitRegions) hitRegions.push({ key, x, y, w, h });

        const sc0 = Math.max(w / iw, h / ih);
        const store = transforms[key];
        let s, ox, oy;

        if (store && store.src === 'manual') {
          s = Math.max(1, Math.min(8, store.scale || 1));
          const scs0 = sc0 * s, dw0 = iw * scs0, dh0 = ih * scs0;
          const mOx = (dw0 - w) / (2 * w), mOy = (dh0 - h) / (2 * h);
          ox = Math.max(-mOx, Math.min(mOx, store.ox || 0));
          oy = Math.max(-mOy, Math.min(mOy, store.oy || 0));
          store.scale = s; store.ox = ox; store.oy = oy;
        } else {
          const face = faces[faceIdx];
          if (face) {
            const isLeft = (typeof key === 'string' && key.charAt(0) === 'L');
            const tf = isLeft
              ? (cfg.autoFaceFracLeft != null ? cfg.autoFaceFracLeft : (targetFrac || 0.27))
              : (cfg.autoFaceFrac     != null ? cfg.autoFaceFrac     : (targetFrac || 0.30));
            const fhPx = Math.max(1, face.fh * ih);
            const fcxPx = face.cx * iw, fcyPx = face.cy * ih;
            s = Math.max(1, Math.min(8, (tf * h) / (fhPx * sc0)));
            const scs = sc0 * s, dw = iw * scs, dh = ih * scs;
            ox = (0.5 * w - (w - dw) / 2 - fcxPx * scs) / w;
            const vy = isLeft
              ? (cfg.autoFaceYLeft != null ? cfg.autoFaceYLeft : 0.43)
              : (cfg.autoFaceY     != null ? cfg.autoFaceY     : 0.43);
            oy = (vy * h - (h - dh) / 2 - fcyPx * scs) / h;
            const mOx = (dw - w) / (2 * w), mOy = (dh - h) / (2 * h);
            ox = Math.max(-mOx, Math.min(mOx, ox));
            oy = Math.max(-mOy, Math.min(mOy, oy));
          } else {
            s = 1;
            const scs = sc0, dw = iw * scs, dh = ih * scs;
            const mOy = (dh - h) / (2 * h);
            ox = 0;
            oy = Math.max(-mOy, Math.min(mOy, -0.06));
          }
          transforms[key] = { scale: s, ox, oy, src: 'auto' };
        }

        const scs = sc0 * s, dw = iw * scs, dh = ih * scs;
        ctx.drawImage(img, x + (w - dw) / 2 + ox * w, y + (h - dh) / 2 + oy * h, dw, dh);
        return true;
      }

      // ── 3. CHAP – PORTRET RASM (band balandligida, tepa/past flush) ──
      const r   = 0;   // burchak radiusi yo'q
      const lPad = Math.round(W * 0.022);
      const lX  = lPad;
      const lW  = halfW - lPad - Math.round(W * 0.012);
      const lY  = bandTop;
      const lH  = bandH;

      ctx.save();
      ctx.beginPath(); ctx.rect(lX, lY, lW, lH); ctx.clip();
      if (!drawImgT(leftImg, lX, lY, lW, lH, `L${ownerIndex}`, ownerIndex, 0.42)) {
        const pg = ctx.createLinearGradient(lX, lY, lX + lW, lY + lH);
        pg.addColorStop(0, '#1e3a5f'); pg.addColorStop(1, '#0f2027');
        ctx.fillStyle = pg; ctx.fillRect(lX, lY, lW, lH);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.beginPath(); ctx.arc(lX + lW/2, lY + lH*0.34, lW*0.20, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath(); ctx.ellipse(lX + lW/2, lY + lH*0.78, lW*0.32, lH*0.18, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.font = `500 ${Math.round(lW*0.05)}px Inter,sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('📸 Rasm yuklang', lX + lW/2, lY + lH*0.5);
      }
      ctx.restore();

      // Chap pastdagi yozuv — rasm pastiga overlay
      if (leftLabel && leftLabel.trim()) {
        ctx.save();
        ctx.beginPath(); ctx.roundRect(lX, lY, lW, lH, r); ctx.clip();
        const ovH = Math.round(lH * 0.11);
        const ovY = lY + lH - ovH;
        const og = ctx.createLinearGradient(0, ovY, 0, lY + lH);
        og.addColorStop(0, 'rgba(0,0,0,0)'); og.addColorStop(1, 'rgba(0,0,0,0.72)');
        ctx.fillStyle = og; ctx.fillRect(lX, ovY, lW, ovH);
        ctx.fillStyle = leftLabelColor;
        ctx.font = `600 ${leftLabelFS}px Inter,sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText(leftLabel.trim(), lX + lW/2, lY + lH - Math.round(lH*0.025));
        ctx.restore();
      }

      // ── 4. AJRATGICH ──
      if (divider === 'line') {
        ctx.save();
        ctx.strokeStyle = hA(divColor, divOp);
        ctx.lineWidth = divW;
        ctx.beginPath();
        ctx.moveTo(halfW, bandTop);
        ctx.lineTo(halfW, bandBot);
        ctx.stroke();
        ctx.restore();
      }

      // ── 5. O'NG – O'QUVCHILAR GRID (band balandligida, tepa/past flush) ──
      const rightPad   = Math.round(halfW * 0.04);
      const rightX     = halfW + rightPad;
      const rightW     = halfW - rightPad * 2;
      const rightGridY = bandTop;
      const rightGridH = bandH;

      // O'quvchilar — EGASI birinchi o'ringa (origIndex saqlanadi)
      let order = allStudents.map((_, i) => i);
      if (order.length > 0 && ownerIndex > 0 && ownerIndex < order.length) {
        order = [ownerIndex, ...order.filter(i => i !== ownerIndex)];
      }
      const students = order.map(i => allStudents[i]);
      const count = students.length || 1;
      const rows = buildRows(count, maxCols);
      const rowCount = rows.length;
      const maxItemsInRow = Math.max(...rows);

      // ── Oq CARD o'lchami (foto + ism), band va kenglikka moslab ──
      const CR = 1.52;  // karta balandlik/kenglik nisbati (foto 3:4 + ism joyi)
      const totalGapY = gapY * (rowCount - 1);
      const cardH_byH = (rightGridH - totalGapY) / rowCount;
      const cardW_byH = cardH_byH / CR;
      const cardW_byW = (rightW - (maxItemsInRow - 1) * gapX) / maxItemsInRow;
      const cardW = Math.floor(Math.min(cardW_byH, cardW_byW));
      const cardH = Math.round(cardW * CR);

      const hasName   = (namePos !== 'none');
      const pad       = Math.max(1, Math.round(cardW * 0.022));  // ingichka oq ramka
      const nameFS    = nameFSManual > 0 ? nameFSManual : Math.max(8, Math.round(cardW * 0.115));
      const lineH     = Math.round(nameFS * 1.18);
      const gapInner  = Math.round(nameFS * 0.35);
      const nameAreaH = hasName ? (lineH * 2 + Math.round(nameFS * 0.3)) : 0;
      const photoW    = cardW - 2 * pad;
      const photoH    = Math.max(10, cardH - 2 * pad - gapInner - nameAreaH);

      const totalGridH = rowCount * cardH + totalGapY;
      const gridStartY = rightGridY + Math.round((rightGridH - totalGridH) / 2);

      // Ismni 2 qatorga bo'lish (ism / familiya)
      function splitName(nm) {
        const parts = (nm || '').trim().split(/\s+/);
        if (parts.length <= 1) return [parts[0] || ''];
        return [parts[0], parts.slice(1).join(' ')];
      }

      const PALETTE = [
        ['#1e3a5f','#2d6a4f'],['#4a1942','#6b2d5e'],['#1a3a5c','#1e6091'],
        ['#3d1a00','#7b3f00'],['#0d3b2e','#145a32'],['#2c003e','#4a0072'],
        ['#003366','#004080'],['#1b1b2f','#2b2b4b'],['#002b36','#073642'],
      ];

      let studentIdx = 0;
      rows.forEach((colsInRow, rowI) => {
        const totalRowW = colsInRow * cardW + (colsInRow - 1) * gapX;
        const rowStartX = rightX + Math.round((rightW - totalRowW) / 2);
        const cardY     = gridStartY + rowI * (cardH + gapY);

        for (let col = 0; col < colsInRow; col++) {
          const cardX  = rowStartX + col * (cardW + gapX);
          const student = students[studentIdx] || null;
          const origIndex = order[studentIdx];
          const isOwner = (studentIdx === 0);  // egasi = birinchi o'rinda

          // ── OQ CARD foni (ramka) ──
          ctx.save();
          ctx.shadowColor   = 'rgba(0,0,0,0.35)';
          ctx.shadowBlur    = Math.max(2, Math.round(cardW * 0.04));
          ctx.shadowOffsetY = Math.max(1, Math.round(cardW * 0.012));
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cardX, cardY, cardW, cardH);
          ctx.restore();

          // ── FOTO (card ichida, tepada) ──
          const ipx = cardX + pad, ipy = cardY + pad, ipw = photoW, iph = photoH;
          ctx.save();
          ctx.beginPath();
          ctx.rect(ipx, ipy, ipw, iph);
          ctx.clip();
          if (!drawImgT(student ? student.img : null, ipx, ipy, ipw, iph, `g${origIndex}`, origIndex, 0.55)) {
            const [c1,c2] = PALETTE[studentIdx % PALETTE.length];
            const pg = ctx.createLinearGradient(ipx, ipy, ipx+ipw*0.5, ipy+iph);
            pg.addColorStop(0,c1); pg.addColorStop(1,c2);
            ctx.fillStyle = pg; ctx.fillRect(ipx, ipy, ipw, iph);
            ctx.fillStyle = 'rgba(255,255,255,0.16)';
            ctx.beginPath(); ctx.arc(ipx+ipw/2, ipy+iph*0.32, ipw*0.24, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.10)';
            ctx.beginPath(); ctx.ellipse(ipx+ipw/2, ipy+iph*0.86, ipw*0.34, iph*0.26, 0, 0, Math.PI*2); ctx.fill();
          }
          ctx.restore();

          // ── ISM-FAMILYA (card ichida, foto ostida, 2 qator, qora matn) ──
          if (hasName && student && student.name) {
            const lines = splitName(student.name);
            ctx.save();
            ctx.fillStyle = isOwner ? '#b45309' : '#1f2937';  // egasi — amber, qolgani — to'q
            ctx.font = `${isOwner ? '700' : '600'} ${nameFS}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            const ny = ipy + iph + gapInner;
            lines.forEach((ln, li) => ctx.fillText(ln, cardX + cardW/2, ny + li*lineH));
            ctx.restore();
          }
          studentIdx++;
        }
      });
    }
  },

  // ============================================================
  // 8. POSTER 305×400 — Qora fon, chap katta panel, o'ng 5×5 grid
  //    Aniq o'lchamlar: 3602×4724 px (300 DPI), JPEG q92
  // ============================================================
  {
    id: 'poster-split',
    type: 'poster-inner',
    name: 'Poster 400×305 (albom)',
    desc: 'Landscape · chap katta · o\'ng dinamik grid',
    emoji: '🖼',
    defaultW: 4724,
    defaultH: 3602,
    noScale: true,            // chiqish aniq 4724×3602 bo'lsin (scale qilinmasin)
    exportFormat: 'jpeg',     // JPEG sifatida eksport
    jpegQuality: 0.92,
    bgColor1: '#000000',
    bgColor2: '#000000',
    accentColor: '#ffffff',
    nameColor: '#ffffff',
    schoolColor: '#ffffff',

    draw(ctx, data, cfg) {
      const W = cfg.w || cfg.canvasW || 3602;
      const H = cfg.h || cfg.canvasH || 4724;
      const allStudents = cfg.allStudents || [];
      const ownerIndex  = cfg.ownerIndex != null ? cfg.ownerIndex : 0;
      const leftImg = cfg.leftImg ||
        (allStudents[ownerIndex] && allStudents[ownerIndex].img) || null;

      // ── Qora fon ──
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, W, H);

      // Yordamchi: COVER (kataknи to'ldiradi, ortig'i kesiladi)
      function drawCover(img, x, y, w, h) {
        if (img && img.complete && img.naturalWidth > 0) {
          const iw = img.naturalWidth, ih = img.naturalHeight;
          const sc = Math.max(w / iw, h / ih);
          const dw = iw * sc, dh = ih * sc;
          ctx.save();
          ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
          ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
          ctx.restore();
        } else {
          // Bo'sh katak — deyarli qora, ozgina ko'rinadigan placeholder
          ctx.fillStyle = '#0e0e0e';
          ctx.fillRect(x, y, w, h);
          ctx.strokeStyle = 'rgba(255,255,255,0.06)';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
          ctx.fillStyle = 'rgba(255,255,255,0.10)';
          ctx.font = `${Math.round(w * 0.3)}px sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('👤', x + w / 2, y + h / 2);
        }
      }

      // Yordamchi: CONTAIN (butun rasm sig'adi, ortig'i qora)
      function drawContain(img, x, y, w, h) {
        if (img && img.complete && img.naturalWidth > 0) {
          const iw = img.naturalWidth, ih = img.naturalHeight;
          const sc = Math.min(w / iw, h / ih);
          const dw = iw * sc, dh = ih * sc;
          ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
        } else {
          ctx.fillStyle = '#0e0e0e';
          ctx.fillRect(x, y, w, h);
          ctx.fillStyle = 'rgba(255,255,255,0.12)';
          ctx.font = `${Math.round(w * 0.12)}px sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('👤', x + w / 2, y + h / 2);
        }
      }

      // Bazaviy o'lcham (mm→px @300dpi): 4724×3602 (landscape)
      const BW = 4724, BH = 3602;
      const sx = W / BW, sy = H / BH;

      // ── CHAP PANEL: x=53,y=53 → 1847×3496, butun rasm (contain) ──
      const LX = Math.round(53   * sx);
      const LY = Math.round(53   * sy);
      const LW = Math.round(1847 * sx);
      const LH = Math.round(3496 * sy);
      drawContain(leftImg, LX, LY, LW, LH);

      // ── O'NG PANEL: dinamik grid (COLS×ROWS o'quvchi soniga qarab) ──
      const panelX = Math.round(1960 * sx);
      const panelY = 0;
      const panelW = Math.round(2764 * sx);
      const panelH = Math.round(3602 * sy);

      const n = allStudents.length || 1;
      // O'quvchi soniga eng mos COLS×ROWS ni tanlash (portret kataklar ~0.72 nisbat)
      let best = { cols: 1, rows: n, score: Infinity };
      for (let cols = 1; cols <= n; cols++) {
        const rows   = Math.ceil(n / cols);
        const cw     = panelW / cols, ch = panelH / rows;
        const aspect = cw / ch;            // katak eni/bo'yi
        const empty  = cols * rows - n;    // bo'sh kataklar soni
        const score  = Math.abs(aspect - 0.72) + empty * 0.03;
        if (score < best.score) best = { cols, rows, score };
      }
      const COLS = best.cols, ROWS = best.rows;
      const cellW = Math.floor(panelW / COLS);
      const cellH = Math.floor(panelH / ROWS);

      // Grid umumiy o'lchami → markazlash
      const usedW  = cellW * COLS, usedH = cellH * ROWS;
      const startX = panelX + Math.round((panelW - usedW) / 2);
      const startY = panelY + Math.round((panelH - usedH) / 2);

      for (let i = 0; i < n; i++) {
        const row = Math.floor(i / COLS);
        const col = i % COLS;
        // Oxirgi qator to'liq bo'lmasa — o'rtaga tekislash
        const itemsInRow = Math.min(COLS, n - row * COLS);
        const rowOffsetX = (row === ROWS - 1)
          ? Math.round((COLS - itemsInRow) * cellW / 2)
          : 0;
        const cx = startX + rowOffsetX + col * cellW;
        const cy = startY + row * cellH;
        const st = allStudents[i];
        drawCover(st ? st.img : null, cx, cy, cellW, cellH);
      }
    }
  },

  // ============================================================
  // 9. QIZIL – Bayram vinyetkasi
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

// ============================================================
// INNER SHABLON YORDAMCHI FUNKSIYALARI
// ============================================================

/**
 * Egasini boshga, qolganlarni tartibida qaytaradi
 * allStudents: [{name, img}]
 * ownerIndex : egasining haqiqiy indeksi
 */
function buildOrderedStudents(allStudents, ownerIndex) {
  if (!allStudents || allStudents.length === 0) return [];
  const owner = allStudents[ownerIndex] || allStudents[0];
  const rest  = allStudents.filter((_, i) => i !== ownerIndex);
  return [owner, ...rest];
}

/**
 * Ko'p qatorli matn – markazlashtirilgan, maxLines qatordan oshmasin
 */
function wrapTextCentered(ctx, text, x, y, maxW, lineH, maxLines) {
  if (!text) return;
  const words = text.split(' ');
  const lines = [];
  let line = '';
  words.forEach((word, i) => {
    const test = line + (line ? ' ' : '') + word;
    if (ctx.measureText(test).width > maxW && i > 0) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);

  const limited = lines.slice(0, maxLines || 99);
  limited.forEach((l, i) => {
    ctx.fillText(l, x, y + i * lineH);
  });
}

/**
 * Hex rangni alfa bilan qaytaradi: hexAlpha('#4f46e5', 0.15) → 'rgba(79,70,229,0.15)'
 */
function hexAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Rangni biroz boshqa hue ga siljitadi (gradient uchun)
 */
function shiftHue(hex, deg) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6;
    }
  }
  h = (h + deg / 360) % 1;
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p2 = 2 * l - q2;
  const R = Math.round(hue2rgb(p2, q2, h + 1/3) * 255);
  const G = Math.round(hue2rgb(p2, q2, h) * 255);
  const B = Math.round(hue2rgb(p2, q2, h - 1/3) * 255);
  return `#${R.toString(16).padStart(2,'0')}${G.toString(16).padStart(2,'0')}${B.toString(16).padStart(2,'0')}`;
}

window.buildOrderedStudents = buildOrderedStudents;
window.wrapTextCentered     = wrapTextCentered;
window.hexAlpha             = hexAlpha;

/**
 * Harflar orasiga bo'shliq qo'shib chizadi (letter-spacing emulyatsiyasi).
 * Canvas API'da letter-spacing yo'q, shuning uchun har harfni alohida chizamiz.
 */
function drawSpacedText(ctx, text, x, y, spacing) {
  if (!text) return;
  const chars = text.split('');
  // Avval umumiy kenglikni hisoblaymiz
  let totalW = 0;
  const widths = chars.map(ch => {
    const w = ctx.measureText(ch).width;
    totalW += w;
    return w;
  });
  totalW += spacing * Math.max(0, chars.length - 1);

  // Boshlang'ich x – align ga qarab
  let curX;
  if (ctx.textAlign === 'center')      curX = x - totalW / 2;
  else if (ctx.textAlign === 'right')  curX = x - totalW;
  else                                 curX = x;

  // Har bir belgini left-align bilan chizamiz
  const prevAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  chars.forEach((ch, i) => {
    ctx.fillText(ch, curX, y);
    curX += widths[i] + spacing;
  });
  ctx.textAlign = prevAlign;
}

window.drawSpacedText = drawSpacedText;
