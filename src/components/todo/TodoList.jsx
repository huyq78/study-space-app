import React, { useRef, useState } from "react";
import Todo from "./Todo";
import NewTodoForm from "./NewTodoForm";
import { useDispatch, useSelector } from "react-redux";
import Draggable from "react-draggable";
import styled from "styled-components";
import { addTodo } from "../../redux/todoRedux";
// import "./TodoList.css";

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

const TodoForm = styled.div`
    display: flex;
    flex-direction: row;
    text-align: center;
    align-items: center;
    justify-content: center;
`

const Input = styled.input`
    background: rgb(255, 255, 255);
  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.37);
  border-radius: 2rem;
  width: 60%;
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

const AddBtn = styled.button`
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



function TodoList() {
  const todos = useSelector((state) => state.todo.todos)
  const [input, setInput] = useState();
  const dispatch = useDispatch();
  const ref = useRef(null);
  const onChange = (
    (e) => {
        setInput(e.target.value);
    }
)
  const handleClick = () => {
    dispatch(addTodo(input));
    ref.current.value = "";
  }

  return (
    <Draggable>
      <Container>
        <Wrapper>
          <TodoForm>
            <Input type="text" placeholder="task" ref={ref} onChange={onChange}/>
            <AddBtn onClick={handleClick}>Add</AddBtn>
          </TodoForm>
          <ul style={{padding: "10px"}}>
            {todos.map((todo, i) => (
              <Todo key={i} props={todo}>{todo}</Todo>
            ))}
          </ul>
        </Wrapper>
      </Container>
    </Draggable>
  );
}

export default TodoList;
