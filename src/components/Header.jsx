import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components'
import { Popover } from 'antd';
import { getProfile } from '../redux/apiCall';
import { updateProfile } from '../redux/userRedux';
import { setMute } from '../redux/spaceRedux';

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
const Btn = styled.button`
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
    height: 20px;
    cursor: pointer;
`

const Button = styled.button`
    border: none;
    height: 20px;
    width: 30px;
    background-color: white;
    padding: 0;
`

const ContentWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
`
function Header() {
    const dispatch = useDispatch();
    const [profile, setProfile] = useState();
    const space = useSelector((state) => state.space);
    const profileState = useSelector((state) => state.user.profile);
    useEffect(() => {
        if (localStorage.getItem("access_token")) {
            const fetchProfile = async () => {
                const res = await getProfile();
                setProfile(res);
            }
            fetchProfile();
        }
    }, [profileState])

    const content = (
        <div>
            <p>{profile?.email}</p>
            <p>{profile?.phoneNumber}</p>
            <Btn onClick={() => {
                localStorage.clear();
                window.location.reload();
            }}>Logout</Btn>
        </div>
    );

    return (
        <Container>
            <Wrapper>
                <Item>

                </Item>
                <Item>
                    <UserRoom>
                        {profile?.firstName}'s room
                    </UserRoom>
                    <Btn>
                        Invite
                    </Btn>
                    <RoonInfo>
                        {profile?.firstName}
                    </RoonInfo>
                </Item>
                <Item>
                    <Icon icon="fa-solid fa-arrow-up-from-bracket" />
                    {
                        space.muted ? <Button onClick={() => dispatch(setMute(false))}><Icon icon="fa-solid fa-volume-xmark" /></Button> :
                            <Button onClick={() => dispatch(setMute(true))}><Icon icon="fa-solid fa-volume-high" /></Button>
                    }
                    <Icon icon="fa-solid fa-up-right-and-down-left-from-center" />
                    <Popover content={content} title={profile?.firstName + " " + profile?.lastName} trigger="click">
                        <Button><Icon icon="fa-regular fa-user" /></Button>
                    </Popover>
                </Item>
            </Wrapper>
        </Container>
    )
}

export default Header