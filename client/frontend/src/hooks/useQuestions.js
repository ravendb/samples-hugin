import { useSelector } from "react-redux";

export function useQuestions() {
  const { questions } = useSelector((state) => state.question);

  return {
    questions,
  };
}
