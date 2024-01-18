import React from 'react'
import styled from 'styled-components'

const Contain = styled.div`
    position: relative;
    height: 100vh;
`

const Wrapper = styled.div`
    position: absolute;
    left: 50%;
    top: 50%;
    -webkit-transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    max-width: 520px;
    width: 100%;
    line-height: 1.4;
    text-align: center;
`

const Content = styled.div`
    position: relative;
    height: 200px;
    margin: 0px auto 20px;
    z-index: -1;
`

const Text1 = styled.h1`
    font-family: 'Montserrat', sans-serif;
    font-size: 280px;
    font-weight: 200;
    margin: 0px;
    color: #211b19;
    text-transform: uppercase;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
`

const Text2 = styled.h2`
    font-family: 'Montserrat', sans-serif;
    font-size: 28px;
    font-weight: 400;
    text-transform: uppercase;
    color: #211b19;
    background: #fff;
    margin: auto;
    display: inline-block;
    position: absolute;
    bottom: 0px;
    left: 0;
    right: 0;
    margin-block-end: 0.8em;
    box-sizing: border-box;
    width: 400px;
`
function Block() {
  return (
    <Contain>
        <Wrapper>
            <Content>
                <Text1>HEY!</Text1>
                <Text2>Back to your work</Text2>
            </Content>
        </Wrapper>
    </Contain>
  )
}

export default Block