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
- Tashqi kutubxona: faqat **JSZip** (CDN orqali) — ZIP eksport uchun.
- Hech qanday API kaliti, tarmoq chaqiruvi yoki tashqi servis ishlatilmaydi.
  Yangi funksiya qo'shilganda ham shu printsip saqlanishi kerak (offline,
  arzon, tez). Tashqi API/AI qo'shishdan oldin foydalanuvchi bilan kelishilsin.

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

2. **Rasmdagi "dog'larni" tuzatish funksiyasi — yondashuv kelishildi:**
   - AI bilan rasm GENERATSIYA QILINMAYDI (qimmat, sekin, yuzni o'zgartiradi).
   - Reja: dog'ni topib, atrofdagi sog'lom teri rangidan olib tuzatish
     (klassik healing/inpainting).
   - Kelishuv: **sof CV (Canvas) bilan, AI'siz** qilinadi — chunki ilova
     serversiz va AI vision aniq piksel koordinatasini ishonchli bermaydi.
   - Faqat KATTA dog'lar olinadi (o'lcham filtri + downscale), mayda detallar
     e'tiborga olinmaydi — tezlik uchun.
   - Holat: hali kod yozilmagan, foydalanuvchidan dog' turi (yuz nuqsoni / eski
     rasm chang-chizig'i / ifloslik) va tafsilotlar kutilyapti.

## Eslatma

Foydalanuvchi bilan o'zbek tilida muloqot qilinadi.
