import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  questions: [],
  question: null,
};

const questionSlice = createSlice({
  name: "question",
  initialState,
  reducers: {
    setQueryResult: (state, action) => {
      state.queryResult = action.payload;
    },
    setQuestion: (state, action) => {
      state.question = action.payload;
    },
  },
});

export const { setQueryResult, setQuestion } = questionSlice.actions;

export default questionSlice.reducer;
