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

  // ── RATE LIMIT (rpm) ──────────────────────────────────────
  // Rasm-generatsiya modeli RPM limiti. Hisobingiz limitiga moslang.
  // Sizning limit: 500 RPM. Default 30 (tez + xavfsiz), UI'dan oshirsa bo'ladi.
  // localStorage 'GEMINI_IMG_RPM' orqali UI'dan o'zgartiriladi.
  function imgRpm() { return Math.max(1, parseInt(localStorage.getItem('GEMINI_IMG_RPM')) || 30); }
  const MAP_RPM = 60;   // Vision modeli (filtr) — kengroq

  // so'rov vaqtlarini kuzatib, RPM dan oshmaslik uchun kutadi
  const _gateTimes = { img: [], map: [] };
  async function rateGate(kind, rpm) {
    const arr = _gateTimes[kind];
    /* eslint-disable no-constant-condition */
    while (true) {
      const now = Date.now();
      while (arr.length && now - arr[0] >= 60000) arr.shift();
      if (arr.length < rpm) { arr.push(now); return; }
      const wait = 60000 - (now - arr[0]) + 60;
      await new Promise(r => setTimeout(r, wait));
    }
  }

  // 429/503 bo'lsa avtomatik qayta urinish (eksponensial backoff)
  async function fetchRetry(url, opts, kind, rpm, tries) {
    tries = tries || 5;
    for (let attempt = 0; attempt < tries; attempt++) {
      await rateGate(kind, rpm);
      const res = await fetch(url, opts);
      if (res.status !== 429 && res.status !== 503) return res;
      // limitга urildik — kutib qayta urinamiz
      let wait = Math.min(60000, 1500 * Math.pow(2, attempt));
      const ra = res.headers.get('retry-after');
      if (ra && !isNaN(+ra)) wait = Math.max(wait, (+ra) * 1000);
      console.warn(`[Gemini] ${res.status} rate-limit, ${Math.round(wait / 1000)}s kutyapti (urinish ${attempt + 1}/${tries})`);
      await new Promise(r => setTimeout(r, wait));
    }
    // oxirgi urinish (xato bo'lsa qaytaradi)
    await rateGate(kind, rpm);
    return fetch(url, opts);
  }

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

    const res = await fetchRetry(ENDPOINT(MODEL) + '?key=' + encodeURIComponent(key), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, 'map', MAP_RPM);

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
      "You are doing MINIMAL, conservative skin retouching on this portrait. " +
      "ONLY remove clearly temporary skin problems: active acne, pimples, " +
      "whiteheads, blackheads and obvious red inflammation. You MAY lightly reduce " +
      "very strong dark spots. DO NOTHING ELSE. " +
      "STRICT RULES — you MUST obey: do NOT smooth or blur the skin, do NOT even out " +
      "skin tone, do NOT remove natural texture, pores, freckles, moles or beauty " +
      "marks. Do NOT change the face shape, jaw, nose, eyes, eyebrows, lips, teeth, " +
      "expression, makeup, hair, skin color, lighting, pose, framing, head size or " +
      "background. Do NOT beautify, slim, brighten or 'improve' the face. Keep the " +
      "EXACT same person and the EXACT same image, only with active blemishes gone. " +
      "Return ONLY the edited photograph at the same dimensions.";

    const body = {
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: 'image/jpeg', data } },
        ],
      }],
    };

    const res = await fetchRetry(ENDPOINT(IMG_MODEL) + '?key=' + encodeURIComponent(key), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, 'img', imgRpm());

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
      if (btn) btn.textContent = '⏳ Yuz aniqlanmoqda...';
      const faceNorm = await getFaceNorm(base, idx);

      // Saqlanadigan hollar — QO'LDA belgilangan nuqtalar (ishonchli)
      const moles = moleBoxesFromPoints(base, faceNorm, student.keepMoles);

      if (btn) btn.textContent = '🪄 AI retush qilinmoqda...';
      // Yuz topilsa — kesib retush (yuqori sifat), aks holda butun rasm
      let retouched = faceNorm
        ? await geminiRetouchFace(base, faceNorm)
        : await geminiRetouch(base);

      // Belgilangan hollarni originaldan qaytarib qo'yamiz
      if (moles.length) {
        if (btn) btn.textContent = '⏳ Hollar qaytarilmoqda...';
        retouched = await restoreMoles(base, retouched, moles);
      }

      if (!student.origImg) student.origImg = student.img;
      student.img = retouched;
      if (student.img.__rt) delete student.img.__rt;
      if (typeof renderPreview === 'function') renderPreview();
      if (btn) { btn.textContent = '✓ Tayyor' + (moles.length ? ' (' + moles.length + ' hol saqlandi)' : ''); setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1800); }
    } catch (e) {
      alert('AI retush xatosi: ' + (e.message || e));
      if (btn) { btn.textContent = orig; btn.disabled = false; }
    }
  }

  // ── YUZNI KESIB RETUSH + QAYTA JOYLASH (yuqori sifat) ─────
  // Yuz sohasi kesilib Gemini'ga yuboriladi (detal yuqori), natija
  // original to'liq o'lchamli rasmga yumshoq chegara bilan qaytariladi.

  // Retush uchun KVADRAT yuz-crop (Gemini nisbatni buzmasligi uchun)
  function faceEditBox(img, faceNorm) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!faceNorm || !faceNorm.fh) return { x0: 0, y0: 0, cw: iw, ch: ih, full: true };
    const fhpx = faceNorm.fh * ih;
    const cxp = faceNorm.cx * iw;
    const cyp = faceNorm.cy * ih;
    let side = Math.min(iw, ih, fhpx * 1.9);
    let x0 = cxp - side / 2;
    let y0 = cyp - side * 0.52;            // peshonani ham qamrash uchun biroz yuqori
    x0 = Math.max(0, Math.min(iw - side, x0));
    y0 = Math.max(0, Math.min(ih - side, y0));
    return {
      x0: Math.round(x0), y0: Math.round(y0),
      cw: Math.round(side), ch: Math.round(side),
      fcx: cxp - x0, fcy: cyp - y0, fhpx, full: false,
    };
  }

  // TERI niqobi — faqat teri almashtirilsin (ko'z, lab, qosh, soch original qolsin)
  function buildSkinMask(srcData, w, h, fcx, fcy, rx, ry) {
    const out = document.createElement('canvas');
    out.width = w; out.height = h;
    const octx = out.getContext('2d');
    const md = octx.createImageData(w, h);
    const d = srcData;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const r = d[i], g = d[i + 1], b = d[i + 2];
        // teri ehtimoli (YCbCr, yumshoq)
        const Cb = -0.169 * r - 0.331 * g + 0.5 * b + 128;
        const Cr = 0.5 * r - 0.419 * g - 0.081 * b + 128;
        let skin = 1;
        if (Cr < 123) skin = 0;
        else if (Cr < 135) skin *= (Cr - 123) / 12;
        else if (Cr > 180) skin = (Cr > 192) ? 0 : skin * (192 - Cr) / 12;
        if (skin > 0) {
          if (Cb < 73) skin = 0;
          else if (Cb < 85) skin *= (Cb - 73) / 12;
          else if (Cb > 135) skin = (Cb > 147) ? 0 : skin * (147 - Cb) / 12;
        }
        // yuz ellipsi ichida (chetga yumshoq)
        const dx = (x - fcx) / rx, dy = (y - fcy) / ry;
        let e = 1 - (dx * dx + dy * dy);
        e = e <= 0 ? 0 : (e >= 0.35 ? 1 : e / 0.35);
        const m = Math.max(0, Math.min(1, skin)) * e;
        md.data[i] = 255; md.data[i + 1] = 255; md.data[i + 2] = 255;
        md.data[i + 3] = Math.round(m * 255);
      }
    }
    octx.putImageData(md, 0, 0);
    // niqobni yumshatish (feather) — chok bilinmasin, mayda teshiklar to'lsin
    const blurAmt = Math.max(3, Math.round(Math.min(w, h) * 0.02));
    const bl = document.createElement('canvas');
    bl.width = w; bl.height = h;
    const bctx = bl.getContext('2d');
    bctx.filter = `blur(${blurAmt}px)`;
    bctx.drawImage(out, 0, 0);
    return bl;
  }

  async function geminiRetouchFace(img, faceNorm) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const box = faceEditBox(img, faceNorm);

    // To'liq rasm (yuz topilmagan) — eski yo'l
    if (box.full) {
      const retouched = await geminiRetouch(img);
      const out = document.createElement('canvas');
      out.width = iw; out.height = ih;
      out.getContext('2d').drawImage(retouched, 0, 0, iw, ih);
      return await canvasToImage(out);
    }

    const S = box.cw;   // kvadrat tomoni

    // 1) Kvadrat yuz kropi (original o'lchamda)
    const crop = document.createElement('canvas');
    crop.width = S; crop.height = S;
    crop.getContext('2d').drawImage(img, box.x0, box.y0, S, S, 0, 0, S, S);

    // 2) Gemini retush (kvadrat -> nisbat buzilmaydi)
    const retouchedImg = await geminiRetouch(crop);

    // 3) Retushni aniq S×S ga keltiramiz
    const rcv = document.createElement('canvas');
    rcv.width = S; rcv.height = S;
    const rctx = rcv.getContext('2d');
    rctx.drawImage(retouchedImg, 0, 0, S, S);

    // 4) FARQ-ASOSLI minimal aralashtirish:
    //    faqat original va retush O'RTASIDAGI sezilarli farq (= olingan dog')
    //    bo'lgan teri piksellari almashtiriladi. Qolgan teri 100% ORIGINAL qoladi
    //    -> yuz o'zgarmaydi, faqat dog'lar ketadi.
    const ocv = document.createElement('canvas');
    ocv.width = S; ocv.height = S;
    const octx = ocv.getContext('2d');
    octx.drawImage(crop, 0, 0);
    const O = octx.getImageData(0, 0, S, S);
    const R = rctx.getImageData(0, 0, S, S);
    const od = O.data, rd = R.data;
    const rx = box.fhpx * 0.58, ry = box.fhpx * 0.74;
    const T0 = 14, T1 = 60;   // farq chegaralari (kichik farq = teginilmaydi)

    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const i = (y * S + x) * 4;
        const r = od[i], g = od[i + 1], b = od[i + 2];
        // teri ehtimoli (YCbCr)
        const Cb = -0.169 * r - 0.331 * g + 0.5 * b + 128;
        const Cr = 0.5 * r - 0.419 * g - 0.081 * b + 128;
        let skin = 1;
        if (Cr < 123) skin = 0;
        else if (Cr < 135) skin *= (Cr - 123) / 12;
        else if (Cr > 180) skin = (Cr > 192) ? 0 : skin * (192 - Cr) / 12;
        if (skin > 0) {
          if (Cb < 73) skin = 0;
          else if (Cb < 85) skin *= (Cb - 73) / 12;
          else if (Cb > 135) skin = (Cb > 147) ? 0 : skin * (147 - Cb) / 12;
        }
        if (skin <= 0) continue;                 // teri emas -> original qoladi
        // yuz ellipsi
        const ex = (x - box.fcx) / rx, ey = (y - box.fcy) / ry;
        let e = 1 - (ex * ex + ey * ey);
        e = e <= 0 ? 0 : (e >= 0.35 ? 1 : e / 0.35);
        if (e <= 0) continue;
        // original vs retush farqi (qancha o'zgargan = dog'mi)
        const dist = (Math.abs(r - rd[i]) + Math.abs(g - rd[i + 1]) + Math.abs(b - rd[i + 2])) / 3;
        let a = (dist - T0) / (T1 - T0);
        a = a <= 0 ? 0 : (a >= 1 ? 1 : a);
        a = a * a * (3 - 2 * a);
        const w2 = a * Math.min(1, skin) * e;
        if (w2 <= 0) continue;
        od[i]     = r + (rd[i] - r) * w2;
        od[i + 1] = g + (rd[i + 1] - g) * w2;
        od[i + 2] = b + (rd[i + 2] - b) * w2;
      }
    }
    octx.putImageData(O, 0, 0);

    // 5) To'liq o'lchamli rasmga qaytarib joylash
    const out = document.createElement('canvas');
    out.width = iw; out.height = ih;
    const fctx = out.getContext('2d');
    fctx.drawImage(img, 0, 0, iw, ih);
    fctx.drawImage(ocv, box.x0, box.y0);
    return await canvasToImage(out);
  }

  // ── HOLLARNI SAQLASH ──────────────────────────────────────
  // Retushdan keyin belgilangan hol joylarini ORIGINALDAN qaytaramiz.
  // MUHIM: butun dumaloq disk emas, faqat HOLNING O'ZI (atrofdan to'qroq
  // piksellar) qaytariladi — atrofdagi teri retush holicha qoladi, shuning
  // uchun dumaloq "yamoq" chegarasi ko'rinmaydi.
  async function restoreMoles(originalImg, resultImg, moles) {
    const ow = originalImg.naturalWidth || originalImg.width;
    const oh = originalImg.naturalHeight || originalImg.height;
    const rw = resultImg.naturalWidth || resultImg.width;
    const rh = resultImg.naturalHeight || resultImg.height;
    const out = document.createElement('canvas');
    out.width = rw; out.height = rh;
    const ctx = out.getContext('2d');
    ctx.drawImage(resultImg, 0, 0, rw, rh);

    const sxr = ow / rw, syr = oh / rh;
    moles.forEach(d => {
      const b = d.box_2d || [];
      if (b.length < 4) return;
      const rcx = ((b[1] + b[3]) / 2 / 1000) * rw;
      const rcy = ((b[0] + b[2]) / 2 / 1000) * rh;
      const rbw = ((b[3] - b[1]) / 1000) * rw;
      const rbh = ((b[2] - b[0]) / 1000) * rh;
      const rad = Math.max(5, Math.max(rbw, rbh) / 2 * 1.6);
      const dsize = Math.max(4, Math.round(rad * 2));
      const dx = Math.round(rcx - rad), dy = Math.round(rcy - rad);

      // originaldan shu zonani olamiz
      const tmp = document.createElement('canvas');
      tmp.width = dsize; tmp.height = dsize;
      const tctx = tmp.getContext('2d');
      tctx.drawImage(originalImg,
        dx * sxr, dy * syr, dsize * sxr, dsize * syr,
        0, 0, dsize, dsize);

      const im = tctx.getImageData(0, 0, dsize, dsize);
      const px = im.data;
      const c = dsize / 2;

      // atrofdagi SOG'LOM teri rangi va yorug'ligi (tashqi halqa)
      let bgSum = 0, bgR = 0, bgG = 0, bgB = 0, bgN = 0;
      for (let y = 0; y < dsize; y++) {
        for (let x = 0; x < dsize; x++) {
          const dist = Math.hypot(x - c, y - c);
          if (dist < rad * 0.6 || dist > rad * 0.98) continue;
          const i = (y * dsize + x) * 4;
          bgSum += 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
          bgR += px[i]; bgG += px[i + 1]; bgB += px[i + 2];
          bgN++;
        }
      }
      const bgL = bgN ? bgSum / bgN : 128;
      const mR = bgN ? bgR / bgN : 128, mG = bgN ? bgG / bgN : 128, mB = bgN ? bgB / bgN : 128;

      // har piksel: atrofdan TO'Q yoki RANGI farqli (= hol) bo'lsa qoldiramiz
      for (let y = 0; y < dsize; y++) {
        for (let x = 0; x < dsize; x++) {
          const i = (y * dsize + x) * 4;
          const dist = Math.hypot(x - c, y - c);
          let fr = 1 - (dist / rad);                  // radial yumshatish
          fr = fr <= 0 ? 0 : (fr >= 0.4 ? 1 : fr / 0.4);
          fr = fr * fr * (3 - 2 * fr);
          const r = px[i], g = px[i + 1], b = px[i + 2];
          const L = 0.299 * r + 0.587 * g + 0.114 * b;
          // to'qlik (qora hol) — pastroq chegara, ishonchli saqlash
          let lumDark = (bgL - L - 4) / 26;
          lumDark = lumDark <= 0 ? 0 : (lumDark >= 1 ? 1 : lumDark);
          // rang farqi (jigarrang hol)
          const cdist = (Math.abs(r - mR) + Math.abs(g - mG) + Math.abs(b - mB)) / 3;
          let cd = (cdist - 8) / 30;
          cd = cd <= 0 ? 0 : (cd >= 1 ? 1 : cd);
          let mn = Math.max(lumDark, cd);
          mn = mn * mn * (3 - 2 * mn);
          px[i + 3] = Math.round(fr * mn * 255);
        }
      }
      tctx.putImageData(im, 0, 0);
      ctx.drawImage(tmp, dx, dy);
    });

    return await canvasToImage(out);
  }

  // ── QO'LDA HOL BELGILASH (yuz crop + zoom + pan) ──────────
  let _moleStudent = null;
  let _moleImg = null;       // asl rasm
  let _moleView = null;      // ko'rsatilayotgan soha (original px): {x0,y0,w,h}
  let _moleFit = null;       // boshlang'ich (fit) soha — reset uchun
  let _moleDrag = null;      // pan/klik holati

  function moleCanvas() { return document.getElementById('gmpMoleCanvas'); }

  // to'liq-rasm normasi (nx,ny) -> canvas px (joriy view bo'yicha)
  function moleNormToCanvas(nx, ny, canvas) {
    const iw = _moleImg.naturalWidth || _moleImg.width;
    const ih = _moleImg.naturalHeight || _moleImg.height;
    const ox = nx * iw, oy = ny * ih;
    const fx = (ox - _moleView.x0) / _moleView.w;
    const fy = (oy - _moleView.y0) / _moleView.h;
    return { x: fx * canvas.width, y: fy * canvas.height, in: fx >= 0 && fx <= 1 && fy >= 0 && fy <= 1 };
  }

  function drawMoleMarker() {
    const canvas = moleCanvas();
    if (!canvas || !_moleStudent || !_moleView) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(_moleImg, _moleView.x0, _moleView.y0, _moleView.w, _moleView.h,
                  0, 0, canvas.width, canvas.height);
    (_moleStudent.keepMoles || []).forEach(p => {
      const c = moleNormToCanvas(p.nx, p.ny, canvas);
      if (!c.in) return;
      ctx.beginPath(); ctx.arc(c.x, c.y, 11, 0, Math.PI * 2);
      ctx.strokeStyle = '#39d98a'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = 'rgba(57,217,138,0.35)'; ctx.fill();
    });
    const zl = document.getElementById('gmpMoleZoomLabel');
    if (zl && _moleFit) zl.textContent = Math.round((_moleFit.w / _moleView.w) * 100) + '%';
  }

  function clampMoleView() {
    const iw = _moleImg.naturalWidth || _moleImg.width;
    const ih = _moleImg.naturalHeight || _moleImg.height;
    const v = _moleView;
    if (v.w > iw) v.w = iw;
    if (v.h > ih) v.h = ih;
    if (v.x0 < 0) v.x0 = 0;
    if (v.y0 < 0) v.y0 = 0;
    if (v.x0 + v.w > iw) v.x0 = iw - v.w;
    if (v.y0 + v.h > ih) v.y0 = ih - v.h;
  }

  function moleZoom(factor, cxCanvas, cyCanvas) {
    const canvas = moleCanvas();
    const iw = _moleImg.naturalWidth || _moleImg.width;
    const ih = _moleImg.naturalHeight || _moleImg.height;
    const v = _moleView;
    // kursor ostidagi original nuqta
    const px = v.x0 + (cxCanvas / canvas.width) * v.w;
    const py = v.y0 + (cyCanvas / canvas.height) * v.h;
    const minW = 40, maxW = Math.min(iw, _moleFit.w);   // fit'dan ko'p uzoqlashmaymiz
    let nw = v.w / factor;
    nw = Math.max(minW, Math.min(maxW, nw));
    const nh = nw * (v.h / v.w);
    v.x0 = px - (cxCanvas / canvas.width) * nw;
    v.y0 = py - (cyCanvas / canvas.height) * nh;
    v.w = nw; v.h = nh;
    clampMoleView();
    drawMoleMarker();
  }

  function setMoleCanvasSize() {
    const canvas = moleCanvas();
    const side = Math.max(280, Math.min(window.innerWidth * 0.62, window.innerHeight * 0.72, 820));
    canvas.width = Math.round(side);
    canvas.height = Math.round(side);   // yuz crop kvadrat
  }

  async function openMoleMarker() {
    const students = (window.AppState && window.AppState.students) || [];
    const idx = (window.AppState && window.AppState.currentPreviewIdx) || 0;
    const student = students[idx];
    if (!student || !student.img) { alert('Avval o\'quvchi rasmini yuklang.'); return; }

    const btn = document.getElementById('gmpMoleBtn');
    const bOrig = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Yuz aniqlanmoqda...'; }

    _moleStudent = student;
    _moleImg = student.origImg || student.img;
    if (!student.keepMoles) student.keepMoles = [];

    const iw = _moleImg.naturalWidth || _moleImg.width;
    const ih = _moleImg.naturalHeight || _moleImg.height;
    try {
      const faceNorm = await getFaceNorm(_moleImg, idx);
      const box = faceEditBox(_moleImg, faceNorm);
      _moleFit = box.full
        ? { x0: 0, y0: 0, w: iw, h: ih }
        : { x0: box.x0, y0: box.y0, w: box.cw, h: box.ch };
    } catch (e) {
      _moleFit = { x0: 0, y0: 0, w: iw, h: ih };
    }
    _moleView = { ..._moleFit };

    setMoleCanvasSize();
    drawMoleMarker();
    document.getElementById('gmpMoleOverlay').style.display = 'flex';
    if (btn) { btn.textContent = bOrig; btn.disabled = false; }
  }

  // klik = belgilash, sudrash = pan
  function moleDown(e) {
    if (!_moleStudent || !_moleView) return;
    const canvas = moleCanvas();
    const rect = canvas.getBoundingClientRect();
    _moleDrag = {
      sx: e.clientX, sy: e.clientY, moved: false,
      vx0: _moleView.x0, vy0: _moleView.y0,
      fx: canvas.width / rect.width, fy: canvas.height / rect.height,
    };
  }
  function moleMove(e) {
    if (!_moleDrag) return;
    const dx = e.clientX - _moleDrag.sx, dy = e.clientY - _moleDrag.sy;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) _moleDrag.moved = true;
    if (!_moleDrag.moved) return;
    const canvas = moleCanvas();
    _moleView.x0 = _moleDrag.vx0 - (dx * _moleDrag.fx) * (_moleView.w / canvas.width);
    _moleView.y0 = _moleDrag.vy0 - (dy * _moleDrag.fy) * (_moleView.h / canvas.height);
    clampMoleView();
    drawMoleMarker();
  }
  function moleUp(e) {
    if (!_moleDrag) return;
    const wasClick = !_moleDrag.moved;
    const canvas = moleCanvas();
    const rect = canvas.getBoundingClientRect();
    _moleDrag = null;
    if (!wasClick) return;
    // belgilash
    const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const cy = (e.clientY - rect.top) * (canvas.height / rect.height);
    const iw = _moleImg.naturalWidth || _moleImg.width;
    const ih = _moleImg.naturalHeight || _moleImg.height;
    const ox = _moleView.x0 + (cx / canvas.width) * _moleView.w;
    const oy = _moleView.y0 + (cy / canvas.height) * _moleView.h;
    const nx = ox / iw, ny = oy / ih;
    const pts = _moleStudent.keepMoles;
    const hitR = (16 / canvas.width) * (_moleView.w / iw);
    const i = pts.findIndex(p => Math.hypot(p.nx - nx, p.ny - ny) < hitR);
    if (i >= 0) pts.splice(i, 1);
    else pts.push({ nx, ny });
    drawMoleMarker();
  }
  function moleWheel(e) {
    if (!_moleView) return;
    e.preventDefault();
    const canvas = moleCanvas();
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const cy = (e.clientY - rect.top) * (canvas.height / rect.height);
    moleZoom(e.deltaY < 0 ? 1.2 : 1 / 1.2, cx, cy);
  }

  // keepMoles (nuqtalar) -> restoreMoles uchun box_2d (0..1000) ga aylantirish
  function moleBoxesFromPoints(img, faceNorm, pts) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const rPx = faceNorm && faceNorm.fh
      ? Math.max(6, faceNorm.fh * ih * 0.035)
      : Math.max(6, Math.min(iw, ih) * 0.014);
    return (pts || []).map(p => {
      const cx = p.nx * iw, cy = p.ny * ih;
      return {
        type: 'mole',
        box_2d: [
          (cy - rPx) / ih * 1000, (cx - rPx) / iw * 1000,
          (cy + rPx) / ih * 1000, (cx + rPx) / iw * 1000,
        ],
      };
    });
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

  // BATCH: hamma o'quvchini avtomatik retush + toza yuzlarni o'tkazib yuborish
  // Parallel (bir vaqtda bir nechta) — tezroq, lekin API limitiga urilmaslik uchun cheklangan.
  async function autoRetouchAll() {
    const btn = document.getElementById('gmpBatchBtn');
    const students = (window.AppState && window.AppState.students) || [];
    if (!students.length) { alert('Avval o\'quvchi rasmlarini yuklang.'); return; }

    if (!getKey()) {
      const k = prompt('Gemini API kalitini kiriting (faqat shu brauzerда saqlanadi):');
      if (!k) return;
      setKey(k); syncKeyUI();
    }

    const orig = btn ? btn.textContent : '';
    if (btn) btn.disabled = true;

    // Yuz modelini oldindan bir marta yuklab olamiz (parallel ishda takror yuklanmasin)
    if (typeof faceapi !== 'undefined' && !window._faceModelsLoaded) {
      try {
        if (btn) btn.textContent = '⏳ Model yuklanmoqda...';
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model');
        window._faceModelsLoaded = true;
      } catch (e) {}
    }

    const total = students.length;
    let next = 0, done = 0, cleaned = 0, skipped = 0, failed = 0;
    const update = () => { if (btn) btn.textContent = `⏳ ${done}/${total} (✓${cleaned} ⏭${skipped})`; };
    update();

    async function processOne(i) {
      const s = students[i];
      if (!s || !s.img) return;
      try {
        const base = s.origImg || s.img;
        const faceNorm = await getFaceNorm(base, i);
        // FILTR: dog' bormi? (arzon mapping) — toza bo'lsa generatsiya QILINMAYDI
        let dets = [];
        try { dets = await mapBlemishes(base, faceNorm); } catch (e) {}
        const significant = dets.filter(d => d.type !== 'mole' && (d.severity || 2) >= 2);
        if (significant.length === 0) { skipped++; return; }
        // tozalash kerak -> retush
        let retouched = faceNorm
          ? await geminiRetouchFace(base, faceNorm)
          : await geminiRetouch(base);
        const moles = moleBoxesFromPoints(base, faceNorm, s.keepMoles);
        if (moles.length) retouched = await restoreMoles(base, retouched, moles);
        if (!s.origImg) s.origImg = s.img;
        s.img = retouched;
        if (s.img.__rt) delete s.img.__rt;
        cleaned++;
      } catch (e) {
        failed++;
        console.warn('Batch retush xatosi (rasm ' + (i + 1) + '):', e);
      }
    }

    // Bir vaqtda 6 tadan ishlovchi "pool"
    const CONCURRENCY = 6;
    async function worker() {
      while (true) {
        const i = next++;
        if (i >= total) break;
        await processOne(i);
        done++; update();
        if (typeof renderPreview === 'function') { window.AppState.currentPreviewIdx = i; renderPreview(); }
      }
    }
    const workers = [];
    for (let w = 0; w < Math.min(CONCURRENCY, total); w++) workers.push(worker());
    await Promise.all(workers);

    if (typeof renderPreview === 'function') renderPreview();
    if (btn) { btn.textContent = orig; btn.disabled = false; }
    alert('Tayyor!\n✓ Tozalandi: ' + cleaned +
          '\n⏭ Toza (o\'tkazildi): ' + skipped +
          (failed ? '\n⚠ Xato: ' + failed : '') +
          '\n\nGeneratsiya faqat ' + cleaned + ' ta rasmga ishlatildi.');
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

    const rpmInput = document.getElementById('gmpRpmInput');
    if (rpmInput) {
      rpmInput.value = imgRpm();
      rpmInput.addEventListener('change', () => {
        const v = Math.max(1, Math.min(120, parseInt(rpmInput.value) || 2));
        localStorage.setItem('GEMINI_IMG_RPM', String(v));
        rpmInput.value = v;
      });
    }

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

    const batchBtn = document.getElementById('gmpBatchBtn');
    if (batchBtn) batchBtn.addEventListener('click', autoRetouchAll);

    const moleBtn = document.getElementById('gmpMoleBtn');
    if (moleBtn) moleBtn.addEventListener('click', openMoleMarker);
    const moleCv = document.getElementById('gmpMoleCanvas');
    if (moleCv) {
      moleCv.addEventListener('mousedown', moleDown);
      window.addEventListener('mousemove', moleMove);
      window.addEventListener('mouseup', moleUp);
      moleCv.addEventListener('wheel', moleWheel, { passive: false });
    }
    const mzIn = document.getElementById('gmpMoleZoomIn');
    if (mzIn) mzIn.addEventListener('click', () => moleZoom(1.25, moleCanvas().width / 2, moleCanvas().height / 2));
    const mzOut = document.getElementById('gmpMoleZoomOut');
    if (mzOut) mzOut.addEventListener('click', () => moleZoom(1 / 1.25, moleCanvas().width / 2, moleCanvas().height / 2));
    const mzRst = document.getElementById('gmpMoleZoomReset');
    if (mzRst) mzRst.addEventListener('click', () => { if (_moleFit) { _moleView = { ..._moleFit }; drawMoleMarker(); } });
    window.addEventListener('resize', () => {
      if (document.getElementById('gmpMoleOverlay').style.display === 'flex') { setMoleCanvasSize(); drawMoleMarker(); }
    });
    const moleClose = document.getElementById('gmpMoleClose');
    if (moleClose) moleClose.addEventListener('click', () => {
      document.getElementById('gmpMoleOverlay').style.display = 'none';
    });
    const moleSave = document.getElementById('gmpMoleSave');
    if (moleSave) moleSave.addEventListener('click', () => {
      document.getElementById('gmpMoleOverlay').style.display = 'none';
    });
    const moleClear = document.getElementById('gmpMoleClear');
    if (moleClear) moleClear.addEventListener('click', () => {
      if (_moleStudent) _moleStudent.keepMoles = [];
      drawMoleMarker();
    });

    syncKeyUI();
  });

  window.GeminiMap = { mapBlemishes, getFaceNorm, healSpots, applyHeal, revertHeal, geminiRetouch, geminiRetouchFace, restoreMoles, openMoleMarker, applyAiRetouch, autoRetouchAll, getKey, setKey };
})();
