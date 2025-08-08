import React, { useState } from 'react';
import { Typography, Button, Dialog, DialogContent } from '@mui/material';
import API from '../../api';
import Cookies from 'js-cookie';

/*
SubmitButton
  Button on the assignment page. Handles the logic of submitting an assignment
*/
const SubmitButton = ({ id, setChange, change }) => {
  // Fields for the selected file
  const [selectedFile, setSelectedFile] = useState(null);

  // Users highlight Color
  const highlightColour = localStorage.getItem("highlight_colour");

  // Handles opening and closing the dialog
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => {
      setIsOpen(true);
  };

  const handleClose = () => {
      setIsOpen(false);
  };

  // Handles changing the file
  const handleFileChange = (event) => {
      const file = event.target.files[0];
      setSelectedFile(file);
  };
  
  // Handles uploading the file with the api call
  async function handleUpload () {
    try {
      const formData = new FormData();
      formData.append('assignment_id', id);
      formData.append('file', selectedFile);
  
      await API.post('submission_create/', formData, {
        headers: {
          'X-CSRFToken': Cookies.get('csrftoken'),
          'Content-Type': 'multipart/form-data',
        },
      });
      handleClose();
      setChange(!change);
    } catch (error) {
      console.log(error)
    }
    setSelectedFile(null);
  };

  return (
    <div>
      <Button fullWidth style={{color: highlightColour, borderColor: highlightColour }} variant="outlined" color="primary" onClick={handleOpen}>
        + Make Submission
      </Button>
      <Dialog open={isOpen} onClose={handleClose} maxWidth="md" >
        <DialogContent>
          <Typography variant='h6'>
            Upload File
          </Typography>
          <input type="file" onChange={handleFileChange} />
          {selectedFile && <p>Selected file: {selectedFile.name}</p>}
          <Typography align="center">
            <Button style={{color: highlightColour, borderColor: highlightColour, marginTop: '10px' }} variant="outlined" color="primary" onClick={handleUpload}>
              Upload
            </Button>
          </Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubmitButton;
