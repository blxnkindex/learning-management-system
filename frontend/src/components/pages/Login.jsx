import React from 'react';
import LoginForm from '../modules/LoginForm';
import { ThemeProvider } from '@emotion/react';
import getTheme from '../styles/getTheme';
import { createTheme } from '@mui/material';

/*
Login
  Login page, uses the loginForm
*/
const Login = () => {
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
    <main style={{minHeight: 'calc(100vh - 90px)', alignItems: 'center'}} className={lightMode ? 'light-mode' : 'dark-mode'}>
      <LoginForm />
    </main>
    </ThemeProvider>
  )
}

export default Login;
