// Ponto único de integração entre UI, regras e persistência local.
export const APP_CONFIG={storageKey:'BH_DB_V5',version:5,modules:['dashboard','calendario','apontamentos','banco','ajustes','ferias','folgas','atestados','colaboradores','relatorios','config']};
export function loadStore(seed={}){try{const raw=localStorage.getItem(APP_CONFIG.storageKey);return raw?JSON.parse(raw):seed}catch{return seed}}
export function saveStore(data){localStorage.setItem(APP_CONFIG.storageKey,JSON.stringify(data));return data}
export function emitDataChange(){window.dispatchEvent(new CustomEvent('banco-horas:data-change'))}
export function onDataChange(handler){window.addEventListener('banco-horas:data-change',handler);return()=>window.removeEventListener('banco-horas:data-change',handler)}
