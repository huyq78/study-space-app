import { createSlice } from "@reduxjs/toolkit";

const todoSlice = createSlice({
    name: "todo",
    initialState: {
        todos: [],
    },
    reducers: {
        addTodo: (state, action) => {
            state.todos.push(action.payload);
        },
        delTodo: (state, action) => {
            const todos = state.todos?.filter((todo) => todo !== action.payload);
            state.todos = todos;
        }
    },
});

export const { addTodo, delTodo } = todoSlice.actions;
export default todoSlice.reducer;
