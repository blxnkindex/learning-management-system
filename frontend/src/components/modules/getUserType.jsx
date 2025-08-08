import API from '../../api'
import Cookies from 'js-cookie';

/*
getUserType
  Does the api call to get a user's type returns it
*/
async function getUserType () {
  const response = await API.get(`user/`, 
    {
      headers: {'X-CSRFToken':Cookies.get('csrftoken')},
    },
  )
  return response.data['is_teacher']
}


export default getUserType;
