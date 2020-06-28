import Search from './models/Search';
import Recipe from './models/Recipe';
import List  from './models/List';
import Likes  from  './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import  {elements, renderLoader, clearLoader} from './views/base';

/** Global state of the app 
* - Search object
* - Curret recipe object
* - Shopping list object
* - Liked recipes
*/ 
const state = {};

/**
 * SEARCH CONTROLLER
 */

const controlSearch =() => {
   // 1- get query from view
   const query = searchView.getInput();
  
   //todo

   if (query)
   {
       //2- new search object and add yo state 
       state.search = new Search(query);
          
       // 3- preparing UI for results
          searchView.clearInput();
          searchView.clearResults();
          renderLoader(elements.searchRes);
     try {
       //4- Search for recipes
       state.search.getResults().then(() => {
         console.log(state.search);
       //5- render results on UI
       clearLoader(); 
       searchView.renderResults(state.search.result); 
     })
     } catch(error)
    {
        alert('something wrong with the search..');
      clearLoader();
    }
   }
}
elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});
  

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
     if(btn)
     {
         const goToPage = parseInt(btn.dataset.goto, 10);
         searchView.clearResults();
         searchView.renderResults(state.search.result , goToPage); 
     }
});




/**
 * RECIPE CONTROLLER
 */

  const controlRecipe =  () =>
  {    //GET ID from url
      const id = window.location.hash.replace( '#' , '');
      
      if(id)
      {
            //prepare UI for changes
            recipeView.clearRecipe();
            renderLoader(elements.recipe);

            //HIghlight selected search item
            if (state.search)searchView.highlightSelected(id);
            //create new recipe object
               state.recipe = new Recipe(id);
     try { 
            // get recipe data and parse ingreidents
           state.recipe.getRecipe().then(() => { 
           state.recipe.parseIngredients();

            //calculate servings and time
              state.recipe.calcTime();
              state.recipe.calcServings();

            // render recipe
            clearLoader();
            recipeView.renderRecipe(
              state.recipe,
              state.likes.isLiked(id)             
              );
          })
     }  catch(err)
     {    console.log(err);
         alert('Error processing recipe!');
     }
      }
  };

['hashchange' , 'load'].forEach(event => window.addEventListener(event , controlRecipe));

/**
 * LIST CONTROLLER
 */

 const controlList = () => {
    // create a new list if there is not yet
    if(!state.list) state.list = new List();

    //Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el=> {
     const item = state.list.addItem(el.count , el.unit , el.ingredient);
     listView.renderItem(item);
    });
 }

 //handle delete and update list item events

 elements.shopping.addEventListener('click', e=> {
  const id = e.target.closest('.shopping__item').dataset.itemid;
 
  //handle the delete button
  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    //Delete from state
    state.list.deleteItem(id);
    //Delete from UI
    listView.deleteItem(id);

    //handle the count update    
  } 
   else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
}
 });
   

 /**
 * LIKE CONTROLLER
 */
 
const controlLike = () => {
  if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;
  
    //user has not yet liked the current recipe
  if(!state.likes.isLiked(currentID))
  { // add like to the state

    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );

    //toggle the like button
     likesView.toggleLikeBtn(true);
    
     //add like to the UI list
    likesView.renderLike(newLike);
    

    //user has liked the current recipe
 
  } else {

     // Remove like from the state
     state.likes.deleteLike(currentID);

    //toggle the like button
    likesView.toggleLikeBtn(false);

    //Remove like from the UI list
     likesView.deleteLike(currentID);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};
  //Restore liked recipes on page load

  window.addEventListener('load', ()=>
  {  state.likes = new Likes();

    // restore likes
     state.likes.readStorage();

     // toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());
      
    // render the exisiting likes

    state.likes.likes.forEach(like => likesView.renderLike(like));
  });


// Handling recipe buttpn clicks
elements.recipe.addEventListener('click', e=>{
 if(e.target.matches('.bth-decrease , .btn-decrease *')) 
 {
   //Decrease button is clicked
   if(state.recipe.servings > 1)
   {
   state.recipe.updateServings('dec');
   }
   recipeView.updateServingsIngredients(state.recipe);
 } else if (e.target.matches('.bth-increase , .btn-increase *')) {
  
  //increase button is clicked
   state.recipe.updateServings('inc');
   recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches('.recipe__btn--add,.recipe__btn--add *'))
  
  {  // add ingredient to shopping list
    controlList();
  
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    //Like controller
    controlLike();
  }
 
});

