import { createSlice } from "@reduxjs/toolkit";
import { createSpace, updateListWebsite } from "./apiCall";

const blockerSlice = createSlice({
  name: "blocker",
  initialState: {
    website: [],
    listBlocker: []
  },
  reducers: {
    listWebsite: (state, action) => {
        state.website = action.payload;
    },
    addListBlocker: (state, action) => {
        state.listBlocker = action.payload;
    },
    addNewBlocker: (state, action) => {
        state.listBlocker.push(action.payload);
    },
    delBlocker: (state, action) => {
        const website = state.website?.filter((website) => website._id !== action.payload);
        state.website = website;
    }
  },
});

export const { listWebsite, addListBlocker, addNewBlocker, delBlocker } = blockerSlice.actions;
export default blockerSlice.reducer;
