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
  fns: {
    ingredients: {
      add: addIngredient,
      change: changeIngredient
    },
    steps: {
      add: addStep,
      change: changeStep
    }
  },
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

function displaySection(sectionName) {
  const section = options.sections[sectionName];
  const items = options.recipe[sectionName];
  const add = options.fns[sectionName].add;
  const change = options.fns[sectionName].change;

  const existing = section.children.length;
  const num = items.length;

  for (let i = 0; i < num; i++) {
    if (i < existing) {
      change(section.children[i], items[i]);
    } else {
      add(items[i]);
    }
  }

  while (section.children.length > num) {
    section.removeChild(section.lastChild);
  }
}

function displayRecipe(data) {
  options.recipe = data;
  title.innerText = data.name;

  if (data.ingredients && data.ingredients.length > 0) {
    displaySection('ingredients');
  }

  if (data.steps && data.steps.length > 0) {
    displaySection('steps');
  }
}
