import React, { useEffect } from 'react';
import { ApolloProvider, useQuery, gql } from '@apollo/client';
import { Routes, Route } from 'react-router-dom';
import { Global } from '@emotion/react';
import { ThemeProvider } from 'theme-ui';

import { Results } from '../pages/results';
import { Layout } from '../components/Layout/Layout';

import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';
import { InitialView } from '../pages/index/InitialView';
import { Routes as RoutePaths } from '../constants/routes';
import { apolloClient } from '../../config/apollo/index';

const App = () => {
  return (
    <>
      <ApolloProvider client={apolloClient}>
        <ThemeProvider theme={theme}>
          <Global styles={globalStyles} />
          <Layout>
            <Routes>
              <Route path={RoutePaths.Index} element={<InitialView />} />
              <Route path={RoutePaths.Results} element={<Results />} />
            </Routes>
          </Layout>
        </ThemeProvider>
      </ApolloProvider>
    </>
  );
};

export default App;
