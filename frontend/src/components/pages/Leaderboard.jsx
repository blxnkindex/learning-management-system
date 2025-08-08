import React from 'react';
import '../styles/class.css'
import API from '../../api';
import Cookies from 'js-cookie';
import {
  Box, ThemeProvider, Typography, createTheme, TableContainer, Table, Paper,
  TableHead, TableCell, TableBody, TableRow, Avatar
} from '@mui/material';
import getTheme from '../styles/getTheme';
import ClassSideNav from '../modules/ClassSideNav';
import { useNavigate, useParams } from 'react-router-dom';
import getClassDetails from '../modules/getClassDetails';

/*
Leaderboard
  Leaderboard page for a class, shows the 
  students in order of points
*/
const Leaderboard = () => {
  const classId = useParams().classId;
  const [students, setStudents] = React.useState([]);
  const [teacher, setTeacher] = React.useState('');
  const navigate = useNavigate();
  
  const fallbackIMG = "https://static.vecteezy.com/system/resources/thumbnails/002/534/006/small/social-media-chatting-online-blank-profile-picture-head-and-body-icon-people-standing-icon-grey-background-free-vector.jpg"

  React.useEffect(() => {
    (async () => {
      try {
        const response = await API.get(`classes/${classId}/students/`,
          {
            headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
          },)
        const data = await response.data;
        setStudents(data);
        const classDetails = await getClassDetails(classId);
        setTeacher(`${classDetails['teacher_profile']['first_name']} ${classDetails['teacher_profile']['last_name']}`);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [classId]);

  //Apply user colors
  const [lightMode, setLightMode] = React.useState(localStorage.getItem("light_theme") === 'true');
  React.useEffect(() => {
    (async () => {
      try {
        const userTheme = await getTheme();
        setLightMode(userTheme['light_theme']);
      } catch (error) {
        console.log(error);
      }
    })();
  },);

  // sort students in descending order by points
  const sortedStudents = [...students].sort((a, b) => b['points'] - a['points']);

  const theme = lightMode ? createTheme({ palette: { mode: 'light', }, }) : createTheme({ palette: { mode: 'dark', }, })

  return (
    <ThemeProvider theme={theme}>
      <main className={lightMode ? 'light-mode' : 'dark-mode'}>
        <ClassSideNav />
        <Box sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '200px',
        }}>
          <Box sx={{
            padding: '10px'
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h4">
                Class Leaderboard
              </Typography>
              <Typography variant="body">
                <b>Teacher: </b>{teacher}
              </Typography>
            </Box>
          </Box>
          <TableContainer component={Paper} sx={{ width: '50vw' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Points</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedStudents.map((s, index) => (
                  <TableRow key={index} onClick={() => navigate(`/user/${s['user']['id']}`)} style={{ cursor: 'pointer' }}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Avatar alt={`${s['user']['first_name']} ${s['user']['last_name']}`} src={s['user']['picture'] ? "http://localhost:8000/" + s['user']['picture'] : fallbackIMG} />
                      {s['user']['first_name']} {s['user']['last_name']}
                    </TableCell>
                    <TableCell>{s['points']}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </main>
    </ThemeProvider >
  )
}

export default Leaderboard