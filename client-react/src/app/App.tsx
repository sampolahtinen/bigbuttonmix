import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Global } from '@emotion/react';
import { ThemeProvider } from 'theme-ui';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';
import { MainView } from '../pages';

const App = () => {
  return (
    <>
      <ThemeProvider theme={theme}>
        <Global styles={globalStyles} />
        <Routes>
          <Route path="/" element={<MainView />} />
        </Routes>
      </ThemeProvider>
    </>
  );
};

export default App;
