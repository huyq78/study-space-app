import React, { useState } from 'react'
import styled from 'styled-components';
import { storage } from '../../firebase';
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { createSpace, getListSpace } from '../../redux/apiCall';
import { useDispatch } from 'react-redux';
import { setUpload, upSpace } from '../../redux/spaceRedux';

const Container = styled.div`
    position: absolute;
    width: 300px;
    height: 300px;
    margin: calc(40px + 8px) 8px 8px;
    z-index: 3000;
    left: 385px;
`;

const Wrapper = styled.div`
    background-color: #fcfcfc;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    width: 100%;
    border-radius: 7px;
    color: #3e3e3e;
`

const SpaceWrapper = styled.div`
    width: auto;
    color: #4e4e4e;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
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
    margin: 5px;
    gap: 10px;
    border-radius: 10px;
    cursor: pointer;
    border: none;
    &:active{
        background-color: rgb(120, 120, 120);
    }
`

const Upload = styled.input`
    
`
const UploadForm = styled.form`
    display: flex;
    flex-direction: column;
    margin: 10px;
    text-align: center;
    align-items: center;
    justify-content: center;
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

const Percent = styled.div`
    color: #000000;
    font-size: 1rem;
    background-color: #40aebc;
    width: 30px;
    border-radius: 20px;
    margin: 10px;
`
function UploadSpace() {
    const [spaceInfo, setSpaceInfo] = useState({
        name: "",
        type: ""
    });
    const [progresspercent, setProgresspercent] = useState(0);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

    const onChange = (
        (e) => {
            setSpaceInfo((space) => {
                return {
                    ...space, [e.target.name]: e.target.value
                }
            })
        }
    )

    const handleSubmit = async (e) => {
        e.preventDefault()
        const file = e.target[0]?.files[0]
        if (!file) return;
        const storageRef = ref(storage, `${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on("state_changed",
            (snapshot) => {
                const progress =
                    Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setProgresspercent(progress);
            },
            (error) => {
                alert(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                    try {
                        const res = await createSpace({
                            name: spaceInfo.name,
                            link: downloadURL,
                            type: spaceInfo.type
                        })
                        
                        console.log(res.data);
                        dispatch(upSpace(downloadURL));
                        dispatch(setUpload(false));
                    } catch (error) {

                    }


                });
            }
        );
        setLoading(false);
    }

    return (
        <>
            <Container>
                <Wrapper>
                    <SpaceWrapper>
                        <Input type='text' name='name' placeholder="Name" onChange={onChange} ></Input>
                        <Input type='text' name='type' placeholder="Type" onChange={onChange} ></Input>
                        <UploadForm onSubmit={handleSubmit}>
                            <Upload type='file'></Upload>
                            {
                                !loading &&
                                <Percent style={{ width: `${progresspercent}%` }} >{progresspercent}%</Percent>
                            }
                            <SpaceBtn type='submit'>
                                Upload
                            </SpaceBtn>
                        </UploadForm>

                    </SpaceWrapper>
                </Wrapper>
            </Container>
        </>
    )
}

export default UploadSpace