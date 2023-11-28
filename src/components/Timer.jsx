import React from 'react'
import styled from 'styled-components';

const Container = styled.div`
    position: absolute;
    z-index: 3000;
    left: 395px;
    top: 48px;
    width: 360px;
    height: auto;
    min-width: 360px;
    min-height: 150px;
    max-height: calc(699px);
    max-width: calc(942px);
`;

const Wrapper = styled.div`
    background: #fcfcfc;
    border-radius: 7px;
    box-shadow: 0 0 4px rgba(131,131,131,.25);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    height: 100%;
    width: 100%;
`
function Timer() {
  return (
    <>
        <Container>
            <Wrapper>
                Timer
            </Wrapper>
        </Container>
    </>
  )
}

export default Timer