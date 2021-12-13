import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import ReactGA from 'react-ga';

const ANALYTICS_ID = process.env.REACT_APP_ANALYTICS_ID||"";


ReactGA.initialize(ANALYTICS_ID);
ReactGA.pageview(window.location.pathname);

const rootContainer = document.getElementById('root');

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  rootContainer
);
