import React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../api'
import getUserType from './getUserType';
import Cookies from 'js-cookie';

import { ThemeProvider, Typography, createTheme } from '@mui/material';
import getTheme from '../styles/getTheme';

/*
Nav
  Top navigation bar, shows on all pages and 
  its contents change based on the users log in state
*/
const Nav = () => {
  const navigate = useNavigate();
  const sessionid = Cookies.get('sessionid');
  const location = useLocation();

  const fallbackIMG = "https://static.vecteezy.com/system/resources/thumbnails/002/534/006/small/social-media-chatting-online-blank-profile-picture-head-and-body-icon-people-standing-icon-grey-background-free-vector.jpg"

  async function logout () {
    try {
      await API.post('logout/',
        {},
        {
          headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
        },
      )
      navigate('/');
    } catch (error) {
      console.log(error)
    }
  }

  async function goDashboard () {
    const dest = await getUserType() ? "/teacherdash" : "/studentdash";
    navigate(dest)
  }

  const [picture, setPicture] = React.useState(null)
  const [userId, setUserId] = React.useState(null)
  React.useEffect(() => {
    (async () => {
      if (Cookies.get('sessionid')) {
          const response = await API.get(`user/`, 
          {
            headers: {'X-CSRFToken':Cookies.get('csrftoken')},
          },
        )
        setPicture(await response.data['picture']);
        setUserId(await response.data['id']);
      }
    })();
  },);

  // Gets/Sets the users color theme
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
  const theme = lightMode ? createTheme({palette: {mode: 'light',},}) : createTheme({palette: {mode: 'dark',},})
  const highlightColour = localStorage.getItem("highlight_colour");


  return (
    <ThemeProvider theme={theme}>
    <header className={lightMode ? 'light-mode' : 'dark-mode'}>
      <nav>
        {/* Content for if the user is logged in */}
        {sessionid && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', '& > *': { m: 1, }, padding: '10px' }}>
              <span onClick={() => goDashboard()} style={{ cursor: 'pointer' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', '& > *': { m: 1, }, }}>
                  <Typography variant="h4" component="h4" align="center">Whiteboard</Typography>
                  <Box sx={{ fontWeight: "bold", borderRadius: "15px", color: "#FFFFFF", backgroundColor: highlightColour, '& > *': { m: 1, }, }}>
                    <Typography variant="h4" component="h4" align="center">Collab</Typography> </Box> </Box></span>
              <Box sx={{display: 'flex',  flexDirection: 'row' }}>
                <img
                  src={picture ? picture : fallbackIMG}
                  style={{
                    height: '60px',
                    width: '60px',
                    marginRight: '20px',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: highlightColour,
                  }}
                  onClick={() => navigate(`/user/${userId}`)}
                  alt="Profile pic"
                /><br />
                <Button style={{color: highlightColour, borderColor: highlightColour }} variant="outlined" name='logout' onClick={() => logout()}>Logout</Button>
              </Box>
            </Box>
          </>
        )}
        {/* Content if the user is not logged in and not on the landing page */}
        {!sessionid && location.pathname !== '/' && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', '& > *': { m: 1, }, }}>
              <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', right: 0, alignItems: 'center', '& > *': { m: 1, }, }}>
                  <Typography variant="h4" component="h4" align="center">Whiteboard</Typography>
                  <Box sx={{ fontWeight: "bold", borderRadius: "15px", color: "#FFFFFF", backgroundColor: highlightColour, '& > *': { m: 1, }, }}>
                    <Typography variant="h4" component="h4" align="center">Collab</Typography> </Box> </Box></span>
            </Box>
          </>
        )}
        <>
        </>
      </nav>
    </header>
    </ThemeProvider>
  );
};

export default Nav;
