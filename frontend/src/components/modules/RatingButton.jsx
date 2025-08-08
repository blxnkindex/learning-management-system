import React, { useState } from 'react';
import { Typography, Button, Dialog, DialogContent, ListItemButton, ListItemText, TextField } from '@mui/material';
import API from '../../api';
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
import textFieldStyle from '../styles/textFieldStyle';

/*
RatingButton
  Button that shows on the class navigation bar, handles the logic of adding a rating to a class
*/
const RatingButton = () => {
  const classId = useParams().classId;
  const [rating, setRating] = useState();
  const [isTeacher, setIsTeacher] = useState(null);
  const [userRated, setUserRated] = useState(false);
  const [update, setUpdate] = useState(false);

  const [newRating, setNewRating] = useState();
  
  // Gets the current ratings and calculates the average
  React.useEffect(() => {
    (async () => {
      try {
        const response = await API.get(`rating_get/${classId}`,
          {
            headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
          },)
        const data = await response.data;
        const sumRatings = data.reduce((total, item) => total + item.rating, 0);
        const averageRating = data.length > 0 ? parseFloat((sumRatings / data.length).toFixed(2)) : -1;
        setRating(averageRating);
        
        const userDetails = await API.get(`user/`, 
        {
          headers: {'X-CSRFToken':Cookies.get('csrftoken')},
        },)
        setIsTeacher(userDetails.data['is_teacher'])
        setUserRated(data.some((item) => item.user_id === userDetails.data['id']));
        setUpdate(false);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [classId, update]);

  // Adds a rating
  async function makeRating () {
      try {
        await API.post('rating_create/',
          {
            "class_id" : classId,
            "rating"  : newRating
          },
          {
            headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
          },
        )
        setNewRating();
        setUpdate(!update);
      } catch (error) {
        console.log(error)
      }
    }

  const highlightColour = localStorage.getItem("highlight_colour");
  
  // Open and close the dialog
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => {
      setIsOpen(true);
  };

  const handleClose = () => {
      setIsOpen(false);
  };
  
  return (
    <div>
      <ListItemButton onClick={handleOpen}>
        <ListItemText primary="Rate this Class" />
      </ListItemButton>
      <Dialog open={isOpen} onClose={handleClose} maxWidth="md" >
        <DialogContent>
          <Typography variant='h6' align='center'>
            Class Rating: {rating === -1 ? "Currently no ratings" : rating + "/5"}
          </Typography>

          <Typography align="center">
            {userRated === false && !isTeacher &&
              <>
              Add a new rating! (0-5)
              <TextField sx={{...textFieldStyle}}
                size='small' 
                fullWidth label="Rating" 
                value={newRating} 
                onChange={(e) => {setNewRating(e.target.value)}}
                type="number"
                min="0"
                max="5"
                />
                <Button sx={{color: highlightColour, borderColor: highlightColour, marginTop: '10px' }} variant="outlined"
                color="primary"
                disabled={newRating < 0 || newRating > 5}
                onClick={() => makeRating()}>
                    + Add Rating!
                </Button>
              </>
            }
            {userRated === true && !isTeacher &&
              <>Thanks for adding a rating!</>
            }
            {isTeacher &&
              <>
              Teachers can not rate their classes
              </>
            }
          </Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RatingButton;
