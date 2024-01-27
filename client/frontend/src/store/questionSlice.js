import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  questions: [],
  questionsQueryState: {
    status: "idle",
    error: null,
  },
  question: null,
  questionQueryState: {
    status: "idle",
    error: null,
  },
};

const questionSlice = createSlice({
  name: "question",
  initialState,
  reducers: {
    setQuestions: (state, action) => {
      state.questions = action.payload;
    },
    setQuestionsQueryState: (state, action) => {
      state.questionsQueryState = action.payload;
    },
    setQuestion: (state, action) => {
      state.question = action.payload;
    },
    setQuestionQueryState: (state, action) => {
      state.questionQueryState = action.payload;
    },
  },
});

export const {
  setQuestions,
  setQuestionsQueryState,
  setQuestion,
  setQuestionQueryState,
} = questionSlice.actions;

export default questionSlice.reducer;
