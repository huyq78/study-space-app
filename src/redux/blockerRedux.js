import { createSlice } from "@reduxjs/toolkit";
import { createSpace, deleteWebsite, updateListWebsite } from "./apiCall";

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
      console.log(action.payload)
      state.listBlocker.push(action.payload);
      state.website.push(action.payload);
    },
    delBlocker: (state, action) => {
      const websites = state.website?.filter((website) => website.name !== action.payload.name);
      state.website = websites;
      let blockers;
      if (action.payload.id)
        deleteWebsite(action.payload.id);
      else
        blockers = state.listBlocker?.filter((blocker) => blocker?.name !== action.payload.name);
      state.listBlocker = blockers;
    },
    updateStatus: (state, action) => {
      const blockers = state.listBlocker.map((blocker) => {
        if (blocker?.name === action.payload.name) {
          return { ...blocker, status: action.payload.status };
        }
        if (blocker?.id === action.payload.id) {
          return { ...blocker, status: action.payload.status };
        }
        return blocker;
      })
      state.listBlocker = blockers;
      const websites = state.website?.map((website) => {
        if (website.name === action.payload.name) {
          return { ...website, status: action.payload.status };
        }
        return website;
      })
      state.website = websites;
    }
  },
});

export const { listWebsite, addListBlocker, addNewBlocker, delBlocker, updateStatus } = blockerSlice.actions;
export default blockerSlice.reducer;
