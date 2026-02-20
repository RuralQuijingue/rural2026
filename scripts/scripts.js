/* app.js
   Responsável por injetar os dados e simular troca de temporada / interações.
   Simples de estender para APIs reais.
*/

const seasonsData = {
  "2026": [
  { pos: 1, name: "Algodões", logo:"imgs/ALGODOESESCUDO.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 2, name: "Alto", logo:"imgs/ALTO.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 3, name: "Baixa da Luva", logo:"imgs/UNIÃO LUVENSE.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 4, name: "Baraúnas", logo:"imgs/BARAÚNAS.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 5, name: "Boa vista", logo:"imgs/BOA VISTA.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 6, name: "Boa vista do Meio", logo:"imgs/BOA VISTA DO MEIO.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 7, name: "Capoeira", logo:"imgs/capoeira.jpeg", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 8, name: "Estudiantes da Jurema", logo:"imgs/JUREMA.jpeg", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 9, name: "Lagoa da Barra", logo:"imgs/ANACONDA.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 10, name: "Lagoa da Ema", logo:"imgs/LAGOA DA EMA.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 11, name: "Lagoa do Capim", logo:"imgs/LAGOA DO CAPIM.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 12, name: "Lagoa do Fechado", logo:"imgs/JUVENTUS FECHADO.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 13, name: "Lagoinha das Pedras", logo:"imgs/LAGOINHA DAS PEDRAS.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 14, name: "Maceté", logo:"imgs/MACETE.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 15, name: "Muriçoca", logo:"imgs/MURIÇOCA.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 16, name: "Novo Triunfo", logo:"imgs/NOVO TRIUNFO.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 17, name: "Ouricuri", logo:"imgs/OURICURI.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 18, name: "Pascoal", logo:"imgs/PASCOAL.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 19, name: "Pau de Rato", logo:"imgs/PAU DE RATO.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 20, name: "Pedro Caipira", logo:"imgs/LAGOA DO OLIMPIO.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 21, name: "Poço Dantas", logo:"imgs/PINHEIRÃO.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 22, name: "Serrote do Meio", logo:"imgs/SERROTE DO MEIO.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 23, name: "Sitio", logo:"imgs/SITIO.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 24, name: "Sobara", logo:"imgs/SOBARA.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 25, name: "São José da Tabua ", logo:"imgs/TABUA.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 26, name: "Tanque do Rumo", logo:"imgs/ADESTRU.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 27, name: "Tatu", logo:"imgs/TATU.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 28, name: "Terra Branca", logo:"imgs/ESCUDO NG.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 29, name: "Terra Nova", logo:"imgs/TERRA NOVA.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] },
  { pos: 30, name: "Vila Manancial", logo:"imgs/VILA MANANCIAL.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, form: [] }
],
  "2025":  [
     { pos: 1, name: "Cágados", logo:"imgs/LAGOA DOS CAGADOS.png", pts: 25, pj: 10, v: 7, e: 1, d: 2, gp: 18, gc: 6, form:["loss","win","win","win","win"] },
     { pos: 2, name: "Ouricuri", logo:"imgs/OURICURI.png", pts: 18, pj: 10, v: 5, e: 3, d: 2, gp: 14, gc: 8, form:["win","loss","win","draw","draw"] },
     { pos: 3, name: "Alto", logo:"imgs/ALTO.png", pts: 17, pj: 8, v: 5, e: 2, d: 1, gp: 13, gc: 5, form:["loss","draw","draw","win","win"] },
     { pos: 4, name: "Algodões", logo:"imgs/ALGODOESESCUDO.png", pts: 15, pj: 6, v: 5, e: 0, d: 1, gp: 12, gc: 3, form:["win","win","win","loss","win"] },
     { pos: 5, name: "Lagoa do Garrote", logo:"imgs/GARROTE.png", pts: 12, pj: 6, v: 4, e: 0, d: 2, gp: 10, gc: 3, form:["draw","win","loss","win","win"] },
     { pos: 6, name: "Pascoal", logo:"imgs/PASCOAL.png", pts: 11, pj: 6, v: 3, e: 2, d: 1, gp: 2, gc: 4, form:["draw","win","win","draw","loss"] },
     { pos: 7, name: "Lagoa da Ema", logo:"imgs/LAGOA DA EMA.png", pts: 10, pj: 8, v: 3, e: 1, d: 4, gp: 8, gc: 5, form:["loss","loss","win","win","draw"] },
     { pos: 8, name: "Lagoa da Barra", logo:"imgs/ANACONDA.png", pts: 8, pj: 6, v: 2, e: 2, d: 2, gp: 5, gc: 1, form:["win","draw","win","draw","loss"] },
     { pos: 9, name: "Poço Dantas - Desclassificado", logo:"imgs/PINHEIRÃO.png", pts: 4, pj: 2, v: 1, e: 1, d: 0, gp: 3, gc: 2, form:["win","draw","draw","draw","draw"] },
     { pos: 10, name: "Lagoa do Fechado", logo:"imgs/JUVENTUS FECHADO.png", pts: 4, pj: 2, v: 1, e: 1, d: 1, gp: 5, gc: 2, form:["win","loss","draw","draw","draw"] },
     { pos: 11, name: "Tanque do Rumo", logo:"imgs/ADESTRU.png", pts: 4, pj: 4, v: 1, e: 1, d: 2, gp: 2, gc: 4, form:["draw","draw","loss","draw","draw"] },
     { pos: 12, name: "Jurema", logo:"imgs/JUREMA.png", pts: 3, pj: 4, v: 1, e: 0, d: 3, gp: 2, gc: 9, form:["win","draw","loss","draw","draw"] },
     { pos: 13, name: "Vila Manancial", logo:"imgs/VILA MANANCIAL.png", pts: 3, pj: 4, v: 1, e: 0, d: 3, gp: 4, gc: 11, form:["loss","win","loss","loss"] },
     { pos: 14, name: "Tatu", logo:"imgs/TATU.png", pts: 3, pj: 4, v: 0, e: 3, d: 1, gp: 5, gc: 7, form:["draw","draw","draw","loss"] },
     { pos: 15, name: "Baraúnas", logo:"imgs/BARAÚNAS.png", pts: 2, pj: 2, v: 0, e: 2, d: 0, gp: 3, gc: 3, form:["draw","draw","draw","draw","draw"] },
     { pos: 16, name: "Pedro Caipira", logo:"imgs/LAGOA DO OLIMPIO.png", pts: 2, pj: 4, v: 0, e: 2, d: 1, gp: 1, gc: 2, form:["draw","draw","loss","draw"] },
     { pos: 17, name: "Novo Triunfo", logo:"imgs/NOVO TRIUNFO.png", pts: 1, pj: 2, v: 0, e: 1, d: 0, gp: 0, gc: 0, form:["draw","draw"] },
     { pos: 18, name: "Lagoinha das Pedras", logo:"imgs/LAGOINHA DAS PEDRAS.png", pts: 1, pj: 3, v: 0, e: 1, d: 2, gp: 3, gc: 8, form:["loss","draw","loss","draw"] },
     { pos: 19, name: "Capoeira", logo:"imgs/capoeira.jpeg", pts: 1, pj: 2, v: 0, e: 1, d: 1, gp: 0, gc: 2, form:["draw","win"] },
     { pos: 20, name: "Baixa da Luva", logo:"imgs/UNIÃO LUVENSE.png", pts: 0, pj: 2, v: 0, e: 1, d: 0, gp: 1, gc: 1, form:["draw","draw"] },
     { pos: 21, name: "Boa vista", logo:"imgs/BOA VISTA.png", pts: 0, pj: 2, v: 0, e: 0, d: 2, gp: 1, gc: 3, form:["loss","loss"] },
     { pos: 22, name: "Monte Cruzeiro", logo:"imgs/MONTE CRUZEIRO.png", pts: 0, pj: 2, v: 0, e: 0, d: 1, gp: 1, gc: 4, form:["loss","draw"] },
     { pos: 23, name: "Pau de Rato", logo:"imgs/PAU DE RATO.png", pts: 0, pj: 2, v: 0, e: 0, d: 2, gp: 1, gc: 5, form:["loss","loss"] },
     { pos: 24, name: "Capim Grosso", logo:"imgs/CAPIM GROSSO.png", pts: 0, pj: 2, v: 0, e: 0, d: 2, gp: 0, gc: 4, form:["loss","loss"] },
     { pos: 25, name: "Sobara", logo:"imgs/SOBARA.png", pts: 0, pj: 2, v: 0, e: 0, d: 1, gp: 0, gc: 6, form:["loss","loss"] },
     { pos: 26, name: "Terra Nova", logo:"imgs/TERRA NOVA.png", pts: 0, pj: 2, v: 0, e: 0, d: 2, gp: 0, gc: 6, form:["loss","loss"] }
  ],

};


const seasonsStyles = {
  "2025": [
    { className: "cam", positions: [1]},
    { className: "sula", min: 2, max: 26 },           // campeão
   ],
  "2026": [
    { className: "sula", min: 1, max: 30 },
    
  ]
};

/* função que escolhe a zona (classe CSS) baseado na posição e temporada */
function zoneClass(season, pos) {
  const style = seasonsStyles[season];
  if (style && Array.isArray(style)) {
    for (const zone of style) {
      if (Array.isArray(zone.positions) && zone.positions.includes(pos)) return zone.className;
      if (typeof zone.min === "number" && typeof zone.max === "number" && pos >= zone.min && pos <= zone.max) return zone.className;
    }
  }
 // sem classe específica
}

/* gera forma recente aleatória mas com controle para ficar verossímil */
function genForm(seed) {
  const rand = (i) => Math.abs(Math.sin(i * 9301 + 49297)) % 1;
  const arr = [];
  for (let i = 0; i < 5; i++) {
    const r = Math.floor(rand(seed + i) * 3);
    arr.push(r === 0 ? "win" : r === 1 ? "draw" : "loss");
  }
  return arr;
}

/* cria uma "logo" circular com iniciais */
function makeLogo(name) {
  const initials = name.split(" ").map(s => s[0]).slice(0, 2).join('').toUpperCase();
  let hash = 0; for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ["#1abc9c", "#3498db", "#9b59b6", "#e67e22", "#e74c3c", "#2ecc71", "#f39c12", "#16a085"];
  const color = colors[Math.abs(hash) % colors.length];
  return { initials, color };
}

/* renderiza a tabela: agora ordena por pts (desc) e recalcula pos */
function renderTable(season) {
  const raw = seasonsData[season] || [];
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";

  // criar uma cópia para ordenar sem mexer no original (opcional)
  const data = raw.map(t => ({ ...t }));

  // ordenar: pts desc, saldo desc, gp desc, name asc
  data.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const sdA = (a.gp || 0) - (a.gc || 0);
    const sdB = (b.gp || 0) - (b.gc || 0);
    if (sdB !== sdA) return sdB - sdA;
    if ((b.gp || 0) !== (a.gp || 0)) return (b.gp || 0) - (a.gp || 0);
    return (a.name || "").localeCompare(b.name || "");
  });

  // recalcular posições (1..N)
  data.forEach((t, i) => t.pos = i + 1);

  data.forEach(team => {
    const tr = document.createElement("tr");
    // aplica classe baseada na temporada e na nova posição
    const zone = zoneClass(season, team.pos);
    if (zone) tr.className = zone;

    const logoObj = makeLogo(team.name);
    const sg = (team.gp || 0) - (team.gc || 0);

    const form = team.form || genForm(team.pos);
    const formHtml = form.map(f => `<span class="dot ${f}"></span>`).join("");

    const clubLogoHtml = team.logo
      ? `<img class="logo-img" src="${team.logo}" alt="${team.name}" onerror="this.onerror=null;this.outerHTML='<div class=\\'logo-fallback\\'>${team.name[0]}<\\/div>'">`
      : `<div class="logo-fallback">${team.name[0]}</div>`;

    tr.innerHTML = `
      <td class="col-pos"><div class="position">${team.pos}</div></td>
      <td class="col-club">
         <div class="club-cell">
          ${clubLogoHtml}
          <div>
            <div class="club-name">${team.name}</div>
            <small style="color:var(--muted)">${team.gp} GP • ${team.gc} GC</small>
          </div>
        </div>
      </td>
      <td class="col-pts">${team.pts}</td>
      <td class="col-pj">${team.pj}</td>
      <td class="col-v">${team.v}</td>
      <td class="col-e">${team.e}</td>
      <td class="col-d">${team.d}</td>
      <td class="col-gp">${team.gp}</td>
      <td class="col-gc">${team.gc}</td>
      <td class="col-sg ${sg > 0 ? 'sg-pos' : (sg < 0 ? 'sg-neg' : 'sg-zero')}">${sg > 0 ? '+' + sg : sg}</td>
      <td class="col-form"><div class="form">${formHtml}</div></td>
    `;
    tbody.appendChild(tr);
  });
}

/* inicial */
document.addEventListener("DOMContentLoaded", () => {
  const seasonSelect = document.getElementById("season");

  // popula options do select automaticamente (se existir)
  const seasonKeys = Object.keys(seasonsData).sort((a, b) => b - a);
 if (seasonSelect) {
    seasonSelect.innerHTML = seasonKeys.map(s => `<option value="${s}">${s}</option>`).join('');
  }

  // se não tiver elemento season, escolhe a primeira temporada disponível
  const initialSeason = (seasonSelect && seasonSelect.value) ? seasonSelect.value : (seasonKeys.length ? seasonKeys[0] : "2026");
  renderTable(initialSeason);

  if (seasonSelect) {
    seasonSelect.addEventListener("change", (e) => {
      renderTable(e.target.value);
    });
  }

  // links do topo: troca de classe active (só visual, cada link já tem href para a seção)
  document.querySelectorAll('.topnav .nav-link').forEach(link => {
    link.addEventListener('click', function (ev) {
      document.querySelectorAll('.topnav .nav-link').forEach(n => n.classList.remove('active'));
      this.classList.add('active');
    });
  });
});


