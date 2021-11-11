import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Global } from '@emotion/react';
import { ThemeProvider } from 'theme-ui';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';
import { Initial } from '../pages/index';
import { Results } from '../pages/results';
import { Routes as RoutePaths } from '../constants/routes';

const App = () => {
  return (
    <>
      <ThemeProvider theme={theme}>
        <Global styles={globalStyles} />
        <Routes>
          <Route path={RoutePaths.Index} element={<Initial />} />
          <Route path={RoutePaths.Results} element={<Results />} />
        </Routes>
      </ThemeProvider>
    </>
  );
};

export default App;
