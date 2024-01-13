import { loginFailure, loginStart, loginSuccess, updateUserInfo } from "./userRedux";
import { publicRequest, userRequest } from "../requestMethods";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";



/*---------------------------USER--------------------------- */
export const register = async (user) => {
    try {
        const res = await publicRequest.post("/api/user/register", user);
        console.log(res.data);
    } catch (err) {
        console.log(err);
    }
};

export const changePassword = async (password) => {
    try {
        const res = await userRequest.post("/api/user/change-password", password);
        console.log(res.data);
    } catch (err) {
        console.log(err);
    }
};

export const getProfile = async () => {
    try {
        const res = await userRequest.get("/api/user/profile");
        console.log(res.data.data);
        return res.data.data;
    } catch (err) {
        console.log(err);
    }
};

export const updateProfile = async (profile) => {
    try {
        const res = await userRequest.post("/api/user/update-profile", profile);
        console.log(res.data);
    } catch (err) {
        console.log(err);
    }
};


/*---------------------------AUTHENTICATION--------------------------- */
export const login = async (dispatch, user) => {
    dispatch(loginStart());
    try {
        const res = await publicRequest.post("/api/auth/login", user);
        dispatch(loginSuccess(res.data.data));
        localStorage.setItem('access_token', res.data.data.token);
        localStorage.setItem('refresh_token', res.data.data.refreshToken);
        window.location.reload();
    } catch (err) {
        dispatch(loginFailure());
        console.log(err);
    }
};

export const logout = async (user) => {
    try {
        const res = await userRequest.post("/api/auth/logout", user);
        console.log(res.data);
    } catch (err) {
        console.log(err);
    }
};

export const refreshToken = async (token) => {
    try {
        const res = await publicRequest.post("/api/auth/refresh-token", { token: token });
        localStorage.setItem('access_token', res.data.accessToken);
        localStorage.setItem('refresh_token', res.data.refreshToken);
    } catch (err) {
        console.log(err);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('persist:root');
        window.location.reload();
    }
};

/*---------------------------SPACE--------------------------- */
export const createSpace = async (space) => {
    try {
        const res = await userRequest.post("/api/space", space);
        return res;
    } catch (err) {
        console.log(err);
    }
};

export const getListSpace = async () => {
    try {
        const res = await userRequest.get("/api/space");
        return res.data.data.data;
    } catch (err) {
        console.log(err);
    }
};

export const getSpace = async (spaceId) => {
    try {
        const res = await userRequest.get(`/api/space/${spaceId}`);
        return res.data.data.data;
    } catch (err) {
        console.log(err);
    }
};

export const deleteSpace = async (spaceId) => {
    try {
        const res = await userRequest.delete(`/api/space/${spaceId}`);
        console.log(res.data);
    } catch (err) {
        console.log(err);
    }
};
