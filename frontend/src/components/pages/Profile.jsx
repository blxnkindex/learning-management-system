import React from 'react';
import { useParams } from 'react-router-dom';
import '../styles/class.css'
import API from '../../api';
import Cookies from 'js-cookie';
import { Backdrop, Box, Button, Card, CardContent, Fade, Modal, Switch, ThemeProvider, Typography, createTheme, Grid, Divider, ButtonGroup } from '@mui/material';
import ProfileSideNav from '../modules/ProfileSideNav';
import getTheme from '../styles/getTheme';
import modalStyle from '../styles/modalStyle';
import { SketchPicker } from 'react-color';
import PictureUpload from '../modules/PictureUpload';
import classLeaderBadge from '../badges/classLeader.png';
import completionistBadge from '../badges/completionist.png';
import creditBadge from '../badges/credit.png';
import distinctionBadge from '../badges/distinction.png';
import highDistinctionBadge from '../badges/highDistinction.png';
import questionAnswererBadge from '../badges/questionAnswerer.png';
import questionAskerBadge from '../badges/questionAsker.png';
import studiousBadge from '../badges/studious.png';
import top3Badge from '../badges/top3.png';

/*
Profile
  Profile page, also allows for uploading of profile picture
  and selection of the dark/lightmode and colorscheme
*/
const Profile = () => {
  const userId = useParams().userId;
  const [classes, setClasses] = React.useState([]);
  const [userDetails, setUserDetails] = React.useState({});
  const [currTheme, setCurrTheme] = React.useState(localStorage.getItem("light_theme") === 'true');
  const [newTheme, setNewTheme] = React.useState();
  const [selectedColor, setSelectedColor] = React.useState('');
  const [badges, setBadges] = React.useState([]);
  const [isTeacher, setIsTeacher] = React.useState(null);

  const fallbackIMG = "https://static.vecteezy.com/system/resources/thumbnails/002/534/006/small/social-media-chatting-online-blank-profile-picture-head-and-body-icon-people-standing-icon-grey-background-free-vector.jpg"

  // Changes the color
  const handleColorChange = (color) => {
    setSelectedColor(color.hex);
    console.log(color);
  };

  // Toggles the lightmode
  const handleToggle = () => {
    setNewTheme(!newTheme);
  };

  // Modal fields
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Gets a user and their relevant details
  // Also gets their badges
  React.useEffect(() => {
    (async () => {
      try {
        const response = await API.get(`user/${userId}`, {},
          {
            headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
          },
        )
        const data = await response.data;
        const userTheme = await getTheme();
        const badgeResponse = await API.get(`user/achievements/${userId}`, {},
          {
            headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
          },
        )
        setBadges(await badgeResponse.data);
        setIsTeacher(data['is_teacher'])
        setCurrTheme(userTheme['light_theme']);
        setNewTheme(userTheme['light_theme']);
        setUserDetails(data);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [userId]);

  // Gets the users classes
  React.useEffect(() => {
    (async () => {
      try {
        const response = await API.get(`user_classes/${userId}`, {},
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
  }, [userId]);

  // Saves the color theme after the user selects it
  async function saveTheme () {
    try {
      await API.post('color_set/',
        {
          light_theme: newTheme,
          highlight_colour: selectedColor
        },
        {
          headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
        },)
      // Force reloads the page to ensure the new colors are selected
      window.location.reload(true);
    }
    catch (error) {
      console.log(error)
    }
  }

  // Sets the color themes
  const theme = currTheme ? createTheme({ palette: { mode: 'light', }, }) : createTheme({ palette: { mode: 'dark', }, })
  const highlightColour = localStorage.getItem("highlight_colour");


  return (
    <ThemeProvider theme={theme}>
      <main style={{ maxHeight: 'calc(100vh - 110px)' }} className={currTheme ? 'light-mode' : 'dark-mode'}>
        <Modal
          role="alert"
          open={open}
          onClose={handleClose}
          sx={{
            color: currTheme ? '#000000' : '#FFFFFF', // Set text color based on currTheme
          }}
          closeAfterTransition
          slots={{ backdrop: Backdrop }}
          slotProps={{
            backdrop: {
              timeout: 500,
            },
          }}
        >
          <Fade in={open}>
            <Box sx={modalStyle}>
              <span>Light Mode:</span>
              <Switch style={{ color: highlightColour }} checked={newTheme} onChange={handleToggle} />
              <h3>Color Picker</h3>
              <SketchPicker color={selectedColor} onChange={handleColorChange} />
              <Button style={{ color: highlightColour, borderColor: highlightColour }} variant="text" onClick={() => saveTheme()}>Save</Button>
            </Box>
          </Fade>
        </Modal>
        <ProfileSideNav />
        <Grid container sx={{ marginLeft: '210px' }} spacing={2}>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Box sx={{ p: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginRight: '40px' }}>
              <><img src={userDetails['picture'] ? userDetails['picture'] : fallbackIMG} style={{ height: '200px', width: '200px' }} alt='Profile pic' /><br /></>
            </Box>
            <Box sx={{
              display: 'flex', justifyContent: 'center',
              flexDirection: 'column'
            }}>
              <Typography variant="h3">
                {userDetails['first_name']} {userDetails['last_name']}<br />
              </Typography>
              <b>Role</b>
              {userDetails['is_teacher'] && <>Teacher<br /></>}
              {!userDetails['is_teacher'] && <>Student<br /></>}
              <br />
              {userDetails['is_self'] &&
                <>
                  <Typography sx={{ fontWeight: 'bold' }} > Customise</Typography>
                  <ButtonGroup variant='outlined' orientation='vertical'>
                    <Button onClick={() => handleOpen()} style={{ color: highlightColour, borderColor: highlightColour }}>Select Colors</Button>
                    <PictureUpload />
                  </ButtonGroup>
                </>
              }
            </Box>
          </Grid>
          <Divider flexItem />
          <Grid item xs={12} container>
            <Grid item xs container direction="row" spacing={3}>
              <Grid item xs={6}>
                <Grid item xs container direction="column" spacing={2}>
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="body">
                        <Typography variant="h4">About Me </Typography>

                        <Typography fontWeight={'bold'}> Email: </Typography>
                        {userDetails['username']}<br></br> <br></br>
                        <Typography fontWeight={'bold'}> Join Date: </Typography>
                        {new Date(userDetails['join_date']).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{
                      marginTop: '50px',
                    }}>
                      <Typography variant="h4">
                        My Classes<br />
                      </Typography>
                      {classes.map((c) => (
                        <Card sx={{ width: '300px', textAlign: 'center', marginBottom: '20px' }}>
                          <CardContent>
                            <Typography variant="h6">
                              {c['name']}
                            </Typography>
                            <Typography variant="body1" component="p">
                              Teacher: {c['teacher_profile']['first_name']} {c['teacher_profile']['last_name']}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </Grid>

                </Grid>
              </Grid>
              <Grid item xs={6}>
                {isTeacher === false && <Typography variant="h4"> Badges</Typography>}
                <Grid container spacing={2}>
                  {badges.map((badge, index) => (
                    <Grid key={index} item xs={4}>
                      <Card key={index} sx={{ textAlign: 'center', height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CardContent>
                          <Typography variant="h6" component="h3">
                            {badge[0]}
                          </Typography>
                          <Box>
                            {badge[0] === 'Class Leader' ? <img src={classLeaderBadge} alt="Class Leader Badge" style={{ height: '80px', width: '80px' }} /> : null}
                            {badge[0] === 'Completionist' ? <img src={completionistBadge} alt="Completionist Badge" style={{ height: '80px', width: '80px' }} /> : null}
                            {badge[0] === 'Top 3' ? <img src={top3Badge} alt="Top 3 Badge" style={{ height: '80px', width: '80px' }} /> : null}
                            {badge[0] === 'Credit' ? <img src={creditBadge} alt="Credit Badge" style={{ height: '80px', width: '80px' }} /> : null}
                            {badge[0] === 'Distinction' ? <img src={distinctionBadge} alt="Distinction Badge" style={{ height: '80px', width: '80px' }} /> : null}
                            {badge[0] === 'High Distinction' ? <img src={highDistinctionBadge} alt="High Distinction Badge" style={{ height: '80px', width: '80px' }} /> : null}
                            {badge[0] === 'Question Asker' ? <img src={questionAskerBadge} alt="Question Asker Badge" style={{ height: '80px', width: '80px' }} /> : null}
                            {badge[0] === 'Question Answerer' ? <img src={questionAnswererBadge} alt="Question Answerer Badge" style={{ height: '80px', width: '80px' }} /> : null}
                            {badge[0] === 'Studious' ? <img src={studiousBadge} alt="Studious Badge" style={{ height: '80px', width: '80px' }} /> : null}
                          </Box>
                          <Typography variant="body1" component="p">
                            {badge[1]}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </main>
    </ThemeProvider >
  )
}

export default Profile