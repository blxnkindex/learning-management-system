import API from '../../api'
import Cookies from 'js-cookie';

/*
getSubmissions
  Does the api call to get an assignments submissions and returns it
*/
async function getSubmissions (id) {
  const response = await API.get(`submissions_get/${id}`, 
    {
      headers: {'X-CSRFToken':Cookies.get('csrftoken')},
    },
  )
  return response.data
}


export default getSubmissions;
