import API from "../../api";
import Cookies from "js-cookie";

// Gets the theme of a user if they are logged in
// also sets it in local storage,
// If they are not logged in, return default values
async function getTheme () {
  if (Cookies.get('sessionid')) {
    const response = await API.get(`color_get/`, 
    {
      headers: {'X-CSRFToken':Cookies.get('csrftoken')},
    },
  )
  localStorage.setItem("light_theme", response.data['light_theme']);
  localStorage.setItem("highlight_colour", response.data['highlight_colour']);
  return response.data
}
  else {
    localStorage.setItem("light_theme", true);
    localStorage.setItem("highlight_colour", "#0A66C2");
    return {
      light_theme      : true,
      highlight_colour : "#0A66C2"
    };
  }
}

export default getTheme
