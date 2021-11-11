import {
  CreateStyled as BaseCreateStyled,
  CreateStyledComponent
} from '@emotion/styled';
import { deep } from '@theme-ui/presets';
import { mergeDeepRight } from 'ramda';

export const theme = mergeDeepRight(deep, {
  /**
   * Define for theme overrides here
   */
  colors: {
    orange: 'rgb(255, 85, 85)'
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64],
  footer: {
    height: '50px'
  }
});
