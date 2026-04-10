const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

const regexes = [
  // Categories
  { find: /onclick="editCat\(\+c\.row\+,/g, replace: "onclick=\"editCat('\\''+c.row+'\\'," },
  { find: /onclick="deleteCat\(\+c\.row\+,/g, replace: "onclick=\"deleteCat('\\''+c.row+'\\'," },
  { find: /onclick="saveCatEdit\(\+row\+\)"/g, replace: "onclick=\"saveCatEdit('\\''+row+'\\')\"" },

  // Items
  { find: /onclick="editItem\(\+it\.row\+,/g, replace: "onclick=\"editItem('\\''+it.row+'\\'," },
  { find: /onclick="deleteItem\(\+it\.row\+,/g, replace: "onclick=\"deleteItem('\\''+it.row+'\\'," },
  { find: /onclick="saveItemEdit\(\+row\+\)"/g, replace: "onclick=\"saveItemEdit('\\''+row+'\\')\"" },

  // People
  { find: /onclick="editPersonM\(\+p\.row\+,/g, replace: "onclick=\"editPersonM('\\''+p.row+'\\'," },
  { find: /onclick="deletePersonM\(\+p\.row\+,/g, replace: "onclick=\"deletePersonM('\\''+p.row+'\\'," },
  { find: /onclick="savePersonEdit\(\+row\+\)"/g, replace: "onclick=\"savePersonEdit('\\''+row+'\\')\"" },

  // Templates
  { find: /onclick="editTpl\(\+r\.row\+\)"/g, replace: "onclick=\"editTpl('\\''+r.row+'\\')\"" },
  { find: /onclick="deleteTpl\(\+r\.row\+,/g, replace: "onclick=\"deleteTpl('\\''+r.row+'\\'," },
  { find: /onclick="saveTplEdit\(\+row\+\)"/g, replace: "onclick=\"saveTplEdit('\\''+row+'\\')\"" },

  // Transactions
  { find: /onclick="openTxnEdit\(event,\+r\.row\+\)"/g, replace: "onclick=\"openTxnEdit(event,'\\''+r.row+'\\')\"" },
  { find: /ondblclick="confirmDeleteTxn\(event,\+r\.row\+\)"/g, replace: "ondblclick=\"confirmDeleteTxn(event,'\\''+r.row+'\\')\"" },
  { find: /onclick="confirmDeleteTxn\(event,\+r\.row\+\)"/g, replace: "onclick=\"confirmDeleteTxn(event,'\\''+r.row+'\\')\"" },
];

for(let r of regexes){
  content = content.replace(r.find, r.replace);
}

fs.writeFileSync('index.html', content);
console.log('Patch complete.');
