import assert from 'node:assert/strict';
function hm(v){const [h,m]=v.split(':').map(Number);return h*60+m}
function worked(p){let end=hm(p.saida),start=hm(p.entrada);if(end<start)end+=1440;return end-start-hm(p.intervalo||'00:00')}
function balance(p,expected,tolerance=15){const d=worked(p)-expected;return Math.abs(d)<=tolerance?0:d}
assert.equal(worked({entrada:'08:00',saida:'17:00',intervalo:'01:00'}),480);
assert.equal(balance({entrada:'08:00',saida:'17:00',intervalo:'01:00'},480),0);
assert.equal(balance({entrada:'08:00',saida:'17:20',intervalo:'01:00'},480),20);
assert.equal(balance({entrada:'08:00',saida:'16:50',intervalo:'01:00'},480),0);
console.log('rules.test.js: OK');
