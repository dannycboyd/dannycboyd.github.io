'use strict';
const page = document.querySelector('#recipe')
const title = document.querySelector('#recipe__title');
const ingredients = document.querySelector('#recipe__ingredients');
const steps = document.querySelector('#recipe__steps');
console.log(page, title, ingredients, steps);

function ingredientString(i) {
  console.log(i);
  // i = { name: string, amount: number, units: string}
  let htmlString = '';
  if (i.units && i.amount) {
    htmlString += i.amount + ' ' + i.units + ' ';
  }
  htmlString += i.name;
  return htmlString;
}

function addIngredient(i) {
  const ingredient = document.createElement('li');
  ingredient.innerHTML = ingredientString(i);
  ingredients.appendChild(ingredient);
}

function changeIngredient(element, i) {
  element.innerHtml = ingredientString(i);
}

function displayRecipe(data) {
  title.innerHTML = data.name;

  const num_ingredients = ingredients.children.length; // existing elements
  let ing_index = 0;
  while (ing_index < num_ingredients) {
    changeIngredient(ingredients.children[ing_index], data.ingredients[ing_index]);
    ing_index++;
  }


  if (num_ingredients < data.ingredients.length) {
    // not enough, add more
    for (let i = ing_index; i < data.ingredients.length; i++) {
      addIngredient(data.ingredients[ing_index]);
    }
  } else if (num_ingredients > data.ingredients.length) {
    // too many, trim down extras
    while(ingredients.children.length > data.ingredients.length) {
      ingredients.removeChild(ingredients.lastChild);
    }
  }
}
