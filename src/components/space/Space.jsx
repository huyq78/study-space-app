import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux';
import styled from 'styled-components'

const Container = styled.div`
    position: fixed;
    top: 0px;
    background-color: black;
    border-bottom: 1px solid rgb(223, 223, 223);
    width: 100%;
`;

const Video = styled.video`
    position: relative;
    height: 108vh;
    left: -70px;
`
function Space() {
    const space = useSelector((state) => state.space)
    const vidRef = useRef();
    const play = () =>{
        vidRef.current.play();
    }

    return (
        <Container>
            <Video onClick={()=> play()} ref={vidRef} width="1680" height="945" src={space.currentSpace} autoPlay muted={space.muted} loop></Video>
        </Container>
    )
}

export default Space