import React from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import getUserType from '../modules/getUserType';

/*
StudentRoute
  Protects routes that students can access.
  If a teacher is logged in, they will be taken to the teacher's dashboard.
  If the user is not logged in, they will be taken to the landing page.
*/
const StudentRoute = ({ children }) => {
  const navigate = useNavigate();
  const sessionId = Cookies.get('sessionid');

  React.useEffect(() => {
    const fetchUserType = async () => {
      if (!sessionId) {
        return navigate('/');
      }
      const isTeacher = await getUserType();
      if (isTeacher) {
        navigate('/teacherdash');
      }
    };
    fetchUserType();
  }, [sessionId, navigate]);

  return children;
};

export default StudentRoute;