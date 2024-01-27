import { useSelector } from "react-redux";

export function useQuestions() {
  const { queryResult, question } = useSelector((state) => state.question);

  return {
    queryResult,
    question,
  };
}
