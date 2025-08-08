import React from 'react';
import Typography from '@mui/material/Typography';
import API from '../../api';
import Cookies from 'js-cookie';
import { Button, TextField, ButtonGroup, Grid, Card, CardContent, createTheme, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

import '../styles/dash.css'
import { useNavigate } from 'react-router-dom';
import getTheme from '../styles/getTheme';
import { ThemeProvider } from '@emotion/react';
import textFieldStyle from '../styles/textFieldStyle';

/*
StudentDash
  Student's Dashboard contains their class and a quick course finder
*/
const StudentDash = () => {
  const navigate = useNavigate();
  const [showClassForm, setShowClassForm] = React.useState(false);
  const [classId, setClassId] = React.useState([])
  const [classes, setClasses] = React.useState([])
  const [updateClasses, setUpdateClasses] = React.useState(false);
  const [courseFinderType, setCourseFinderType] = React.useState(1);
  const [recCourses, setRecCourses] = React.useState([]);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [showError, setShowError] = React.useState('');

  // Gets the student's classes and recommendations
  React.useEffect(() => {
    (async () => {
      try {
        const response = await API.get('classes/', {},
          {
            headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
          },
        )
        const data = await response.data;
        setClasses(data);
        const response2 = await API.get('recommendations/', {},
          {
            headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
          },
        )
        setRecCourses(response2.data);
        setCourseFinderType(1);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [updateClasses]);

  // Gets their name to display
  React.useEffect(() => {
    (async () => {
      if (Cookies.get('sessionid')) {
        const response = await API.get(`user/`,
          {
            headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
          },
        )
        setFirstName(await response.data['first_name']);
        setLastName(await response.data['last_name']);
      }
    })();
  },);

  // Toggles the join class textfield
  const toggleField = () => {
    setShowClassForm(!showClassForm);
    setShowError(false)
  };

  // navigates to a class
  function goClass (id) {
    navigate(`/class/${id}`);
  };

  // Joins a class given the class name
  async function joinClass () {
    try {
      await API.post('join_class/',
        {
          name: classId,
        },
        {
          headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
        },
      )
      setShowClassForm(false);
      setUpdateClasses(!updateClasses);
    } catch (error) {
      console.log(error)
      setShowError(true);
    }
  }

  // Updates the type of course finding  
  async function updateCourseFinder (type) {
    setCourseFinderType(type);
    if (type === 1) {
      const courses = await API.get('recommendations/', {},
        {
          headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
        },)
      setRecCourses(courses.data);
    }
    else if (type === 2) {
      const courses = await API.get('class_highest_rated/', {},
        {
          headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
        },)
      setRecCourses(courses.data);
    }
    else if (type === 3) {
      const courses = await API.get('class_most_popular/', {},
        {
          headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
        },)
      setRecCourses(courses.data);
    }
  }

  // Apply user colors
  const [lightMode, setLightMode] = React.useState(localStorage.getItem("light_theme") === 'true');
  const highlightColour = localStorage.getItem("highlight_colour");
  const theme = lightMode ? createTheme({ palette: { mode: 'light', }, }) : createTheme({ palette: { mode: 'dark', }, })
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


  return (
    <ThemeProvider theme={theme}>
      <main style={{
        maxHeight: 'calc(100vh - 110px)',
        display: 'flex',
        flexWrap: 'wrap',

      }} className={lightMode ? 'light-mode' : 'dark-mode'}>
        <Box sx={{
          width: '95%',
          height: '77%',
          m: 2
        }}>
          <Typography variant="h7" component="h3" align="center">
            Welcome, {firstName} {lastName} 👋.
          </Typography>

          <Box sx={{
            boxShadow: '3',
            height: '85%',
            overflow: 'auto'
          }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              backgroundColor: `${lightMode ? '#F1FAFF' : '#3D4856'}`,
              padding: '10px',
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Your Courses</Typography>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {!showClassForm && (<Button style={{ color: highlightColour, borderColor: highlightColour }} variant="outlined" onClick={() => toggleField()}>Join Class</Button>)}
                {showClassForm && (
                  <>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <TextField sx={{ ...textFieldStyle }} label="Class Name" onChange={(e) => { setClassId(e.target.value) }} />
                      {showError && (<span style={{ fontSize: '12pt', color: 'red' }}>{'Class name does not exist'}<br /></span>)}
                    </Box>
                    <ButtonGroup variant="text" orientation="vertical">
                      <Button sx={{ fontSize: '9pt', color: highlightColour, borderColor: highlightColour }} onClick={() => joinClass()}>Join!</Button>
                      {showClassForm && (<Button style={{ color: highlightColour, borderColor: highlightColour }} onClick={() => toggleField()} sx={{ fontSize: '9pt' }}>Cancel</Button>)}
                    </ButtonGroup>
                  </>
                )}
              </div>
            </Box>
            <Box sx={{
              padding: '10px',
              height: '85%'
            }}>
              <div style={{ width: '100%' }}>
                <Grid container spacing={2}>
                  {classes.map((c) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={c.id}>
                      <Card sx={{ textAlign: 'center' }}>
                        <span onClick={() => goClass(c.id)} style={{ cursor: 'pointer' }}>
                          <CardContent>
                            <Typography variant="h6" component="h3">
                              {c.name}
                            </Typography>
                            <Typography variant="body" component="p">
                              Teacher: {c.teacher_profile.first_name}
                            </Typography>
                          </CardContent>
                        </span>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </div>
            </Box>
          </Box>


        </Box>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: `${lightMode ? '#F1FAFF' : '#3D4856'}`,
          padding: '5px',
          width: '100%',
        }}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
            <div />
            <Typography variant="h5" component="h3">
              Quick Course Finder
            </Typography>
            <FormControl>
              <InputLabel size='small' id="userTypeSelect" required>User Type</InputLabel>
              <Select size='small' sx={{ width: '250px' }} value={courseFinderType} label="User Type" onChange={(e) => updateCourseFinder(e.target.value)}>
                <MenuItem value={1}>Recommended Classes</MenuItem>
                <MenuItem value={2}>Highest Rated</MenuItem>
                <MenuItem value={3}>Most Popular Classes</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{
            padding: '10px',
          }}>
            <Grid container spacing={2}>
              {recCourses.slice(0, 6).map((c) => (
                <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={c.id}>
                  <Card sx={{ textAlign: 'center' }}>
                    <CardContent>
                      <Typography variant="h6" component="h3">
                        {c.name}
                      </Typography>
                      <Typography variant="body1" component="p">
                        {courseFinderType === 1 && c.teacher_profile?.first_name && (
                          <>Teacher: {c.teacher_profile.first_name}</>
                        )}
                        {courseFinderType === 2 && <>Rating: {c.rating}</>}
                        {courseFinderType === 3 && <>Students: {c.students}</>}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

          </Box>

        </Box>
      </main>
    </ThemeProvider >
  )
}

export default StudentDash;