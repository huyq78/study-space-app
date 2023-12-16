import React, { useEffect, useState } from 'react'
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

const SpaceWrapper = styled.div`
    width: auto;
    color: #4e4e4e;

`

const SpaceHeader = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 10px 16px;
    font-size: 18px;
`

const SpaceTitle = styled.div`
    
`

const SpaceControl = styled.div`
    display: flex;
    flex-direction: row;
    margin: 10px;
`
const SpaceBtn = styled.button`
    display: flex;
    flex-direction: column;
    -webkit-box-align: center;
    align-items: center;
    height: fit-content;
    width: fit-content;
    min-width: 55px;
    padding: 10px 5px;
    gap: 10px;
    border-radius: 10px;
    cursor: pointer;
    border: none;
    &:active{
        background-color: rgb(120, 120, 120);
    }
`
function ManageSpace() {
    const token = window.localStorage.getItem("token")
    const [space, setSpace] = useState([])
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        fetch(`http://localhost:8888/api/space`, {
            method: "GET",
            headers: {
                'Authorization' : 'Bearer ' + token,
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
            .then((res) => res.json())
            .then((json) => {
                console.log(json)
                setSpace(json.data.data)
                setLoading(true)
            });
            console.log(space)
    },[loading])
    return (
        <>
            <Container>
                <Wrapper>
                    <SpaceWrapper>
                        <SpaceHeader>
                            <SpaceTitle> Space Shuffle</SpaceTitle>
                            <SpaceControl>
                                {space.map((space) => {
                                    return(
                                    <SpaceBtn key={space._id}>
                                        {space.name}
                                    </SpaceBtn>
                                    )
                                })}
                            </SpaceControl>
                        </SpaceHeader>
                    </SpaceWrapper>
                </Wrapper>
            </Container>
        </>
    )
}

export default ManageSpace