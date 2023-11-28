import React, { useEffect } from 'react'
import styled from 'styled-components'

const Container = styled.div`
    position: fixed;
    top: 0px;
    background-color: black;
    border-bottom: 1px solid rgb(223, 223, 223);
    width: 100%;
`;

const Video = styled.iframe`
    position: relative;
    top: -170px;
`
function Space() {

    return (
        <Container>
            <Video width="1680" height="945" src="https://www.youtube.com/embed/JqLIV9QzYt8?si=sybwfyuWmb5LD6s3?controls=0&autoplay=1&rel=0" title="YouTube video player" allow="autoplay; encrypted-media"></Video>
        </Container>
    )
}

export default Space