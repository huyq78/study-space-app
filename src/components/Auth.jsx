import React, { useCallback, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { login, register } from '../redux/apiCall'
import { useDispatch, useSelector } from "react-redux";

const slide = keyframes`
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
`

const Container = styled.div`
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  animation: ${slide} 0.5s cubic-bezier(0.470, 0.000, 0.745, 0.715) both;
`

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 80vh;
  width: 25vw;
  padding: 20px;
  background: rgba(52, 38, 122, 0.601);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  backdrop-filter: blur(8.5px);
  -webkit-backdrop-filter: blur(8.5px);
  border-radius: 10px;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.4rem;
`;

const WelcomeText = styled.h2`
  margin: 1rem 0 1rem 0;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`;

const ButtonContainer = styled.div`
  margin: 1rem 0 2rem 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SwitchButton = styled.h5`
  cursor: pointer;
  margin-top: 0;
`;

const StyledButton = styled.button`
  background: linear-gradient(to right, #14163c 0%, #03217b 79%);
  text-transform: uppercase;
  letter-spacing: 0.2rem;
  width: 65%;
  height: 3rem;
  border: none;
  color: white;
  border-radius: 2rem;
  cursor: pointer;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  border-radius: 2rem;
  width: 80%;
  height: 2rem;
  padding: 1rem;
  margin: 10px;
  border: none;
  outline: none;
  color: #3c354e;
  font-size: 1rem;
  font-weight: bold;
  &:focus {
    display: inline-block;
    box-shadow: 0 0 0 0.2rem #b9abe0;
    backdrop-filter: blur(12rem);
    border-radius: 2rem;
  }
  &::placeholder {
    color: #b9abe099;
    font-weight: 100;
    font-size: 1rem;
  }
`;

const NameContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
`


function Auth() {
  const dispatch = useDispatch();
  const [form, setForm] = useState("login")
  const [userLogin, setUserLogin] = useState({
    email: "",
    password: "",
  })
  const [userRegister, setUserRegister] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  })

  const onChangeUserLogin = useCallback(
    (e) => {
      setUserLogin((user)=>{
        return {
          ...user, [e.target.name]: e.target.value
        }
      })
    }
  )

    const onChangeUserRegister = useCallback(
      (e) => {
        setUserRegister((user)=>{
          return {
            ...user, [e.target.name]: e.target.value
          }
        })
      }
    )
  return (
    <Container>
      {form === "login" ?
        <Wrapper>
          <WelcomeText>Welcome</WelcomeText>
          <InputContainer>
            <Input type="mail" name='email' placeholder="Email" onChange={onChangeUserLogin}/>
            <Input type="password" name='password' placeholder="Password" onChange={onChangeUserLogin}/>
          </InputContainer>
          <ButtonContainer>
            <StyledButton onClick={() => login(dispatch, userLogin)}> LOGIN </StyledButton>
          </ButtonContainer>
          <SwitchButton onClick={() => setForm("register")}>REGISTER</SwitchButton>
        </Wrapper>
        :
        <Wrapper>
          <WelcomeText>Welcome</WelcomeText>
          <InputContainer>
            <NameContainer>
              <Input type="text" placeholder="First name" name="firstName" onChange={onChangeUserRegister}/>
              <Input type="text" placeholder="Last name" name='lastName' onChange={onChangeUserRegister}/>
            </NameContainer>
            <Input type="mail" placeholder="E-mail" name='email' onChange={onChangeUserRegister}/>
            <Input type="text" placeholder="Phone number" name='phoneNumber' onChange={onChangeUserRegister}/>
            <Input type="password" placeholder="Password" name='password' onChange={onChangeUserRegister}/>
            <Input type="password" placeholder="Confirm password" name='confirmPassword' onChange={onChangeUserRegister}/>
          </InputContainer>
          <ButtonContainer>
            <StyledButton onClick={()=>register(userRegister)}> SIGNUP </StyledButton>
          </ButtonContainer>
          <SwitchButton onClick={() => setForm("login")}>LOG IN</SwitchButton>
        </Wrapper>
      }
    </Container>
  );
}

export default Auth