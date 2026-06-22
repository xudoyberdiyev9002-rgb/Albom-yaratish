/* IC3 GS6 test muhiti — asosiy logika (vanilla JS) */
(function(){
  'use strict';

  var ALL = window.IC3_QUESTIONS || [];
  var state = {
    questions: [],   // joriy sessiya savollari
    answers: {},     // qId -> javob (tipi savolga bog'liq)
    flags: {},       // qId -> true
    idx: 0,
    timeLeft: 0,
    timer: null
  };

  var $ = function(id){ return document.getElementById(id); };
  function show(screenId){
    ['startScreen','examScreen','resultScreen'].forEach(function(s){
      $(s).classList.toggle('active', s === screenId);
    });
  }
  function shuffle(arr){
    var a = arr.slice();
    for(var i=a.length-1;i>0;i--){
      var j = Math.floor(Math.random()*(i+1));
      var t=a[i];a[i]=a[j];a[j]=t;
    }
    return a;
  }
  function esc(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  var TYPE_LABEL = {
    single:'Bitta javob', multi:'Bir nechta javob', tf:'True / False',
    yn:'Yes / No', match:'Moslashtirish', dropdown:"Bo'sh joy", order:'Tartiblash'
  };

  /* ---------- START ---------- */
  $('totalQs').textContent = ALL.length;
  $('qTo').setAttribute('placeholder', ALL.length);
  $('qFrom').setAttribute('max', ALL.length);
  $('qTo').setAttribute('max', ALL.length);

  $('startBtn').addEventListener('click', function(){
    var qs = gatherSessionQuestions();
    if(!qs) return;
    state.instantFb = $('instantFb').checked;
    beginExam(qs, false);
  });

  // "🎯 Yodlash + mashq": avval fleshkartalar, keyin o'sha savollar testi
  $('studyBtn').addEventListener('click', function(){
    var qs = gatherSessionQuestions();
    if(!qs) return;
    var cards = qs.map(deriveCard);
    if(window.Flashcards && window.Flashcards.run){
      window.Flashcards.run(cards, function(){
        state.instantFb = true;       // yodlash rejimida darhol natija majburiy
        beginExam(qs, true);
      });
    } else {
      state.instantFb = true;
      beginExam(qs, true);
    }
  });

  // Tanlangan oraliq/son/aralashtirish bo'yicha savollar to'plamini quradi
  function gatherSessionQuestions(){
    var count = parseInt($('qCount').value,10) || 0;
    var doShuffle = $('shuffleQ').checked;
    var base = ALL.slice();

    var from = parseInt($('qFrom').value,10);
    var to = parseInt($('qTo').value,10);
    if(isNaN(from)) from = 1;
    if(isNaN(to)) to = ALL.length;
    if(from > to){ var tmp = from; from = to; to = tmp; }
    from = Math.max(1, from);
    to = Math.min(ALL.length, to);
    base = base.slice(from-1, to);

    if(!base.length){
      alert("Tanlangan oraliqda savol yo'q. Oraliqni tekshiring.");
      return null;
    }
    var qs = doShuffle ? shuffle(base) : base;
    if(count > 0 && count < qs.length) qs = qs.slice(0,count);
    return qs;
  }

  // Imtihonni boshlash (umumiy)
  function beginExam(qs, studyMode){
    state.questions = qs;
    state.answers = {};
    state.flags = {};
    state.checked = {};
    state.studyMode = !!studyMode;
    state.idx = 0;

    var mins = parseInt($('timeLimit').value,10);
    if(isNaN(mins)) mins = 0;
    state.timeLeft = mins*60;
    startTimer();

    show('examScreen');
    renderQuestion();
    buildNav();
  }

  // Har qanday savoldan fleshkarta yasaydi (front = savol, back = to'g'ri javob kaliti)
  function deriveCard(q){
    var front = 'Q' + q.id + '. ' + q.q;
    var back = '';
    if(q.type==='single' || q.type==='multi'){
      back = q.options.filter(function(o){return o.c;})
                      .map(function(o){return o.k+'. '+o.t;}).join('\n');
    } else if(q.type==='tf' || q.type==='yn'){
      var pos=q.type==='tf'?'True':'Yes', neg=q.type==='tf'?'False':'No';
      back = q.rows.map(function(r){ return '• '+r.t+'  →  '+(r.a?pos:neg); }).join('\n');
    } else if(q.type==='match'){
      back = q.pairs.map(function(p){ return p.l+'  →  '+p.r; }).join('\n');
    } else if(q.type==='dropdown'){
      back = q.blanks.map(function(b){ return b.pre+'  →  '+b.ans; }).join('\n');
    } else if(q.type==='order'){
      back = q.items.map(function(it,i){ return (i+1)+'. '+it; }).join('\n');
    }
    return { c:'Savol '+q.id, f:front, b:back, qid:q.id };
  }

  /* ---------- TAYMER ---------- */
  function startTimer(){
    clearInterval(state.timer);
    updateTimerLabel();
    if(state.timeLeft <= 0){ $('timer').textContent='∞'; return; }
    state.timer = setInterval(function(){
      state.timeLeft--;
      updateTimerLabel();
      if(state.timeLeft <= 0){ clearInterval(state.timer); finishExam(); }
    },1000);
  }
  function updateTimerLabel(){
    if(state.timeLeft <= 0 && !state.timer){ return; }
    var m = Math.floor(state.timeLeft/60), s = state.timeLeft%60;
    var lbl = (m<10?'0':'')+m+':'+(s<10?'0':'')+s;
    $('timer').textContent = lbl;
    $('timer').classList.toggle('warn', state.timeLeft <= 60 && state.timeLeft > 0);
  }

  /* ---------- SAVOLNI RENDER ---------- */
  function renderQuestion(){
    var q = state.questions[state.idx];
    var n = state.questions.length;
    var locked = !!state.checked[q.id];
    $('qNum').textContent = 'Question ' + q.id;
    $('qType').textContent = TYPE_LABEL[q.type] || q.type;
    $('qText').textContent = q.q;
    $('progressTxt').textContent = (state.idx+1) + ' / ' + n;
    $('progressFill').style.width = ((state.idx+1)/n*100) + '%';

    var box = $('qAnswer');
    box.innerHTML = '';
    var saved = state.answers[q.id];

    // tekshirilgan bo'lsa — yuqorida natija banneri
    if(locked){
      var ok = gradeQuestion(q);
      var bn = document.createElement('div');
      bn.className = 'fb-banner ' + (ok?'correct':'wrong');
      bn.innerHTML = '<span class="fb-ic">'+(ok?'✓':'✗')+'</span>'+
        '<span>'+(ok?"To'g'ri javob!":"Noto'g'ri")+
        '<span class="fb-sub">'+(ok?'Tabriklaymiz, davom eting.':"Quyida to'g'ri javob yashil rangda ko'rsatilgan.")+'</span></span>';
      box.appendChild(bn);
    }

    // yodlash rejimi: xato javobda fleshkarta qayta ko'rinadi
    if(locked && state.studyMode && !gradeQuestion(q)){
      var card = deriveCard(q);
      var sc = document.createElement('div');
      sc.className = 'study-card';
      sc.innerHTML = '<div class="sc-head">🃏 Fleshkarta — yodlang</div>'+
        '<div class="sc-body"><div class="sc-cue">'+esc(card.f)+'</div>'+
        '<div class="sc-ans">'+esc(card.b)+'</div></div>';
      box.appendChild(sc);
    }

    if(q.type === 'single' || q.type === 'multi'){
      renderChoice(box, q, saved, locked);
    } else if(q.type === 'tf' || q.type === 'yn'){
      renderGrid(box, q, saved, locked);
    } else if(q.type === 'match'){
      renderMatch(box, q, saved, locked);
    } else if(q.type === 'dropdown'){
      renderDropdown(box, q, saved, locked);
    } else if(q.type === 'order'){
      renderOrder(box, q, saved, locked);
    }

    // tugmalar holati
    $('prevBtn').disabled = state.idx === 0;
    $('nextBtn').style.display = state.idx === n-1 ? 'none' : '';
    $('flagBtn').classList.toggle('on', !!state.flags[q.id]);
    updateCheckBtn();
  }

  // "Tekshirish" tugmasi: faqat instant rejimda, javob berilgan va hali tekshirilmagan bo'lsa faol
  function updateCheckBtn(){
    var q = state.questions[state.idx];
    var btn = $('checkBtn');
    if(!state.instantFb){ btn.style.display = 'none'; return; }
    btn.style.display = '';
    var locked = !!state.checked[q.id];
    btn.disabled = locked || !isAnswered(q);
  }

  /* single / multi */
  function renderChoice(box, q, saved, locked){
    var isMulti = q.type === 'multi';
    if(isMulti){
      var hint = document.createElement('div');
      hint.style.cssText='color:var(--muted);font-size:13px;margin-bottom:12px';
      hint.textContent = (q.choose||2) + " ta to'g'ri javobni tanlang";
      box.appendChild(hint);
    }
    saved = saved || [];
    q.options.forEach(function(o){
      var el = document.createElement('div');
      el.className = 'opt' + (isMulti?'':' radio');
      var sel = saved.indexOf(o.k) >= 0;
      if(sel) el.classList.add('sel');
      var resIc = '';
      if(locked){
        el.classList.add('locked');
        if(o.c){ el.classList.remove('sel'); el.classList.add('correct'); resIc = '<span class="res-ic">✓</span>'; }
        else if(sel){ el.classList.remove('sel'); el.classList.add('wrong'); resIc = '<span class="res-ic">✗</span>'; }
      }
      var markTxt = locked ? (o.c?'✓':(sel?'✗':'')) : (sel?(isMulti?'✓':'●'):'');
      el.innerHTML = '<span class="mark">'+markTxt+'</span>'+
                     '<span class="otxt"><span class="ltr">'+o.k+'.</span> '+esc(o.t)+'</span>'+resIc;
      if(!locked){
        el.addEventListener('click', function(){
          var cur = state.answers[q.id] || [];
          if(isMulti){
            var i = cur.indexOf(o.k);
            if(i>=0) cur.splice(i,1); else cur.push(o.k);
          } else {
            cur = [o.k];
          }
          state.answers[q.id] = cur;
          renderQuestion();
          markNav();
        });
      }
      box.appendChild(el);
    });
  }

  /* tf / yn */
  function renderGrid(box, q, saved, locked){
    saved = saved || {};
    var posLbl = q.type==='tf' ? 'True' : 'Yes';
    var negLbl = q.type==='tf' ? 'False' : 'No';
    var tbl = document.createElement('table');
    tbl.className = 'grid-q';
    var head = '<tr><th style="text-align:left;width:auto"></th><th>'+posLbl+'</th><th>'+negLbl+'</th></tr>';
    var rows = q.rows.map(function(r, ri){
      var cur = saved[ri];
      function pill(val, lbl){
        var cls = 'pill';
        var selected = cur === val;
        if(locked){
          cls += ' locked';
          if(r.a === val) cls += ' correct';          // to'g'ri javob — yashil
          else if(selected) cls += ' wrong';          // xato tanlov — qizil
        } else if(selected){
          cls += ' sel';
        }
        return '<span class="'+cls+'" data-r="'+ri+'" data-v="'+(val?1:0)+'">'+lbl+'</span>';
      }
      return '<tr>'+
        '<td class="st">'+esc(r.t)+'</td>'+
        '<td class="ch">'+pill(true,posLbl)+'</td>'+
        '<td class="ch">'+pill(false,negLbl)+'</td>'+
        '</tr>';
    }).join('');
    tbl.innerHTML = head + rows;
    if(!locked){
      tbl.addEventListener('click', function(e){
        var p = e.target.closest('.pill');
        if(!p) return;
        var ri = parseInt(p.getAttribute('data-r'),10);
        var v = p.getAttribute('data-v') === '1';
        var cur = state.answers[q.id] || {};
        cur[ri] = v;
        state.answers[q.id] = cur;
        renderQuestion();
        markNav();
      });
    }
    box.appendChild(tbl);
  }

  /* match — chapdagilarga o'ng tomon tanlovi */
  function renderMatch(box, q, saved, locked){
    saved = saved || {};
    var rights = shuffleStable(q, q.pairs.map(function(p){return p.r;}));
    q.pairs.forEach(function(p, pi){
      var row = document.createElement('div');
      row.className = 'match-row';
      var your = saved[pi];
      var optsHtml = '<option value="">— tanlang —</option>' + rights.map(function(r){
        return '<option value="'+esc(r)+'"'+(your===r?' selected':'')+'>'+esc(r)+'</option>';
      }).join('');
      var note = '';
      if(locked){
        var right = your === p.r;
        row.classList.add(right ? 'correct' : 'wrong');
        if(!right) note = '<div class="fb-correct-note">To\'g\'ri: '+esc(p.r)+'</div>';
      }
      row.innerHTML = '<div class="match-left">'+esc(p.l)+note+'</div>'+
                      '<span class="match-arrow">→</span>'+
                      '<select data-p="'+pi+'"'+(locked?' disabled':'')+'>'+optsHtml+'</select>';
      if(!locked){
        row.querySelector('select').addEventListener('change', function(){
          var cur = state.answers[q.id] || {};
          cur[pi] = this.value;
          state.answers[q.id] = cur;
          markNav();
          updateCheckBtn();
        });
      }
      box.appendChild(row);
    });
  }
  // o'ng variantlarni bir marta aralashtirib eslab qolish
  function shuffleStable(q, arr){
    if(!q._shuf) q._shuf = shuffle(arr);
    return q._shuf;
  }

  /* dropdown */
  function renderDropdown(box, q, saved, locked){
    saved = saved || {};
    q.blanks.forEach(function(b, bi){
      var row = document.createElement('div');
      row.className = 'blank-row';
      var your = saved[bi];
      var optsHtml = '<option value="">—</option>' + b.opts.map(function(o){
        return '<option value="'+esc(o)+'"'+(your===o?' selected':'')+'>'+esc(o)+'</option>';
      }).join('');
      var note = '';
      if(locked){
        var right = your === b.ans;
        row.classList.add(right ? 'correct' : 'wrong');
        if(!right) note = ' <span class="fb-correct-note">(To\'g\'ri: '+esc(b.ans)+')</span>';
      }
      row.innerHTML = esc(b.pre) + ' <select data-b="'+bi+'"'+(locked?' disabled':'')+'>'+optsHtml+'</select> ' + esc(b.post||'') + note;
      if(!locked){
        row.querySelector('select').addEventListener('change', function(){
          var cur = state.answers[q.id] || {};
          cur[bi] = this.value;
          state.answers[q.id] = cur;
          markNav();
          updateCheckBtn();
        });
      }
      box.appendChild(row);
    });
  }

  /* order */
  function renderOrder(box, q, saved, locked){
    var order = saved ? saved.slice() : shuffleStable(q, q.items.map(function(_,i){return i;}));
    state.answers[q.id] = order;
    var wrap = document.createElement('div');
    box.appendChild(wrap);
    function redraw(){
      wrap.innerHTML = '';
      order.forEach(function(itemIdx, pos){
        var el = document.createElement('div');
        el.className = 'order-item';
        var extra = '';
        if(locked){
          var right = itemIdx === pos;
          el.style.borderColor = right ? 'var(--green)' : 'var(--red)';
          extra = '<span class="res-ic" style="color:'+(right?'var(--green)':'var(--red)')+'">'+(right?'✓':'✗')+'</span>';
        }
        el.innerHTML = '<span class="ord-n">'+(pos+1)+'</span>'+
          '<span class="ord-txt">'+esc(q.items[itemIdx])+'</span>'+
          (locked ? extra :
          '<span class="ord-btns">'+
            '<button data-dir="-1" data-pos="'+pos+'"'+(pos===0?' disabled':'')+'>↑</button>'+
            '<button data-dir="1" data-pos="'+pos+'"'+(pos===order.length-1?' disabled':'')+'>↓</button>'+
          '</span>');
        wrap.appendChild(el);
      });
    }
    if(!locked){
      wrap.addEventListener('click', function(e){
      var b = e.target.closest('button[data-dir]');
      if(!b) return;
      var pos = parseInt(b.getAttribute('data-pos'),10);
      var dir = parseInt(b.getAttribute('data-dir'),10);
      var np = pos+dir;
      if(np<0 || np>=order.length) return;
      var t = order[pos]; order[pos]=order[np]; order[np]=t;
      state.answers[q.id] = order.slice();
      redraw();
      markNav();
      });
    }
    redraw();
  }

  /* ---------- NAVIGATSIYA ---------- */
  $('prevBtn').addEventListener('click', function(){
    if(state.idx>0){ state.idx--; renderQuestion(); }
  });
  $('checkBtn').addEventListener('click', function(){
    var q = state.questions[state.idx];
    if(!isAnswered(q) || state.checked[q.id]) return;
    state.checked[q.id] = true;
    renderQuestion();
    markNav();
  });
  $('nextBtn').addEventListener('click', function(){
    var q = state.questions[state.idx];
    // instant rejim: javob berilgan, lekin hali tekshirilmagan bo'lsa — avval natijani ko'rsatamiz
    if(state.instantFb && isAnswered(q) && !state.checked[q.id]){
      state.checked[q.id] = true;
      renderQuestion();
      markNav();
      return;
    }
    if(state.idx < state.questions.length-1){ state.idx++; renderQuestion(); }
  });
  $('flagBtn').addEventListener('click', function(){
    var q = state.questions[state.idx];
    state.flags[q.id] = !state.flags[q.id];
    renderQuestion();
    markNav();
  });
  $('navToggle').addEventListener('click', function(){ $('navOverlay').classList.add('open'); });
  $('navClose').addEventListener('click', function(){ $('navOverlay').classList.remove('open'); });
  $('navOverlay').addEventListener('click', function(e){
    if(e.target === this) this.classList.remove('open');
  });
  $('finishBtn').addEventListener('click', function(){
    var unanswered = state.questions.filter(function(q){ return !isAnswered(q); }).length;
    var msg = unanswered>0
      ? unanswered + " ta savol javobsiz qoldi. Baribir yakunlaysizmi?"
      : "Testni yakunlaysizmi?";
    if(confirm(msg)) finishExam();
  });

  function buildNav(){
    var grid = $('navGrid');
    grid.innerHTML = '';
    state.questions.forEach(function(q, i){
      var c = document.createElement('button');
      c.className = 'nav-cell';
      c.textContent = q.id;
      c.addEventListener('click', function(){
        state.idx = i; renderQuestion();
        $('navOverlay').classList.remove('open');
      });
      grid.appendChild(c);
    });
    markNav();
  }
  function markNav(){
    var cells = $('navGrid').children;
    state.questions.forEach(function(q, i){
      var c = cells[i];
      if(!c) return;
      c.classList.toggle('answered', isAnswered(q));
      c.classList.toggle('flagged', !!state.flags[q.id]);
      c.classList.toggle('current', i===state.idx);
    });
  }

  function isAnswered(q){
    var a = state.answers[q.id];
    if(a == null) return false;
    if(q.type==='single'||q.type==='multi') return a.length>0;
    if(q.type==='tf'||q.type==='yn') return Object.keys(a).length === q.rows.length;
    if(q.type==='match') return q.pairs.every(function(_,i){ return a[i]; });
    if(q.type==='dropdown') return q.blanks.every(function(_,i){ return a[i]; });
    if(q.type==='order') return true;
    return false;
  }

  /* ---------- BAHOLASH ---------- */
  function gradeQuestion(q){
    var a = state.answers[q.id];
    if(q.type==='single' || q.type==='multi'){
      var correctKeys = q.options.filter(function(o){return o.c;}).map(function(o){return o.k;});
      var picked = a || [];
      if(picked.length !== correctKeys.length) return false;
      return correctKeys.every(function(k){ return picked.indexOf(k)>=0; });
    }
    if(q.type==='tf' || q.type==='yn'){
      if(!a) return false;
      return q.rows.every(function(r,i){ return a[i] === r.a; });
    }
    if(q.type==='match'){
      if(!a) return false;
      return q.pairs.every(function(p,i){ return a[i] === p.r; });
    }
    if(q.type==='dropdown'){
      if(!a) return false;
      return q.blanks.every(function(b,i){ return a[i] === b.ans; });
    }
    if(q.type==='order'){
      if(!a) return false;
      return a.every(function(itemIdx, pos){ return itemIdx === pos; });
    }
    return false;
  }

  function finishExam(){
    clearInterval(state.timer);
    var total = state.questions.length;
    var correct = 0;
    state.questions.forEach(function(q){ if(gradeQuestion(q)) correct++; });
    var pct = total ? Math.round(correct/total*100) : 0;
    // IC3 baholash: 0-1000 shkala, 700 = o'tish
    var scaled = Math.round(pct*10);
    var pass = scaled >= 700;

    $('scorePct').textContent = pct + '%';
    $('scoreSub').textContent = correct + ' / ' + total;
    $('scoreRing').style.setProperty('--deg', (pct*3.6)+'deg');
    $('scoreRing').style.background =
      'conic-gradient('+(pass?'var(--green)':'var(--amber)')+' 0deg, '+
      (pass?'var(--green)':'var(--amber)')+' '+(pct*3.6)+'deg, var(--card2) '+(pct*3.6)+'deg)';
    var lbl = $('passLabel');
    lbl.textContent = pass ? "O'tdingiz! ✓" : "O'tmadingiz";
    lbl.className = pass ? 'pass' : 'fail';
    $('resultMeta').textContent = 'IC3 bali: ' + scaled + ' / 1000  (o\'tish: 700)';

    buildReview();
    setupStudyWrongBtn();
    show('resultScreen');
    window.scrollTo(0,0);
  }

  // Yodlash rejimi: xato savollarni fleshkarta sifatida qayta ko'rish
  function setupStudyWrongBtn(){
    var btn = $('studyWrongBtn');
    var wrongs = state.questions.filter(function(q){ return !gradeQuestion(q); });
    if(state.studyMode && wrongs.length && window.Flashcards && window.Flashcards.run){
      btn.style.display = '';
      btn.textContent = '🃏 Xato savollarni fleshkarta bilan takrorlash (' + wrongs.length + ')';
      btn.onclick = function(){
        window.Flashcards.run(wrongs.map(deriveCard), function(){
          show('resultScreen');
          window.scrollTo(0,0);
        }, '✓ Natijaga qaytish');
      };
    } else {
      btn.style.display = 'none';
      btn.onclick = null;
    }
  }

  function buildReview(){
    var list = $('reviewList');
    list.innerHTML = '<h3 style="margin-bottom:16px">Javoblar tahlili</h3>';
    state.questions.forEach(function(q, i){
      var ok = gradeQuestion(q);
      var item = document.createElement('div');
      item.className = 'rev-item ' + (ok?'correct':'wrong');
      var html = '<div class="rev-q"><span class="badge '+(ok?'correct':'wrong')+'">'+
                 (ok?'TO\'G\'RI':'XATO')+'</span>'+q.id+'. '+esc(q.q)+'</div>';
      html += renderReviewBody(q);
      item.innerHTML = html;
      list.appendChild(item);
    });
  }

  function renderReviewBody(q){
    var a = state.answers[q.id] || (q.type==='single'||q.type==='multi'?[]:{});
    var out = '';
    if(q.type==='single' || q.type==='multi'){
      q.options.forEach(function(o){
        var picked = a.indexOf(o.k) >= 0;
        var cls = o.c ? 'ok' : (picked ? 'no' : '');
        var ic = o.c ? '✓' : (picked ? '✗' : '•');
        out += '<div class="rev-line '+cls+'"><span class="ic">'+ic+'</span><span>'+o.k+'. '+esc(o.t)+
               (picked?'<span class="yourtag">(sizning tanlovingiz)</span>':'')+'</span></div>';
      });
    } else if(q.type==='tf' || q.type==='yn'){
      var pos=q.type==='tf'?'True':'Yes', neg=q.type==='tf'?'False':'No';
      q.rows.forEach(function(r,i){
        var your = a[i];
        var right = your === r.a;
        var yourTxt = your===undefined?'—':(your?pos:neg);
        out += '<div class="rev-line '+(right?'ok':'no')+'"><span class="ic">'+(right?'✓':'✗')+'</span>'+
               '<span>'+esc(r.t)+' <span class="yourtag">to\'g\'ri: '+(r.a?pos:neg)+
               ' · siz: '+yourTxt+'</span></span></div>';
      });
    } else if(q.type==='match'){
      q.pairs.forEach(function(p,i){
        var your = a[i];
        var right = your === p.r;
        out += '<div class="rev-line '+(right?'ok':'no')+'"><span class="ic">'+(right?'✓':'✗')+'</span>'+
               '<span>'+esc(p.l)+' → <b>'+esc(p.r)+'</b>'+
               (right?'':' <span class="yourtag">siz: '+esc(your||'—')+'</span>')+'</span></div>';
      });
    } else if(q.type==='dropdown'){
      q.blanks.forEach(function(b,i){
        var your = a[i];
        var right = your === b.ans;
        out += '<div class="rev-line '+(right?'ok':'no')+'"><span class="ic">'+(right?'✓':'✗')+'</span>'+
               '<span>'+esc(b.pre)+' → <b>'+esc(b.ans)+'</b>'+
               (right?'':' <span class="yourtag">siz: '+esc(your||'—')+'</span>')+'</span></div>';
      });
    } else if(q.type==='order'){
      var your = a || [];
      q.items.forEach(function(it, correctPos){
        var yourPos = your.indexOf(correctPos);
        var right = yourPos === correctPos;
        out += '<div class="rev-line '+(right?'ok':'no')+'"><span class="ic">'+(correctPos+1)+'.</span>'+
               '<span><b>'+esc(it)+'</b>'+(right?'':' <span class="yourtag">siz uni '+(yourPos+1)+'-o\'ringa qo\'ydingiz</span>')+'</span></div>';
      });
    }
    return out;
  }

  /* ---------- NATIJA TUGMALARI ---------- */
  $('reviewBtn').addEventListener('click', function(){
    var rl = $('reviewList');
    rl.scrollIntoView({behavior:'smooth'});
  });
  $('restartBtn').addEventListener('click', function(){
    // savollardagi vaqtinchalik shuffle keshini tozalash
    ALL.forEach(function(q){ delete q._shuf; });
    show('startScreen');
    window.scrollTo(0,0);
  });

  // boshlang'ich ekran
  show('startScreen');
})();
