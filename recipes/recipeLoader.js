'use strict';
// const baseUrl = 'https://dannycboyd.github.io/recipes/testRecipes/';
const baseUrl = './';
let nav = document.querySelector('#recipeList');
let prev;
let localList;
let localData = [];
let savedNav = {};

/*
Fetch the recipe list and build the nav.
*/

function addLink(listElement, data) {
  let div = document.createElement('div');
  div.setAttribute('path', data.path);
  div.innerHTML = data.name;
  try {
    listElement.appendChild(div);
  } catch (e) {
    console.error(e);
  }
}

function saveRecipe(path, data) {
  if (data) {
    if (typeof data !== 'string') {
      data = JSON.stringify(data);
    }
    window.localStorage.setItem(path, data);
  }
}

async function clickHandler(event) {
  const path = event.target.getAttribute('path');

  if (path) {
    let localData = window.localStorage.getItem(path);
    console.log(`Fetching ${path} from local storage`)
    if (localData && localData.length > 0) {
      try {
        recipe = JSON.parse(localData);
        displayRecipe(recipe);
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log(`Local data not found, fetching ${path} from remote`)
      const data = await fetch(baseUrl + 'data/' + path)
      const recipeJson = await data.json();
      console.log(recipeJson);
      displayRecipe(recipeJson);
      saveRecipe(path, recipeJson);
    }
    event.target.classList.add('active');
    if (prev) {
      prev.classList.remove('active');
    }
    prev = event.target;
  }

}

async function getList() {
  let data = await fetch(baseUrl + 'allFiles.json');
  localList = window.localStorage.getItem('localList');
  try {
    console.log(localList);
    if (localList && localList.length) {
      localList = JSON.parse(localList);
      localList.forEach(recipe => {
        // let data = JSON.parse(window.localStorage.getItem(recipe.path));
        localData.push(recipe);
        savedNav[recipe.path] = true;
        addLink(nav, recipe)
      });
    } else {
      localList = [];
    }

    let recipeList = await data.json();
    console.log(recipeList);
    recipeList.forEach(recipe => {
      if (!savedNav[recipe.path]) {
        localList.push(recipe);
        addLink(nav, recipe)
      } else {
        console.log(`${recipe.path} is already stored, skipping storage write`)
      }
    });

    // localData.forEach(recipe => {
    //   window.localStorage.setItem(recipe.path, JSON.stringify(recipe));
    // });

    window.localStorage.setItem('localList', JSON.stringify(localList));

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