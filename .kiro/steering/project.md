---
inclusion: always
---

# VinyetkaLab — loyiha konteksti

> Bu fayl Kiro uchun. Har yangi sessiyada avtomatik o'qiladi, shuning uchun
> foydalanuvchi loyihani noldan tushuntirib o'tirmaydi. O'zgarishlar bo'lsa
> shu faylni yangilab boring.

## Loyiha nima

**VinyetkaLab** — maktab albomi va vinyetkalarini avtomatik yaratuvchi veb-ilova.
Oqim: shablon tanlash → o'quvchi rasmlari + sinf ma'lumotlarini yuklash →
tahrirlash/preview → bir tugma bilan barcha o'quvchilar uchun rasm generatsiya
qilish → ZIP yuklab olish.

Til: interfeys o'zbekcha. Kod izohlari ham asosan o'zbekcha.

## Arxitektura (MUHIM)

- **100% client-side. Server YO'Q, backend YO'Q, build step YO'Q.**
- Toza HTML + CSS + vanilla JavaScript. Hammasi `<canvas>` ustida chiziladi.
- Tashqi kutubxonalar (CDN): **JSZip** (ZIP eksport), **face-api.js** (yuz aniqlash).
- **Gemini API integratsiyasi (ixtiyoriy, AI retush uchun):** brauzerdan
  to'g'ridan-to'g'ri chaqiriladi. API kalit **faqat foydalanuvchi brauzerида
  `localStorage`'da** saqlanadi — KODGA YOZILMAYDI, repoga commit qilinmaydi.
  Ilovani faqat egasi lokal ishlatadi (mijozlarga ochiq sayt emas), shuning
  uchun kalitni brauzerда saqlash qabul qilingan. Hostlanса — proxy kerak bo'ladi.

## Fayl tuzilishi

- `index.html` — barcha UI: 4 bosqich (Shablon / Yuklash / Tahrirlash / Export),
  hero, steps-bar, editor kontrollari.
- `style.css` — barcha stillar (qorong'i mavzu, #6366f1 / #a855f7 binafsha aksent).
- `templates.js` — `window.TEMPLATES` massivi. Har shablonda `draw(ctx, data, cfg)`
  funksiyasi bor. Shablon turlari: `vinyetka`, `inner`, `split-inner`,
  `poster-inner`, `id-card`.
- `editor.js` — barcha interaktivlik. `window.AppState` global holat
  (selectedTemplate, students[], classInfo, teacherImg, splitBgImg, ...).
  Rasm yuklash, preview render, navigatsiya, generatsiyani ishga tushirish.
- `generator.js` — `Generator.generate(...)` barcha o'quvchilar uchun canvas
  yaratadi; `Generator.downloadZip(...)` ZIP qiladi.
- `gemini.js` — **Gemini AI retush** (teri tozalash). `window.GeminiMap` obyekti.
  API kalit `localStorage`'da. Quyida batafsil.
- `25.jpg` — namuna/test rasm.
- `minecraft2d (1).html` — ALOHIDA mustaqil o'yin fayli (albom loyihasiga
  aloqasi yo'q, shunchaki shu repoda turibdi).

## Konvensiyalar

- O'quvchi fayl nomi = "Ism Familya" (kengaytmasiz) → o'quvchi ismi sifatida olinadi.
- Kod uslubi: vanilla JS, framework yo'q. Mavjud uslubga mos yozilsin.
- Yangi shablon = `templates.js` ga `draw()` li obyekt qo'shish.
- Test/build buyrug'i yo'q; ilovani brauzerda ochib qo'lda tekshiriladi.

## Qabul qilingan qarorlar / ishlar tarixi

1. **`minecraft2d (1).html` vizual buglar tuzatildi** (PR #15,
   branch `fix/minecraft2d-visual-bugs`):
   ikki marta ishga tushgan game loop (2x tezlik), devorga urilganda tinmay
   sakrash, blok kursori joyi, `drawHP` dagi o'lik kod, mobil/tor ekran tugmalari.

2. **Yuz terisi retushi (dog'/husnbuzar/shram tozalash) — Gemini bilan amalga oshirildi**
   (branch `gemini-mapping-test`, avtomatik `main`ga merge bo'lib boradi):

   **Yondashuv evolyutsiyasi (nima sinaldi va NEGA):**
   - Avval "AI'siz, sof Canvas healing" rejalashtirilgandi, LEKIN sifat albom
     darajasiga yetmadi → foydalanuvchi Gemini API ishlatishga rozi bo'ldi.
   - **Mapping (Gemini Vision, `gemini-2.5-flash`)** — dog' koordinatalarini
     so'rash (arzon ~$0.001-0.003, rasm generatsiya emas). Ishladi, lekin
     o'zi healing qilmaydi — faqat joyni aytadi.
   - **Lokal spot-healing** koordinatalar bo'yicha — sifat baribir yetarli emas.
   - **Nano Banana (`gemini-2.5-flash-image`) AI retush (generatsiya)** — butun
     rasmni yuborish: sifat past (yuz kichik) + yuzni o'zgartirdi.
   - **Yuzni kesib retush** — yaxshilandi, lekin: chok bilindi, lab/ko'z
     tuzilishi o'zgardi, crop cho'zilib sifat tushdi.
   - **JORIY (eng yaxshi) yondashuv — kvadrat crop + teri-niqobli aralashtirish:**
     1. face-api bilan yuz aniqlanadi → atrofdan **KVADRAT** crop (nisbat
        buzilmasin).
     2. Kvadrat Gemini'ga yuboriladi (retush).
     3. Original kropdan **teri niqobi** quriladi (YCbCr teri + yuz ellipsi,
        feather/blur).
     4. Faqat **teri** Gemini natijasidan olinadi; **ko'z, lab, qosh, soch,
        fon ORIGINALdan** qoladi → tuzilish o'zgarmaydi, chok ketadi.
     5. To'liq o'lchamli original rasmga qaytarib joylanadi.

   **`gemini.js` ichidagi asosiy funksiyalar:**
   - `getKey/setKey` — kalitni `localStorage`'dan (`GEMINI_API_KEY`).
   - `getFaceNorm(img, idx)` — yuz markazi/balandligini (AppState.faces yoki
     face-api orqali) qaytaradi.
   - `mapBlemishes(img, faceNorm)` — Vision mapping (yuzga crop + ellipse filtri).
   - `healSpots / healSpotsFromSnap` — lokal Photoshop uslubidagi spot-healing
     (hozir asosiy emas, qoldirilgan).
   - `geminiRetouch(img)` — Nano Banana'ga rasm yuborib tahrirlangan rasm oladi.
   - `geminiRetouchFace(img, faceNorm)` — **ASOSIY**: kvadrat crop + teri-niqob.
   - `buildSkinMask(...)` — YCbCr teri + yuz ellipsi niqobi.
   - `applyAiRetouch()` — 🪄 tugma handleri (joriy o'quvchiga qo'llaydi).
   - `revertHeal()` — ↩︎ asl rasmni qaytarish (`student.origImg` saqlanadi).

   **UI (`index.html`, editor panelida "🧪 Gemini Mapping (test)" bo'limi):**
   - API kalit maydoni (password) + 💾 Saqlash / 🗑 Tozalash.
   - 🔍 "dog'larni aniqlash" (mapping + natija modali).
   - 🪄 "AI Retush (Gemini — studio sifat)" — asosiy retush tugmasi.
   - ↩︎ "Asl rasmni qaytarish".
   - `#gmpOverlay` modali — mapping natijasi (rasm + rangli belgilar) + heal tugma.

   **Narx/strategiya kelishuvi:** retush = generatsiya (~$0.039/rasm). Foyda
   1 albom ~150-200 ming so'm. Maqsad: faqat dog'li yuzlarni generatsiyaga
   yuborish + batch (50% arzon) — KEYINGI QADAM, hali qilinmagan.

   **OCHIQ MUAMMOLAR / keyingi qadamlar:**
   - Juda TO'Q dog'lar teri-niqobdan tashqarida qolib, tozalanmay qolishi mumkin
     (niqobga to'q dog'larni qamrash qo'shilishi mumkin).
   - Batch: hamma o'quvchini bir tugmada retush.
   - Faqat dog'li yuzlarni yuborish (mapping'ni "filtr" sifatida) → pul tejash.
   - Yuqori rezolyutsiya / Nano Banana 2 (`gemini-3.1-flash-image`).

## Eslatma

Foydalanuvchi bilan o'zbek tilida muloqot qilinadi.
