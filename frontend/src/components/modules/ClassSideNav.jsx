import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../api'
import getUserType from './getUserType';
import Cookies from 'js-cookie';
import getClassDetails from './getClassDetails';
import { Drawer, List, ListItemText, ListItemButton, Modal, Backdrop, Fade, Box, TextField, Button, Typography } from '@mui/material';
import modalStyle from '../styles/modalStyle';
import getClassTags from './getClassTags';
import textFieldStyle from '../styles/textFieldStyle';
import RatingButton from './RatingButton';

/*
Class Side Navigation Bar
  Sidebar that shows on all class pages
  Allows for a user to navigate to sections of each class
*/
const ClassSideNav = () => {
  const navigate = useNavigate();
  const classId = useParams().classId;
  const [userType, setUserType] = React.useState(false);
  const [isStarted, setIsStarted] = React.useState();
  const [className, setClassName] = React.useState('');
  const [classTags, setClassTags] = React.useState([]);

  // Field for the live class link
  const [link, setLink] = React.useState('');

  // Regex to match for embed links, prevents error prevention
  const linkRegex = /^https:\/\/www\.youtube\.com\/embed\/[\w-]+$/;

  // Get user's chosen color scheme and dark mode preference
  const highlightColour = localStorage.getItem("highlight_colour");
  const lightMode = React.useState(localStorage.getItem("light_theme") === 'true');

  // First modal: 
  //  Handles the text field of the live class link
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Second Modal:
  //  Handles showing the class tags
  const [open2, setOpen2] = React.useState(false);
  const handleOpen2 = () => setOpen2(true);
  const handleClose2 = () => setOpen2(false);
  
  // Get the details of the class page using
  // the classId
  React.useEffect(() => {
    (async () => {
      try {
        const classDetails = await getClassDetails(classId)
        setIsStarted(classDetails['is_started'])
        setClassName(classDetails['name'])
        const type = await getUserType();
        setUserType(type);
        const tags = await getClassTags(classId);
        setClassTags(tags);
      } catch (error) {
        console.log(error)
      }
    })();
  }, [classId]);

  // Start the class
  async function startClass () {
    try {
      await API.post('class_start/',
        {
          id: classId,
          name: className,
          live_link: link
        },
        {
          headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
        },
      )
      setIsStarted(true);
      navigate(`/class/${classId}/live`)

    } catch (error) {
      console.log(error)
    }
  }

  // Stop a started class
  async function stopClass () {
    try {
      await API.post('class_stop/',
        {
          id: classId,
          name: className
        },
        {
          headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
        },
      )
      setIsStarted(false);
      navigate(`/class/${classId}`)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
    <Modal
      role="alert"
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: {timeout: 500,},}}
    >
    <div>
      <Fade in={open}>
        <Box sx={modalStyle}>
          <TextField id="Answer" 
            value={link} 
            label="Enter Youtube Embed Link" 
            sx={{ width: '500px', margin: '10px', ...textFieldStyle}} 
            onChange={(e) => { setLink(e.target.value) }} 
          />
          <Button
            disabled={!linkRegex.test(link)} 
            sx={{color: highlightColour, borderColor: highlightColour }} 
            variant="text" onClick={() => startClass()}
          >
            Start Class
          </Button>
          {link && !linkRegex.test(link) && 
            <div style={{fontSize: '12pt', color: 'red'}}>Please enter a valid link (https://www.youtube.com/embed/...)</div>
          }
        </Box>
      </Fade>
    </div>
  </Modal>
  <Modal
    role="alert"
    open={open2}
    onClose={handleClose2}
    closeAfterTransition
    slots={{ backdrop: Backdrop }}
    slotProps={{ backdrop: {timeout: 500,},}}>
    <div>
      <Fade in={open2}>
        <Box sx={{
            ...modalStyle,
            color: lightMode ? 'black' : 'white',
          }}>
          <Typography align='center' variant='h5'>
            Class Tags
          </Typography>
          {classTags.map((tag, index) => (
            <span key={index}>{tag} </span>
          ))}
        </Box>
      </Fade>
    </div>
  </Modal>
      <Drawer
      variant="permanent"
      sx={{
        '& .MuiDrawer-paper': {
          marginTop: '100px',
          width: '200px'
        }
      }}
      >
      <List>
        <ListItemButton onClick={() => navigate(`/class/${classId}`)}>
          <ListItemText primary="Class Homepage" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate(`/class/${classId}/content`)}>
          <ListItemText primary="Content" />
        </ListItemButton>
        {userType && !isStarted && (
          <ListItemButton onClick={() => handleOpen()}>
            <ListItemText primary="Start Live Class" />
          </ListItemButton>
        )}
        {userType && isStarted && (
          <ListItemButton onClick={() => stopClass()}>
            <ListItemText primary="Stop Live Class" />
          </ListItemButton>
        )}
        {!userType && isStarted && (
          <ListItemButton onClick={() => navigate(`/class/${classId}/live`)}>
            <ListItemText primary="Join Live Class" />
          </ListItemButton>
        )}
        <ListItemButton onClick={() => navigate(`/class/${classId}/forum`)}>
          <ListItemText primary="Forum" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate(`/class/${classId}/quizzes`)}>
          <ListItemText primary="View Quizzes" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate(`/class/${classId}/assignments`)}>
          <ListItemText primary="View Assignments" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate(`/class/${classId}/leaderboard`)}>
          <ListItemText primary="View Leaderboard" />
        </ListItemButton>
        <RatingButton />
        <ListItemButton onClick={handleOpen2}>
          <ListItemText primary="View Class Tags" />
        </ListItemButton>
      </List>
      </Drawer>
      </>
  );
};

export default ClassSideNav;
