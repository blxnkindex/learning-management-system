import API from '../../api'
import Cookies from 'js-cookie';

/*
getClassDetails
  Does the api call to get a classes information and returns it
*/
async function getClassDetails (id) {
  const response = await API.get(`classes/${id}`, 
    {
      headers: {'X-CSRFToken':Cookies.get('csrftoken')},
    },
  )
  return response.data
}


export default getClassDetails;
