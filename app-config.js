// Ponto único de integração entre UI, regras, persistência local e parâmetros derivados da planilha.
export const APP_CONFIG={
  storageKey:'BH_DB_V5',
  version:5,
  modules:['dashboard','calendario','apontamentos','banco','ajustes','ferias','folgas','atestados','colaboradores','relatorios','config'],
  xlsRules:{
    monthlyHours:220,
    dailyHoursMondayToThursday:'09:00',
    dailyHoursFriday:'08:00',
    saturdayHours:'00:00',
    tolerance:'00:15',
    saturdayOvertimeBase:'00:00'
  }
};
export function loadStore(seed={}){try{const raw=localStorage.getItem(APP_CONFIG.storageKey);return raw?JSON.parse(raw):seed}catch{return seed}}
export function saveStore(data){localStorage.setItem(APP_CONFIG.storageKey,JSON.stringify(data));return data}
export function emitDataChange(){window.dispatchEvent(new CustomEvent('banco-horas:data-change'))}
export function onDataChange(handler){window.addEventListener('banco-horas:data-change',handler);return()=>window.removeEventListener('banco-horas:data-change',handler)}
