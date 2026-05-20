// ╔══════════════════════════════════════════════════════╗
// ║  site.js — РЕНДЕРИНГ СТОРІНОК                       ║
// ╚══════════════════════════════════════════════════════╝

(function(){
  const D = SiteData;

  // ── APPLY DESIGN VARIABLES ──────────────────────────
  function applyDesign(){
    const r = document.documentElement.style;
    r.setProperty('--green',  D.design.colorGreen);
    r.setProperty('--amber',  D.design.colorAmber);
    r.setProperty('--bg',     D.design.colorBg);
    // green-light: lighten green
    const g = D.design.colorGreen;
    const pr = parseInt(g.slice(1,3),16), pg = parseInt(g.slice(3,5),16), pb = parseInt(g.slice(5,7),16);
    const lr = Math.round(pr+(240-pr)*.82), lg = Math.round(pg+(240-pg)*.82), lb = Math.round(pb+(240-pb)*.82);
    r.setProperty('--green-light', `rgb(${lr},${lg},${lb})`);
  }

  // ── BUILD HERO ───────────────────────────────────────
  function buildHero(activePage){
    const d = D.design;
    const nav = [
      {href:'index.html', label:'🏠 Головна',     id:'home'},
      {href:'life.html',  label:'📰 Життя села',  id:'life'},
      {href:'info.html',  label:'ℹ️ Для клієнтів',id:'info'},
    ];
    const navHTML = nav.map(n =>
      `<a href="${n.href}" class="nav-link${n.id===activePage?' active':''}">${n.label}</a>`
    ).join('');

    const controlsHTML = activePage === 'home' ? `
      <div class="controls">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input type="text" id="search" placeholder="Пошук..." oninput="window.siteSearch(this.value)">
        </div>
        <div class="cats-scroll" id="cats"></div>
      </div>` : '';

    if(d.headerPhoto){
      return `<div class="site-hero">
        <img class="hero-bg-img" src="${d.headerPhoto}" alt="">
        <div class="hero-tint"></div>
        <div class="hero-overlay">
          <span class="header-leaf">🌿</span>
          <div class="site-title">${d.siteName}</div>
          <div class="site-sub">${d.siteSubtitle}</div>
        </div>
        <div class="nav-bar">${navHTML}</div>
        ${controlsHTML}
      </div>`;
    } else {
      return `<div class="site-hero">
        <div class="hero-no-photo">
          <span class="header-leaf">🌿</span>
          <div class="site-title">${d.siteName}</div>
          <div class="site-sub">${d.siteSubtitle}</div>
        </div>
        <div class="nav-bar no-photo">${navHTML}</div>
        ${controlsHTML}
      </div>`;
    }
  }

  // ── RENDER BLOCKS ────────────────────────────────────
  function renderBlock(block){
    switch(block.type){
      case 'announcements': return renderAnnouncements();
      case 'sellers':       return renderSellers(D.sellers);
      case 'life':          return renderLife();
      case 'info':          return renderInfo();
      default: return '';
    }
  }

  function renderAnnouncements(){
    if(!D.announcements.length) return '';
    return `<div class="news-board page-block" data-block-id="announcements">
      <div class="news-board-header">📌 Дошка оголошень</div>
      <div class="news-list">
        ${D.announcements.map(n=>`
          <div class="news-item ${n.priority}">
            <div class="news-emoji">${n.emoji}</div>
            <div class="news-body">
              <div class="news-title">${n.title}</div>
              <div class="news-text">${n.text}</div>
              <div class="news-date">${n.date}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
  }

  function renderSellers(list){
    const catAll = [{id:'all',label:'Всі'}, ...D.categories];
    const grid = list.map(s => {
      const cat = D.categories.find(c=>c.id===s.cat);
      return `<div class="card" onclick="window.openModal(${s.id})">
        <div class="card-img">${s.photo ? `<img src="${s.photo}" alt="">` : s.emoji}</div>
        <div class="card-body">
          <div class="card-tag">${cat ? cat.label : ''}</div>
          <div class="card-name">${s.name}</div>
          <div class="card-desc">${s.desc.length>65?s.desc.slice(0,65)+'…':s.desc}</div>
          <div class="card-price">${s.price}</div>
          <div class="card-phone">📞 ${s.phone}</div>
        </div>
      </div>`;
    }).join('');

    return `<div class="page-block" data-block-id="sellers">
      <div class="count-line" id="count"></div>
      <div class="grid">${grid || '<div class="empty"><span>🌾</span>Нічого не знайдено.</div>'}</div>
    </div>`;
  }

  function renderLife(){
    if(!D.lifeNews.length) return '<div class="empty"><span>📰</span>Новини поки відсутні</div>';
    return `<div class="page-block" data-block-id="life">
      ${D.lifeNews.map(n=>`
        <div class="life-card">
          <div class="life-emoji">${n.emoji}</div>
          <div class="life-body">
            <div class="life-title">${n.title}</div>
            <div class="life-text">${n.text}</div>
            <div class="life-date">${n.date}</div>
          </div>
        </div>`).join('')}
    </div>`;
  }

  function renderInfo(){
    if(!D.infoRules.length) return '<div class="empty"><span>ℹ️</span>Інформація відсутня</div>';
    return `<div class="page-block" data-block-id="info">
      ${D.infoRules.map(n=>`
        <div class="info-card">
          <div class="info-emoji">${n.emoji}</div>
          <div class="info-body">
            <div class="info-title">${n.title}</div>
            <div class="info-text">${n.text}</div>
          </div>
        </div>`).join('')}
    </div>`;
  }

  // ── MODAL ────────────────────────────────────────────
  window.openModal = function(id){
    const s = D.sellers.find(x=>x.id===id); if(!s) return;
    const cat = D.categories.find(c=>c.id===s.cat);
    const mi = document.getElementById('m-img');
    mi.innerHTML = s.photo
      ? `<img src="${s.photo}" alt="" style="width:100%;height:100%;object-fit:cover"><button class="modal-close" onclick="window.closeModal()">✕</button>`
      : `<span style="font-size:4.5rem">${s.emoji}</span><button class="modal-close" onclick="window.closeModal()">✕</button>`;
    document.getElementById('m-tag').textContent   = cat ? cat.label : '';
    document.getElementById('m-name').textContent  = s.name;
    document.getElementById('m-desc').textContent  = s.desc;
    document.getElementById('m-price').textContent = s.price;
    const btn = document.getElementById('m-phone');
    btn.textContent = '📞 ' + s.phone;
    btn.href = 'tel:' + s.phone.replace(/\s/g,'');
    document.getElementById('modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = function(){
    document.getElementById('modal').classList.remove('open');
    document.body.style.overflow = '';
  };

  // ── SEARCH & FILTER ──────────────────────────────────
  let activeCat = 'all';

  window.siteSearch = function(q){
    filterSellers(q, activeCat);
  };

  window.setCat = function(id){
    activeCat = id;
    const q = (document.getElementById('search')||{}).value || '';
    filterSellers(q, id);
    document.querySelectorAll('.cat-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.cat === id));
  };

  function filterSellers(q, cat){
    const filtered = D.sellers.filter(s => {
      const matchCat = cat === 'all' || s.cat === cat;
      const matchQ   = !q || s.name.toLowerCase().includes(q.toLowerCase())
                           || s.desc.toLowerCase().includes(q.toLowerCase());
      return matchCat && matchQ;
    });
    const block = document.querySelector('[data-block-id="sellers"]');
    if(!block) return;
    const wf = (n,a,b,c) => { const m=n%10,h=n%100; if(h>=11&&h<=19)return c; if(m===1)return a; if(m>=2&&m<=4)return b; return c; };
    document.getElementById('count').textContent =
      filtered.length ? `Знайдено: ${filtered.length} ${wf(filtered.length,'оголошення','оголошення','оголошень')}` : '';
    block.querySelector('.grid').innerHTML = filtered.length
      ? filtered.map(s => {
          const cat = D.categories.find(c=>c.id===s.cat);
          return `<div class="card" onclick="window.openModal(${s.id})">
            <div class="card-img">${s.photo?`<img src="${s.photo}" alt="">`:s.emoji}</div>
            <div class="card-body">
              <div class="card-tag">${cat?cat.label:''}</div>
              <div class="card-name">${s.name}</div>
              <div class="card-desc">${s.desc.length>65?s.desc.slice(0,65)+'…':s.desc}</div>
              <div class="card-price">${s.price}</div>
              <div class="card-phone">📞 ${s.phone}</div>
            </div>
          </div>`;
        }).join('')
      : '<div class="empty"><span>🌾</span>Нічого не знайдено.</div>';
  }

  function buildCats(){
    const el = document.getElementById('cats'); if(!el) return;
    el.innerHTML = [{id:'all',label:'Всі'}, ...D.categories].map(c=>
      `<button class="cat-btn${c.id==='all'?' active':''}" data-cat="${c.id}" onclick="window.setCat('${c.id}')">${c.label}</button>`
    ).join('');
  }

  // ── INIT PAGE ────────────────────────────────────────
  window.initPage = function(pageId){
    applyDesign();

    // Hero
    const heroEl = document.getElementById('hero-mount');
    if(heroEl) heroEl.innerHTML = buildHero(pageId);

    // Blocks
    const pageBlocks = D.pages[pageId] || [];
    const main = document.getElementById('main-mount');
    if(main){
      if(pageId === 'home'){
        main.innerHTML = pageBlocks
          .filter(b => b.visible)
          .map(b => renderBlock(b))
          .join('');
      } else if(pageId === 'life'){
        main.innerHTML = renderBlock({id:'blife',type:'life',visible:true});
      } else if(pageId === 'info'){
        main.innerHTML = renderBlock({id:'binfo',type:'info',visible:true});
      }
    }

    // Cats
    buildCats();

    // Footer
    const footer = document.querySelector('footer');
    if(footer) footer.textContent = D.design.footerText;

    // Title
    document.title = D.design.siteName + (pageId==='home' ? ' — Товари і Послуги' : pageId==='life' ? ' — Життя села' : ' — Для клієнтів');

    // Keyboard close modal
    document.addEventListener('keydown', e => { if(e.key==='Escape') window.closeModal(); });
  };

})();
