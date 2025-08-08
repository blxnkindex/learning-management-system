import React from 'react';
import '../styles/class.css'
import ClassSideNav from '../modules/ClassSideNav';
import { List, ListItemButton, ListItemText, Box, Typography, Divider, Button, TextField, IconButton, Modal, Fade, Card, CardContent, CardHeader, createTheme, ThemeProvider } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import getClassForums from '../modules/getClassForums';
import SendIcon from '@mui/icons-material/Send';
import API from '../../api';
import Backdrop from '@mui/material/Backdrop';
import modalStyle from '../styles/modalStyle';
import Cookies from 'js-cookie';
import getTheme from '../styles/getTheme';
import textFieldStyle from '../styles/textFieldStyle';

/*
Forum
  Class Page for forum
*/
const Forum = () => {
  const navigate = useNavigate();
  const classId = useParams().classId;
  const [posts, setPosts] = React.useState([])

  // Update shown posts and answer fields
  const [changePost, setChangePost] = React.useState(false);
  const [changeAnswers, setChangeAnswers] = React.useState(false);

  // Modal things
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  //Text field values
  const [postName, setPostName] = React.useState('');
  const [answer, setAnswer] = React.useState('');

  // Current values -> like the question thats selected and shown on the right
  const [currAnswers, setCurrAnswers] = React.useState([])
  const [currTitle, setCurrTitle] = React.useState('')
  const [currPoster, setCurrPoster] = React.useState('')
  const [currPosterId, setCurrPosterId] = React.useState()
  const [currId, setCurrId] = React.useState()

  // Get posts
  React.useEffect(() => {
    (async () => {
      try {
        const classPosts = await getClassForums(classId);
        setPosts(classPosts)
        setCurrTitle(classPosts[0].text)
        setCurrPoster(classPosts[0].user_name)
        setCurrId(classPosts[0].id)
        setCurrPosterId(classPosts[0].user_id)
        await getQuestionAnswers(classPosts[0])
      } catch (error) {
        console.log(error)
      }
    })();
  }, [classId, changePost]);

  // Updates the answers, when a new forum is selected
  const firstUpdate = React.useRef(true);
  React.useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    (async () => {
      try {
        const response = await API.get(`answer/${currId}`,
          {
            headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
          },)
        setCurrAnswers(response.data)
      } catch (error) {
        console.log(error)
      }
    })();
  }, [changeAnswers, currId]);

  // Gets answers of a question
  async function getQuestionAnswers (post) {
    try {
      const response = await API.get(`answer/${post.id}`,
        {
          headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
        },)
      setCurrAnswers(response.data)
      setCurrTitle(post.text)
      setCurrId(post.id)
      setCurrPosterId(post.user_id)
    }
    catch (error) {
      console.log(error)
    }
  }

  // Posts an aswer to a forum thread
  async function postAnswer () {
    try {
      await API.post(`answer/`,
        {
          forum_id: currId,
          text: answer
        },
        {
          headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
        },)
      setChangeAnswers(!changeAnswers)
      setAnswer('')
    }
    catch (error) {
      console.log(error)
    }
  }

  // Creates a new forum post
  async function createPost () {
    try {
      await API.post(`forum/`,
        {
          class_id: classId,
          text: postName
        },
        {
          headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
        },)
      setChangePost(!changePost)
      setPostName('')
      handleClose();
    }
    catch (error) {
      console.log(error)
    }
  }

  //Apply user colors
  const [lightMode, setLightMode] = React.useState(localStorage.getItem("light_theme") === 'true');
  const highlightColour = localStorage.getItem("highlight_colour");
  const theme = lightMode ? createTheme({palette: {mode: 'light',},}) : createTheme({palette: {mode: 'dark',},})
  console.log(lightMode)
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
            <Box sx={modalStyle}>
              <TextField id="Answer" value={postName} label="New Post" sx={{ width: '500px', margin: '10px',...textFieldStyle}} onChange={(e) => { setPostName(e.target.value) }} />
              <Button style={{color: highlightColour, borderColor: highlightColour }} variant="text" onClick={() => createPost()}>Create Post</Button>
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

            <Button style={{backgroundColor: highlightColour, borderColor: highlightColour }} variant="contained" fullWidth onClick={() => handleOpen()}>Create a New Post + </Button>
            {posts.map((post) => (
              <>
                <ListItemButton onClick={() => getQuestionAnswers(post)} sx={{
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  <ListItemText primary={post.text} primaryTypographyProps={{ fontSize: '18px' }} />
                  <ListItemText primary={post.user_name} primaryTypographyProps={{ fontSize: '16px' }} />
                  <ListItemText primary={new Date(post.created_date).toLocaleString()} primaryTypographyProps={{ fontSize: '12px' }} />
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
              padding: '10px'
            }}>      
              {currTitle ? (
                <Typography variant='h4'>{currTitle}</Typography>
              ) : (
                <Typography variant='h4'>No forum posts yet!</Typography>
              )}
              {currPoster &&
              <span style={{cursor: 'pointer'}} onClick={() => navigate(`/user/${currPosterId}`)}><Typography variant='h6'>Posted by: {currPoster}</Typography></span>
              }
            </Box>

            <Box sx={{
              padding: '10px',
              overflow: 'auto'
            }}>
              {currTitle !== '' &&
                <>
                  <Typography variant='h6' sx={{ margin: '10px' }}> Answers</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <TextField id="Answer" value={answer} label="New comment"
                      sx={{ width: '80%', margin: '5px', justifyContent: 'center',
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: highlightColour,
                      },
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: highlightColour,
                      }}} onChange={(e) => { setAnswer(e.target.value) }} />
                    <IconButton onClick={() => postAnswer()}>
                      <SendIcon />
                    </IconButton>
                  </Box>
                </>
              }
              <Box>
                {currAnswers && currAnswers.map((answer) => (
                  <>
                    <Card variant="outlined" sx={{
                      margin: '10px'
                    }}>
                      <CardHeader sx={{cursor: 'pointer'}} onClick={() => navigate(`/user/${answer.user_id}`)} title={answer.user_name} subheader={new Date(answer.sent_time).toLocaleString()}
                titleTypographyProps={{ style: { fontSize: '18pt' } }}
                    subheaderTypographyProps={{ style: { fontSize: '12pt' } }}>
                      </CardHeader>
                      <CardContent>
                        <Typography variant='body'>
                          {answer.text}
                        </Typography>
                      </CardContent>
                    </Card>
                  </>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
    </main>
    </ThemeProvider>
  )
}

export default Forum