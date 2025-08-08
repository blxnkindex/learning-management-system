// Style for textfields to match user color selection
const highlightColour = localStorage.getItem("highlight_colour");
const textFieldStyle = {
  '& .MuiInputLabel-root.Mui-focused': {
    color: highlightColour,
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: highlightColour,
  }
};

export default textFieldStyle;
