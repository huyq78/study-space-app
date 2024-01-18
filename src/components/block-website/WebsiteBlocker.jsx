import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { setTimer, updateTimer } from '../../redux/timerRedux';
import { useRef } from 'react';
import Draggable from 'react-draggable';
import { getListWebsite, updateListWebsite } from '../../redux/apiCall';
import { addListBlocker, addNewBlocker, listBlocker, listWebsite } from '../../redux/blockerRedux';

const Container = styled.div`
    position: absolute;
    z-index: 3000;
    left: 765px;
    top: 48px;
    width: 360px;
    height: auto;
    min-width: 360px;
    min-height: 150px;
    max-height: calc(690px);
    max-width: calc(1038px);
`;

const Wrapper = styled.div`
    background: #fcfcfc;
    position: fixed;
    border-radius: 7px;
    box-shadow: 0 0 4px rgba(131,131,131,.25);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    overflow: hidden;
    min-width: 360px;
    min-height: 150px;
    max-height: calc(690px);
    max-width: calc(1038px);
`

const BlockTitle = styled.div`
    color: #4e4e4e;
    padding: 10px;
    font-size: 18px;
`

const BlockContent = styled.div`
    display: flex;
    /* flex-wrap: wrap; */
    min-width: 100%;
    flex-direction: column;
    margin: 10px;
    height: 80px;
    overflow-y: scroll;

`

const BlockItem = styled.div`
    display: flex;
    justify-content: space-around;
`

const FormBlocker = styled.form`
    display: flex;
    flex-direction: column;
    margin: 10px;
    text-align: center;
    align-items: center;
    justify-content: center;
`

const Title = styled.span`
    
`

const Input = styled.input`
    background: rgb(255, 255, 255);
  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.37);
  border-radius: 2rem;
  width: 80%;
  height: 10px;
  padding: 1rem;
  margin: 10px;
  border: none;
  outline: none;
  color: #000000;
  font-size: 1rem;
  &:focus {
    display: inline-block;
    box-shadow: 0 0 0 0.2rem #a9a5a5;
    backdrop-filter: blur(12rem);
    border-radius: 2rem;
  }
  &::placeholder {
    color: #b9abe099;
    font-weight: 100;
    font-size: 1rem;
  }
`

const SubmitBtn = styled.button`
    display: flex;
    flex-direction: column;
    -webkit-box-align: center;
    align-items: center;
    height: fit-content;
    width: fit-content;
    width: 70px;
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


function WebsiteBlocker() {
    const user = useSelector((state) => state.user.currentUser);
    const listBlocker = useSelector((state) => state.blocker)
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [blocker, setBlocker] = useState(
        {
            name: "",
            url: ""
        }
    )

    useEffect(() => {
        async function callApi() {
            try {
                console.log(listBlocker.listBlocker)
                const res = await updateListWebsite(listBlocker.listBlocker);
                if (res) {
                    getListWebsite().then(res => {
                        const newList = res.map(({ name, url, userId, ...rest }) => rest);
                        const newList2 = newList.map(({ _id, ...rest }) => ({ ...rest, id: _id }));
                        dispatch(listWebsite(res));
                        dispatch(addListBlocker(newList2));
                        console.log(newList2);
                    })
                }
            } catch (error) {
                console.log(error);
            }
        }
        callApi();
    }, [loading])

    const handleClick = () => {
        dispatch(addNewBlocker({
            name: blocker.name,
            url: blocker.url,
            status: "blocked"
        }));
        setLoading(!loading);
    }

    const onChange = (
        (e) => {
            setBlocker((blocker) => {
                return {
                    ...blocker, [e.target.name]: e.target.value
                }
            })
        }
    )

    return (
        <>
            <Draggable>
                <Container>
                    <Wrapper>
                        <BlockTitle>
                            Website Blocker
                        </BlockTitle>
                        <BlockContent>
                            {listBlocker.website?.map((blocker) => {
                                return (
                                    <BlockItem key={blocker._id}>
                                        <div>
                                            {blocker.name}
                                        </div>
                                        <div>
                                            {blocker.status}
                                        </div>

                                    </BlockItem>
                                )
                            })}
                        </BlockContent>
                        <FormBlocker>
                            <Input type='text' placeholder='Name' name='name' onChange={onChange} />
                            <Input type='text' placeholder='Url' name='url' onChange={onChange} />
                            <SubmitBtn onClick={handleClick}>Add</SubmitBtn>
                        </FormBlocker>
                    </Wrapper>
                </Container >
            </Draggable>
        </>
    )
}

export default WebsiteBlocker