import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  questions: [],
  question: null,
};

const questionSlice = createSlice({
  name: "question",
  initialState,
  reducers: {
    setQuestions: (state, action) => {
      state.questions = action.payload;
    },
    setQuestion: (state, action) => {
      state.question = action.payload;
    },
  },
});

export const { setQuestions, setQuestion } = questionSlice.actions;

export default questionSlice.reducer;
