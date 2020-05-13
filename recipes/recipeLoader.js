'use strict';

const baseUrl = 'https://dannycboyd.github.io/recipes/testRecipes';

async function main() {
  console.log('running main');
  const data = await fetch(baseUrl + 'testRecipe.json');
  console.log(data);

  return 'all done!';
}

main()
  .then(console.log)
  .catch(console.error);