import { createSlice } from "@reduxjs/toolkit";
import { createSpace } from "./apiCall";

const spaceSlice = createSlice({
  name: "space",
  initialState: {
    spaces: [],
    currentSpace: null,
    muted: true,
    upload: false,
  },
  reducers: {
    listSpace: (state, action) => {
      state.spaces = action.payload;
    },
    upSpace: (state, action) => {
      state.currentSpace = action.payload;
    },
    setMute: (state, action) => {
      state.muted = action.payload;
    },
    setUpload: (state, action) => {
      state.upload = action.payload;
    }, 
    delSpace: (state, action) => {
      const spaces = state.spaces?.filter((space) => space._id !== action.payload);
      state.spaces = spaces;
    }
  },
});

export const { listSpace, upSpace, setMute, setUpload, delSpace } = spaceSlice.actions;
export default spaceSlice.reducer;
