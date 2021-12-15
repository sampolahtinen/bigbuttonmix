import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import ReactGA from 'react-ga';

const GOOGLE_ANALYTICS_ID = process.env.GOOGLE_ANALYTICS_ID || "";

ReactGA.initialize(GOOGLE_ANALYTICS_ID);
ReactGA.pageview(window.location.pathname);

const rootContainer = document.getElementById('root');

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  rootContainer
);
