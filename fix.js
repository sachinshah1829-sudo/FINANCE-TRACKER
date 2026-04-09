const fs = require('fs');

let t = fs.readFileSync('index.html', 'utf8');
t = t.replace(/onclick="editCat\(\+c\.row\+,/g, "onclick='editCat(\"'+c.row+'\",");
t = t.replace(/onclick="deleteCat\(\+c\.row\+,/g, "onclick='deleteCat(\"'+c.row+'\",");
t = t.replace(/onclick="editItem\(\+it\.row\+,/g, "onclick='editItem(\"'+it.row+'\",");
t = t.replace(/onclick="deleteItem\(\+it\.row\+,/g, "onclick='deleteItem(\"'+it.row+'\",");
t = t.replace(/onclick="editPersonM\(\+p\.row\+,/g, "onclick='editPersonM(\"'+p.row+'\",");
t = t.replace(/onclick="deletePersonM\(\+p\.row\+,/g, "onclick='deletePersonM(\"'+p.row+'\",");
t = t.replace(/onclick="editTpl\(\+r\.row\+\)/g, "onclick='editTpl(\"'+r.row+'\")'");
t = t.replace(/onclick="deleteTpl\(\+r\.row\+,/g, "onclick='deleteTpl(\"'+r.row+'\",");

fs.writeFileSync('index.html', t, 'utf8');

// Fix importData.html splitting bug
let imp = fs.readFileSync('importData.html', 'utf8');
imp = imp.replace(/split\('\\\\n'\)/g, "split('\\n')");
fs.writeFileSync('importData.html', imp, 'utf8');
console.log("Fixed!");
