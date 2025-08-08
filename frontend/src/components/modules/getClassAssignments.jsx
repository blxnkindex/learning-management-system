import API from '../../api'
import Cookies from 'js-cookie';

/*
getClassAssignments
  Does the api call to get a classes assignments and returns it
*/
async function getClassAssignments (id) {
  const response = await API.get(`/assignment_get/${id}/`, 
    {
      headers: {'X-CSRFToken':Cookies.get('csrftoken')},
    },
  )
  return response.data
}


export default getClassAssignments;
