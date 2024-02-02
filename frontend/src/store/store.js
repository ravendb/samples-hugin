import { configureStore } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const slice = createSlice({
  name: "page-state",
  initialState: {
    searchResult: {},
    questionResult: {},
    communitiesResult: {},
  },
  reducers: {
    setSearchResult: (state, action) => {
      state.searchResult = action.payload;
    },
    setQuestionResult: (state, action) => {
      state.questionResult = action.payload;
    },
    setCommunitiesResult: (state, action) => {
      state.communitiesResult = action.payload;
    }
  },
});

const store = configureStore({
  reducer: {
    response: slice.reducer,
  },
});

function getServerResult() {
  return useSelector((state) => state.response);
}


const { setSearchResult, setQuestionResult, setCommunitiesResult } = slice.actions;

export {
  store,
  getServerResult,
  setSearchResult,
  setQuestionResult,
  setCommunitiesResult,
};