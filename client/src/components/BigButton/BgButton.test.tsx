import { matchers } from '@emotion/jest';
import { shallow } from 'enzyme';
import React from 'react';
import { BigButton, BigButtonContainer } from './BigButton';

expect.extend(matchers);

describe('BigButton', () => {
  const mockClickHandler = jest.fn();
  const wrapper = shallow(<BigButton onClick={mockClickHandler} />);
  it('handles clicking', () => {
    wrapper.find(BigButtonContainer).simulate('click');

    expect(mockClickHandler).toHaveBeenCalled();
  });

  it('is big when isSmall prop is not passed into it', () => {
    expect(wrapper.find(BigButtonContainer)).toHaveStyleRule('width', '240px');
  });

  it('is small when isSmall prop is passed into it', () => {
    wrapper.setProps({ isSmall: true });
    expect(wrapper.find(BigButtonContainer)).toHaveStyleRule('width', '120px');
  });
});
