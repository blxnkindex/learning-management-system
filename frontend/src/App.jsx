import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import LandingPage from './components/pages/LandingPage';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import TeacherDash from './components/pages/TeacherDash';
import StudentDash from './components/pages/StudentDash';
import Class from './components/pages/Class';
import Nav from './components/modules/Nav';
import LiveClass from './components/pages/LiveClass';
import Content from './components/pages/Content';
import PublicRoute from './components/customRoutes/publicRoute';
import TeacherRoute from './components/customRoutes/teacherRoute';
import StudentRoute from './components/customRoutes/studentRoute';
import UserRoute from './components/customRoutes/userRoute';
import Forum from './components/pages/Forum';
import Profile from './components/pages/Profile';
import Leaderboard from './components/pages/Leaderboard';
import Assignments from './components/pages/Assignments';
import Quiz from './components/pages/Quiz';
import PlayQuiz from './components/pages/PlayQuiz';

function App () {
  // All the Routes and their corresponding pages
  return (
    <>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/teacherdash" element={<TeacherRoute><TeacherDash /></TeacherRoute>} />
          <Route path="/studentdash" element={<StudentRoute><StudentDash /></StudentRoute>} />
          <Route path="/class/:classId" element={<UserRoute><Class /></UserRoute>} />
          <Route path="/class/:classId/live" element={<UserRoute><LiveClass /></UserRoute>} />
          <Route path="/class/:classId/content" element={<UserRoute><Content /></UserRoute>} />
          <Route path="/class/:classId/forum" element={<UserRoute><Forum /></UserRoute>} />
          <Route path="/user/:userId" element={<UserRoute><Profile /></UserRoute>} />
          <Route path="/class/:classId/leaderboard" element={<UserRoute><Leaderboard /></UserRoute>} />
          <Route path="/class/:classId/assignments" element={<UserRoute><Assignments /></UserRoute>} />
          <Route path="/class/:classId/quizzes" element={<UserRoute><Quiz /></UserRoute>} />
          <Route path="/class/:classId/quizzes/:quizId" element={<UserRoute><PlayQuiz /></UserRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
