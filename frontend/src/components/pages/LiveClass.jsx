import React from 'react';
import { Typography, Grid, Box, Divider, TextField, IconButton, Card, CardContent, ThemeProvider, createTheme } from '@mui/material';
import { useParams } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import API from '../../api';
import Cookies from 'js-cookie';
import polling from '../modules/polling';
import ClassSideNav from '../modules/ClassSideNav';
import getTheme from '../styles/getTheme';
import textFieldStyle from '../styles/textFieldStyle';

/*
LiveClass
  Page for the live class
*/
const LiveClass = () => {
  const classId = useParams().classId;
  const [msgs, setMsgs] = React.useState([])
  const [message, setMessage] = React.useState();
  const [link, setLink] = React.useState('')

  // Gets the link of the class
  React.useEffect(() => {
    (async () => {
      try {
        const response = await API.get(`classes/${classId}`, {},
        {
          headers:{'X-CSRFToken':Cookies.get('csrftoken')},
        },
        )
        const data = await response.data;
        setLink(data['live_link']);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [classId]);

  // Polls the messages each second to update them
  polling(async () => {
    try {
      const response = await API.get(`messages_get/${classId}/`,
        {}
      )
      setMsgs(await response.data);
    } catch (error) {
      console.log(error);
    }
  }, 1000)

  // Sends the messages
  async function sendMessage () {
    try {
      await API.post('messages_send/',
        {
          "class_id": classId,
          "message": message,
        },
        {
          headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
        },
      )
      setMessage('')
    } catch (error) {
      console.log(error)
    }
  }
  
  // Apply user colors
  const [lightMode, setLightMode] = React.useState(localStorage.getItem("light_theme") === 'true');
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
  

  return (
    <ThemeProvider theme={theme}>
    <main style={{alignItems: 'flex-start'}} className={lightMode ? 'light-mode' : 'dark-mode'}>
    <div style={{width: '100%'}} className={lightMode ? 'light-mode' : 'dark-mode'}>
      <ClassSideNav />

      <Box alignItems={'flex-start'} component='main' sx={{ p: 3, marginLeft: '210px', height: '80vh'}}>
          <iframe
          src={link}
          title="YouTube video player"
          style={{ width: '100%', height: '90%' }}
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
        <Grid container justifyContent={"flex-end"}
          sx={{ height: '90%', width: '20vw' }
          } >

            <Box sx={{
              height: '90%', width: '100%', backgroundColor: '#d3d3d3', overflowY: 'auto'
            }}>
              {msgs.map((m) => (
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} sx={{marginBottom: '5px'}}>
                  <Card>
                    <CardContent>
                      <Typography variant="body">
                        <b>{m.user}</b> at {new Date(m.sent_time).toLocaleTimeString()}<br />
                        {m.message}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          
          </Box>
          <Divider />
            <Box sx={{
              display:'flex',
              alignItems:'center',
              justifyContent: 'flex-start'
            }}>
            <TextField label="Type Something" value={message} sx={{width: '100%', ...textFieldStyle}} onChange={(e) => { setMessage(e.target.value) }} />
            <IconButton onClick={() => sendMessage()}>
              <SendIcon />
            </IconButton>
          </Box>
          
        </Grid>
      </Box >

    </div >
    </main >
    </ThemeProvider>
  );

}

export default LiveClass