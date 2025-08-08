import React from 'react';
import { Button, Grid, ThemeProvider, createTheme } from '@mui/material';
import { Typography, Card, TextField, ButtonGroup, CardContent } from '@mui/material';
import API from '../../api';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import modalStyle from '../styles/modalStyle';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Backdrop from '@mui/material/Backdrop';
import Fade from '@mui/material/Fade';


import '../styles/dash.css'
import getTheme from '../styles/getTheme';
import textFieldStyle from '../styles/textFieldStyle';

/*
TeacherDash
  Teachers dashboard, allows for creating classes
*/
const TeacherDash = () => {
  const navigate = useNavigate();
  const [showTags, setShowTags] = React.useState(false);
  const [className, setClassName] = React.useState('');
  const [classes, setClasses] = React.useState([])
  const [updateClasses, setUpdateClasses] = React.useState(false);
  const [newId, setNewId] = React.useState(null)
  const [tag, setTag] = React.useState('');
  const [showError, setShowError] = React.useState('');

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');

  // Modal things
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => { setOpen(true); setShowTags(false) };
  const handleClose = () => { setOpen(false); setUpdateClasses(!updateClasses); setShowError(false) };

  // Get classes
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
      } catch (error) {
        console.log(error);
      }
    })();
  }, [updateClasses]);

  // Getes name
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

  // Navs to a class
  function goClass (id) {
    navigate(`/class/${id}`);
  };

  // Creates a class
  async function makeClass () {
    try {
      const response = await API.post('create_class/',
        {
          name: className,
        },
        {
          headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
        },
      )
      // setUpdateClasses(!updateClasses);
      setNewId(await response.data['class_id']);
      setClassName('');
      setShowTags(true);
    } catch (error) {
      console.log(error)
      setShowError(true)
    }
  }

  // Adds a tag to a created class
  async function addTag () {
    try {
      await API.post('tag_set/',
        {
          class_id: newId,
          tag: tag,
        },
        {
          headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
        },
      )
      // setUpdateClasses(!updateClasses);
      setTag('');
    } catch (error) {
      console.log(error)
    }
  }

  // Finishes the modal
  function modalFinish () {
    handleClose();
    setUpdateClasses(!updateClasses);
    setShowTags(false);
  }

  //Apply user colors
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
        flexWrap: 'wrap'
      }} className={lightMode ? 'light-mode' : 'dark-mode'}>
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          role="alert"
          open={open}
          onClose={handleClose}
          closeAfterTransition
          slots={{ backdrop: Backdrop }}
          slotProps={{
            backdrop: {
              timeout: 500,
            },
          }}
        >
          <div>
            <Fade in={open}>
              <Box sx={{ ...modalStyle, color: lightMode ? 'black' : 'white' }}>
                <Typography id="transition-modal-description" sx={{ mt: 2 }}>
                  {!showTags && (
                    <>
                      <div style={{ marginBottom: '15px', textAlign: 'center' }}>Enter your new class name!</div>
                      <TextField sx={{ ...textFieldStyle }} size='small' fullWidth label="Class name" value={className} onChange={(e) => { setClassName(e.target.value) }} /> <br />
                      {showError && (<span style={{ fontSize: '12pt', color: 'red' }}>{'A class with that name already exists'}<br /></span>)}
                      <span style={{ display: 'flex', justifyContent: 'center' }}><Button sx={{ color: highlightColour, borderColor: highlightColour }} variant="text" disabled={className === ''} onClick={() => makeClass()}>Next</Button></span>
                    </>
                  )}
                  {showTags && (
                    <>
                      <div style={{ marginBottom: '5px', textAlign: 'center' }}>Add tags to your class!</div>
                      <div style={{ color: 'grey', fontSize: '8pt', marginBottom: '15px', textAlign: 'center' }}>(Optional, but very recommended so students can find your class easily)</div>
                      <TextField sx={{ ...textFieldStyle }} size='small' fullWidth label="Tag name" value={tag} onChange={(e) => { setTag(e.target.value) }} /> <br />
                      <span style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                        <ButtonGroup variant="text" orientation='vertical' >
                          <Button sx={{ color: highlightColour, borderColor: highlightColour }} disabled={tag === ''} onClick={() => addTag()}>Add Tag</Button>
                          <Button sx={{ color: highlightColour, borderColor: highlightColour }} onClick={() => modalFinish()}>Create Class!</Button>
                        </ButtonGroup>
                      </span>
                    </>
                  )}
                </Typography>
              </Box>
            </Fade>
          </div>
        </Modal>

        <Box sx={{
          width: '95%',
          height: '90%',
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
                <Button style={{ color: highlightColour, borderColor: highlightColour }} variant="outlined" onClick={() => handleOpen()}>Create Class</Button>
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
      </main>
    </ThemeProvider >
  )
}

export default TeacherDash;