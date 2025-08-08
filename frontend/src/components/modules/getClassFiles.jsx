import API from '../../api'
import Cookies from 'js-cookie';

/*
getClassFiles
  Does the api call to get a classes content and returns it
*/
async function getClassFiles (id) {
  const response = await API.get(`materials_list/${id}`, 
    {
      headers: {'X-CSRFToken':Cookies.get('csrftoken')},
    },
  )
  return response.data
}


export default getClassFiles;
