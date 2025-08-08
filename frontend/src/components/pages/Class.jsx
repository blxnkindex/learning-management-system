import React from 'react';
import { Typography, Grid, CardContent, createTheme, ThemeProvider } from '@mui/material';
import Card from '@mui/material/Card'
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/class.css'
import ClassSideNav from '../modules/ClassSideNav';
import getTheme from '../styles/getTheme';
import getClassDetails from '../modules/getClassDetails';
import SourceIcon from '@mui/icons-material/Source';
import ForumIcon from '@mui/icons-material/Forum';
import QuizIcon from '@mui/icons-material/Quiz';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';

/*
Class
  Class home page
*/
const Class = () => {
  const classId = useParams().classId;
  const navigate = useNavigate();
  const [className, setClassName] = React.useState('');

  //Apply user colors
  const [lightMode, setLightMode] = React.useState(localStorage.getItem("light_theme") === 'true');
  const theme = lightMode ? createTheme({ palette: { mode: 'light', }, }) : createTheme({ palette: { mode: 'dark', }, })
  React.useEffect(() => {
    (async () => {
      try {
        const userTheme = await getTheme();
        setLightMode(userTheme['light_theme']);
        const classDetails = await getClassDetails(classId)
        setClassName(classDetails['name'])
      } catch (error) {
        console.log(error);
      }
    })();
  },);


  return (
    <ThemeProvider theme={theme}>
      <main style={{ alignItems: 'flex-start' }} className={lightMode ? 'light-mode' : 'dark-mode'}>
        <div className={`parent ${lightMode ? 'light-mode' : 'dark-mode'}`}>
          <ClassSideNav />
          <Grid container sx={{ marginLeft: '210px' }} spacing={2}>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Typography variant="h4"> {className} Homepage </Typography>
            </Grid>
            <Grid item xs={12} container>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ textAlign: 'center', height: '100%', width: '100%', cursor: 'pointer' }} onClick={() => navigate(`/class/${classId}/content`)} style={{ cursor: 'pointer' }}>
                    <CardContent>
                      <SourceIcon sx={{
                        width: '50px',
                        height: '50px',
                      }}> </SourceIcon>
                      <Typography variant="h6" component="h3">
                        Content
                      </Typography>
                      <Typography variant="body1" component="p">
                        Course materials
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ textAlign: 'center', height: '100%', width: '100%', cursor: 'pointer' }} onClick={() => navigate(`/class/${classId}/forum`)}>
                    <CardContent>
                      <ForumIcon sx={{
                        width: '50px',
                        height: '50px',
                      }}> </ForumIcon>
                      <Typography variant="h6" component="h3">
                        Forum
                      </Typography>
                      <Typography variant="body1" component="p">
                        Class forum
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ textAlign: 'center', height: '100%', width: '100%', cursor: 'pointer'  }} onClick={() => navigate(`/class/${classId}/quizzes`)}>
                    <CardContent>
                      <QuizIcon sx={{
                        width: '50px',
                        height: '50px',
                      }}> </QuizIcon>
                      <Typography variant="h6" component="h3">
                        Quiz
                      </Typography>
                      <Typography variant="body1" component="p">
                        View quizzes
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ textAlign: 'center', height: '100%', width: '100%', cursor: 'pointer'  }} onClick={() => navigate(`/class/${classId}/assignments`)}>
                    <CardContent>
                      <AssignmentIcon sx={{
                        width: '50px',
                        height: '50px',
                      }}> </AssignmentIcon>
                      <Typography variant="h6" component="h3">
                        Assignments
                      </Typography>
                      <Typography variant="body1" component="p">
                        View assignments
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ textAlign: 'center', height: '100%', width: '100%', cursor: 'pointer'  }} onClick={() => navigate(`/class/${classId}/leaderboard`)}>
                    <CardContent>
                      <LeaderboardIcon sx={{
                        width: '50px',
                        height: '50px',
                      }}> </LeaderboardIcon>
                      <Typography variant="h6" component="h3">
                        Leaderboard
                      </Typography>
                      <Typography variant="body1" component="p">
                        View class leaderboard
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </main>
    </ThemeProvider>
  )
}

export default Class