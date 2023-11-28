import React from 'react'
import styled from 'styled-components';

const Container = styled.div`
    position: absolute;
    width: 300px;
    height: calc(100% - 8px * 2 - 40px);
    margin: calc(40px + 8px) 8px 8px;
    z-index: 3000;
    left: 75px;
`;

const Wrapper = styled.div`
    background-color: #fcfcfc;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    width: 100%;
    border-radius: 7px;
    color: #3e3e3e;
`

function ManageSpace() {
    return (
        <>
            <Container>
                <Wrapper>
                    ManageSpace
                </Wrapper>
            </Container>
        </>
    )
}

export default ManageSpace