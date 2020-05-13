'use strict';

console.log(__dirname);
const path = require('path');
const fs = require('fs');

const dataPath = __dirname + '/data';
const outfile = fs.openSync(__dirname + '/allFiles.json', 'w');

const files = fs.readdirSync(dataPath, { withFileTypes: true });
const outData = [];
for (let file of files) {
  if (/.*\.json/.test(file.name)) {
    console.log(file);
    const data = fs.readFileSync(dataPath + '/' + file.name)
    
    // if (e) {
    //   console.error(e);
    //   return;
    // } else {
    // }
    let recipeData = JSON.parse(data);
    console.log(file.name, recipeData.name);
    outData.push({
      path: file.name,
      name: recipeData.name,
    });

  }
}

console.log('writing the files');
fs.writeFileSync(outfile, Buffer.from(JSON.stringify(outData)));
