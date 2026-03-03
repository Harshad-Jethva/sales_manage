const at = require('jspdf-autotable');
console.log('at type:', typeof at);
console.log('at keys:', Object.keys(at));
if (at.default) console.log('at.default type:', typeof at.default);
