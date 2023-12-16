import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
    position: fixed;
    top: 0px;
    transition: top 0.3s ease-out 0s;
    z-index: 4000;
    height: 40px;
    background-color: rgb(252, 252, 252);
    border-bottom: 1px solid rgb(223, 223, 223);
    width: 100%;
`;

const Wrapper = styled.div`
    height: 100%;
    width: 98%;
    display: flex;
    padding: 0px 8px;
    -webkit-box-pack: justify;
    justify-content: space-between;
    -webkit-box-align: center;
    align-items: center;
`;

const Item = styled.div`
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    gap: 6px;
`

const UserRoom = styled.div`
    padding: 4px 3px;
    min-height: 28px;
    border-radius: 5px;
    background: rgb(244, 244, 244) !important;
`
const InviteBtn = styled.button`
    height: auto;
    margin: 0px 4px;
    padding: 4px 9px;
    opacity: 1;
    cursor: pointer;
    color: white;
    background-color: royalblue;
    border: none;
    border-radius: 5px;
    font-size: 14px;
`
const RoonInfo = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    width: 30px;
    border-radius: 50%;
    background: rgb(255, 224, 215);
    color: rgb(78, 78, 78);
    font-size: 14px;
    cursor: pointer;
`

const Icon = styled(FontAwesomeIcon)`
    margin: 0px 5px;
    cursor: pointer;
`
function Header() {
  return (
    <Container>
        <Wrapper>
            <Item>

            </Item>
            <Item>
                <UserRoom>
                    Huy's room
                </UserRoom>
                <InviteBtn>
                    Invite
                </InviteBtn>
                <RoonInfo>
                    H
                </RoonInfo>
            </Item>
            <Item>
                <Icon icon="fa-solid fa-arrow-up-from-bracket" />
                <Icon icon="fa-solid fa-volume-high" />
                <Icon icon="fa-solid fa-up-right-and-down-left-from-center" />
                <Icon icon="fa-regular fa-user" />
            </Item>
        </Wrapper>
    </Container>
  )
}

export default Header