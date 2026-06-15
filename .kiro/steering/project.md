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

> **YANGI ICHKI SHABLON `bitiruvchi-poster-inner` (qilindi):** Landscape (1280×960),
> qora fon. Tartib: CHAP — sinf rahbari katta portreti + ismi + "Mening aziz
> bitiruvchilarim!" sarlavhasi + xat paragrafi (default matn `cfg.teacherMessage`
> yoki `data.teacherMessage` bilan override qilinadi). MARKAZ — katta sinf raqami
> (`className`dan ajratiladi: "11" + harf "B" + kursiv "Sinf") + vertikal
> "BITIRUVCHILAR / XAYR MAKTAB" + `25.05.<yil> YIL`. O'NG — o'quvchilar grid
> (6 ustun, egasi 1-o'rinda gold ramka bilan). O'NG CHEKKA — vertikal
> "YANGI BOSQICH YANGI IMKONIYATLARI!" + yirik gold yil. `type:'inner'` →
> boshqa inner shablonlar kabi `allStudents/ownerIndex/teacherImg` ishlatadi,
> shuning uchun generatsiya + retush avtomatik ishlaydi. `editor.js`da
> tanlovda maxsus defaultlar (1280×960, rect, qora fon, #d4af37 aksent).
>
> **Split-inner funksiyalari poster shablonga ko'chirildi (qilindi):** `bitiruvchi-poster-inner`
> endi `split-inner`dagi to'liq `drawImgT` ni o'z ichiga oladi — har bir foto uchun:
> (1) FREE-TRANSFORM — sichqoncha bilan sudrash/g'ildirak zoom/dblclick reset
> (`transforms[key]`, `hitRegions`); (2) AVTOMATIK YUZ KADRLASH (`faces[idx]`,
> `autoFaceFrac`/`autoFaceY`); (3) HAR O'QUVCHI RETUSHI (`retouchMap[idx]` —
> brightness/contrast/saturation/warmth/smooth(`rtSpotHeal`)/vignette). Grid asl
> indeks bo'yicha ishlaydi (`g${origIndex}`, egasi 1-o'rinda); o'qituvchi fotosi
> alohida kalit `'T'` (faqat qo'lda transform, yuz/retush yo'q — u o'quvchi emas).
> `editor.js` inner render shoxiga `hitRegions: _hit` (+ transforms/faces) qo'shildi —
> shusiz sudrash ishlamasdi. `runAutoFit` (avto-yuz) va Portret-filtri kontrollari
> inner rejimda ko'rinadi, shuning uchun avtomatik ishlaydi.
>
> **POSTER = SPLIT-INNER 100% (qilindi):** Foydalanuvchi talabi — poster `split-inner`
> bilan FAQAT ko'rinishi farq qilsin, qolgan barcha funksiya/kontrol bir xil bo'lsin.
> Yechim: `bitiruvchi-poster-inner` `type`i `'split-inner'` ga o'tkazildi → editor
> render shoxi, `splitControlsCard` (barcha kontrollar) va `_renderSplitInner`
> AVTOMATIK ulanadi. `draw()` endi shu cfg'larni hisobga oladi: **fon turi**
> (rang/gradient/rasm + overlay), **maksimal ustunlar soni** (`maxCols`), **o'quvchi
> rasmi shakli** (rect/rounded/circle/oval — `shapePath`), **ism joylashuvi**
> (none/over/bottom/top), **ism rangi**, **o'rtadagi ajratgich** (line), **chap yozuv**
> (`leftLabel` → o'qituvchi ostidagi matn), hamda free-transform / auto-yuz / retush
> (`drawImgT`). Faqat KO'RINISH poster bo'lib qoladi (chap o'qituvchi + xat, markaz
> katta sinf raqami + vertikal yozuvlar, o'ng grid, o'ng chekka shior + yil).
> - `editor.js`: `selectTemplate`da shu `id` uchun split kontrol defaultlari
>   (1280×960, qora fon, 6 ustun, rect, gold aksent) + `teacherUploadWrap` KO'RSATILADI
>   (chap blok = sinf rahbari), `leftPhotoUploadWrap` yashiriladi. Split preview
>   render shoxiga `teacherImg` qo'shildi.
> - `generator.js` `_renderSplitInner` `...config` ni tarqatadi → `teacherImg`
>   generatsiyada ham yetib boradi (startGeneration `teacherImg` uzatadi).
> - Chap katta rasm = O'QITUVCHI (`teacherImg`), grid = barcha o'quvchilar (egasi
>   1-o'rinda). O'qituvchi fotosi kaliti `'T'` (qo'lda transform; u o'quvchi
>   bo'lmagani uchun yuz/retush yo'q).

> **KATTA RASM POZITSIYA KONTROLI — teacher + cover ga ulandi (qilindi):**
> "Katta rasm — yuz kattaligi / vertikal joyi" slayderlari (`afFaceLeft`/`afFaceYLeft`
> → `autoFaceFracLeft`/`autoFaceYLeft`) + sichqoncha sudrash/zoom endi:
> - **Sinf rahbari (poster chap katta rasm):** `drawImgT` ga `isLeft` qo'shildi;
>   yuzi aniqlanmagan katta rasmda slayderlar zoom (`tf/0.27`) + vertikal pan
>   sifatida ishlaydi. Kaliti `'T'`.
> - **Ustki muqova (`bitiruvchi-cover`) rasmi:** rasm bloki transform + auto-yuz
>   (`faces[idx]`) + chap-slayderlar bilan qayta yozildi; har o'quvchi uchun
>   alohida `cover<idx>` kaliti. Default (slayder tegmagan) ko'rinish o'zgarmaydi
>   (`tf=0.27 → s=1`, markazda). Sabab: poster `split-inner` turi bo'lgani uchun
>   ustki qadamda `.generic-ctrl` (Rasm o'lchami/vertikal pozitsiya) yashirin edi →
>   cover'ni siljitib bo'lmas edi; endi ko'rinadigan chap-slayderlar + sudrash.
> - `editor.js`: vinyetka (else) render shoxiga `hitRegions/transforms/faces/faceIdx`
>   qo'shildi. `generator._renderOne` endi `faceIdx`(=o'quvchi indeksi) uzatadi →
>   preview va generatsiyada bir xil `cover<idx>` transform.

> **POSTER GRID — markazlash + yolg'iz o'quvchi tuzatildi (qilindi):** poster grid
> endi `buildRows(count, cols)` ishlatadi: oxirgi to'lmagan qator MARKAZGA
> tekislanadi; `rem===1` bo'lsa (mas. 31 o'quvchi, 6 ustun) yolg'iz qolmasin deb
> oxirgi qator `COLS+1` (7) bo'ladi; `rem>=2` da oxirgi qator `rem` ta (markazda).
> Katak o'lchami `maxItems` (eng keng qator) bo'yicha hisoblanadi → barcha qatorlar
> sig'adi. Egasi (1-o'rin) `sIdx===0`.

> **ICHKI + USTKI ikki bosqichli tahrirlash (qilindi):** Albom endi har o'quvchi
> uchun IKKI qism chiqaradi — **ichki** (tanlangan inner shablon) va **ustki**
> (vinyetka, default `bitiruvchi-cover`). Oqim: 1 Shablon → 2 Yuklash →
> 3 **Ichki** tahrirlash → 4 **Ustki** tahrirlash → 5 Export.
> - Bitta editor oynasi qayta ishlatiladi; `switchEditPart('inner'|'outer')`
>   `selectedTemplate`ni almashtiradi. `AppState`: `innerTemplate`, `outerTemplate`,
>   `editPart`, `_tf{inner,outer}` (transformlar alohida), `cfgInner/cfgOuter`
>   (kontrol qiymatlari snapshot). `faces`/`retouchMap` UMUMIY (bir xil retush yuz).
> - `Generator.generate(...opts{append,folder})` ikkala qismni `Generator.canvases`ga
>   yig'adi; `downloadZip` ZIPда `albom/ichki/` va `albom/tashqi/` papkalariga ajratadi.
> - Ustki shabloni hozir default; chooser keyin qo'shiladi.
> - **Ustki qadam kontrollari:** ICHKI qadamdagi BARCHA panellar ustki qadamda ham
>   ko'rinadi (yuz/retush umumiy). Qo'shimcha: `outerControlsCard` (`.outer-only`)
>   faqat ustki qadamda chiqadi — muqova matnlari tahriri:
>   `ovType` (maktab=sinf / oliy=guruh), `ovTitle`, `ovSchoolNum`, `ovClass`,
>   `ovYear`, `ovCity`. `getEditorConfig` ularni `cover*` sifatida beradi;
>   `bitiruvchi-cover.draw` `cfg.cover*` ni `data`(classInfo)dan ustun qo'yadi.
>   Muqovada ISM va SINF RAHBARI yo'q (faqat sinf/guruh + maktab + yil + shahar).


> **MUHIM (joriy holat):** Gemini AI retush funksiyasi QAYTA YOQILDI va faol.
> (Photoshop/Evoto yo'li vaqtincha pauza qilindi.) Gemini UI, modallar va
> `<script src="gemini.js">` `index.html`da tiklangan.
> **So'nggi tuzatishlar (foydalanuvchi talabi):**
> 1. Yuz tuzilishi/ifodasi o'zgarmasligi (og'iz ochilib qolardi) → face-api
>    **landmark** himoyasi: og'iz, ko'z, qosh niqobdan o'chiriladi (ellips+blur)
>    → bu zonalar 100% ORIGINALDAN qoladi. `getFaceLandmarks` + `eraseLandmarkEllipse`.
> 2. Dog'larni kattalashtirmaslik/yangi qo'shmaslik → prompt qat'iy: "do NOT add,
>    invent, darken or enlarge any spot; do NOT open mouth / show teeth / change
>    expression".
> Gemini ishi to'liq quyida (4-band) hujjatlashtirilgan.


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
   - Yuqori rezolyutsiya / Nano Banana 2 (`gemini-3.1-flash-image`).

   **MINIMAL RETUSH + QAT'IY FILTR:** Gemini yuzni o'zgartirardi.
   - Prompt balansланган: akne/dog'/shram/qizarish olinadi, lekin haddan ortiq
     silliqlash YO'Q (tabiiy tekstura/pora saqlanadi), hol saqlanadi.
   - **MUHIM TAJRIBA:** "farq-asosli aralashtirish" sinaldi (faqat original/retush
     farqi katta piksellar) — LEKIN Gemini natijasi biroz siljishi/masshtablanishi
     tufayli SOXTA dog' chiqdi (husnbuzar paydo bo'ldi, kichigi kattalashdi).
     Shuning uchun BEKOR qilindi. Hozir ishonchli **teri-niqobli** (`buildSkinMask`)
     to'liq teri almashtirish ishlatiladi (ko'z/lab/qosh/soch original). Bu usul
     foydalanuvchi "yaxshilandi" degan versiya.

   **BATCH + TOZA YUZNI O'TKAZISH (qilindi) — `autoRetouchAll()`:**
   - 🚀 "Hammasini avtomatik retush" tugmasi (`gmpBatchBtn`).
   - Har o'quvchi: avval ARZON `mapBlemishes` (filtr). `type!=='mole' && severity>=2`
     bo'lgan dog' bo'lmasa → TOZA deb generatsiya QILINMAYDI (pul tejaladi).
     Aks holda `geminiRetouchFace` + belgilangan hollarni `restoreMoles`.
     Oxirida hisobot: nechta tozalandi / o'tkazildi / xato.

   **HOL QAYTARISH yaxshilandi:** `restoreMoles` endi dumaloq disk emas, faqat
   holning o'zini transplant qiladi (to'qlik + RANG farqi, pastroq chegara →
   belgilangan hol ishonchli saqlanadi, dumaloq yamoq yo'q).

   **HOLLARNI SAQLASH (qilindi):** retush hollarni o'chirib yuborardi.
   - Birinchi urinish (avtomatik Gemini `type==='mole'` tasnifi) ISHONCHSIZ
     chiqdi — haqiqiy holni o'chirib, oddiy dog'ni hol deb qoldirardi. Olib tashlandi.
   - **JORIY yechim — QO'LDA belgilash:** operator 🟢 "Hollarni belgilash" tugmasi
     orqali modal'da rasm ustiga bosib hol nuqtalarini belgilaydi (toggle).
     `student.keepMoles = [{nx,ny}]` (normada) saqlanadi. `applyAiRetouch`
     retushdan keyin `restoreMoles()` bilan aynan shu nuqtalarni ORIGINALDAN
     radial-feather bilan qaytaradi. `moleBoxesFromPoints()` nuqtalarni box'ga
     aylantiradi (radius yuz balandligiga bog'liq). Tugmalar/modal: `gmpMoleBtn`,
     `gmpMoleOverlay`, `gmpMoleCanvas`, `gmpMoleSave`, `gmpMoleClear`.

## Eslatma

Foydalanuvchi bilan o'zbek tilida muloqot qilinadi.
