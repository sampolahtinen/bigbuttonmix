/** @jsx jsx */
import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import { Footer } from '../Footer';

export const Layout: React.FC = ({ children }) => {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    setHeight(window.innerHeight);
  }, []);

  return (
    <LayoutContainer className="layout" css={{ height: window.innerHeight }}>
      {children}
      <Footer />
    </LayoutContainer>
  );
};

const LayoutContainer = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100vw;
  max-width: 500px;
  background-image: linear-gradient(
    to bottom,
    #12151f,
    #121521,
    #121524,
    #121526,
    #121528
  );

  @media (min-width: 640px) {
    margin: auto;
    max-width: 500px;

    main {
      max-width: none;
    }
  }
`;
