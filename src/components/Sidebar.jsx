import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import ManageSpace from './space/ManageSpace';
import Timer from './timer/Timer';
import { getListSpace } from '../redux/apiCall';
import { useDispatch } from 'react-redux';
import { listSpace, setUpload } from '../redux/spaceRedux';

const Container = styled.div`
    position: absolute;
    z-index: 1000;
    left: 0px;
    transition: left 0.3s ease-out 0s;
    height: calc(100% - 8px * 2 - 40px);
    width: auto;
`;

const Wrapper = styled.div`
    height: 100%;
    background-color: rgb(252, 252, 252);
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;
    -webkit-box-align: center;
    padding: 10px;
    padding-top: calc(50px);
    gap: 10px;
`;

const Item = styled.button`
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

const Title = styled.span`
    color: rgb(145, 148, 152);
    font-size: 10px;
`

const Icon = styled(FontAwesomeIcon)`
    height: 20px;
    width: 20px;
    border-radius: 40%;
    color: rgb(78, 78, 78);
`
function Sidebar() {
    const [manageSpace, setManageSpace] = useState(false);
    const [timer, setTimer] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        if (localStorage.getItem("access_token")) {
            getListSpace().then(res => {
                dispatch(listSpace(res));
            })
        }
    }, [])

    return (
        <>
            <Container>
                <Wrapper>
                    <Item onClick={() => {
                        setManageSpace(!manageSpace);
                        dispatch(setUpload(false));
                    }}>
                        <Title>
                            SPACE
                        </Title>
                        <Icon icon="fa-solid fa-mountain-sun" />
                    </Item>
                    <Item onClick={() => setTimer(!timer)}>
                        <Title>
                            TIMER
                        </Title>
                        <Icon icon="fa-solid fa-clock" />
                    </Item>
                    <Item>
                        <Title>
                            TASK
                        </Title>
                        <Icon icon="fa-solid fa-list-check" />
                    </Item>
                    <Item>
                        <Title>
                            Calender
                        </Title>
                        <Icon icon="fa-regular fa-calendar-check" />
                    </Item>
                    <Item>
                        <Title>
                            MEDIA
                        </Title>
                        <Icon icon="fa-regular fa-circle-play" />
                    </Item>
                </Wrapper>
            </Container>
            {manageSpace ? <ManageSpace /> : <></>}
            {timer ? <Timer /> : <></>}
        </>
    )
}

export default Sidebar