import API from '../../api'
import Cookies from 'js-cookie';

/*
getClassQuizzes
  Does the api call to get a classes quizzes and returns it
*/
async function getClassQuizzes (id) {
  const response = await API.get(`/quiz_get/${id}/`, 
    {
      headers: {'X-CSRFToken':Cookies.get('csrftoken')},
    },
  )
  return response.data
}


export default getClassQuizzes;
