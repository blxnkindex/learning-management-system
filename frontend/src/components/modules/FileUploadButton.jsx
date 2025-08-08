import React, { useState } from 'react';
import { Typography, Button, Dialog, DialogContent, TextField, Box } from '@mui/material';
import API from '../../api';
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
import textFieldStyle from '../styles/textFieldStyle';

/*
FileUploadButton
  Button on the content page. Handles the logic of uploading content
*/
const FileUploadButton = ({ change, setChange }) => {
  const classId = useParams().classId;
  const [isOpen, setIsOpen] = useState(false);
  
  // Fields for the file
  const [selectedFile, setSelectedFile] = useState(null);
  const [resourceName, setResourceName] = useState('');

  // User's color choice
  const highlightColour = localStorage.getItem("highlight_colour");

  // Open and closing the dialog
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

  // Handles changing the resource name
  const handleResourceName = (event) => {
      const name = event.target.value;
      setResourceName(name);
  };

  // Uploads the file using FormData in the api call
  async function handleUpload () {
      try {
        const formData = new FormData();
        formData.append('description', resourceName);
        formData.append('in_class', classId);
        formData.append('file', selectedFile, selectedFile.name);
    
        await API.post('materials/', formData, {
          headers: {
              'X-CSRFToken': Cookies.get('csrftoken'),
              'Content-Type': 'multipart/form-data',
          },
        });
        setChange(!change);
        handleClose();
      } catch (error) {
        console.log(error);
      }

    // clear fields after upload
    setSelectedFile(null);
    setResourceName('');

    // close dialogue form
    handleClose();
  };

  return (
    <div>
      <Button style={{color: highlightColour, borderColor: highlightColour }} variant="outlined" color="primary" onClick={handleOpen}>
          + Upload File
      </Button>
      <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Typography variant='h6'>
            Upload Content
          </Typography>
          <input type="file" onChange={handleFileChange} />
          {selectedFile && <p>Selected file: {selectedFile.name}</p>}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: '20px',
            mb: '20px'
          }}>
            <Typography> Resource Name:</Typography>

            <TextField
                value={resourceName}
                onChange={handleResourceName}
                fullWidth
                sx={{...textFieldStyle}}
            />
          </Box>
          <Typography align="center">
            <Button sx={{color: highlightColour, borderColor: highlightColour }} disabled={resourceName === ''} variant="outlined" color="primary" onClick={handleUpload}>
              + Upload
            </Button>
          </Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileUploadButton;
