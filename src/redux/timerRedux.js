import { createSlice } from "@reduxjs/toolkit";

const timerSlice = createSlice({
  name: "timer",
  initialState: {
    timer: {
      pomodoro: 20,
      shortBreak: 5,
      longBreak: 15,
    },
    currentTimer: 20,
  },
  reducers: {
    updateTimer: (state, action) => {
      state.timer = action.payload;
    },
    setTimer: (state, action) => {
      state.currentTimer = action.payload;
    }
  },
});

export const { updateTimer, setTimer } = timerSlice.actions;
export default timerSlice.reducer;
