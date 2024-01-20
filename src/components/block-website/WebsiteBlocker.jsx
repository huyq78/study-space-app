import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { setTimer, updateTimer } from '../../redux/timerRedux';
import { useRef } from 'react';
import Draggable from 'react-draggable';
import { deleteWebsite, getListWebsite, updateListWebsite } from '../../redux/apiCall';
import { addListBlocker, addNewBlocker, delBlocker, listBlocker, listWebsite, updateStatus } from '../../redux/blockerRedux';

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
    min-width: 90%;
    flex-direction: column;
    margin: 20px 0px;
    height: 100px;
    overflow-y: scroll;
    
`

const BlockItem = styled.div`
    display: flex;
    justify-content: space-around;
    margin: 5px 0px;
`

const FormBlocker = styled.div`
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
const Item = styled.div`
    flex: 3;
    display: flex;
    justify-content: center;
`

const BlockBtn = styled.button`
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border-radius: 20px;
    cursor: pointer;
`

const DelBtn = styled.button`
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    background-color: transparent;
    cursor: pointer;
`
const Icon = styled(FontAwesomeIcon)`
    height: 16px;
    width: 16px;
    border-radius: 40%;
    color: rgb(78, 78, 78);
`

const SubmitWrapper = styled.div`
    display: flex;
    flex-direction: row;
`
const Alert = styled.div`
    color: green;
`
function WebsiteBlocker() {
    const user = useSelector((state) => state.user.currentUser);
    const listBlocker = useSelector((state) => state.blocker)
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [block, setBlock] = useState(true);
    const [blocker, setBlocker] = useState(
        {
            name: "",
            url: ""
        }
    )
    const [success, setSuccess] = useState(false);
    const refName = useRef(null);
    const refUrl = useRef(null);
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
                    })
                }
            } catch (error) {
                console.log(error);
            }
        }
        callApi();
        setTimeout(() => {
            setSuccess(false);
        }, 5000);
    }, [loading])

    const handleClick = () => {
        dispatch(addNewBlocker({
            name: blocker.name,
            url: blocker.url,
            status: "blocked"
        }));
        // setLoading(!loading);
        refName.current.value = "";
        refUrl.current.value = "";
    }

    const handleBlock = (props) => {
        dispatch(updateStatus(props));
        setBlock(!block);
        // setLoading(!loading);
    }

    const handleDelete = (id) => {
        dispatch(delBlocker(id));
        console.log(listBlocker.listBlocker)

        // setLoading(!loading);
    }

    const handleUpdate = () => {
        setLoading(!loading);
        setSuccess(true);
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
                                    <BlockItem key={blocker.name}>
                                        <Item>
                                            {blocker.name}
                                        </Item>
                                        {blocker.status === "blocked" ?
                                            <BlockBtn style={{ color: "red", border: "1px solid red" }} onClick={() => handleBlock({ id: blocker._id, name: blocker.name, status: "unblocked" })}>
                                                {blocker.status}
                                            </BlockBtn>
                                            :
                                            <BlockBtn style={{ color: "green", border: "1px solid green" }} onClick={() => handleBlock({ id: blocker._id, name: blocker.name, status: "blocked" })}>
                                                {blocker.status}
                                            </BlockBtn>
                                        }
                                        <DelBtn onClick={() => handleDelete({id: blocker._id, name: blocker.name})}>
                                            <Icon icon="fa-solid fa-trash" />
                                        </DelBtn>
                                    </BlockItem>
                                )
                            })}
                        </BlockContent>
                        <FormBlocker>
                            <Input ref={refName} type='text' placeholder='Name' name='name' onChange={onChange} />
                            <Input ref={refUrl} type='text' placeholder='Url' name='url' onChange={onChange} />
                            <SubmitWrapper>
                                <SubmitBtn onClick={handleClick}>Add</SubmitBtn>
                                <SubmitBtn onClick={handleUpdate}>Update</SubmitBtn>
                            </SubmitWrapper>
                            {success ? <Alert>Update success!</Alert> : <></>}
                        </FormBlocker>
                    </Wrapper>
                </Container >
            </Draggable>
        </>
    )
}

export default WebsiteBlocker