import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { setTimer, updateTimer } from '../../redux/timerRedux';
import { useRef } from 'react';
import Draggable from 'react-draggable';

const Container = styled.div`
    position: absolute;
    z-index: 3000;
    left: 395px;
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
const WidgetHeader = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    color: #4e4e4e;
    border-bottom: 1px solid #e9e9e9;
    flex-grow: 0;
`

const HeaderContent = styled.div`
    font-size: 16px;
    margin: 8px 22px;
    height: auto;
    width: auto;
    display: flex;
    flex-direction: row;
    -webkit-box-pack: start;
    justify-content: flex-start;
    -webkit-box-align: center;
    align-items: center;
`

const Content = styled.div`
    display: flex;
    flex-direction: row;
    -webkit-box-pack: start;
    justify-content: flex-start;
    -webkit-box-align: center;
    align-items: center;
`
const Dropdown = styled.select`
    display: block;
    font-size: 14px;
    position: relative;
    z-index: 1000;
    align-items: center;
    min-height: 14px;
    height: 28px;
    margin-right: 20px;
    padding: 4px 8px;
    cursor: pointer;
    border: 0px solid rgb(223, 223, 223);
    border-radius: 2px;
    background-color: inherit;
    /* appearance: none; */
    &:focus{outline:none}
`

const Count = styled(FontAwesomeIcon)`
    margin-right: 10px;
    fill: lightgrey;
    scale: 1.2;
`

const WidgetContent = styled.div`
    font-family: "CircularStd";
    font-size: 16px;
    display: flex;
    flex-direction: column;
    flex-grow: 100;
    /* overflow-y: scroll; */
    height: fit-content;
`

const WidgetContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    -webkit-box-pack: justify;
    justify-content: space-between;
    padding: 10px 0px;
    background: rgb(252, 252, 252);
    color: rgb(78, 78, 78);
`

const CountdownTimer = styled.div`
    display: flex;
    flex-direction: row;
    -webkit-box-pack: justify;
    justify-content: space-between;
`

const Time = styled.span`
    font-size: 54px;
    line-height: 50px;
    padding-left: 20px;
    color: rgb(78, 78, 78);
`

const ControlTimer = styled.div`
    display: flex;
    flex-direction: row;
    -webkit-box-pack: justify;
    justify-content: space-between;
    align-self: center;
`

const ControlBtn = styled.button`
    display: flex;
    flex-direction: row;
    -webkit-box-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    align-items: center;
    font-size: 16px;
    border: 1.5px solid rgb(78, 78, 78);
    border-radius: 10px;
    height: 36px;
    width: 97px;
    padding: 6px 25px;
    color: #4e4e4e;
    background: #fcfcfc;
    border-color: rgb(78, 78, 78);
    cursor: pointer;
`

const ResetTimer = styled.button`
    color: #4e4e4e;
    background: #fcfcfc;
    border-color: #e9e9e9;
    border: 0;
    padding: 0 15px;
`

const ResetIcon = styled(FontAwesomeIcon)`
    font-size: 16px;
    color: #4e4e4e;
    cursor: pointer;
`

const TimerFunction = styled.div`
    display: flex;
    flex-direction: row;
    -webkit-box-pack: justify;
    justify-content: space-between;
    width: auto;
`

const FunctionBtn = styled.button`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    height: auto;
    min-height: 36px;
    max-height: 36px;
    width: inherit;
    padding: 6px 10px;
    border-radius: 7px;
    color: #4e4e4e;
    background: #fcfcfc;
    border-bottom: 1px solid black;
    border: 0;
`

const Line = styled.span`
    align-self: center;
    width: 80%;
    border: 1px solid rgb(239, 161, 143);
`

const FunctionTitle = styled.span`
    display: flex;
    align-items: center;
    color: #4e4e4e;
    background: #fcfcfc;
    border-color: #e9e9e9;
    height: unset;
    padding: 6px 7px;
    font-size: 15px;
    cursor: pointer; 
`

const SettingBtn = styled.button`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    height: auto;
    min-height: 36px;
    max-height: 36px;
    width: inherit;
    padding: 6px 10px;
    border-radius: 7px;
    color: #4e4e4e;
    background: #fcfcfc;
    border: none;
`
const SettingIcon = styled(FontAwesomeIcon)`
    fill: rgb(78, 78, 78);
    cursor: pointer;
    vertical-align: middle;
    font-size: 15px;
    padding: 6px 7px;
`

const SettingPopup = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 20px;
`

const SettingWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    border-top: 1px solid rgba(200, 200, 200, 0.25);
    padding: 20px;
    gap: 20px;
`

const TimeSetting = styled.div`
    display: flex;
    flex-direction: row;
    -webkit-box-pack: justify;
    justify-content: space-between;
`

const Setting = styled.div`
    display: flex;
    flex-direction: column;
    -webkit-box-pack: justify;
    justify-content: space-between;
`
const Title = styled.span`
    margin-bottom: 10px;
`

const Input = styled.input`
    border-radius: 4px;
    height: 30px;
    width: 90px;
    padding-left: 10px;
    border: 1px solid rgb(223, 223, 223);
`

const SaveBtn = styled.button`
    -webkit-box-pack: center;
    justify-content: center;
    border: none;
    background: rgb(227, 150, 133);
    color: #4e4e4e;
    padding: 10px;
    font-size: 16px;
    cursor: pointer;
    width: 100%;
    border-radius: 10px;
`
function Timer() {
    const timer = useSelector((state) => state.timer);
    const [popup, setPopup] = useState(false);
    const [timerInSec, setTimerInSec] = useState(timer.currentTimer * 60);
    const [isActive, setIsActive] = useState(false);
    const [start, setStart] = useState(false);
    const [timeList, setTimeList] = useState({
        pomodoro: 20,
        shortBreak: 5,
        longBreak: 15
    });
    const [func, setFunc] = useState("pomodoro");
    const round = useRef(1);
    const dispatch = useDispatch();

    useEffect(() => {
        setFunc("pomodoro");
        dispatch(setTimer(timer.timer.pomodoro));
        setTimerInSec(timer.timer.pomodoro * 60);
    }, [timer.timer])

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setTimerInSec((seconds) => seconds - 1);
                if (Number(timerInSec) <= Number(1) && func === "pomodoro") {
                    round.current = round.current + 1;
                    if (Number(round.current) === Number(5)) {
                        setFunctionTime("long-break");
                    } else {
                        setFunctionTime("short-break");
                    }
                } else if (Number(timerInSec) <= Number(1) && func === "short-break") {
                    setFunctionTime("pomodoro");
                } else if (Number(timerInSec) <= Number(1) && func === "long-break") {
                    setFunctionTime("pomodoro");
                    round.current = 1;
                }
            }, 100);
        }

        return () => clearInterval(interval);
    }, [timerInSec, isActive]);

    const onChange = (
        (e) => {
            setTimeList((timer) => {
                return {
                    ...timer, [e.target.name]: e.target.value
                }
            })
        }
    )
    const getTwoDigit = (numbers) => {
        return numbers.toLocaleString("en-US", {
            minimumIntegerDigits: 2,
            useGrouping: false
        });
    };
    const getTotalTimerToDisplay = () => {
        const min = getTwoDigit(Math.floor(timerInSec / 60));
        const sec = getTwoDigit(timerInSec % 60);

        return min + " : " + sec;
    };

    const reset = () => {
        setIsActive(false);
        setStart(false);
        setTimerInSec(timer.currentTimer * 60);
        round.current = 1;
    };
    const startTimer = () => {
        setIsActive(!isActive);
        setStart(!start);
    };

    const setFunctionTime = (func) => {
        if (func === "pomodoro") {
            dispatch(setTimer(timer.timer.pomodoro));
            setTimerInSec(timer.timer.pomodoro * 60);
        } else if (func === "short-break") {
            dispatch(setTimer(timer.timer.shortBreak));
            setTimerInSec(timer.timer.shortBreak * 60);
        } else if (func === "long-break") {
            dispatch(setTimer(timer.timer.longBreak));
            setTimerInSec(timer.timer.longBreak * 60);
        }
        setFunc(func);
    }

    const handleClick = (props) => {
        setIsActive(false);
        setStart(false);
        setFunctionTime(props);
    }
    return (
        <>
            <Draggable>
                <Container>
                    <Wrapper>
                        <WidgetHeader>
                            <HeaderContent>
                                <Content>
                                    <Dropdown>
                                        <option>
                                            Person
                                        </option>
                                        <option>
                                            Group
                                        </option>
                                    </Dropdown>
                                    <Count style={{ color: Number(round.current) === Number(2) || Number(round.current) === Number(3) || Number(round.current) === Number(4) || Number(round.current) === Number(5) ? "#31e0ff" : "lightgrey" }} icon="fa-regular fa-snowflake"></Count>
                                    <Count style={{ color: Number(round.current) === Number(3) || Number(round.current) === Number(4) || Number(round.current) === Number(5) ? "#31e0ff" : "lightgrey" }} icon="fa-regular fa-snowflake"></Count>
                                    <Count style={{ color: Number(round.current) === Number(4) || Number(round.current) === Number(5) ? "#31e0ff" : "lightgrey" }} icon="fa-regular fa-snowflake"></Count>
                                    <Count style={{ color: Number(round.current) === Number(5) ? "#31e0ff" : "lightgrey" }} icon="fa-regular fa-snowflake"></Count>
                                </Content>
                            </HeaderContent>
                        </WidgetHeader>
                        <WidgetContent>
                            <WidgetContentWrapper>
                                <CountdownTimer>
                                    <Time>{getTotalTimerToDisplay()}</Time>
                                    <ControlTimer>
                                        <ControlBtn onClick={startTimer}>
                                            {start ? `Stop` : `Start`}
                                        </ControlBtn>
                                        <ResetTimer onClick={reset}>
                                            <ResetIcon icon="fa-solid fa-arrow-rotate-right" />
                                        </ResetTimer>
                                    </ControlTimer>
                                </CountdownTimer>
                                <TimerFunction>
                                    <FunctionBtn onClick={() => handleClick("pomodoro")}>
                                        <FunctionTitle>
                                            Pomodoro
                                        </FunctionTitle>
                                        {func === "pomodoro" ? <Line /> : <></>}
                                    </FunctionBtn>
                                    <FunctionBtn onClick={() => handleClick("short-break")}>
                                        <FunctionTitle>
                                            Short Break
                                        </FunctionTitle>
                                        {func === "short-break" ? <Line /> : <></>}
                                    </FunctionBtn>
                                    <FunctionBtn onClick={() => handleClick("long-break")}>
                                        <FunctionTitle>
                                            Long Break
                                        </FunctionTitle>
                                        {func === "long-break" ? <Line /> : <></>}
                                    </FunctionBtn>
                                    <SettingBtn onClick={() => setPopup(!popup)}>
                                        <SettingIcon icon="fa-solid fa-gear" />
                                    </SettingBtn>
                                </TimerFunction>
                                {popup &&
                                    <>
                                        <SettingPopup>
                                            <SettingWrapper>
                                                <TimeSetting>
                                                    <Setting>
                                                        <Title>
                                                            Pomodoro
                                                        </Title>
                                                        <Input type='number' name='pomodoro' maxLength={3} minLength={1} max={360} min={1} autoComplete='off' defaultValue={timer.timer.pomodoro} onChange={onChange} />
                                                    </Setting>
                                                    <Setting>
                                                        <Title>
                                                            Short Break
                                                        </Title>
                                                        <Input type='number' name='shortBreak' maxLength={3} minLength={1} max={360} min={1} autoComplete='off' defaultValue={timer.timer.shortBreak} onChange={onChange} />
                                                    </Setting>
                                                    <Setting>
                                                        <Title>
                                                            Long Break
                                                        </Title>
                                                        <Input type='number' name='longBreak' maxLength={3} minLength={1} max={360} min={1} autoComplete='off' defaultValue={timer.timer.longBreak} onChange={onChange} />
                                                    </Setting>
                                                </TimeSetting>
                                                <SaveBtn onClick={() => dispatch(updateTimer(timeList))}>
                                                    Save
                                                </SaveBtn>
                                            </SettingWrapper>
                                        </SettingPopup>
                                    </>
                                }
                            </WidgetContentWrapper>
                        </WidgetContent>
                    </Wrapper>
                </Container >
            </Draggable>
        </>
    )
}

export default Timer