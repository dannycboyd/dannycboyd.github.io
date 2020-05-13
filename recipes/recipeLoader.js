'use strict';
// const baseUrl = 'https://dannycboyd.github.io/recipes/testRecipes/';
const baseUrl = './';
let nav = document.querySelector('#recipeList');
let prev;

function addLink(listElement, data) {
  let li = document.createElement('li');
  li.setAttribute('path', data.path);
  li.innerHTML = data.name;
  try {
    listElement.appendChild(li);
  } catch (e) {
    console.error(e);
  }
}

function clickHandler(event) {
  const path = event.target.getAttribute('path');
  if (path) {
    fetch(baseUrl + 'data/' + path)
      .then(data => data.json())
      .then(data => {
        console.log(data);
        displayRecipe(data);
      });
  }
  event.target.classList.add('active');
  if (prev) {
    prev.classList.remove('active');
  }
  prev = event.target;
}

async function getList() {
  let data = await fetch(baseUrl + 'allFiles.json');
  try {
    let recipeList = await data.json();
    console.log(recipeList);
    recipeList.forEach(recipe => addLink(nav, recipe));
  } catch (e) {
    console.error(e);
  }
}

async function main() {
  nav.addEventListener('click', clickHandler);

  console.log('running main');
  await getList();

  return 'all done!';
}

main()
  .then(console.log)
  .catch(console.error);