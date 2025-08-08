import React from 'react';
import '../styles/class.css'
import ClassSideNav from '../modules/ClassSideNav';
import { List, ListItemButton, ListItemText, Box, Typography, Divider, Button, TextField, Modal, Fade, Card, CardHeader, createTheme, ThemeProvider } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../api';
import Backdrop from '@mui/material/Backdrop';
import modalStyle from '../styles/modalStyle';
import Cookies from 'js-cookie';
import getTheme from '../styles/getTheme';
import textFieldStyle from '../styles/textFieldStyle';
import getClassQuizzes from '../modules/getClassQuizzes';
import AddQuestionButton from '../modules/AddQuestionButton';
import getQuestions from '../modules/getQuestions';
import getResults from '../modules/getResults';

/*
Quiz
  Quizzes page
*/
const Quiz = () => {
  const navigate = useNavigate();
  const classId = useParams().classId;
  const [quizzes, setQuizzes] = React.useState([]);
  const [userId, setUserId] = React.useState(null);
  const [isTeacher, setIsTeacher] = React.useState(null);

  // New Quiz Details
  const [newQuizName, setNewQuizName] = React.useState('')
  const [newQuizDesc, setNewQuizDesc] = React.useState('')
  const [newDueDate, setNewDueDate] = React.useState('')

  // Current values
  const [currQuiz, setCurrQuiz] = React.useState({});
  const [currQuestions, setCurrQuestions] = React.useState([]);
  const [currResults, setCurrResults] = React.useState([]);
  const [userResult, setUserResult] = React.useState({});

  // Toggle between description and results
  const [showResults, setShowResults] = React.useState(false);

  // Create Assignment Modal
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  // Switch to update
  const [update, setUpdate] = React.useState(false);
  const [updateQuestions, setUpdateQuestions] = React.useState(false);

  // Gets the quizzes and sets the current quiz
  // to the first one if it exists
  React.useEffect(() => {
    (async () => {
      try {
        const classQuizzes = await getClassQuizzes(classId);
        setQuizzes(classQuizzes);
        const userDetails = await API.get(`user/`, 
        {
          headers: {'X-CSRFToken':Cookies.get('csrftoken')},
        },)
        setIsTeacher(userDetails.data['is_teacher'])
        setUserId(userDetails.data['id']); 
  
        if (classQuizzes[0]) {
          const quizQuestions = await getQuestions(classQuizzes[0]['id']);
          setCurrQuestions(quizQuestions);
          const quizResults = await getResults(classQuizzes[0]['id']);
          setCurrResults(quizResults);
          setUserResult(quizResults.find(res => res.user_id === userDetails.data['id']));
          setCurrQuiz(classQuizzes[0]);
        } else {
          setCurrQuiz(null)
        }
  
        setUpdate(false);
      } catch (error) {
        console.log(error)
      }
    })();
  }, [update, classId]);

  // Gets current questions of a quiz
  React.useEffect(() => {
    (async () => {
      try {
        const quizQuestions = await getQuestions(currQuiz.id);
        setCurrQuestions(quizQuestions);
      } catch (error) {
      }
    })();
  }, [updateQuestions, currQuiz]);

  // Updates the current quiz when the user clicks another quiz
  async function updateCurrQuiz (quiz) {
    setCurrQuiz(quiz);
    const quizResults = await getResults(quiz['id']);
    setCurrResults(quizResults);
    setUserResult(quizResults.find(res => res.user_id === userId));
    const quizQuestions = await getQuestions(quiz['id']);
    setCurrQuestions(quizQuestions);
  }

  // Makes a new quiz
  async function makeQuiz () {
    try {
      await API.post('quiz_create/',
        {
          "class_id": classId,
          "name": newQuizName,
          "description": newQuizDesc,
          "due_date": newDueDate
        },
        {
          headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
        },
      )
      console.log(newDueDate)
      setNewQuizName('');
      setNewQuizDesc('');
      setNewDueDate('');
      setUpdate(!update);
      handleClose();
    } catch (error) {
      console.log(error)
    }
  }

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
              <div style={{ marginBottom: '15px', textAlign: 'center' }}>Create a new quiz</div>
              <TextField sx={{...textFieldStyle}} size='small' fullWidth label="Quiz Name" value={newQuizName} onChange={(e) => {setNewQuizName(e.target.value)}} /> <br />
              <TextField sx={{...textFieldStyle}} size='small' fullWidth label="Quiz Description" value={newQuizDesc} onChange={(e) => {setNewQuizDesc(e.target.value)}}  /> <br />
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
                  onClick={() => makeQuiz()}
                  variant="text" 
                  disabled={(newQuizName === '' || newQuizDesc === '')}
                >
                  Create Quiz
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
              <Button style={{backgroundColor: highlightColour, borderColor: highlightColour }} variant="contained" fullWidth onClick={() => handleOpen()}>Create a new Quiz + </Button>
            }
            {quizzes.map((quiz) => (
              <>
                <ListItemButton onClick={() => updateCurrQuiz(quiz)} sx={{
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <ListItemText primary={quiz.name} primaryTypographyProps={{ fontSize: '18px' }} />
                  <ListItemText primary={"Due: " + new Date(quiz.due_date).toLocaleString('en-US', { timeZone: 'UTC' })} primaryTypographyProps={{ fontSize: '12px' }} />
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
              {!currQuiz &&
                <Typography variant='h4'>No quizzes yet!</Typography>
              }
              {isTeacher === true && currQuiz && !showResults &&
                <Button sx={{borderColor: highlightColour, color: highlightColour}} 
                fullWidth variant='outlined'
                onClick={() => setShowResults(true)}
                >
                  Show Results
                </Button>
              }
              {isTeacher === true && currQuiz && showResults &&
                <Button sx={{borderColor: highlightColour, color: highlightColour}} 
                fullWidth variant='outlined'
                onClick={() => setShowResults(false)}
                >
                  Show Quiz Details
                </Button>
              }
              {isTeacher === false && currQuiz && !userResult &&
                <Button sx={{borderColor: highlightColour, color: highlightColour}} 
                fullWidth variant='outlined'
                onClick={() => navigate(`/class/${classId}/quizzes/${currQuiz.id}`)}
                disabled={currQuestions.length === 0 || new Date().setHours(new Date().getHours() + 10) > new Date(currQuiz.due_date)}
                >
                  {new Date().setHours(new Date().getHours() + 10) > new Date(currQuiz.due_date) ? "Quiz Already Due" : "Attempt Quiz"}
                </Button>
              } 
              {currQuiz && !showResults &&
                <>  
                <Typography variant='h5'>{currQuiz.name}</Typography>
                <Typography variant='body' sx={{ margin: '10px' }}>
                  {currQuiz.description}<br /><br />
                  {
                    currQuiz && currQuiz.due_date && 
                    <>
                    {currQuestions.length} questions<br />
                    Due Date: {new Date(currQuiz.due_date).toLocaleString('en-US', { timeZone: 'UTC' })}
                    </>
                  }
                </Typography>
                </>
              }
              {currQuiz && isTeacher === false && userResult &&
                <>
                  <Card variant="outlined" sx={{
                      margin: '10px'
                    }}>
                    <CardHeader title="Your Result"
                      subheader={userResult.points + "pts"}
                      titleTypographyProps={{ style: { fontSize: '18pt' } }}
                      subheaderTypographyProps={{ style: { fontSize: '12pt' } }}>
                    </CardHeader>
                  </Card>
                </>
              }
              {isTeacher === true && currQuiz && !showResults &&
              <div style={{marginTop: '50px'}}>
                <Typography variant='h6'>Questions</Typography>
                <AddQuestionButton id={currQuiz.id} setUpdate={setUpdateQuestions} update={updateQuestions}></AddQuestionButton>
                {currQuestions.map((question) => (
                <>
                  <Card variant="outlined" sx={{
                    marginBottom: '5px'
                  }}>
                    <CardHeader title={question.text} 
                      subheader={question.solution}
                      titleTypographyProps={{ style: { fontSize: '13pt' } }}
                      subheaderTypographyProps={{ style: { fontSize: '10pt' } }}>
                    </CardHeader>
                  </Card>
                </>
                ))}
              </div>}
              {isTeacher === true && currQuiz && showResults &&
              <>
              {currResults && currResults.map((result) => (
                <>
                  <Card variant="outlined" sx={{
                      margin: '10px'
                    }}>
                      <CardHeader title={result.user} 
                        subheader={result.points + "pts"}
                        titleTypographyProps={{ style: { fontSize: '18pt' } }}
                        subheaderTypographyProps={{ style: { fontSize: '12pt' } }}>
                      </CardHeader>
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

export default Quiz
