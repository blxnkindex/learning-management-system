import React from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api'
import getUserType from './getUserType';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import LoginIcon from '@mui/icons-material/Login';

/*
LoginForm
  Contains the logic and elements for the login form
*/
const LoginForm = () => {
  const navigate = useNavigate();

  // Form fields
  const [email, setEmail] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [showError, setShowError] = React.useState('');

  // Logs in
  async function login () {
    try {
      await API.post('login/',
        {
          username: email,
          password: pass,
        },
      )
      const dest = await getUserType() ? "/teacherdash" : "/studentdash";
      navigate(dest)
    } catch (error) {
      setShowError(true);
    }
  }

  // Goes to the register page
  function goRegister () {
    navigate('/register')
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          justifySelf: 'center',
          alignItems: 'center',
          '& > *': {
            m: 1,
          },
        }}
      >
        <TextField required id="email" label="Email" sx={{ width: '500px', margin: '10px' }} onChange={(e) => { setEmail(e.target.value) }} />
        <TextField required id="password" label="Password" type="password" sx={{ width: '500px', margin: '10px' }} onChange={(e) => { setPass(e.target.value) }} />
        {showError && (<span style={{ fontSize: '12pt', color: 'red' }}>{'Username or password is incorrect'}<br /></span>)}
        <ButtonGroup variant="text" orientation='vertical'>
          <Button name='registerBtn' onClick={() => login()}>Sign In <LoginIcon> </LoginIcon></Button>
          <Button name='loginBtn' onClick={() => goRegister()}>New user? Sign Up!</Button>
        </ButtonGroup>
      </Box>
    </>
  )
}

export default LoginForm;
