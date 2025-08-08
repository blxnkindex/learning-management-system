import React from 'react';
import '../styles/class.css'
import ClassSideNav from '../modules/ClassSideNav';
import { List, ListItemButton, ListItemText, Box, Typography, Divider, Button, TextField, Modal, Fade, Card, CardContent, CardHeader, createTheme, ThemeProvider, ButtonGroup } from '@mui/material';
import { useParams } from 'react-router-dom';
import API from '../../api';
import Backdrop from '@mui/material/Backdrop';
import modalStyle from '../styles/modalStyle';
import Cookies from 'js-cookie';
import getTheme from '../styles/getTheme';
import textFieldStyle from '../styles/textFieldStyle';
import getClassAssignments from '../modules/getClassAssignments';
import SubmitButton from '../modules/SubmitButton';
import getSubmissions from '../modules/getSubmissions';
import MarkSubmission from '../modules/MarkSubmission';

/*
Assignments
  Page for assignments of a class
*/
const Assignments = () => {
  const classId = useParams().classId;
  const [assignments, setAssignments] = React.useState([]);
  const [userId, setUserId] = React.useState(null);
  const [isTeacher, setIsTeacher] = React.useState(null);

  // New Assignment Values
  const [newAssName, setNewAssName] = React.useState('')
  const [newAssDesc, setNewAssDesc] = React.useState('')
  const [newDueDate, setNewDueDate] = React.useState('')

  // Sets a switch to allow for updating values
  const [update, setUpdate] = React.useState(false);

  // Toggle desc or submissions
  const [showSubmissions, setShowSubmissions] = React.useState(false);
  const [submissions, setSubmissions] = React.useState(null)

  // Show option to submit and the student's submission if it exists
  const [userSubmitted, setUserSubmitted] = React.useState(false);
  const [userSubmission, setUserSubmission] = React.useState(null);

  // Current Assignment Values
  const [currAss, setCurrAss] = React.useState({})

  // Create Assignment Modal
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Gets the assignments and sets the 
  // current assignment to the first one
  // Also checks if a user has a submission
  React.useEffect(() => {
    (async () => {
      try {
        const classAssignments = await getClassAssignments(classId);
        setAssignments(classAssignments);
  
        const userDetails = await API.get(`user/`, 
        {
          headers: {'X-CSRFToken':Cookies.get('csrftoken')},
        },)
        setIsTeacher(userDetails.data['is_teacher'])
        setUserId(userDetails.data['id']); 
  
        if (classAssignments[0]) {
          const assSubmissions = await getSubmissions(classAssignments[0]['id']);
          const userSubmission = assSubmissions.find(submission => submission.user_id === userDetails.data['id']);
          setSubmissions(assSubmissions);
          setUserSubmitted(!!userSubmission);
          setUserSubmission(userSubmission);
          setCurrAss(classAssignments[0]);
        } else {
          setCurrAss(null)
        }
  
        setUpdate(false)
      } catch (error) {
        console.log(error)
      }
    })();
  }, [update, classId]);

  // Creates an assignment with the fields given by the teacher
  async function makeAssignment () {
    try {
      await API.post('assignment_create/',
        {
          "class_id": classId,
          "name": newAssName,
          "description": newAssDesc,
          "due_date": newDueDate,
        },
        {
          headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
        },
      )
      setNewAssName('');
      setNewAssDesc('');
      setNewDueDate('');
      setUpdate(!update);
      handleClose();
    } catch (error) {
      console.log(error)
    }
  }

  // Update submissions 
  async function updateSubmissions () {
    const assSubmissions = await getSubmissions(currAss['id'])
    setSubmissions(assSubmissions)
    setShowSubmissions(true);
  }

  // Update the current assignment details when
  // the user clicks on another assignment
  async function updateCurrAss (ass) {
    setCurrAss(ass);
    const assSubmissions = await getSubmissions(ass['id']);
    const userSubmission = assSubmissions.find(submission => submission.user_id === userId);
    setSubmissions(assSubmissions);
    setUserSubmitted(!!userSubmission);
    setUserSubmission(userSubmission);
    setShowSubmissions(false);
  }
  
  // Allows for downloading of files
  async function clickDownload (file) {
    try {
      const downloadUrl = `http://localhost:8000/submissions_download/${file}`;
      window.open(downloadUrl);
    } catch (error) {
      console.log(error);
    }
  };


  //Apply user colors
  const [lightMode, setLightMode] = React.useState(localStorage.getItem("light_theme") === 'true');
  const highlightColour = localStorage.getItem("highlight_colour");
  const theme = lightMode ? createTheme({palette: {mode: 'light',},}) : createTheme({palette: {mode: 'dark',},})
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
      <Modal
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
            <Box sx={modalStyle}>
              <div style={{ marginBottom: '15px', textAlign: 'center' }}>Set a new Assignment!</div>
              <TextField sx={{...textFieldStyle}} size='small' fullWidth label="Assignment Name" value={newAssName} onChange={(e) => {setNewAssName(e.target.value)}} /> <br />
              <TextField sx={{...textFieldStyle}} size='small' fullWidth label="Assignment Description" value={newAssDesc} onChange={(e) => {setNewAssDesc(e.target.value)}} /> <br />
              <label htmlFor="dueDate">Select Due Date and Time:</label>
              <input
                type="datetime-local"
                id="dueDate"
                name="dueDate"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
              <span style={{display: 'flex', justifyContent: 'center'}}>
                <Button 
                  sx={{
                    color: highlightColour,
                    borderColor: highlightColour }}
                  onClick={() => makeAssignment()}
                  variant="text" disabled={(newAssName === '' || newAssDesc === '')}>
                    Create Assignment
                </Button>
              </span>
            </Box>
          </Fade>
        </div>
      </Modal>
    <main style={{height: '0',alignItems: 'flex-start'}} className={lightMode ? 'light-mode' : 'dark-mode'}>
        <ClassSideNav />
        <Box className={lightMode ? 'light-mode' : 'dark-mode'} sx={{
          display: 'flex',
          marginLeft: '200px',
          width: 'calc(100vw - 200px)',
          paddingLeft: '10px',
          paddingRight: '10px',
          height: 'calc(100vh - 110px)',
        }}>
        
          <List sx={{
            width: '30%',
            overflow: 'auto',
          }}>
            {isTeacher === true && 
              <Button style={{backgroundColor: highlightColour, borderColor: highlightColour }} variant="contained" fullWidth onClick={() => handleOpen()}>Create a new Assignment + </Button>
            }
            {assignments.map((ass) => (
              <>
                <ListItemButton onClick={() => updateCurrAss(ass)} sx={{
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <ListItemText primary={ass.name} primaryTypographyProps={{ fontSize: '18px' }} />
                  <ListItemText primary={"Created: " + new Date(ass.created_date).toLocaleString()} primaryTypographyProps={{ fontSize: '12px' }} />
                </ListItemButton>
                <Divider variant="middle" />
              </>
            ))}

          </List>
          <Box sx={{
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            width: '70%'
          }}>
            <Box sx={{
              padding: '10px',
              overflow: 'auto'
            }}>
              {!currAss &&
                <Typography variant='h4'>No Assignments yet!</Typography>
              }
              {isTeacher === false && currAss && userSubmitted === false &&
                <>
                {new Date().setHours(new Date().getHours() + 10) > new Date(currAss.due_date) ?
                <Button disabled fullWidth variant='outlined'>Assignment Already Due</Button> :
                <SubmitButton id={currAss.id} setChange={setUpdate} change={update}></SubmitButton>
                }
                </>
              }
              {showSubmissions === false && currAss && isTeacher &&
              <>
                <Button style={{marginBottom: '30px', color: highlightColour, borderColor: highlightColour }}
                variant="outlined" fullWidth 
                onClick={() => updateSubmissions()}>
                  View Student Submissions for {currAss.name}
                </Button>
              </>
              }
              {showSubmissions === true && currAss && isTeacher &&
              <>
                <Button style={{color: highlightColour, borderColor: highlightColour }}
                variant="outlined" fullWidth 
                onClick={() => setShowSubmissions(false)}>
                  View {currAss.name} Assignment Description
                </Button>
              </>
              }
              {showSubmissions === false  && currAss &&
                <>  
                <Typography variant='h5'>{currAss.name}</Typography>
                <Typography variant='body' sx={{ margin: '10px' }}>
                  {currAss.description}<br /><br />
                  {
                    currAss && currAss.created_date && 
                    <>
                    Created Date: {new Date(currAss.created_date).toLocaleString()}<br />
                    Due Date: {new Date(currAss.due_date).toLocaleString('en-US', { timeZone: 'UTC' })}
                    </>
                  }
                </Typography>
                </>
              }
              {isTeacher === false && userSubmitted &&
                <Card variant="outlined" sx={{
                  margin: '10px'
                }}>
                  <CardHeader title="Your Submission"
                    subheader={userSubmission.marked ? `Points: ${userSubmission.points}` : 'Not marked yet'}
                    titleTypographyProps={{ style: { fontSize: '18pt' } }}
                    subheaderTypographyProps={{ style: { fontSize: '12pt' } }}>
                  </CardHeader>
                  <CardContent>
                    <Typography variant='body'>
                      <Button variant='outlined' sx={{borderColor: highlightColour, color: highlightColour}} onClick={() => clickDownload(userSubmission['file'])}>Download your Submission</Button>
                    </Typography>
                  </CardContent>
                </Card>
              }
              {showSubmissions === true && currAss &&
              <>
              {submissions && submissions.map((submission) => (
                  <>
                    <Card variant="outlined" sx={{
                      margin: '10px'
                    }}>
                      <CardHeader title={"Submitted by: " + submission.user_name}
                      // subheader={new Date(answer.sent_time).toLocaleString()}
                        titleTypographyProps={{ style: { fontSize: '18pt' } }}
                        subheaderTypographyProps={{ style: { fontSize: '12pt' } }}>
                      </CardHeader>
                      <CardContent>
                        <Typography variant='body'>
                        <ButtonGroup orientation="vertical" variant="outlined">
                          <Button sx={{borderColor: highlightColour, color: highlightColour}} onClick={() => clickDownload(submission['file'])}>download</Button>
                          {submission['marked'] === false && <MarkSubmission setShowSubmissions={setShowSubmissions} id={submission.id}></MarkSubmission>}
                        </ButtonGroup>
                          {submission['marked'] === true && <div>This submission has been marked with {submission['points']}pts</div>}

                        </Typography>
                      </CardContent>
                    </Card>
                  </>
                ))}
              </>
              }
                
            </Box>
          </Box>
        </Box>
    </main>
    </ThemeProvider>
  )
}

export default Assignments
