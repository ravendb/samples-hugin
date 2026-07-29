import { configureStore, createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const emptySearch = {
  normal: null,
  ai: null,
  viewMode: "normal",
  aiEnabled: false,
  refining: false,
  aiPhase: "idle",
  query: "",
  error: null,
};

const slice = createSlice({
  name: "page-state",
  initialState: {
    searchResult: { ...emptySearch },
    questionResult: {},
    communitiesResult: {},
  },
  reducers: {
    setSearchResult(state, action) {
      state.searchResult = { ...emptySearch, normal: action.payload };
    },
    beginSearch(state, action) {
      state.searchResult = {
        ...emptySearch,
        aiEnabled: state.searchResult.aiEnabled,
        query: action.payload || "",
        refining: true,
      };
    },
    setNormalResult(state, action) {
      state.searchResult.normal = action.payload;
      if (!state.searchResult.aiEnabled) state.searchResult.refining = false;
    },
    setAiResult(state, action) {
      state.searchResult.ai = action.payload;
      state.searchResult.refining = false;
      state.searchResult.aiPhase = "done";
    },
    setAiPhase(state, action) {
      state.searchResult.aiPhase = action.payload;
    },
    setViewMode(state, action) {
      state.searchResult.viewMode = action.payload === "ai" ? "ai" : "normal";
    },
    setAiEnabled(state, action) {
      state.searchResult.aiEnabled = Boolean(action.payload);
      if (!action.payload) state.searchResult.viewMode = "normal";
    },
    setSearchError(state, action) {
      state.searchResult.error = action.payload || "Search failed";
      state.searchResult.refining = false;
    },
    setQuestionResult(state, action) {
      state.questionResult = action.payload;
    },
    setCommunitiesResult(state, action) {
      state.communitiesResult = action.payload;
    },
  },
});

const store = configureStore({ reducer: { response: slice.reducer } });
// Kept under the origin public name for component compatibility.
// eslint-disable-next-line react-hooks/rules-of-hooks
const getServerResult = () => useSelector((state) => state.response);

export const {
  setSearchResult,
  beginSearch,
  setNormalResult,
  setAiResult,
  setAiPhase,
  setViewMode,
  setAiEnabled,
  setSearchError,
  setQuestionResult,
  setCommunitiesResult,
} = slice.actions;
export { store, getServerResult };
