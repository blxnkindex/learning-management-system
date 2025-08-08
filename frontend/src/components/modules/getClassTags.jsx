import API from '../../api'
import Cookies from 'js-cookie';

/*
getClassTags
  Does the api call to get a classes tags and returns it
*/
async function getClassTags (id) {
  const response = await API.get(`tags_get/${id}/`, 
    {
      headers: {'X-CSRFToken':Cookies.get('csrftoken')},
    },
  )
  return response.data
}


export default getClassTags;
