import React, { useState } from 'react';
import { Typography, Button, Dialog, DialogContent, TextField, Switch, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import API from '../../api';
import Cookies from 'js-cookie';
import textFieldStyle from '../styles/textFieldStyle';

/*
AddQuestionButton
  Button on the quiz page. Handles the logic of adding a question
*/
const AddQuestionButton = ({ id, setUpdate, update }) => {
  const [isOpen, setIsOpen] = useState(false);

  // New Question Fields for the form
  const [text, setText] = React.useState('');
  const [mcq, setMcq] = React.useState(true);
  const [optionA, setOptionA] = React.useState("");
  const [optionB, setOptionB] = React.useState("");
  const [optionC, setOptionC] = React.useState("");
  const [optionD, setOptionD] = React.useState("");
  const [solution, setSolution] = React.useState('');

  // Get the user's selected highlight color
  const highlightColour = localStorage.getItem("highlight_colour");

  // Handle opening and closing the dialog
  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // API call to create a question
  // based on the fields in the textfield
  async function makeQuestion () {
    try {
      // If the question is not multiple choice
      // Set the options to default fields (api endpoint won't take empty for a required field)
      if (mcq === false) {
        setOptionA("N/A");
        setOptionB("N/A");
        setOptionC("N/A");
        setOptionD("N/A");
      }
      // Call the endpoint with the necessary fields
      await API.post('question_create/',
      {
        "quiz_id": id,
        "text": text,
        "multiple_choice": mcq,
        "option_a": optionA,
        "option_b": optionB,
        "option_c": optionC,
        "option_d": optionD,
        "solution": solution
      },
      {
        headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
      },
    )
      handleClose();
      setText('');
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setSolution('');

      setUpdate(!update);
    } catch (error) {
      console.log(error)
    }
  };

    return (
      <div>
        {/* The button that Shows */}
        <Button fullWidth style={{color: highlightColour, borderColor: highlightColour }} variant="outlined" color="primary" onClick={handleOpen}>
          + Add a Question
        </Button>
        {/* Dialog that opens when the button is opened */}
        <Dialog open={isOpen} onClose={handleClose} maxWidth="md" >
          <DialogContent>
            <Typography variant='h6'>
              Question Details
            </Typography>
            <span>Multiple Choice?</span>
            <Switch style={{ color: highlightColour }} checked={mcq} onChange={(e) => setMcq(e.target.checked)} />
            {mcq === true &&
            <div style={{width: "500px"}}>
            <Typography align="center">
              <TextField sx={{margin: "5px", ...textFieldStyle}} required fullWidth label="Question" value={text} onChange={(e) => {setText(e.target.value)}} /> <br />
              <TextField sx={{margin: "5px", ...textFieldStyle}} size='small' required fullWidth label="Option A" value={optionA} onChange={(e) => {setOptionA(e.target.value)}} /> <br />
              <TextField sx={{margin: "5px", ...textFieldStyle}} size='small' required fullWidth label="Option B" value={optionB} onChange={(e) => {setOptionB(e.target.value)}} /> <br />
              <TextField sx={{margin: "5px", ...textFieldStyle}} size='small' required fullWidth label="Option C" value={optionC} onChange={(e) => {setOptionC(e.target.value)}} /> <br />
              <TextField sx={{margin: "5px", ...textFieldStyle}} size='small' required fullWidth label="Option D" value={optionD} onChange={(e) => {setOptionD(e.target.value)}} /> <br />
              <FormControl sx={{ width: '300px', margin: '10px' }}>
              <InputLabel id="userTypeSelect" required>Question Answer</InputLabel>
              <Select value={solution} label="Question Answer" onChange={(e) => { setSolution(e.target.value) }}>
                <MenuItem value={"A"}>A</MenuItem>
                <MenuItem value={"B"}>B</MenuItem>
                <MenuItem value={"C"}>C</MenuItem>
                <MenuItem value={"D"}>D</MenuItem>
              </Select>
              </FormControl>
            </Typography>
            </div>
            }
            {mcq === false &&
              <>
              <TextField sx={{...textFieldStyle}} required fullWidth label="Question" value={text} onChange={(e) => {setText(e.target.value)}} /> <br />
              <span>Keywords the student MUST have in their answer.</span>
              <TextField sx={{...textFieldStyle}} required fullWidth label="Answer" value={solution} onChange={(e) => {setSolution(e.target.value)}} /> <br />
              </>
            }
            <Typography align="center">
              <Button style={{color: highlightColour, borderColor: highlightColour, marginTop: '10px' }} variant="outlined" color="primary" onClick={makeQuestion}>
                  Create Question
              </Button>
            </Typography>
          </DialogContent>
        </Dialog>
      </div>
    );
};

export default AddQuestionButton;
