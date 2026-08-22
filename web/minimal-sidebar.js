(() => {
  const STORAGE_KEY = 'bh:minimal-sidebar:collapsed';
  const items = [
    { group: 'Visão geral', icon: '◉', label: 'Dashboard', href: '/' },
    { group: 'Jornada e Banco', icon: '◫', label: 'Apontamentos', href: '/apontamentos.html' },
    { group: 'Jornada e Banco', icon: '▥', label: 'Banco de Horas', href: '/banco-horas.html' },
    { group: 'Jornada e Banco', icon: '✓', label: 'Fechamento', href: '/fechamento.html' },
    { group: 'Ausências', icon: '□', label: 'Férias e Folgas', href: '/ausencias.html' },
    { group: 'Ausências', icon: '▣', label: 'Calendário', href: '/calendario.html' },
    { group: 'Ausências', icon: '+', label: 'Atestados', href: '/atestados.html' },
    { group: 'Administração', icon: '♙', label: 'Colaboradores', href: '/colaboradores.html' },
    { group: 'Administração', icon: '✎', label: 'Ajustes', href: '/ajustes.html' },
    { group: 'Administração', icon: '⚙', label: 'Configurações', href: '/configuracoes.html' },
    { group: 'Relatórios e Auditoria', icon: '▤', label: 'Relatórios', href: '/relatorios.html' },
    { group: 'Relatórios e Auditoria', icon: '⌘', label: 'Auditoria', href: '/auditoria.html' }
  ];

  const currentPath = () => window.location.pathname || '/';
  const groupBy = (values) => values.reduce((acc, item) => {
    (acc[item.group] ||= []).push(item);
    return acc;
  }, {});

  const create = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  };

  function buildSidebar() {
    const old = document.querySelector('.sidebar, .side');
    old?.remove();

    const aside = create('aside', 'mh-sidebar');
    aside.setAttribute('aria-label', 'Navegação principal');

    const rail = create('div', 'mh-sidebar__rail');
    const railTop = create('div', 'mh-sidebar__rail-top');
    const railBottom = create('div', 'mh-sidebar__rail-bottom');

    const brand = create('button', 'mh-sidebar__brand', 'BH');
    brand.type = 'button';
    brand.title = 'Banco de Horas';
    railTop.appendChild(brand);

    const openPanel = create('button', 'mh-sidebar__icon-btn', '›');
    openPanel.type = 'button';
    openPanel.title = 'Expandir menu';
    openPanel.classList.add('mh-sidebar__toggle-rail');
    railTop.appendChild(openPanel);

    const quickItems = items.slice(0, 10);
    quickItems.forEach((item) => {
      const button = create('button', 'mh-sidebar__icon-btn');
      button.type = 'button';
      button.title = item.label;
      button.textContent = item.icon;
      button.addEventListener('click', () => { window.location.href = item.href; });
      railTop.appendChild(button);
    });

    const settings = create('a', 'mh-sidebar__icon-btn', '⚙');
    settings.href = '/configuracoes.html';
    settings.title = 'Configurações';
    const profile = create('button', 'mh-sidebar__icon-btn', '◯');
    profile.type = 'button';
    profile.title = 'Perfil';
    profile.addEventListener('click', () => {
      const dialog = document.createElement('div');
      dialog.style.cssText = 'position:fixed;z-index:3000;inset:0;background:rgba(0,0,0,.55);display:grid;place-items:center;padding:20px';
      dialog.innerHTML = '<div style="background:#111;color:#fff;border:1px solid #333;border-radius:12px;padding:20px;max-width:320px;font:14px system-ui">Perfil atual é controlado pela sessão autenticada.<br><button id="mh-profile-close" style="margin-top:14px;padding:8px 12px">Fechar</button></div>';
      document.body.appendChild(dialog);
      dialog.querySelector('#mh-profile-close').addEventListener('click', () => dialog.remove());
    });
    railBottom.append(settings, profile);
    rail.append(railTop, railBottom);

    const panel = create('div', 'mh-sidebar__panel');
    const header = create('div', 'mh-sidebar__panel-header');
    const title = create('h2', 'mh-sidebar__title', 'Dashboard');
    const collapse = create('button', 'mh-sidebar__toggle', '‹');
    collapse.type = 'button';
    collapse.title = 'Recolher menu';
    header.append(title, collapse);

    const search = create('label', 'mh-sidebar__search');
    search.innerHTML = '<span>⌕</span><input type="search" aria-label="Buscar no menu" placeholder="Buscar tarefas, projetos...">';

    const scroll = create('div', 'mh-sidebar__scroll');
    const grouped = groupBy(items);
    Object.entries(grouped).forEach(([groupName, groupItems]) => {
      const section = create('section', 'mh-sidebar__group');
      const label = create('div', 'mh-sidebar__group-label', groupName);
      section.appendChild(label);
      groupItems.forEach((item) => {
        const link = create('a', 'mh-sidebar__item');
        link.href = item.href;
        const normalizedCurrent = currentPath() === '/' ? '/' : currentPath().replace(/\/$/, '');
        const normalizedHref = item.href === '/' ? '/' : item.href.replace(/\/$/, '');
        if (normalizedCurrent === normalizedHref) link.classList.add('is-active');
        link.innerHTML = `<span class="mh-sidebar__item-icon">${item.icon}</span><span class="mh-sidebar__item-label"></span><span class="mh-sidebar__chevron">›</span>`;
        link.querySelector('.mh-sidebar__item-label').textContent = item.label;
        section.appendChild(link);
      });
      scroll.appendChild(section);
    });

    const footer = create('div', 'mh-sidebar__footer');
    const footerSettings = create('a', 'mh-sidebar__footer-item');
    footerSettings.href = '/configuracoes.html';
    footerSettings.innerHTML = '<span class="mh-sidebar__footer-icon">⚙</span><span>Configurações</span>';
    const footerProfile = create('a', 'mh-sidebar__footer-item');
    footerProfile.href = '/login.html';
    footerProfile.innerHTML = '<span class="mh-sidebar__footer-icon">◯</span><span>Sessão</span>';
    footer.append(footerSettings, footerProfile);

    panel.append(header, search, scroll, footer);
    aside.append(rail, panel);
    document.body.appendChild(aside);

    const setCollapsed = (collapsed) => {
      document.body.classList.toggle('mh-collapsed', collapsed);
      document.body.classList.toggle('mh-expanded', !collapsed);
      aside.classList.toggle('mh-sidebar__collapse', collapsed);
      openPanel.textContent = collapsed ? '›' : '‹';
      openPanel.title = collapsed ? 'Expandir menu' : 'Recolher menu';
      localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
    };

    const initialCollapsed = localStorage.getItem(STORAGE_KEY) === '1';
    setCollapsed(initialCollapsed);

    collapse.addEventListener('click', () => setCollapsed(!document.body.classList.contains('mh-collapsed')));
    openPanel.addEventListener('click', () => setCollapsed(!document.body.classList.contains('mh-collapsed')));
    brand.addEventListener('click', () => setCollapsed(false));

    const input = search.querySelector('input');
    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      document.querySelectorAll('.mh-sidebar__group').forEach((group) => {
        let visible = 0;
        group.querySelectorAll('.mh-sidebar__item').forEach((link) => {
          const text = link.textContent.toLowerCase();
          const show = !query || text.includes(query);
          link.hidden = !show;
          if (show) visible += 1;
        });
        group.hidden = visible === 0;
      });
    });
  }

  const start = () => {
    document.body.classList.add('mh-layout');
    buildSidebar();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
