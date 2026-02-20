/* index.js adaptado para usar IFRAMEs (arquivos locais):
   - assume que classificacao.html e partidas.html estão na mesma pasta
   - controla nav visual, carrossel, mini-table e stats (Próxima Partida removida)
*/

const seasonsData = {
  "2025": {
    teams: [
      { pos:1, name:"Palmeiras", pts:22, pj:8, v:7, e:1, d:0, gp:18, gc:4, form:["win","win","win","win","win"] },
      { pos:2, name:"Vitória", pts:18, pj:8, v:5, e:3, d:0, gp:14, gc:6, form:["draw","win","win","win","draw"] },
      { pos:3, name:"União", pts:16, pj:8, v:5, e:1, d:2, gp:13, gc:9, form:["win","loss","win","draw","win"] },
      { pos:4, name:"Esperança", pts:15, pj:8, v:4, e:3, d:1, gp:12, gc:8, form:["win","draw","draw","win","loss"] }
    ],
    matches: [
      { date: "2026-02-14T16:00:00", home:"São José", away:"Vitória", stadium:"Praça Central" },
      { date: "2026-02-15T16:00:00", home:"União", away:"Esperança", stadium:"Campo do Bairro" }
    ],
    news: [
      { tag:"Líder", title:"São José mantém liderança isolada", text:"Equipe venceu mais uma e segue invicta." },
      { tag:"Rodada", title:"Rodada com muitos gols", text:"Média de gols permanece alta na temporada." }
    ]
  },
  "2026": {
    teams: [
      { pos:1, name:"Vitória", pts:28, pj:10, v:9, e:1, d:0, gp:25, gc:6, form:["win","win","win","win","win"] },
      { pos:2, name:"São José", pts:22, pj:10, v:7, e:1, d:2, gp:17, gc:9, form:["win","win","draw","loss","win"] }
    ],
    matches: [],
    news: [
      { tag:"Resumo", title:"Temporada 2025 revisitada", text:"Relembrando os melhores momentos." }
    ]
  }
};

/* Mini-tabela / stats / carrossel (Próxima Partida removida) */
function renderMiniTable(seasonKey) {
  const season = seasonsData[seasonKey];
  const tbody = document.querySelector("#mini-table tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  const top = (season && season.teams) ? season.teams.slice(0,4) : [];
  top.forEach(t => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${t.pos}</td><td>${t.name}</td><td>${t.pts}</td>`;
    tbody.appendChild(tr);
  });
}



function renderCarousel(seasonKey) {
  const container = document.getElementById("carousel-items");
  if (!container) return;
  container.innerHTML = "";
  const season = seasonsData[seasonKey];
  if (!season || !season.news) return;
  season.news.forEach((n, idx) => {
    const div = document.createElement("div");
    div.className = "carousel-item" + (idx === 0 ? " active" : "");
    div.innerHTML = `<span class="tag">${n.tag}</span><h4>${n.title}</h4><p style="color:var(--muted)">${n.text}</p>`;
    container.appendChild(div);
  });
}

function initCarouselAuto() {
  let idx = 0;
  const items = () => Array.from(document.querySelectorAll(".carousel-item"));
  const show = (i) => items().forEach((it,k)=> it.classList.toggle("active", k===i));
  function next(){ if(items().length===0) return; idx=(idx+1)%items().length; show(idx); }
  function prev(){ if(items().length===0) return; idx=(idx-1+items().length)%items().length; show(idx); }
  document.getElementById("next").addEventListener("click", () => { next(); resetTimer(); });
  document.getElementById("prev").addEventListener("click", () => { prev(); resetTimer(); });
  let timer = setInterval(next, 5000);
  function resetTimer(){ clearInterval(timer); timer = setInterval(next, 5000); }
  return { next, prev };
}

/* ajusta comportamento dos iframes para altura responsiva (tentar ajustar à altura do conteúdo quando mesma origem) */
function adaptIframes() {
  const iframeClassif = document.getElementById('iframe-classificacao');
  const iframePart = document.getElementById('iframe-partidas');

  // tenta ajustar altura se mesma origem
  [iframeClassif, iframePart].forEach(iframe => {
    if (!iframe) return;
    iframe.addEventListener('load', () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        // se conseguimos acessar doc, ajusta altura para conteúdo
        if (doc && doc.body) {
          const h = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight);
          iframe.style.height = Math.min(Math.max(h, 320), 1200) + 'px';
        }
      } catch (err) {
        // cross-origin ou acesso negado: manter altura padrão (responsiva via CSS)
      }
    });
  });
}

/* inicial */
function init() {
  const seasonSelect = document.getElementById("season");
  const seasonTitle = document.getElementById("season-title");

  function refresh(seasonKey) {
    seasonTitle.textContent = seasonKey;
    renderMiniTable(seasonKey);
    computeStats(seasonKey);
    renderCarousel(seasonKey);
  }

  const initial = seasonSelect.value || "2026";
  refresh(initial);

  seasonSelect.addEventListener("change", (e) => refresh(e.target.value));

  document.querySelectorAll('.topnav .nav-link').forEach(link => {
    link.addEventListener('click', function (ev) {
      document.querySelectorAll('.topnav .nav-link').forEach(n => n.classList.remove('active'));
      this.classList.add('active');
    });
  });

  setTimeout(() => initCarouselAuto(), 200);
  adaptIframes();

  // ESC volta para nav inicial
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      document.querySelectorAll('.topnav .nav-link').forEach(n => n.classList.remove('active'));
      document.querySelector('.topnav .nav-link')?.classList.add('active');
    }
  });
}

document.addEventListener("DOMContentLoaded", init);


if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
    .then(() => console.log("Service Worker registrado!"));
}

