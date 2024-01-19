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
        const website = state.listBlocker?.filter((website) => website.id !== action.payload);
        state.listBlocker = website;
    },
    updateStatus: (state, action) => {
        const blockers = state.listBlocker?.map((blocker) => {
          if (blocker.id === action.payload) {
            return {...blocker, status : "unblocked" };
          }
          return blocker;
        })
        state.listBlocker = blockers;
    }
  },
});

export const { listWebsite, addListBlocker, addNewBlocker, delBlocker, updateStatus } = blockerSlice.actions;
export default blockerSlice.reducer;
