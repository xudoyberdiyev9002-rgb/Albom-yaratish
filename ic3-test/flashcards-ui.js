/* IC3 GS6 — Fleshkartalar bo'limi logikasi (vanilla JS)
 * Ikki rejim:
 *   browse — start ekranidagi "🃏 Fleshkartalar" (barcha kartalar, kategoriya filtri)
 *   run    — tashqaridan (quiz.js) berilgan deck: yodlash bosqichi, oxirida onDone()
 */
(function(){
  'use strict';
  var ALL = window.IC3_FLASHCARDS || [];
  var $ = function(id){ return document.getElementById(id); };

  var fc = {
    cards: [],
    idx: 0,
    shuffled: false,
    mode: 'browse',   // 'browse' | 'run'
    onDone: null,
    _swiped: false
  };

  function shuffle(arr){
    var a = arr.slice();
    for(var i=a.length-1;i>0;i--){
      var j=Math.floor(Math.random()*(i+1));
      var t=a[i];a[i]=a[j];a[j]=t;
    }
    return a;
  }

  function hideAllScreens(){
    var scr = document.querySelectorAll('.screen');
    for(var i=0;i<scr.length;i++) scr[i].classList.remove('active');
  }

  /* ---------- browse rejimi (start ekranidan) ---------- */
  function openFlash(){
    fc.mode = 'browse';
    fc.shuffled = false;
    hideAllScreens();
    $('flashScreen').classList.add('active');
    setRunUI(false);
    $('flashCat').value = '';
    window.scrollTo(0,0);
    applyFilter();
  }

  /* ---------- run rejimi (quiz.js dan) ---------- */
  function run(cards, onDone, doneLabel){
    fc.mode = 'run';
    fc.onDone = onDone || null;
    fc.shuffled = false;
    fc.cards = cards.slice();
    fc.idx = 0;
    hideAllScreens();
    $('flashScreen').classList.add('active');
    setRunUI(true);
    $('fcDone').textContent = doneLabel || '✓ Testni boshlash';
    window.scrollTo(0,0);
    render();
  }

  // run rejimida: kategoriya yashirin, "Testni boshlash" tugmasi ko'rinadi
  function setRunUI(isRun){
    $('flashCat').style.display = isRun ? 'none' : '';
    $('fcDone').style.display = isRun ? '' : 'none';
  }

  function closeFlash(){
    // ortga: testga emas, start ekraniga (yodlashni bekor qiladi)
    fc.mode = 'browse'; fc.onDone = null;
    $('flashScreen').classList.remove('active');
    $('startScreen').classList.add('active');
    window.scrollTo(0,0);
  }

  function fillCats(){
    var cats = [];
    ALL.forEach(function(c){ if(cats.indexOf(c.c)<0) cats.push(c.c); });
    var sel = $('flashCat');
    cats.forEach(function(cat){
      var o = document.createElement('option');
      o.value = cat; o.textContent = cat;
      sel.appendChild(o);
    });
  }

  function applyFilter(){
    if(fc.mode !== 'browse') return;
    var cat = $('flashCat').value;
    var base = cat ? ALL.filter(function(c){ return c.c === cat; }) : ALL.slice();
    fc.cards = fc.shuffled ? shuffle(base) : base;
    fc.idx = 0;
    render();
  }

  function render(){
    var card = $('flashcard');
    card.classList.remove('flipped');
    var n = fc.cards.length;
    $('flashCounter').textContent = (n? (fc.idx+1):0) + ' / ' + n;
    if(!n){
      $('fcCat').textContent=''; $('fcFront').textContent='Karta yo\u2019q';
      $('fcBack').textContent=''; return;
    }
    var c = fc.cards[fc.idx];
    $('fcCat').textContent = c.c || '';
    $('fcFront').textContent = c.f;
    $('fcBack').textContent = c.b;
  }

  function flip(){ $('flashcard').classList.toggle('flipped'); }
  function next(){ if(!fc.cards.length) return; fc.idx=(fc.idx+1)%fc.cards.length; render(); }
  function prev(){ if(!fc.cards.length) return; fc.idx=(fc.idx-1+fc.cards.length)%fc.cards.length; render(); }

  /* ---------- hodisalar ---------- */
  $('openFlash').addEventListener('click', openFlash);
  $('flashBack').addEventListener('click', closeFlash);
  $('flashCat').addEventListener('change', applyFilter);
  $('flashShuffle').addEventListener('click', function(){
    if(fc.mode === 'run'){
      fc.cards = shuffle(fc.cards); fc.idx = 0; render();
    } else {
      fc.shuffled = true; applyFilter();
    }
  });
  $('fcDone').addEventListener('click', function(){
    var cb = fc.onDone;
    fc.mode='browse'; fc.onDone=null;
    $('flashScreen').classList.remove('active');
    if(typeof cb === 'function') cb();
  });
  $('flashcard').addEventListener('click', function(){
    if(fc._swiped){ fc._swiped=false; return; }
    flip();
  });
  $('fcFlip').addEventListener('click', flip);
  $('fcNext').addEventListener('click', next);
  $('fcPrev').addEventListener('click', prev);

  document.addEventListener('keydown', function(e){
    if(!$('flashScreen').classList.contains('active')) return;
    if(e.key==='ArrowRight') next();
    else if(e.key==='ArrowLeft') prev();
    else if(e.key===' '||e.key==='Enter'){ e.preventDefault(); flip(); }
  });

  var sx=0, sy=0;
  var cardEl = $('flashcard');
  cardEl.addEventListener('touchstart', function(e){
    var t=e.changedTouches[0]; sx=t.clientX; sy=t.clientY;
  }, {passive:true});
  cardEl.addEventListener('touchend', function(e){
    var t=e.changedTouches[0];
    var dx=t.clientX-sx, dy=t.clientY-sy;
    if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)){
      fc._swiped = true;
      if(dx<0) next(); else prev();
    }
  }, {passive:true});

  fillCats();

  // tashqi API (quiz.js uchun)
  window.Flashcards = { run: run };
})();
