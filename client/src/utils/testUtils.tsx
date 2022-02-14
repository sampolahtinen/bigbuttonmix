import { mount } from 'enzyme';
import React, { ReactElement } from 'react';
import { ThemeProvider } from 'theme-ui';
import { theme } from '../styles/theme';

type Props = {
  children: React.ReactNode;
};

export const mountWithTheme = (tree: ReactElement) => {
  const WrappingThemeProvider = (props: Props) => (
    <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
  );

  return mount(tree, { wrappingComponent: WrappingThemeProvider });
};

export const wait = (time: number = 100) =>
  new Promise(resolve => setTimeout(() => resolve('ok'), time));

export const mockNavigatorGeolocation = () => {
  const clearWatchMock = jest.fn();
  const getCurrentPositionMock = jest.fn();
  const watchPositionMock = jest.fn();

  const geolocation = {
    clearWatch: clearWatchMock,
    getCurrentPosition: getCurrentPositionMock,
    watchPosition: watchPositionMock
  };

  Object.defineProperty(global.navigator, 'geolocation', {
    value: geolocation
  });

  return { clearWatchMock, getCurrentPositionMock, watchPositionMock };
};
