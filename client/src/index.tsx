import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import ReactGA from 'react-ga';

const TRACKING_ID = "UA-213321254-1"; 
ReactGA.initialize(TRACKING_ID);
ReactGA.pageview(window.location.pathname);


const rootContainer = document.getElementById('root');

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  rootContainer
);
