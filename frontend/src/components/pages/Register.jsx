import React from 'react';
import RegisterForm from '../modules/RegisterForm';
import getTheme from '../styles/getTheme';
import { ThemeProvider, createTheme } from '@mui/material';

/*
Register
  Uses the register form to create the page
*/
const Register = () => {
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
  
  const theme = lightMode ? createTheme({palette: {mode: 'light',},}) : createTheme({palette: {mode: 'dark',},})
  return (
    <ThemeProvider theme={theme}>
    <main style={{minHeight: 'calc(100vh - 90px)' , alignItems: 'center'}} className={lightMode ? 'light-mode' : 'dark-mode'}>
      <RegisterForm />
    </main>
    </ThemeProvider>
  )
}

export default Register;
