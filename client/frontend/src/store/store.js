import { configureStore } from "@reduxjs/toolkit";
import questionSlice from "./questionSlice";

export const store = configureStore({
  reducer: {
    question: questionSlice,
  },
});
