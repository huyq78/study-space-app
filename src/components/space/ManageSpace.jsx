import React, { useEffect, useState } from 'react'
import styled from 'styled-components';
import { deleteSpace, getListSpace, getSpace } from '../../redux/apiCall';
import { useDispatch, useSelector } from 'react-redux';
import UploadSpace from './UploadSpace';
import { delSpace, listSpace, setUpload, upSpace } from '../../redux/spaceRedux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
    flex-wrap: wrap;
    margin: 10px;
    width: 80%;
    height: 80px;
    overflow-y: scroll;
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
    margin: 5px;
    gap: 10px;
    border-radius: 10px;
    cursor: pointer;
    border: none;
    &:active{
        background-color: rgb(120, 120, 120);
    }
`

const UploadWrapper = styled.div`
     display: flex;
    flex-wrap: wrap;
    margin: 10px;
`

const Icon = styled(FontAwesomeIcon)`
    height: 16px;
    width: 16px;
    border-radius: 40%;
    color: rgb(78, 78, 78);
`

function ManageSpace() {
    const space = useSelector((state) => state.space);
    const dispatch = useDispatch();
    const [currentSpaceId, setCurrentSpaceId] = useState();
    useEffect(() => {
        if (localStorage.getItem("access_token")) {
            getListSpace().then(res => {
                dispatch(listSpace(res));
            })
        }
    }, [space.currentSpace])

    const handleClick = (id) => {
        getSpace(id).then(res => {
            setCurrentSpaceId(id);
            console.log(id);
            dispatch(upSpace(res.link))
        })
    }

    const handleDelete = async (id) => {
        console.log(id)
        deleteSpace(id);
        dispatch(delSpace(id));
    }
    return (
        <>
            <Container>
                <Wrapper>
                    <SpaceWrapper>
                        <SpaceHeader>
                            <SpaceTitle> Space Shuffle</SpaceTitle>
                            <SpaceControl>
                                {space.spaces.map((space) => {
                                    return (
                                        <SpaceBtn onClick={() => handleClick(space._id)} key={space._id}>
                                            {space.name}
                                        </SpaceBtn>
                                    )
                                })}
                            </SpaceControl>
                            <UploadWrapper>
                                <SpaceBtn onClick={() => dispatch(setUpload(!space.upload))}>
                                    +
                                </SpaceBtn>
                                <SpaceBtn onClick={() => handleDelete(currentSpaceId)}>
                                    <Icon icon="fa-solid fa-trash" />
                                </SpaceBtn>
                            </UploadWrapper>
                        </SpaceHeader>
                    </SpaceWrapper>
                </Wrapper>
            </Container>
            {space.upload ? <UploadSpace /> : <></>}
        </>
    )
}

export default ManageSpace