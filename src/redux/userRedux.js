import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null,
    profile: null,
    isFetching: false,
    error: false,
  },
  reducers: {
    loginStart: (state) => {
      state.isFetching = true;
    },
    loginSuccess: (state, action) => {
      state.isFetching = false;
      state.currentUser = action.payload;
    },
    loginFailure: (state) => {
      state.isFetching = false;
      state.error = true;
    },
    updateProfile: (state, action) => {
      state.profile = action.payload;
    },
    updateUserInfo: (state, action) => {
      state.currentUser = action.payload;
    }
  },
});

export const { loginStart, loginSuccess, loginFailure, updateProfile } = userSlice.actions;
export default userSlice.reducer;
