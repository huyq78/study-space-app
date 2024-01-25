import React, { useState } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { delTodo } from "../../redux/todoRedux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Item = styled.li`
  display: flex;
  flex-direction: row;
  list-style: none;
  margin-top: -1px;
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
`;

const Button = styled.button`
  background: white;
  border: none;
  padding: 8px 10px;
  min-width: 280px;
  text-align: left;
  line-height: 24px;
  font-size: 13px;
  color: ${(props) => (props.checked ? "#ccc" : "#1b1b1b")};
  transition: all 0.2s ease;
  cursor: pointer;
  outline: none;
`

const Svg = styled.svg`
  display: inline-block;
  line-height: 24px;
  margin-right: 8px;
  vertical-align: sub;

  * {
    transition: all 0.2s ease;
  }
`

const Checkbox = ({ checked }) => {
  return (
    <Svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="8"
        cy="8"
        r="7.5"
        stroke={checked ? "#3DF4BD" : "#CCCCCC"}
        fill={checked ? "#3DF4BD" : "transparent"}
      />
      <path
        d="M12.2248 5.54644L6.45454 11.3167L4.56892 9.43109"
        stroke={checked ? "#FFFFFF" : "#CCCCCC"}
      />
    </Svg>
  );
}

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

function Todo({ props }) {
  const [checked, setChecked] = useState(false);
  const dispatch = useDispatch();

  return (
    <Item>
      <Button checked={checked} onClick={() => setChecked(!checked)}>
        <Checkbox checked={checked} />
        <span style={{fontSize: "16px"}}>{props}</span>
      </Button>
      <DelBtn onClick={() => dispatch(delTodo(props))}>
          <Icon icon="fa-solid fa-trash" />
        </DelBtn>
    </Item>
  );
}

export default Todo;