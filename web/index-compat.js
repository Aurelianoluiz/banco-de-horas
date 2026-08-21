(() => {
  const ids = [
    'nav', 'modal', 'modalBox', 'kSaldo', 'kCred', 'kDeb', 'kCol', 'recent', 'points',
    'cols', 'bank', 'cfgSeg', 'cfgSex', 'cfgTol', 'cfgSab', 'find', 'findCol',
    'cn', 'cs', 'cseg', 'csex', 'ctol', 'pcid', 'pd', 'pi', 'po', 'pb'
  ];

  for (const id of ids) {
    if (!Object.prototype.hasOwnProperty.call(window, id)) {
      Object.defineProperty(window, id, {
        configurable: true,
        enumerable: false,
        get: () => document.getElementById(id)
      });
    }
  }

  const style = document.createElement('style');
  style.textContent = `
    .side {
      width: 245px !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
    }
    .side .logo small,
    .side .label {
      display: block !important;
      opacity: 1 !important;
    }
    .main { margin-left: 245px !important; }
    @media (max-width: 650px) {
      .side { width: 100% !important; height: auto !important; bottom: 0 !important; top: auto !important; }
      .side .logo small,
      .side .label { display: none !important; }
      .main { margin-left: 0 !important; padding-bottom: 90px !important; }
    }
  `;
  document.documentElement.appendChild(style);

  const fallbackMenu = () => {
    const navElement = document.getElementById('nav');
    if (!navElement || navElement.children.length) return;
    const items = [
      ['⌂', 'Dashboard', 'dashboard'],
      ['◷', 'Apontamentos', 'apontamentos'],
      ['◒', 'Banco de Horas', 'banco'],
      ['□', 'Calendário', 'calendario'],
      ['▣', 'Férias', 'ferias'],
      ['○', 'Folgas', 'folgas'],
      ['♙', 'Colaboradores', 'colaboradores'],
      ['▤', 'Relatórios', 'relatorios'],
      ['⚙', 'Configurações', 'config'],
      ['✎', 'Ajustes', 'ajustes'],
      ['+', 'Atestados', 'atestados']
    ];
    navElement.innerHTML = items.map(([icon, label, page]) =>
      `<button type="button" onclick="page('${page}')"><span class="ico">${icon}</span><span class="label">${label}</span></button>`
    ).join('');
  };

  window.addEventListener('DOMContentLoaded', () => {
    try {
      if (typeof window.menu === 'function') window.menu();
    } catch (_) {
      fallbackMenu();
    }
    if (!document.getElementById('nav')?.children.length) fallbackMenu();
  });
})();
