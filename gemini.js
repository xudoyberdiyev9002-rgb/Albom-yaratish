/**
 * gemini.js
 * Gemini "mapping" (dog'/husnbuzar/shram aniqlash) — TEST bosqichi.
 *
 * Bu bosqichda rasm GENERATSIYA QILINMAYDI. Faqat Gemini Vision'dan
 * dog'lar QAYERDA ekanini (bounding box) so'raymiz — arzon va tez.
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

  // ── Rasmni base64 JPEG ga aylantirish (max o'lcham bilan) ──
  function imgToBase64(img, maxSide) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const scale = Math.min(1, (maxSide || 768) / Math.max(iw, ih));
    const w = Math.max(1, Math.round(iw * scale));
    const h = Math.max(1, Math.round(ih * scale));
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.getContext('2d').drawImage(img, 0, 0, w, h);
    const dataUrl = c.toDataURL('image/jpeg', 0.9);
    return { data: dataUrl.split(',')[1], w, h };
  }

  // ── Gemini'ga so'rov: dog'larni aniqlash ──────────────────
  async function mapBlemishes(img) {
    const key = getKey();
    if (!key) throw new Error('API kalit kiritilmagan');

    const { data } = imgToBase64(img, 768);

    const prompt =
      "You are a professional photo-retouching assistant. Analyze ONLY the human " +
      "facial skin in this portrait. Detect blemishes that a studio retoucher would " +
      "remove: acne/pimples, dark spots, scars, moles, and noticeable redness. " +
      "Do NOT include eyes, eyebrows, nostrils, lips, hair or natural shadows. " +
      "Return STRICT JSON: an array of objects with keys " +
      '"box_2d" ([ymin,xmin,ymax,xmax] normalized 0-1000), ' +
      '"type" (one of "acne","dark_spot","scar","mole","redness"), ' +
      '"severity" (1-5). If skin is clean, return [].';

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
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    let arr;
    try { arr = JSON.parse(text); }
    catch (e) {
      const m = text.match(/\[[\s\S]*\]/);
      arr = m ? JSON.parse(m[0]) : [];
    }
    return Array.isArray(arr) ? arr : [];
  }

  // ── Natijani modalda ko'rsatish (rasm + kvadratchalar) ────
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
      mole: '#00bbf9', redness: '#ff6f91',
    };

    dets.forEach(d => {
      const b = d.box_2d || [];
      if (b.length < 4) return;
      // Gemini: [ymin,xmin,ymax,xmax] 0..1000
      const x = (b[1] / 1000) * w;
      const y = (b[0] / 1000) * h;
      const bw = ((b[3] - b[1]) / 1000) * w;
      const bh = ((b[2] - b[0]) / 1000) * h;
      ctx.lineWidth = 2;
      ctx.strokeStyle = colors[d.type] || '#39ff14';
      ctx.strokeRect(x, y, bw, bh);
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
    btn.textContent = '⏳ Tahlil qilinmoqda...';
    try {
      const dets = await mapBlemishes(student.img);
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

  // tashqaridan foydalanish uchun
  window.GeminiMap = { mapBlemishes, getKey, setKey };
})();
