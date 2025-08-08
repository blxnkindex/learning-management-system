import React from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api'
import getUserType from './getUserType';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

/*
RegisterForm
  Contains the logic and elements for the login form
*/
const RegisterForm = () => {
  // RegisterForm Fields
  const [email, setEmail] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [confirmPass, setConfirmPass] = React.useState('');
  const [fname, setFname] = React.useState('');
  const [lname, setLname] = React.useState('');
  const [isTeacher, setIsTeacher] = React.useState(true);
  const navigate = useNavigate();

  // Error checking fields
  const [invalidPass, setInvalidPass] = React.useState(false);
  const [invalidEmail, setInvalidEmail] = React.useState(false);
  const [disabled, setDisabled] = React.useState(true);
  const [emailExists, setEmailExists] = React.useState(false);

  // Go to the login pages
  function goLogin () {
    navigate('/login/')
  }

  // Register with the fields and navigate
  // to the respective dashboard
  async function register () {
    try {
      await API.post('register/',
        {
          username: email,
          password: pass,
          first_name: fname,
          last_name: lname,
          is_teacher: isTeacher
        }
      )
      const dest = await getUserType() ? "/teacherdash" : "/studentdash";
      navigate(dest)
    } catch (error) {
      console.log(error)
      setEmailExists(true);
    }
  }

  // Check if the email is of a valid email structure
  function checkEmail () {
    const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/g;
    setInvalidEmail(!email.match(validRegex));
    return (email.match(validRegex));
  }

  // Check if the passwords are the same
  function checkPass () {
    if (pass !== confirmPass) {
      setInvalidPass('Passwords are not matching!')
    } else {
      setInvalidPass('');
    }
    return (pass === confirmPass);
  }

  // Check the values
  const render = React.useCallback(() => {
    const validEmail = checkEmail();
    const validPass = checkPass();
    setDisabled(!(validEmail && validPass));
  }, [email, pass, confirmPass]);

  const firstUpdate = React.useRef(true);
  React.useLayoutEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    const timeOutId = setTimeout(() => render(), 100);
    return () => clearTimeout(timeOutId);
  }, [email, pass, confirmPass, render]);

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
        {email && invalidEmail && (<span style={{ fontSize: '12pt', color: 'red' }}>{'Email is not valid!'}<br /></span>)}
        <TextField required id="firstname" label="First Name" sx={{ width: '500px', margin: '10px' }} onChange={(e) => { setFname(e.target.value) }} />
        <TextField required id="lastname" label="Last Name" sx={{ width: '500px', margin: '10px' }} onChange={(e) => { setLname(e.target.value) }} />
        <TextField required id="password" label="Password" type="password" sx={{ width: '500px', margin: '10px' }} onChange={(e) => { setPass(e.target.value) }} />
        <TextField required id="confirmpw" label="Confirm Password" type="password" sx={{ width: '500px', margin: '10px' }} onChange={(e) => { setConfirmPass(e.target.value) }} />
        {invalidPass && (<span style={{ fontSize: '12pt', color: 'red' }}>{'Passwords do not match!'}<br /></span>)}
        <FormControl sx={{ width: '500px', margin: '10px' }}>
          <InputLabel id="userTypeSelect" required>User Type</InputLabel>
          <Select value={isTeacher} label="User Type" onChange={(e) => { setIsTeacher(e.target.value) }}>
            <MenuItem value={true}>Teacher</MenuItem>
            <MenuItem value={false}>Student</MenuItem>
          </Select>
        </FormControl>
        {emailExists && pass && (<span style={{ fontSize: '12pt', color: 'red' }}>{'An account using that email already exists'}<br /></span>)}
        <ButtonGroup variant="text" orientation='vertical'>
          <Button name='registerBtn' onClick={() => register()} disabled={disabled}>Sign Up</Button>
          <Button name='loginBtn' onClick={() => goLogin()}>Already a user? Sign in!</Button>
        </ButtonGroup>
      </Box>
    </>
  )
}

export default RegisterForm;
