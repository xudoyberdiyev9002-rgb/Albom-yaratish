/**
 * gemini.js
 * Gemini "mapping" (dog'/husnbuzar/shram aniqlash) — TEST bosqichi.
 *
 * Bu bosqichda rasm GENERATSIYA QILINMAYDI. Faqat Gemini Vision'dan
 * dog'lar QAYERDA ekanini (bounding box) so'raymiz — arzon va tez.
 *
 * Aniqlikni oshirish uchun rasm avval YUZ sohasiga kesiladi (crop):
 *   - yuzdan tashqaridagi soxta belgilar yo'qoladi
 *   - yuz kadrni to'ldiradi -> mayda husnbuzarlar ham ko'rinadi
 *
 * API kalit faqat brauzerda (localStorage) saqlanadi, kodga yozilmaydi.
 */

(function () {
  'use strict';

  const KEY_LS = 'GEMINI_API_KEY';
  // Vision (tahlil) uchun arzon, tez model
  const MODEL = 'gemini-2.5-flash';
  // Rasm tahrirlash (retush) modeli — Nano Banana
  const IMG_MODEL = 'gemini-2.5-flash-image';
  const ENDPOINT = m =>
    `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`;

  // ── Kalit boshqaruvi ──────────────────────────────────────
  function getKey() {
    return (localStorage.getItem(KEY_LS) || '').trim();
  }
  function setKey(v) {
    if (v && v.trim()) localStorage.setItem(KEY_LS, v.trim());
    else localStorage.removeItem(KEY_LS);
  }

  // ── Yuz sohasini aniqlash ─────────────────────────────────
  // Avval AppState.faces[idx] dan, bo'lmasa face-api bilan aniqlaymiz.
  async function getFaceNorm(img, idx) {
    const f = window.AppState && window.AppState.faces && window.AppState.faces[idx];
    if (f && f.fh) return f;
    if (typeof faceapi === 'undefined') return null;
    try {
      if (!window._faceModelsLoaded) {
        await faceapi.nets.tinyFaceDetector.loadFromUri(
          'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model');
        window._faceModelsLoaded = true;
      }
      const opt = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 });
      const det = await faceapi.detectSingleFace(img, opt);
      if (det && det.box) {
        const iw = img.naturalWidth || img.width;
        const ih = img.naturalHeight || img.height;
        const b = det.box;
        const norm = {
          cx: (b.x + b.width / 2) / iw,
          cy: (b.y + b.height / 2) / ih,
          fh: b.height / ih,
        };
        if (window.AppState && window.AppState.faces) window.AppState.faces[idx] = norm;
        return norm;
      }
    } catch (e) { /* fallback */ }
    return null;
  }

  // Yuz normalga qarab crop to'rtburchagini (manba px) hisoblaydi
  function faceCropBox(img, faceNorm) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!faceNorm || !faceNorm.fh) return { x0: 0, y0: 0, cw: iw, ch: ih, full: true };
    const fhpx = faceNorm.fh * ih;
    const cxp = faceNorm.cx * iw;
    const cyp = faceNorm.cy * ih;
    const cw = Math.min(iw, fhpx * 1.5);
    const ch = Math.min(ih, fhpx * 1.8);
    let x0 = cxp - cw / 2;
    let y0 = cyp - ch * 0.52;            // peshonani ham qamrash uchun biroz yuqori
    x0 = Math.max(0, Math.min(iw - cw, x0));
    y0 = Math.max(0, Math.min(ih - ch, y0));
    return { x0, y0, cw, ch, full: false };
  }

  // ── Rasmni (yoki crop'ni) base64 JPEG ga aylantirish ──────
  function regionToBase64(img, box, maxSide) {
    const scale = Math.min(1, (maxSide || 1024) / Math.max(box.cw, box.ch));
    const w = Math.max(1, Math.round(box.cw * scale));
    const h = Math.max(1, Math.round(box.ch * scale));
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.getContext('2d').drawImage(img, box.x0, box.y0, box.cw, box.ch, 0, 0, w, h);
    const dataUrl = c.toDataURL('image/jpeg', 0.92);
    return dataUrl.split(',')[1];
  }

  // ── Gemini'ga so'rov: dog'larni aniqlash ──────────────────
  async function mapBlemishes(img, faceNorm) {
    const key = getKey();
    if (!key) throw new Error('API kalit kiritilmagan');

    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const box = faceCropBox(img, faceNorm);
    const data = regionToBase64(img, box, 1024);

    const prompt =
      "This image is a CLOSE-UP CROP of a single human face. Carefully and thoroughly " +
      "inspect the facial skin and detect EVERY imperfection a professional studio " +
      "retoucher would remove: acne, pimples, whiteheads, blackheads, dark spots, " +
      "hyperpigmentation, scars, prominent moles, skin redness/irritation and uneven " +
      "blotches. Look closely on the forehead, both cheeks, nose, chin and jaw. " +
      "Detect even small or faint ones. STRICT RULES: only mark spots ON the facial " +
      "skin. Do NOT mark eyes, eyebrows, eyelashes, nostrils, lips, teeth, hair, " +
      "ears, neck, clothing or background. " +
      "Return ONLY a JSON array (no prose). Each item: " +
      '{"box_2d":[ymin,xmin,ymax,xmax] normalized 0-1000 of THIS cropped image, ' +
      '"type":"acne|dark_spot|scar|mole|redness|blemish", "severity":1-5}. ' +
      "If the skin is genuinely flawless return [].";

    const body = {
      contents: [{
        parts: [
          { inline_data: { mime_type: 'image/jpeg', data } },
          { text: prompt },
        ],
      }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0 },
    };

    const res = await fetch(ENDPOINT(MODEL) + '?key=' + encodeURIComponent(key), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error('Gemini xato (' + res.status + '): ' + t.slice(0, 200));
    }

    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('[GeminiMap] matn javob:', text);

    let parsed;
    try { parsed = JSON.parse(text); }
    catch (e) {
      const m = text.match(/\[[\s\S]*\]/);
      parsed = m ? JSON.parse(m[0]) : [];
    }
    let arr = parsed;
    if (!Array.isArray(arr) && arr && typeof arr === 'object') {
      arr = Object.values(arr).find(v => Array.isArray(v)) || [];
    }
    if (!Array.isArray(arr)) arr = [];

    // ── crop koordinatalarini TO'LIQ rasm 0..1000 ga aylantirish ──
    const toFull = b => {
      const cyMin = box.y0 + (b[0] / 1000) * box.ch;
      const cxMin = box.x0 + (b[1] / 1000) * box.cw;
      const cyMax = box.y0 + (b[2] / 1000) * box.ch;
      const cxMax = box.x0 + (b[3] / 1000) * box.cw;
      return [
        (cyMin / ih) * 1000, (cxMin / iw) * 1000,
        (cyMax / ih) * 1000, (cxMax / iw) * 1000,
      ];
    };

    // ── yuz ellipsidan tashqaridagi soxta belgilarni tashlash ──
    let cxp, cyp, rx, ry;
    if (faceNorm && faceNorm.fh) {
      cxp = faceNorm.cx * iw; cyp = faceNorm.cy * ih;
      rx = faceNorm.fh * ih * 0.62; ry = faceNorm.fh * ih * 0.78;
    }
    const inFace = b => {
      if (!faceNorm || !faceNorm.fh) return true;
      const mx = ((b[1] + b[3]) / 2 / 1000) * iw;
      const my = ((b[0] + b[2]) / 2 / 1000) * ih;
      const dx = (mx - cxp) / rx, dy = (my - cyp) / ry;
      return dx * dx + dy * dy <= 1;
    };

    const out = [];
    arr.forEach(d => {
      const b = d.box_2d || d.box || [];
      if (b.length < 4) return;
      const full = box.full ? b : toFull(b);
      if (!inFace(full)) return;                 // yuzdan tashqari -> tashlanadi
      out.push({ box_2d: full, type: d.type || 'blemish', severity: d.severity || 2 });
    });

    console.log('[GeminiMap] yuzdagi dog\'lar (filtrlangandan keyin):', out.length);
    return out;
  }

  // ── PHOTOSHOP USLUBIDAGI SPOT-HEALING ────────────────────
  // Har bir dog' uchun: atrofdagi sog'lom teridan tekstura olib,
  // rangni dog' chetidagi teriga moslaymiz (healing brush mantiqi).

  // Disk ichidagi o'rtacha rang (radius px)
  function discMean(d, w, h, cx, cy, r) {
    let sr = 0, sg = 0, sb = 0, n = 0;
    const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(w - 1, Math.ceil(cx + r));
    const y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(h - 1, Math.ceil(cy + r));
    const r2 = r * r;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x - cx, dy = y - cy;
        if (dx * dx + dy * dy > r2) continue;
        const i = (y * w + x) * 4;
        sr += d[i]; sg += d[i + 1]; sb += d[i + 2]; n++;
      }
    }
    return n ? { r: sr / n, g: sg / n, b: sb / n, n } : null;
  }

  // Halqa (annulus) o'rtachasi — dog' atrofidagi SOG'LOM teri rangi
  function ringMean(d, w, h, cx, cy, rIn, rOut) {
    let sr = 0, sg = 0, sb = 0, n = 0;
    const x0 = Math.max(0, Math.floor(cx - rOut)), x1 = Math.min(w - 1, Math.ceil(cx + rOut));
    const y0 = Math.max(0, Math.floor(cy - rOut)), y1 = Math.min(h - 1, Math.ceil(cy + rOut));
    const i2 = rIn * rIn, o2 = rOut * rOut;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x - cx, dy = y - cy, dd = dx * dx + dy * dy;
        if (dd < i2 || dd > o2) continue;
        const i = (y * w + x) * 4;
        sr += d[i]; sg += d[i + 1]; sb += d[i + 2]; n++;
      }
    }
    return n ? { r: sr / n, g: sg / n, b: sb / n, n } : null;
  }

  // Disk ichidagi yorug'lik dispersiyasi (kichik = toza, tekis teri)
  function discVariance(d, w, h, cx, cy, r, targetMean) {
    let s = 0, n = 0;
    const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(w - 1, Math.ceil(cx + r));
    const y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(h - 1, Math.ceil(cy + r));
    const r2 = r * r;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x - cx, dy = y - cy;
        if (dx * dx + dy * dy > r2) continue;
        const i = (y * w + x) * 4;
        const L = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        s += L; n++;
      }
    }
    if (!n) return Infinity;
    const m = s / n;
    let v = 0;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x - cx, dy = y - cy;
        if (dx * dx + dy * dy > r2) continue;
        const i = (y * w + x) * 4;
        const L = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        v += (L - m) * (L - m);
      }
    }
    let penalty = 0;
    if (targetMean) {
      penalty = Math.abs(m - (0.299 * targetMean.r + 0.587 * targetMean.g + 0.114 * targetMean.b)) * 1.5;
    }
    return v / n + penalty * penalty;
  }

  // Eng toza manba yo'nalishini topish (8 yo'nalish)
  function findCleanSource(d, w, h, cx, cy, r, borderMean) {
    const dist = r * 2.3;
    const dirs = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7],
    ];
    let best = null, bestScore = Infinity;
    for (const [ux, uy] of dirs) {
      const sx = cx + ux * dist, sy = cy + uy * dist;
      if (sx - r < 0 || sx + r >= w || sy - r < 0 || sy + r >= h) continue;
      const score = discVariance(d, w, h, sx, sy, r, borderMean);
      if (score < bestScore) { bestScore = score; best = { ox: ux * dist, oy: uy * dist }; }
    }
    return best;
  }

  // Bitta dog'ni davolash (in-place, feather aralashtirish) — snapshot versiya quyida
  // healSpotsFromSnap() ishlatiladi.

  // Hamma dog'larni tozalab, healed canvas qaytaradi
  function healSpots(img, dets, maxSide) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const scale = Math.min(1, (maxSide || 2400) / Math.max(iw, ih));
    const w = Math.max(1, Math.round(iw * scale));
    const h = Math.max(1, Math.round(ih * scale));
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);

    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;
    // manba o'qishlari original pikseldan bo'lishi uchun snapshot
    const snap = new Uint8ClampedArray(d);

    // kichikdan kattaga tartiblash (kichik dog'larni avval)
    const sorted = dets.slice().sort((a, b) => {
      const ar = (a.box_2d[2] - a.box_2d[0]) + (a.box_2d[3] - a.box_2d[1]);
      const br = (b.box_2d[2] - b.box_2d[0]) + (b.box_2d[3] - b.box_2d[1]);
      return ar - br;
    });

    sorted.forEach(det => {
      const b = det.box_2d;
      const cx = ((b[1] + b[3]) / 2 / 1000) * w;
      const cy = ((b[0] + b[2]) / 2 / 1000) * h;
      const bw = ((b[3] - b[1]) / 1000) * w;
      const bh = ((b[2] - b[0]) / 1000) * h;
      let r = Math.max(bw, bh) / 2;
      r = Math.max(2.5, Math.min(r * 1.15, Math.min(w, h) * 0.06)); // min/max chegaralar
      healSpotsFromSnap(d, snap, w, h, cx, cy, r);
    });

    ctx.putImageData(imgData, 0, 0);
    return c;
  }

  // healOne ning snapshot versiyasi (manba = original snap, yozish = d)
  function healSpotsFromSnap(d, snap, w, h, cx, cy, r) {
    const borderMean = ringMean(snap, w, h, cx, cy, r * 1.05, r * 1.6);
    const src = findCleanSource(snap, w, h, cx, cy, r, borderMean);
    if (!src || !borderMean) return;
    const srcMean = discMean(snap, w, h, cx + src.ox, cy + src.oy, r);
    if (!srcMean) return;
    const dr = borderMean.r - srcMean.r;
    const dg = borderMean.g - srcMean.g;
    const db = borderMean.b - srcMean.b;

    const rad = r * 1.25, r2 = rad * rad;
    const x0 = Math.max(0, Math.floor(cx - rad)), x1 = Math.min(w - 1, Math.ceil(cx + rad));
    const y0 = Math.max(0, Math.floor(cy - rad)), y1 = Math.min(h - 1, Math.ceil(cy + rad));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x - cx, dy = y - cy, dd = dx * dx + dy * dy;
        if (dd > r2) continue;
        const dn = Math.sqrt(dd) / rad;
        let wgt = dn < 0.65 ? 1 : 1 - (dn - 0.65) / 0.35;
        wgt = wgt < 0 ? 0 : wgt * wgt * (3 - 2 * wgt);
        const sxp = Math.round(x + src.ox), syp = Math.round(y + src.oy);
        if (sxp < 0 || sxp >= w || syp < 0 || syp >= h) continue;
        const si = (syp * w + sxp) * 4, ti = (y * w + x) * 4;
        const nr = snap[si] + dr, ng = snap[si + 1] + dg, nb = snap[si + 2] + db;
        d[ti]     = d[ti]     + (nr - d[ti]) * wgt;
        d[ti + 1] = d[ti + 1] + (ng - d[ti + 1]) * wgt;
        d[ti + 2] = d[ti + 2] + (nb - d[ti + 2]) * wgt;
      }
    }
  }

  // canvas -> Image (student.img o'rniga qo'yish uchun)
  function canvasToImage(canvas) {
    return new Promise(res => {
      const im = new Image();
      im.onload = () => res(im);
      im.src = canvas.toDataURL('image/jpeg', 0.95);
    });
  }

  // ── NANO BANANA: AI retush (image editing / generatsiya) ──
  // Butun portretni Gemini'ga yuboramiz, faqat teri retush qilinadi,
  // shaxs/yuz/fon o'zgarmaydi. Javobda tahrirlangan rasm qaytadi.
  function imgToDataB64(img, maxSide) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const scale = Math.min(1, (maxSide || 1280) / Math.max(iw, ih));
    const w = Math.max(1, Math.round(iw * scale));
    const h = Math.max(1, Math.round(ih * scale));
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.getContext('2d').drawImage(img, 0, 0, w, h);
    return c.toDataURL('image/jpeg', 0.95).split(',')[1];
  }

  async function geminiRetouch(img) {
    const key = getKey();
    if (!key) throw new Error('API kalit kiritilmagan');

    const data = imgToDataB64(img, 1280);

    const prompt =
      "Retouch this portrait like a professional studio photo retoucher working in " +
      "Photoshop. Remove acne, pimples, blackheads, dark spots, hyperpigmentation, " +
      "scars, prominent moles and skin redness from the facial skin. Leave smooth, " +
      "clean, natural and healthy-looking skin that still keeps realistic texture and " +
      "pores (NOT plastic or over-smoothed). CRITICAL: keep the exact same person — do " +
      "not change identity, facial features, face shape, expression, skin tone, makeup, " +
      "hair, clothing, pose, lighting or background. Do not slim or beautify. " +
      "Return ONLY the edited photograph.";

    const body = {
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: 'image/jpeg', data } },
        ],
      }],
    };

    const res = await fetch(ENDPOINT(IMG_MODEL) + '?key=' + encodeURIComponent(key), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error('Gemini xato (' + res.status + '): ' + t.slice(0, 300));
    }

    const json = await res.json();
    const parts = json?.candidates?.[0]?.content?.parts || [];
    let b64 = null, mime = 'image/png';
    for (const p of parts) {
      const inl = p.inlineData || p.inline_data;
      if (inl && inl.data) { b64 = inl.data; mime = inl.mimeType || inl.mime_type || mime; break; }
    }
    if (!b64) {
      const txt = parts.map(p => p.text).filter(Boolean).join(' ');
      throw new Error('Rasm qaytmadi. Javob: ' + (txt || JSON.stringify(json).slice(0, 200)));
    }

    return await new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error('Qaytgan rasm yuklanmadi'));
      im.src = 'data:' + mime + ';base64,' + b64;
    });
  }

  // AI retush'ni joriy o'quvchiga qo'llash
  async function applyAiRetouch() {
    const btn = document.getElementById('gmpAiBtn');
    const students = (window.AppState && window.AppState.students) || [];
    const idx = (window.AppState && window.AppState.currentPreviewIdx) || 0;
    const student = students[idx];
    if (!student || !student.img) { alert('Avval o\'quvchi rasmini yuklang.'); return; }

    if (!getKey()) {
      const k = prompt('Gemini API kalitini kiriting (faqat shu brauzerда saqlanadi):');
      if (!k) return;
      setKey(k); syncKeyUI();
    }

    const orig = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = '🪄 AI retush qilinmoqda...'; }
    try {
      const base = student.origImg || student.img;     // har doim asldan ishlaymiz
      const retouched = await geminiRetouch(base);
      if (!student.origImg) student.origImg = student.img;
      student.img = retouched;
      if (student.img.__rt) delete student.img.__rt;
      if (typeof renderPreview === 'function') renderPreview();
      if (btn) { btn.textContent = '✓ Tayyor'; setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1500); }
    } catch (e) {
      alert('AI retush xatosi: ' + (e.message || e));
      if (btn) { btn.textContent = orig; btn.disabled = false; }
    }
  }

  // ── Natijani modalda ko'rsatish (rasm + belgilar) ─────────
  function showResult(img, dets) {
    const overlay = document.getElementById('gmpOverlay');
    const canvas = document.getElementById('gmpCanvas');
    const info = document.getElementById('gmpInfo');
    if (!overlay || !canvas) return;

    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const maxSide = 520;
    const scale = Math.min(1, maxSide / Math.max(iw, ih));
    const w = Math.round(iw * scale), h = Math.round(ih * scale);
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);

    const colors = {
      acne: '#ff4d4d', dark_spot: '#ffb020', scar: '#9b5de5',
      mole: '#00bbf9', redness: '#ff6f91', blemish: '#39ff14',
    };

    dets.forEach((d, i) => {
      const b = d.box_2d || [];
      if (b.length < 4) return;
      const x = (b[1] / 1000) * w;
      const y = (b[0] / 1000) * h;
      const bw = ((b[3] - b[1]) / 1000) * w;
      const bh = ((b[2] - b[0]) / 1000) * h;
      const cx = x + bw / 2, cy = y + bh / 2;
      const col = colors[d.type] || '#39ff14';
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
      const rad = Math.max(11, bw / 2, bh / 2);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = col;
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(String(i + 1), cx + rad + 2, cy + 4);
      ctx.fillStyle = col;
      ctx.fillText(String(i + 1), cx + rad + 1, cy + 3);
    });

    const counts = {};
    dets.forEach(d => { counts[d.type] = (counts[d.type] || 0) + 1; });
    info.innerHTML = dets.length
      ? 'Topildi: <b>' + dets.length + '</b> ta — ' +
        Object.entries(counts).map(([k, v]) => k + ': ' + v).join(', ')
      : '✓ Teri toza — dog\' topilmadi (generatsiya shart emas)';

    // heal tugmasi holati
    const healBtn = document.getElementById('gmpHealBtn');
    if (healBtn) healBtn.disabled = !dets.length;

    overlay.style.display = 'flex';
  }

  // ── Healing'ni joriy o'quvchiga qo'llash ──────────────────
  async function applyHeal() {
    const last = window._gmpLast;
    if (!last || !last.dets || !last.dets.length) return;
    const students = (window.AppState && window.AppState.students) || [];
    const student = students[last.idx];
    if (!student || !student.img) return;

    const healBtn = document.getElementById('gmpHealBtn');
    const orig = healBtn ? healBtn.textContent : '';
    if (healBtn) { healBtn.disabled = true; healBtn.textContent = '⏳ Tozalanmoqda...'; }
    try {
      const healedCanvas = healSpots(student.img, last.dets, 2400);
      const healedImg = await canvasToImage(healedCanvas);
      // asl rasmni saqlab qo'yamiz (qaytarish uchun)
      if (!student.origImg) student.origImg = student.img;
      student.img = healedImg;
      // dog' keshini tozalash (rtSpotHeal kabi)
      if (student.img.__rt) delete student.img.__rt;
      if (typeof renderPreview === 'function') renderPreview();
      const overlay = document.getElementById('gmpOverlay');
      if (overlay) overlay.style.display = 'none';
      alert('✓ ' + last.dets.length + ' ta dog\' tozalandi. Preview yangilandi.');
    } catch (e) {
      alert('Healing xatosi: ' + (e.message || e));
    } finally {
      if (healBtn) { healBtn.textContent = orig; healBtn.disabled = false; }
    }
  }

  // Joriy o'quvchini asl holatiga qaytarish
  function revertHeal() {
    const idx = (window.AppState && window.AppState.currentPreviewIdx) || 0;
    const student = window.AppState.students[idx];
    if (student && student.origImg) {
      student.img = student.origImg;
      delete student.origImg;
      if (typeof renderPreview === 'function') renderPreview();
      alert('↩︎ Asl rasm qaytarildi.');
    } else {
      alert('Bu rasm hali tozalanmagan.');
    }
  }

  // ── Tugma bosilganda ──────────────────────────────────────
  async function onMapClick() {
    const btn = document.getElementById('gmpBtn');
    const students = (window.AppState && window.AppState.students) || [];
    const idx = (window.AppState && window.AppState.currentPreviewIdx) || 0;
    const student = students[idx];
    if (!student || !student.img) { alert('Avval o\'quvchi rasmini yuklang.'); return; }

    if (!getKey()) {
      const k = prompt('Gemini API kalitini kiriting (faqat shu brauzerда saqlanadi):');
      if (!k) return;
      setKey(k);
      syncKeyUI();
    }

    const orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ Yuz aniqlanmoqda...';
    try {
      const faceNorm = await getFaceNorm(student.img, idx);
      btn.textContent = '⏳ Dog\'lar tahlil qilinmoqda...';
      const dets = await mapBlemishes(student.img, faceNorm);
      window._gmpLast = { idx, dets };
      showResult(student.img, dets);
    } catch (e) {
      alert('Mapping xatosi: ' + (e.message || e));
    } finally {
      btn.disabled = false;
      btn.textContent = orig;
    }
  }

  function syncKeyUI() {
    const has = !!getKey();
    const st = document.getElementById('gmpKeyStatus');
    if (st) {
      st.textContent = has ? '✓ Kalit saqlangan' : 'Kalit kiritilmagan';
      st.style.color = has ? '#39d98a' : '#ff6f91';
    }
  }

  // ── DOM tayyor ────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('gmpBtn');
    if (btn) btn.addEventListener('click', onMapClick);

    const saveBtn = document.getElementById('gmpKeySave');
    const keyInput = document.getElementById('gmpKeyInput');
    if (saveBtn && keyInput) {
      saveBtn.addEventListener('click', () => { setKey(keyInput.value); keyInput.value = ''; syncKeyUI(); });
    }
    const clearBtn = document.getElementById('gmpKeyClear');
    if (clearBtn) clearBtn.addEventListener('click', () => { setKey(''); syncKeyUI(); });

    const close = document.getElementById('gmpClose');
    if (close) close.addEventListener('click', () => {
      document.getElementById('gmpOverlay').style.display = 'none';
    });

    const healBtn = document.getElementById('gmpHealBtn');
    if (healBtn) healBtn.addEventListener('click', applyHeal);

    const revertBtn = document.getElementById('gmpRevertBtn');
    if (revertBtn) revertBtn.addEventListener('click', revertHeal);

    const aiBtn = document.getElementById('gmpAiBtn');
    if (aiBtn) aiBtn.addEventListener('click', applyAiRetouch);

    syncKeyUI();
  });

  window.GeminiMap = { mapBlemishes, getFaceNorm, healSpots, applyHeal, revertHeal, geminiRetouch, applyAiRetouch, getKey, setKey };
})();
