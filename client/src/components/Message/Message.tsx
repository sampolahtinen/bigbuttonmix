/** @jsxImportSource theme-ui */
import React from 'react';
import styled from '@emotion/styled';

export enum MessageType {
  Info = 'info',
  Error = 'error'
}

type MessageProps = {
  type: MessageType;
  size?: 'small' | 'medium' | 'large';
  className?: string;
};

export const Message: React.FC<MessageProps> = props => {
  const { children } = props;

  return <Span {...props}>{children}</Span>;
};

const Span = styled.span<Partial<MessageProps>>`
  color: ${({ theme, type }) =>
    type === MessageType.Error ? theme.colors.secondary : theme.colors.text};
  font-size: ${({ theme, size }) =>
    size === 'small' ? `${theme.fontSizes[1]}px` : `${theme.fontSizes[2]}px`};
`;
