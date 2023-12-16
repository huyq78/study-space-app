import React, { useEffect, useRef } from 'react'
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
    top: -170px;
`
function Space() {
    const vidRef = useRef();
    const play = () =>{
        vidRef.current.play();
    }
    return (
        <Container>
            <Video onClick={()=> play()} ref={vidRef} width="1680" height="945" src="https://firebasestorage.googleapis.com/v0/b/study-space-99611.appspot.com/o/Raining%20in%20Lofi%20City%20-%20lofi%20chill%20night%20%5BListen%20to%20it%20to%20escape%20from%20a%20hard%20day%5D.mp4?alt=media&token=f6e8909f-faf4-4895-a9a1-d52e4977c13a" autoPlay ></Video>
        </Container>
    )
}

export default Space