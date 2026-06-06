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
