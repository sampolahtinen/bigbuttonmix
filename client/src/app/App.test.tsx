import { shallow } from 'enzyme';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

describe('App', () => {
  const wrapper = shallow(<App />);

  it('[enzyme] displays a welcoming text', () => {
    expect(wrapper.find('h1').text()).toBe('Welcome to React Starter!');
  });
});

/**
 * React testing library example:
 */
test('[testing-library] displays a welcoming text', async () => {
  render(<App />);
  expect(screen.getByText('Welcome to React Starter!')).toBeTruthy();
});
