// sandwich is the filling between the UI and the back end webservice.

// on pageload, fetch a list of recipes from the backend + build one
// for the locally stored/webstorage one
const url = `localhost:10010/recipes`;
// function openLocalDB() {
//   return new Promise()
//     .then(() => {

//     })
}

async function getRecipeList() {
  const remoteData = await fetch(url);

  let localList = window.localStorage.getItem('localList');
  // [{ keyName: "string", title: "Proper Name" }]
  if (!localList) {
    localList = [];
  }

}

async function main() {
  let recipes = await getRecipeList();

}