import React from 'react';
import '../styles/class.css'
import ClassSideNav from '../modules/ClassSideNav';
import { Box, Typography, Button, TextField, createTheme, ThemeProvider, FormGroup, FormControlLabel, Radio } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../api';
import Cookies from 'js-cookie';
import getTheme from '../styles/getTheme';
import textFieldStyle from '../styles/textFieldStyle';
import getClassQuizzes from '../modules/getClassQuizzes';
import getQuestions from '../modules/getQuestions';

/*
PlayQuiz
  Page for when a student is currently attempting a quiz
  handles all the points calculation
*/
const PlayQuiz = () => {
  const navigate = useNavigate();
  const quizId = useParams().quizId;
  const classId = useParams().classId;
  const [questions, setQuestions] = React.useState([]);

  // current question
  const [currQuestion, setCurrQuestion] = React.useState(0);
  const [quizName, setQuizName] = React.useState('')

  // Answer
  const [answer, setAnswer] = React.useState('');
  const [studentAnswers, setStudentAnswers] = React.useState([]);

  // Gets the question and the quiz name
  React.useEffect(() => {
    (async () => {
      try {
        const classQuizzes = await getClassQuizzes(classId);
        setQuizName(classQuizzes.find(quiz => quiz.id === parseInt(quizId, 10))['name']);

        const quizQuestions = await getQuestions(quizId);
        setQuestions(quizQuestions);
        setCurrQuestion(0);
      } catch (error) {
        console.log(error)
      }
    })();
  }, [quizId, classId]);
  
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

  // Goes to the next question and stores the 
  // users submission in an array
  function handleNext() {
    const updatedAnswers = [...studentAnswers];
    updatedAnswers[currQuestion] = answer;
    setStudentAnswers(updatedAnswers);
    setCurrQuestion(currQuestion + 1);
    setAnswer('');
    console.log(currQuestion);
  }

  // Calculates the users points
  // based on their submission array
  // compared to the answers of the questions 
  // and submits the quiz with the caluclated points
  async function submitQuiz () {
    try {
      
    let numCorrect = 0;
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const studentAnswer = studentAnswers[i];
  
      if (question.multiple_choice) {
        if (studentAnswer === question.solution) {
          numCorrect += 1;
        }
      } 
      else {
        if (question.solution.split(' ').every(word => studentAnswer.split(' ').includes(word))) {
          numCorrect += 1;
        }
      }
    }
  
    const points = Math.round((numCorrect / questions.length) * 1000) ;
    await API.post('result_create/',
    {
    "quiz_id" : quizId,
    "points"  : points,
    },
    {
      headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
    },)
    navigate(`/class/${classId}/quizzes`)
    }
    catch (error) {
      console.log(error)
    }
  }
  
  return (
    <ThemeProvider theme={theme}>
    <main style={{alignItems: 'flex-start'}} className={lightMode ? 'light-mode' : 'dark-mode'}>
    <ClassSideNav />
    <Typography align='center'>
    <Typography align='center' variant='h3'>
      Currently Attempting: {quizName}
    </Typography>
    <Box sx={{
      backgroundColor: `${lightMode ? '#F1FAFF' : '#3D4856'}`,
      width: '70vw',
      borderRadius: '40px',
      margin: 'auto',
      marginLeft: '200px',
      padding: '20px',
      }}>
      {questions && currQuestion < questions.length && questions.length > 0 &&  (
        <Typography align='center' variant='h5'>
          {questions[currQuestion].text}
        </Typography>
      )}
      <Typography align='left' variant='body'>
        {questions && currQuestion < questions.length && questions.length > 0 && questions[currQuestion].multiple_choice && (
        <FormGroup>
          <FormControlLabel control={<Radio />} label={questions[currQuestion].option_a} value="A" checked={answer === 'A'} onChange={(e) => setAnswer(e.target.value)} />
          <FormControlLabel control={<Radio />} label={questions[currQuestion].option_b} value="B" checked={answer === 'B'} onChange={(e) => setAnswer(e.target.value)} />
          <FormControlLabel control={<Radio />} label={questions[currQuestion].option_c} value="C" checked={answer === 'C'} onChange={(e) => setAnswer(e.target.value)} />
          <FormControlLabel control={<Radio />} label={questions[currQuestion].option_d} value="D" checked={answer === 'D'} onChange={(e) => setAnswer(e.target.value)} />
        </FormGroup>
        )}
        {questions && currQuestion < questions.length &&  questions.length > 0 && !questions[currQuestion].multiple_choice && (
          <TextField sx={{height: '75px',...textFieldStyle}} fullWidth label="Answer" value={answer} onChange={(e) => {setAnswer(e.target.value)}} />
        )}
      {currQuestion >= questions.length && 
        <Typography align='center' variant='h5'>
          You have finished all the questions<br />
          <Button sx={{color: highlightColour}}  onClick={() => submitQuiz()}>Submit Quiz</Button>
        </Typography>
      }
      {currQuestion < questions.length && 
      <Button sx={{color: highlightColour}} onClick={handleNext} disabled={currQuestion > questions.length}>
        Next Question
      </Button>}
      </Typography>
    </Box>
    </Typography>
    </main>
    </ThemeProvider>
  )
}

export default PlayQuiz
