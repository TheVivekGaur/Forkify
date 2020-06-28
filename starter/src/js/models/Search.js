import axios from 'axios';
export default class Search {
    constructor(query)
    {
        this.query = query;
    }
    getResults()
{    return new Promise((resolve , reject) => {
         
 try {
      axios.get(`https://forkify-api.herokuapp.com/api/search?&q=${this.query}`).then( res => {

      this.result = res.data.recipes;
    
     
        resolve();

 })

  } catch (error)
{  
    console.log(error);
    reject();
         }
      })

    }

} 


