/** @jsx jsx */
import React from 'react'
import { jsx, css } from '@emotion/react'
import styled  from '@emotion/styled'

type BigButtonProps = {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void,
  isLoading?: boolean,
  isSmall?: boolean,
}

export const BigButton = ({
  onClick,
  isLoading,
  isSmall
}: BigButtonProps) => {
  return (
    <Button className="big-button" isLoading={isLoading} onClick={onClick} isSmall={isSmall}>
      <Circle isSmall={isSmall} isLoading={isLoading}/>
      <span css={{ fontSize: isSmall ? '0.7em' : '2.5em'}}>{isSmall ? 'NEXT!' : 'GO!'}</span>
    </Button>
  )
}

const Circle = styled.div<Partial<BigButtonProps>>`
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    border: 2px solid rgb(255, 85, 85);
    transition: transform 500ms;
    transform-origin: center;
    transform: ${props => props.isSmall ? 'transform: scale(0.7)' : ''};

    ${props => props.isLoading && css`
      animation: pulse 2s infinite ease-in-out;
    `}

  @keyframes pulse {
    0% {
      border-color: #FFF;
      color: #FFF;
    }
    50% {
      border-color: #ff403670;
      color: #ff403670;
    }
    100% {
      border-color: #FF4136;
      color: #FF4136;
    }
}
`

const Button = styled.button<BigButtonProps>`
    position: relative;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    background: unset;
    font-size: 2.5em;
    color: white;
    text-transform: uppercase;
    margin: auto;
`
