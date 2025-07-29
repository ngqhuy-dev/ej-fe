import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    login: {
      currentUser: null,
      isFetching: false,
      error: false,
    },
    register: {
      isFetching: false,
      error: false,
      success: false,
    },
    resetPassword: {
      isFetching: false,
      error: false,
      success: false,
    },
    otp: {
      isFetching: false,
      error: false,
      success: false,
    },
  },
  reducers: {
    //COMMENT: lOGIN
    loginStart: (state) => {
      state.login.isFetching = true;
    },
    loginSuccess: (state, action) => {
      state.login.isFetching = false;
      state.login.currentUser = action.payload;
      state.login.error = false;
    },
    loginFailed: (state) => {
      state.login.isFetching = false;
      state.login.error = true;
    },
    //COMMENT: LOGOUT
    logoutSuccess: (state) => {
      state.login.isFetching = false;
      state.login.currentUser = null;
      state.login.error = false;
    },
    logoutFailed: (state) => {
      state.login.isFetching = false;
      state.login.error = true;
    },
    logoutStart: (state) => {
      state.login.isFetching = true;
    },
    //COMMENT: REGISTER
    registerStart: (state) => {
      state.register.isFetching = true;
    },
    registerSuccess: (state) => {
      state.register.isFetching = false;
      state.register.error = false;
      state.register.success = true;
    },
    registerFailed: (state) => {
      state.register.isFetching = false;
      state.register.error = true;
      state.register.success = false;
    },
    //COMMENT: RESET PASSWORD
    resetPasswordStart: (state) => {
      state.resetPassword.isFetching = true;
    },
    resetPasswordSuccess: (state) => {
      state.resetPassword.isFetching = false;
      state.resetPassword.error = false;
      state.resetPassword.success = true;
    },
    resetPasswordFailed: (state) => {
      state.resetPassword.isFetching = false;
      state.resetPassword.error = true;
      state.resetPassword.success = false;
    },
  },
});

export const {
  loginStart,
  loginFailed,
  loginSuccess,

  registerStart,
  registerSuccess,
  registerFailed,

  logoutStart,
  logoutSuccess,
  logoutFailed,

  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFailed,
} = authSlice.actions;

export default authSlice.reducer;
