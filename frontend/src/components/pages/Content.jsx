import React from 'react';
import { Typography, Box, TableContainer, Table, TableHead, TableRow, TableBody, TableCell, createTheme, ThemeProvider } from '@mui/material';
import { useParams } from 'react-router-dom';
import FileUploadButton from '../modules/FileUploadButton';
import getClassFiles from '../modules/getClassFiles';
import Button from '@mui/material/Button';
import ClassSideNav from '../modules/ClassSideNav';
import getTheme from '../styles/getTheme';

/*
Content
  Class page for content
*/
const Content = () => {
    const classId = useParams().classId;
    const [files, setFiles] = React.useState([])
    const [change, setChange] = React.useState(false);

    // Gets the class files
    React.useEffect(() => {
      (async () => {
        try {
          const classFiles = await getClassFiles(classId)
          setFiles(classFiles);
        } catch (error) {
          console.log(error)
        }
      })();
    }, [change, classId]);

    // Allows for downloading of the files
    async function clickDownload (fileName) {
      try {
        const downloadUrl = `http://localhost:8000/materials/${fileName}`;
        window.open(downloadUrl);
      } catch (error) {
        console.log(error);
      }
    };

    //Apply user colors
    const [lightMode, setLightMode] = React.useState(localStorage.getItem("light_theme") === 'true');
    const theme = lightMode ? createTheme({palette: {mode: 'light',},}) : createTheme({palette: {mode: 'dark',},})
    const highlightColour = localStorage.getItem("highlight_colour");
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
      <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          marginLeft: '200px',
          padding: '10px'
      }}>
          <Typography variant="h5">
              Class Content
          </Typography>

          <FileUploadButton change={change} setChange={setChange}> Upload</FileUploadButton>

      </Box>
      <Box sx={{ marginLeft: '200px', padding: '10px' }}>
        <TableContainer>
          <Table>
            <TableHead> 
              <TableRow>
                <TableCell>Resource Name</TableCell>
                <TableCell>File Name</TableCell>
                <TableCell>Date Uploaded</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {files.map((file, index) => (
                <TableRow key={index}>
                  <TableCell>{file.description}</TableCell>
                  <TableCell>{file.file}</TableCell>
                  <TableCell>{new Date(file.created_date).toLocaleString()}</TableCell>
                  <TableCell><Button style={{color: highlightColour, borderColor: highlightColour }} variant="text" onClick={() => clickDownload(file.file)}>Download</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div >
    </main>
    </ThemeProvider>
  )
}

export default Content