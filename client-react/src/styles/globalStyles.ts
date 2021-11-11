import { css } from '@emotion/react';
import latoRegularPath from '../assets/fonts/Lato-Regular.ttf';
import latoBoldPath from '../assets/fonts/Lato-Bold.ttf';

export const globalStyles = css`
  @font-face {
    font-family: 'FR73PixelW00-Regular';
    src: url('//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.eot');
    src: url('//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.eot?#iefix')
        format('embedded-opentype'),
      url('//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.woff2')
        format('woff2'),
      url('//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.woff')
        format('woff'),
      url('//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.ttf')
        format('truetype'),
      url('//db.onlinewebfonts.com/t/7c2857cbd04acdf539eeb197ca8fd6c2.svg#FR73PixelW00-Regular')
        format('svg');
  }

  @font-face {
    font-family: 'regular';
    font-size: 16px;
    src: url(${latoRegularPath});
  }

  @font-face {
    font-family: 'bold';
    font-size: 16px;
    src: url(${latoBoldPath});
  }

  * {
    font-family: 'regular';
    /* font-family: 'FR73PixelW00-Regular'; */
  }

  body {
    padding: 0;
    margin: 0;
    overflow-x: hidden;
    overflow-y: auto;
  }

  div {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    position: relative;
  }

  main {
    position: relative;
    display: block;
    width: 100vw;
    height: 100vh;
    text-align: center;
    margin: 0;
    max-width: 500px;
  }
`;
