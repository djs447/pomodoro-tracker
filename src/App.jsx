import { useState, useEffect } from 'react'
import * as d3 from "d3";
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faArrowUp, faPlay, faPause, faArrowsRotate} from '@fortawesome/free-solid-svg-icons'
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
  const [timeLeft, setTimeLeft] = useState([workTimer,0]);
  const [dashOffset, setDashOffset] = useState(0);
  const [restOffset, setRestOffset] = useState(0);

  useEffect(()=> {
    if(!countdownActive && !workExpired){
      setTimeLeft([workTimer,timeLeft[1]]);
    }
    if(!countdownActive && workExpired){
      setTimeLeft([restTimer, timeLeft[1]]);
    }
  },[workTimer,restTimer]);

  useEffect(()=>{
    setDashOffset(0);
    setRestOffset(0);
  },[workExpired])

  useEffect(() => {

    let interval;

    if(countdownActive){
      interval = setInterval(() => {
        setTimeLeft((prevTimeLeft) =>{
          const newTimeLeft = calculateTimeLeft(prevTimeLeft);
          if(!workExpired){
            setDashOffset(calculateDashOffset(newTimeLeft));
          }
          else{
            setRestOffset(calculateRestOffset(newTimeLeft));
          }
          return newTimeLeft;
        });
      }, 1000);
    }



    return () => clearInterval(interval);

  },[countdownActive, timeLeft]);

  function incrementWorkTimer(){
    if(workTimer<60 && !countdownActive){
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

  function toggleCountdown(){
    return setCountdownActive(!countdownActive);
  }

  function calculateTimeLeft(p){
    let minutes = p[0];
    let seconds = p[1];

    if(minutes === 0 && seconds === 0 && !workExpired){
      setWorkExpired(true);
      return [restTimer,0];
    }
    else if(minutes === 0 && seconds === 0 && workExpired){
      setWorkExpired(false);
      return [workTimer,0];
    }

    if(seconds === 0){
      return [minutes-1,59];
    }

    return [minutes,seconds-1];


  }

  function calculateDashOffset(p){
    const offset = Math.round((workTimer*60 - (p[0]*60 + p[1]))/(workTimer*60)*900)
    if(offset < 0){
      return 0;
    }
    else{
      return offset;
    }
  }

  function calculateRestOffset(p){
    const offset = Math.round((restTimer*60 - (p[0]*60 + p[1]))/(restTimer*60)*900);
    if(offset < 0){
      return 0;
    }
    else{
      return offset;
    }
  }

  function resetClock(){
    setCountdownActive(false);
    setTimeLeft([workTimer,0]);
    setWorkExpired(false);
    setDashOffset(0);
  }



  return (
    <>
      <div className="container">
        <h2 className="title-text"><Badge bg={workExpired ? "success" : "primary"}>Pomodoro Clock</Badge></h2>
        <div className="timer-wrapper">
          <div className="timer">
            <div className="outer-bar">
              <div className="inner-bar">
                {timeLeft[0]}m {timeLeft[1]}s
              </div>
              <svg className="progress-bar" xmlns="http://www.w3.org/2000/svg" version="1.1" width="320px" height="320px">
                  <defs>
                      <linearGradient id="GradientColor">
                          <stop offset="0%" stopColor="#599cff" />
                          <stop offset="100%" stopColor="#003480" />
                      </linearGradient>
                      <linearGradient id="restColor">
                          <stop offset="0%" stopColor="#21b300" />
                          <stop offset="100%" stopColor="#136600" />
                      </linearGradient>
                  </defs>
                  {workExpired ? (<circle cx="160" cy="160" r="140" stroke="url(#restColor)" strokeDasharray= "900" strokeDashoffset={restOffset} style={{ transition: "stroke-dashoffset 0.1s linear"}} />) :
                  (<circle cx="160" cy="160" r="140" stroke="url(#GradientColor)" strokeDasharray= "900" strokeDashoffset={dashOffset} style={{ transition: "stroke-dashoffset 0.1s linear", transform:"rotate(-90deg)", transformOrigin: "50% 50%"}} /> ) };
              </svg>
            </div>
          </div>
          <div className="timer-controls">
            <Button className="controls" onClick={toggleCountdown} variant={workExpired ? "success" : "primary"}><FontAwesomeIcon icon={countdownActive ? faPause : faPlay} /></Button>
            <Button className="controls" onClick={resetClock} variant={workExpired ? "success" : "primary"}><FontAwesomeIcon icon={faArrowsRotate} /></Button>
          </div>
          <div className="timer-settings">
            <div className="minutes">
              <h4><Badge bg={workExpired ? "success" : "primary"}>Working Minutes</Badge></h4>
              <button onClick={incrementWorkTimer}><FontAwesomeIcon icon={faArrowUp}/></button> 
              <span className="setTime">{workTimer}</span>
              <button onClick={decrementWorkTimer}><FontAwesomeIcon icon={faArrowDown}/></button>
            </div>
            <div className="seconds">
              <h4><Badge bg={workExpired ? "success" : "primary"}>Rest Minutes</Badge></h4>
              <button onClick={incrementRestTimer}><FontAwesomeIcon icon={faArrowUp}/></button> 
              <span className="setTime">{restTimer}</span>
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
