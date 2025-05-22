import { createAsyncThunk } from "@reduxjs/toolkit";
import loginService from "../../service/userServices/loginService";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await loginService(email, password);
      const data = response.data;

      return {
        user: {
          name: data.name,
          email: data.email,
          role: data.role,
        },
        token: data.token,
      };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
