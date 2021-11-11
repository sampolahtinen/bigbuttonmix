/** @jsx jsx */
import React from 'react';
import { jsx, css } from '@emotion/react';
import styled from '@emotion/styled';
import { useSpring, animated } from 'react-spring';

type BigButtonProps = {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isLoading?: boolean;
  isSmall?: boolean;
  className?: string;
};

export const BigButton = ({
  onClick,
  isLoading,
  isSmall,
  className
}: // css
BigButtonProps) => {
  const animatedShadow = useSpring({
    from: {
      filter: 'drop-shadow(2px 7px 43px #683ab7ea)'
    },
    to: {
      filter: 'drop-shadow(2px 7px 50px ##ff5655)'
    },
    delay: 50,
    loop: true,
    config: {
      duration: 1500
    }
  });

  return (
    <Button className={className} onClick={onClick} isSmall={isSmall}>
      <animated.svg
        width="475"
        height="475"
        viewBox="0 0 475 475"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transform: isSmall ? 'scale(0.3)' : 'scale(0.5)',
          transformOrigin: 'center 0',
          overflow: 'visible'
        }}
      >
        <animated.circle
          cx="235.5"
          cy="235.5"
          r="235.5"
          fill="#121528"
          style={
            isLoading
              ? animatedShadow
              : { filter: 'drop-shadow(2px 7px 43px #683ab7ea)' }
          }
        />
        <circle cx="236" cy="236" r="128" fill="#FF5555" />
        <path
          d="M285.02 230.64C302.247 235.453 315.167 243.18 323.78 253.82C332.647 264.207 337.08 277.127 337.08 292.58C337.08 317.407 329.1 336.913 313.14 351.1C297.433 365.033 274.633 372 244.74 372H154.3V102.96H233.72C264.373 102.96 287.427 109.167 302.88 121.58C318.333 133.993 326.06 151.6 326.06 174.4C326.06 201.507 312.38 220.253 285.02 230.64ZM190.4 133.36V217.72H233.72C251.453 217.72 264.88 214.173 274 207.08C283.373 199.733 288.06 188.84 288.06 174.4C288.06 147.04 269.947 133.36 233.72 133.36H190.4ZM244.74 341.6C262.22 341.6 275.647 337.42 285.02 329.06C294.393 320.7 299.08 308.54 299.08 292.58C299.08 277.887 293.887 266.867 283.5 259.52C273.367 251.92 258.547 248.12 239.04 248.12H190.4V341.6H244.74ZM379.376 334H417.376V372H379.376V334Z"
          fill="#121528"
        />
        <line
          x1="89"
          y1="185"
          x2="89"
          y2="299"
          stroke="#FF5555"
          stroke-width="4"
        />
        <line
          x1="81"
          y1="185"
          x2="81"
          y2="299"
          stroke="#FF5555"
          stroke-width="4"
        />
        <line
          x1="73"
          y1="193"
          x2="73"
          y2="291"
          stroke="#FF5555"
          stroke-width="4"
        />
        <line
          x1="65"
          y1="193"
          x2="65"
          y2="291"
          stroke="#FF5555"
          stroke-width="4"
        />
        <line
          x1="57"
          y1="208"
          x2="57"
          y2="276"
          stroke="#FF5555"
          stroke-width="4"
        />
        <line
          x1="49"
          y1="208"
          x2="49"
          y2="276"
          stroke="#FF5555"
          stroke-width="4"
        />
        <line
          x1="383"
          y1="299"
          x2="383"
          y2="185"
          stroke="#FF5555"
          stroke-width="4"
        />
        <line
          x1="391"
          y1="299"
          x2="391"
          y2="185"
          stroke="#FF5555"
          stroke-width="4"
        />
        <line
          x1="399"
          y1="291"
          x2="399"
          y2="193"
          stroke="#FF5555"
          stroke-width="4"
        />
        <line
          x1="407"
          y1="291"
          x2="407"
          y2="193"
          stroke="#FF5555"
          stroke-width="4"
        />
        <line
          x1="415"
          y1="276"
          x2="415"
          y2="208"
          stroke="#FF5555"
          stroke-width="4"
        />
        <line
          x1="423"
          y1="276"
          x2="423"
          y2="208"
          stroke="#FF5555"
          stroke-width="4"
        />
      </animated.svg>
    </Button>
  );
};

const Button = styled.button<BigButtonProps>`
  position: relative;
  width: auto;
  height: 240px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: unset;
  margin-bottom: 2rem;
`;
