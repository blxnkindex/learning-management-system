import Cookies from 'js-cookie';
import { Navigate } from 'react-router-dom';

/*
UserRoute
  Protects the routes that users have to be logged in to access
*/
const UserRoute = ({ children }) => {
  const sessionId = Cookies.get('sessionid');
  return sessionId ? children : <Navigate to='/' />;
};

export default UserRoute;