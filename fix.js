const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Remove unary plus
content = content.replace(/const row=\+el\.dataset\.row;/g, 'const row=el.dataset.row;');

// 2. Fix onclick handlers passing ID
content = content.replace(/editCat\(\+c\.row\+,/g, "editCat('\\''+c.row+'\\',");
content = content.replace(/deleteCat\(\+c\.row\+,/g, "deleteCat('\\''+c.row+'\\',");
content = content.replace(/editItem\(\+it\.row\+,/g, "editItem('\\''+it.row+'\\',");
content = content.replace(/deleteItem\(\+it\.row\+,/g, "deleteItem('\\''+it.row+'\\',");
content = content.replace(/editPersonM\(\+p\.row\+,/g, "editPersonM('\\''+p.row+'\\',");
content = content.replace(/deletePersonM\(\+p\.row\+,/g, "deletePersonM('\\''+p.row+'\\',");

content = content.replace(/editTpl\(\+r\.row\+\)/g, "editTpl('\\''+r.row+'\\')");
content = content.replace(/deleteTpl\(\+r\.row\+,/g, "deleteTpl('\\''+r.row+'\\',");

content = content.replace(/openTxnEdit\(event,\+r\.row\+\)/g, "openTxnEdit(event,'\\''+r.row+'\\')");
content = content.replace(/confirmDeleteTxn\(event,\+r\.row\+\)/g, "confirmDeleteTxn(event,'\\''+r.row+'\\')");

content = content.replace(/saveCatEdit\(\+row\+\)/g, "saveCatEdit('\\''+row+'\\')");
content = content.replace(/saveItemEdit\(\+row\+\)/g, "saveItemEdit('\\''+row+'\\')");
content = content.replace(/savePersonEdit\(\+row\+\)/g, "savePersonEdit('\\''+row+'\\')");
content = content.replace(/saveTplEdit\(\+row\+\)/g, "saveTplEdit('\\''+row+'\\')");

fs.writeFileSync('index.html', content);
console.log('Fixed quotes and unary pluses!');
