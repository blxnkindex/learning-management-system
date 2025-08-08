import React from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import getUserType from '../modules/getUserType';

/*
PublicRoute
  Protects routes that are only visible 
  to logged out users. 
  If a user is logged in and accesses these routes, they
  will be taken to their respective dashboard.
*/
const PublicRoute = ({ children }) => {
  const navigate = useNavigate();
  React.useEffect(() => {
    const fetchUserType = async () => {
      const sessionId = Cookies.get('sessionid');
      if (sessionId) {
        const userType = await getUserType();
        const dest = userType ? "/teacherdash" : "/studentdash";
        navigate(dest);
      }
    };

    fetchUserType();
  }, [navigate]);

  return children;
};


export default PublicRoute;
