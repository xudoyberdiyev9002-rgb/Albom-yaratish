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

## ⚠️ YANGI SHABLON QO'SHISH — MAJBURIY CHECKLIST (DOIMIY QOIDA)

> **Muammo:** Har yangi shablon qo'shilganda eski funksiyalar (sudrash, yuz
> kadrlash, retush, Gemini, ikki bosqich, generatsiya) qo'shilmay qolib
> ketardi va foydalanuvchi har safar "eski funksiyalarni ham qo'sh" deb
> so'rashга majbur bo'lardi. **BUNDAN KEYIN:** yangi shablon qo'shilganda
> quyidagilarning HAMMASI avtomatik ishlashi SHART. Foydalanuvchi eslatmasa
> ham shu checklist bajariladi.

### Asosiy qoida (eng oson yo'l)
Yangi shablon uchun **YANGI render shoxi/yangi `type` OCHMA**. Iloji boricha
mavjud `type: 'split-inner'` (yoki `'inner'`) ni QAYTA ISHLAT — chunki editor
render shoxi, `splitControlsCard` (barcha kontrollar), `_renderSplitInner` va
generatsiya AVTOMATIK ulanadi. Faqat `draw()` ichida **KO'RINISH** farq qilsin
(joylashuv/matnlar). Poster shabloni aynan shunday qilingan (`type:'split-inner'`,
faqat ko'rinish poster).

### Har bir yangi shablon quyidagi funksiyalar bilan ISHLASHI SHART:
1. **Free-transform** — har foto: sichqoncha sudrash / g'ildirak zoom / dblclick
   reset. Buning uchun editor render shoxiga `hitRegions` (+`transforms`,`faces`)
   UZATILISHI KERAK — **`hitRegions` uzatilmasa sudrash ISHLAMAYDI** (eng ko'p
   qolib ketadigan xato).
2. **Avtomatik yuz kadrlash** — `faces[idx]`, `autoFaceFrac`/`autoFaceY`,
   `runAutoFit`; "Katta rasm" uchun `autoFaceFracLeft`/`autoFaceYLeft` (`isLeft`).
3. **Har o'quvchi retushi** — `retouchMap[idx]` (brightness/contrast/saturation/
   warmth/smooth(`rtSpotHeal`)/vignette). Retush sliderlari `.inner-only`.
4. **Gemini AI retush** — `student.img` ustidan ishlaydi, shuning uchun rasm
   `student.img`/`origImg` dan olinsa avtomatik qo'llanadi. Alohida ish shart emas.
5. **Ikki bosqichli tahrirlash** — ichki + ustki. Shablon `innerTemplate`
   yoki `outerTemplate` sifatida ishlashi, `cfgInner/cfgOuter` snapshot va
   `_tf{inner,outer}` bilan mos kelishi.
6. **Kontrollar** — kerakli `splitControlsCard` kontrollarini `draw()` hisobga
   olsin: fon turi (rang/gradient/rasm+overlay), `maxCols`, foto shakli
   (rect/rounded/circle/oval — `shapePath`), ism joylashuvi/rangi, ajratgich,
   `leftLabel`; teacher blok kerak bo'lsa `teacherImg` + `teacherUploadWrap`.
7. **Generatsiya mosligi** — `_renderSplitInner` `...config` ni tarqatadi
   (`teacherImg` yetib borsin); `_renderOne` `faceIdx` uzatadi (preview va
   generatsiya bir xil transform); `startGeneration` `teacherImg` uzatadi.

### Yangi shablon qo'shgandan keyin TEKSHIRISH (qo'lda, brauzerda):
- [ ] Fotoni sichqoncha bilan sudrab/zoom qilib bo'ladimi (barcha kataklar + katta rasm)?
- [ ] Avto-yuz kadrlash tugmasi ishlaydimi?
- [ ] Retush sliderlari preview'да ko'rinadimi va ta'sir qiladimi?
- [ ] Gemini 🪄 retush joriy o'quvchiga qo'llanadimi?
- [ ] Ichki VA ustki qadamda to'g'ri chiqadimi (kontrollar o'zgarmaydimi)?
- [ ] Generatsiya (hamma o'quvchi) preview bilan bir xil chiqadimi + ZIP to'g'rimi?

> **Agar yangicha `type` ochish MAJBUR bo'lsa:** yuqoridagi 1–7 ulanishlarni
> (ayniqsa `hitRegions`, `...config`, `faceIdx`) QO'LMA-QO'L takrorlash SHART,
> aks holda funksiyalar ishlamaydi.

## Qabul qilingan qarorlar / ishlar tarixi

> **BOG'CHA SHABLONI — ichki + muqova (qilindi):** ALBOM = **landscape**, to'liq
> ochilgan 61×40 sm (har panel 30.5×40), **vertikal o'rtadan buklanadi** (markazda
> buklanish chizig'i). defaultW 1220, defaultH 800; printW 6000, printH 3937.
> IKKI shablon, ikkalasi ham `type:'split-inner'` → drag/zoom/yuz/retush/generatsiya
> AVTOMATIK (checklist bo'yicha).
> - **`bogcha-inner`** (ichki tomon, ochilgan landscape): tepada 4 xodim (markazda,
>   balandligi H*0.30 ga cheklangan; `cfg.staffImgs`, ixtiyoriy `cfg.staffNames`),
>   ostida 25–35 bola grid ismlari bilan (maxCols 9). Egasi 1-o'rinda amber ramka.
>   `bBuildRows` bo'sh o'rinlarni markazlaydi. `pairedOuter:'bogcha-cover'`.
> - **`bogcha-cover`** (tashqi/buklangan tomon, `hidden:true`): panel-asosli —
>   **O'NG panel = OLD muqova** (bola portreti + sarlavha + ism + shahar·yil),
>   **CHAP panel = ORQA** (guruh kollaji `cfg.groupImgs`, 2-ustun grid + "BIZNING GURUH").
>   Egasi portreti = `leftImg`/allStudents[ownerIndex]. Markazda buklanish chizig'i.
> - **Tuzatishlar (2-iteratsiya):** (1) Grid `bBuildRowsBottom` — to'liq ustunlar,
>   qoldiq PASTKI qatorda markazda. (2) Ichki sarlavha = bog'cha nomi (schoolName) +
>   guruh — "bitiruvchi albom" yozuvi OLIB TASHLANDI. (3) Xodimlar teparoqda,
>   KICHIKROQ (sCardH≈H*0.24); bolalar `cardW=min(cardW,sCardW)` bilan xodimdan
>   katta bo'lmaydi (bolalar asosiy, lekin xodimdan kichik). (4) Xodim fayl nomidan
>   ism+lavozim ajratiladi (`parseStaffName`: "Familya Ism Lavozim" yoki `-`/`,`
>   ajratgich) → foto ostida ism + lavozim yoziladi. `staffImgs`/`groupImgs` endi
>   `{img,name,role}` obyektlari. (5) Muqova (old panel) portretga bola ISMI
>   yozilmaydi. (6) Muqova kollaji = TEPADA 3 portret + OSTIDA 2 albom (landscape) —
>   fikslangan `grp0..4`. (7) **Tekislash tuzatildi:** `drawImgTransformed` ga
>   yuzsiz "katta rasm" tarmog'i qo'shildi — yuz aniqlanmasa ham "Katta rasm"
>   slayderlari (afFaceLeft/afFaceYLeft) zoom+vertikal pan sifatida ishlaydi; xodimlar
>   `isLeft:true` bilan shu slayderlarga ULANDI.
> - **Tuzatishlar (3-iteratsiya):** (1) Ichki markaziy sarlavha OLIB TASHLANDI —
>   o'rniga xodimlar qatorining CHAP bo'sh joyiga **bog'cha nomi**, O'NG bo'sh joyiga
>   **guruh nomi** yoziladi (Coiny). Editorda alohida inputlar: `bogInnerLeft`,
>   `bogInnerRight` (`#bogchaTextCard`, faqat bogcha-inner'da ko'rinadi; `getEditorConfig`
>   → `innerLeftText`/`innerRightText`; CFG_CONTROL_IDS'ga qo'shildi). (2) Xodimlar
>   yana kichraytirildi (sCardH≈H*0.205). (3) **Shriftlar:** sarlavhalar/yon yozuvlar
>   **Coiny**, ism/lavozim/bolalar ismi **Oswald** (index.html'ga Google Fonts link +
>   `document.fonts.ready` da preview qayta chiziladi). (4) **Sig'maslik tuzatildi:**
>   `bFitFont`/`bFitWrap` yordamchilari — xodim ism/lavozim va bola ismi katakka
>   sig'maganda shrift avtomatik kichrayadi (Oswald condensed ham yordam beradi).
> - **Muqova guruh rasmlari — RAMKA free-transform (4-iteratsiya):** yangi top-level
>   `drawFrameT(ctx,item,baseX,baseY,baseW,baseH,key,cfg,accent)` — butun katakcha
>   (oq ramka + cover-fit rasm) BIRGA ko'chadi/masshtablanadi (rasmni ichida pan emas).
>   store `{ox,oy,scale}` (ox/oy = baseW/baseH ga nisbatan siljish, scale = ramka
>   koeffitsienti). hit-region = ko'chgan/masshtablangan ramka → `initFreeTransform`
>   sudrash/g'ildirak/dblclick to'g'ridan-to'g'ri ishlaydi. Muqovadagi `grp0..4`
>   kataklari endi shu bilan chiziladi (avvalgi `drawImgTransformed` o'rniga).
> - **Parametrlarni saqlash + portret per-child + sliderlar per-part (14-iteratsiya):**
>   (1) **localStorage persistence** (`VINYETKA_ALBUM_STATE`): `saveAlbumState`/
>   `loadAlbumState` — transformlar (`_tf`), `retouchMap`, guruh `rt` (indeks bo'yicha),
>   `faces`, cfgInner/cfgOuter (matnlar/ranglar/sliderlar), classInfo, staff meta.
>   `renderPreview` oxirida debounced saqlanadi. `selectTemplate` — agar tanlangan
>   shablon `saved.innerTemplateId` bilan bir xil bo'lsa, parametrlar TIKLANADI
>   (rasmlar qayta yuklanadi, sozlamalar indeks bo'yicha qo'llanadi; guruh rt upload'da
>   qayta ulanadi). (2) Muqova portreti kaliti `coverPortrait${ownerIndex}` — HAR BOLA
>   uchun ALOHIDA + avto yuz-markaz (`faces[ownerIndex]`); `runAutoFit` per-child portret
>   transformini tozalaydi. (3) Tekislash sliderlari (`afFace/afFaceY/afFaceLeft/
>   afFaceYLeft`) CFG_CONTROL_IDS'ga qo'shildi → ICHKI va TASHQI uchun ALOHIDA (snapshot).
> - **Muqova guruh rasmlari 10 tagacha (13-iteratsiya):** Upload max 5→**10**
>   (`groupImgs`). Kollaj tartibi rasmlar soniga moslashadi: 1–2 → keng qatorlar;
>   3–10 → TEPA keng (grp0) + O'RTA grid (grp1..N-2, midCols=midCount≤3?midCount:4,
>   `bBuildRowsBottom`) + PAST keng (grp[N-1]). Har biri `drawFrameT` (grpN kaliti),
>   free-transform/swap/retush ishlaydi. N = yuklangan soni (10 gacha) yoki 0 bo'lsa 5.
> - **Tuzatishlar (12-iteratsiya):** (1) O'rtadagi shtrix (fold) chiziq OLIB TASHLANDI
>   (ichki+muqova); `foldX=W/2` faqat joylashuv uchun qoldi. (2) Ichki grid MARKAZDA
>   `foldGap` bo'shliq — hech bir card foldX ustiga tushmaydi (leftN=floor, rightN=ceil,
>   gutter foldga markazlanadi); `cardW_byW` keng yarim (ceilCols, W/2) bo'yicha. (3)
>   Bola cardlari 3×4 (`CR=1.58`, `photoH=photoW*4/3`) + ism KICHIKROQ (`nameFS≈cardW*0.1`).
>   (4) Xodimlarga AVTO yuz: `runAutoFit` staff loop → `faces['staff'+i]`; xodim chizishda
>   `faceIdx='staff'+i`. (5) Muqova: yil faqat PASTDA (top sub'dan olib tashlandi); past
>   matn (shahar·yil) VERTIKAL sudraladi — `coverBottomTxt` hit-region + `texty` drag
>   rejimi (`store.ty`). (6) "Keyingi" footer STICKY (`#editorFooter` position:sticky bottom).
> - **Tuzatishlar (11-iteratsiya):** (1) Ichki gridda EGASI ismi endi qolganlar bilan
>   BIR XIL (amber emas, `nameColor`, weight 500). (2) Muqova guruh rasmlari + portret
>   RETUSH: `drawFrameT` retush qo'llaydi — portret `retouchMap[faceIdx]`, guruh `item.rt`
>   (`groupImgs[i].rt`). Frame tanlanganda `rtLoadCurrent`/`rtSaveCurrent` guruh vs
>   o'quvchini `activeGroupIdx()` bilan ajratadi; o'quvchi navigatsiyasida `activeFrameKey`
>   tozalanadi. (3) Preview STICKY (`.editor-preview-wrap` position:sticky) — chap menyu
>   cho'zilganda joyida qoladi. (4) Transform paytida preview qimirlashi tuzatildi —
>   `sizePreviewCanvas` faqat canvas o'lchami/zoom o'zgarganda chaqiriladi (`_lastZoom`
>   guard), har transformda emas; window resize listener qo'shildi.
> - **Muqova PORTRETI ham ramka free-transform + 3×4 (10-iteratsiya):** Muqova o'ng
>   paneldagi bola portreti endi `drawFrameT` bilan chiziladi (kalit `'coverPortrait'`,
>   fiksir slot — barcha bola muqovalarida bir xil ramka joyi/o'lchami). Default nisbat
>   **3×4** (eni:bo'yi=3:4, mavjud joyga markazlab sig'diriladi). `drawFrameT` ga
>   `faceIdx` qo'shildi → ramka free-transform bo'lsa ham ICHKI rasm avto yuz-kadrlanadi
>   (`cfg.faces[faceIdx]`, "Katta rasm" slayderlari afFaceLeft/afFaceYLeft). Qulflab
>   ichki surish/zoom `store.iSrc='manual'` qo'yadi → avto yuzni bekor qiladi.
> - **Ramka eni/bo'yi + qulf (5-iteratsiya):** `drawFrameT` store endi `{ox,oy,sx,sy,
>   iox,ioy,iscale}` — `sx`/`sy` eni/bo'yi ALOHIDA. hit-region `frame:true`.
>   `initFreeTransform` ramka uchun 3 rejim: **frame** (sudrash=ko'chirish),
>   **resize** (past-o'ng burchak dastasi=eni/bo'yi), **inner** (qulflangan=ichki rasm
>   surish); g'ildirak: qulf ochiq→o'lcham, qulflangan→ichki zoom. `AppState.frameLocked`
>   global qulf — `#frameLockBtn` tugmasi (bogchaTextCard). renderPreview aktiv ramkaga
>   (`AppState.activeFrameKey`) tanlash chizig'i + BR o'lcham dastasini chizadi.
> - **Tekislash + Shift-uniform (6-iteratsiya):** `equalizeFrames(keys)` — bir qatordagi
>   ramkalarning o'rtacha sx/sy/oy sini olib, hammasiga bir xil qiladi + `ox=0` (default
>   X → bir tekis). Resize'da **Shift** — nisbatni saqlab (sx=sy bir koeffitsient) uniform.
> - **Kollaj tartibi + almashtirish (7-iteratsiya):** Muqova chap panel kollaji
>   namunaga moslandi — **TEPA keng (grp0, guruh) + O'RTA 3 ta (grp1-3) + PAST keng
>   (grp4)**. `#equalizeFramesBtn` endi o'rta 3 ni (`grp1-3`) tekislaydi.
>   **Rasm joyini almashtirish:** `#frameSwapBtn` → `AppState.swapMode`; 2 ta ramkani
>   bosib `groupImgs` elementlari almashtiriladi (ikkala slot transformi tozalanadi);
>   birinchi tanlangan yashil belgilanadi (`AppState.swapFirst`).
> - **Bog'cha "V9" rejimi — IXTIYORIY, default O'CHIQ (`window.BOGCHA_V9`):** Yoqilganda
>   (`window.BOGCHA_V9 = true`) uch narsa faollashadi: (1) `setClassInfoLabels` — forma
>   "Bog'cha nomi"/"Guruh nomi" (maktab raqami/rahbari yashiriladi); (2) ichki yon
>   yozuvlar IKKI TEPA CHEKKAGA; (3) muqova sarlavhasi = bog'cha nomi + guruh.
>   **Default (o'chiq):** forma "Maktab/Sinf", ichki yon yozuvlar xodimlar YONIDA
>   (markazda), muqova sarlavhasi = Ustki matnlar (`ovTitle`). Kod `cfg.cornerMode`
>   (getEditorConfig `!!window.BOGCHA_V9`) bilan ikkala yo'lni ham saqlaydi.
>   Yoqish: konsolda `window.BOGCHA_V9=true`, shablonni qayta tanlang / `renderPreview()`.
> - **Ichki/ustki ALOHIDA fon rasm (8-iteratsiya):** `splitBgImg` o'rniga
>   `splitBgImgInner` va `splitBgImgOuter`. `splitBgKey()`/`currentSplitBg()` editPart
>   bo'yicha tanlaydi. `initSplitBgUpload()` — bitta upload zonasi joriy qism slotiga
>   yozadi; `window._refreshSplitBg()` qism almashganda thumbnailni yangilaydi
>   (`switchEditPart`da chaqiriladi). Generatsiyada har qismga mos fon (`startGeneration`
>   `splitBgImg: partBg`). `splitBgType` allaqachon CFG_CONTROL_IDS'da (per-part).
> - **Yangi top-level yordamchilar** (`templates.js`): `drawImgTransformed` (split-inner
>   `drawImgT` ning umumiy versiyasi — free-transform + auto-yuz + retush), `bDrawBg`
>   (rang/gradient/rasm+overlay fon), `bBuildRows`, `bSplitName`, `bRoundRect`, `bHexA`.
> - **editor.js:** `selectTemplate` da `bogcha-inner` defaultlari (915×1200, splitBg
>   och-havorang, 6 ustun, rounded, divider none) + `bogchaUploadWrap` ko'rsatiladi;
>   `outerTemplate=null` qilib qo'yiladi → `switchEditPart` `pairedOuter` bo'yicha
>   `bogcha-cover` ni juftlaydi. `initBogchaUploads()` — xodim(4)/guruh(5) ko'p-faylli
>   yuklash (`AppState.staffImgs`/`groupImgs`, thumbnail + o'chirish). `getEditorConfig`
>   `staffImgs`/`groupImgs` ni cfg ga qo'shadi → `renderPreview`/`_renderSplitInner`
>   `...cfg` orqali `draw`ga yetadi. `initTemplateGrid` filtriga `!t.hidden` qo'shildi.
> - **index.html:** `bogchaUploadWrap` (staffDropZone/groupDropZone, multiple, thumbs).
> - **Fon rasm tanlash:** split-inner `splitBgType='image'` + `splitBgDropZone` allaqachon
>   bor — bog'cha shabloni shuni ishlatadi (ichki va muqova bir xil fonni ulashadi).
> - **OCHIQ/keyingi:** ichki va muqova uchun ALOHIDA fon rasm (hozir bitta `splitBgImg`
>   ulashiladi); xodim ismlari uchun UI (hozir `staffNames` faqat cfg orqali).

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

> **USTKI MUQOVA — "Rasm kattaligi (albom bo'ylab)" slayderi (qilindi):** ustki
> qadamda `outerControlsCard` (`.outer-only`) ga **`coverScale`** slayderi (50–180%,
> default 100). U muqovadagi rasm **RAMKASI** o'lchamini boshqaradi (albom bo'ylab
> katta/kichik), ICHKI kontent zoomi emas. `bitiruvchi-cover`: `photoH =
> (photoBottom-photoTop) * (photoScale/100) * coverScale`, ramka MARKAZDAN o'sadi
> (`photoCenterY`), shuning uchun scale=1 da joyi o'zgarmaydi. Ichki kadrlash
> avvalgicha (yuz-kadrlash / sudrash, zoomsiz). `coverScale` `CFG_CONTROL_IDS` da →
> ustki snapshot/generatsiyada saqlanadi; slayder faqat ustki qadamda ko'rinadi.
>
> **USTKI MUQOVA — vertikal joy + sarlavha overlap + retush tuzatildi (qilindi):**
> 1. **Vertikal joy:** yangi `coverOffsetY` slayderi (−100..100, `outer-only`) →
>    ramkani vertikal siljitadi (`photoY += coverOffsetY * h * 0.30`). `CFG_CONTROL_IDS`
>    da, snapshot/generatsiyada saqlanadi.
> 2. **Sarlavha ustiga chiqishi:** ramka endi MARKAZDAN emas, TEPADAN o'sadi
>    (`photoY = photoTop + photoOffsetY + offset`) va `minTop = h*0.115` bilan
>    cheklangan → "BITIRUVCHI" sarlavhasi ustiga chiqmaydi.
> 3. **Retush:** `bitiruvchi-cover` endi `retouchMap[faceIdx]` ni qo'llaydi
>    (brightness/contrast/saturation/warmth/smooth(`rtSpotHeal`)/vignette) — xuddi
>    `drawImgT` kabi. Retush sliderlari `.inner-only` (ustki qadamda ham ko'rinadi),
>    Gemini retush esa `student.img` ni to'g'ridan-to'g'ri o'zgartiradi.

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

## Keyingi yangilanishlar (bog'cha shablon + umumiy)

- **Tuman·yil rangi:** `#bogBottomColor` color picker → `cfg.coverBottomColor`
  muqova pastidagi shahar·yil yozuvi rangini boshqaradi. CFG_CONTROL_IDS + listener.

- **Preview↔render nisbati:** `renderPreview` print shablonlarda (printW/printH)
  canvas nisbatini AYNAN bosma nisbatiga tenglashtiradi; `sizePreviewCanvas` eni VA
  bo'yi bo'yicha sig'diradi (landscape albom vertikal qirqilmaydi). Bu preview'da
  ko'rinib renderdan keyin siljish/kesilish muammosini yechdi.

- **Sifat:** render/preview kontekstlarida `imageSmoothingQuality='high'`;
  bog'cha-inner/cover `jpegQuality: 1.0`; o'quvchi rasmi yuklashda re-encode 0.98
  (`loadCorrectedImage`). Guruh kollaji va ichki bolalar yuzi aniqroq chiqadi.

- **Xodim retushi:** xodim rasmini bosib tanlash → `activeFrameKey='staffN'`,
  retush `retouchMap['staffN']` ga yoziladi/o'qiladi (`rtSaveCurrent`/`rtLoadCurrent`).
  Sariq tanlash chizig'i. `runAutoRetouch` xodimlarни ham tahlil qiladi.

- **Gemini "Hammasiga AI retush":** `autoRetouchAll` endi `mapBlemishes` filtrsiz —
  HAR BIR o'quvchiga birdek qo'llanadi (toza yuzlar o'tkazib yuborilmaydi).

- **Loyihani `.voy` faylga saqlash/ochish:** `exportProjectFile`/`importProjectFile`.
  Barcha rasmlar (dataURL) + `buildAlbumStateData()` (cfgInner/cfgOuter, tf, ct,
  retouchMap, faces, classInfo, layout). Tugmalar: `saveProjectBtn`(2-qadam),
  `saveProjectBtn2`(editor footer), `openProjectBtn`+`projectFileInput`(1-qadam).
  `buildAlbumStateData` saveAlbumState va export uchun umumiy.

- **Xodim soni:** bog'cha-inner staff qatori yuklangan xodim soniga moslanadi
  (`staffN = staffCount>0 ? staffCount : 4`).

- **Muqova matnlari:** "-guruh" so'zi olib tashlandi (faqat sinf/guruh nomi).
  Kollaj sarlavhasi tahrirlanadi: `#bogCollageTitle` → `cfg.coverCollageTitle`
  (bo'sh = "BIZNING GURUH").

- **Ichki joylashuv tanlash (`#innerLayoutMode`, `cfg.innerLayoutMode`):**
  - `bogcha` (eski) — xodimlar markazda tepada + past grid (bBuildRowsBottom).
  - `maktab` (yangi, default) — 8 ustunli grid (4 chap + 4 o'ng), xodimlar
    o'ng-tepada (1 ta bo'lsa 2×2 katta karta; 2–6 ta rasmdagidek: 2 tepa + qator),
    o'ng-tepa burchakda sarlavha (innerLeftText/innerRightText yoki BIZNING/
    TARBIYACHILAR), bolalar qolgan kataklarga (egasi 1-o'rinda), pastki qator
    to'lmasa bo'sh qoladi.

- **QO'LDA MATN QO'SHISH (yangi feature):** `bDrawCustomTexts(ctx,cfg,W,H)`
  (templates.js, `window.bDrawCustomTexts`) — preview'da tpl.draw dan keyin va
  generator 3 render metodida chiziladi. Har matn: `{id,text,xf,yf,size(W ulushi),
  color,family,bold,italic,rot,align,stroke,strokeColor}`. Pozitsiya W/H ulushi →
  preview=render. Qism bo'yicha alohida: `_ct={inner:[],outer:[]}`,
  `customTexts` (faol qism), transforms kabi switchEditPart/generation/`.voy`
  (`buildAlbumStateData.ct`) da almashadi/saqlanadi.
  - UI: `customTextCard` — `ctAddBtn`, `ctText/ctFamily/ctColor/ctSize/ctRot/
    ctAlign/ctBold/ctItalic/ctStroke/ctStrokeColor`, `ctDelBtn`. `initCustomText`,
    `ctLoadSelected`, `ctSelected`.
  - Preview: hit-region `{custom:true,id}`, bosib tanlash (sariq chiziq), sudrab
    ko'chirish (drag mode `custom`, xf/yf), 2 marta bosib matn tahrirlash (prompt).

## ⚠️ MAJBURIY QOIDA — HAR O'ZGARISHDA project.md HAM YANGILANSIN

> Har qanday kod o'zgarishidan (yangi feature, tuzatish, refaktor, dizayn/CSS
> yangilanishi — HAMMASI, istisnosiz) keyin **shu faylga** ("Qabul qilingan
> qarorlar" yoki oxirgi bo'limga) qisqa yozuv qo'shilsin. Bu doimiy qoida,
> foydalanuvchi eslatmasa ham bajariladi.
- **Token tejash uchun qisqa yoz:** 2-6 qator yetarli — nima o'zgardi, qaysi
  fayl/funksiya/id nomlari (grep uchun), sabab (agar kerak bo'lsa) bir gapda.
  Katalog/checklist shaklidagi uzun tushuntirish shart emas.
- Hisobot foydalanuvchiga ham 1 gap; kodda ortiqcha komment yo'q.
- Yozuvni **oxirgi bo'lim** sifatida qo'sh (fayl oxiriga yaqin) — tarix xronologik
  ketma-ketlikda o'qilsin.

## Yana yangilanishlar

- **PNG ikon/stiker (yangi):** `bDrawIcons(ctx,cfg,W,H)` (templates.js,
  `window.bDrawIcons`) — preview'da va generator 3 metodida matndan OLDIN chiziladi.
  Har ikon: `{id,src(dataURL),img,xf,yf,size(W ulushi=eni),rot,opacity}`. Qism
  bo'yicha alohida: `_ic={inner:[],outer:[]}`, `icons` (faol), `activeIconId`.
  switchEditPart/generation/`.voy`(`buildAlbumStateData.ic` — `icSerialize` src
  bilan) da almashadi. Tiklash: `icRestoreAll`/`icRebuild` (src→Image, async;
  import va localStorage-saved yo'llarida).
  - UI: `iconCard` — `icAddBtn/icAddInput`(PNG yuklash), `icSize`, `icRot`+`icRotNum`,
    `icOpacity`, `icDelBtn`. `initIconTool`, `icLoadSelected`, `icSelected`.
  - Preview: hit `{icon:true,id}`, bosib tanlash (moviy chiziq), sudrab ko'chirish
    (drag mode `icon`), g'ildirak = kattalik.

- **Burchak (rot) 0 tuzatildi:** matn va ikon uchun slider yoniga `number` input
  (`ctRotNum`/`icRotNum`, -180..180, aniq 0 kiritiladi), slider bilan sinxron.

- **Bola ismi joylashuvi:** kartada foto ostidagi bo'sh joyga moslanadi — ism blok
  (1–2 qator) o'sha maydonda VERTIKAL MARKAZ, shrift bo'sh joyga qarab kattalashtiriladi
  (max ~0.2*cardW). Ikkala layout (bogcha/maktab) da.

- **QATLAM TARTIBI UI tugallandi (z-order):** matn + PNG overlay'lar `z` bo'yicha
  saralanadi (`bDrawOverlays`). Yangi `layersCard` (index.html, `#layersList`) —
  har overlay NOM bilan ko'rinadi (matn = matn boshi; ikon = "PNG overlay N"),
  yoniga **+** (oldinga/ustga) va **−** (orqaga/ostga) tugmalari; nomga bosib
  tanlanadi (canvas'dagi tanlash bilan sinxron). `renderLayersList()` (editor.js,
  `window.` da) `renderPreview` oxirida chaqiriladi; eng ustki qator = eng oldindagi
  qatlam. `layerReorder(mode, item)` endi ixtiyoriy `item` oladi. Yangi matn/ikon
  yaratilganda `z = nextZ()` (eng oldinda paydo bo'ladi). `overlayIsIcon`/`overlayName`/
  `selectOverlay` yordamchilari qo'shildi. `icSerialize` endi `z`ni ham saqlaydi →
  qatlam tartibi `.voy`/localStorage'da saqlanadi (`ct` allaqachon to'liq saqlanadi).

## Qatlam tizimi — BOG'CHA shabloni (bogcha-inner + bogcha-cover)

- **Maqsad:** fon / card oq foni / rasmlar / qo'shilgan elementlar (matn+PNG) qatlam
  tartibini erkin o'zgartirish (avval faqat qo'shilgan elementlar qatlamlanardi).
- **Yondashuv — layer-pass + offscreen kompozitsiya:** `bogcha-inner`/`bogcha-cover`
  draw'lariga `cfg.layerPass` ('bg'|'cardbg'|'photo') qo'shildi. `LP_bg`/`LP_card`/
  `LP_photo` bayroqlari (layerPass null bo'lsa hammasi — orqaga moslik). Har chizish
  amali o'z qatlamiga guard qilinadi: **bg** = `bDrawBg`; **cardbg** = oq karta
  to'rtburchaklari + egasi ramkasi + BARCHA matn (xodim ism/lavozim, sarlavha, bola
  ismi, kollaj/portret sarlavhasi, muqova pastidagi shahar·yil); **photo** =
  `drawImgTransformed` (xodim/bola) va `drawFrameT` (muqova portret + guruh kollaji).
  Geometriya (kartalar joyi, `ry`/`cornerBottom` layout) HAR passda hisoblanadi,
  faqat chizish guard qilinadi. **Hit-region push faqat bitta passda** (photo:
  rasm/ramka; cardbg: `coverBottomTxt`) — kompozitsiyada takror bo'lmasin.
- **Ikkala shablonda `layered: true`.** `window.compositeLayers(destCtx, destCanvas,
  template, data, drawCfg, hit)` (templates.js): bazaviy 3 qatlam (bg/cardbg/photo z
  bo'yicha) + elementlarni (icon/text z) birlashtirib, har bazaviy qatlamни alohida
  offscreen canvasga `layerPass` bilan chizib, `drawCfg.w/h`→piksel masshtabi bilan
  destga qo'yadi; elementlar `bDrawOneIcon`/`bDrawOneText` (window'ga eksport qilindi).
- **z model:** `AppState._blz = { inner:{bg,cardbg,photo}, outer:{...} }`, `AppState.blz`
  = faol qism (switchEditPart almashtiradi, moveLayer joyida mutatsiya qiladi → avto
  saqlanadi). Elementlar `o.z` bilan bir xil integer fazoda. `moveLayer(key,dir)` butun
  ro'yxatni 0..n-1 ga normallaydi va qo'shni bilan z almashtiradi. `nextZ()` endi
  `allLayerEntries()` bo'yicha (yangi element hammadan ustda).
- **UI:** `layersCard` (#layersList) endi bazaviy 3 qatlamni ham ko'rsatadi (▦ + nom,
  chap chekka rangli chiziq) + elementlar; har qatorda **+** (oldinga/ust) / **−**
  (orqaga/ost). Faqat layered shablonda bazaviy qatlar chiqadi (`layeredActive`).
- **renderPreview:** split-inner branch `splitDrawCfg` quradi; `tpl.layered` bo'lsa
  `compositeLayers`, aks holda oddiy `tpl.draw`. Oxirgi `bDrawOverlays` faqat
  `!tpl.layered` (layeredда elementlar kompozitsiya ichida chizildi).
- **generator._renderSplitInner:** `template.layered` bo'lsa `compositeLayers`
  (config.blz = startGeneration'dagi `partBlz` orqali qism bo'yicha). Sifat masshtabi
  (printW→4724) offscreenда hisobga olinadi.
- **Saqlash:** `buildAlbumStateData.blz` (+ `normalizeBlz`) localStorage va `.voy`da;
  selectTemplate/importProjectFile tiklaydi. `icSerialize` allaqachon `z` saqlaydi.
- **Eslatma/ochiq:** faqat bog'cha shablonida (boshqa split-inner/vinyetka layered emas).
  Layered render draw'ni 3x chaqiradi (bg/cardbg yengil, photo=yuz/retush bir marta);
  print o'lchamda 3 ta katta offscreen — kerak bo'lsa keyin optimallashtiriladi.

## Fon/dizayn yangilanishi (commit qilinmagan, working tree'da)

- **`style.css`:** CSS token tizimi (`:root` — `--bg/--ink/--i1/--i2/--i3/--grad/--glass/--ease`).
  Animatsion fon: `body::before` (aurora), `.bg-fx` + 4 orb (`orbA-D`), yulduz
  parallaks (`.bg-fx::before/::after`), suriluvchi grid (`body::after`).
  Header/steps-bar glass-blur, tugma/karta shine-hover effektlari, `template-card`
  tanlanganda aylanuvchi gradient ramka. `@media(prefers-reduced-motion)` qo'shildi.
- **`index.html`:** `<div class="bg-fx">` qo'shildi; eski katta **Hero** bo'limi
  (rasm-kartalar) olib tashlandi, o'rniga qisqa `.intro-mini` (sarlavha+matn).

## REJA (hali boshlanmagan) — To'y albomi generatori (ko'p sahifali, murakkab shakl)

> Quyidagi qarorlar muhokama qilindi, lekin amalga OSHIRILMAGAN. Yangi
> conversation boshlanganda shu rejadan davom etiladi.

- **Maqsad:** hozirgi 2-sahifali (ichki+ustki) oqim o'rniga to'y albomi uchun
  **1 ustki + 7–15 xil ICHKI shablon** (har biri alohida sahifa dizayni).
  Rasmlar soni bo'yicha mos shablon **avtomatik tanlanadi**, keyin keyingi
  varoqqa o'tiladi (bir nechta sahifali oqim, hozirgi bitta-sahifali emas).
- **Ramka shakli:** to'rtburchak/doira/oval o'rniga **egri chiziqli murakkab
  ramka** — lekin FIKS (o'lcham/joylashuv o'zgarmaydi, resize/equalize kerak
  emas — bog'cha muqovasidagi `drawFrameT` uslubidagi ramka-resize mantiqi
  BU YERDA KERAK EMAS).
- **Yechim yo'li (kelishilgan):** ramka Canvas primitivi (Path2D/bezier) bilan
  chizilmaydi — o'rniga foydalanuvchi **tayyor kesilgan PNG** beradi (rasm
  o'rni shaffof/alpha=0 "teshik"). Kompozitsiya: avval o'quvchi rasmi
  chiziladi (transform+crop), USTIGA teshikli PNG ramka chiziladi. Bu
  yumshoq chegara/soya/teksturani saqlaydi, Path2D clip'dan sifatliroq va
  osonroq.
  - Teshik koordinatalari (x,y,eni,bo'yi) **qo'lda aytilmaydi** — PNG alpha
    kanalini skanerlab avtomatik aniqlanadi (kichik script, `execute_pwsh`).
    Bir fayl ishlagandan keyin qolgan shablonlar tezroq qo'shiladi.
- **Kontrollar doirasi TORAYADI** (fon turi/maxCols/photoShape/divider/
  leftLabel kabi `splitControlsCard` narsalari KERAK EMAS — ramka fiks).
  Qoladigan: matn qo'shish, PNG ikon, qatlamlar (layers), retush + Gemini.
  **Retush sozlamalariga o'zgartirish kiritiladi** (aniq nima — hali
  belgilanmagan, keyingi suhbatda aniqlashtiriladi).
- **Model tanlovi:** poydevor (layout-engine, rasm-soni→shablon tanlash,
  PNG-teshik+free-transform+yuz+retush namunasi) — Sonnet 5 (High) yetarli,
  Opus shart emas (chunki ramka fiks bo'lgani uchun eng xavfli resize+drag+clip
  kesishuvi yo'q). Qolgan 6–14 shablonni "stamp qilish" — Sonnet 5 default.
  Arzon open-weight modellar (DeepSeek/MiniMax/Qwen/Haiku) checklist
  ulanishida xato xavfi yuqori — tavsiya etilmaydi.
- **Keyingi qadam:** foydalanuvchi tayyor PNG shablon namunalarini beradi →
  birinchi faylni alpha-skaner bilan tahlil qilib, teshik koordinatalarini
  chiqarish va bitta to'liq namuna-shablon qurishdan boshlanadi. Multi-page
  holat modeli (`AppState.pages[]` kabi) va rasm-soni→shablon moslashtirish
  qoidasi hali BELGILANMAGAN — spec (`requirements→design→tasks`) orqali
  boshlash tavsiya etilgan.

## karobka-3d.html (ALOHIDA fayl — albom loyihasiga aloqasi yo'q)

- **Kesib ochish animatsiyasi (qilindi):** 3D karobkaga "🪚 Kesib ochish" tugmasi
  (`#cutBtn`). 11 sm devor 8 sm qoldirib (`LEAVE=8`) 3 mm arra (`KERF=0.3`) bilan
  kesiladi → aylanuvchi disk (`sawGroup`) devor bo'ylab o'tadi, so'ng qopqoq
  (top cap + yuqori `lidH=H-8-kerf=2.7` sm devor) menteşeda (`lidPivot`, old chekka,
  `OPEN_MAX≈-1.75 rad`) ochiladi. `buildCutRig()` base+lid+arrani quradi (dims bilan
  sinxron, `buildBox` ichida chaqiriladi); `setCutMode` solid ↔ kesish ko'rinishini
  almashtiradi; animate loop fazalari: sawing→opening→open→closing. `#cutSpec` da
  o'lchamlar. Tugmani qayta bosish = yopish/yig'ish.

- **Ichki jihoz + paralon uyacha (qilindi):** "🧰 Ichki jihoz" tugmasi
  (`#interiorBtn`) — rejim. Yoqilganda usti (top cap) yashirinadi, ichida qora
  paralon qatlam(lar) ko'rinadi (`interior.layers`, default 1 sm `0x141414`).
  Chap panel `#interiorPanel`: detal qo'shish (`ITEM_PRESETS` — Albom 43×30,
  Albom 20×30, Rasm 15×10, HDD 15×10, Fleshka), qo'yilgan detallar ro'yxati,
  tanlangan detal tahriri (eni/chuqurlik/balandlik, ↻90° burish, qatlam tanlash,
  o'chirish) va paralon qatlamlari (qalinlik/qo'shish/o'chirish).
  - Detalni sichqoncha bilan XZ da sudrab ko'chirish (`dragItem`, `dragPlane`;
    sudrash paytida `controls.enabled=false`; listenerlar OrbitControls'dan oldin
    ro'yxatga olingani uchun kamera aylanmaydi). Bosib tanlash (sariq ramka).
  - **Uyacha (pocket) — grid dekompozitsiya** (`buildFoamSlab`): har detal
    footprinti + `CLEAR=0.1` sm (1 mm) zazor bilan uyacha; chuqurligi
    `min(detalH, qatlamQalinligi)`. Paralon uyacha qirralari bo'yicha to'rga
    bo'linadi, har katakning balandligi `T - eng chuqur uyacha` (0 bo'lsa teshik).
    CSG kutubxonasiz, r128 mos. Detal uyacha tubiga `layer._top - depth` da o'tiradi.
  - `buildInterior`/`buildItems`/`foamGeom`/`layoutFoamLayers`/`clampItemPos`
    (`editor` emas, karobka-3d.html ichida). `buildBox` oxirida `buildInterior`
    chaqiriladi (dims bilan sinxron). Rejim explode/kesish bilan o'zaro istisno.

## karobka-3d — ichki ko‘rinish rejimlari

- `#ipViews` orqali **Yoyilgan / Ochiq / Yopiq** preview qo‘shildi (`interior.view`,
  `setInteriorView`). Yoyilganda karobka panellari ajraladi, paralon `.38` opacity
  bilan yarim shaffof va qatlamlar `FOAM_EXPLODE_GAP` bo‘yicha oralatib ko‘rinadi.
- Ochiq/yopiqda `cutGroup` + `lidPivot` ishlaydi; qopqoq `interior.lidTarget`ga
  yumshoq animatsiya bilan o‘tadi. Panelda ichki balandlik bo‘yicha **sig‘adi/
  sig‘maydi** va qolgan/oshgan sm ko‘rsatiladi; yopiqda detal drag bloklanadi.

## Karobka 3D — gorizontal arra va tovushlar (qilindi)

- `karobka-3d.html`: `sawGroup` endi X bo'ylab gorizontal kesadi; `cutTrail` va `sawDust` kesish yo'li hamda yog'och changini ko'rsatadi.
- Tashqi audio faylsiz `Sfx` (Web Audio API) arra motori, menteşe ochilishi/yopilishi, yopilish urilishi va UI tovushlarini yaratadi.
- `#soundToggle` hamda `#soundVolume` bilan ovozni o'chirish va balandligini boshqarish mumkin; audio faqat foydalanuvchi harakatidan keyin boshlanadi.

## Karobka 3D — arra/ovoz effektlari 2-iteratsiya

- `cutTrail` olib tashlandi: kesish tugagach qora iz qolmaydi; `blade`/`hub` Z=π/2 bilan X harakatiga perpendikulyar ko‘rinadi.
- `Sfx` ovozi limiter bilan kuchaytirildi (default 80%); `creak` eshik g‘irchillashi, kuchli `thud` yopilish “dup”i qo‘shildi.
- `whoosh` kino effekti asosiy va ichki **Yoyilgan/Yig‘ilgan** ko‘rinishlariga ulandi.

- Audio chekka holatlari: `soundToggle` endi master gain orqali barcha faol tovushni jim qiladi; ichki qopqoq `lidMoving` bilan aniq yopilgan kadrda bir marta `thud` chaladi.
- Diskning YZ tekisligi/X-normal orientatsiyasi foydalanuvchi talabiga ko‘ra ataylab saqlandi (harakat disk yon yuziga perpendikulyar).

## Karobka Creator — alohida konstruktor

- Yangi `karobka-creator.html`: Canvas 2D kontur chizish/tahrirlash (snap, preset,
  pan/zoom, validation) va Three.js real-time 3D devor/tag/qopqoq modeli.
- `computeInnerOffset` + `prismGeometry` MDFni ichkariga offset qiladi; miter rejimida
  90° burchak haqiqiy **45° kesim** bo‘ladi. O‘lcham/burchak annotatsiyasi, devor
  tanlash va cut-list (tashqi/ichki uzunlik, chap/o‘ng arra burchagi) qo‘shildi.
- Loyiha JSON saqlanadi/ochiladi; `exportSvg` millimetrli tashqi/ichki kontur,
  devor poligonlari, miter chiziqlari va o‘lchamlarni SVG reja qilib yuklaydi.

## Kanal Invert vositasi (alohida sahifa)

- Yangi `kanal-invert.html` — mustaqil vosita (albom oqimiga aloqasi yo'q, karobka-3d
  kabi alohida fayl). Audio faylni yuklab, O'NG kanal polarity'sini invert qiladi
  (`dst[i] = -src[i]`), waveform preview + original/invert solishtirib tinglash +
  WAV eksport. To'liq Web Audio API, brauzerda, server yo'q.
- `index.html` header-nav ga "🎵 Kanal Invert" havolasi qo'shildi (`target="_blank"`).
