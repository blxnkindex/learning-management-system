import API from '../../api'
import Cookies from 'js-cookie';

/*
getClassDetails
  Does the api call to get a classes forum and returns it
*/
async function getClassForums (id) {
  const response = await API.get(`forum/${id}`, 
    {
      headers: {'X-CSRFToken':Cookies.get('csrftoken')},
    },
  )
  return response.data
}


export default getClassForums;
