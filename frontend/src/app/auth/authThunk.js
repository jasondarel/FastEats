import { createAsyncThunk } from "@reduxjs/toolkit";
import loginService from "../../service/userServices/loginService";

export const loginUser = createAsyncThunk("auth/loginUser", async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await loginService(email, password);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.data);
    }
  });