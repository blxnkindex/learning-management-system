import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { ThemeProvider } from '@emotion/react';
import getTheme from '../styles/getTheme';
import { createTheme } from '@mui/material';
import '../styles/colors.css';
import landingPagePic from '../badges/landingPage.png';
import LoginIcon from '@mui/icons-material/Login';
import HowToRegIcon from '@mui/icons-material/HowToReg';

/*
Landing Page
  landing home page
*/
const LandingPage = () => {
  const navigate = useNavigate();
  
  function goLogin () {
    navigate(`/login`)
  }
  function goRegister () {
    navigate(`/register`)
  }

  //Apply user colors
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

  const theme = lightMode ? createTheme({ palette: { mode: 'light', }, }) : createTheme({ palette: { mode: 'dark', }, })

  return (
    <ThemeProvider theme={theme}>
      <main style={{ minHeight: '100vh', alignItems: 'center' }} className={lightMode ? 'light-mode' : 'dark-mode'}>
        <Grid container spacing={2}>
          <Grid container direction="row" spacing={3}>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifySelf: 'center', alignItems: 'center', '& > *': { m: 1, } }}>
                <Typography variant="h2" component="h2" align="center" sx={{ fontSize: { xs: '2rem', sm: '2.1rem', md: '2.5rem' } }} >Whiteboard</Typography>
                <Box sx={{ fontWeight: "bold", borderRadius: "20px", color: "#FFFFFF", backgroundColor: "#0A66C2", padding: "5px", '& > *': { m: 1, }, }}>
                  <Typography variant="h2" component="h2" align="center" sx={{ fontSize: { xs: '2rem', sm: '2.1rem', md: '2.5rem' } }} >Collab</Typography>
                </Box>
              </Box>
              <Typography variant="h6"> Welcome to your learning hub </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img alt='Landing Page' src={landingPagePic} style={{ height: '90%', width: '80%' }} />
            </Grid>
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <ButtonGroup variant="text" orientation='vertical' >
              <Button onClick={() => goLogin()} sx={{ fontSize: '20pt' }}>Login <LoginIcon> </LoginIcon></Button>
              <Button onClick={() => goRegister()} sx={{ fontSize: '20pt' }}>Register <HowToRegIcon></HowToRegIcon></Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      </main>
    </ThemeProvider >
  )
}

export default LandingPage;
