'use strict';

console.log(__dirname);
const path = require('path');
const fs = require('fs').promises;

const dataPath = __dirname + '/data';

async function run() {

  const outfile = await fs.open(__dirname + '/allFiles.json', 'w');
  
  const files = await fs.readdir(dataPath, { withFileTypes: true });
  const outData = [];
  for (let file of files) {
    if (/.*\.json/.test(file.name)) {
      console.log(file);
      const data = await fs.readFile(dataPath + '/' + file.name)
      
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
  await fs.writeFile(outfile, Buffer.from(JSON.stringify(outData)));
}
run();