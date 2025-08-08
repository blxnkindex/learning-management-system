import API from '../../api'
import Cookies from 'js-cookie';

/*
getResults
  Does the api call to get a quizzes results and returns it
*/
async function getResults (id) {
  const response = await API.get(`result_get/${id}`, 
    {
      headers: {'X-CSRFToken':Cookies.get('csrftoken')},
    },
  )
  return response.data
}


export default getResults;
