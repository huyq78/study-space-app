import React, { useCallback, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import imgSrc from '../../src/background.jpg'

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
  const [form, setForm] = useState("login")
  const [email, setEmail] = useState()
  const [password, setPassword] = useState()
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  })

  const login = () => {
    fetch(`http://localhost:8888/api/auth/login`, {
      method: "POST",
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        email: email,
        password: password
      }
      )
    })
      .then((res) => res.json())
      .then((json) => {
        console.log(json)
        window.localStorage.setItem("token", json.data.token)
      });
  }

  const register = () => {
    fetch(`http://localhost:8888/api/user/register`, {
      method: "POST",
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(user)
    })
      .then((res) => res.json())
      .then((json) => {
        console.log(json)
      });
  }

  const onChangeEmail = useCallback(
    (e) => {
      setEmail(e.target.value);
    }, [email])

  const onChangePassword = useCallback(
    (e) => {
      setPassword(e.target.value);
    }, [password])

    const onChangeUser = useCallback(
      (e) => {
        setUser((user)=>{
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
            <Input type="text" placeholder="Email" onChange={onChangeEmail}/>
            <Input type="password" placeholder="Password" onChange={onChangePassword}/>
          </InputContainer>
          <ButtonContainer>
            <StyledButton onClick={() => login()}> LOGIN </StyledButton>
          </ButtonContainer>
          <SwitchButton onClick={() => setForm("sign-up")}>SIGN UP</SwitchButton>
        </Wrapper>
        :
        <Wrapper>
          <WelcomeText>Welcome</WelcomeText>
          <InputContainer>
            <NameContainer>
              <Input type="text" placeholder="First name" name="firstName" onChange={onChangeUser}/>
              <Input type="text" placeholder="Last name" name='lastName' onChange={onChangeUser}/>
            </NameContainer>
            <Input type="mail" placeholder="E-mail" name='email' onChange={onChangeUser}/>
            <Input type="text" placeholder="Phone number" name='phoneNumber' onChange={onChangeUser}/>
            <Input type="password" placeholder="Password" name='password' onChange={onChangeUser}/>
            <Input type="password" placeholder="Confirm password" name='confirmPassword' onChange={onChangeUser}/>
          </InputContainer>
          <ButtonContainer>
            <StyledButton onClick={()=>register()}> SIGNUP </StyledButton>
          </ButtonContainer>
          <SwitchButton onClick={() => setForm("login")}>LOG IN</SwitchButton>
        </Wrapper>
      }
    </Container>
  );
}

export default Auth