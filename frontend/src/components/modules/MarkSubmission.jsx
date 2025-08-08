import React, { useState } from 'react';
import { Typography, Button, Dialog, DialogContent, TextField } from '@mui/material';
import API from '../../api';
import Cookies from 'js-cookie';

/*
MarkSubmission
  Button on the quiz page, handles logic to mark a submission
*/
const MarkSubmission = ({ id, setShowSubmissions }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Mark field itself
  const [mark, setMark] = useState(0);

  // User's color preference
  const highlightColour = localStorage.getItem("highlight_colour");

  // Handle opening the dialog
  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Handles marking the submission
  async function handleMark () {
    try {
      await API.post(`mark/${id}/`,
      {
        marked: true,
        points: mark
      },
      {
        headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
      },
    )
    handleClose()
    setShowSubmissions(false);
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <>
      <Button style={{color: highlightColour, borderColor: highlightColour }} variant="outlined" color="primary" onClick={handleOpen}>
        + Mark Submission
      </Button>
      <Dialog open={isOpen} onClose={handleClose} maxWidth="md" >
        <DialogContent>
          <Typography variant='h5'>
            Mark Assignment Submission
          </Typography>
          <Typography align="center">
            <span>Mark out of 1000?</span><br />
            <TextField required id="Points" label="Points" type="number" onChange={(e) => { setMark(e.target.value) }} /><br />
            <Button sx={{
                color: highlightColour,
                borderColor: highlightColour,
                marginTop: '10px' }} variant="outlined" onClick={handleMark}
                disabled={mark < 0 || mark > 1000 || mark === ''}
            >
                Submit mark
            </Button>
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MarkSubmission;
