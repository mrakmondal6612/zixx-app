import { createSlice } from "@reduxjs/toolkit";

// Read persisted mode early (safe in browser env)
let persistedMode = 'dark';
try {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('admin_theme_mode');
    if (saved === 'light' || saved === 'dark') persistedMode = saved;
  }
} catch (e) {}

const initialState = {
  mode: persistedMode,
  userId: "63701cc1f03239b7f700000e",
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
  },
});

export const { setMode, setUserId } = globalSlice.actions;

export default globalSlice.reducer;
