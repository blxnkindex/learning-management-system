import API from '../../api'
import Cookies from 'js-cookie';

/*
getQuestions
  Does the api call to get a quizzes information and returns it
*/
async function getQuestions (id) {
  const response = await API.get(`question_get/${id}`, 
    {
      headers: {'X-CSRFToken':Cookies.get('csrftoken')},
    },
  )
  return response.data
}


export default getQuestions;
