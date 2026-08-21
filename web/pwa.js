const install = async () => {
  if (!('serviceWorker' in navigator)) return;
  try { await navigator.serviceWorker.register('/service-worker.js', { scope: '/' }); }
  catch (error) { console.warn('PWA não registrado:', error); }
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
else install();
