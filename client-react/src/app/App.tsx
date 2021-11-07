import React from 'react';
import { Global } from '@emotion/react'
import { ThemeProvider} from 'theme-ui';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';
import { MainView } from '../pages';

const App = () => {
  return (
    <>
      <ThemeProvider theme={theme}>
        <Global styles={globalStyles} />
        <MainView />
      </ThemeProvider>
    </>
  );
};

export default App;
