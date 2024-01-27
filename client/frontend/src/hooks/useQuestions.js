import { useSelector } from "react-redux";

export function useQuestions() {
  const { questions, question } = useSelector((state) => state.question);

  return {
    questions,
    question,
  };
}
