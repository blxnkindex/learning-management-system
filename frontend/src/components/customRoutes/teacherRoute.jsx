import React from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import getUserType from '../modules/getUserType';

/*
TeacherRoute
  Protects routes that teachers can access.
  If a student is logged in, they will be taken to the student's dashboard.
  If the user is not logged in, they will be taken to the landing page.
*/
const TeacherRoute = ({ children }) => {
  const navigate = useNavigate();
  const sessionId = Cookies.get('sessionid');

  React.useEffect(() => {
    const fetchUserType = async () => {
      if (!sessionId) {
        return navigate('/');
      }
      const isTeacher = await getUserType();
      if (!isTeacher) {
        navigate('/studentdash');
      }
    };
    fetchUserType();
  }, [sessionId, navigate]);

  return children;
};

export default TeacherRoute;