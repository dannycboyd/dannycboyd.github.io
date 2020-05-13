'use strict';
const page = document.querySelector('#recipe')
const title = document.querySelector('#recipe__title');
const ingredients = document.querySelector('#recipe__ingredients');
const steps = document.querySelector('#recipe__steps');
console.log(page, title, ingredients, steps);

function ingredientString(i) {
  // console.log(i);
  // i = { name: string, amount: number, units: string}
  let htmlString = '';
  if (i.units && i.amount) {
    htmlString += i.amount + ' ' + i.units + ' ';
  }
  htmlString += i.name;
  console.log(htmlString);
  return htmlString;
}

function addIngredient(i) {
  const ingredient = document.createElement('li');
  ingredient.innerText = ingredientString(i);
  ingredients.appendChild(ingredient);
}

function changeIngredient(element, i) {
  element.innerText = ingredientString(i);
}

function displayRecipe(data) {
  title.innerText = data.name;

  const existing_ingredients = ingredients.children.length; // existing elements
  const num_ingredients = data.ingredients.length;

  for (let i = 0; i < num_ingredients; i++) {
    if (i < existing_ingredients) {
      changeIngredient(ingredients.children[i], data.ingredients[i]);
    } else {
      addIngredient(data.ingredients[i]);
    }
  }


  // let ing_index = 0;
  // while (ing_index < existing_ingredients) {
  //   changeIngredient(ingredients.children[ing_index], data.ingredients[ing_index]);
  //   ing_index++;
  // }


  // if (existing_ingredients < data.ingredients.length) {
  //   // not enough, add more
  //   for (let i = ing_index; i < data.ingredients.length; i++) {
  //     addIngredient(data.ingredients[ing_index]);
  //   }
  // } else if (existing_ingredients > data.ingredients.length) {
  //   // too many, trim down extras
  // }
  while(ingredients.children.length > num_ingredients) {
    ingredients.removeChild(ingredients.lastChild);
  }
}
