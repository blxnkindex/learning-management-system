import React, { useState } from 'react';
import { Typography, Button, Dialog, DialogContent } from '@mui/material';
import API from '../../api';
import Cookies from 'js-cookie';

/*
Picture
  Button on the profile page. Handles the logic of uploading a profile picture
*/
const PictureUpload = ({ change, setChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Picture field
  const [selectedFile, setSelectedFile] = useState(null);

  // User's highlight color
  const highlightColour = localStorage.getItem("highlight_colour");

  // Opening and closing the dialog
  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Handle changing event
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  async function handleUpload () {
    try {
      const formData = new FormData();
      formData.append('profile_picture', selectedFile, selectedFile.name);
  
      await API.post('profile_picture/', formData, {
          headers: {
              'X-CSRFToken': Cookies.get('csrftoken'),
              'Content-Type': 'multipart/form-data',
          },
      });
      setChange(!change)
    } catch (error) {
      console.log(error)
    }

    // clear fields after upload
    setSelectedFile(null);

    // close dialogue form
    handleClose();
    
    // Reload the page such that the new picture shows
    window.location.reload()
  };

  return (
    <div>
      <Button fullWidth style={{color: highlightColour, borderColor: highlightColour }} onClick={handleOpen}>
        + Profile Picture
      </Button>
      <Dialog open={isOpen} onClose={handleClose} maxWidth="md" >
        <DialogContent>
            <Typography variant='h6'>
              Upload Profile Picture
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

export default PictureUpload;
