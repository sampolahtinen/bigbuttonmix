import styled from '@emotion/styled';
import { Text } from '@theme-ui/components';
import React from 'react';

export const Footer = () => (
  <FooterContainer className="footer">
    <Text
      css={{
        opacity: 0.5,
        alignSelf: 'end',
        fontSize: '1.2rem',
        margin: '0 auto'
      }}
    >
      (c) Andrew Moore & Sampo Lahtinen
    </Text>
  </FooterContainer>
);

const FooterContainer = styled.div`
  position: fixed;
  display: flex;
  bottom: 0;
  height: ${props => props.theme.footer.height};
  width: 100%;
`;
