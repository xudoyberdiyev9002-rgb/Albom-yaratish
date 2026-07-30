let products = [];

function renderTable() {
  const table = document.getElementById("itemsTable");
  const emptyHint = document.getElementById("emptyHint");

  let html = `<tr>
      <th>Uzunligi</th>
      <th>Soni</th>
      <th></th>
    </tr>`;

  products.forEach((item, index) => {
    html += `<tr>
        <td>${item.size} mm</td>
        <td>${item.count}</td>
        <td><button class="btn-icon-sm" onclick="removeItem(${index})" title="O'chirish">✕</button></td>
      </tr>`;
  });

  table.innerHTML = html;
  emptyHint.style.display = products.length ? "none" : "block";
}

function addItem() {
  const sizeInput = document.getElementById("size");
  const countInput = document.getElementById("count");
  const size = parseInt(sizeInput.value);
  const count = parseInt(countInput.value);

  if (!size || size <= 0 || !count || count <= 0) {
    alert("Uzunlik va sonni to'g'ri kiriting.");
    return;
  }

  products.push({ size, count });
  renderTable();

  sizeInput.value = "";
  countInput.value = "";
  sizeInput.focus();
}

function removeItem(index) {
  products.splice(index, 1);
  renderTable();
}

function groupPieces(arr) {
  let map = {};
  arr.forEach(item => {
    map[item] = (map[item] || 0) + 1;
  });
  return Object.keys(map)
    .sort((a, b) => b - a)
    .map(key => `${key} mm × ${map[key]} dona`)
    .join("<br>");
}

function calculate() {
  const BAR_LENGTH = parseInt(document.getElementById("barLength").value);
  const KERF = parseInt(document.getElementById("kerf").value) || 0;

  if (!BAR_LENGTH || BAR_LENGTH <= 0) {
    alert("Reka uzunligini to'g'ri kiriting.");
    return;
  }
  if (products.length === 0) {
    alert("Kamida bitta detal kiriting.");
    return;
  }

  let allPieces = [];
  products.forEach(item => {
    for (let i = 0; i < item.count; i++) {
      allPieces.push(item.size);
    }
  });

  if (allPieces.some(p => p > BAR_LENGTH)) {
    alert("Ba'zi detallar reka uzunligidan katta. Ularni tekshiring.");
    return;
  }

  allPieces.sort((a, b) => b - a);

  let bars = [];
  // First Fit Decreasing
  allPieces.forEach(piece => {
    let placed = false;
    for (let bar of bars) {
      let used = bar.reduce((a, b) => a + b, 0);
      let kerfLoss = bar.length * KERF; // har bir kesimga bitta arra yo'qotishi
      if (used + kerfLoss + piece <= BAR_LENGTH) {
        bar.push(piece);
        placed = true;
        break;
      }
    }
    if (!placed) {
      bars.push([piece]);
    }
  });

  let totalWaste = 0;
  let totalKerfLoss = 0;
  let totalUsed = 0;

  let html = '<div class="result-card cut-list-wrap">';
  html += `<h2>📋 Kesish ro'yxati</h2>
    <p class="summary-line">Reka uzunligi: <b>${BAR_LENGTH} mm</b></p>
    <p class="summary-line">Arra qalinligi: <b>${KERF} mm</b></p>
    <div class="stat-badge">Kerakli rekalar soni: <b>${bars.length} ta</b></div>`;

  let graph = '<div class="graph-card"><h2>📊 Rekalar bandligi</h2>';

  bars.forEach((bar, index) => {
    let used = bar.reduce((a, b) => a + b, 0);
    let kerfLoss = bar.length * KERF;
    let occupied = used + kerfLoss;
    let waste = BAR_LENGTH - occupied;
    totalWaste += waste;
    totalKerfLoss += kerfLoss;
    totalUsed += used;

    html += `<div class="bar-section">
        <h3>${index + 1}-reka</h3>
        <div class="cut-list">${groupPieces(bar)}</div>
        <div class="stat-row">
          <span>Detallar jami: <b>${used} mm</b></span>
          <span>Arra yo'qotishi: <b>${kerfLoss} mm</b></span>
          <span>Jami ishlatilgan: <b>${occupied} mm</b></span>
          <span>Qoldiq: <b>${waste} mm</b></span>
        </div>
      </div>`;

    let percent = (occupied / BAR_LENGTH) * 100;
    graph += `<div class="graph-row">
        <div class="graph-label"><span>${index + 1}-reka</span><span>${percent.toFixed(1)}%</span></div>
        <div class="graph"><div class="bar" style="width:${percent}%"></div></div>
      </div>`;
  });

  let efficiency = (((totalUsed + totalKerfLoss) / (bars.length * BAR_LENGTH)) * 100).toFixed(2);

  html += `<h2 style="margin-top:18px">📈 Umumiy hisobot</h2>
    <div class="report-grid">
      <div class="report-item"><div class="num">${efficiency}%</div><div class="lbl">Foydalanish</div></div>
      <div class="report-item"><div class="num">${totalKerfLoss} mm</div><div class="lbl">Arra yo'qotishi</div></div>
      <div class="report-item"><div class="num">${totalWaste} mm</div><div class="lbl">Umumiy qoldiq</div></div>
    </div>
  </div>`;

  graph += "</div>";

  document.getElementById("result").innerHTML = html;
  document.getElementById("graphResult").innerHTML = graph;
  document.getElementById("result").scrollIntoView({ behavior: "smooth", block: "start" });
}

function printResult() {
  if (document.getElementById("result").innerHTML === "") {
    alert("Avval hisoblang.");
    return;
  }
  window.print();
}

function clearAll() {
  products = [];
  renderTable();
  document.getElementById("result").innerHTML = "";
  document.getElementById("graphResult").innerHTML = "";
}

renderTable();
