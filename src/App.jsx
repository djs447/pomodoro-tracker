import { useState, useEffect, useRef } from 'react'
import { useMediaQuery } from 'react-responsive'
import * as d3 from "d3";
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faArrowUp, faPlay, faPause, faArrowsRotate} from '@fortawesome/free-solid-svg-icons'
import CircularProgress from '@mui/material/CircularProgress'
import Switch from '@mui/material/Switch'
import {faArrowDown} from '@fortawesome/free-solid-svg-icons'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

function App() {
  const [workTimer, setWorkTimer] = useState(25);
  const [restTimer, setRestTimer] = useState(5);
  const [showTimeAlert, setShowTimeAlert] = useState(false);
  const [showActiveAlert, setShowActiveAlert] = useState(false);
  const [countdownActive, setCountdownActive] = useState(false);
  const [workExpired, setWorkExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(new Date(0,0,0,0,workTimer,0));
  const [endTime, setEndTime] = useState(null);
  const [dashOffset, setDashOffset] = useState(0);
  const [restOffset, setRestOffset] = useState(0);
  const [isDark, setIsDark] = useState(true);
  const frameRef = useRef(null);

  useEffect(()=>{
    setDashOffset(0);
    setRestOffset(0);
  },[workExpired])

  useEffect(()=>{
    setTimeLeft(new Date(0,0,0,0,workTimer,0));
  },[workTimer]);

  useEffect(()=>{
    if(isDark){
      document.body.classList.add('dark');
    } else{
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden || !countdownActive) return;
  
      const now = new Date();
      setTimeLeft(new Date(endTime - now));
    };
  
    document.addEventListener("visibilitychange", handleVisibilityChange);
  
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [countdownActive, endTime]);

  useEffect(() => {

    const updateTimer = () =>{
      if (!countdownActive || !endTime){
        return;
      }

      const now = new Date();
      const remainingTime = endTime - now;

      if (remainingTime <= 0){
        if(!workExpired){
          setWorkExpired(true);
          setEndTime(new Date(now.getTime() + restTimer*60000 + remainingTime));
        }
        else{
          setWorkExpired(false);
          setEndTime(new Date(now.getTime() + workTimer * 60000 + remainingTime));
        }
      }
      else{
        setTimeLeft(new Date(remainingTime));
        frameRef.current = requestAnimationFrame(updateTimer);
      }

      if(workExpired){
        setRestOffset(calculateRestOffset(timeLeft));
      }
      else{
        setDashOffset(calculateDashOffset(timeLeft));
      }

    };

    if(countdownActive){
      frameRef.current = requestAnimationFrame(updateTimer);
    }
    else{
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    return () => cancelAnimationFrame(frameRef.current);

  },[countdownActive, endTime, workExpired, timeLeft]);

  function toggleCountdown(){

    if(countdownActive){
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      setCountdownActive(false);

      const now = new Date();
      const elapsedTime = now - new Date(endTime);
      setEndTime(new Date(endTime - elapsedTime));
    }
    else{
      setTimeout(()=> {
          const now = new Date();
          const newEndTime = new Date(now.getTime() + timeLeft.getMinutes() * 60000 + timeLeft.getSeconds()*1000);

          setEndTime(newEndTime);
          setCountdownActive(true);
      }, 200);
    }
  }

  function incrementWorkTimer(){
    if(workTimer<60 && !countdownActive){
      resetClock();
      return setWorkTimer(workTimer+1);
    }
    else if(countdownActive){
      invalidAction();
      return;
    }
    else{
      invalidTime();
      return setWorkTimer(60);
    
    }
  }

  function decrementWorkTimer(){
    if(workTimer>1 && !countdownActive){
      resetClock();
      return setWorkTimer(workTimer-1);
    }
    else if(countdownActive){
      invalidAction();
      return;
    }
    else{
      invalidTime();
      return setWorkTimer(1);
    
    }
  }

  function incrementRestTimer(){
    if(restTimer<60 && !countdownActive){
      resetClock();
      return setRestTimer(restTimer+1);
    }
    else if(countdownActive){
      invalidAction();
      return;
    }
    else{
      invalidTime();
      return setRestTimer(60);
    }
  }

  function decrementRestTimer(){
    if(restTimer>1 && !countdownActive){
      resetClock();
      return setRestTimer(restTimer-1);
    }
    else if(countdownActive){
      invalidAction();
      return;
    }
    else{
      invalidTime();
      return setRestTimer(1);
    }
  }

  function invalidTime(){
    setShowTimeAlert(true);
    setTimeout(()=>{
      setShowTimeAlert(false);
    },3000);
  }

  function invalidAction(){
    setShowActiveAlert(true);
    setTimeout(()=>{
      setShowActiveAlert(false);
    },3000);
  }

  function calculateDashOffset(p){
    const minutes = p.getMinutes();
    const seconds = p.getSeconds();
    const offset = (((minutes*60+seconds) * 100) / (workTimer*60));
    return offset;
  }

  function calculateRestOffset(p){
    const minutes = p.getMinutes();
    const seconds = p.getSeconds();
    const offset = (((minutes*60+seconds) * 100) / (restTimer*60));
    return offset;
  }

  function resetClock(){
    cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    setCountdownActive(false);
    setTimeLeft(new Date(0,0,0,0,workTimer,0));
    setWorkExpired(false);
    setDashOffset(0);
    setEndTime(null);
  }

  const systemPrefersDark = useMediaQuery(
    {
      query: "(prefers-color-scheme: dark)",
    },
    undefined,
    (isSystemDark) => setIsDark(isSystemDark)
  );

  return (
    <>
      <div className="day-night-toggle">
        <h4><Badge bg="secondary">Dark Mode Toggle</Badge></h4>
        <Switch defaultChecked onChange={({ target }) => setIsDark(target.checked)} />
      </div>
      <div className="container">
        <h2 className="title-text"><Badge bg={workExpired ? "success" : "primary"}>Pomodoro Clock</Badge></h2>
        <h2 className="title-text"><Badge bg={workExpired ? "success" : "primary"}>{workExpired ? "WORK" : "REST"}</Badge></h2>
        <div className="timer-wrapper">
          <div className="timer">
              <CircularProgress className="prog-bar" color={workExpired ? "success" : "primary"} variant="determinate" size="400px" value={(workExpired ? Math.round(restOffset) : Math.round(dashOffset)) || 100} />
              <span className={`middle-text${isDark ? " dark" : ""}`}>{timeLeft.getMinutes()}m {timeLeft.getSeconds()}s</span>
          </div>
          <div className="timer-controls">
            <Button className="controls" onClick={toggleCountdown} variant={workExpired ? "success" : "primary"}><FontAwesomeIcon icon={countdownActive ? faPause : faPlay} /></Button>
            <Button className="controls" onClick={resetClock} variant={workExpired ? "success" : "primary"}><FontAwesomeIcon icon={faArrowsRotate} /></Button>
          </div>
          <div className="timer-settings">
            <div className="minutes">
              <h4><Badge bg={workExpired ? "success" : "primary"}>Working Minutes</Badge></h4>
              <button onClick={incrementWorkTimer}><FontAwesomeIcon icon={faArrowUp}/></button> 
              <span className={`setTime${isDark ? " dark" : ""}`}>{workTimer}</span>
              <button onClick={decrementWorkTimer}><FontAwesomeIcon icon={faArrowDown}/></button>
            </div>
            <div className="seconds">
              <h4><Badge bg={workExpired ? "success" : "primary"}>Rest Minutes</Badge></h4>
              <button onClick={incrementRestTimer}><FontAwesomeIcon icon={faArrowUp}/></button> 
              <span className={`setTime${isDark ? " dark" : ""}`}>{restTimer}</span>
              <button onClick={decrementRestTimer}><FontAwesomeIcon icon={faArrowDown}/></button>
            </div>
          </div>
          <div className={`alerts${showTimeAlert || showActiveAlert ? " show":""}`}>
              {showTimeAlert ? <TimeAlert /> : ""}
              {showActiveAlert ? <ActiveAlert /> : ""}
          </div>
        </div>
      </div>
    </>
  )
}

function TimeAlert(){
  return (
    <>
      <Alert>
        This application only supports time ranges between 1 and 60 minutes.
      </Alert>
    </>
  )

}

function ActiveAlert(){
  return (
    <>
      <Alert>
        Please reset the timer before attempting to change this value.
      </Alert>
    </>
  )
}

export default App
