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

    overlay.style.display = 'flex';
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

    syncKeyUI();
  });

  window.GeminiMap = { mapBlemishes, getFaceNorm, getKey, setKey };
})();
