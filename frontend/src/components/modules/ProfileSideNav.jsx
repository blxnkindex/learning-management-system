import React from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api'
import Cookies from 'js-cookie';
import { Drawer, List, ListItemText, ListItemButton, Typography } from '@mui/material';

/*
ProfileSideNav
  Class navigation navigation bar
*/
const ProfileSideNav = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = React.useState([]);

  // Get the classes of the page
  React.useEffect(() => {
    (async () => {
      try {
        const response = await API.get('classes/', {},
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
  }, []);

  return (
    <Drawer
      variant="permanent"
      sx={{
        '& .MuiDrawer-paper': {
          marginTop: '100px',
          width: '200px'
      }}}
    >
      <Typography fontWeight='bold' sx={{ paddingLeft: '15px' }} > Class Navigation</Typography>

      <List>
        {classes.map((c) => (
          <ListItemButton onClick={() => navigate(`/class/${c.id}/`)}>
            <ListItemText primary={c.name} />
          </ListItemButton>
        ))}
      </List>
    </Drawer >
  );
};

export default ProfileSideNav;
