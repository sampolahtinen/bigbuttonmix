import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import ReactGA from 'react-ga';
import {TRACKING_ID} from './constants'


console.log('LOGGING')
console.log(TRACKING_ID)


//ReactGA.initialize(TRACKING_ID); //UA-213321254-1
//ReactGA.pageview(window.location.pathname);


const rootContainer = document.getElementById('root');

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  rootContainer
);
