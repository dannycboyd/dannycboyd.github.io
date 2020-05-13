'use strict';
const page = document.querySelector('#recipe')
const title = document.querySelector('#recipe__title');
const ingredients = document.querySelector('#recipe__ingredients');
const steps = document.querySelector('#recipe__steps');
console.log(page, title, ingredients, steps);

let options = {
  sections: {
    title,
    ingredients,
    steps
  },
  recipe: {},
  fns: {},
}

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

function addStep(i) {
  const step = document.createElement('li');
  step.innerText = i.description;
  steps.appendChild(step);
}

function changeStep(element, i) {
  element.innerText = i.description;
}

function displaySection(options) {
  const { section, items, fn } = options;
  const existing = section.children.length;
  const num = items.length;

  for (let i = 0; i < num; i++) {
    if (i < existing) {
      fn.change(section.children[i], items[i]);
    } else {
      fn.add(items[i]);
    }
  }

  while (section.children.length > num) {
    section.removeChild(section.lastChild);
  }
}

 const display_functions = {
   ingredients: {
     add: addIngredient,
     change: changeIngredient
   },
   steps: {
     add: addStep,
     change: changeStep
   }
 }

function displayRecipe(data) {
  title.innerText = data.name;

  if (data.ingredients && data.ingredients.length > 0) {
    const options = {
      section: ingredients,
      items: data.ingredients,
      fn: display_functions.ingredients
    }
    displaySection(options);
  }

  if (data.steps && data.steps.length > 0) {
    const options = {
      section: steps,
      items: data.steps,
      fn: display_functions.steps
    }
    displaySection(options);
  }

  // const existing_ingredients = ingredients.children.length; // existing elements
  // const num_ingredients = data.ingredients.length;

  // for (let i = 0; i < num_ingredients; i++) {
  //   if (i < existing_ingredients) {
  //     changeIngredient(ingredients.children[i], data.ingredients[i]);
  //   } else {
  //     addIngredient(data.ingredients[i]);
  //   }
  // }

  // while(ingredients.children.length > num_ingredients) {
  //   ingredients.removeChild(ingredients.lastChild);
  // }
}
