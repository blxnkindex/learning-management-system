import React from "react"; 

/*
Polling
  Allows for polling, used to update chat messages on live classes every page
*/
function Polling (callback, delay) {
  const callbackSave = React.useRef();
  React.useEffect(() => {
    callbackSave.current = callback;
  }, [callback]);

  React.useEffect(() => {
    function tick () {
      callbackSave.current();
    }
    if (delay != null) {
      const intervalId = setInterval(tick, delay);
      return () => clearInterval(intervalId);
    }
  }, [delay]);
}

export default Polling